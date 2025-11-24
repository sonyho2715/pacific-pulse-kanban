import { db } from '@/lib/db';
import Link from 'next/link';
import {
  Zap,
  FolderKanban,
  LayoutDashboard,
  Plus,
  Play,
  Pause,
  Mail,
  Bell,
  FileText,
  RefreshCw,
  Clock,
  Settings,
  Activity,
} from 'lucide-react';
import { AutomationTrigger, AutomationAction } from '@prisma/client';
import { AutomationForm } from '@/components/AutomationForm';

const TRIGGER_CONFIG: Record<AutomationTrigger, { label: string; icon: React.ReactNode; description: string }> = {
  STATUS_CHANGED: { label: 'Status Changed', icon: <RefreshCw className="w-4 h-4" />, description: 'When a project status changes' },
  DUE_DATE_APPROACHING: { label: 'Due Date Approaching', icon: <Clock className="w-4 h-4" />, description: 'When due date is within days' },
  PAYMENT_OVERDUE: { label: 'Payment Overdue', icon: <Clock className="w-4 h-4" />, description: 'When payment becomes overdue' },
  PROJECT_CREATED: { label: 'Project Created', icon: <FileText className="w-4 h-4" />, description: 'When a new project is created' },
  TIME_LOGGED: { label: 'Time Logged', icon: <Clock className="w-4 h-4" />, description: 'When time is logged' },
  INVOICE_SENT: { label: 'Invoice Sent', icon: <Mail className="w-4 h-4" />, description: 'When an invoice is sent' },
};

const ACTION_CONFIG: Record<AutomationAction, { label: string; icon: React.ReactNode }> = {
  SEND_EMAIL: { label: 'Send Email', icon: <Mail className="w-4 h-4" /> },
  CHANGE_STATUS: { label: 'Change Status', icon: <RefreshCw className="w-4 h-4" /> },
  CREATE_TASK: { label: 'Create Task', icon: <FileText className="w-4 h-4" /> },
  SEND_NOTIFICATION: { label: 'Send Notification', icon: <Bell className="w-4 h-4" /> },
  UPDATE_FIELD: { label: 'Update Field', icon: <Settings className="w-4 h-4" /> },
};

export default async function AutomationsPage() {
  const automations = await db.automation.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      logs: {
        take: 5,
        orderBy: { executedAt: 'desc' },
      },
    },
  });

  // Get recent logs
  const recentLogs = await db.automationLog.findMany({
    take: 20,
    orderBy: { executedAt: 'desc' },
    include: {
      automation: true,
    },
  });

  // Stats
  const totalAutomations = automations.length;
  const activeAutomations = automations.filter(a => a.isActive).length;
  const totalRuns = automations.reduce((sum, a) => sum + a.runCount, 0);
  const successfulRuns = recentLogs.filter(l => l.success).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/20 to-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Automations</h1>
                <p className="text-sm text-slate-500">Automate workflows and notifications</p>
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
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Total</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{totalAutomations}</p>
            <p className="text-xs text-slate-400 mt-1">Automations</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Play className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Active</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{activeAutomations}</p>
            <p className="text-xs text-slate-400 mt-1">Running now</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Total Runs</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{totalRuns}</p>
            <p className="text-xs text-slate-400 mt-1">All time</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Success Rate</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {recentLogs.length > 0 ? Math.round((successfulRuns / recentLogs.length) * 100) : 100}%
            </p>
            <p className="text-xs text-slate-400 mt-1">Recent runs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Automations List */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Automations
              </h2>
              <AutomationForm />
            </div>

            {automations.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-500">
                <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No automations yet</p>
                <p className="text-sm mt-1">Create your first automation to streamline workflows</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {automations.map((automation) => {
                  const trigger = TRIGGER_CONFIG[automation.trigger];
                  const action = ACTION_CONFIG[automation.action];

                  return (
                    <div
                      key={automation.id}
                      className="px-6 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-slate-900">
                              {automation.name}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                                automation.isActive
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {automation.isActive ? (
                                <>
                                  <Play className="w-3 h-3" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <Pause className="w-3 h-3" />
                                  Paused
                                </>
                              )}
                            </span>
                          </div>

                          {automation.description && (
                            <p className="text-sm text-slate-500 mb-2">
                              {automation.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-slate-400">When:</span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                                {trigger.icon}
                                {trigger.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-slate-400">Then:</span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded">
                                {action.icon}
                                {action.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-900">
                            {automation.runCount} runs
                          </p>
                          {automation.lastRunAt && (
                            <p className="text-xs text-slate-500">
                              Last: {new Date(automation.lastRunAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </h2>
            </div>

            {recentLogs.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-500">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No activity yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {recentLogs.map((log) => (
                  <div key={log.id} className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 mt-2 rounded-full ${
                          log.success ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {log.automation.name}
                        </p>
                        {log.message && (
                          <p className="text-xs text-slate-500 truncate">{log.message}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(log.executedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Templates Section */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Automation Templates</h2>
            <p className="text-sm text-slate-500 mt-1">Quick start with pre-built automations</p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: 'Project Status Notification',
                trigger: 'STATUS_CHANGED',
                action: 'SEND_NOTIFICATION',
                description: 'Notify when project status changes',
              },
              {
                name: 'Due Date Reminder',
                trigger: 'DUE_DATE_APPROACHING',
                action: 'SEND_EMAIL',
                description: 'Email reminder 3 days before due',
              },
              {
                name: 'Payment Overdue Alert',
                trigger: 'PAYMENT_OVERDUE',
                action: 'SEND_EMAIL',
                description: 'Alert when payment is overdue',
              },
            ].map((template, i) => (
              <div
                key={i}
                className="p-4 border border-slate-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-2">
                  {TRIGGER_CONFIG[template.trigger as AutomationTrigger].icon}
                  <span className="font-medium text-slate-900">{template.name}</span>
                </div>
                <p className="text-sm text-slate-500">{template.description}</p>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                    {TRIGGER_CONFIG[template.trigger as AutomationTrigger].label}
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded">
                    {ACTION_CONFIG[template.action as AutomationAction].label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
