"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import LoadingScreen from "@/components/LoadingScreen";
import GlobalSearch from "@/components/GlobalSearch";
import NotificationBell from "@/components/NotificationBell";
import { 
  GraduationCap, Zap, Clock, 
  Megaphone, ChevronRight, ArrowUpRight 
} from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);

      const { data: statsData } = await supabase.from('academic_stats').select('*').eq('user_id', user.id).single();
      setStats(statsData);

      const { data: tasksData } = await supabase.from('tasks').select('*').eq('user_id', user.id).order('deadline', { ascending: true }).limit(1);
      setTasks(tasksData || []);

      setLoading(false);
    };
    fetchData();
  }, [router]);

  if (loading) {
    return <LoadingScreen />;
  }

  const fullName = user?.user_metadata.full_name || "Pengguna";
  const role = user?.user_metadata.role || "Mahasiswa";

  return (
    <div className="flex min-h-screen bg-white text-slate-900 antialiased overflow-hidden">
      <Sidebar role={role} userName={fullName} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER: SEKARANG INI AKAN SCROLL DENGAN KONTEN */}
        <header className="h-16 border-b border-slate-100 px-10 flex items-center justify-between bg-white/80 backdrop-blur-md shrink-0"> {/* Hapus sticky, top-0, z-10, ganti flex-1 jadi shrink-0 */}
          <GlobalSearch />
          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </header>

        {/* SCROLLABLE CONTENT: SELURUH KONTEN DI BAWAH HEADER AKAN SCROLL */}
        <div className="flex-1 overflow-y-auto p-10 space-y-12"> {/* Ini adalah div yang akan di-scroll */}
          
          {/* WELCOME BANNER (DARK CONTRAST) */}
          <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-12 text-white shadow-2xl shadow-slate-100">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-80 h-80 bg-indigo-600 rounded-full blur-[120px] opacity-30"></div>
            <div className="relative z-10">
              <p className="text-indigo-400 font-bold uppercase tracking-[0.3em] text-[10px] mb-4">Portal Akademik Terintegrasi</p>
              <h1 className="text-5xl font-bold tracking-tight mb-3 italic uppercase">Halo, {fullName.split(' ')[0]}! 👋</h1>
              <p className="text-slate-400 max-w-md font-medium text-lg leading-snug">
                Siap untuk produktif hari ini? Masuk ke ruang studio untuk memulai sesi pembelajaran aksesibilitas Anda.
              </p>
              <div className="mt-10 flex gap-4">
                <button onClick={() => router.push('/dashboard/studio')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 shadow-xl shadow-indigo-900/40 group">
                  <Zap size={18} fill="currentColor" className="group-hover:scale-110 transition-all" /> Mulai Sesi Studio
                </button>
                <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-3.5 rounded-2xl text-sm font-bold transition-all">Lihat Capaian</button>
              </div>
            </div>
          </section>

          {/* QUICK STATS CARDS */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-7 bg-white border border-slate-100 rounded-3xl shadow-sm hover:border-indigo-100 transition-all">
              <div className="flex justify-between items-start mb-6 text-indigo-600">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center"><GraduationCap size={24} /></div>
                <span className="text-[10px] font-bold bg-green-50 text-green-700 px-3 py-1 rounded-full uppercase tracking-wider">Aktif</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-1 text-xl italic uppercase tracking-tighter">Status Akademik</h3>
              <p className="text-sm text-slate-400 font-bold mb-6">Semester Ganjil 2025/2026</p>
              <div className="pt-6 border-t border-slate-50 flex justify-between">
                <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">SKS Terdaftar</p><p className="font-black text-slate-800 text-lg">{stats?.sks_diambil || 0}/{stats?.sks_total || 0}</p></div>
                <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Presensi</p><p className="font-black text-slate-800 text-lg">{stats?.presensi || 0}%</p></div>
              </div>
            </div>

            <div className="p-7 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-100 group cursor-pointer hover:scale-[1.02] transition-all">
              <div className="flex justify-between items-start mb-6 text-white text-opacity-80">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><Zap size={24} fill="currentColor" /></div>
                <ArrowUpRight size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
              <h3 className="font-bold text-white mb-2 text-xl italic uppercase tracking-tighter">Fitur Aksesibilitas</h3>
              <p className="text-sm text-indigo-100 font-medium mb-6 leading-relaxed">Gunakan teknologi Translate Gesture & Speech-to-Text terbaru kami.</p>
              <span className="text-[10px] font-bold text-white bg-indigo-500 px-3 py-1.5 rounded-xl uppercase tracking-widest">4 Modul Aktif</span>
            </div>

            <div className="p-7 bg-white border border-slate-100 rounded-3xl shadow-sm hover:border-red-100 transition-all">
              <div className="flex justify-between items-start mb-6 text-red-500">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center"><Clock size={24} /></div>
                <span className="text-[10px] font-bold bg-red-50 text-red-600 px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">Penting</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-1 text-xl italic uppercase tracking-tighter">Deadline Tugas</h3>
              {tasks.length > 0 ? (
                <>
                  <p className="text-sm text-slate-400 font-bold mb-6 italic truncate">{tasks[0].title}</p>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full w-[70%]" style={{ width: `${tasks[0].progress}%` }}></div>
                  </div>
                  <p className="mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Progress: {tasks[0].progress}%</p>
                </>
              ) : (
                <p className="text-sm text-slate-300 italic font-bold">Tidak ada tugas aktif</p>
              )}
            </div>
          </section>

          {/* PAPAN PENGUMUMAN (LIST) */}
          <section className="bg-slate-50/50 rounded-[3rem] p-10 border border-slate-100 shadow-inner">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><Megaphone size={22} /></div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">Papan Pengumuman</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Update Terakhir: Hari Ini</p>
                </div>
              </div>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors uppercase tracking-widest">Lihat Semua <ChevronRight size={14} /></button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                { title: "Pembukaan Pendaftaran Beasiswa Semester Genap", date: "12 Jan", tag: "Akademik", color: "blue" },
                { title: "Pemeliharaan Server Utama Studio (Pkl 22:00)", date: "10 Jan", tag: "Update", color: "yellow" },
                { title: "Batas Akhir Pengisian KRS Diperpanjang", date: "08 Jan", tag: "Penting", color: "red" },
              ].map((news, i) => (
                <div key={i} className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-indigo-600 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-6">
                    <div className="text-center min-w-[50px] border-r-2 border-slate-50 pr-6 hidden sm:block">
                      <p className="text-xl font-black text-slate-900 tracking-tighter leading-none mb-1">{news.date.split(' ')[0]}</p>
                      <p className="text-[10px] font-black text-slate-300 uppercase leading-none">{news.date.split(' ')[1]}</p>
                    </div>
                    <div>
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest mb-2 inline-block ${
                        news.color === 'blue' ? 'bg-blue-50 text-blue-600' : 
                        news.color === 'yellow' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-600'
                      }`}>
                        {news.tag}
                      </span>
                      <h4 className="text-slate-800 font-bold group-hover:text-indigo-600 transition-colors tracking-tight text-lg">{news.title}</h4>
                    </div>
                  </div>
                  <ArrowUpRight size={22} className="text-slate-200 group-hover:text-slate-900 transition-all" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <RightSidebar userId={user.id} />
    </div>
  );
}