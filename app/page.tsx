import { getProjects } from './actions';
import { KanbanBoard } from '@/components/KanbanBoard';
import { FilterBar } from '@/components/FilterBar';
import { Plus, Sparkles, LayoutDashboard, Download } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  const projects = await getProjects();

  // Calculate quick stats
  const onHoldCount = projects.filter(p => p.isOnHold).length;
  const activeCount = projects.filter(p => !['COMPLETE', 'DEPLOYED', 'MONITORING', 'CLIENT_DELIVERY'].includes(p.status)).length;

  return (
    <div className="min-h-screen">
      {/* Hero Header with Gradient */}
      <div className="bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 border-b border-slate-200/60">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl flex items-center justify-center shadow-primary">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                  Pacific Pulse AI Projects
                </h1>
              </div>
              <p className="text-lg text-slate-600 max-w-2xl">
                Complete CRM for managing AI projects, clients, and workflows
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span>{activeCount} active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>{onHoldCount} on hold</span>
                </div>
                <span className="text-slate-400">|</span>
                <span>{projects.length} total projects</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-medium"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-5 py-2.5 rounded-xl shadow-primary hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                New Project
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <KanbanBoard projects={projects} />

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-slate-500 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-200/60 shadow-sm">
            <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <span>Drag and drop projects between columns to update their status</span>
          </div>
        </div>
      </div>
    </div>
  );
}
