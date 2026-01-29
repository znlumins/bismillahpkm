"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ChevronRight, BookOpen, Clock, User2, Edit, Trash2, Plus } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen"; // <-- IMPORT INI

interface ClassData {
  id: string;
  creator_user_id: string;
  class_name: string;
  class_code: string;
  lecturer_name: string;
  schedule_time: string;
  room_location: string;
}

export default function KelaskuPage() {
  const [user, setUser] = useState<any>(null);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);
  const [form, setForm] = useState({
    class_name: "",
    class_code: "",
    lecturer_name: "",
    schedule_time: "",
    room_location: "",
  });

  const fetchClasses = async (userId: string, userRole: string) => {
    let query = supabase.from('classes').select('*');
    if (userRole === "DOSEN") {
      query = query.eq('creator_user_id', userId);
    } 
    query = query.order('class_name', { ascending: true });

    const { data: classesData, error } = await query;
    if (error) console.error("Error fetching classes:", error);
    else setClasses(classesData || []);
  };

  useEffect(() => {
    const fetchUserAndClasses = async () => {
      setLoading(true); // Mulai loading
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);
      await fetchClasses(user.id, user.user_metadata.role);
      setLoading(false); // Selesai loading
    };
    fetchUserAndClasses();
  }, [router]);

  if (loading) return <LoadingScreen />; // <-- RENDER LOADING SCREEN DI SINI
  if (!user) return null;

  const handleOpenCreateModal = () => { /* ... */ };
  const handleOpenEditModal = (cls: ClassData) => { /* ... */ };
  const handleSubmit = async (e: React.FormEvent) => { /* ... */ };
  const handleDelete = async (classId: string, creatorId: string) => { /* ... */ };

  return (
    <div className="flex min-h-screen bg-white text-slate-900 antialiased overflow-hidden">
      <Sidebar role={user.user_metadata.role} userName={user.user_metadata.full_name} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-100 px-10 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
            <span className="text-indigo-600">Akademik</span>
            <ChevronRight size={14} />
            <span className="text-slate-900">Kelasku</span>
          </div>
          {user.user_metadata.role === "DOSEN" && (
            <button onClick={handleOpenCreateModal} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm flex items-center gap-2 shadow-md">
              <Plus size={16} /> Tambah Kelas
            </button>
          )}
        </header>
        
        <div className="flex-1 overflow-y-auto p-10 space-y-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Daftar Kelasku</h1>
          <p className="text-slate-500 font-medium max-w-xl">
            {user.user_metadata.role === "DOSEN" 
              ? "Kelola semua kelas yang Anda ajarkan."
              : "Lihat semua kelas yang sedang Anda ikuti di semester ini."}
          </p>

          <div className="space-y-4">
            {classes.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-2xl text-center">
                <p className="text-lg text-slate-400 font-bold">Tidak ada kelas aktif.</p>
                {user.user_metadata.role === "DOSEN" && (
                  <button onClick={handleOpenCreateModal} className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm flex items-center gap-2 mx-auto shadow-md">
                    <Plus size={16} /> Tambah Kelas Pertama
                  </button>
                )}
              </div>
            ) : (
              classes.map(cls => (
                <div key={cls.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{cls.class_name} <span className="text-slate-400 text-sm">({cls.class_code})</span></h3>
                    
                    {user.user_metadata.role === "DOSEN" && cls.creator_user_id === user.id && (
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); handleOpenEditModal(cls); }} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors" title="Edit Kelas">
                          <Edit size={18} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(cls.id, cls.creator_user_id); }} className="p-2 rounded-full hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors" title="Hapus Kelas">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-2"><User2 size={16} /> Dosen: {cls.lecturer_name}</p>
                  <p className="text-sm text-slate-500 flex items-center gap-2"><Clock size={16} /> Waktu: {cls.schedule_time} di {cls.room_location}</p>
                  
                  {user.user_metadata.role === "MAHASISWA" && (
                    <button className="mt-4 px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Lihat Materi Kelas</button>
                  )}
                </div>
              ))
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
              {editingClass ? "Edit Kelas" : "Tambah Kelas Baru"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kelas</label>
                <input 
                  type="text" 
                  value={form.class_name} 
                  onChange={(e) => setForm({...form, class_name: e.target.value})} 
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kode Kelas (Unique)</label>
                <input 
                  type="text" 
                  value={form.class_code} 
                  onChange={(e) => setForm({...form, class_code: e.target.value})} 
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Dosen</label>
                <input 
                  type="text" 
                  value={form.lecturer_name} 
                  onChange={(e) => setForm({...form, lecturer_name: e.target.value})} 
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jadwal & Waktu</label>
                <input 
                  type="text" 
                  value={form.schedule_time} 
                  onChange={(e) => setForm({...form, schedule_time: e.target.value})} 
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none" 
                  placeholder="Contoh: Senin, 10:00 - 12:00"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi Ruangan</label>
                <input 
                  type="text" 
                  value={form.room_location} 
                  onChange={(e) => setForm({...form, room_location: e.target.value})} 
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none" 
                  placeholder="Contoh: Gedung IF-42, Ruang 201"
                  required 
                />
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
                  {editingClass ? "Simpan Perubahan" : "Tambah Kelas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}