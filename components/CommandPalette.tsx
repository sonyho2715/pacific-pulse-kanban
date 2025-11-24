'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  FolderKanban,
  LayoutDashboard,
  Users,
  FileText,
  Clock,
  DollarSign,
  Settings,
  Plus,
  Calendar,
  BarChart3,
  Zap,
  Moon,
  Sun,
  X,
  Command,
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category: 'navigation' | 'actions' | 'settings';
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fetch projects and clients when palette opens
  useEffect(() => {
    if (isOpen) {
      fetch('/api/search-data')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setProjects(data.projects || []);
            setClients(data.clients || []);
          }
        })
        .catch(err => console.error('Failed to fetch search data:', err));
    }
  }, [isOpen]);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  }, [theme]);

  // Command items
  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-kanban',
      label: 'Go to Kanban Board',
      description: 'View all projects',
      icon: <FolderKanban className="w-4 h-4" />,
      shortcut: 'G K',
      action: () => router.push('/'),
      category: 'navigation',
    },
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      description: 'View metrics and analytics',
      icon: <LayoutDashboard className="w-4 h-4" />,
      shortcut: 'G D',
      action: () => router.push('/dashboard'),
      category: 'navigation',
    },
    {
      id: 'nav-clients',
      label: 'Go to Clients',
      description: 'Manage your clients',
      icon: <Users className="w-4 h-4" />,
      shortcut: 'G C',
      action: () => router.push('/clients'),
      category: 'navigation',
    },
    {
      id: 'nav-time',
      label: 'Go to Time Tracking',
      description: 'Track your time',
      icon: <Clock className="w-4 h-4" />,
      shortcut: 'G T',
      action: () => router.push('/time'),
      category: 'navigation',
    },
    {
      id: 'nav-invoices',
      label: 'Go to Invoices',
      description: 'Manage invoices',
      icon: <DollarSign className="w-4 h-4" />,
      shortcut: 'G I',
      action: () => router.push('/invoices'),
      category: 'navigation',
    },
    {
      id: 'nav-proposals',
      label: 'Go to Proposals',
      description: 'Manage proposals',
      icon: <FileText className="w-4 h-4" />,
      shortcut: 'G P',
      action: () => router.push('/proposals'),
      category: 'navigation',
    },
    {
      id: 'nav-calendar',
      label: 'Go to Calendar',
      description: 'View project calendar',
      icon: <Calendar className="w-4 h-4" />,
      shortcut: 'G L',
      action: () => router.push('/calendar'),
      category: 'navigation',
    },
    {
      id: 'nav-analytics',
      label: 'Go to Analytics',
      description: 'Financial analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      shortcut: 'G A',
      action: () => router.push('/analytics'),
      category: 'navigation',
    },
    {
      id: 'nav-automations',
      label: 'Go to Automations',
      description: 'Manage workflows',
      icon: <Zap className="w-4 h-4" />,
      shortcut: 'G W',
      action: () => router.push('/automations'),
      category: 'navigation',
    },
    // Actions
    {
      id: 'action-new-project',
      label: 'Create New Project',
      description: 'Add a new project',
      icon: <Plus className="w-4 h-4" />,
      shortcut: 'N P',
      action: () => router.push('/projects/new'),
      category: 'actions',
    },
    {
      id: 'action-new-client',
      label: 'Create New Client',
      description: 'Add a new client',
      icon: <Plus className="w-4 h-4" />,
      shortcut: 'N C',
      action: () => router.push('/clients/new'),
      category: 'actions',
    },
    {
      id: 'action-new-invoice',
      label: 'Create New Invoice',
      description: 'Create an invoice',
      icon: <Plus className="w-4 h-4" />,
      shortcut: 'N I',
      action: () => router.push('/invoices/new'),
      category: 'actions',
    },
    {
      id: 'action-new-proposal',
      label: 'Create New Proposal',
      description: 'Create a proposal',
      icon: <Plus className="w-4 h-4" />,
      shortcut: 'N R',
      action: () => router.push('/proposals/new'),
      category: 'actions',
    },
    // Settings
    {
      id: 'settings-theme',
      label: theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode',
      description: 'Toggle color theme',
      icon: theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />,
      shortcut: '⌘ ⇧ D',
      action: toggleTheme,
      category: 'settings',
    },
    {
      id: 'settings-general',
      label: 'Settings',
      description: 'App settings',
      icon: <Settings className="w-4 h-4" />,
      shortcut: '⌘ ,',
      action: () => router.push('/settings'),
      category: 'settings',
    },
  ];

  // Add project search results
  const projectCommands: CommandItem[] = projects
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 5)
    .map((project) => ({
      id: `project-${project.id}`,
      label: project.name,
      description: 'Open project',
      icon: <FolderKanban className="w-4 h-4" />,
      action: () => router.push(`/projects/${project.id}`),
      category: 'navigation' as const,
    }));

  // Add client search results
  const clientCommands: CommandItem[] = clients
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 5)
    .map((client) => ({
      id: `client-${client.id}`,
      label: client.name,
      description: 'Open client',
      icon: <Users className="w-4 h-4" />,
      action: () => router.push(`/clients/${client.id}`),
      category: 'navigation' as const,
    }));

  // Filter commands based on search
  const filteredCommands = [
    ...commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(search.toLowerCase()) ||
        cmd.description?.toLowerCase().includes(search.toLowerCase())
    ),
    ...(search.length > 0 ? [...projectCommands, ...clientCommands] : []),
  ];

  // Group commands by category
  const groupedCommands = {
    navigation: filteredCommands.filter((c) => c.category === 'navigation'),
    actions: filteredCommands.filter((c) => c.category === 'actions'),
    settings: filteredCommands.filter((c) => c.category === 'settings'),
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearch('');
      }

      // Arrow navigation
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
        }
        if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
          e.preventDefault();
          filteredCommands[selectedIndex].action();
          setIsOpen(false);
          setSearch('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Search...</span>
        <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-mono bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded">
          <Command className="w-3 h-3" />K
        </kbd>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={() => {
          setIsOpen(false);
          setSearch('');
        }}
      />

      {/* Command Palette */}
      <div className="fixed inset-x-4 top-[15vh] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl z-50">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search commands, projects, clients..."
              className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
            <button
              onClick={() => {
                setIsOpen(false);
                setSearch('');
              }}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500">
                <p>No results found</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            ) : (
              <>
                {groupedCommands.navigation.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Navigation
                    </div>
                    {groupedCommands.navigation.map((cmd, index) => {
                      const globalIndex = filteredCommands.indexOf(cmd);
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => {
                            cmd.action();
                            setIsOpen(false);
                            setSearch('');
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                            globalIndex === selectedIndex
                              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="text-slate-400">{cmd.icon}</div>
                          <div className="flex-1 text-left">
                            <p className="font-medium">{cmd.label}</p>
                            {cmd.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {cmd.description}
                              </p>
                            )}
                          </div>
                          {cmd.shortcut && (
                            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                              {cmd.shortcut}
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {groupedCommands.actions.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Actions
                    </div>
                    {groupedCommands.actions.map((cmd) => {
                      const globalIndex = filteredCommands.indexOf(cmd);
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => {
                            cmd.action();
                            setIsOpen(false);
                            setSearch('');
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                            globalIndex === selectedIndex
                              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="text-emerald-500">{cmd.icon}</div>
                          <div className="flex-1 text-left">
                            <p className="font-medium">{cmd.label}</p>
                            {cmd.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {cmd.description}
                              </p>
                            )}
                          </div>
                          {cmd.shortcut && (
                            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                              {cmd.shortcut}
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {groupedCommands.settings.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Settings
                    </div>
                    {groupedCommands.settings.map((cmd) => {
                      const globalIndex = filteredCommands.indexOf(cmd);
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => {
                            cmd.action();
                            setIsOpen(false);
                            setSearch('');
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                            globalIndex === selectedIndex
                              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="text-slate-400">{cmd.icon}</div>
                          <div className="flex-1 text-left">
                            <p className="font-medium">{cmd.label}</p>
                            {cmd.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {cmd.description}
                              </p>
                            )}
                          </div>
                          {cmd.shortcut && (
                            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                              {cmd.shortcut}
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">esc</kbd>
                Close
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
