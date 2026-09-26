import React from 'react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Edit3, 
  Check, 
  Clock 
} from 'lucide-react';
import { BacklogItem, AppProject, TaskStatus } from '../types';
import { getDeadlineInfo } from '../utils/notifications';
import { PriorityIndicator, TypeIndicator, DeadlineDisplay } from './Badges';

interface KanbanViewProps {
  tasks: BacklogItem[];
  apps: AppProject[];
  selectedAppId: string;
  onOpenTask: (task: BacklogItem) => void;
  onRequestDeleteTask: (task: BacklogItem) => void;
  onMoveTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onOpenNewTaskWithStatus: (status: TaskStatus) => void;
}

const COLUMNS: { id: TaskStatus; label: string; color: string; badgeColor: string }[] = [
  { id: 'backlog', label: 'Antrean Ide', color: 'border-slate-700', badgeColor: 'bg-slate-800 text-slate-300' },
  { id: 'in_progress', label: 'Sedang Dikerjakan', color: 'border-amber-500', badgeColor: 'bg-amber-950/60 text-amber-300' },
  { id: 'done', label: 'Selesai', color: 'border-emerald-500', badgeColor: 'bg-emerald-950/60 text-emerald-300' },
];

export const KanbanView: React.FC<KanbanViewProps> = ({
  tasks,
  apps,
  selectedAppId,
  onOpenTask,
  onRequestDeleteTask,
  onMoveTaskStatus,
  onOpenNewTaskWithStatus,
}) => {
  const appMap = new Map(apps.map((a) => [a.id, a]));

  const filteredTasks = selectedAppId === 'all'
    ? tasks
    : tasks.filter((t) => t.appId === selectedAppId);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {COLUMNS.map((column) => {
          // Group tasks: 'todo' and 'review' also map logically to backlog and in_progress if any
          const colTasks = filteredTasks.filter((t) => {
            if (column.id === 'backlog') return t.status === 'backlog' || t.status === 'todo';
            if (column.id === 'in_progress') return t.status === 'in_progress' || t.status === 'review';
            return t.status === 'done';
          });

          return (
            <div
              key={column.id}
              className={`bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col min-h-[460px] border-t-2 ${column.color} shadow-sm`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-200">
                    {column.label}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${column.badgeColor}`}>
                    {colTasks.length}
                  </span>
                </div>

                <button
                  onClick={() => onOpenNewTaskWithStatus(column.id)}
                  title={`Tambah tugas ke ${column.label}`}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Task Cards */}
              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-600 border border-dashed border-slate-800 rounded-lg">
                    Kosong
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const app = appMap.get(task.appId);
                    const deadline = getDeadlineInfo(task.dueDate, task.status === 'done');

                    return (
                      <div
                        key={task.id}
                        className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg p-3 transition-colors shadow-sm cursor-pointer group"
                        onClick={() => onOpenTask(task)}
                      >
                        {/* Header: App Name & Code */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                          <span className="font-semibold text-slate-300 truncate max-w-[140px]">
                            {app?.name || 'Aplikasi'}
                          </span>
                          <PriorityIndicator priority={task.priority} showIcon={false} />
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-relaxed">
                          {task.title}
                        </h4>

                        {/* Deadline & Hours */}
                        <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                          <DeadlineDisplay deadline={deadline} compact={true} />
                          <span className="font-mono text-slate-400 text-[10px] tabular-nums">
                            {task.estimatedHours}j
                          </span>
                        </div>

                        {/* Actions bar */}
                        <div
                          className="mt-2 pt-1.5 flex items-center justify-between border-t border-slate-900"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-1">
                            {column.id !== 'backlog' && (
                              <button
                                onClick={() => onMoveTaskStatus(task.id, 'backlog')}
                                title="Pindahkan ke Antrean"
                                className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
                              >
                                &larr; Antrean
                              </button>
                            )}

                            {column.id === 'backlog' && (
                              <button
                                onClick={() => onMoveTaskStatus(task.id, 'in_progress')}
                                title="Mulai Kerjakan"
                                className="px-1.5 py-0.5 text-[10px] text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded font-medium"
                              >
                                Kerjakan &rarr;
                              </button>
                            )}

                            {column.id === 'in_progress' && (
                              <button
                                onClick={() => onMoveTaskStatus(task.id, 'done')}
                                title="Tandai Selesai"
                                className="px-1.5 py-0.5 text-[10px] text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded font-medium flex items-center gap-0.5"
                              >
                                <Check className="w-3 h-3" />
                                <span>Selesai</span>
                              </button>
                            )}
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => onRequestDeleteTask(task)}
                            title="Hapus Tugas"
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
