import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  Download, 
  Layers, 
  Check, 
  X,
  Bug,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { BacklogItem, AppProject, TaskStatus, TaskPriority, TaskType } from '../types';
import { getDeadlineInfo } from '../utils/notifications';
import { exportToCSV } from '../utils/storage';
import { PriorityIndicator, TypeIndicator, DeadlineDisplay } from './Badges';

interface TaskListViewProps {
  tasks: BacklogItem[];
  apps: AppProject[];
  selectedAppId: string;
  onSelectApp: (appId: string) => void;
  onOpenTask: (task: BacklogItem) => void;
  onRequestDeleteTask: (task: BacklogItem) => void;
  onToggleComplete: (taskId: string) => void;
  onOpenNewTask: () => void;
  onSwitchToKanban: () => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  apps,
  selectedAppId,
  onSelectApp,
  onOpenTask,
  onRequestDeleteTask,
  onToggleComplete,
  onOpenNewTask,
  onSwitchToKanban,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const appMap = new Map(apps.map((a) => [a.id, a]));

  // Metrics for active app scope
  const scopedTasks = selectedAppId === 'all' 
    ? tasks 
    : tasks.filter((t) => t.appId === selectedAppId);

  const totalCount = scopedTasks.length;
  const completedCount = scopedTasks.filter((t) => t.status === 'done').length;
  const inProgressCount = scopedTasks.filter((t) => t.status === 'in_progress').length;
  const backlogCount = scopedTasks.filter((t) => t.status === 'backlog' || t.status === 'todo').length;

  const totalEstHours = scopedTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
  const totalSpentHours = scopedTasks.reduce((acc, t) => acc + (t.spentHours || 0), 0);
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Deadline checks
  const urgentCount = scopedTasks.filter((t) => {
    if (t.status === 'done' || !t.dueDate) return false;
    const info = getDeadlineInfo(t.dueDate, false);
    return info.state === 'overdue' || info.state === 'due_today';
  }).length;

  // Filter tasks for list
  const filteredTasks = scopedTasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchCode = t.code.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchCode && !matchDesc) return false;
    }
    return true;
  });

  const handleDownloadCSV = () => {
    const csvContent = exportToCSV(filteredTasks, apps);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bigma_dev_backlog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If no tasks exist in the whole app yet:
  if (tasks.length === 0) {
    return (
      <div className="py-16 px-4 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-indigo-950/80 border border-indigo-800/80 flex items-center justify-center text-indigo-400 mx-auto mb-4 shadow-lg shadow-indigo-950/40">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Belum Ada Tugas Backlog
        </h2>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          Mulai kelola perbaikan bug dan ide pengembangan aplikasi Anda. Data yang Anda buat akan otomatis tersimpan aman di browser dan tidak akan hilang walau halaman ditutup atau dimuat ulang.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onOpenNewTask}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Tugas Pertama Anda</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 4 Clean Top Dashboard KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Backlog */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Tugas</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {totalCount}
            </span>
            <span className="text-xs text-slate-400">
              ({inProgressCount} aktif)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {backlogCount} dalam antrean ide
          </div>
        </div>

        {/* Card 2: Completion Rate */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Progres Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {completionPercentage}%
            </span>
            <span className="text-xs text-slate-400">
              ({completedCount}/{totalCount})
            </span>
          </div>
          <div className="mt-2.5 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Card 3: Total Estimated Hours */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Estimasi Jam</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {totalEstHours}
              <span className="text-xs font-normal text-slate-400 ml-1">Jam</span>
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Terpakai: <span className="text-slate-200 font-mono">{totalSpentHours} Jam</span>
          </div>
        </div>

        {/* Card 4: Urgent Deadlines */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tenggat Waktu</span>
            <AlertCircle className={`w-4 h-4 ${urgentCount > 0 ? 'text-rose-500' : 'text-emerald-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono tabular-nums ${urgentCount > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
              {urgentCount}
            </span>
            <span className="text-xs text-slate-400">
              perlu perhatian
            </span>
          </div>
          <div className="mt-2 text-[11px]">
            {urgentCount > 0 ? (
              <span className="text-rose-400 font-medium">Ada tugas terlambat / hari ini</span>
            ) : (
              <span className="text-emerald-400">Jadwal aman</span>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari tugas atau kode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="all">Semua Status</option>
            <option value="backlog">Antrean Ide</option>
            <option value="in_progress">Sedang Dikerjakan</option>
            <option value="done">Selesai</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Semua Tipe</option>
            <option value="bug">🐞 Perbaikan Bug</option>
            <option value="feature">✨ Fitur Baru</option>
            <option value="refactor">⚡ Peningkatan</option>
            <option value="maintenance">🛡️ Pemeliharaan</option>
          </select>

          {/* CSV Export */}
          <button
            onClick={handleDownloadCSV}
            title="Download CSV"
            className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-800 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Task List Items */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 bg-slate-900/60 rounded-xl border border-slate-800">
            Tidak ada tugas yang sesuai dengan pencarian atau filter.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const app = appMap.get(task.appId);
            const isDone = task.status === 'done';
            const deadline = getDeadlineInfo(task.dueDate, isDone);

            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                  isDone
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                    : deadline.state === 'overdue'
                    ? 'bg-rose-950/15 border-rose-900/40 hover:border-rose-800/60'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Left side: Toggle Done Checkbox & Details */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Quick Toggle Done Button */}
                  <button
                    type="button"
                    onClick={() => onToggleComplete(task.id)}
                    title={isDone ? 'Buka kembali tugas' : 'Tandai selesai'}
                    className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-colors shrink-0 ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-700 hover:border-emerald-500 text-transparent hover:text-emerald-400'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onOpenTask(task)}>
                    {/* Header meta */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1 flex-wrap">
                      <span className="font-mono font-semibold text-slate-300">
                        {task.code}
                      </span>
                      <span>·</span>
                      <span className="text-slate-300 font-medium">
                        {app?.name || 'Aplikasi'}
                      </span>
                      <span>·</span>
                      <PriorityIndicator priority={task.priority} showIcon={false} />
                      <span>·</span>
                      <TypeIndicator type={task.type} showIcon={false} />
                    </div>

                    {/* Title */}
                    <h3 className={`text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors ${
                      isDone ? 'line-through text-slate-400' : ''
                    }`}>
                      {task.title}
                    </h3>

                    {/* Description preview if exists */}
                    {task.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {task.description}
                      </p>
                    )}

                    {/* Deadline and Hours footer */}
                    <div className="mt-2 flex items-center gap-3 text-xs flex-wrap">
                      <DeadlineDisplay deadline={deadline} />
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400 font-mono text-[11px] tabular-nums">
                        ⏱️ {task.spentHours}/{task.estimatedHours} Jam
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Action buttons */}
                <div className="flex items-center justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  {/* Status Badge */}
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium border mr-1 ${
                    task.status === 'done'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                      : task.status === 'in_progress'
                      ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {task.status === 'done' ? 'Selesai' : task.status === 'in_progress' ? 'Dikerjakan' : 'Antrean'}
                  </span>

                  {/* Edit Button */}
                  <button
                    onClick={() => onOpenTask(task)}
                    title="Edit Tugas"
                    className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-md transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* DIRECT DELETE BUTTON WITH CONFIRMATION */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestDeleteTask(task);
                    }}
                    title="Hapus Tugas Ini"
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
