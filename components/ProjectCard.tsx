'use client';

import { useDraggable } from '@dnd-kit/core';
import { Project, Priority } from '@prisma/client';
import { ExternalLink, GitBranch, DollarSign, Clock, FileText, PauseCircle, AlertTriangle, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { PRIORITY_CONFIG, DAYS_THRESHOLDS, ACTIVE_STATUSES } from '@/lib/constants';
import { useState, useEffect, useRef } from 'react';

type ProjectWithNotes = Project & {
  notes: { id: string; content: string; createdAt: Date }[];
  statusHistory?: { id: string; createdAt: Date }[];
  client?: { id: string; name: string } | null;
  tags?: { tag: { id: string; name: string; color: string } }[];
};

interface ProjectCardProps {
  project: ProjectWithNotes;
  isDragging?: boolean;
}

// Calculate days in current stage
function getDaysInStage(project: ProjectWithNotes): number {
  if (project.statusHistory && project.statusHistory.length > 0) {
    const lastChange = project.statusHistory[project.statusHistory.length - 1];
    return Math.ceil((Date.now() - new Date(lastChange.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  }
  return Math.ceil((Date.now() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24));
}

// Get days indicator color
function getDaysColor(days: number): { bg: string; text: string; border: string } {
  if (days >= DAYS_THRESHOLDS.DANGER) {
    return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' };
  }
  if (days >= DAYS_THRESHOLDS.WARNING) {
    return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' };
  }
  return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' };
}

export function ProjectCard({ project, isDragging = false }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: project.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const daysInStage = getDaysInStage(project);
  const daysColors = getDaysColor(daysInStage);
  const priorityConfig = PRIORITY_CONFIG[project.priority as Priority] || PRIORITY_CONFIG.MEDIUM;
  const isActive = ACTIVE_STATUSES.includes(project.status as any);
  const showDaysAlert = isActive && daysInStage >= DAYS_THRESHOLDS.WARNING && !project.isOnHold;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMenu]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white rounded-2xl border shadow-card hover:shadow-card-hover transition-all duration-300 ${
        isDragging ? 'opacity-60 shadow-xl' : 'hover:-translate-y-1'
      } ${project.isOnHold ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200/60'}`}
    >
      <div className="p-5">
        {/* Drag Handle - invisible overlay for dragging */}
        <div
          {...listeners}
          {...attributes}
          className="absolute inset-0 cursor-grab active:cursor-grabbing z-0"
          style={{ pointerEvents: showMenu ? 'none' : 'auto' }}
        />

        <Link href={`/projects/${project.id}`} className="block relative z-10">
        {/* On Hold Banner */}
        {project.isOnHold && (
          <div className="flex items-center gap-2 text-amber-700 bg-amber-100 -mx-5 -mt-5 mb-4 px-5 py-2 rounded-t-2xl border-b border-amber-200">
            <PauseCircle className="w-4 h-4" />
            <span className="text-xs font-medium">On Hold</span>
          </div>
        )}

        {/* Priority Badge & Days Indicator Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {/* Priority - title only, no icon */}
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium uppercase ${priorityConfig.bgColor} ${priorityConfig.color}`}>
              {priorityConfig.label}
            </span>

            {/* Days in Stage - only show for active projects */}
            {isActive && !project.isOnHold && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${daysColors.bg} ${daysColors.text} ${daysColors.border}`}>
                {daysInStage}d
              </span>
            )}
          </div>

          {/* Options Button */}
          <div className="relative z-20" ref={menuRef}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="inline-flex items-center justify-center w-5 h-5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title="Options"
              type="button"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div
                className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <Link
                  href={`/projects/${project.id}`}
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  View Details
                </Link>
                <Link
                  href={`/projects/${project.id}/edit`}
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  Edit Project
                </Link>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => {
                    setShowMenu(false);
                    // TODO: Implement duplicate functionality
                  }}
                >
                  Duplicate
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                  onClick={() => {
                    setShowMenu(false);
                    // TODO: Implement on hold toggle
                  }}
                >
                  {project.isOnHold ? 'Resume Project' : 'Put On Hold'}
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  onClick={() => {
                    setShowMenu(false);
                    // TODO: Implement delete functionality
                  }}
                >
                  Delete Project
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Project Title */}
        <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
          {project.name}
        </h3>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.tags.slice(0, 3).map(({ tag }) => (
              <span
                key={tag.id}
                className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                style={{
                  backgroundColor: `${tag.color}15`,
                  color: tag.color,
                  border: `1px solid ${tag.color}30`,
                }}
              >
                {tag.name}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded font-medium bg-slate-100 text-slate-500">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Badges - titles only, no icons */}
        <div className="flex flex-wrap gap-1 mb-4">
          {(project.client?.name || project.clientName) && (
            <span className="text-[9px] bg-purple-50 text-purple-700 border border-purple-200/60 px-1.5 py-0.5 rounded font-medium">
              {project.client?.name || project.clientName}
            </span>
          )}

          {project.estimatedHours && (
            <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-200/60 px-1.5 py-0.5 rounded font-medium">
              {project.estimatedHours}h
            </span>
          )}

          {project.estimatedBudget && (
            <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-1.5 py-0.5 rounded font-medium">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(Number(project.estimatedBudget))}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {/* Links */}
          <div className="flex gap-2">
            {project.repositoryUrl && (
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-primary-100 hover:text-primary-600 transition-colors"
                title="Repository"
              >
                <GitBranch className="w-4 h-4" />
              </a>
            )}

            {project.deploymentUrl && (
              <a
                href={project.deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-primary-100 hover:text-primary-600 transition-colors"
                title="Live Site"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Notes Count */}
          {project.notes.length > 0 && (
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <FileText className="w-3.5 h-3.5" />
              <span>{project.notes.length}</span>
            </div>
          )}
        </div>
        </Link>
      </div>
    </div>
  );
}
