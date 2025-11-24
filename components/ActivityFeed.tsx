'use client';

import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Activity, PauseCircle, Play, AlertTriangle, Plus, FileText, Sparkles, Settings } from 'lucide-react';

type ActivityItem = {
  id: string;
  action: string;
  description: string;
  createdAt: Date;
  project?: { id: string; name: string } | null;
};

interface ActivityFeedProps {
  activities: ActivityItem[];
  showViewAll?: boolean;
}

const ACTION_ICONS: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  created: { icon: Plus, color: 'text-emerald-500 bg-emerald-50' },
  status_changed: { icon: Settings, color: 'text-blue-500 bg-blue-50' },
  note_added: { icon: FileText, color: 'text-purple-500 bg-purple-50' },
  put_on_hold: { icon: PauseCircle, color: 'text-amber-500 bg-amber-50' },
  resumed: { icon: Play, color: 'text-green-500 bg-green-50' },
  priority_changed: { icon: AlertTriangle, color: 'text-orange-500 bg-orange-50' },
  client_created: { icon: Sparkles, color: 'text-pink-500 bg-pink-50' },
  default: { icon: Activity, color: 'text-slate-500 bg-slate-50' },
};

export function ActivityFeed({ activities, showViewAll = false }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity) => {
        const actionConfig = ACTION_ICONS[activity.action] || ACTION_ICONS.default;
        const Icon = actionConfig.icon;

        return (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className={`p-2 rounded-lg ${actionConfig.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 line-clamp-2">{activity.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-400">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </span>
                {activity.project && (
                  <>
                    <span className="text-slate-300">|</span>
                    <Link
                      href={`/projects/${activity.project.id}`}
                      className="text-xs text-primary-600 hover:text-primary-700 hover:underline truncate"
                    >
                      {activity.project.name}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {showViewAll && activities.length >= 5 && (
        <Link
          href="/activity"
          className="block text-center text-sm text-primary-600 hover:text-primary-700 py-2 hover:bg-primary-50 rounded-lg transition-colors"
        >
          View all activity
        </Link>
      )}
    </div>
  );
}
