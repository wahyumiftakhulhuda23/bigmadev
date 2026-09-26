import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Calendar, 
  Trash2, 
  Plus, 
  Bug, 
  Sparkles, 
  Wrench,
  CheckCircle2
} from 'lucide-react';
import { 
  BacklogItem, 
  AppProject, 
  TaskType, 
  TaskPriority, 
  TaskStatus 
} from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: BacklogItem, newAppName?: string) => void;
  onDelete?: (taskId: string) => void;
  taskToEdit?: BacklogItem | null;
  defaultStatus?: TaskStatus;
  apps: AppProject[];
  allTasks: BacklogItem[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  taskToEdit,
  defaultStatus = 'backlog',
  apps,
  allTasks,
}) => {
  const [appChoice, setAppChoice] = useState<string>(''); // existing app ID or '__new__'
  const [newAppName, setNewAppName] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [type, setType] = useState<TaskType>('bug');
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [estimatedHours, setEstimatedHours] = useState<number>(4);
  const [spentHours, setSpentHours] = useState<number>(0);
  const [dueDate, setDueDate] = useState<string>('');

  useEffect(() => {
    if (taskToEdit) {
      setAppChoice(taskToEdit.appId);
      setNewAppName('');
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setType(taskToEdit.type);
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setEstimatedHours(taskToEdit.estimatedHours || 0);
      setSpentHours(taskToEdit.spentHours || 0);
      setDueDate(taskToEdit.dueDate ? taskToEdit.dueDate.slice(0, 16) : '');
    } else {
      // Create new
      if (apps.length > 0) {
        setAppChoice(apps[0].id);
        setNewAppName('');
      } else {
        setAppChoice('__new__');
        setNewAppName('Aplikasi Utama');
      }

      setTitle('');
      setDescription('');
      setType('bug');
      setPriority('high');
      setStatus(defaultStatus);
      setEstimatedHours(4);
      setSpentHours(0);

      // Default due date: tomorrow 18:00
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      tomorrow.setHours(18, 0, 0, 0);
      const pad = (n: number) => n.toString().padStart(2, '0');
      const formatted = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T18:00`;
      setDueDate(formatted);
    }
  }, [taskToEdit, defaultStatus, isOpen, apps]);

  const setQuickDeadline = (hoursOffset: number, fixedHour?: number) => {
    const d = new Date(Date.now() + hoursOffset * 60 * 60 * 1000);
    if (fixedHour !== undefined) {
      d.setHours(fixedHour, 0, 0, 0);
    }
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setDueDate(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let targetAppId = appChoice;
    let createdAppName: string | undefined = undefined;

    if (appChoice === '__new__' || !appChoice) {
      createdAppName = newAppName.trim() || 'Aplikasi Proyek';
      targetAppId = `app-${Date.now()}`;
    }

    const taskData: BacklogItem = {
      id: taskToEdit ? taskToEdit.id : `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      appId: targetAppId,
      code: taskToEdit ? taskToEdit.code : `DEV-${allTasks.length + 101}`,
      title: title.trim(),
      description: description.trim(),
      type,
      priority,
      status,
      estimatedHours: Number(estimatedHours) || 0,
      spentHours: Number(spentHours) || 0,
      dueDate,
      checklist: taskToEdit?.checklist || [],
      createdAt: taskToEdit ? taskToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: status === 'done' ? (taskToEdit?.completedAt || new Date().toISOString()) : undefined,
    };

    onSave(taskData, createdAppName);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 className="text-base font-bold text-white">
              {taskToEdit ? 'Edit Tugas Backlog' : 'Tambah Tugas Baru'}
            </h2>
            <p className="text-xs text-slate-400">
              {taskToEdit ? `Perbarui informasi tugas ${taskToEdit.code}` : 'Catat perbaikan bug atau ide fitur aplikasi Anda'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Judul Tugas */}
          <div>
            <label className="block text-slate-200 font-semibold mb-1">
              Judul Tugas / Ringkasan *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Perbaiki error tombol simpan / Buat fitur cetak struk"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Aplikasi Proyek */}
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
            <label className="block text-slate-300 font-medium">
              Nama Aplikasi / Proyek *
            </label>

            {apps.length > 0 ? (
              <div className="space-y-2">
                <select
                  value={appChoice}
                  onChange={(e) => setAppChoice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                >
                  {apps.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name}
                    </option>
                  ))}
                  <option value="__new__">+ Tulis Nama Aplikasi Baru</option>
                </select>

                {appChoice === '__new__' && (
                  <input
                    type="text"
                    required
                    value={newAppName}
                    onChange={(e) => setNewAppName(e.target.value)}
                    placeholder="Ketik nama aplikasi baru..."
                    className="w-full bg-slate-900 border border-indigo-500/70 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                )}
              </div>
            ) : (
              <input
                type="text"
                required
                value={newAppName}
                onChange={(e) => setNewAppName(e.target.value)}
                placeholder="Masukkan nama aplikasi Anda (contoh: Kasir Pintar / Toko Online)"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            )}
          </div>

          {/* Tipe & Prioritas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Tipe Tugas
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="bug">🐞 Perbaikan Bug (Error/Rusak)</option>
                <option value="feature">✨ Tambah Fitur Baru</option>
                <option value="refactor">⚡ Peningkatan & Refactor</option>
                <option value="maintenance">🛡️ Pemeliharaan / Security</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Prioritas
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="critical">🔴 Kritis (Harus Segera)</option>
                <option value="high">🟠 Tinggi (Penting)</option>
                <option value="medium">🟡 Sedang (Normal)</option>
                <option value="low">⚪ Rendah (Bisa Nanti)</option>
              </select>
            </div>
          </div>

          {/* Estimasi Waktu & Jam Terpakai */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Estimasi Waktu Pengerjaan (Jam)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-2 text-slate-500">Jam</span>
              </div>
              <div className="flex gap-1 mt-1.5">
                {[1, 2, 4, 8].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setEstimatedHours(h)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
                  >
                    {h}j
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Waktu Terpakai Saat Ini (Jam)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={spentHours}
                  onChange={(e) => setSpentHours(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-2 text-slate-500">Jam</span>
              </div>
            </div>
          </div>

          {/* Status Pengerjaan */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Status Pengerjaan
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('backlog')}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-colors ${
                  status === 'backlog'
                    ? 'bg-slate-800 text-white border-slate-600'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Antrean Ide
              </button>
              <button
                type="button"
                onClick={() => setStatus('in_progress')}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-colors ${
                  status === 'in_progress'
                    ? 'bg-amber-950/50 text-amber-300 border-amber-600'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Sedang Dikerjakan
              </button>
              <button
                type="button"
                onClick={() => setStatus('done')}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-colors ${
                  status === 'done'
                    ? 'bg-emerald-950/50 text-emerald-300 border-emerald-600'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Selesai
              </button>
            </div>
          </div>

          {/* Tenggat Waktu (Deadline) */}
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tenggat Waktu (Deadline)</span>
              </label>
              <span className="text-[10px] text-slate-400">Pengingat notifikasi otomatis</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />

              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => setQuickDeadline(0, 18)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                >
                  Hari ini 18:00
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDeadline(24, 17)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                >
                  Besok 17:00
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDeadline(72, 18)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                >
                  +3 Hari
                </button>
              </div>
            </div>
          </div>

          {/* Keterangan Tambahan */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Catatan / Detail Tambahan (Opsional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Catatan kecil langkah perbaikan atau detail masalah..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Actions Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {taskToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(taskToEdit.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-600/80 rounded-lg transition-colors border border-rose-900/50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Tugas</span>
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
              >
                {taskToEdit ? 'Simpan Perubahan' : 'Simpan ke Backlog'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
