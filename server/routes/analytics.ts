import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Get workspace analytics
router.get('/workspace/:workspaceId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { workspaceId } = req.params;

    // Task metrics
    const tasks = await prisma.task.findMany({
      where: { workspaceId },
      include: { assignee: true },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'done').length;
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
    ).length;

    const tasksByStatus = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Milestone metrics
    const milestones = await prisma.milestone.findMany({
      where: { workspaceId },
    });

    const totalMilestones = milestones.length;
    const achievedMilestones = milestones.filter((m) => m.status === 'completed').length;
    const overdueMilestones = milestones.filter(
      (m) => new Date(m.targetDate) < new Date() && m.status !== 'completed'
    ).length;

    // Team metrics
    const teamMetrics = tasks.reduce((acc, task) => {
      if (task.assignee) {
        if (!acc[task.assigneeId!]) {
          acc[task.assigneeId!] = {
            userId: task.assignee.id,
            userName: task.assignee.name,
            tasksCompleted: 0,
            tasksInProgress: 0,
          };
        }
        if (task.status === 'done') {
          acc[task.assigneeId!].tasksCompleted++;
        } else if (task.status === 'in-progress') {
          acc[task.assigneeId!].tasksInProgress++;
        }
      }
      return acc;
    }, {} as Record<string, any>);

    res.json({
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        completionPercentage: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        overdue: overdueTasks,
        byStatus: tasksByStatus,
      },
      milestones: {
        total: totalMilestones,
        achieved: achievedMilestones,
        overdue: overdueMilestones,
      },
      team: Object.values(teamMetrics),
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get analytics' } });
  }
});

export default router;
