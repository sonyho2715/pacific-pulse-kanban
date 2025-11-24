import { db } from '@/lib/db';
import Link from 'next/link';
import {
  FileText,
  FolderKanban,
  LayoutDashboard,
  Plus,
  Eye,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Users,
} from 'lucide-react';
import { ProposalStatus } from '@prisma/client';

const STATUS_CONFIG: Record<ProposalStatus, { label: string; className: string; icon: React.ReactNode }> = {
  DRAFT: { label: 'Draft', className: 'bg-slate-100 text-slate-700', icon: <FileText className="w-3 h-3" /> },
  SENT: { label: 'Sent', className: 'bg-blue-100 text-blue-700', icon: <Send className="w-3 h-3" /> },
  VIEWED: { label: 'Viewed', className: 'bg-purple-100 text-purple-700', icon: <Eye className="w-3 h-3" /> },
  ACCEPTED: { label: 'Accepted', className: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="w-3 h-3" /> },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-700', icon: <XCircle className="w-3 h-3" /> },
  EXPIRED: { label: 'Expired', className: 'bg-amber-100 text-amber-700', icon: <Clock className="w-3 h-3" /> },
};

export default async function ProposalsPage() {
  const proposals = await db.proposal.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      client: true,
      items: true,
    },
  });

  const clients = await db.client.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });

  // Calculate stats
  const totalProposals = proposals.length;
  const pendingProposals = proposals.filter(p => ['SENT', 'VIEWED'].includes(p.status)).length;
  const acceptedProposals = proposals.filter(p => p.status === 'ACCEPTED').length;
  const totalValue = proposals.reduce((sum, p) => sum + Number(p.amount), 0);
  const acceptedValue = proposals
    .filter(p => p.status === 'ACCEPTED')
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const conversionRate = totalProposals > 0
    ? Math.round((acceptedProposals / totalProposals) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/20 to-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Proposals</h1>
                <p className="text-sm text-slate-500">Create and manage client proposals</p>
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
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Total</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{totalProposals}</p>
            <p className="text-xs text-slate-400 mt-1">{pendingProposals} pending</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Accepted</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{acceptedProposals}</p>
            <p className="text-xs text-slate-400 mt-1">{conversionRate}% rate</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Total Value</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">${totalValue.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">All proposals</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Won Value</span>
            </div>
            <p className="text-3xl font-bold text-emerald-600">${acceptedValue.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">From accepted</p>
          </div>
        </div>

        {/* Proposals List */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              All Proposals
            </h2>
            <Link
              href="/proposals/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Proposal
            </Link>
          </div>

          {proposals.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No proposals yet</p>
              <p className="text-sm mt-1">Create your first proposal to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {proposals.map((proposal) => {
                const statusConfig = STATUS_CONFIG[proposal.status];
                return (
                  <div
                    key={proposal.id}
                    className="px-6 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-slate-900">
                            {proposal.title}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${statusConfig.className}`}
                          >
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {proposal.client.name}
                          </span>
                          <span>
                            Created {new Date(proposal.createdAt).toLocaleDateString()}
                          </span>
                          {proposal.validUntil && (
                            <span
                              className={
                                new Date(proposal.validUntil) < new Date()
                                  ? 'text-red-500'
                                  : ''
                              }
                            >
                              Valid until {new Date(proposal.validUntil).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-900">
                            ${Number(proposal.amount).toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500">
                            {proposal.billingType.toLowerCase()}
                          </p>
                        </div>
                        <Link
                          href={`/proposals/${proposal.id}`}
                          className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
                        >
                          View
                        </Link>
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
