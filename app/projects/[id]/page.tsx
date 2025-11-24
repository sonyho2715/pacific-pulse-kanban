import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, GitBranch, Calendar, DollarSign, Clock, Pencil, PauseCircle } from 'lucide-react';
import { ProjectStatusBadge } from '@/components/ProjectStatusBadge';
import { PRIORITY_CONFIG } from '@/lib/constants';
import { Priority } from '@prisma/client';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await db.project.findUnique({
    where: { id: params.id },
    include: {
      notes: {
        orderBy: { createdAt: 'desc' },
      },
      statusHistory: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Board
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {project.name}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <ProjectStatusBadge status={project.status} />
                {project.priority && (
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium ${PRIORITY_CONFIG[project.priority as Priority].bgColor} ${PRIORITY_CONFIG[project.priority as Priority].color}`}>
                    {PRIORITY_CONFIG[project.priority as Priority].icon} {PRIORITY_CONFIG[project.priority as Priority].label}
                  </span>
                )}
                {project.isOnHold && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium bg-amber-100 text-amber-700">
                    <PauseCircle className="w-3 h-3" /> On Hold
                  </span>
                )}
              </div>
            </div>
            <Link
              href={`/projects/${project.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors font-medium"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Link>
          </div>

          {project.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700">{project.description}</p>
            </div>
          )}

          {project.initialPrompt && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Initial Claude Prompt
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap font-mono text-sm">
                {project.initialPrompt}
              </p>
            </div>
          )}

          {project.requirements && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{project.requirements}</p>
            </div>
          )}

          {/* Next Action Steps - CRM Feature */}
          {project.nextActionSteps && (
            <div className="mb-6 bg-gradient-to-br from-primary-50 to-purple-50 border-2 border-primary-200/60 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Next Action Steps
              </h2>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {project.nextActionSteps}
              </p>
            </div>
          )}

          {/* Status Timeline - CRM Feature */}
          {project.statusHistory.length > 0 && (
            <div className="mb-6 bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Status Timeline
              </h2>
              <div className="space-y-3">
                {project.statusHistory.map((history, index) => {
                  const nextHistory = project.statusHistory[index + 1];
                  const endTime = nextHistory ? new Date(nextHistory.createdAt) : new Date();
                  const startTime = new Date(history.createdAt);
                  const daysInStage = Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24));

                  return (
                    <div key={history.id} className="flex items-start gap-4 pb-3 border-b border-slate-200 last:border-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {history.fromStatus && (
                            <span className="text-sm text-slate-500">
                              {history.fromStatus.replace(/_/g, ' ')}
                            </span>
                          )}
                          {history.fromStatus && <span className="text-slate-400">→</span>}
                          <span className="font-medium text-slate-900">
                            {history.toStatus.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-slate-500">
                            {new Date(history.createdAt).toLocaleDateString()}
                          </span>
                          {!nextHistory && (
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                              Current ({daysInStage} days)
                            </span>
                          )}
                          {nextHistory && daysInStage > 0 && (
                            <span className="text-xs text-slate-400">
                              {daysInStage} {daysInStage === 1 ? 'day' : 'days'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Client Info */}
            {project.clientName && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Client</h3>
                <p className="text-gray-900">{project.clientName}</p>
              </div>
            )}

            {/* Estimates */}
            {(project.estimatedHours || project.estimatedBudget) && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Estimates</h3>
                <div className="flex gap-4">
                  {project.estimatedHours && (
                    <div className="flex items-center gap-1 text-gray-900">
                      <Clock className="w-4 h-4" />
                      {project.estimatedHours}h
                    </div>
                  )}
                  {project.estimatedBudget && (
                    <div className="flex items-center gap-1 text-gray-900">
                      <DollarSign className="w-4 h-4" />
                      ${project.estimatedBudget.toString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actuals */}
            {(project.actualHours || project.actualCost) && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Actuals</h3>
                <div className="flex gap-4">
                  {project.actualHours && (
                    <div className="flex items-center gap-1 text-gray-900">
                      <Clock className="w-4 h-4" />
                      {project.actualHours}h
                    </div>
                  )}
                  {project.actualCost && (
                    <div className="flex items-center gap-1 text-gray-900">
                      <DollarSign className="w-4 h-4" />
                      ${project.actualCost.toString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment */}
            {(project.quoteAmount || project.paidAmount) && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Payment</h3>
                <div className="space-y-1">
                  {project.quoteAmount && (
                    <p className="text-gray-900">
                      Quote: ${project.quoteAmount.toString()}
                    </p>
                  )}
                  {project.paidAmount && (
                    <p className="text-green-600 font-medium">
                      Paid: ${project.paidAmount.toString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Dates */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Dates</h3>
              <div className="space-y-1">
                {project.startDate && (
                  <div className="flex items-center gap-1 text-gray-900">
                    <Calendar className="w-4 h-4" />
                    Started: {new Date(project.startDate).toLocaleDateString()}
                  </div>
                )}
                {project.dueDate && (
                  <div className="flex items-center gap-1 text-gray-900">
                    <Calendar className="w-4 h-4" />
                    Due: {new Date(project.dueDate).toLocaleDateString()}
                  </div>
                )}
                {project.completionDate && (
                  <div className="flex items-center gap-1 text-gray-900">
                    <Calendar className="w-4 h-4" />
                    Completed: {new Date(project.completionDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {/* URLs */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Links</h3>
              <div className="space-y-2">
                {project.repositoryUrl && (
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <GitBranch className="w-4 h-4" />
                    Repository
                  </a>
                )}
                {project.deploymentUrl && (
                  <a
                    href={project.deploymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Live Site
                  </a>
                )}
                {project.projectUrl && (
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Project URL
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {project.notes.length > 0 && (
            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <div className="space-y-4">
                {project.notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
