import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Create feedback request
router.post('/request', authenticate, async (req: AuthRequest, res) => {
  try {
    const { workspaceId, title, description } = req.body;

    if (!workspaceId || !title) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Workspace ID and title are required' },
      });
    }

    // Generate unique shareable link (more readable than cuid)
    const shareableLink = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const feedbackRequest = await prisma.feedbackRequest.create({
      data: { 
        workspaceId, 
        title, 
        description,
        shareableLink,
      },
      include: {
        feedbacks: true,
      },
    });

    res.status(201).json(feedbackRequest);
  } catch (error) {
    console.error('Create feedback request error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create feedback request' } });
  }
});

// Submit feedback (public - no auth)
router.post('/submit/:shareableLink', async (req, res) => {
  try {
    const { shareableLink } = req.params;
    const { content, rating, submitterName, submitterEmail } = req.body;

    if (!content) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Content is required' },
      });
    }

    const feedbackRequest = await prisma.feedbackRequest.findUnique({
      where: { shareableLink },
      select: {
        id: true,
        title: true,
        description: true,
      },
    });

    if (!feedbackRequest) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Feedback request not found' },
      });
    }

    const feedback = await prisma.feedback.create({
      data: {
        requestId: feedbackRequest.id,
        content,
        rating: rating ? parseInt(rating) : null,
        submitterName: submitterName || null,
        submitterEmail: submitterEmail || null,
      },
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to submit feedback' } });
  }
});

// Get feedback request details (public - no auth)
router.get('/request/:shareableLink', async (req, res) => {
  try {
    const { shareableLink } = req.params;

    const feedbackRequest = await prisma.feedbackRequest.findUnique({
      where: { shareableLink },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
      },
    });

    if (!feedbackRequest) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Feedback request not found' },
      });
    }

    res.json(feedbackRequest);
  } catch (error) {
    console.error('Get feedback request error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get feedback request' } });
  }
});

// Get feedback by workspace
router.get('/workspace/:workspaceId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { workspaceId } = req.params;

    const feedbackRequests = await prisma.feedbackRequest.findMany({
      where: { workspaceId },
      include: {
        feedbacks: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(feedbackRequests);
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get feedback' } });
  }
});

// Mark feedback as addressed
router.put('/:id/address', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const feedback = await prisma.feedback.update({
      where: { id },
      data: {
        isAddressed: true,
      },
    });

    res.json(feedback);
  } catch (error) {
    console.error('Address feedback error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to address feedback' } });
  }
});

// Update feedback request
router.put('/request/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Title is required' },
      });
    }

    // Check if user is owner of the workspace
    const feedbackRequest = await prisma.feedbackRequest.findUnique({
      where: { id },
      include: {
        workspace: {
          include: {
            members: {
              where: {
                userId: req.userId,
                role: 'owner',
              },
            },
          },
        },
      },
    });

    if (!feedbackRequest) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Feedback request not found' },
      });
    }

    if (feedbackRequest.workspace.members.length === 0) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Only workspace owner can update feedback requests' },
      });
    }

    const updated = await prisma.feedbackRequest.update({
      where: { id },
      data: { title, description },
      include: {
        feedbacks: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update feedback request error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update feedback request' } });
  }
});

// Delete feedback request
router.delete('/request/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if user is owner of the workspace
    const feedbackRequest = await prisma.feedbackRequest.findUnique({
      where: { id },
      include: {
        workspace: {
          include: {
            members: {
              where: {
                userId: req.userId,
                role: 'owner',
              },
            },
          },
        },
      },
    });

    if (!feedbackRequest) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Feedback request not found' },
      });
    }

    if (feedbackRequest.workspace.members.length === 0) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Only workspace owner can delete feedback requests' },
      });
    }

    await prisma.feedbackRequest.delete({
      where: { id },
    });

    res.json({ message: 'Feedback request deleted successfully' });
  } catch (error) {
    console.error('Delete feedback request error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete feedback request' } });
  }
});

export default router;
