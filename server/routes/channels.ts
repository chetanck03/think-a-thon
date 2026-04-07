import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Create channel
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { workspaceId, name, description, type, memberIds } = req.body;

    if (!workspaceId || !name) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Workspace ID and name are required' },
      });
    }

    // Check if user is member of workspace
    const workspaceMember = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: req.userId },
    });

    if (!workspaceMember) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'You are not a member of this workspace' },
      });
    }

    // For DM channels, check if one already exists between these users
    if (type === 'dm' && memberIds && memberIds.length === 1) {
      const otherUserId = memberIds[0];
      const existingDM = await prisma.channel.findFirst({
        where: {
          workspaceId,
          type: 'dm',
          members: {
            every: {
              userId: { in: [req.userId!, otherUserId] }
            }
          }
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                }
              }
            }
          },
          _count: {
            select: { messages: true }
          }
        }
      });

      // If DM already exists, return it instead of creating a new one
      if (existingDM && existingDM.members.length === 2) {
        return res.status(200).json(existingDM);
      }
    }

    // Create channel
    const channel = await prisma.channel.create({
      data: {
        workspaceId,
        name,
        description,
        type: type || 'public',
        members: {
          create: [
            { userId: req.userId! }, // Creator is auto-added
            ...(memberIds || []).map((userId: string) => ({ userId })),
          ],
        },
      },
      include: {
        members: true,
      },
    });

    res.status(201).json(channel);
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create channel' } });
  }
});

// Get channels for workspace
router.get('/workspace/:workspaceId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { workspaceId } = req.params;

    // Check if user is member
    const workspaceMember = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: req.userId },
    });

    if (!workspaceMember) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'You are not a member of this workspace' },
      });
    }

    // Get public channels and private channels user is member of
    const channels = await prisma.channel.findMany({
      where: {
        workspaceId,
        OR: [
          { type: 'public' },
          {
            type: { in: ['private', 'dm'] },
            members: { some: { userId: req.userId } },
          },
        ],
      },
      include: {
        members: {
          select: {
            userId: true,
            joinedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(channels);
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get channels' } });
  }
});

// Join channel
router.post('/:channelId/join', authenticate, async (req: AuthRequest, res) => {
  try {
    const { channelId } = req.params;

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Channel not found' },
      });
    }

    // Check if already a member
    const existing = await prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: req.userId!,
          channelId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({
        error: { code: 'ALREADY_MEMBER', message: 'Already a member of this channel' },
      });
    }

    // Private channels require invitation
    if (channel.type === 'private') {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Cannot join private channel without invitation' },
      });
    }

    await prisma.channelMember.create({
      data: {
        userId: req.userId!,
        channelId,
      },
    });

    res.json({ message: 'Joined channel successfully' });
  } catch (error) {
    console.error('Join channel error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to join channel' } });
  }
});

// Leave channel
router.post('/:channelId/leave', authenticate, async (req: AuthRequest, res) => {
  try {
    const { channelId } = req.params;

    await prisma.channelMember.delete({
      where: {
        userId_channelId: {
          userId: req.userId!,
          channelId,
        },
      },
    });

    res.json({ message: 'Left channel successfully' });
  } catch (error) {
    console.error('Leave channel error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to leave channel' } });
  }
});

// Add member to channel (admin only)
router.post('/:channelId/members', authenticate, async (req: AuthRequest, res) => {
  try {
    const { channelId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'User ID is required' },
      });
    }

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Channel not found' },
      });
    }

    // Check if requester is owner/admin of workspace
    const workspaceMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: channel.workspaceId,
        userId: req.userId,
        role: { in: ['owner', 'admin'] },
      },
    });

    if (!workspaceMember) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Only workspace owner/admin can add members to channels' },
      });
    }

    // Check if user is already a member
    const existing = await prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId,
          channelId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({
        error: { code: 'ALREADY_MEMBER', message: 'User is already a member of this channel' },
      });
    }

    await prisma.channelMember.create({
      data: {
        userId,
        channelId,
      },
    });

    res.json({ message: 'Member added successfully' });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to add member' } });
  }
});

// Delete channel (owner/admin only)
router.delete('/:channelId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { channelId } = req.params;

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Channel not found' },
      });
    }

    // Check if user is owner/admin of workspace
    const workspaceMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: channel.workspaceId,
        userId: req.userId,
        role: { in: ['owner', 'admin'] },
      },
    });

    if (!workspaceMember) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Only workspace owner/admin can delete channels' },
      });
    }

    await prisma.channel.delete({ where: { id: channelId } });

    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    console.error('Delete channel error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete channel' } });
  }
});

export default router;
