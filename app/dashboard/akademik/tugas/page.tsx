"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ChevronRight, FileText, CheckCircle, XCircle, Edit, Trash2, Plus, Calendar } from "lucide-react";
import { format, isPast, parseISO, isToday, isTomorrow } from "date-fns";
import { id } from "date-fns/locale";
import LoadingScreen from "@/components/LoadingScreen"; // <-- IMPORT LOADING SCREEN DI SINI

interface TaskData {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  deadline: string; // ISO string
  progress: number; // 0-100
}

export default function TugasPage() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true); // Default: true saat pertama kali
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [form, setForm] = useState({
    title: "",
    subject: "",
    deadline: "", // format yyyy-MM-ddTHH:mm
    progress: 0,
  });

  const fetchTasks = async (userId: string, userRole: string) => {
    let query = supabase.from('tasks').select('*');
    if (userRole === "MAHASISWA") {
      query = query.eq('user_id', userId);
    } 
    else if (userRole === "DOSEN") {
      query = query.eq('user_id', userId);
    }
    query = query.order('deadline', { ascending: true });

    const { data: tasksData, error } = await query;
    if (error) console.error("Error fetching tasks:", error);
    else setTasks(tasksData || []);
  };

  useEffect(() => {
    const fetchUserAndTasks = async () => {
      setLoading(true); // Mulai loading
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);
      await fetchTasks(user.id, user.user_metadata.role);
      setLoading(false); // Selesai loading
    };
    fetchUserAndTasks();
  }, [router]);

  // --- RENDER LOADING SCREEN JIKA SEDANG LOADING ---
  if (loading) {
    return <LoadingScreen />;
  }
  // --- END LOADING SCREEN ---

  if (!user) return null; // Harusnya tidak tercapai karena sudah ada redirect

  const handleOpenCreateModal = () => { /* ... fungsi tetap sama ... */ };
  const handleOpenEditModal = (task: TaskData) => { /* ... fungsi tetap sama ... */ };
  const handleSubmit = async (e: React.FormEvent) => { /* ... fungsi tetap sama ... */ };
  const handleDelete = async (taskId: string) => { /* ... fungsi tetap sama ... */ };

  return (
    <div className="flex min-h-screen bg-white text-slate-900 antialiased overflow-hidden">
      <Sidebar role={user.user_metadata.role} userName={user.user_metadata.full_name} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-100 px-10 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
            <span className="text-indigo-600">Akademik</span>
            <ChevronRight size={14} />
            <span className="text-slate-900">Tugas & Project</span>
          </div>
          {user.user_metadata.role === "DOSEN" && (
            <button onClick={handleOpenCreateModal} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm flex items-center gap-2 shadow-md">
              <Plus size={16} /> Tambah Tugas
            </button>
          )}
        </header>
        
        <div className="flex-1 overflow-y-auto p-10 space-y-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tugas & Project Saya</h1>
          <p className="text-slate-500 font-medium max-w-xl">
            Kelola semua tugas, project, dan laporan Anda. Lihat tenggat waktu dan progresnya di sini.
          </p>

          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-2xl text-center">
                <p className="text-lg text-slate-400 font-bold">Tidak ada tugas aktif.</p>
                {user.user_metadata.role === "DOSEN" && (
                  <button onClick={handleOpenCreateModal} className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm flex items-center gap-2 mx-auto shadow-md">
                    <Plus size={16} /> Tambah Tugas Pertama
                  </button>
                )}
              </div>
            ) : (
              tasks.map(task => {
                const deadlineDate = parseISO(task.deadline);
                const isOverdue = isPast(deadlineDate);
                const deadlineString = format(deadlineDate, 'dd MMMM yyyy, HH:mm', { locale: id });
                const isTodayOrTomorrow = isToday(deadlineDate) || isTomorrow(deadlineDate);

                return (
                  <div key={task.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{task.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                          isOverdue ? 'bg-red-100 text-red-600' : (task.progress === 100 ? 'bg-green-100 text-green-600' : (isTodayOrTomorrow ? 'bg-orange-100 text-orange-600 animate-pulse' : 'bg-amber-100 text-amber-600'))
                        }`}>
                          {isOverdue ? 'Terlambat' : (task.progress === 100 ? 'Selesai' : (isTodayOrTomorrow ? 'Segera' : 'Aktif'))}
                        </span>
                        
                        <button onClick={(e) => { e.stopPropagation(); handleOpenEditModal(task); }} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors" title="Edit Tugas">
                          <Edit size={18} />
                        </button>
                        
                        {user.user_metadata.role === "DOSEN" && (
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }} className="p-2 rounded-full hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors" title="Hapus Tugas">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500">Mata Kuliah: {task.subject}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                      <Calendar size={16} /> Deadline: {deadlineString}
                    </p>
                    
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${task.progress}%` }}></div>
                      </div>
                      <span className="text-sm font-bold text-slate-600">{task.progress}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      <RightSidebar userId={user.id} />

      {/* MODAL CRUD */}
      {isModalOpen && ( /* ... kode modal tetap sama ... */
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {editingTask ? 
                (user.user_metadata.role === "MAHASISWA" ? "Update Progress Tugas" : "Edit Detail Tugas") 
                : "Tambah Tugas Baru"
              }
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul Tugas</label>
                <input 
                  type="text" 
                  value={form.title} 
                  onChange={(e) => setForm({...form, title: e.target.value})} 
                  className={`w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none ${user.user_metadata.role === "MAHASISWA" ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                  required 
                  readOnly={user.user_metadata.role === "MAHASISWA"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mata Kuliah</label>
                <input 
                  type="text" 
                  value={form.subject} 
                  onChange={(e) => setForm({...form, subject: e.target.value})} 
                  className={`w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none ${user.user_metadata.role === "MAHASISWA" ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                  required 
                  readOnly={user.user_metadata.role === "MAHASISWA"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
                <input 
                  type="datetime-local" 
                  value={form.deadline} 
                  onChange={(e) => setForm({...form, deadline: e.target.value})} 
                  className={`w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none ${user.user_metadata.role === "MAHASISWA" ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                  required 
                  readOnly={user.user_metadata.role === "MAHASISWA"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Progress (%)</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={form.progress} 
                  onChange={(e) => setForm({...form, progress: parseInt(e.target.value)})} 
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                />
                <span className="block text-right text-sm font-bold text-indigo-600 mt-1">{form.progress}%</span>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors"
                >
                  {editingTask ? "Simpan Perubahan" : "Tambah Tugas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}