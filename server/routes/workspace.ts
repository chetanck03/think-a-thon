import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Create workspace
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Workspace name is required',
          timestamp: new Date().toISOString(),
        },
      });
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId: req.userId!,
            role: 'owner',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Create default #general channel
    await (prisma as any).channel.create({
      data: {
        workspaceId: workspace.id,
        name: 'general',
        description: 'General discussion for the team',
        type: 'public',
        members: {
          create: {
            userId: req.userId!,
          },
        },
      },
    });

    res.status(201).json(workspace);
  } catch (error) {
    console.error('Create workspace error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create workspace',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// Get all user workspaces
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId: req.userId,
          },
        },
      },
      include: {
        members: {
          include: {
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
          select: {
            tasks: true,
            milestones: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(workspaces);
  } catch (error) {
    console.error('Get workspaces error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get workspaces',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// Get workspace by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        milestones: {
          include: {
            tasks: true,
          },
          orderBy: {
            targetDate: 'asc',
          },
        },
      },
    });

    if (!workspace) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Workspace not found',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Check access
    const hasAccess = workspace.members.some((m) => m.userId === req.userId);

    if (!hasAccess) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this workspace',
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.json(workspace);
  } catch (error) {
    console.error('Get workspace error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get workspace',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// Update workspace
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        members: {
          where: {
            userId: req.userId,
          },
        },
      },
    });

    if (!workspace) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Workspace not found',
          timestamp: new Date().toISOString(),
        },
      });
    }

    const member = workspace.members[0];
    if (!member || member.role !== 'owner') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only the owner can update this workspace',
          timestamp: new Date().toISOString(),
        },
      });
    }

    const updated = await prisma.workspace.update({
      where: { id },
      data: {
        name,
        description,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update workspace error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update workspace',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// Delete workspace
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        members: {
          where: {
            userId: req.userId,
          },
        },
      },
    });

    if (!workspace) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Workspace not found',
          timestamp: new Date().toISOString(),
        },
      });
    }

    const member = workspace.members[0];
    if (!member || member.role !== 'owner') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only the owner can delete this workspace',
          timestamp: new Date().toISOString(),
        },
      });
    }

    await prisma.workspace.delete({
      where: { id },
    });

    res.json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    console.error('Delete workspace error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete workspace',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

export default router;
