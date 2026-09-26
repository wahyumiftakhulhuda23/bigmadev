import React from 'react';
import { 
  LayoutList, 
  Kanban, 
  Layers, 
  Bell, 
  Plus, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { AppProject, AppNotification } from '../types';

interface NavbarProps {
  currentView: 'list' | 'kanban';
  onViewChange: (view: 'list' | 'kanban') => void;
  apps: AppProject[];
  selectedAppId: string;
  onSelectApp: (appId: string) => void;
  onOpenNewTask: () => void;
  onOpenAppManager: () => void;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isCloudConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  apps,
  selectedAppId,
  onSelectApp,
  onOpenNewTask,
  onOpenAppManager,
  notifications,
  onOpenNotifications,
  soundEnabled,
  onToggleSound,
  isCloudConnected = true,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const overdueCount = notifications.filter((n) => n.type === 'overdue').length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={() => onViewChange('list')} 
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow font-bold text-sm tracking-tight">
                BM
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                  BigMA Dev
                </span>
                <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400">
                  tracker
                </span>
                <span className="hidden xl:inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-1.5 py-0.5 rounded-full ml-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Realtime Cloud</span>
                </span>
              </div>
            </button>

            {/* Application Filter (Shown if at least 1 app exists) */}
            {apps.length > 0 && (
              <div className="hidden md:flex items-center gap-2 border-l border-slate-800 pl-4">
                <span className="text-xs text-slate-400">Aplikasi:</span>
                <select
                  value={selectedAppId}
                  onChange={(e) => onSelectApp(e.target.value)}
                  className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
                >
                  <option value="all">Semua Aplikasi ({apps.length})</option>
                  {apps.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={onOpenAppManager}
                  title="Kelola Daftar Aplikasi"
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Simple 2-Mode View Switcher */}
          <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => onViewChange('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                currentView === 'list'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Daftar & Ringkasan</span>
            </button>

            <button
              onClick={() => onViewChange('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                currentView === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Papan Status</span>
            </button>
          </nav>

          {/* Actions & Alerts */}
          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Suara Notifikasi: Aktif' : 'Suara Notifikasi: Hening'}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Bell Notifications */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Notifikasi Tenggat Waktu"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className={`absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-mono font-bold text-white shadow-sm ${
                  overdueCount > 0 ? 'bg-rose-600 animate-pulse' : 'bg-amber-600'
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onOpenNewTask}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm whitespace-nowrap active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tugas</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
