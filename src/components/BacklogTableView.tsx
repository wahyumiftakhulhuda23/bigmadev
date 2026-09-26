import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  ArrowUpDown, 
  Trash2, 
  Edit3, 
  CheckCircle,
  FileSpreadsheet,
  X,
  Code
} from 'lucide-react';
import { BacklogItem, AppProject, TaskStatus, TaskPriority, TaskType } from '../types';
import { getDeadlineInfo } from '../utils/notifications';
import { exportToCSV } from '../utils/storage';
import { PriorityIndicator, TypeIndicator, DeadlineDisplay } from './Badges';

interface BacklogTableViewProps {
  tasks: BacklogItem[];
  apps: AppProject[];
  selectedAppId: string;
  onSelectApp: (appId: string) => void;
  onOpenTask: (task: BacklogItem) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenNewTask: () => void;
}

type SortField = 'dueDate' | 'priority' | 'estimatedHours' | 'spentHours' | 'code' | 'title';

export const BacklogTableView: React.FC<BacklogTableViewProps> = ({
  tasks,
  apps,
  selectedAppId,
  onSelectApp,
  onOpenTask,
  onUpdateTaskStatus,
  onDeleteTask,
  onOpenNewTask,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const appMap = new Map(apps.map((a) => [a.id, a]));

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const priorityWeight: Record<TaskPriority, number> = {
    critical: 1,
    high: 2,
    medium: 3,
    low: 4,
  };

  // Filtered & Sorted
  const filteredTasks = tasks
    .filter((t) => {
      if (selectedAppId !== 'all' && t.appId !== selectedAppId) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q) ||
          (t.gitBranch && t.gitBranch.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      let comp = 0;
      if (sortField === 'dueDate') {
        const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        comp = da - db;
      } else if (sortField === 'priority') {
        comp = priorityWeight[a.priority] - priorityWeight[b.priority];
      } else if (sortField === 'estimatedHours') {
        comp = a.estimatedHours - b.estimatedHours;
      } else if (sortField === 'spentHours') {
        comp = a.spentHours - b.spentHours;
      } else if (sortField === 'code') {
        comp = a.code.localeCompare(b.code);
      } else if (sortField === 'title') {
        comp = a.title.localeCompare(b.title);
      }
      return sortAsc ? comp : -comp;
    });

  const handleDownloadCSV = () => {
    const csvContent = exportToCSV(filteredTasks, apps);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `devbacklog_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari kode, judul atau branch git..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-700/80 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
        <div className="flex items-center gap-2 flex-wrap">
          {/* App filter */}
          <select
            value={selectedAppId}
            onChange={(e) => onSelectApp(e.target.value)}
            className="bg-slate-950/70 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="all">Semua Aplikasi</option>
            {apps.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950/70 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Semua Status</option>
            <option value="backlog">Antrean Ide</option>
            <option value="todo">Direncanakan</option>
            <option value="in_progress">Sedang Dikerjakan</option>
            <option value="review">Review & Testing</option>
            <option value="done">Selesai</option>
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950/70 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Semua Prioritas</option>
            <option value="critical">P1 · Kritis</option>
            <option value="high">P2 · Tinggi</option>
            <option value="medium">P3 · Sedang</option>
            <option value="low">P4 · Rendah</option>
          </select>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950/70 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Semua Tipe</option>
            <option value="bug">Perbaikan Bug</option>
            <option value="feature">Tambah Fitur</option>
            <option value="refactor">Refaktorisasi</option>
            <option value="maintenance">Pemeliharaan</option>
          </select>

          {/* CSV Export Button */}
          <button
            onClick={handleDownloadCSV}
            title="Download CSV spreadsheet"
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* High-Density Data Grid Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium select-none">
                <th
                  onClick={() => handleSort('code')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>KODE</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('title')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors min-w-[280px]"
                >
                  <div className="flex items-center gap-1">
                    <span>JUDUL TUGAS & APLIKASI</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-3">TIPE</th>
                <th
                  onClick={() => handleSort('priority')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>PRIORITAS</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-3">STATUS PENGERJAAN</th>
                <th
                  onClick={() => handleSort('estimatedHours')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>ESTIMASI</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('spentHours')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>TERPAKAI</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('dueDate')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors min-w-[170px]"
                >
                  <div className="flex items-center gap-1">
                    <span>TENGGAT WAKTU</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">AKSI</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    Tidak ada tugas backlog yang cocok dengan kriteria filter saat ini.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const app = appMap.get(task.appId);
                  const deadline = getDeadlineInfo(task.dueDate, task.status === 'done');

                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => onOpenTask(task)}
                    >
                      {/* Code */}
                      <td className="py-3 px-3 font-mono font-semibold text-slate-300 whitespace-nowrap">
                        {task.code}
                      </td>

                      {/* Title & App */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: app?.color || '#94a3b8' }}
                            title={app?.name}
                          />
                          <span className="font-medium text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                            {task.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{app?.name || 'Aplikasi'}</span>
                          {task.gitBranch && (
                            <>
                              <span>·</span>
                              <span className="font-mono text-slate-400 text-[10px]">
                                {task.gitBranch}
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <TypeIndicator type={task.type} showIcon={false} />
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <PriorityIndicator priority={task.priority} showIcon={true} />
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={task.status}
                          onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                          className={`text-xs rounded px-2 py-1 border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer ${
                            task.status === 'done'
                              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                              : task.status === 'in_progress'
                              ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                              : task.status === 'review'
                              ? 'bg-purple-950/40 text-purple-300 border-purple-800/60'
                              : task.status === 'todo'
                              ? 'bg-blue-950/40 text-blue-300 border-blue-800/60'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          <option value="backlog">Antrean</option>
                          <option value="todo">Direncanakan</option>
                          <option value="in_progress">Sedang Dikerjakan</option>
                          <option value="review">Review & Test</option>
                          <option value="done">Selesai</option>
                        </select>
                      </td>

                      {/* Estimated Hours */}
                      <td className="py-3 px-3 text-right font-mono text-slate-300 tabular-nums whitespace-nowrap">
                        {task.estimatedHours} Jam
                      </td>

                      {/* Spent Hours */}
                      <td className="py-3 px-3 text-right font-mono text-slate-400 tabular-nums whitespace-nowrap">
                        {task.spentHours} Jam
                      </td>

                      {/* Due Date & Deadline */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <DeadlineDisplay deadline={deadline} />
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3 px-3 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() => onOpenTask(task)}
                            title="Edit Tugas"
                            className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus backlog "${task.code} - ${task.title}"?`)) {
                                onDeleteTask(task.id);
                              }
                            }}
                            title="Hapus Tugas"
                            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer summary bar */}
        <div className="py-2.5 px-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Menampilkan <span className="font-mono font-semibold text-slate-200">{filteredTasks.length}</span> dari {tasks.length} tugas
          </div>
          <div className="flex items-center gap-4 font-mono tabular-nums">
            <span>
              Total Estimasi: <strong className="text-slate-200">{filteredTasks.reduce((a, b) => a + b.estimatedHours, 0)} Jam</strong>
            </span>
            <span>
              Total Terpakai: <strong className="text-slate-200">{filteredTasks.reduce((a, b) => a + b.spentHours, 0)} Jam</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
