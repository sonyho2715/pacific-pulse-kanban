import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Name must be less than 255 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  initialPrompt: z.string().max(10000, 'Initial prompt must be less than 10000 characters').optional(),
  clientName: z.string().max(255, 'Client name must be less than 255 characters').optional(),
  estimatedHours: z.number().int('Hours must be a whole number').positive('Hours must be positive').optional(),
  estimatedBudget: z.number().positive('Budget must be positive').optional(),
  nextActionSteps: z.string().max(5000, 'Next action steps must be less than 5000 characters').optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Name must be less than 255 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  initialPrompt: z.string().max(10000, 'Initial prompt must be less than 10000 characters').optional(),
  requirements: z.string().max(10000, 'Requirements must be less than 10000 characters').optional(),
  estimatedHours: z.number().int('Hours must be a whole number').positive('Hours must be positive').optional(),
  estimatedBudget: z.number().positive('Budget must be positive').optional(),
  actualHours: z.number().int('Hours must be a whole number').positive('Hours must be positive').optional(),
  actualCost: z.number().positive('Cost must be positive').optional(),
  quoteAmount: z.number().positive('Quote must be positive').optional(),
  paidAmount: z.number().positive('Amount must be positive').optional(),
  clientName: z.string().max(255, 'Client name must be less than 255 characters').optional(),
  projectUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  repositoryUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  deploymentUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  startDate: z.date().optional(),
  completionDate: z.date().optional(),
  dueDate: z.date().optional(),
  nextActionSteps: z.string().max(5000, 'Next action steps must be less than 5000 characters').optional(),
});

export const addNoteSchema = z.object({
  projectId: z.string().cuid('Invalid project ID'),
  content: z.string().min(1, 'Note content is required').max(5000, 'Note must be less than 5000 characters'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AddNoteInput = z.infer<typeof addNoteSchema>;
