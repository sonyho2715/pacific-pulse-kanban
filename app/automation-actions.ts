'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { AutomationTrigger, AutomationAction } from '@prisma/client';

export async function createAutomation(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const trigger = formData.get('trigger') as AutomationTrigger;
    const action = formData.get('action') as AutomationAction;
    const isActive = formData.get('isActive') === 'on';

    if (!name || !trigger || !action) {
      return { success: false, error: 'Name, trigger, and action are required' };
    }

    const automation = await db.automation.create({
      data: {
        name,
        description: description || null,
        trigger,
        action,
        isActive,
      },
    });

    revalidatePath('/automations');
    return { success: true, data: automation };
  } catch (error) {
    console.error('Failed to create automation:', error);
    return { success: false, error: 'Failed to create automation' };
  }
}

export async function updateAutomation(
  id: string,
  data: {
    name?: string;
    description?: string;
    trigger?: AutomationTrigger;
    action?: AutomationAction;
    isActive?: boolean;
    triggerConfig?: string;
    actionConfig?: string;
  }
) {
  try {
    const automation = await db.automation.update({
      where: { id },
      data,
    });

    revalidatePath('/automations');
    return { success: true, data: automation };
  } catch (error) {
    console.error('Failed to update automation:', error);
    return { success: false, error: 'Failed to update automation' };
  }
}

export async function toggleAutomation(id: string) {
  try {
    const automation = await db.automation.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!automation) {
      return { success: false, error: 'Automation not found' };
    }

    const updated = await db.automation.update({
      where: { id },
      data: { isActive: !automation.isActive },
    });

    revalidatePath('/automations');
    return { success: true, data: updated };
  } catch (error) {
    console.error('Failed to toggle automation:', error);
    return { success: false, error: 'Failed to toggle automation' };
  }
}

export async function deleteAutomation(id: string) {
  try {
    await db.automation.delete({
      where: { id },
    });

    revalidatePath('/automations');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete automation:', error);
    return { success: false, error: 'Failed to delete automation' };
  }
}

export async function runAutomation(id: string) {
  try {
    const automation = await db.automation.findUnique({
      where: { id },
    });

    if (!automation) {
      return { success: false, error: 'Automation not found' };
    }

    // Log the execution
    await db.automationLog.create({
      data: {
        automationId: id,
        success: true,
        message: 'Manual execution',
      },
    });

    // Update run count
    await db.automation.update({
      where: { id },
      data: {
        runCount: { increment: 1 },
        lastRunAt: new Date(),
      },
    });

    revalidatePath('/automations');
    return { success: true };
  } catch (error) {
    console.error('Failed to run automation:', error);

    // Log the failure
    try {
      await db.automationLog.create({
        data: {
          automationId: id,
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } catch (e) {
      console.error('Failed to log automation failure:', e);
    }

    return { success: false, error: 'Failed to run automation' };
  }
}

// This function would be called by a cron job or event system
export async function executeAutomations(trigger: AutomationTrigger, context?: Record<string, unknown>) {
  try {
    const automations = await db.automation.findMany({
      where: {
        trigger,
        isActive: true,
      },
    });

    const results = [];

    for (const automation of automations) {
      try {
        // Execute the action based on type
        switch (automation.action) {
          case 'SEND_EMAIL':
            // TODO: Implement email sending
            console.log('Would send email for automation:', automation.name);
            break;
          case 'SEND_NOTIFICATION':
            // TODO: Implement notification
            console.log('Would send notification for automation:', automation.name);
            break;
          case 'CHANGE_STATUS':
            // TODO: Implement status change
            console.log('Would change status for automation:', automation.name);
            break;
          case 'CREATE_TASK':
            // TODO: Implement task creation
            console.log('Would create task for automation:', automation.name);
            break;
          case 'UPDATE_FIELD':
            // TODO: Implement field update
            console.log('Would update field for automation:', automation.name);
            break;
        }

        // Log success
        await db.automationLog.create({
          data: {
            automationId: automation.id,
            success: true,
            message: `Triggered by ${trigger}`,
            metadata: context ? JSON.stringify(context) : null,
          },
        });

        // Update automation stats
        await db.automation.update({
          where: { id: automation.id },
          data: {
            runCount: { increment: 1 },
            lastRunAt: new Date(),
          },
        });

        results.push({ automationId: automation.id, success: true });
      } catch (error) {
        // Log failure
        await db.automationLog.create({
          data: {
            automationId: automation.id,
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
            metadata: context ? JSON.stringify(context) : null,
          },
        });

        results.push({
          automationId: automation.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { success: true, results };
  } catch (error) {
    console.error('Failed to execute automations:', error);
    return { success: false, error: 'Failed to execute automations' };
  }
}
