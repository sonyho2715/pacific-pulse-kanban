'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { ProjectStatus } from '@prisma/client';
import { createProjectSchema, updateProjectSchema, addNoteSchema } from '@/lib/validations';
import { z } from 'zod';

export async function getProjects() {
  return await db.project.findMany({
    include: {
      notes: {
        orderBy: { createdAt: 'desc' },
      },
      statusHistory: {
        orderBy: { createdAt: 'asc' },
      },
      client: true,
      tags: {
        include: { tag: true },
      },
    },
    orderBy: [
      { status: 'asc' },
      { order: 'asc' },
    ],
  });
}

export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus,
  order: number
) {
  try {
    // Get the current project to track status history
    const currentProject = await db.project.findUnique({
      where: { id: projectId },
      select: { status: true },
    });

    // Update project status
    await db.project.update({
      where: { id: projectId },
      data: { status, order },
    });

    // Track status change in history
    if (currentProject && currentProject.status !== status) {
      await db.statusHistory.create({
        data: {
          projectId,
          fromStatus: currentProject.status,
          toStatus: status,
        },
      });
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to update project status:', error);
    return { success: false, error: 'Failed to update project status' };
  }
}

export async function createProject(input: unknown) {
  try {
    // Validate input
    const data = createProjectSchema.parse(input);

    const maxOrder = await db.project.findFirst({
      where: { status: ProjectStatus.BACKLOG },
      orderBy: { order: 'desc' },
    });

    const project = await db.project.create({
      data: {
        ...data,
        status: ProjectStatus.BACKLOG,
        order: (maxOrder?.order || 0) + 1,
      },
    });

    revalidatePath('/');
    return { success: true, data: project };
  } catch (error) {
    console.error('Failed to create project:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
        details: error.issues,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create project',
    };
  }
}

export async function updateProject(projectId: string, input: unknown) {
  try {
    // Validate input
    const data = updateProjectSchema.parse(input);

    const project = await db.project.update({
      where: { id: projectId },
      data,
    });

    revalidatePath('/');
    return { success: true, data: project };
  } catch (error) {
    console.error('Failed to update project:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
        details: error.issues,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update project',
    };
  }
}

export async function deleteProject(projectId: string) {
  try {
    await db.project.delete({
      where: { id: projectId },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete project:', error);
    return { success: false, error: 'Failed to delete project' };
  }
}

export async function addNote(input: unknown) {
  try {
    // Validate input
    const { projectId, content } = addNoteSchema.parse(input);

    const note = await db.note.create({
      data: {
        projectId,
        content,
      },
    });

    revalidatePath('/');
    return { success: true, data: note };
  } catch (error) {
    console.error('Failed to add note:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
        details: error.issues,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add note',
    };
  }
}

// ============================================
// CRM Actions
// ============================================

// Toggle project on hold status
export async function toggleProjectHold(projectId: string, isOnHold: boolean, holdReason?: string) {
  try {
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { name: true, isOnHold: true, holdStartDate: true, totalHoldDays: true },
    });

    if (!project) {
      return { success: false, error: 'Project not found' };
    }

    let totalHoldDays = project.totalHoldDays || 0;

    // If resuming from hold, calculate days held
    if (!isOnHold && project.isOnHold && project.holdStartDate) {
      const daysHeld = Math.ceil(
        (Date.now() - new Date(project.holdStartDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      totalHoldDays += daysHeld;
    }

    await db.project.update({
      where: { id: projectId },
      data: {
        isOnHold,
        holdReason: isOnHold ? holdReason : null,
        holdStartDate: isOnHold ? new Date() : null,
        totalHoldDays,
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        projectId,
        action: isOnHold ? 'put_on_hold' : 'resumed',
        description: isOnHold
          ? `"${project.name}" put on hold${holdReason ? `: ${holdReason}` : ''}`
          : `"${project.name}" resumed from hold`,
      },
    });

    revalidatePath('/');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Failed to toggle hold status:', error);
    return { success: false, error: 'Failed to update hold status' };
  }
}

// Update project priority
export async function updateProjectPriority(projectId: string, priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') {
  try {
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { name: true, priority: true },
    });

    if (!project) {
      return { success: false, error: 'Project not found' };
    }

    await db.project.update({
      where: { id: projectId },
      data: { priority },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        projectId,
        action: 'priority_changed',
        description: `"${project.name}" priority changed from ${project.priority} to ${priority}`,
      },
    });

    revalidatePath('/');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Failed to update priority:', error);
    return { success: false, error: 'Failed to update priority' };
  }
}

// Get all clients
export async function getClients() {
  return await db.client.findMany({
    include: {
      projects: {
        select: { id: true, name: true, status: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}

// Create a client
export async function createClient(data: { name: string; email?: string; phone?: string; company?: string; notes?: string }) {
  try {
    const client = await db.client.create({
      data,
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'client_created',
        description: `New client "${data.name}" created`,
      },
    });

    revalidatePath('/clients');
    revalidatePath('/dashboard');
    return { success: true, data: client };
  } catch (error) {
    console.error('Failed to create client:', error);
    return { success: false, error: 'Failed to create client' };
  }
}

// Get all tags
export async function getTags() {
  return await db.tag.findMany({
    include: {
      projects: {
        include: { project: { select: { id: true, name: true } } },
      },
    },
    orderBy: { name: 'asc' },
  });
}

// Create a tag
export async function createTag(name: string, color?: string) {
  try {
    const tag = await db.tag.create({
      data: { name, color: color || '#6366f1' },
    });

    revalidatePath('/');
    return { success: true, data: tag };
  } catch (error) {
    console.error('Failed to create tag:', error);
    return { success: false, error: 'Failed to create tag' };
  }
}

// Add tag to project
export async function addTagToProject(projectId: string, tagId: string) {
  try {
    await db.projectTag.create({
      data: { projectId, tagId },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to add tag:', error);
    return { success: false, error: 'Failed to add tag' };
  }
}

// Remove tag from project
export async function removeTagFromProject(projectId: string, tagId: string) {
  try {
    await db.projectTag.delete({
      where: { projectId_tagId: { projectId, tagId } },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to remove tag:', error);
    return { success: false, error: 'Failed to remove tag' };
  }
}

// Get recent activity
export async function getRecentActivity(limit: number = 20) {
  return await db.activityLog.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      project: {
        select: { id: true, name: true },
      },
    },
  });
}

// Search projects
export async function searchProjects(query: string) {
  return await db.project.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { clientName: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      notes: { orderBy: { createdAt: 'desc' } },
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

// Filter projects by status
export async function getProjectsByStatus(status: ProjectStatus) {
  return await db.project.findMany({
    where: { status },
    include: {
      notes: { orderBy: { createdAt: 'desc' } },
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: { order: 'asc' },
  });
}

// Get dashboard metrics
export async function getDashboardMetrics() {
  const [projects, onHoldCount, recentActivity] = await Promise.all([
    db.project.findMany({
      include: { statusHistory: { orderBy: { createdAt: 'asc' } } },
    }),
    db.project.count({ where: { isOnHold: true } }),
    db.activityLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { project: { select: { id: true, name: true } } },
    }),
  ]);

  const totalRevenue = projects.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
  const pendingRevenue = projects.reduce((sum, p) => {
    const quote = Number(p.quoteAmount) || 0;
    const paid = Number(p.paidAmount) || 0;
    return sum + Math.max(0, quote - paid);
  }, 0);

  return {
    totalProjects: projects.length,
    onHoldCount,
    totalRevenue,
    pendingRevenue,
    recentActivity,
  };
}

// Export projects to CSV format
export async function exportProjectsToCSV() {
  const projects = await db.project.findMany({
    include: {
      client: true,
      notes: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const headers = [
    'Name',
    'Status',
    'Priority',
    'Client',
    'Estimated Hours',
    'Actual Hours',
    'Estimated Budget',
    'Actual Cost',
    'Quote Amount',
    'Paid Amount',
    'Start Date',
    'Due Date',
    'Completion Date',
    'On Hold',
    'Created At',
  ];

  const rows = projects.map((p) => [
    p.name,
    p.status,
    p.priority,
    p.client?.name || p.clientName || '',
    p.estimatedHours || '',
    p.actualHours || '',
    p.estimatedBudget || '',
    p.actualCost || '',
    p.quoteAmount || '',
    p.paidAmount || '',
    p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : '',
    p.dueDate ? new Date(p.dueDate).toISOString().split('T')[0] : '',
    p.completionDate ? new Date(p.completionDate).toISOString().split('T')[0] : '',
    p.isOnHold ? 'Yes' : 'No',
    new Date(p.createdAt).toISOString().split('T')[0],
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');

  return csv;
}
