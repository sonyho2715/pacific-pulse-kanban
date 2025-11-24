'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { z } from 'zod';
import { BillingType } from '@prisma/client';

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
  defaultBillingType: z.nativeEnum(BillingType).optional(),
  defaultHourlyRate: z.coerce.number().positive().optional().or(z.literal('')),
  paymentTermsDays: z.coerce.number().int().positive().optional(),
});

export async function createClient(formData: FormData) {
  try {
    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      company: formData.get('company') as string,
      website: formData.get('website') as string,
      address: formData.get('address') as string,
      notes: formData.get('notes') as string,
      defaultBillingType: formData.get('defaultBillingType') as string,
      defaultHourlyRate: formData.get('defaultHourlyRate') as string,
      paymentTermsDays: formData.get('paymentTermsDays') as string,
    };

    const validated = clientSchema.parse(rawData);

    const client = await db.client.create({
      data: {
        name: validated.name,
        email: validated.email || null,
        phone: validated.phone || null,
        company: validated.company || null,
        website: validated.website || null,
        address: validated.address || null,
        notes: validated.notes || null,
        defaultBillingType: validated.defaultBillingType || 'HOURLY',
        defaultHourlyRate: validated.defaultHourlyRate ? validated.defaultHourlyRate : null,
        paymentTermsDays: validated.paymentTermsDays || 30,
      },
    });

    revalidatePath('/clients');
    revalidatePath('/dashboard');
    return { success: true, data: client };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed', issues: error.issues };
    }
    console.error('Failed to create client:', error);
    return { success: false, error: 'Failed to create client' };
  }
}

export async function updateClient(clientId: string, formData: FormData) {
  try {
    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      company: formData.get('company') as string,
      website: formData.get('website') as string,
      address: formData.get('address') as string,
      notes: formData.get('notes') as string,
      defaultBillingType: formData.get('defaultBillingType') as string,
      defaultHourlyRate: formData.get('defaultHourlyRate') as string,
      paymentTermsDays: formData.get('paymentTermsDays') as string,
    };

    const validated = clientSchema.parse(rawData);

    const client = await db.client.update({
      where: { id: clientId },
      data: {
        name: validated.name,
        email: validated.email || null,
        phone: validated.phone || null,
        company: validated.company || null,
        website: validated.website || null,
        address: validated.address || null,
        notes: validated.notes || null,
        defaultBillingType: validated.defaultBillingType || 'HOURLY',
        defaultHourlyRate: validated.defaultHourlyRate ? validated.defaultHourlyRate : null,
        paymentTermsDays: validated.paymentTermsDays || 30,
      },
    });

    revalidatePath('/clients');
    revalidatePath(`/clients/${clientId}`);
    revalidatePath('/dashboard');
    return { success: true, data: client };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed', issues: error.issues };
    }
    console.error('Failed to update client:', error);
    return { success: false, error: 'Failed to update client' };
  }
}

export async function deleteClient(clientId: string) {
  try {
    // Check if client has any projects
    const projectCount = await db.project.count({
      where: { clientId },
    });

    if (projectCount > 0) {
      return {
        success: false,
        error: `Cannot delete client with ${projectCount} associated project(s). Remove or reassign projects first.`,
      };
    }

    await db.client.delete({
      where: { id: clientId },
    });

    revalidatePath('/clients');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete client:', error);
    return { success: false, error: 'Failed to delete client' };
  }
}

export async function toggleClientActive(clientId: string) {
  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { isActive: true },
    });

    if (!client) {
      return { success: false, error: 'Client not found' };
    }

    const updated = await db.client.update({
      where: { id: clientId },
      data: { isActive: !client.isActive },
    });

    revalidatePath('/clients');
    revalidatePath(`/clients/${clientId}`);
    return { success: true, data: updated };
  } catch (error) {
    console.error('Failed to toggle client active status:', error);
    return { success: false, error: 'Failed to update client' };
  }
}

export async function addClientContact(clientId: string, formData: FormData) {
  try {
    const contact = await db.clientContact.create({
      data: {
        clientId,
        name: formData.get('name') as string,
        email: (formData.get('email') as string) || null,
        phone: (formData.get('phone') as string) || null,
        role: (formData.get('role') as string) || null,
        isPrimary: formData.get('isPrimary') === 'true',
      },
    });

    revalidatePath(`/clients/${clientId}`);
    return { success: true, data: contact };
  } catch (error) {
    console.error('Failed to add contact:', error);
    return { success: false, error: 'Failed to add contact' };
  }
}

export async function deleteClientContact(contactId: string, clientId: string) {
  try {
    await db.clientContact.delete({
      where: { id: contactId },
    });

    revalidatePath(`/clients/${clientId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete contact:', error);
    return { success: false, error: 'Failed to delete contact' };
  }
}

export async function getClientStats(clientId: string) {
  try {
    const projects = await db.project.findMany({
      where: { clientId },
      select: {
        id: true,
        status: true,
        quoteAmount: true,
        paidAmount: true,
        estimatedHours: true,
        actualHours: true,
      },
    });

    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'COMPLETE').length;
    const activeProjects = projects.filter(p => !['COMPLETE', 'BACKLOG'].includes(p.status)).length;

    const totalRevenue = projects.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
    const pendingRevenue = projects.reduce((sum, p) => {
      const quote = Number(p.quoteAmount) || 0;
      const paid = Number(p.paidAmount) || 0;
      return sum + Math.max(0, quote - paid);
    }, 0);

    const totalEstimatedHours = projects.reduce((sum, p) => sum + (p.estimatedHours || 0), 0);
    const totalActualHours = projects.reduce((sum, p) => sum + (p.actualHours || 0), 0);

    return {
      success: true,
      data: {
        totalProjects,
        completedProjects,
        activeProjects,
        totalRevenue,
        pendingRevenue,
        totalEstimatedHours,
        totalActualHours,
      },
    };
  } catch (error) {
    console.error('Failed to get client stats:', error);
    return { success: false, error: 'Failed to get client stats' };
  }
}
