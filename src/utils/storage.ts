import { AppProject, BacklogItem, NotificationSettings } from '../types';

const STORAGE_KEYS = {
  APPS: 'bigma_apps_v2',
  TASKS: 'bigma_tasks_v2',
  READ_NOTIFS: 'bigma_read_notifs_v2',
  SETTINGS: 'bigma_settings_v2',
};

// Start with completely empty state as requested by the user
export const loadStoredApps = (): AppProject[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error loading apps from localStorage:', err);
  }
  return [];
};

export const saveStoredApps = (apps: AppProject[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(apps));
  } catch (err) {
    console.error('Error saving apps to localStorage:', err);
  }
};

export const loadStoredTasks = (): BacklogItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error loading tasks from localStorage:', err);
  }
  return [];
};

export const saveStoredTasks = (tasks: BacklogItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Error saving tasks to localStorage:', err);
  }
};

export const loadReadNotificationIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.READ_NOTIFS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch {
    // fallback
  }
  return new Set();
};

export const saveReadNotificationIds = (ids: Set<string>) => {
  try {
    localStorage.setItem(STORAGE_KEYS.READ_NOTIFS, JSON.stringify(Array.from(ids)));
  } catch {
    // fallback
  }
};

export const loadNotificationSettings = (): NotificationSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return {
    browserNotifications: false,
    soundAlerts: true,
    alertHoursThreshold: 24,
  };
};

export const saveNotificationSettings = (settings: NotificationSettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // fallback
  }
};

/**
 * Generate CSV export content for backlog items
 */
export function exportToCSV(tasks: BacklogItem[], apps: AppProject[]): string {
  const appMap = new Map(apps.map((a) => [a.id, a.name]));
  const headers = [
    'Kode',
    'Aplikasi',
    'Judul Tugas',
    'Tipe',
    'Prioritas',
    'Status',
    'Estimasi (Jam)',
    'Terpakai (Jam)',
    'Tenggat Waktu',
    'Dibuat',
  ];

  const rows = tasks.map((t) => [
    `"${t.code || ''}"`,
    `"${appMap.get(t.appId) || 'Umum'}"`,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    `"${t.type}"`,
    `"${t.priority}"`,
    `"${t.status}"`,
    t.estimatedHours || 0,
    t.spentHours || 0,
    `"${t.dueDate || ''}"`,
    `"${t.createdAt || ''}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
