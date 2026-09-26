import React, { useState } from 'react';
import { X, Plus, Layers, Trash2, Edit3 } from 'lucide-react';
import { AppProject, BacklogItem } from '../types';

interface AppManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  apps: AppProject[];
  tasks: BacklogItem[];
  onAddApp: (app: AppProject) => void;
  onUpdateApp: (app: AppProject) => void;
  onDeleteApp: (appId: string) => void;
}

const COLOR_OPTIONS = [
  '#0284c7', // Sky
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
];

export const AppManagerModal: React.FC<AppManagerModalProps> = ({
  isOpen,
  onClose,
  apps,
  tasks,
  onAddApp,
  onUpdateApp,
  onDeleteApp,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setDescription('');
    setColor(COLOR_OPTIONS[0]);
    setIsAdding(false);
    setEditingAppId(null);
  };

  const handleStartEdit = (app: AppProject) => {
    setEditingAppId(app.id);
    setName(app.name);
    setDescription(app.description || '');
    setColor(app.color || COLOR_OPTIONS[0]);
    setIsAdding(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const key = name.trim().slice(0, 4).toUpperCase();

    if (editingAppId) {
      const existing = apps.find((a) => a.id === editingAppId);
      if (existing) {
        onUpdateApp({
          ...existing,
          name: name.trim(),
          key,
          description: description.trim(),
          color,
        });
      }
    } else {
      const newApp: AppProject = {
        id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: name.trim(),
        key,
        description: description.trim(),
        version: 'v1.0.0',
        color,
        techStack: [],
        createdAt: new Date().toISOString(),
      };
      onAddApp(newApp);
    }

    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-950/80 text-indigo-400 border border-indigo-900/60">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Kelola Daftar Aplikasi
              </h2>
              <p className="text-xs text-slate-400">
                Aplikasi atau proyek yang sedang Anda kembangkan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Top action button */}
          {!isAdding && (
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">
                {apps.length} Aplikasi Terdaftar
              </span>
              <button
                onClick={() => {
                  resetForm();
                  setIsAdding(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Aplikasi Baru</span>
              </button>
            </div>
          )}

          {/* Form to Add / Edit App */}
          {isAdding && (
            <form onSubmit={handleSave} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-semibold text-slate-200">
                  {editingAppId ? 'Perbarui Data Aplikasi' : 'Aplikasi Baru'}
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-slate-500 hover:text-slate-300"
                >
                  Batal
                </button>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Nama Aplikasi *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Toko Online, Kasir POS, Mobile App"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Deskripsi Singkat (Opsional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Aplikasi kasir offline-first untuk toko"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Warna Label
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium shadow-sm"
                >
                  Simpan
                </button>
              </div>
            </form>
          )}

          {/* Apps List */}
          <div className="space-y-2.5">
            {apps.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                Belum ada aplikasi yang terdaftar. Anda juga dapat mengetikkan nama aplikasi langsung saat membuat tugas baru.
              </div>
            ) : (
              apps.map((app) => {
                const appTasks = tasks.filter((t) => t.appId === app.id);
                const isConfirmingDelete = confirmDeleteId === app.id;

                return (
                  <div
                    key={app.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: app.color }}
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{app.name}</h4>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {appTasks.length} tugas terkait
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isConfirmingDelete ? (
                        <div className="flex items-center gap-1 bg-rose-950/80 p-1 rounded-lg border border-rose-800">
                          <span className="text-[10px] text-rose-300 px-1">Hapus?</span>
                          <button
                            onClick={() => {
                              onDeleteApp(app.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold"
                          >
                            Ya
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(app)}
                            title="Edit data aplikasi"
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(app.id)}
                            title="Hapus aplikasi"
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
