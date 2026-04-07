import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { generateAIInsights, generatePitchDeck } from '../utils/gemini.js';

const router = Router();
const prisma = new PrismaClient();

// Generate AI insights for workspace
router.post('/insights/:workspaceId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { workspaceId } = req.params;

    // Fetch workspace data
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: true,
      },
    });

    if (!workspace) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Workspace not found' },
      });
    }

    // Fetch analytics data
    const tasks = await prisma.task.findMany({
      where: { workspaceId },
    });

    const milestones = await prisma.milestone.findMany({
      where: { workspaceId },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'done').length;
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
    ).length;

    const totalMilestones = milestones.length;
    const achievedMilestones = milestones.filter((m) => m.status === 'completed').length;
    const overdueMilestones = milestones.filter(
      (m) => new Date(m.targetDate) < new Date() && m.status !== 'completed'
    ).length;

    const workspaceData = {
      name: workspace.name,
      description: workspace.description,
      analytics: {
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          completionPercentage: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
          overdue: overdueTasks,
        },
        milestones: {
          total: totalMilestones,
          achieved: achievedMilestones,
          overdue: overdueMilestones,
        },
        team: workspace.members,
      },
    };

    // Generate AI insights
    const insights = await generateAIInsights(workspaceData);

    res.json({ insights });
  } catch (error) {
    console.error('Generate AI insights error:', error);
    res.status(500).json({ 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Failed to generate AI insights',
        details: error instanceof Error ? error.message : 'Unknown error'
      } 
    });
  }
});

// Generate pitch deck for workspace
router.post('/pitch/:workspaceId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { workspaceId } = req.params;

    // Fetch workspace data
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: true,
      },
    });

    if (!workspace) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Workspace not found' },
      });
    }

    // Fetch analytics and milestones
    const tasks = await prisma.task.findMany({
      where: { workspaceId },
    });

    const milestones = await prisma.milestone.findMany({
      where: { workspaceId },
      orderBy: { targetDate: 'asc' },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'done').length;

    const totalMilestones = milestones.length;
    const achievedMilestones = milestones.filter((m) => m.status === 'completed').length;

    const workspaceData = {
      name: workspace.name,
      description: workspace.description,
      industry: (workspace as any).industry,
      analytics: {
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          completionPercentage: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        },
        milestones: {
          total: totalMilestones,
          achieved: achievedMilestones,
        },
        team: workspace.members,
      },
      milestones: milestones.map(m => ({
        title: m.title,
        status: m.status,
        targetDate: m.targetDate,
      })),
    };

    // Generate pitch deck
    const pitchContent = await generatePitchDeck(workspaceData);

    res.json({ pitch: pitchContent });
  } catch (error) {
    console.error('Generate pitch deck error:', error);
    res.status(500).json({ 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Failed to generate pitch deck',
        details: error instanceof Error ? error.message : 'Unknown error'
      } 
    });
  }
});

export default router;
