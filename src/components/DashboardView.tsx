import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  AlertCircle, 
  Bug, 
  Sparkles, 
  Layers, 
  ArrowRight,
  TrendingUp,
  Check,
  Calendar,
  Code2
} from 'lucide-react';
import { BacklogItem, AppProject } from '../types';
import { getDeadlineInfo } from '../utils/notifications';
import { PriorityIndicator, TypeIndicator, DeadlineDisplay } from './Badges';

interface DashboardViewProps {
  tasks: BacklogItem[];
  apps: AppProject[];
  selectedAppId: string;
  onSelectApp: (appId: string) => void;
  onOpenTask: (task: BacklogItem) => void;
  onQuickToggleComplete: (taskId: string) => void;
  onOpenNewTask: () => void;
  onNavigateToKanban: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  apps,
  selectedAppId,
  onSelectApp,
  onOpenTask,
  onQuickToggleComplete,
  onOpenNewTask,
  onNavigateToKanban,
}) => {
  // Filter tasks based on selected app
  const filteredTasks = selectedAppId === 'all' 
    ? tasks 
    : tasks.filter((t) => t.appId === selectedAppId);

  const appMap = new Map(apps.map((a) => [a.id, a]));

  // Metrics calculation
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter((t) => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalEstimatedHours = filteredTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
  const totalSpentHours = filteredTasks.reduce((acc, t) => acc + (t.spentHours || 0), 0);

  // Status breakdown
  const statusCounts = {
    backlog: filteredTasks.filter((t) => t.status === 'backlog').length,
    todo: filteredTasks.filter((t) => t.status === 'todo').length,
    in_progress: filteredTasks.filter((t) => t.status === 'in_progress').length,
    review: filteredTasks.filter((t) => t.status === 'review').length,
    done: completedTasks,
  };

  // Priority breakdown
  const priorityCounts = {
    critical: filteredTasks.filter((t) => t.priority === 'critical' && t.status !== 'done').length,
    high: filteredTasks.filter((t) => t.priority === 'high' && t.status !== 'done').length,
    medium: filteredTasks.filter((t) => t.priority === 'medium' && t.status !== 'done').length,
    low: filteredTasks.filter((t) => t.priority === 'low' && t.status !== 'done').length,
  };

  // Type breakdown
  const typeCounts = {
    bug: filteredTasks.filter((t) => t.type === 'bug').length,
    feature: filteredTasks.filter((t) => t.type === 'feature').length,
    refactor: filteredTasks.filter((t) => t.type === 'refactor').length,
    maintenance: filteredTasks.filter((t) => t.type === 'maintenance').length,
  };

  // Deadline urgency classification
  const urgentTasks = filteredTasks
    .filter((t) => t.status !== 'done' && t.dueDate)
    .map((task) => ({
      task,
      deadline: getDeadlineInfo(task.dueDate, false),
    }))
    .filter((item) => item.deadline.state === 'overdue' || item.deadline.state === 'due_today' || item.deadline.state === 'due_soon')
    .sort((a, b) => a.deadline.hoursRemaining - b.deadline.hoursRemaining);

  const overdueCount = urgentTasks.filter((t) => t.deadline.state === 'overdue').length;
  const dueTodayCount = urgentTasks.filter((t) => t.deadline.state === 'due_today').length;

  return (
    <div className="space-y-6">
      {/* App Scope Filter Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Dashboard Pengembangan Aplikasi
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Pantau ringkasan backlog, beban kerja estimasi jam, dan peringatan tenggat waktu
          </p>
        </div>

        {/* App Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => onSelectApp('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              selectedAppId === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Semua ({tasks.length})
          </button>
          {apps.map((app) => {
            const count = tasks.filter((t) => t.appId === app.id).length;
            const isSelected = selectedAppId === app.id;
            return (
              <button
                key={app.id}
                onClick={() => onSelectApp(app.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: app.color }}
                />
                <span>{app.name}</span>
                <span className="font-mono text-[10px] text-slate-500">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Completion Progress */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tingkat Penyelesaian</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {completionRate}%
            </span>
            <span className="text-xs text-slate-400">
              <span className="font-mono tabular-nums text-slate-300 font-semibold">{completedTasks}</span> dari {totalTasks} tugas
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Estimated vs Spent Hours */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Estimasi vs Jam Terpakai</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {totalSpentHours.toFixed(1)}
              <span className="text-xs font-normal text-slate-400 ml-1">/ {totalEstimatedHours} Jam</span>
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Burned: {totalEstimatedHours > 0 ? Math.round((totalSpentHours / totalEstimatedHours) * 100) : 0}%</span>
            <span>Sisa: {Math.max(0, totalEstimatedHours - totalSpentHours).toFixed(1)} Jam</span>
          </div>
        </div>

        {/* Metric 3: Critical Deadlines */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Peringatan Tenggat Waktu</span>
            <AlertCircle className={`w-4 h-4 ${overdueCount > 0 ? 'text-rose-500' : 'text-amber-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono tabular-nums ${
              overdueCount > 0 ? 'text-rose-400' : 'text-white'
            }`}>
              {overdueCount}
            </span>
            <span className="text-xs text-slate-400">
              terlambat & <span className="font-mono tabular-nums font-semibold text-amber-400">{dueTodayCount}</span> hari ini
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400">
            {overdueCount > 0 ? (
              <span className="text-rose-400 font-medium">Perlu tindakan darurat segera</span>
            ) : dueTodayCount > 0 ? (
              <span className="text-amber-400 font-medium">Ada tugas jatuh tempo hari ini</span>
            ) : (
              <span className="text-emerald-400">Semua tugas dalam jadwal aman</span>
            )}
          </div>
        </div>

        {/* Metric 4: Backlog Types Ratio */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Komposisi Backlog</span>
            <Layers className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {typeCounts.bug}
              <span className="text-xs font-normal text-slate-400 ml-1">Bug</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {typeCounts.feature}
              <span className="text-xs font-normal text-slate-400 ml-1">Fitur</span>
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
            <span>{typeCounts.refactor} Refactor</span>
            <span>·</span>
            <span>{typeCounts.maintenance} Maintenance</span>
          </div>
        </div>
      </div>

      {/* Visual Chart 1: Status Progression Pipeline */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Alur Pengerjaan (Pipeline Status)</h2>
            <p className="text-xs text-slate-400">Distribusi seluruh tugas backlog dalam tahap siklus pengembangan</p>
          </div>
          <button
            onClick={onNavigateToKanban}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>Buka Papan Kanban</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pipeline Bar */}
        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
          {totalTasks > 0 ? (
            <>
              <div
                style={{ width: `${(statusCounts.backlog / totalTasks) * 100}%` }}
                className="bg-slate-600 h-full transition-all"
                title={`Backlog: ${statusCounts.backlog}`}
              />
              <div
                style={{ width: `${(statusCounts.todo / totalTasks) * 100}%` }}
                className="bg-blue-600 h-full transition-all"
                title={`To Do: ${statusCounts.todo}`}
              />
              <div
                style={{ width: `${(statusCounts.in_progress / totalTasks) * 100}%` }}
                className="bg-amber-500 h-full transition-all"
                title={`In Progress: ${statusCounts.in_progress}`}
              />
              <div
                style={{ width: `${(statusCounts.review / totalTasks) * 100}%` }}
                className="bg-purple-500 h-full transition-all"
                title={`Testing/Review: ${statusCounts.review}`}
              />
              <div
                style={{ width: `${(statusCounts.done / totalTasks) * 100}%` }}
                className="bg-emerald-500 h-full transition-all"
                title={`Done: ${statusCounts.done}`}
              />
            </>
          ) : (
            <div className="w-full bg-slate-800" />
          )}
        </div>

        {/* Pipeline Legend & Count */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span>Backlog Ide</span>
            </div>
            <span className="text-lg font-bold font-mono text-white mt-1 tabular-nums">
              {statusCounts.backlog}
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Direncanakan</span>
            </div>
            <span className="text-lg font-bold font-mono text-white mt-1 tabular-nums">
              {statusCounts.todo}
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Sedang Dikerjakan</span>
            </div>
            <span className="text-lg font-bold font-mono text-white mt-1 tabular-nums">
              {statusCounts.in_progress}
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Review & QA</span>
            </div>
            <span className="text-lg font-bold font-mono text-white mt-1 tabular-nums">
              {statusCounts.review}
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Selesai Diluncurkan</span>
            </div>
            <span className="text-lg font-bold font-mono text-white mt-1 tabular-nums">
              {statusCounts.done}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Urgent Deadlines vs App Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section A: Urgent Tasks & Deadlines (Fitur Notifikasi Tenggat) */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>Perlu Perhatian Tenggat Waktu</span>
                {urgentTasks.length > 0 && (
                  <span className="font-mono text-xs text-rose-400 font-bold tabular-nums">
                    ({urgentTasks.length})
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">Tugas yang terlambat, jatuh tempo hari ini, atau besok</p>
            </div>
          </div>

          {urgentTasks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2 opacity-80" />
              <p className="text-sm font-medium text-slate-200">Tidak ada tenggat waktu kritis!</p>
              <p className="text-xs text-slate-500 max-w-xs mt-0.5">
                Semua tugas aktif masih berada dalam batas waktu yang aman atau sudah selesai.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 mt-2 flex-1 overflow-y-auto max-h-[360px] pr-1">
              {urgentTasks.map(({ task, deadline }) => {
                const app = appMap.get(task.appId);
                const isOverdue = deadline.state === 'overdue';
                const isToday = deadline.state === 'due_today';

                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border transition-colors flex items-start justify-between gap-3 ${
                      isOverdue
                        ? 'bg-rose-950/20 border-rose-900/50 hover:bg-rose-950/30'
                        : isToday
                        ? 'bg-amber-950/20 border-amber-900/50 hover:bg-amber-950/30'
                        : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      {/* Quiet unboxed metadata */}
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1 flex-wrap">
                        <span className="font-mono font-semibold text-slate-300">
                          {task.code}
                        </span>
                        <span>·</span>
                        <span className="truncate max-w-[140px] text-slate-300">
                          {app?.name || 'Aplikasi'}
                        </span>
                        <span>·</span>
                        <PriorityIndicator priority={task.priority} showIcon={false} />
                      </div>

                      {/* Title */}
                      <button
                        onClick={() => onOpenTask(task)}
                        className="text-xs font-medium text-slate-100 hover:text-indigo-300 transition-colors text-left line-clamp-1"
                      >
                        {task.title}
                      </button>

                      {/* Deadline Countdown & Hours */}
                      <div className="mt-2 flex items-center gap-3 text-xs flex-wrap">
                        <DeadlineDisplay deadline={deadline} />
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-400 font-mono text-[11px] tabular-nums">
                          ⏱️ {task.spentHours}/{task.estimatedHours} Jam
                        </span>
                      </div>
                    </div>

                    {/* Quick Complete Action */}
                    <div className="flex items-center gap-1 shrink-0 pt-1">
                      <button
                        onClick={() => onQuickToggleComplete(task.id)}
                        title="Tandai Selesai"
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40 rounded border border-slate-700/60 hover:border-emerald-600/50 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section B: App Breakdown & Workload Matrix */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Beban Kerja Berdasarkan Aplikasi</h2>
              <p className="text-xs text-slate-400">Total alokasi jam dan jumlah tugas tiap aplikasi</p>
            </div>
          </div>

          <div className="space-y-3.5 mt-2 flex-1">
            {apps.map((app) => {
              const appTasks = tasks.filter((t) => t.appId === app.id);
              const appCompleted = appTasks.filter((t) => t.status === 'done').length;
              const appEstHours = appTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
              const appSpentHours = appTasks.reduce((acc, t) => acc + (t.spentHours || 0), 0);
              const progressPct = appTasks.length > 0 ? Math.round((appCompleted / appTasks.length) * 100) : 0;

              return (
                <div key={app.id} className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: app.color }}
                      />
                      <span className="font-semibold text-slate-200">{app.name}</span>
                      <span className="text-[11px] font-mono text-slate-400">[{app.key}]</span>
                      <span className="text-[11px] font-mono text-slate-500">{app.version}</span>
                    </div>

                    <div className="text-right font-mono tabular-nums text-slate-300">
                      <span>{appCompleted}/{appTasks.length} Selesai ({progressPct}%)</span>
                    </div>
                  </div>

                  {/* Hours progress bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progressPct}%`,
                        backgroundColor: app.color,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span className="font-mono tabular-nums">
                      Estimasi: {appEstHours} Jam (Terpakai: {appSpentHours} Jam)
                    </span>
                    <button
                      onClick={() => onSelectApp(app.id)}
                      className="text-indigo-400 hover:text-indigo-300 hover:underline"
                    >
                      Filter aplikasi &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Priority Distribution Matrix */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
        <h2 className="text-sm font-semibold text-white mb-3">Distribusi Tingkat Prioritas Backlog Aktif</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-rose-950/10 border border-rose-900/30 rounded-lg">
            <span className="text-xs text-rose-400 font-semibold block">P1 · Kritis (Critical)</span>
            <span className="text-2xl font-bold font-mono text-rose-400 tabular-nums mt-1 block">
              {priorityCounts.critical}
            </span>
            <span className="text-[11px] text-slate-400">Harus segera diperbaiki</span>
          </div>

          <div className="p-3 bg-amber-950/10 border border-amber-900/30 rounded-lg">
            <span className="text-xs text-amber-400 font-semibold block">P2 · Tinggi (High)</span>
            <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums mt-1 block">
              {priorityCounts.high}
            </span>
            <span className="text-[11px] text-slate-400">Sprint berjalan saat ini</span>
          </div>

          <div className="p-3 bg-sky-950/10 border border-sky-900/30 rounded-lg">
            <span className="text-xs text-sky-400 font-semibold block">P3 · Sedang (Medium)</span>
            <span className="text-2xl font-bold font-mono text-sky-400 tabular-nums mt-1 block">
              {priorityCounts.medium}
            </span>
            <span className="text-[11px] text-slate-400">Rilis versi berikutnya</span>
          </div>

          <div className="p-3 bg-slate-950/20 border border-slate-800 rounded-lg">
            <span className="text-xs text-slate-400 font-semibold block">P4 · Rendah (Low)</span>
            <span className="text-2xl font-bold font-mono text-slate-300 tabular-nums mt-1 block">
              {priorityCounts.low}
            </span>
            <span className="text-[11px] text-slate-500">Peningkatan minor / backlog</span>
          </div>
        </div>
      </div>
    </div>
  );
};
