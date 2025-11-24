'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export async function startTimer(projectId: string, description?: string) {
  try {
    // Stop any running timers first
    await db.timeEntry.updateMany({
      where: { isRunning: true },
      data: {
        isRunning: false,
        endTime: new Date(),
      },
    });

    // Calculate duration for stopped timers
    const stoppedTimers = await db.timeEntry.findMany({
      where: {
        endTime: { not: null },
        duration: null,
      },
    });

    for (const timer of stoppedTimers) {
      if (timer.endTime) {
        const duration = Math.floor(
          (timer.endTime.getTime() - timer.startTime.getTime()) / 60000
        );
        await db.timeEntry.update({
          where: { id: timer.id },
          data: { duration },
        });
      }
    }

    // Get project's hourly rate
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { hourlyRate: true },
    });

    // Create new timer
    const entry = await db.timeEntry.create({
      data: {
        projectId,
        description,
        startTime: new Date(),
        isRunning: true,
        hourlyRate: project?.hourlyRate,
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });

    revalidatePath('/time');
    revalidatePath('/');
    return { success: true, data: entry };
  } catch (error) {
    console.error('Failed to start timer:', error);
    return { success: false, error: 'Failed to start timer' };
  }
}

export async function stopTimer(entryId: string) {
  try {
    const entry = await db.timeEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      return { success: false, error: 'Time entry not found' };
    }

    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - entry.startTime.getTime()) / 60000
    );

    const updated = await db.timeEntry.update({
      where: { id: entryId },
      data: {
        endTime,
        duration,
        isRunning: false,
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });

    // Update project's actual hours
    const totalMinutes = await db.timeEntry.aggregate({
      where: { projectId: entry.projectId },
      _sum: { duration: true },
    });

    if (totalMinutes._sum.duration) {
      await db.project.update({
        where: { id: entry.projectId },
        data: { actualHours: Math.ceil(totalMinutes._sum.duration / 60) },
      });
    }

    revalidatePath('/time');
    revalidatePath('/');
    return { success: true, data: updated };
  } catch (error) {
    console.error('Failed to stop timer:', error);
    return { success: false, error: 'Failed to stop timer' };
  }
}

export async function addManualTime(
  projectId: string,
  durationMinutes: number,
  description?: string
) {
  try {
    // Get project's hourly rate
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { hourlyRate: true },
    });

    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - durationMinutes * 60000);

    const entry = await db.timeEntry.create({
      data: {
        projectId,
        description,
        startTime,
        endTime,
        duration: durationMinutes,
        isRunning: false,
        hourlyRate: project?.hourlyRate,
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });

    // Update project's actual hours
    const totalMinutes = await db.timeEntry.aggregate({
      where: { projectId },
      _sum: { duration: true },
    });

    if (totalMinutes._sum.duration) {
      await db.project.update({
        where: { id: projectId },
        data: { actualHours: Math.ceil(totalMinutes._sum.duration / 60) },
      });
    }

    revalidatePath('/time');
    revalidatePath('/');
    return { success: true, data: entry };
  } catch (error) {
    console.error('Failed to add manual time:', error);
    return { success: false, error: 'Failed to add manual time' };
  }
}

export async function deleteTimeEntry(entryId: string) {
  try {
    const entry = await db.timeEntry.findUnique({
      where: { id: entryId },
      select: { projectId: true },
    });

    if (!entry) {
      return { success: false, error: 'Time entry not found' };
    }

    await db.timeEntry.delete({
      where: { id: entryId },
    });

    // Update project's actual hours
    const totalMinutes = await db.timeEntry.aggregate({
      where: { projectId: entry.projectId },
      _sum: { duration: true },
    });

    await db.project.update({
      where: { id: entry.projectId },
      data: { actualHours: totalMinutes._sum.duration ? Math.ceil(totalMinutes._sum.duration / 60) : 0 },
    });

    revalidatePath('/time');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete time entry:', error);
    return { success: false, error: 'Failed to delete time entry' };
  }
}

export async function getTimeEntries(limit?: number) {
  try {
    const entries = await db.timeEntry.findMany({
      orderBy: { startTime: 'desc' },
      take: limit,
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });

    return { success: true, data: entries };
  } catch (error) {
    console.error('Failed to get time entries:', error);
    return { success: false, error: 'Failed to get time entries' };
  }
}

export async function getRunningTimer() {
  try {
    const entry = await db.timeEntry.findFirst({
      where: { isRunning: true },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });

    return { success: true, data: entry };
  } catch (error) {
    console.error('Failed to get running timer:', error);
    return { success: false, error: 'Failed to get running timer' };
  }
}

export async function updateTimeEntry(
  entryId: string,
  data: {
    description?: string;
    isBillable?: boolean;
    duration?: number;
  }
) {
  try {
    const entry = await db.timeEntry.update({
      where: { id: entryId },
      data,
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });

    revalidatePath('/time');
    return { success: true, data: entry };
  } catch (error) {
    console.error('Failed to update time entry:', error);
    return { success: false, error: 'Failed to update time entry' };
  }
}

export async function getProjectTimeStats(projectId: string) {
  try {
    const entries = await db.timeEntry.findMany({
      where: { projectId },
      orderBy: { startTime: 'desc' },
    });

    const totalMinutes = entries.reduce((sum, e) => sum + (e.duration || 0), 0);
    const billableMinutes = entries
      .filter((e) => e.isBillable)
      .reduce((sum, e) => sum + (e.duration || 0), 0);

    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { hourlyRate: true, estimatedHours: true },
    });

    const hourlyRate = project?.hourlyRate ? Number(project.hourlyRate) : 0;
    const billableAmount = (billableMinutes / 60) * hourlyRate;

    return {
      success: true,
      data: {
        totalMinutes,
        totalHours: Math.round((totalMinutes / 60) * 100) / 100,
        billableMinutes,
        billableHours: Math.round((billableMinutes / 60) * 100) / 100,
        billableAmount,
        estimatedHours: project?.estimatedHours || 0,
        entriesCount: entries.length,
      },
    };
  } catch (error) {
    console.error('Failed to get project time stats:', error);
    return { success: false, error: 'Failed to get project time stats' };
  }
}
