import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  AppProject, 
  BacklogItem, 
  TaskStatus, 
  NotificationSettings, 
  AppNotification 
} from './types';
import { 
  loadStoredApps, 
  saveStoredApps, 
  loadStoredTasks, 
  saveStoredTasks, 
  loadReadNotificationIds, 
  saveReadNotificationIds, 
  loadNotificationSettings, 
  saveNotificationSettings 
} from './utils/storage';
import { 
  generateDeadlineNotifications, 
  playAlertChime, 
  sendBrowserNotification 
} from './utils/notifications';
import { Navbar } from './components/Navbar';
import { TaskListView } from './components/TaskListView';
import { KanbanView } from './components/KanbanView';
import { TaskModal } from './components/TaskModal';
import { AppManagerModal } from './components/AppManagerModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { Download, Upload, X } from 'lucide-react';

export default function App() {
  // Start with clean state loaded from localStorage (defaults to empty [] as requested)
  const [apps, setApps] = useState<AppProject[]>(() => loadStoredApps());
  const [tasks, setTasks] = useState<BacklogItem[]>(() => loadStoredTasks());
  const [selectedAppId, setSelectedAppId] = useState<string>('all');
  const [currentView, setCurrentView] = useState<'list' | 'kanban'>('list');

  // Modals & Drawers
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<BacklogItem | null>(null);
  const [defaultStatusForNewTask, setDefaultStatusForNewTask] = useState<TaskStatus>('backlog');
  const [isAppManagerOpen, setIsAppManagerOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // In-app deletion confirmation modal state
  const [taskPendingDelete, setTaskPendingDelete] = useState<BacklogItem | null>(null);

  // Notifications & Preferences
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(() => loadReadNotificationIds());
  const [settings, setSettings] = useState<NotificationSettings>(() => loadNotificationSettings());
  const [toastAlert, setToastAlert] = useState<{ message: string; type: 'info' | 'warning' | 'success' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    saveStoredApps(apps);
  }, [apps]);

  useEffect(() => {
    saveStoredTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveReadNotificationIds(readNotifIds);
  }, [readNotifIds]);

  useEffect(() => {
    saveNotificationSettings(settings);
  }, [settings]);

  // Generate live deadline notifications
  const notifications: AppNotification[] = useMemo(() => {
    return generateDeadlineNotifications(tasks, apps, readNotifIds);
  }, [tasks, apps, readNotifIds]);

  // Periodic deadline checker & sound alert on mount if overdue tasks exist
  useEffect(() => {
    const overdueList = notifications.filter((n) => n.type === 'overdue');
    if (overdueList.length > 0 && settings.soundAlerts) {
      const timer = setTimeout(() => {
        playAlertChime();
        if (settings.browserNotifications) {
          sendBrowserNotification('Peringatan Tenggat Waktu!', {
            body: `Ada ${overdueList.length} tugas yang telah melewati tenggat waktu!`,
          });
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [settings.soundAlerts, settings.browserNotifications, notifications]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastAlert) {
      const timer = setTimeout(() => setToastAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastAlert]);

  // Handler: Save or Update Task (handles auto-creating app if new name typed)
  const handleSaveTask = (savedTask: BacklogItem, newAppName?: string) => {
    let updatedApps = [...apps];

    // If user entered a new app name in modal, auto-register the app
    if (newAppName && newAppName.trim()) {
      const trimmedName = newAppName.trim();
      const existing = updatedApps.find((a) => a.name.toLowerCase() === trimmedName.toLowerCase());
      if (!existing) {
        const colors = ['#0284c7', '#10b981', '#8b5cf6', '#f59e0b', '#f43f5e'];
        const newApp: AppProject = {
          id: savedTask.appId,
          name: trimmedName,
          key: trimmedName.slice(0, 4).toUpperCase(),
          description: '',
          version: 'v1.0.0',
          color: colors[updatedApps.length % colors.length],
          techStack: [],
          createdAt: new Date().toISOString(),
        };
        updatedApps = [...updatedApps, newApp];
        setApps(updatedApps);
      }
    }

    const exists = tasks.some((t) => t.id === savedTask.id);
    if (exists) {
      setTasks(tasks.map((t) => (t.id === savedTask.id ? savedTask : t)));
      setToastAlert({
        message: `Tugas "${savedTask.title}" berhasil diperbarui.`,
        type: 'success',
      });
    } else {
      setTasks([savedTask, ...tasks]);
      setToastAlert({
        message: `Tugas baru berhasil ditambahkan ke backlog.`,
        type: 'success',
      });
    }

    if (settings.soundAlerts) {
      playAlertChime();
    }
  };

  // Handler: Trigger deletion confirmation
  const handlePromptDeleteTask = (task: BacklogItem) => {
    setTaskPendingDelete(task);
  };

  // Handler: Execute deletion
  const handleConfirmDeleteTask = () => {
    if (!taskPendingDelete) return;
    const deletedId = taskPendingDelete.id;
    const deletedTitle = taskPendingDelete.title;

    setTasks((prev) => prev.filter((t) => t.id !== deletedId));
    setTaskPendingDelete(null);

    setToastAlert({
      message: `Tugas "${deletedTitle}" telah berhasil dihapus.`,
      type: 'info',
    });
  };

  // Handler: Quick toggle completion
  const handleToggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isDone = t.status === 'done';
          const newStatus: TaskStatus = isDone ? 'in_progress' : 'done';
          return {
            ...t,
            status: newStatus,
            completedAt: newStatus === 'done' ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );

    if (settings.soundAlerts) {
      playAlertChime();
    }
  };

  // Handler: Update status from Kanban
  const handleMoveTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: newStatus,
            completedAt: newStatus === 'done' ? (t.completedAt || new Date().toISOString()) : undefined,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );

    if (newStatus === 'done' && settings.soundAlerts) {
      playAlertChime();
    }
  };

  // Open edit modal
  const handleOpenEditTask = (task: BacklogItem) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleOpenNewTaskWithStatus = (status: TaskStatus) => {
    setTaskToEdit(null);
    setDefaultStatusForNewTask(status);
    setIsTaskModalOpen(true);
  };

  // Handlers for Apps
  const handleAddApp = (newApp: AppProject) => {
    setApps((prev) => [...prev, newApp]);
    setToastAlert({
      message: `Aplikasi "${newApp.name}" berhasil didaftarkan.`,
      type: 'success',
    });
  };

  const handleUpdateApp = (updatedApp: AppProject) => {
    setApps((prev) => prev.map((a) => (a.id === updatedApp.id ? updatedApp : a)));
    setToastAlert({
      message: `Aplikasi "${updatedApp.name}" diperbarui.`,
      type: 'success',
    });
  };

  const handleDeleteApp = (appId: string) => {
    setApps((prev) => prev.filter((a) => a.id !== appId));
    if (selectedAppId === appId) {
      setSelectedAppId('all');
    }
    setToastAlert({
      message: 'Aplikasi berhasil dihapus.',
      type: 'info',
    });
  };

  // Notifications read handlers
  const handleMarkAllNotifsAsRead = () => {
    const newSet = new Set(readNotifIds);
    notifications.forEach((n) => newSet.add(n.id));
    setReadNotifIds(newSet);
  };

  const handleMarkNotifAsRead = (notifId: string) => {
    const newSet = new Set(readNotifIds);
    newSet.add(notifId);
    setReadNotifIds(newSet);
  };

  const handleSelectTaskFromNotif = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      handleOpenEditTask(task);
    }
  };

  // Backup & Restore JSON
  const handleExportJSON = () => {
    const backupData = {
      version: '2.0',
      appName: 'BigMA Dev',
      exportedAt: new Date().toISOString(),
      apps,
      tasks,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bigma_dev_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.tasks)) {
          setTasks(parsed.tasks);
          if (Array.isArray(parsed.apps)) {
            setApps(parsed.apps);
          }
          setToastAlert({
            message: 'Data berhasil dipulihkan dari file backup!',
            type: 'success',
          });
        }
      } catch {
        alert('Gagal membaca file JSON. Pastikan file valid.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        apps={apps}
        selectedAppId={selectedAppId}
        onSelectApp={setSelectedAppId}
        onOpenNewTask={() => {
          setTaskToEdit(null);
          setDefaultStatusForNewTask('backlog');
          setIsTaskModalOpen(true);
        }}
        onOpenAppManager={() => setIsAppManagerOpen(true)}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        soundEnabled={settings.soundAlerts}
        onToggleSound={() =>
          setSettings({ ...settings, soundAlerts: !settings.soundAlerts })
        }
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {currentView === 'list' ? (
          <TaskListView
            tasks={tasks}
            apps={apps}
            selectedAppId={selectedAppId}
            onSelectApp={setSelectedAppId}
            onOpenTask={handleOpenEditTask}
            onRequestDeleteTask={handlePromptDeleteTask}
            onToggleComplete={handleToggleComplete}
            onOpenNewTask={() => {
              setTaskToEdit(null);
              setDefaultStatusForNewTask('backlog');
              setIsTaskModalOpen(true);
            }}
            onSwitchToKanban={() => setCurrentView('kanban')}
          />
        ) : (
          <KanbanView
            tasks={tasks}
            apps={apps}
            selectedAppId={selectedAppId}
            onOpenTask={handleOpenEditTask}
            onRequestDeleteTask={handlePromptDeleteTask}
            onMoveTaskStatus={handleMoveTaskStatus}
            onOpenNewTaskWithStatus={handleOpenNewTaskWithStatus}
          />
        )}
      </main>

      {/* Minimalist Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-3 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">BigMA Dev</span>
            <span>·</span>
            <span>Task & Bug Tracker Developer</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleExportJSON}
              title="Download cadangan data"
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Cadangkan Data (JSON)</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              title="Pulihkan data cadangan"
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Pulihkan Data</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJSON}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </footer>

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={(taskId) => {
          const t = tasks.find((item) => item.id === taskId);
          if (t) {
            handlePromptDeleteTask(t);
          }
        }}
        taskToEdit={taskToEdit}
        defaultStatus={defaultStatusForNewTask}
        apps={apps}
        allTasks={tasks}
      />

      {/* Reliable In-App Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={taskPendingDelete !== null}
        title="Konfirmasi Hapus Tugas"
        message="Apakah Anda yakin ingin menghapus tugas ini dari backlog? Data akan langsung terhapus dari penyimpanan."
        itemName={taskPendingDelete ? `${taskPendingDelete.code}: ${taskPendingDelete.title}` : undefined}
        onConfirm={handleConfirmDeleteTask}
        onCancel={() => setTaskPendingDelete(null)}
      />

      {/* App Manager Modal */}
      <AppManagerModal
        isOpen={isAppManagerOpen}
        onClose={() => setIsAppManagerOpen(false)}
        apps={apps}
        tasks={tasks}
        onAddApp={handleAddApp}
        onUpdateApp={handleUpdateApp}
        onDeleteApp={handleDeleteApp}
      />

      {/* Deadline Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotifsAsRead}
        onMarkAsRead={handleMarkNotifAsRead}
        onSelectTask={handleSelectTaskFromNotif}
        settings={settings}
        onUpdateSettings={setSettings}
      />

      {/* Toast Alert Notification */}
      {toastAlert && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          <span>{toastAlert.message}</span>
          <button
            onClick={() => setToastAlert(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
