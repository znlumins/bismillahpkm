"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ChevronRight, Compass, Search } from "lucide-react";
import Image from "next/image";
import LoadingScreen from "@/components/LoadingScreen"; // <-- IMPORT INI

interface CourseData {
  id: number;
  title: string;
  lecturer: string;
  image: string;
}

export default function JelajahiPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      setLoading(true); // Mulai loading
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/login"); else setUser(user);
      setLoading(false); // Selesai loading
    };
    getUser();
  }, [router]);

  if (loading) return <LoadingScreen />; // <-- RENDER LOADING SCREEN DI SINI
  if (!user) return null;

  const courses: CourseData[] = [ // Dummy data, bisa diganti dengan fetch dari Supabase nanti
    { id: 1, title: "Dasar Pemrograman Web", lecturer: "Prof. Ahmad", image: "/courses/webdev.jpg" },
    { id: 2, title: "Pengantar Machine Learning", lecturer: "Dr. Siti", image: "/courses/ml.jpg" },
    { id: 3, title: "Desain UI/UX Lanjutan", lecturer: "Bpk. Budi", image: "/courses/uiux.jpg" },
    { id: 4, title: "Sistem Basis Data", lecturer: "Ibu. Ani", image: "/courses/database.jpg" },
  ];

  return (
    <div className="flex min-h-screen bg-white text-slate-900 antialiased overflow-hidden">
      <Sidebar role={user.user_metadata.role} userName={user.user_metadata.full_name} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-100 px-10 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
            <span className="text-indigo-600">Akademik</span>
            <ChevronRight size={14} />
            <span className="text-red-500">Jelajahi</span>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-50 w-64">
            <Search size={16} className="text-slate-400" />
            <input type="text" placeholder="Cari kursus..." className="bg-transparent text-sm outline-none w-full font-medium" />
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-10 space-y-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Jelajahi Materi & Kursus</h1>
          <p className="text-slate-500 font-medium max-w-xl">
            Temukan berbagai materi pembelajaran, kursus baru, dan sumber daya akademik 
            yang bisa membantu Anda meningkatkan pengetahuan.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden">
                <Image 
                  src={course.image} 
                  alt={course.title} 
                  width={400} 
                  height={200} 
                  className="w-full h-40 object-cover rounded-t-2xl group-hover:scale-105 transition-transform" 
                />
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">Dosen: {course.lecturer}</p>
                  <button className="mt-4 px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Lihat Detail</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <RightSidebar userId={user.id} />
    </div>
  );
}