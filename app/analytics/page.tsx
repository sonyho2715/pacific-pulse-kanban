import { db } from '@/lib/db';
import Link from 'next/link';
import {
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  PieChart,
} from 'lucide-react';

export default async function AnalyticsPage() {
  // Get current date info
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const thisYearStart = new Date(now.getFullYear(), 0, 1);

  // Fetch all data
  const projects = await db.project.findMany({
    include: {
      client: true,
      timeEntries: true,
    },
  });

  const clients = await db.client.findMany({
    include: {
      projects: true,
    },
  });

  const timeEntries = await db.timeEntry.findMany({
    include: {
      project: true,
    },
  });

  const invoices = await db.invoice.findMany({
    include: {
      client: true,
      project: true,
    },
  });

  // Calculate revenue metrics
  const totalRevenue = projects.reduce(
    (sum, p) => sum + (Number(p.paidAmount) || 0),
    0
  );

  const thisMonthRevenue = projects
    .filter(p => p.paymentDate && new Date(p.paymentDate) >= thisMonthStart)
    .reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);

  const lastMonthRevenue = projects
    .filter(
      p =>
        p.paymentDate &&
        new Date(p.paymentDate) >= lastMonthStart &&
        new Date(p.paymentDate) <= lastMonthEnd
    )
    .reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);

  const yearToDateRevenue = projects
    .filter(p => p.paymentDate && new Date(p.paymentDate) >= thisYearStart)
    .reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);

  const pendingRevenue = projects.reduce((sum, p) => {
    const quote = Number(p.quoteAmount) || 0;
    const paid = Number(p.paidAmount) || 0;
    return sum + Math.max(0, quote - paid);
  }, 0);

  const revenueChange =
    lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : thisMonthRevenue > 0
      ? 100
      : 0;

  // Calculate time metrics
  const totalHours = timeEntries.reduce(
    (sum, e) => sum + (e.duration || 0) / 60,
    0
  );

  const thisMonthHours = timeEntries
    .filter(e => new Date(e.startTime) >= thisMonthStart)
    .reduce((sum, e) => sum + (e.duration || 0) / 60, 0);

  const billableHours = timeEntries
    .filter(e => e.isBillable)
    .reduce((sum, e) => sum + (e.duration || 0) / 60, 0);

  const billablePercentage =
    totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0;

  // Calculate average hourly rate
  const billableValue = timeEntries
    .filter(e => e.isBillable && e.duration && e.hourlyRate)
    .reduce((sum, e) => sum + ((e.duration || 0) / 60) * Number(e.hourlyRate), 0);
  const avgHourlyRate =
    billableHours > 0 ? Math.round(billableValue / billableHours) : 0;

  // Revenue by client
  const revenueByClient = clients
    .map(client => ({
      name: client.name,
      revenue: client.projects.reduce(
        (sum, p) => sum + (Number(p.paidAmount) || 0),
        0
      ),
      projectCount: client.projects.length,
    }))
    .filter(c => c.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Revenue by month (last 6 months)
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const revenue = projects
      .filter(
        p =>
          p.paymentDate &&
          new Date(p.paymentDate) >= month &&
          new Date(p.paymentDate) <= monthEnd
      )
      .reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
    return {
      month: month.toLocaleDateString('en-US', { month: 'short' }),
      revenue,
    };
  }).reverse();

  const maxMonthlyRevenue = Math.max(...monthlyRevenue.map(m => m.revenue), 1);

  // Project status distribution
  const projectsByStatus = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Invoice stats
  const paidInvoices = invoices.filter(i => i.status === 'PAID');
  const overdueInvoices = invoices.filter(i => i.status === 'OVERDUE');
  const pendingInvoices = invoices.filter(i => ['SENT', 'VIEWED'].includes(i.status));

  const totalInvoiced = invoices.reduce(
    (sum, i) => sum + Number(i.total),
    0
  );
  const totalPaid = paidInvoices.reduce(
    (sum, i) => sum + Number(i.total),
    0
  );

  // Top projects by revenue
  const topProjects = [...projects]
    .sort((a, b) => (Number(b.paidAmount) || 0) - (Number(a.paidAmount) || 0))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/20 to-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Financial Analytics</h1>
                <p className="text-sm text-slate-500">Revenue and performance metrics</p>
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
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              {revenueChange !== 0 && (
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    revenueChange > 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {revenueChange > 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {Math.abs(revenueChange)}%
                </div>
              )}
            </div>
            <p className="text-3xl font-bold text-slate-900">
              ${totalRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 mt-1">Total Revenue</p>
          </div>

          {/* This Month */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              ${thisMonthRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 mt-1">This Month</p>
          </div>

          {/* Pending Revenue */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              ${pendingRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 mt-1">Pending Revenue</p>
          </div>

          {/* Avg Hourly Rate */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">${avgHourlyRate}</p>
            <p className="text-sm text-slate-500 mt-1">Avg Hourly Rate</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">Monthly Revenue</h2>
            </div>
            <div className="p-6">
              <div className="flex items-end gap-4 h-48">
                {monthlyRevenue.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col justify-end h-36">
                      <div
                        className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all"
                        style={{
                          height: `${(m.revenue / maxMonthlyRevenue) * 100}%`,
                          minHeight: m.revenue > 0 ? '8px' : '0',
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{m.month}</span>
                    <span className="text-xs font-medium text-slate-700">
                      ${m.revenue >= 1000 ? `${(m.revenue / 1000).toFixed(1)}k` : m.revenue}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Time Stats */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">Time Overview</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-500">Total Hours</span>
                  <span className="font-semibold text-slate-900">
                    {Math.round(totalHours)}h
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-500">Billable Hours</span>
                  <span className="font-semibold text-slate-900">
                    {Math.round(billableHours)}h ({billablePercentage}%)
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${billablePercentage}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-500">This Month</span>
                  <span className="font-semibold text-slate-900">
                    {Math.round(thisMonthHours)}h
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${totalHours > 0 ? Math.min((thisMonthHours / totalHours) * 100, 100) : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Billable Value</span>
                  <span className="text-lg font-bold text-emerald-600">
                    ${Math.round(billableValue).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue by Client */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Revenue by Client
              </h2>
            </div>
            {revenueByClient.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-500">
                <PieChart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No revenue data yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {revenueByClient.map((client, i) => (
                  <div key={i} className="px-6 py-3 flex items-center gap-4">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm font-medium text-slate-600">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{client.name}</p>
                      <p className="text-xs text-slate-500">{client.projectCount} projects</p>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                          style={{
                            width: `${(client.revenue / revenueByClient[0].revenue) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="font-semibold text-slate-900">
                      ${client.revenue.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Projects */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <FolderKanban className="w-5 h-5" />
                Top Projects by Revenue
              </h2>
            </div>
            {topProjects.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-500">
                <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No projects with revenue yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {topProjects.map((project, i) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="px-6 py-3 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-sm font-medium text-emerald-600">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{project.name}</p>
                      <p className="text-xs text-slate-500">
                        {project.client?.name || project.clientName || 'No client'}
                      </p>
                    </div>
                    <span className="font-semibold text-emerald-600">
                      ${(Number(project.paidAmount) || 0).toLocaleString()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Invoice Overview */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Invoice Overview
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-2xl font-bold text-slate-900">{invoices.length}</p>
                <p className="text-sm text-slate-500">Total Invoices</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl">
                <p className="text-2xl font-bold text-emerald-600">{paidInvoices.length}</p>
                <p className="text-sm text-slate-500">Paid</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl">
                <p className="text-2xl font-bold text-amber-600">{pendingInvoices.length}</p>
                <p className="text-sm text-slate-500">Pending</p>
              </div>
              <div className="p-4 bg-red-50 rounded-xl">
                <p className="text-2xl font-bold text-red-600">{overdueInvoices.length}</p>
                <p className="text-sm text-slate-500">Overdue</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">
                  {totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0}%
                </p>
                <p className="text-sm text-slate-500">Collection Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
