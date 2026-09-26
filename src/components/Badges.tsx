import React from 'react';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Bug, 
  Sparkles, 
  Wrench, 
  ShieldAlert,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { TaskPriority, TaskType, TaskStatus, DeadlineInfo } from '../types';

interface PriorityBadgeProps {
  priority: TaskPriority;
  showIcon?: boolean;
}

export const PriorityIndicator: React.FC<PriorityBadgeProps> = ({ priority, showIcon = true }) => {
  switch (priority) {
    case 'critical':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400">
          {showIcon && <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
          <span>P1 · Kritis</span>
        </span>
      );
    case 'high':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400">
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
          <span>P2 · Tinggi</span>
        </span>
      );
    case 'medium':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-400">
          {showIcon && <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
          <span>P3 · Sedang</span>
        </span>
      );
    case 'low':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-normal text-slate-400">
          <span>P4 · Rendah</span>
        </span>
      );
  }
};

interface TypeIndicatorProps {
  type: TaskType;
  showIcon?: boolean;
}

export const TypeIndicator: React.FC<TypeIndicatorProps> = ({ type, showIcon = true }) => {
  switch (type) {
    case 'bug':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-300">
          {showIcon && <Bug className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
          <span>Perbaikan Bug</span>
        </span>
      );
    case 'feature':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300">
          {showIcon && <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
          <span>Tambah Fitur</span>
        </span>
      );
    case 'refactor':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-300">
          {showIcon && <Wrench className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
          <span>Refaktorisasi</span>
        </span>
      );
    case 'maintenance':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300">
          {showIcon && <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
          <span>Pemeliharaan</span>
        </span>
      );
  }
};

interface StatusIndicatorProps {
  status: TaskStatus;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  switch (status) {
    case 'backlog':
      return <span className="text-xs text-slate-400 font-medium">Antrean Ide</span>;
    case 'todo':
      return <span className="text-xs text-blue-400 font-medium">Direncanakan</span>;
    case 'in_progress':
      return <span className="text-xs text-amber-400 font-medium">Sedang Dikerjakan</span>;
    case 'review':
      return <span className="text-xs text-purple-400 font-medium">Uji Coba & Review</span>;
    case 'done':
      return <span className="text-xs text-emerald-400 font-medium">Selesai</span>;
  }
};

interface DeadlineDisplayProps {
  deadline: DeadlineInfo;
  compact?: boolean;
}

export const DeadlineDisplay: React.FC<DeadlineDisplayProps> = ({ deadline, compact = false }) => {
  switch (deadline.state) {
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>Selesai</span>
        </span>
      );
    case 'overdue':
      return (
        <span className="inline-flex items-center gap-1 text-xs text-rose-400 font-semibold">
          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span>{compact ? deadline.label : deadline.formattedText}</span>
        </span>
      );
    case 'due_today':
      return (
        <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-semibold">
          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>{compact ? deadline.label : deadline.formattedText}</span>
        </span>
      );
    case 'due_soon':
      return (
        <span className="inline-flex items-center gap-1 text-xs text-sky-400 font-medium">
          <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          <span>{compact ? deadline.label : deadline.formattedText}</span>
        </span>
      );
    case 'upcoming':
    default:
      return (
        <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-normal">
          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{deadline.formattedText}</span>
        </span>
      );
  }
};
