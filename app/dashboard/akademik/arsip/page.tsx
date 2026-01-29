"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ChevronRight, Archive, FileText, Download, Edit, Trash2, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import LoadingScreen from "@/components/LoadingScreen"; // <-- IMPORT INI

interface ArchiveItemData {
  id: string;
  user_id: string;
  title: string;
  file_url: string | null;
  file_type: string;
  description: string | null;
  created_at: string;
}

export default function ArsipPage() {
  const [user, setUser] = useState<any>(null);
  const [archiveItems, setArchiveItems] = useState<ArchiveItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ArchiveItemData | null>(null);
  const [form, setForm] = useState({
    title: "",
    file_url: "",
    file_type: "PDF",
    description: "",
  });

  const fetchArchiveItems = async (userId: string, userRole: string) => {
    let query = supabase.from('archive_items').select('*');
    if (userRole === "MAHASISWA") {
      query = query.eq('user_id', userId);
    } 
    query = query.order('created_at', { ascending: false });

    const { data: itemsData, error } = await query;
    if (error) console.error("Error fetching archive items:", error);
    else setArchiveItems(itemsData || []);
  };

  useEffect(() => {
    const fetchUserAndItems = async () => {
      setLoading(true); // Mulai loading
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);
      await fetchArchiveItems(user.id, user.user_metadata.role);
      setLoading(false); // Selesai loading
    };
    fetchUserAndItems();
  }, [router]);

  if (loading) return <LoadingScreen />; // <-- RENDER LOADING SCREEN DI SINI
  if (!user) return null;

  const handleOpenCreateModal = () => { /* ... */ };
  const handleOpenEditModal = (item: ArchiveItemData) => { /* ... */ };
  const handleSubmit = async (e: React.FormEvent) => { /* ... */ };
  const handleDelete = async (itemId: string, itemUserId: string) => { /* ... */ };

  return (
    <div className="flex min-h-screen bg-white text-slate-900 antialiased overflow-hidden">
      <Sidebar role={user.user_metadata.role} userName={user.user_metadata.full_name} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-100 px-10 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
            <span className="text-indigo-600">Akademik</span>
            <ChevronRight size={14} />
            <span className="text-slate-900">Arsip Belajar</span>
          </div>
          {user.user_metadata.role === "DOSEN" && (
            <button onClick={handleOpenCreateModal} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm flex items-center gap-2 shadow-md">
              <Plus size={16} /> Tambah Arsip
            </button>
          )}
        </header>
        
        <div className="flex-1 overflow-y-auto p-10 space-y-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Arsip Belajar Saya</h1>
          <p className="text-slate-500 font-medium max-w-xl">
            {user.user_metadata.role === "DOSEN" 
              ? "Kelola semua materi dan dokumen yang Anda arsipkan."
              : "Akses kembali semua materi dan catatan belajar Anda di sini."}
          </p>

          <div className="space-y-4">
            {archiveItems.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-2xl text-center">
                <p className="text-lg text-slate-400 font-bold">Tidak ada arsip.</p>
                {user.user_metadata.role === "DOSEN" && (
                  <button onClick={handleOpenCreateModal} className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm flex items-center gap-2 mx-auto shadow-md">
                    <Plus size={16} /> Tambah Arsip Pertama
                  </button>
                )}
              </div>
            ) : (
              archiveItems.map(item => (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">
                          Diunggah: {format(parseISO(item.created_at), 'dd MMMM yyyy', { locale: id })} • Tipe: {item.file_type}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.file_url && (
                         <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors" title="Download File">
                           <Download size={18} />
                         </a>
                      )}
                      {user.user_metadata.role === "DOSEN" && item.user_id === user.id && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); handleOpenEditModal(item); }} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors" title="Edit Arsip">
                            <Edit size={18} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.user_id); }} className="p-2 rounded-full hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors" title="Hapus Arsip">
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-sm text-slate-600 mt-3 border-t border-slate-100 pt-3">
                      <span className="font-bold">Deskripsi:</span> {item.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <RightSidebar userId={user.id} />

      {isModalOpen && ( /* ... kode modal tetap sama ... */
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {editingItem ? "Edit Arsip" : "Tambah Arsip Baru"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul Arsip</label>
                <input 
                  type="text" 
                  value={form.title} 
                  onChange={(e) => setForm({...form, title: e.target.value})} 
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL File (Opsional)</label>
                <input 
                  type="url" 
                  value={form.file_url} 
                  onChange={(e) => setForm({...form, file_url: e.target.value})} 
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none" 
                  placeholder="https://example.com/file.pdf"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipe File</label>
                <select
                  value={form.file_type}
                  onChange={(e) => setForm({...form, file_type: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none bg-white"
                >
                  <option value="PDF">PDF</option>
                  <option value="PPT">PPT</option>
                  <option value="DOC">DOC</option>
                  <option value="VIDEO">VIDEO</option>
                  <option value="AUDIO">AUDIO</option>
                  <option value="OTHER">LAINNYA</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi (Opsional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none resize-y"
                  rows={3}
                ></textarea>
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
                  {editingItem ? "Simpan Perubahan" : "Tambah Arsip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}