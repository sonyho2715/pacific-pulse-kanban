import { db } from '@/lib/db';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  FolderKanban,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CalendarView } from '@/components/CalendarView';

interface PageProps {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function CalendarPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const now = new Date();
  const month = params.month ? parseInt(params.month) : now.getMonth();
  const year = params.year ? parseInt(params.year) : now.getFullYear();

  // Get projects with due dates
  const projects = await db.project.findMany({
    where: {
      OR: [
        { dueDate: { not: null } },
        { startDate: { not: null } },
        { completionDate: { not: null } },
      ],
    },
    include: {
      client: true,
      milestones: true,
    },
  });

  // Get milestones with due dates
  const milestones = await db.milestone.findMany({
    where: {
      dueDate: { not: null },
    },
    include: {
      project: true,
    },
  });

  // Build calendar events
  const events = [
    // Project due dates
    ...projects
      .filter(p => p.dueDate)
      .map(p => ({
        id: `project-${p.id}`,
        date: new Date(p.dueDate!),
        title: p.name,
        type: 'due' as const,
        status: p.status,
        projectId: p.id,
        clientName: p.client?.name || p.clientName,
      })),
    // Project start dates
    ...projects
      .filter(p => p.startDate)
      .map(p => ({
        id: `start-${p.id}`,
        date: new Date(p.startDate!),
        title: `Start: ${p.name}`,
        type: 'start' as const,
        status: p.status,
        projectId: p.id,
        clientName: p.client?.name || p.clientName,
      })),
    // Milestone due dates
    ...milestones.map(m => ({
      id: `milestone-${m.id}`,
      date: new Date(m.dueDate!),
      title: m.name,
      type: 'milestone' as const,
      status: m.completedAt ? 'COMPLETE' : 'PENDING',
      projectId: m.projectId,
      projectName: m.project.name,
    })),
  ];

  // Calculate prev/next month
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/20 to-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
                <p className="text-sm text-slate-500">Project deadlines and milestones</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
              >
                <FolderKanban className="w-4 h-4" />
                Kanban
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/calendar?month=${prevMonth}&year=${prevYear}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">
            {monthNames[month]} {year}
          </h2>
          <Link
            href={`/calendar?month=${nextMonth}&year=${nextYear}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-medium transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-slate-600">Due Date</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-600">Start Date</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-slate-600">Milestone</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <CalendarView month={month} year={year} events={events} />

        {/* Upcoming Events */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Upcoming This Month</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {events
              .filter(e => {
                const eventDate = new Date(e.date);
                return (
                  eventDate.getMonth() === month &&
                  eventDate.getFullYear() === year &&
                  eventDate >= new Date()
                );
              })
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 10)
              .map(event => (
                <Link
                  key={event.id}
                  href={`/projects/${event.projectId}`}
                  className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      event.type === 'due'
                        ? 'bg-red-500'
                        : event.type === 'start'
                        ? 'bg-blue-500'
                        : 'bg-purple-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{event.title}</p>
                    <p className="text-xs text-slate-500">
                      {'clientName' in event ? event.clientName : ('projectName' in event ? event.projectName : '')}
                    </p>
                  </div>
                  <span className="text-sm text-slate-500">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </Link>
              ))}
            {events.filter(e => {
              const eventDate = new Date(e.date);
              return (
                eventDate.getMonth() === month &&
                eventDate.getFullYear() === year &&
                eventDate >= new Date()
              );
            }).length === 0 && (
              <div className="px-6 py-8 text-center text-slate-500">
                No upcoming events this month
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
