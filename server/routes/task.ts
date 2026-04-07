import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Create task
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { workspaceId, title, description, assigneeId, milestoneId, dueDate, priority, status } = req.body;

    if (!workspaceId || !title) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Workspace ID and title are required' },
      });
    }

    const task = await prisma.task.create({
      data: {
        workspaceId,
        title,
        description,
        assigneeId,
        milestoneId,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'medium',
        status: status || 'todo',
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        milestone: true,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create task' } });
  }
});

// Get tasks by workspace
router.get('/workspace/:workspaceId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { workspaceId } = req.params;
    const { status, assigneeId, milestoneId } = req.query;

    const where: any = { workspaceId };
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;
    if (milestoneId) where.milestoneId = milestoneId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        milestone: true,
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get tasks' } });
  }
});

// Update task
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, description, assigneeId, milestoneId, dueDate, priority, status } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
    if (milestoneId !== undefined) updateData.milestoneId = milestoneId;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        milestone: true,
      },
    });

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update task' } });
  }
});

// Delete task
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete task' } });
  }
});

export default router;
