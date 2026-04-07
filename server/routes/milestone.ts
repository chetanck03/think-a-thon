import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Create milestone
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { workspaceId, title, description, targetDate } = req.body;

    if (!workspaceId || !title || !targetDate) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Workspace ID, title, and target date are required' },
      });
    }

    const milestone = await prisma.milestone.create({
      data: {
        workspaceId,
        title,
        description,
        targetDate: new Date(targetDate),
      },
      include: {
        tasks: true,
      },
    });

    res.status(201).json(milestone);
  } catch (error) {
    console.error('Create milestone error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create milestone' } });
  }
});

// Get milestones by workspace
router.get('/workspace/:workspaceId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { workspaceId } = req.params;

    const milestones = await prisma.milestone.findMany({
      where: { workspaceId },
      include: {
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { targetDate: 'asc' },
    });

    res.json(milestones);
  } catch (error) {
    console.error('Get milestones error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get milestones' } });
  }
});

// Update milestone
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, description, targetDate, status } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (targetDate !== undefined) updateData.targetDate = new Date(targetDate);
    if (status !== undefined) updateData.status = status;

    const milestone = await prisma.milestone.update({
      where: { id },
      data: updateData,
      include: { tasks: true },
    });

    res.json(milestone);
  } catch (error) {
    console.error('Update milestone error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update milestone' } });
  }
});

// Delete milestone
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await prisma.milestone.delete({ where: { id } });
    res.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error('Delete milestone error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete milestone' } });
  }
});

export default router;
