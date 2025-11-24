'use client';

import Link from 'next/link';
import { ProjectStatus } from '@prisma/client';

interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  type: 'due' | 'start' | 'milestone';
  status: string;
  projectId: string;
  clientName?: string | null;
  projectName?: string;
}

interface CalendarViewProps {
  month: number;
  year: number;
  events: CalendarEvent[];
}

export function CalendarView({ month, year, events }: CalendarViewProps) {
  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Get days from previous month to fill the first week
  const daysFromPrevMonth = firstDayOfMonth;
  const prevMonthDays = new Date(year, month, 0).getDate();

  // Get total cells needed (always 6 weeks = 42 cells for consistency)
  const totalCells = 42;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Build calendar days
  const calendarDays: Array<{
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    date: Date;
    events: CalendarEvent[];
  }> = [];

  // Previous month days
  for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const date = new Date(year, month - 1, day);
    calendarDays.push({
      day,
      isCurrentMonth: false,
      isToday: false,
      date,
      events: events.filter(e => {
        const eventDate = new Date(e.date);
        return (
          eventDate.getDate() === day &&
          eventDate.getMonth() === month - 1 &&
          eventDate.getFullYear() === (month === 0 ? year - 1 : year)
        );
      }),
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isToday =
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year;

    calendarDays.push({
      day,
      isCurrentMonth: true,
      isToday,
      date,
      events: events.filter(e => {
        const eventDate = new Date(e.date);
        return (
          eventDate.getDate() === day &&
          eventDate.getMonth() === month &&
          eventDate.getFullYear() === year
        );
      }),
    });
  }

  // Next month days
  const remainingCells = totalCells - calendarDays.length;
  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(year, month + 1, day);
    calendarDays.push({
      day,
      isCurrentMonth: false,
      isToday: false,
      date,
      events: events.filter(e => {
        const eventDate = new Date(e.date);
        return (
          eventDate.getDate() === day &&
          eventDate.getMonth() === month + 1 &&
          eventDate.getFullYear() === (month === 11 ? year + 1 : year)
        );
      }),
    });
  }

  const getEventColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'due':
        return 'bg-red-500 hover:bg-red-600';
      case 'start':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'milestone':
        return 'bg-purple-500 hover:bg-purple-600';
      default:
        return 'bg-slate-500 hover:bg-slate-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-slate-200">
        {dayNames.map(day => (
          <div
            key={day}
            className="px-4 py-3 text-center text-sm font-semibold text-slate-600 bg-slate-50"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((dayData, index) => (
          <div
            key={index}
            className={`min-h-28 p-2 border-b border-r border-slate-100 ${
              !dayData.isCurrentMonth ? 'bg-slate-50/50' : ''
            } ${dayData.isToday ? 'bg-primary-50/50' : ''}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-sm font-medium ${
                  dayData.isToday
                    ? 'w-7 h-7 bg-primary-500 text-white rounded-full flex items-center justify-center'
                    : dayData.isCurrentMonth
                    ? 'text-slate-900'
                    : 'text-slate-400'
                }`}
              >
                {dayData.day}
              </span>
            </div>

            <div className="space-y-1">
              {dayData.events.slice(0, 3).map(event => (
                <Link
                  key={event.id}
                  href={`/projects/${event.projectId}`}
                  className={`block text-xs px-2 py-1 rounded text-white truncate ${getEventColor(event.type)}`}
                  title={event.title}
                >
                  {event.title}
                </Link>
              ))}
              {dayData.events.length > 3 && (
                <span className="text-xs text-slate-500 px-2">
                  +{dayData.events.length - 3} more
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
