import { db } from '@/lib/db';
import Link from 'next/link';
import {
  Clock,
  FolderKanban,
  LayoutDashboard,
  Calendar,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { TimeTracker } from '@/components/TimeTracker';

export default async function TimePage() {
  // Fetch all projects for selection
  const projects = await db.project.findMany({
    where: {
      status: {
        notIn: ['COMPLETE'],
      },
    },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });

  // Fetch time entries
  const entries = await db.timeEntry.findMany({
    orderBy: { startTime: 'desc' },
    take: 100,
    include: {
      project: {
        select: { id: true, name: true },
      },
    },
  });

  // Get running timer if any
  const runningEntry = await db.timeEntry.findFirst({
    where: { isRunning: true },
    include: {
      project: {
        select: { id: true, name: true },
      },
    },
  });

  // Calculate stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());

  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const todayEntries = entries.filter(e => new Date(e.startTime) >= today);
  const weekEntries = entries.filter(e => new Date(e.startTime) >= thisWeekStart);
  const monthEntries = entries.filter(e => new Date(e.startTime) >= thisMonthStart);

  const todayMinutes = todayEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
  const weekMinutes = weekEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
  const monthMinutes = monthEntries.reduce((sum, e) => sum + (e.duration || 0), 0);

  // Calculate billable amounts
  const calculateBillableAmount = (entries: typeof monthEntries) => {
    return entries
      .filter(e => e.isBillable && e.duration)
      .reduce((sum, e) => {
        const rate = e.hourlyRate ? Number(e.hourlyRate) : 0;
        return sum + (e.duration! / 60) * rate;
      }, 0);
  };

  const monthBillable = calculateBillableAmount(monthEntries);

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/20 to-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Time Tracking</h1>
                <p className="text-sm text-slate-500">Track time spent on projects</p>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Today */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Today</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatHours(todayMinutes)}</p>
            <p className="text-xs text-slate-400 mt-1">{todayEntries.length} entries</p>
          </div>

          {/* This Week */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">This Week</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatHours(weekMinutes)}</p>
            <p className="text-xs text-slate-400 mt-1">{weekEntries.length} entries</p>
          </div>

          {/* This Month */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">This Month</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatHours(monthMinutes)}</p>
            <p className="text-xs text-slate-400 mt-1">{monthEntries.length} entries</p>
          </div>

          {/* Billable */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Billable (Month)</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              ${monthBillable.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-slate-400 mt-1">Estimated value</p>
          </div>
        </div>

        {/* Time Tracker Component */}
        <TimeTracker
          entries={entries}
          projects={projects}
          runningEntry={runningEntry}
        />
      </div>
    </div>
  );
}
