"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, eachDayOfInterval 
} from "date-fns";
import { id } from "date-fns/locale";
import { Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";

export default function RightSidebar({ userId }: { userId: string }) {
  // --- STATE KALENDER ---
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();

  // --- STATE JADWAL (DATABASE) ---
  const [schedules, setSchedules] = useState<any[]>([]);

  // --- LOGIKA FETCH JADWAL ---
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!userId) return;
      const { data } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', userId);
      setSchedules(data || []);
    };
    fetchSchedules();
  }, [userId]);

  // --- LOGIKA GENERATE TANGGAL KALENDER ---
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  return (
    <aside className="w-80 min-h-screen bg-slate-50/50 border-l border-slate-100 p-6 flex flex-col gap-8 hidden xl:flex overflow-y-auto shrink-0">
      
      {/* 1. SECTION KALENDER (DINAMIS) */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 italic">
            <CalendarIcon size={16} className="text-indigo-600" /> 
            {format(currentMonth, "MMMM yyyy", { locale: id })}
          </h3>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          {/* Header Nama Hari */}
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-tighter">
            <span>M</span><span>S</span><span>S</span><span>R</span><span>K</span><span>J</span><span>S</span>
          </div>
          
          {/* Grid Angka Tanggal */}
          <div className="grid grid-cols-7 text-center gap-y-1 font-medium">
            {days.map((day, i) => (
              <span 
                key={i} 
                className={`text-[11px] py-1.5 rounded-lg transition-all flex items-center justify-center ${
                  !isSameMonth(day, currentMonth) ? "text-slate-200" : 
                  isSameDay(day, today) 
                    ? "bg-slate-900 text-white font-bold shadow-md shadow-slate-200 scale-110" 
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {format(day, "d")}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 2. SECTION TIMELINE HARI INI (DINAMIS DARI DB) */}
      <section>
        <h3 className="text-xs font-bold text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-widest italic leading-none">
          <Clock size={16} className="text-indigo-600" /> Timeline Hari Ini
        </h3>
        <div className="space-y-3">
          {schedules.length > 0 ? (
            schedules.map((item) => (
              <div key={item.id} className="group bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-600 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-tighter leading-none ${item.is_live ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    {item.start_time} {item.is_live && '- LIVE'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                  {item.subject_name}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase tracking-tight">
                  {item.location}
                </p>
              </div>
            ))
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-6 rounded-2xl text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase italic">Tidak Ada Jadwal</p>
            </div>
          )}
        </div>
      </section>

    </aside>
  );
}