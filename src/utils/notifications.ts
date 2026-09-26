import { BacklogItem, AppProject, DeadlineInfo, DeadlineState, AppNotification } from '../types';

/**
 * Calculates humanized deadline information for a backlog item
 */
export function getDeadlineInfo(dueDateString: string, isDone: boolean): DeadlineInfo {
  if (isDone) {
    return {
      state: 'completed',
      label: 'Selesai',
      hoursRemaining: 0,
      formattedText: 'Telah diselesaikan',
    };
  }

  if (!dueDateString) {
    return {
      state: 'upcoming',
      label: 'Tanpa Tenggat',
      hoursRemaining: Infinity,
      formattedText: 'Tidak ada tenggat waktu',
    };
  }

  const now = new Date();
  const due = new Date(dueDateString);
  const diffMs = due.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  const isToday =
    now.getFullYear() === due.getFullYear() &&
    now.getMonth() === due.getMonth() &&
    now.getDate() === due.getDate();

  const formattedTime = due.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const formattedDate = due.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

  if (diffHours < 0) {
    const overdueHours = Math.abs(Math.round(diffHours));
    if (overdueHours < 24) {
      return {
        state: 'overdue',
        label: 'Terlambat',
        hoursRemaining: diffHours,
        formattedText: `Lewat ${overdueHours} jam yang lalu (${formattedTime})`,
      };
    }
    const overdueDays = Math.ceil(overdueHours / 24);
    return {
      state: 'overdue',
      label: 'Terlambat',
      hoursRemaining: diffHours,
      formattedText: `Lewat ${overdueDays} hari (${formattedDate})`,
    };
  }

  if (isToday) {
    const hoursLeft = Math.max(0.5, Math.round(diffHours * 10) / 10);
    return {
      state: 'due_today',
      label: 'Hari Ini',
      hoursRemaining: diffHours,
      formattedText: `Hari ini, pukul ${formattedTime} (~${Math.ceil(hoursLeft)} jam lagi)`,
    };
  }

  if (diffHours <= 48) {
    const hoursLeft = Math.round(diffHours);
    return {
      state: 'due_soon',
      label: 'Segera',
      hoursRemaining: diffHours,
      formattedText: `Besok (${formattedDate}), ${formattedTime} (~${hoursLeft} jam lagi)`,
    };
  }

  const daysLeft = Math.ceil(diffHours / 24);
  return {
    state: 'upcoming',
    label: `${daysLeft} hari lagi`,
    hoursRemaining: diffHours,
    formattedText: `${formattedDate}, ${formattedTime}`,
  };
}

/**
 * Generate in-app notifications based on current backlog deadlines
 */
export function generateDeadlineNotifications(
  tasks: BacklogItem[],
  apps: AppProject[],
  readNotificationIds: Set<string>
): AppNotification[] {
  const notifications: AppNotification[] = [];
  const appMap = new Map<string, string>();
  apps.forEach((a) => appMap.set(a.id, a.name));

  for (const task of tasks) {
    if (task.status === 'done' || !task.dueDate) continue;

    const deadline = getDeadlineInfo(task.dueDate, false);
    const appName = appMap.get(task.appId) || 'Aplikasi';

    if (deadline.state === 'overdue') {
      const id = `notif-overdue-${task.id}`;
      notifications.push({
        id,
        taskId: task.id,
        taskCode: task.code,
        taskTitle: task.title,
        appName,
        type: 'overdue',
        dueDate: task.dueDate,
        message: `Tugas "${task.title}" telah melewati tenggat waktu! Segera lakukan penanganan.`,
        timestamp: task.dueDate,
        read: readNotificationIds.has(id),
      });
    } else if (deadline.state === 'due_today') {
      const id = `notif-today-${task.id}`;
      notifications.push({
        id,
        taskId: task.id,
        taskCode: task.code,
        taskTitle: task.title,
        appName,
        type: 'due_today',
        dueDate: task.dueDate,
        message: `Tugas "${task.title}" jatuh tempo HARI INI (${deadline.formattedText}).`,
        timestamp: task.dueDate,
        read: readNotificationIds.has(id),
      });
    } else if (deadline.state === 'due_soon') {
      const id = `notif-soon-${task.id}`;
      notifications.push({
        id,
        taskId: task.id,
        taskCode: task.code,
        taskTitle: task.title,
        appName,
        type: 'due_soon',
        dueDate: task.dueDate,
        message: `Tenggat waktu tugas "${task.title}" mendekati batas (${deadline.formattedText}).`,
        timestamp: task.dueDate,
        read: readNotificationIds.has(id),
      });
    }
  }

  // Sort by urgency: overdue first, then due today, then due soon
  return notifications.sort((a, b) => {
    const order = { overdue: 1, due_today: 2, due_soon: 3 };
    return order[a.type] - order[b.type];
  });
}

/**
 * Play a gentle synthesizer chime using Web Audio API
 */
export function playAlertChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First pleasant tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second harmonious tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12); // A5
    gain2.gain.setValueAtTime(0.09, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch {
    // Audio might be blocked by browser autoplay policy until user gesture
  }
}

/**
 * Trigger native browser desktop notification if permitted
 */
export function sendBrowserNotification(title: string, options: NotificationOptions) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, options);
    } catch {
      // Ignored
    }
  }
}
