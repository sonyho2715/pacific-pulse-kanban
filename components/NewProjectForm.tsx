'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '@/app/actions';
import { generateProjectPlan, ProjectPlan } from '@/app/ai-actions';
import { Sparkles, Loader2 } from 'lucide-react';

export function NewProjectForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<ProjectPlan | null>(null);
  const [showPlan, setShowPlan] = useState(false);

  async function handleGeneratePlan() {
    const form = document.querySelector('form') as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;

    if (!name.trim()) {
      setError('Please enter a project name first');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a project description first');
      return;
    }

    setIsGeneratingPlan(true);
    setError(null);

    const result = await generateProjectPlan({ name, description });

    setIsGeneratingPlan(false);

    if (result.success && result.data) {
      setGeneratedPlan(result.data);
      setShowPlan(true);

      // Auto-fill estimatedHours and estimatedBudget
      const hoursInput = form.elements.namedItem('estimatedHours') as HTMLInputElement;
      const budgetInput = form.elements.namedItem('estimatedBudget') as HTMLInputElement;

      if (hoursInput) {
        hoursInput.value = result.data.totalEstimatedHours.toString();
      }
      if (budgetInput) {
        budgetInput.value = result.data.suggestedBudget.toString();
      }
    } else {
      setError(result.error || 'Failed to generate plan');
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || undefined,
      initialPrompt: formData.get('initialPrompt') as string || undefined,
      clientName: formData.get('clientName') as string || undefined,
      estimatedHours: formData.get('estimatedHours')
        ? parseInt(formData.get('estimatedHours') as string)
        : undefined,
      estimatedBudget: formData.get('estimatedBudget')
        ? parseFloat(formData.get('estimatedBudget') as string)
        : undefined,
    };

    const result = await createProject(data);

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Failed to create project');
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Project Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="My Awesome Project"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Brief description of the project..."
        />

        <button
          type="button"
          onClick={handleGeneratePlan}
          disabled={isGeneratingPlan}
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-primary-600 text-white rounded-lg hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-medium transition-all duration-300"
        >
          {isGeneratingPlan ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating AI Plan...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate AI Implementation Plan
            </>
          )}
        </button>
      </div>

      {generatedPlan && showPlan && (
        <div className="bg-gradient-to-br from-purple-50 to-primary-50 border-2 border-purple-200/60 rounded-2xl p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI-Generated Implementation Plan
              </h3>
              <p className="text-sm text-slate-600 mt-1">{generatedPlan.overview}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPlan(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {generatedPlan.steps.map((step) => (
              <div
                key={step.step}
                className="bg-white border border-purple-200/60 rounded-xl p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                        {step.step}
                      </span>
                      <h4 className="font-semibold text-slate-900">{step.title}</h4>
                    </div>
                    <p className="text-sm text-slate-600 mt-2 ml-8">{step.description}</p>
                  </div>
                  {step.estimatedHours && (
                    <span className="inline-flex items-center text-xs bg-blue-50 text-blue-700 border border-blue-200/60 px-2 py-1 rounded-lg font-medium ml-2">
                      {step.estimatedHours}h
                    </span>
                  )}
                </div>

                {step.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 ml-8">
                    {step.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center text-xs bg-primary-50 text-primary-700 border border-primary-200/60 px-2 py-1 rounded-lg font-medium"
                      >
                        /{skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-purple-200">
            <div className="text-sm text-slate-600">
              <span className="font-semibold">Total Estimated:</span> {generatedPlan.totalEstimatedHours} hours
            </div>
            <div className="text-sm text-slate-600">
              <span className="font-semibold">Suggested Budget:</span> ${generatedPlan.suggestedBudget.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="initialPrompt" className="block text-sm font-medium text-gray-700 mb-1">
          Initial Claude Prompt
        </label>
        <textarea
          id="initialPrompt"
          name="initialPrompt"
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          placeholder="Paste the initial prompt you'll use to start this project with Claude Code..."
        />
        <p className="text-sm text-gray-500 mt-1">
          Store your initial Claude Code prompt here for reference
        </p>
      </div>

      <div>
        <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
          Client Name
        </label>
        <input
          type="text"
          id="clientName"
          name="clientName"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Client or company name"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Hours
          </label>
          <input
            type="number"
            id="estimatedHours"
            name="estimatedHours"
            min="0"
            step="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="40"
          />
        </div>

        <div>
          <label htmlFor="estimatedBudget" className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Budget ($)
          </label>
          <input
            type="number"
            id="estimatedBudget"
            name="estimatedBudget"
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="5000.00"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-3.5 rounded-xl shadow-primary hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-semibold transition-all duration-300"
        >
          {isSubmitting ? 'Creating Project...' : 'Create Project'}
        </button>

        <button
          type="button"
          onClick={() => router.push('/')}
          className="px-6 py-3.5 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 font-semibold transition-all duration-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
