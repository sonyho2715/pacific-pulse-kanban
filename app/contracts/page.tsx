import { db } from '@/lib/db';
import Link from 'next/link';
import {
  FileSignature,
  FolderKanban,
  LayoutDashboard,
  Plus,
  FileText,
  Send,
  CheckCircle2,
  Clock,
  Users,
  Calendar,
} from 'lucide-react';
import { ContractStatus } from '@prisma/client';

const STATUS_CONFIG: Record<ContractStatus, { label: string; className: string; icon: React.ReactNode }> = {
  DRAFT: { label: 'Draft', className: 'bg-slate-100 text-slate-700', icon: <FileText className="w-3 h-3" /> },
  SENT: { label: 'Sent', className: 'bg-blue-100 text-blue-700', icon: <Send className="w-3 h-3" /> },
  SIGNED: { label: 'Signed', className: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="w-3 h-3" /> },
  ACTIVE: { label: 'Active', className: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-3 h-3" /> },
  COMPLETED: { label: 'Completed', className: 'bg-purple-100 text-purple-700', icon: <CheckCircle2 className="w-3 h-3" /> },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-700', icon: <Clock className="w-3 h-3" /> },
};

export default async function ContractsPage() {
  const contracts = await db.contract.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      client: true,
    },
  });

  // Calculate stats
  const totalContracts = contracts.length;
  const activeContracts = contracts.filter(c => c.status === 'ACTIVE').length;
  const pendingContracts = contracts.filter(c => ['DRAFT', 'SENT'].includes(c.status)).length;
  const signedContracts = contracts.filter(c => ['SIGNED', 'ACTIVE', 'COMPLETED'].includes(c.status)).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/20 to-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <FileSignature className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Contracts</h1>
                <p className="text-sm text-slate-500">Manage client contracts and agreements</p>
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
                <FileSignature className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Total</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{totalContracts}</p>
            <p className="text-xs text-slate-400 mt-1">All contracts</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Active</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{activeContracts}</p>
            <p className="text-xs text-slate-400 mt-1">Currently active</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Pending</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{pendingContracts}</p>
            <p className="text-xs text-slate-400 mt-1">Awaiting signature</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Signed</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{signedContracts}</p>
            <p className="text-xs text-slate-400 mt-1">Total signed</p>
          </div>
        </div>

        {/* Contracts List */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <FileSignature className="w-5 h-5" />
              All Contracts
            </h2>
            <Link
              href="/contracts/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Contract
            </Link>
          </div>

          {contracts.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500">
              <FileSignature className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No contracts yet</p>
              <p className="text-sm mt-1">Create your first contract to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {contracts.map((contract) => {
                const statusConfig = STATUS_CONFIG[contract.status];
                return (
                  <div
                    key={contract.id}
                    className="px-6 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-slate-900">
                            {contract.title}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${statusConfig.className}`}
                          >
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                          {contract.type && (
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              {contract.type}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {contract.client.name}
                          </span>
                          <span>
                            Created {new Date(contract.createdAt).toLocaleDateString()}
                          </span>
                          {contract.startDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(contract.startDate).toLocaleDateString()}
                              {contract.endDate && ` - ${new Date(contract.endDate).toLocaleDateString()}`}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {contract.signedAt && (
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Signed</p>
                            <p className="text-sm font-medium text-emerald-600">
                              {new Date(contract.signedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        <Link
                          href={`/contracts/${contract.id}`}
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
