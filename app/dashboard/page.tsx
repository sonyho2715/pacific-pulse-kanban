import { db } from '@/lib/db';
import Link from 'next/link';
import {
  LayoutDashboard,
  FolderKanban,
  DollarSign,
  Clock,
  AlertTriangle,
  PauseCircle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Activity
} from 'lucide-react';
import { DAYS_THRESHOLDS, ACTIVE_STATUSES } from '@/lib/constants';
import { ProjectStatus } from '@prisma/client';
import { ActivityFeed } from '@/components/ActivityFeed';

// Helper to calculate days in current stage
function getDaysInStage(project: { statusHistory: { createdAt: Date }[]; createdAt: Date }) {
  const lastChange = project.statusHistory[project.statusHistory.length - 1];
  const referenceDate = lastChange ? lastChange.createdAt : project.createdAt;
  return Math.ceil((Date.now() - new Date(referenceDate).getTime()) / (1000 * 60 * 60 * 24));
}

// Get status color based on days
function getStatusColor(days: number): string {
  if (days >= DAYS_THRESHOLDS.DANGER) return 'text-red-600 bg-red-50 border-red-200';
  if (days >= DAYS_THRESHOLDS.WARNING) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-emerald-600 bg-emerald-50 border-emerald-200';
}

export default async function DashboardPage() {
  // Fetch all projects with relations
  const projects = await db.project.findMany({
    include: {
      statusHistory: {
        orderBy: { createdAt: 'asc' },
      },
      notes: true,
      client: true,
      tags: {
        include: { tag: true },
      },
    },
  });

  // Fetch recent activity
  const recentActivity = await db.activityLog.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { project: true },
  });

  // Fetch all clients
  const clients = await db.client.findMany({
    include: { projects: true },
  });

  // Calculate metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => ACTIVE_STATUSES.includes(p.status)).length;
  const onHoldProjects = projects.filter(p => p.isOnHold).length;
  const completedProjects = projects.filter(p => p.status === 'COMPLETE').length;

  // Revenue metrics
  const totalRevenue = projects.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
  const pendingRevenue = projects.reduce((sum, p) => {
    const quote = Number(p.quoteAmount) || 0;
    const paid = Number(p.paidAmount) || 0;
    return sum + Math.max(0, quote - paid);
  }, 0);

  // Hours metrics
  const totalEstimatedHours = projects.reduce((sum, p) => sum + (p.estimatedHours || 0), 0);
  const totalActualHours = projects.reduce((sum, p) => sum + (p.actualHours || 0), 0);

  // Projects needing attention (active + > 7 days in stage)
  const projectsNeedingAttention = projects
    .filter(p => ACTIVE_STATUSES.includes(p.status) && !p.isOnHold)
    .map(p => ({ ...p, daysInStage: getDaysInStage(p) }))
    .filter(p => p.daysInStage >= DAYS_THRESHOLDS.WARNING)
    .sort((a, b) => b.daysInStage - a.daysInStage);

  // On hold projects
  const holdProjects = projects.filter(p => p.isOnHold);

  // Overdue projects (past due date)
  const overdueProjects = projects.filter(p =>
    p.dueDate &&
    new Date(p.dueDate) < new Date() &&
    p.status !== 'COMPLETE'
  );

  // Projects by status for chart
  const projectsByStatus = Object.values(ProjectStatus).map(status => ({
    status,
    count: projects.filter(p => p.status === status).length,
  })).filter(s => s.count > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/20 to-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-primary">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">CRM Dashboard</h1>
                <p className="text-sm text-slate-500">Project overview and metrics</p>
              </div>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
            >
              <FolderKanban className="w-4 h-4" />
              Kanban Board
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Active Projects */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Active</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{activeProjects}</p>
            <p className="text-xs text-slate-400 mt-1">{totalProjects} total projects</p>
          </div>

          {/* On Hold */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <PauseCircle className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">On Hold</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{onHoldProjects}</p>
            <p className="text-xs text-slate-400 mt-1">{overdueProjects.length} overdue</p>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Revenue</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              ${totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-1">${pendingRevenue.toLocaleString()} pending</p>
          </div>

          {/* Hours */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Hours</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{totalActualHours}h</p>
            <p className="text-xs text-slate-400 mt-1">{totalEstimatedHours}h estimated</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects Needing Attention */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 className="font-semibold text-slate-900">Projects Needing Attention</h2>
              </div>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                {projectsNeedingAttention.length} projects
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {projectsNeedingAttention.length === 0 ? (
                <div className="px-6 py-8 text-center text-slate-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
                  <p>All projects are on track!</p>
                </div>
              ) : (
                projectsNeedingAttention.slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{project.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">
                          {project.status.replace(/_/g, ' ')}
                        </span>
                        {project.clientName && (
                          <span className="text-xs text-slate-400">• {project.clientName}</span>
                        )}
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getStatusColor(project.daysInStage)}`}>
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">{project.daysInStage} days</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* On Hold Projects */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PauseCircle className="w-5 h-5 text-slate-500" />
                <h2 className="font-semibold text-slate-900">On Hold</h2>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">
                {holdProjects.length}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {holdProjects.length === 0 ? (
                <div className="px-6 py-8 text-center text-slate-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
                  <p>No projects on hold</p>
                </div>
              ) : (
                holdProjects.slice(0, 5).map((project) => {
                  const holdDays = project.holdStartDate
                    ? Math.ceil((Date.now() - new Date(project.holdStartDate).getTime()) / (1000 * 60 * 60 * 24))
                    : 0;
                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="block px-6 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <p className="font-medium text-slate-900 truncate">{project.name}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {project.holdReason || 'No reason specified'}
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        On hold for {holdDays} days
                      </p>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Status Distribution & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Status Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Projects by Status</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {projectsByStatus.map(({ status, count }) => {
                  const percentage = Math.round((count / totalProjects) * 100) || 0;
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-28 truncate">
                        {status.replace(/_/g, ' ')}
                      </span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-700 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-500" />
                <h2 className="font-semibold text-slate-900">Recent Activity</h2>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">
                {recentActivity.length} items
              </span>
            </div>
            <div className="p-3 max-h-80 overflow-y-auto">
              <ActivityFeed activities={recentActivity} showViewAll={true} />
            </div>
          </div>
        </div>

        {/* Clients Overview */}
        {clients.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Clients</h2>
              <Link
                href="/clients"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
              {clients.slice(0, 8).map((client) => (
                <div key={client.id} className="p-4 bg-slate-50 rounded-xl">
                  <p className="font-medium text-slate-900 truncate">{client.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {client.projects.length} project{client.projects.length !== 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
