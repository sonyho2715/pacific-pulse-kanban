'use client';

import { useDroppable } from '@dnd-kit/core';
import { Project, ProjectStatus } from '@prisma/client';
import { ProjectCard } from './ProjectCard';

type ProjectWithNotes = Project & {
  notes: { id: string; content: string; createdAt: Date }[];
};

interface KanbanColumnProps {
  id: ProjectStatus;
  title: string;
  color: string;
  icon: string;
  ringColor: string;
  projects: ProjectWithNotes[];
}

export function KanbanColumn({ id, title, color, icon, ringColor, projects }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 ${color} rounded-2xl p-6 border border-slate-200/50 transition-all duration-300 ${
        isOver ? `ring-4 ${ringColor} ring-opacity-40 scale-105 shadow-xl` : 'shadow-md'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl" role="img" aria-label={title}>
            {icon}
          </span>
          <h2 className="font-bold text-lg text-slate-800">{title}</h2>
        </div>
        <span className="bg-white rounded-full px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm border border-slate-200/60">
          {projects.length}
        </span>
      </div>

      {/* Projects List */}
      <div className="space-y-3 min-h-[300px]">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <div className="text-4xl mb-2 opacity-30">{icon}</div>
            <p className="text-sm">No projects yet</p>
          </div>
        ) : (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        )}
      </div>
    </div>
  );
}
