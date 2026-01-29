"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Hand, Eye, Mic, Play, Pause, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function PresentasiPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // State untuk presentasi
  const [isDetecting, setIsDetecting] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("Deteksi gesture belum dimulai...");
  const [presentationText, setPresentationText] = useState("Presentasi Visual Sedang Berlangsung.");

  useEffect(() => {
    // Auth Check
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/login"); else setUser(user);
    };
    getUser();
  }, [router]);

  // Fungsi untuk memulai/menghentikan deteksi
  const toggleDetection = () => {
    setIsDetecting(!isDetecting);
    if (!isDetecting) {
      setLiveTranscript("Mulai mendeteksi gesture tangan...");
      // Hipotetis: Di sini nanti logic untuk berkomunikasi dengan iframe/backend
    } else {
      setLiveTranscript("Deteksi gesture dihentikan.");
    }
  };

  // Fungsi untuk update transkrip (Nanti bisa dari iframe/backend)
  const updateTranscript = (newText: string) => {
    setLiveTranscript(newText);
    setPresentationText(newText); // Otomatis tampilkan di bawah
  };

  if (!user) return <div className="min-h-screen bg-white" />;

  return (
    <>
      <style jsx global>{`
        /* CSS untuk teks outline (jika diperlukan) */
        .text-stroke { -webkit-text-stroke: 1px #A1A1AA; color: transparent; }
      `}</style>

      <div className="flex min-h-screen bg-white text-slate-900 antialiased overflow-hidden">
        {/* SIDEBAR KIRI TETAP ADA */}
        <Sidebar role={user.user_metadata.role} userName={user.user_metadata.full_name} />

        {/* MAIN CONTENT AREA (Tanpa Sidebar Kanan) */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          
          {/* HEADER PRESENTASI */}
          <header className="h-20 bg-slate-900 border-b border-slate-700 px-10 flex items-center justify-between text-white shadow-lg">
            <div>
              <h1 className="text-lg font-bold tracking-tight uppercase">
                Presentasi Aksesibilitas
              </h1>
              <p className="text-xs font-semibold text-slate-400">
                {format(new Date(), "EEEE, dd MMMM yyyy", { locale: id })}
              </p>
            </div>
            {/* Tombol Control Presentasi */}
            <div className="flex gap-3">
              <button onClick={toggleDetection} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${isDetecting ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                {isDetecting ? <Pause size={16} /> : <Play size={16} />}
                {isDetecting ? "Hentikan Deteksi" : "Mulai Deteksi"}
              </button>
            </div>
          </header>

          {/* AREA KONTEN UTAMA DIBAGI DUA */}
          <div className="flex-1 grid grid-rows-2">
            
            {/* Panel Atas: Area Presenter (Webcam + Deteksi Gesture) */}
            <div className="relative bg-[#DDE2E7] flex justify-center items-center p-6 border-b border-slate-200">
              {/* IFRAME untuk aplikasi pendeteksi gesture Anda */}
              <iframe
                src={isDetecting ? "https://vero.daffaahmadalattas.web.id/" : "about:blank"} // Hanya load jika deteksi aktif
                title="Aplikasi Deteksi Gesture"
                className="w-full h-full rounded-2xl border-none shadow-xl"
                allow="camera; microphone"
              ></iframe>
              
              {/* Overlay jika deteksi belum dimulai */}
              {!isDetecting && (
                <div className="absolute inset-0 bg-slate-800 bg-opacity-90 flex flex-col items-center justify-center text-white p-10 rounded-2xl">
                  <Hand size={64} className="mb-4 opacity-70" />
                  <p className="text-xl font-bold text-center">
                    Klik "Mulai Deteksi" untuk menampilkan kamera dan mendeteksi gesture.
                  </p>
                </div>
              )}

              {/* Status Deteksi */}
              <div className="absolute bottom-6 right-6 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl text-[10px] font-bold text-slate-600 uppercase flex items-center gap-2">
                <Eye size={14} /> Status: {isDetecting ? "Aktif" : "Tidak Aktif"}
              </div>
            </div>

            {/* Panel Bawah: Area Audiens (Tampilan Transkrip Besar) */}
            <div className="relative bg-white flex flex-col justify-center p-12">
              <p className="text-6xl font-black text-slate-900 text-center max-w-5xl mx-auto leading-tight">
                {presentationText.split(' ').map((word, i) => (
                  <span key={i} className={i % 2 === 0 ? "" : "text-stroke font-medium"}>
                    {word}{' '}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}