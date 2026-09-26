import React from 'react';
import { 
  X, 
  Bell, 
  AlertCircle, 
  Clock, 
  Volume2, 
  VolumeX, 
  CheckCheck, 
  ExternalLink,
  ShieldCheck,
  Play
} from 'lucide-react';
import { AppNotification, NotificationSettings } from '../types';
import { playAlertChime } from '../utils/notifications';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onMarkAsRead: (notifId: string) => void;
  onSelectTask: (taskId: string) => void;
  settings: NotificationSettings;
  onUpdateSettings: (settings: NotificationSettings) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onMarkAsRead,
  onSelectTask,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const requestBrowserPermission = async () => {
    if (!('Notification' in window)) {
      alert('Browser Anda tidak mendukung Web Notification API.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        onUpdateSettings({ ...settings, browserNotifications: true });
        new Notification('DevBacklog Pro', {
          body: 'Notifikasi browser untuk tenggat waktu berhasil diaktifkan!',
          icon: '/favicon.ico',
        });
      } else {
        onUpdateSettings({ ...settings, browserNotifications: false });
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div 
        className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-950/80 text-indigo-400 border border-indigo-900/60">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Notifikasi Tenggat Waktu</h2>
              <p className="text-[11px] text-slate-400">
                {unreadCount > 0 ? `${unreadCount} peringatan belum dibaca` : 'Semua telah ditinjau'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Settings & Controls Bar */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800/80 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-medium">Pengaturan Peringatan:</span>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Tandai Semua Dibaca</span>
              </button>
            )}
          </div>

          {/* Sound alert switch */}
          <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2">
              {settings.soundAlerts ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <span className="text-slate-300">Bunyi Audio Chime</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={playAlertChime}
                title="Uji bunyi chime"
                className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
              >
                <Play className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({ ...settings, soundAlerts: !settings.soundAlerts })
                }
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.soundAlerts ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.soundAlerts ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Browser Desktop Notifications switch */}
          <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="text-slate-300 block">Notifikasi Desktop Browser</span>
                <span className="text-[10px] text-slate-500">Peringatan saat tab di latar belakang</span>
              </div>
            </div>
            <button
              onClick={requestBrowserPermission}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                settings.browserNotifications
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              {settings.browserNotifications ? 'Aktif' : 'Aktifkan'}
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Bell className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
              <p className="text-sm font-medium text-slate-300">Tidak ada notifikasi aktif</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Semua tugas backlog Anda berada dalam jadwal aman tanpa ada keterlambatan tenggat waktu.
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isOverdue = notif.type === 'overdue';
              const isToday = notif.type === 'due_today';

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    onMarkAsRead(notif.id);
                    onSelectTask(notif.taskId);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
                    isOverdue
                      ? 'bg-rose-950/20 border-rose-900/50 hover:bg-rose-950/30'
                      : isToday
                      ? 'bg-amber-950/20 border-amber-900/50 hover:bg-amber-950/30'
                      : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/60'
                  } ${!notif.read ? 'ring-1 ring-indigo-500/50' : 'opacity-85'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold mb-1">
                      {isOverdue ? (
                        <span className="text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>LEWAT TENGGAT WAKTU</span>
                        </span>
                      ) : isToday ? (
                        <span className="text-amber-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>JATUH TEMPO HARI INI</span>
                        </span>
                      ) : (
                        <span className="text-sky-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <span>MENDEKATI BATAS WAKTU</span>
                        </span>
                      )}

                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 ml-1" />
                      )}
                    </div>

                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
                  </div>

                  {/* Task code and title */}
                  <div className="text-xs font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2 mt-1">
                    <span className="font-mono text-slate-400 mr-1.5">[{notif.taskCode}]</span>
                    {notif.taskTitle}
                  </div>

                  {/* Message body */}
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    {notif.message}
                  </p>

                  {/* Footer details */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-medium text-slate-400">{notif.appName}</span>
                    <span className="font-mono">
                      {new Date(notif.dueDate).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
