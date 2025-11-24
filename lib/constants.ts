import { ProjectStatus, Priority } from '@prisma/client';

export interface KanbanColumn {
  id: ProjectStatus;
  title: string;
  color: string;
  icon: string;
  ringColor: string;
}

// Priority configuration
export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bgColor: string; icon: string }> = {
  LOW: { label: 'Low', color: 'text-slate-600', bgColor: 'bg-slate-100', icon: '○' },
  MEDIUM: { label: 'Medium', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: '◐' },
  HIGH: { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: '●' },
  URGENT: { label: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-100', icon: '🔥' },
};

// Days in stage thresholds for alerts
export const DAYS_THRESHOLDS = {
  WARNING: 7,  // Yellow after 7 days
  DANGER: 14,  // Red after 14 days
};

// Statuses that are considered "active" (not terminal)
export const ACTIVE_STATUSES: ProjectStatus[] = [
  'BACKLOG',
  'PLANNED',
  'IN_DEVELOPMENT',
  'CODE_REVIEW',
  'QA',
  'READY_FOR_PROD',
];

// Terminal statuses (project completed)
export const TERMINAL_STATUSES: ProjectStatus[] = [
  'DEPLOYED',
  'MONITORING',
  'CLIENT_DELIVERY',
  'COMPLETE',
];

export const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: ProjectStatus.BACKLOG,
    title: 'Backlog',
    color: 'bg-gradient-to-br from-slate-50 to-slate-100',
    icon: '📋',
    ringColor: 'ring-slate-400',
  },
  {
    id: ProjectStatus.PLANNED,
    title: 'Planned',
    color: 'bg-gradient-to-br from-violet-50 to-purple-50',
    icon: '📌',
    ringColor: 'ring-violet-400',
  },
  {
    id: ProjectStatus.IN_DEVELOPMENT,
    title: 'In Development',
    color: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    icon: '⚙️',
    ringColor: 'ring-blue-400',
  },
  {
    id: ProjectStatus.CODE_REVIEW,
    title: 'Code Review',
    color: 'bg-gradient-to-br from-cyan-50 to-sky-50',
    icon: '👀',
    ringColor: 'ring-cyan-400',
  },
  {
    id: ProjectStatus.QA,
    title: 'QA',
    color: 'bg-gradient-to-br from-purple-50 to-primary-100',
    icon: '✅',
    ringColor: 'ring-primary-400',
  },
  {
    id: ProjectStatus.READY_FOR_PROD,
    title: 'Ready for Prod',
    color: 'bg-gradient-to-br from-orange-50 to-amber-50',
    icon: '🚀',
    ringColor: 'ring-orange-400',
  },
  {
    id: ProjectStatus.DEPLOYED,
    title: 'Deployed',
    color: 'bg-gradient-to-br from-emerald-50 to-green-50',
    icon: '🌐',
    ringColor: 'ring-emerald-400',
  },
  {
    id: ProjectStatus.MONITORING,
    title: 'Monitoring',
    color: 'bg-gradient-to-br from-teal-50 to-emerald-50',
    icon: '📊',
    ringColor: 'ring-teal-400',
  },
  {
    id: ProjectStatus.CLIENT_DELIVERY,
    title: 'Client Delivery',
    color: 'bg-gradient-to-br from-pink-50 to-rose-50',
    icon: '📦',
    ringColor: 'ring-pink-400',
  },
  {
    id: ProjectStatus.COMPLETE,
    title: 'Complete',
    color: 'bg-gradient-to-br from-amber-50 to-yellow-50',
    icon: '✨',
    ringColor: 'ring-amber-400',
  },
];
