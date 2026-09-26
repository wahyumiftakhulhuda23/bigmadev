import React from 'react';
import { 
  CalendarClock, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Calendar,
  Check,
  Code
} from 'lucide-react';
import { BacklogItem, AppProject, TaskStatus } from '../types';
import { getDeadlineInfo } from '../utils/notifications';
import { PriorityIndicator, TypeIndicator, DeadlineDisplay } from './Badges';

interface TimelineViewProps {
  tasks: BacklogItem[];
  apps: AppProject[];
  selectedAppId: string;
  onSelectApp: (appId: string) => void;
  onOpenTask: (task: BacklogItem) => void;
  onQuickToggleComplete: (taskId: string) => void;
  onOpenNewTask: () => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  tasks,
  apps,
  selectedAppId,
  onSelectApp,
  onOpenTask,
  onQuickToggleComplete,
  onOpenNewTask,
}) => {
  const filteredTasks = selectedAppId === 'all'
    ? tasks
    : tasks.filter((t) => t.appId === selectedAppId);

  const appMap = new Map(apps.map((a) => [a.id, a]));

  // Categorize by timeline groups
  const groups = {
    overdue: [] as BacklogItem[],
    due_today: [] as BacklogItem[],
    due_soon: [] as BacklogItem[],
    this_week: [] as BacklogItem[],
    later: [] as BacklogItem[],
    no_due: [] as BacklogItem[],
    completed: [] as BacklogItem[],
  };

  const now = new Date();

  filteredTasks.forEach((task) => {
    if (task.status === 'done') {
      groups.completed.push(task);
      return;
    }

    if (!task.dueDate) {
      groups.no_due.push(task);
      return;
    }

    const due = new Date(task.dueDate);
    const diffMs = due.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    const isToday =
      now.getFullYear() === due.getFullYear() &&
      now.getMonth() === due.getMonth() &&
      now.getDate() === due.getDate();

    if (diffHours < 0) {
      groups.overdue.push(task);
    } else if (isToday) {
      groups.due_today.push(task);
    } else if (diffHours <= 48) {
      groups.due_soon.push(task);
    } else if (diffHours <= 24 * 7) {
      groups.this_week.push(task);
    } else {
      groups.later.push(task);
    }
  });

  const renderSection = (
    title: string,
    subtitle: string,
    items: BacklogItem[],
    theme: {
      border: string;
      bg: string;
      text: string;
      icon: React.ReactNode;
    }
  ) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
          <div className="p-1 rounded bg-slate-900 border border-slate-800">
            {theme.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-sm font-bold ${theme.text}`}>{title}</h3>
              <span className="font-mono text-xs font-semibold text-slate-400 tabular-nums">
                ({items.length} tugas)
              </span>
            </div>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((task) => {
            const app = appMap.get(task.appId);
            const deadline = getDeadlineInfo(task.dueDate, task.status === 'done');

            return (
              <div
                key={task.id}
                onClick={() => onOpenTask(task)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer group shadow-sm flex flex-col justify-between ${theme.bg} ${theme.border} hover:border-slate-600`}
              >
                <div>
                  {/* Top metadata */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                    <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: app?.color || '#94a3b8' }}
                      />
                      <span className="font-semibold text-slate-300 truncate">
                        {app?.name}
                      </span>
                      <span>·</span>
                      <span className="font-mono text-slate-400">{task.code}</span>
                    </div>

                    <PriorityIndicator priority={task.priority} showIcon={false} />
                  </div>

                  {/* Title */}
                  <h4 className="text-xs font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-relaxed">
                    {task.title}
                  </h4>

                  {/* Type and Branch */}
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                    <TypeIndicator type={task.type} showIcon={false} />
                    {task.gitBranch && (
                      <>
                        <span>·</span>
                        <span className="font-mono text-[10px] text-slate-400 truncate max-w-[140px]">
                          {task.gitBranch}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Footer details */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <DeadlineDisplay deadline={deadline} />
                  
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                      ⏱️ {task.spentHours}/{task.estimatedHours}j
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickToggleComplete(task.id);
                      }}
                      title={task.status === 'done' ? 'Tandai Belum Selesai' : 'Tandai Selesai'}
                      className={`p-1.5 rounded transition-colors border ${
                        task.status === 'done'
                          ? 'bg-emerald-900/40 text-emerald-400 border-emerald-700/60'
                          : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800 border-slate-700'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and App selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Jadwal & Kronologi Tenggat Waktu</span>
            <CalendarClock className="w-5 h-5 text-indigo-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Susunan tugas berurutan berdasarkan batas waktu pengerjaan untuk antisipasi keterlambatan rilis
          </p>
        </div>

        {/* Quick App Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedAppId}
            onChange={(e) => onSelectApp(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
          >
            <option value="all">Semua Aplikasi ({tasks.length})</option>
            {apps.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Render sections in order of urgency */}
      <div className="space-y-8">
        {/* Overdue */}
        {renderSection(
          'Terlambat (Overdue)',
          'Tugas yang telah melewati batas waktu pengerjaan. Membutuhkan tindakan mitigasi cepat.',
          groups.overdue,
          {
            border: 'border-rose-900/60',
            bg: 'bg-rose-950/20',
            text: 'text-rose-400',
            icon: <AlertCircle className="w-4 h-4 text-rose-500" />,
          }
        )}

        {/* Due Today */}
        {renderSection(
          'Jatuh Tempo Hari Ini (Due Today)',
          'Batas akhir pengerjaan sebelum hari ini berakhir. Prioritaskan penyelesaian.',
          groups.due_today,
          {
            border: 'border-amber-900/60',
            bg: 'bg-amber-950/20',
            text: 'text-amber-400',
            icon: <Clock className="w-4 h-4 text-amber-500" />,
          }
        )}

        {/* Due Soon (48h) */}
        {renderSection(
          'Mendekati Tenggat (Besok & 48 Jam)',
          'Tugas dengan batas waktu dalam 1 hingga 2 hari mendatang.',
          groups.due_soon,
          {
            border: 'border-sky-900/60',
            bg: 'bg-sky-950/20',
            text: 'text-sky-400',
            icon: <Clock className="w-4 h-4 text-sky-500" />,
          }
        )}

        {/* This Week */}
        {renderSection(
          'Pekan Ini (Dalam 7 Hari)',
          'Rencana pengerjaan dan delivery dalam sprint berjalan.',
          groups.this_week,
          {
            border: 'border-slate-800',
            bg: 'bg-slate-900/60',
            text: 'text-slate-200',
            icon: <Calendar className="w-4 h-4 text-slate-400" />,
          }
        )}

        {/* Later */}
        {renderSection(
          'Mendatang (Jangka Panjang)',
          'Tugas dengan tenggat waktu lebih dari satu pekan lagi.',
          groups.later,
          {
            border: 'border-slate-800',
            bg: 'bg-slate-900/40',
            text: 'text-slate-400',
            icon: <Calendar className="w-4 h-4 text-slate-500" />,
          }
        )}

        {/* Completed */}
        {renderSection(
          'Telah Diselesaikan',
          'Riwayat tugas yang telah selesai diuji dan diluncurkan.',
          groups.completed,
          {
            border: 'border-emerald-950/60',
            bg: 'bg-emerald-950/10',
            text: 'text-emerald-400',
            icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
          }
        )}
      </div>
    </div>
  );
};
