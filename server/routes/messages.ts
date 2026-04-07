import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Send message
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { workspaceId, channelId, content, attachments } = req.body;

    if (!content && (!attachments || attachments.length === 0)) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Content or attachments are required' },
      });
    }

    // If channelId provided, check if user is member of channel
    if (channelId) {
      const channelMember = await prisma.channelMember.findUnique({
        where: {
          userId_channelId: {
            userId: req.userId!,
            channelId,
          },
        },
      });

      if (!channelMember) {
        return res.status(403).json({
          error: { code: 'FORBIDDEN', message: 'You are not a member of this channel' },
        });
      }
    } else if (workspaceId) {
      // Check if user is member of workspace
      const member = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId,
          userId: req.userId,
        },
      });

      if (!member) {
        return res.status(403).json({
          error: { code: 'FORBIDDEN', message: 'You are not a member of this workspace' },
        });
      }
    }

    const message = await prisma.message.create({
      data: {
        workspaceId: workspaceId!,
        channelId: channelId || null,
        userId: req.userId!,
        content: content || '',
        attachments: attachments || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Emit socket event
    const io = req.app.get('io');
    const room = channelId ? `channel-${channelId}` : `workspace-${workspaceId}`;
    io.to(room).emit('new-message', message);

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to send message' } });
  }
});

// Get messages for workspace or channel
router.get('/workspace/:workspaceId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { workspaceId } = req.params;
    const { limit = '50', before, channelId } = req.query;

    // Check if user is member
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: req.userId,
      },
    });

    if (!member) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'You are not a member of this workspace' },
      });
    }

    const where: any = { workspaceId };
    
    if (channelId) {
      where.channelId = channelId as string;
      
      // Check if user is member of channel
      const channelMember = await prisma.channelMember.findUnique({
        where: {
          userId_channelId: {
            userId: req.userId!,
            channelId: channelId as string,
          },
        },
      });

      if (!channelMember) {
        return res.status(403).json({
          error: { code: 'FORBIDDEN', message: 'You are not a member of this channel' },
        });
      }
    } else {
      // Get messages without channel (general workspace messages)
      where.channelId = null;
    }
    
    if (before) {
      where.createdAt = { lt: new Date(before as string) };
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
    });

    res.json(messages.reverse());
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get messages' } });
  }
});

// Delete message
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Message not found' },
      });
    }

    // Only message author can delete
    if (message.userId !== req.userId) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'You can only delete your own messages' },
      });
    }

    await prisma.message.delete({ where: { id } });

    // Emit socket event
    const io = req.app.get('io');
    const room = message.channelId ? `channel-${message.channelId}` : `workspace-${message.workspaceId}`;
    io.to(room).emit('message-deleted', { id });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete message' } });
  }
});

// Update message
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Content is required' },
      });
    }

    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Message not found' },
      });
    }

    // Only message author can edit
    if (message.userId !== req.userId) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'You can only edit your own messages' },
      });
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Emit socket event
    const io = req.app.get('io');
    const room = message.channelId ? `channel-${message.channelId}` : `workspace-${message.workspaceId}`;
    io.to(room).emit('message-updated', updatedMessage);

    res.json(updatedMessage);
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update message' } });
  }
});

export default router;
