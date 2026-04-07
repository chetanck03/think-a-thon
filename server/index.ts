import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import workspaceRoutes from './routes/workspace.js';
import taskRoutes from './routes/task.js';
import milestoneRoutes from './routes/milestone.js';
import feedbackRoutes from './routes/feedback.js';
import analyticsRoutes from './routes/analytics.js';
import workspaceMembersRoutes from './routes/workspace-members.js';
import messagesRoutes from './routes/messages.js';
import channelsRoutes from './routes/channels.js';
import uploadRoutes from './routes/upload.js';
import aiRoutes from './routes/ai.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Database connection check
async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Health check with database status
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      database: 'disconnected',
      timestamp: new Date().toISOString() 
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/workspace-members', workspaceMembersRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/channels', channelsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join channel room
  socket.on('join-channel', (channelId: string) => {
    socket.join(`channel-${channelId}`);
    console.log(`Socket ${socket.id} joined channel ${channelId}`);
    
    socket.to(`channel-${channelId}`).emit('user-joined', {
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });
  });

  // Leave channel room
  socket.on('leave-channel', (channelId: string) => {
    socket.leave(`channel-${channelId}`);
    console.log(`Socket ${socket.id} left channel ${channelId}`);
    
    socket.to(`channel-${channelId}`).emit('user-left', {
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });
  });

  // Typing indicator
  socket.on('typing-start', ({ channelId, userName }) => {
    socket.to(`channel-${channelId}`).emit('user-typing', {
      userName,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('typing-stop', ({ channelId, userName }) => {
    socket.to(`channel-${channelId}`).emit('user-stopped-typing', {
      userName,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

const PORT = process.env.PORT || 3001;

// Start server with database check
async function startServer() {
  const dbConnected = await checkDatabaseConnection();
  
  if (!dbConnected) {
    console.warn('⚠️  Server starting without database connection');
    console.warn('⚠️  Check your DATABASE_URL in .env file');
  }

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
    console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`💬 WebSocket ready for real-time chat`);
  });
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

export { io, prisma };
