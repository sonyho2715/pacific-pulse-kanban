'use client';

import { useState, useMemo } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { Project, ProjectStatus } from '@prisma/client';
import { KanbanColumn } from './KanbanColumn';
import { ProjectCard } from './ProjectCard';
import { updateProjectStatus } from '@/app/actions';
import { KANBAN_COLUMNS } from '@/lib/constants';

type ProjectWithNotes = Project & {
  notes: { id: string; content: string; createdAt: Date }[];
  statusHistory?: { id: string; createdAt: Date }[];
};

interface KanbanBoardProps {
  projects: ProjectWithNotes[];
}

export function KanbanBoard({ projects: initialProjects }: KanbanBoardProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [activeProject, setActiveProject] = useState<ProjectWithNotes | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const project = projects.find((p) => p.id === active.id);
    if (project) {
      setActiveProject(project);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveProject(null);
      return;
    }

    const projectId = active.id as string;
    const newStatus = over.id as ProjectStatus;

    const project = projects.find((p) => p.id === projectId);
    if (!project || project.status === newStatus) {
      setActiveProject(null);
      return;
    }

    // Get projects in the new column
    const projectsInNewColumn = projects.filter((p) => p.status === newStatus);
    const newOrder = projectsInNewColumn.length;

    // Store previous state before optimistic update
    const previousProjects = projects;

    // Optimistically update UI
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, status: newStatus, order: newOrder } : p
      )
    );

    // Update in database
    const result = await updateProjectStatus(projectId, newStatus, newOrder);
    if (!result.success) {
      // Revert to correct previous state
      setProjects(previousProjects);
    }

    setActiveProject(null);
  };

  // Memoize grouped projects for performance (avoid re-filtering on every render)
  const projectsByStatus = useMemo(() => {
    const grouped: Record<ProjectStatus, ProjectWithNotes[]> = {
      BACKLOG: [],
      PLANNED: [],
      IN_DEVELOPMENT: [],
      CODE_REVIEW: [],
      QA: [],
      READY_FOR_PROD: [],
      DEPLOYED: [],
      MONITORING: [],
      CLIENT_DELIVERY: [],
      COMPLETE: [],
    };

    // Group projects by status
    projects.forEach((project) => {
      grouped[project.status].push(project);
    });

    // Sort each group by order
    Object.values(grouped).forEach((group) => {
      group.sort((a, b) => a.order - b.order);
    });

    return grouped;
  }, [projects]);

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-thin">
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            icon={column.icon}
            ringColor={column.ringColor}
            projects={projectsByStatus[column.id]}
          />
        ))}
      </div>

      <DragOverlay>
        {activeProject ? (
          <div className="rotate-2 scale-105">
            <ProjectCard project={activeProject} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
