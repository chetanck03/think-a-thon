import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: {
          code: 'MISSING_TOKEN',
          message: 'Authentication token is required',
          timestamp: new Date().toISOString(),
        },
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
      name: string;
    };

    req.userId = decoded.userId;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString(),
      },
    });
  }
};
