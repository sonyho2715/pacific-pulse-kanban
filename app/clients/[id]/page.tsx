import { db } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Users,
  FolderKanban,
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  DollarSign,
  Clock,
  FileText,
  Receipt,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { ClientForm } from '@/components/ClientForm';
import { ProjectStatusBadge } from '@/components/ProjectStatusBadge';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;

  const client = await db.client.findUnique({
    where: { id },
    include: {
      projects: {
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: {
            select: { notes: true, timeEntries: true },
          },
        },
      },
      contacts: {
        orderBy: { isPrimary: 'desc' },
      },
      proposals: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!client) {
    notFound();
  }

  // Calculate stats
  const totalRevenue = client.projects.reduce(
    (sum, p) => sum + (Number(p.paidAmount) || 0),
    0
  );
  const pendingRevenue = client.projects.reduce((sum, p) => {
    const quote = Number(p.quoteAmount) || 0;
    const paid = Number(p.paidAmount) || 0;
    return sum + Math.max(0, quote - paid);
  }, 0);
  const totalHours = client.projects.reduce(
    (sum, p) => sum + (p.actualHours || 0),
    0
  );
  const activeProjects = client.projects.filter(
    p => !['COMPLETE', 'BACKLOG'].includes(p.status)
  ).length;
  const completedProjects = client.projects.filter(
    p => p.status === 'COMPLETE'
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/20 to-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/clients"
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl font-bold text-white">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
                    {!client.isActive && (
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  {client.company && (
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {client.company}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ClientForm mode="edit" client={client} />
              <Link
                href={`/projects/new?clientId=${client.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
              >
                <FolderKanban className="w-4 h-4" />
                New Project
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <FolderKanban className="w-4 h-4" />
                  Projects
                </div>
                <p className="text-2xl font-bold text-slate-900">{client.projects.length}</p>
                <p className="text-xs text-slate-400">{activeProjects} active</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <DollarSign className="w-4 h-4" />
                  Revenue
                </div>
                <p className="text-2xl font-bold text-emerald-600">${totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-slate-400">${pendingRevenue.toLocaleString()} pending</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  Hours
                </div>
                <p className="text-2xl font-bold text-slate-900">{totalHours}h</p>
                <p className="text-xs text-slate-400">Total tracked</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <TrendingUp className="w-4 h-4" />
                  Completed
                </div>
                <p className="text-2xl font-bold text-slate-900">{completedProjects}</p>
                <p className="text-xs text-slate-400">
                  {client.projects.length > 0
                    ? Math.round((completedProjects / client.projects.length) * 100)
                    : 0}% success
                </p>
              </div>
            </div>

            {/* Projects */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <FolderKanban className="w-5 h-5" />
                  Projects ({client.projects.length})
                </h2>
              </div>

              {client.projects.length === 0 ? (
                <div className="px-6 py-12 text-center text-slate-500">
                  <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No projects yet</p>
                  <Link
                    href={`/projects/new?clientId=${client.id}`}
                    className="inline-flex items-center gap-2 mt-3 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Create first project
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {client.projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{project.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <ProjectStatusBadge status={project.status} />
                          {project.dueDate && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(project.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {project.quoteAmount && (
                          <p className="text-sm font-medium text-slate-900">
                            ${Number(project.quoteAmount).toLocaleString()}
                          </p>
                        )}
                        <p className="text-xs text-slate-500">
                          {project.actualHours || 0}h tracked
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Invoices */}
            {client.invoices.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Recent Invoices
                  </h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {client.invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between px-6 py-4"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(invoice.issueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            invoice.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-700'
                              : invoice.status === 'OVERDUE'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {invoice.status}
                        </span>
                        <span className="font-medium text-slate-900">
                          ${Number(invoice.total).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="font-semibold text-slate-900">Contact Information</h2>
              </div>
              <div className="p-6 space-y-4">
                {client.email && (
                  <a
                    href={`mailto:${client.email}`}
                    className="flex items-center gap-3 text-slate-600 hover:text-primary-600"
                  >
                    <Mail className="w-5 h-5 text-slate-400" />
                    {client.email}
                  </a>
                )}
                {client.phone && (
                  <a
                    href={`tel:${client.phone}`}
                    className="flex items-center gap-3 text-slate-600 hover:text-primary-600"
                  >
                    <Phone className="w-5 h-5 text-slate-400" />
                    {client.phone}
                  </a>
                )}
                {client.website && (
                  <a
                    href={client.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-slate-600 hover:text-primary-600"
                  >
                    <Globe className="w-5 h-5 text-slate-400" />
                    {new URL(client.website).hostname}
                  </a>
                )}
                {client.address && (
                  <div className="flex items-start gap-3 text-slate-600">
                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                    <span className="whitespace-pre-line">{client.address}</span>
                  </div>
                )}
                {!client.email && !client.phone && !client.website && !client.address && (
                  <p className="text-slate-400 text-sm">No contact information added</p>
                )}
              </div>
            </div>

            {/* Billing Defaults */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="font-semibold text-slate-900">Billing Defaults</h2>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Billing Type</span>
                  <span className="font-medium text-slate-900">
                    {client.defaultBillingType.charAt(0) + client.defaultBillingType.slice(1).toLowerCase()}
                  </span>
                </div>
                {client.defaultHourlyRate && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Hourly Rate</span>
                    <span className="font-medium text-slate-900">
                      ${Number(client.defaultHourlyRate).toFixed(2)}/hr
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Payment Terms</span>
                  <span className="font-medium text-slate-900">
                    Net {client.paymentTermsDays}
                  </span>
                </div>
              </div>
            </div>

            {/* Client Contacts */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Contacts</h2>
              </div>
              {client.contacts.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  No contacts added
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {client.contacts.map((contact) => (
                    <div key={contact.id} className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{contact.name}</span>
                        {contact.isPrimary && (
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                      {contact.role && (
                        <p className="text-sm text-slate-500">{contact.role}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            {contact.email}
                          </a>
                        )}
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone}`}
                            className="text-slate-500 hover:text-slate-700"
                          >
                            {contact.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            {client.notes && (
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h2 className="font-semibold text-slate-900">Notes</h2>
                </div>
                <div className="p-6">
                  <p className="text-slate-600 whitespace-pre-line">{client.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
