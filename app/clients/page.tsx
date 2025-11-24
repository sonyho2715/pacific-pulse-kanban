import { db } from '@/lib/db';
import Link from 'next/link';
import {
  Users,
  FolderKanban,
  LayoutDashboard,
  Plus,
  Building2,
  Mail,
  Phone,
  Globe,
  DollarSign,
  FolderOpen,
  MoreVertical,
} from 'lucide-react';
import { ClientForm } from '@/components/ClientForm';

export default async function ClientsPage() {
  const clients = await db.client.findMany({
    orderBy: { name: 'asc' },
    include: {
      projects: {
        select: {
          id: true,
          status: true,
          quoteAmount: true,
          paidAmount: true,
        },
      },
      contacts: true,
      _count: {
        select: {
          projects: true,
          proposals: true,
          invoices: true,
        },
      },
    },
  });

  // Calculate totals
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.isActive).length;
  const totalRevenue = clients.reduce(
    (sum, c) => sum + c.projects.reduce((s, p) => s + (Number(p.paidAmount) || 0), 0),
    0
  );
  const totalProjects = clients.reduce((sum, c) => sum + c._count.projects, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/20 to-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
                <p className="text-sm text-slate-500">Manage your client relationships</p>
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
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Total Clients</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{totalClients}</p>
            <p className="text-xs text-slate-400 mt-1">{activeClients} active</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Total Projects</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{totalProjects}</p>
            <p className="text-xs text-slate-400 mt-1">Across all clients</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Total Revenue</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              ${totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-1">All time</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Avg per Client</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              ${totalClients > 0 ? Math.round(totalRevenue / totalClients).toLocaleString() : 0}
            </p>
            <p className="text-xs text-slate-400 mt-1">Revenue average</p>
          </div>
        </div>

        {/* Add Client Button + List */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              All Clients
            </h2>
            <ClientForm mode="create" />
          </div>

          {clients.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No clients yet</p>
              <p className="text-sm mt-1">Add your first client to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {clients.map((client) => {
                const clientRevenue = client.projects.reduce(
                  (sum, p) => sum + (Number(p.paidAmount) || 0),
                  0
                );
                const activeProjectCount = client.projects.filter(
                  p => !['COMPLETE', 'BACKLOG'].includes(p.status)
                ).length;

                return (
                  <div
                    key={client.id}
                    className="px-6 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Link
                            href={`/clients/${client.id}`}
                            className="font-semibold text-slate-900 hover:text-primary-600 transition-colors"
                          >
                            {client.name}
                          </Link>
                          {!client.isActive && (
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                              Inactive
                            </span>
                          )}
                          {client.company && (
                            <span className="text-sm text-slate-500 flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {client.company}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          {client.email && (
                            <a href={`mailto:${client.email}`} className="flex items-center gap-1 hover:text-primary-600">
                              <Mail className="w-3 h-3" />
                              {client.email}
                            </a>
                          )}
                          {client.phone && (
                            <a href={`tel:${client.phone}`} className="flex items-center gap-1 hover:text-primary-600">
                              <Phone className="w-3 h-3" />
                              {client.phone}
                            </a>
                          )}
                          {client.website && (
                            <a
                              href={client.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-primary-600"
                            >
                              <Globe className="w-3 h-3" />
                              Website
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {client._count.projects} projects
                          </p>
                          <p className="text-xs text-slate-500">
                            {activeProjectCount} active
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-emerald-600">
                            ${clientRevenue.toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500">Revenue</p>
                        </div>
                        <ClientForm mode="edit" client={client} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
