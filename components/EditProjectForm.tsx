'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project, Priority, Client, Tag } from '@prisma/client';
import { updateProject, toggleProjectHold, updateProjectPriority, addNote, deleteProject } from '@/app/actions';
import { PRIORITY_CONFIG, KANBAN_COLUMNS } from '@/lib/constants';
import { Save, Loader2, PauseCircle, Play, Trash2, Plus, X } from 'lucide-react';

type ProjectWithRelations = Project & {
  client?: Client | null;
  tags?: { tag: Tag }[];
  notes?: { id: string; content: string; createdAt: Date }[];
};

interface EditProjectFormProps {
  project: ProjectWithRelations;
  clients: Client[];
  tags: Tag[];
}

export function EditProjectForm({ project, clients, tags }: EditProjectFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [holdReason, setHoldReason] = useState(project.holdReason || '');
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || undefined,
      initialPrompt: formData.get('initialPrompt') as string || undefined,
      requirements: formData.get('requirements') as string || undefined,
      nextActionSteps: formData.get('nextActionSteps') as string || undefined,
      clientName: formData.get('clientName') as string || undefined,
      projectUrl: formData.get('projectUrl') as string || undefined,
      repositoryUrl: formData.get('repositoryUrl') as string || undefined,
      deploymentUrl: formData.get('deploymentUrl') as string || undefined,
      estimatedHours: formData.get('estimatedHours')
        ? parseInt(formData.get('estimatedHours') as string)
        : undefined,
      estimatedBudget: formData.get('estimatedBudget')
        ? parseFloat(formData.get('estimatedBudget') as string)
        : undefined,
      actualHours: formData.get('actualHours')
        ? parseInt(formData.get('actualHours') as string)
        : undefined,
      actualCost: formData.get('actualCost')
        ? parseFloat(formData.get('actualCost') as string)
        : undefined,
      quoteAmount: formData.get('quoteAmount')
        ? parseFloat(formData.get('quoteAmount') as string)
        : undefined,
      paidAmount: formData.get('paidAmount')
        ? parseFloat(formData.get('paidAmount') as string)
        : undefined,
    };

    const result = await updateProject(project.id, data);

    if (result.success) {
      setSuccess('Project updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.error || 'Failed to update project');
    }
    setIsSubmitting(false);
  }

  async function handleToggleHold() {
    const result = await toggleProjectHold(project.id, !project.isOnHold, holdReason);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error || 'Failed to update hold status');
    }
  }

  async function handlePriorityChange(priority: Priority) {
    const result = await updateProjectPriority(project.id, priority);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error || 'Failed to update priority');
    }
  }

  async function handleAddNote() {
    if (!newNote.trim()) return;
    setIsAddingNote(true);

    const result = await addNote({ projectId: project.id, content: newNote });
    if (result.success) {
      setNewNote('');
      router.refresh();
    } else {
      setError(result.error || 'Failed to add note');
    }
    setIsAddingNote(false);
  }

  async function handleDelete() {
    const result = await deleteProject(project.id);
    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Failed to delete project');
    }
  }

  return (
    <div className="space-y-8">
      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Quick Actions Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          {/* Priority Selector */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
            <div className="flex gap-2">
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handlePriorityChange(key as Priority)}
                  className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                    project.priority === key
                      ? `${config.bgColor} ${config.color} border-current ring-2 ring-offset-1`
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {config.icon} {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hold Toggle */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 mb-2">Hold Status</label>
            <div className="flex gap-2">
              {project.isOnHold ? (
                <button
                  type="button"
                  onClick={handleToggleHold}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors font-medium"
                >
                  <Play className="w-4 h-4" />
                  Resume Project
                </button>
              ) : (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={holdReason}
                    onChange={(e) => setHoldReason(e.target.value)}
                    placeholder="Hold reason..."
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleToggleHold}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors font-medium"
                  >
                    <PauseCircle className="w-4 h-4" />
                    Hold
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Project Details</h3>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={project.name}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={project.description || ''}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-slate-700 mb-1">
              Client Name
            </label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              defaultValue={project.clientName || ''}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
              Current Status
            </label>
            <div className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 font-medium">
              {project.status.replace(/_/g, ' ')}
            </div>
          </div>
        </div>

        {/* URLs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="repositoryUrl" className="block text-sm font-medium text-slate-700 mb-1">
              Repository URL
            </label>
            <input
              type="url"
              id="repositoryUrl"
              name="repositoryUrl"
              defaultValue={project.repositoryUrl || ''}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="https://github.com/..."
            />
          </div>

          <div>
            <label htmlFor="deploymentUrl" className="block text-sm font-medium text-slate-700 mb-1">
              Deployment URL
            </label>
            <input
              type="url"
              id="deploymentUrl"
              name="deploymentUrl"
              defaultValue={project.deploymentUrl || ''}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label htmlFor="projectUrl" className="block text-sm font-medium text-slate-700 mb-1">
              Project URL
            </label>
            <input
              type="url"
              id="projectUrl"
              name="projectUrl"
              defaultValue={project.projectUrl || ''}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Estimates & Actuals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="estimatedHours" className="block text-sm font-medium text-slate-700 mb-1">
              Est. Hours
            </label>
            <input
              type="number"
              id="estimatedHours"
              name="estimatedHours"
              min="0"
              defaultValue={project.estimatedHours || ''}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label htmlFor="actualHours" className="block text-sm font-medium text-slate-700 mb-1">
              Actual Hours
            </label>
            <input
              type="number"
              id="actualHours"
              name="actualHours"
              min="0"
              defaultValue={project.actualHours || ''}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label htmlFor="estimatedBudget" className="block text-sm font-medium text-slate-700 mb-1">
              Est. Budget ($)
            </label>
            <input
              type="number"
              id="estimatedBudget"
              name="estimatedBudget"
              min="0"
              step="0.01"
              defaultValue={project.estimatedBudget?.toString() || ''}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label htmlFor="actualCost" className="block text-sm font-medium text-slate-700 mb-1">
              Actual Cost ($)
            </label>
            <input
              type="number"
              id="actualCost"
              name="actualCost"
              min="0"
              step="0.01"
              defaultValue={project.actualCost?.toString() || ''}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Payment */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="quoteAmount" className="block text-sm font-medium text-slate-700 mb-1">
              Quote Amount ($)
            </label>
            <input
              type="number"
              id="quoteAmount"
              name="quoteAmount"
              min="0"
              step="0.01"
              defaultValue={project.quoteAmount?.toString() || ''}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label htmlFor="paidAmount" className="block text-sm font-medium text-slate-700 mb-1">
              Paid Amount ($)
            </label>
            <input
              type="number"
              id="paidAmount"
              name="paidAmount"
              min="0"
              step="0.01"
              defaultValue={project.paidAmount?.toString() || ''}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Next Action Steps */}
        <div>
          <label htmlFor="nextActionSteps" className="block text-sm font-medium text-slate-700 mb-1">
            Next Action Steps
          </label>
          <textarea
            id="nextActionSteps"
            name="nextActionSteps"
            rows={3}
            defaultValue={project.nextActionSteps || ''}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="What needs to be done next..."
          />
        </div>

        {/* Initial Prompt */}
        <div>
          <label htmlFor="initialPrompt" className="block text-sm font-medium text-slate-700 mb-1">
            Initial Claude Prompt
          </label>
          <textarea
            id="initialPrompt"
            name="initialPrompt"
            rows={4}
            defaultValue={project.initialPrompt || ''}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
          />
        </div>

        {/* Requirements */}
        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-slate-700 mb-1">
            Requirements
          </label>
          <textarea
            id="requirements"
            name="requirements"
            rows={4}
            defaultValue={project.requirements || ''}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50 font-medium transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Add Note */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Add Note</h3>
        <div className="flex gap-3">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            rows={2}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            type="button"
            onClick={handleAddNote}
            disabled={isAddingNote || !newNote.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 disabled:opacity-50 font-medium transition-colors h-fit"
          >
            {isAddingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add
          </button>
        </div>

        {/* Existing Notes */}
        {project.notes && project.notes.length > 0 && (
          <div className="mt-4 space-y-2">
            {project.notes.map((note) => (
              <div key={note.id} className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-700">{note.content}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(note.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-red-500 uppercase tracking-wide mb-4">Danger Zone</h3>
        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Project
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <p className="text-sm text-red-600">Are you sure? This cannot be undone.</p>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Confirm Delete
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
