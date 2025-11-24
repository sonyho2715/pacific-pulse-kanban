'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Clock, Plus, Trash2 } from 'lucide-react';
import { startTimer, stopTimer, addManualTime, deleteTimeEntry } from '@/app/time-actions';

interface TimeEntry {
  id: string;
  projectId: string;
  project: { id: string; name: string };
  description: string | null;
  startTime: Date;
  endTime: Date | null;
  duration: number | null;
  isBillable: boolean;
  isRunning: boolean;
}

interface TimeTrackerProps {
  entries: TimeEntry[];
  projects: { id: string; name: string }[];
  runningEntry?: TimeEntry | null;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function TimeTracker({ entries, projects, runningEntry }: TimeTrackerProps) {
  const [isTracking, setIsTracking] = useState(!!runningEntry);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(runningEntry || null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');
  const [description, setDescription] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualHours, setManualHours] = useState('');
  const [manualMinutes, setManualMinutes] = useState('');

  // Update elapsed time for running timer
  useEffect(() => {
    if (!isTracking || !currentEntry) return;

    const startTime = new Date(currentEntry.startTime).getTime();
    const updateElapsed = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 60000); // minutes
      setElapsedTime(elapsed);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [isTracking, currentEntry]);

  const handleStartTimer = async () => {
    if (!selectedProject) return;

    const result = await startTimer(selectedProject, description || undefined);
    if (result.success && result.data) {
      setCurrentEntry(result.data as TimeEntry);
      setIsTracking(true);
      setElapsedTime(0);
    }
  };

  const handleStopTimer = async () => {
    if (!currentEntry) return;

    const result = await stopTimer(currentEntry.id);
    if (result.success) {
      setIsTracking(false);
      setCurrentEntry(null);
      setElapsedTime(0);
      setDescription('');
    }
  };

  const handleAddManualTime = async () => {
    if (!selectedProject) return;

    const hours = parseInt(manualHours) || 0;
    const minutes = parseInt(manualMinutes) || 0;
    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes <= 0) return;

    const result = await addManualTime(selectedProject, totalMinutes, description || undefined);
    if (result.success) {
      setShowManualEntry(false);
      setManualHours('');
      setManualMinutes('');
      setDescription('');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (confirm('Delete this time entry?')) {
      await deleteTimeEntry(entryId);
    }
  };

  // Group entries by date
  const groupedEntries = entries.reduce((acc, entry) => {
    const date = new Date(entry.startTime).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, TimeEntry[]>);

  const todayTotal = entries
    .filter((e) => new Date(e.startTime).toDateString() === new Date().toDateString())
    .reduce((sum, e) => sum + (e.duration || 0), 0);

  return (
    <div className="space-y-6">
      {/* Timer Control */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Description & Project */}
          <div className="flex-1 space-y-3">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you working on?"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
              disabled={isTracking}
            />
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500"
              disabled={isTracking}
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Timer Display & Control */}
          <div className="flex items-center gap-4">
            <div className="text-4xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
              {formatDuration(elapsedTime)}
            </div>
            <button
              onClick={isTracking ? handleStopTimer : handleStartTimer}
              disabled={!selectedProject && !isTracking}
              className={`p-4 rounded-full transition-all ${
                isTracking
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isTracking ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex items-center gap-4 border-t border-slate-200 dark:border-slate-700 pt-4">
          <button
            onClick={() => setShowManualEntry(!showManualEntry)}
            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600"
          >
            <Plus className="w-4 h-4" />
            Add Manual Entry
          </button>
          <div className="flex-1" />
          <div className="text-sm text-slate-500">
            Today: <span className="font-medium">{formatDuration(todayTotal + (isTracking ? elapsedTime : 0))}</span>
          </div>
        </div>

        {/* Manual Entry Form */}
        {showManualEntry && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={manualHours}
                  onChange={(e) => setManualHours(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-16 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center"
                />
                <span className="text-slate-500">h</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="59"
                  className="w-16 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center"
                />
                <span className="text-slate-500">m</span>
              </div>
              <button
                onClick={handleAddManualTime}
                disabled={!selectedProject}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={() => setShowManualEntry(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Time Entries List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Time Entries
          </h2>
        </div>

        {Object.keys(groupedEntries).length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No time entries yet</p>
            <p className="text-sm mt-1">Start tracking to see your entries here</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {Object.entries(groupedEntries)
              .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
              .map(([date, dateEntries]) => {
                const dayTotal = dateEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
                const isToday = new Date(date).toDateString() === new Date().toDateString();

                return (
                  <div key={date}>
                    {/* Date Header */}
                    <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {isToday ? 'Today' : new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-sm text-slate-500">
                        {formatDuration(dayTotal)}
                      </span>
                    </div>

                    {/* Entries */}
                    {dateEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white truncate">
                            {entry.description || 'No description'}
                          </p>
                          <p className="text-sm text-slate-500 truncate">
                            {entry.project.name}
                          </p>
                        </div>
                        <div className="text-sm text-slate-500">
                          {formatTime(entry.startTime)}
                          {entry.endTime && ` - ${formatTime(entry.endTime)}`}
                        </div>
                        <div className="font-mono font-medium text-slate-900 dark:text-white">
                          {entry.duration ? formatDuration(entry.duration) : '--:--'}
                        </div>
                        {entry.isBillable && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                            Billable
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
