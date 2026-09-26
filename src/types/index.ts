export type TaskType = 'bug' | 'feature' | 'refactor' | 'maintenance';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

export interface AppProject {
  id: string;
  name: string;
  key: string; // e.g. "KASIR", "TOKO", "AUTH"
  description: string;
  color: string; // Hex or theme color
  version: string;
  techStack: string[];
  repoUrl?: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface BacklogItem {
  id: string;
  appId: string;
  code: string; // e.g. "KASIR-101"
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedHours: number;
  spentHours: number;
  storyPoints?: number;
  dueDate: string; // ISO string e.g. "2026-09-28T17:00"
  targetVersion?: string;
  gitBranch?: string;
  checklist: ChecklistItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type DeadlineState = 'overdue' | 'due_today' | 'due_soon' | 'upcoming' | 'completed';

export interface DeadlineInfo {
  state: DeadlineState;
  label: string;
  hoursRemaining: number;
  formattedText: string;
}

export interface AppNotification {
  id: string;
  taskId: string;
  taskTitle: string;
  taskCode: string;
  appName: string;
  type: 'overdue' | 'due_today' | 'due_soon';
  dueDate: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface NotificationSettings {
  browserNotifications: boolean;
  soundAlerts: boolean;
  alertHoursThreshold: number; // e.g. 24 hours
}
