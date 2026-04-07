import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { verifyGoogleToken, getGoogleAuthURL } from '../utils/google-oauth.js';
import { sendOTPEmail, generateOTP } from '../utils/email.js';

const router = Router();
const prisma = new PrismaClient();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email, password, and name are required',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to register user',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Verify password
    if (!user.password) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'This account uses a different login method',
          timestamp: new Date().toISOString(),
        },
      });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to login',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get user',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

export default router;

// ============================================
// GOOGLE OAUTH ROUTES
// ============================================

// Google OAuth - Get Auth URL
router.get('/google/url', (req, res) => {
  try {
    const url = getGoogleAuthURL();
    res.json({ url });
  } catch (error) {
    console.error('Google auth URL error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate Google auth URL',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// Google OAuth - Sign in with Google Token
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Google token is required',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(token);

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.googleId,
          authProvider: 'google',
          isVerified: true,
        },
      });
    } else if (!user.googleId) {
      // Link Google account to existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.googleId,
          isVerified: true,
        },
      });
    }

    // Generate JWT
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to authenticate with Google',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// ============================================
// OTP (EMAIL) ROUTES
// ============================================

// Send OTP to email
router.post('/otp/send', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email is required',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Check if user exists, if not create a temporary record
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create user without password (will be OTP-only user)
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          authProvider: 'email',
          isVerified: false,
        },
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await prisma.oTPCode.create({
      data: {
        code: otp,
        expiresAt,
        userId: user.id,
      },
    });

    // Send OTP email
    await sendOTPEmail(email, otp, user.name);

    res.json({
      message: 'OTP sent successfully',
      email,
      expiresIn: 600, // seconds
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to send OTP',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// Verify OTP and login
router.post('/otp/verify', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and OTP code are required',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Find valid OTP
    const otpRecord = await prisma.oTPCode.findFirst({
      where: {
        userId: user.id,
        code,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      return res.status(401).json({
        error: {
          code: 'INVALID_OTP',
          message: 'Invalid or expired OTP code',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Mark OTP as used
    await prisma.oTPCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Mark user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to verify OTP',
        timestamp: new Date().toISOString(),
      },
    });
  }
});
