import { ProjectStatus } from '@prisma/client';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

const STATUS_CONFIG: Record<ProjectStatus, { label: string; className: string }> = {
  [ProjectStatus.BACKLOG]: {
    label: 'Backlog',
    className: 'bg-slate-100 text-slate-700',
  },
  [ProjectStatus.PLANNED]: {
    label: 'Planned',
    className: 'bg-gray-100 text-gray-700',
  },
  [ProjectStatus.IN_DEVELOPMENT]: {
    label: 'In Development',
    className: 'bg-blue-100 text-blue-700',
  },
  [ProjectStatus.CODE_REVIEW]: {
    label: 'Code Review',
    className: 'bg-purple-100 text-purple-700',
  },
  [ProjectStatus.QA]: {
    label: 'QA',
    className: 'bg-orange-100 text-orange-700',
  },
  [ProjectStatus.READY_FOR_PROD]: {
    label: 'Ready for Prod',
    className: 'bg-cyan-100 text-cyan-700',
  },
  [ProjectStatus.DEPLOYED]: {
    label: 'Deployed',
    className: 'bg-emerald-100 text-emerald-700',
  },
  [ProjectStatus.MONITORING]: {
    label: 'Monitoring',
    className: 'bg-teal-100 text-teal-700',
  },
  [ProjectStatus.CLIENT_DELIVERY]: {
    label: 'Client Delivery',
    className: 'bg-indigo-100 text-indigo-700',
  },
  [ProjectStatus.COMPLETE]: {
    label: 'Complete',
    className: 'bg-green-100 text-green-700',
  },
};

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
