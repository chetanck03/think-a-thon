import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

// Generate invite link
router.post('/:workspaceId/invite', authenticate, async (req: AuthRequest, res) => {
  try {
    const { workspaceId } = req.params;

    // Check if user is owner
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: req.userId,
        role: 'owner',
      },
    });

    if (!member) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Only workspace owner can generate invite links' },
      });
    }

    // Generate unique invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${inviteToken}?workspace=${workspaceId}`;

    res.json({
      inviteLink,
      inviteToken,
      expiresAt,
    });
  } catch (error) {
    console.error('Generate invite error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to generate invite' } });
  }
});

// Send email invitation
router.post('/:workspaceId/invite-email', authenticate, async (req: AuthRequest, res) => {
  try {
    const { workspaceId } = req.params;
    const { email, message } = req.body;

    if (!email) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Email is required' },
      });
    }

    // Check if user is owner or admin
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: req.userId,
        role: 'owner',
      },
      include: {
        workspace: true,
        user: true,
      },
    });

    if (!member) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Only workspace owner can send invitations' },
      });
    }

    // Generate invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${inviteToken}?workspace=${workspaceId}`;

    // Send email (using the existing email utility)
    const { sendInviteEmail } = require('../utils/email');
    await sendInviteEmail(
      email,
      member.user.name,
      member.workspace.name,
      inviteLink,
      message
    );

    res.json({
      message: 'Invitation sent successfully',
      email,
    });
  } catch (error) {
    console.error('Send email invitation error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to send invitation' } });
  }
});

// Join workspace via invite
router.post('/join/:inviteToken', authenticate, async (req: AuthRequest, res) => {
  try {
    const { inviteToken } = req.params;
    const { workspaceId } = req.body;

    if (!workspaceId) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Workspace ID is required' },
      });
    }

    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Workspace not found' },
      });
    }

    // Check if user is already a member
    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: req.userId,
      },
    });

    if (existingMember) {
      return res.status(400).json({
        error: { code: 'ALREADY_MEMBER', message: 'You are already a member of this workspace' },
      });
    }

    // Add user as member
    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: req.userId!,
        role: 'member',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        workspace: true,
      },
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('Join workspace error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to join workspace' } });
  }
});

// Get workspace members
router.get('/:workspaceId/members', authenticate, async (req: AuthRequest, res) => {
  try {
    const { workspaceId } = req.params;

    // Check if user has access to workspace
    const userMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: req.userId,
      },
    });

    if (!userMember) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'You do not have access to this workspace' },
      });
    }

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: [
        { role: 'desc' }, // owner first
        { joinedAt: 'asc' },
      ],
    });

    res.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get members' } });
  }
});

// Remove member (owner only)
router.delete('/:workspaceId/members/:memberId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { workspaceId, memberId } = req.params;

    // Check if user is owner
    const owner = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: req.userId,
        role: 'owner',
      },
    });

    if (!owner) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Only workspace owner can remove members' },
      });
    }

    // Don't allow removing the owner
    const memberToRemove = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });

    if (memberToRemove?.role === 'owner') {
      return res.status(400).json({
        error: { code: 'INVALID_OPERATION', message: 'Cannot remove workspace owner' },
      });
    }

    await prisma.workspaceMember.delete({
      where: { id: memberId },
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to remove member' } });
  }
});

// Update member role (owner only)
router.put('/:workspaceId/members/:memberId/role', authenticate, async (req: AuthRequest, res) => {
  try {
    const { workspaceId, memberId } = req.params;
    const { role } = req.body;

    if (!['owner', 'member'].includes(role)) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid role. Must be owner or member' },
      });
    }

    // Check if user is owner
    const owner = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: req.userId,
        role: 'owner',
      },
    });

    if (!owner) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Only workspace owner can change roles' },
      });
    }

    const updatedMember = await prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role },
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

    res.json(updatedMember);
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update role' } });
  }
});

export default router;
