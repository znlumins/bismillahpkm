// components/NotificationBell.tsx
"use client";
import { Bell } from "lucide-react";
import { useState } from "react";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(3); // Contoh: 3 notifikasi belum dibaca

  const handleOpenNotifications = () => {
    alert(`Membuka notifikasi. Ada ${unreadCount} yang belum dibaca.`);
    setUnreadCount(0); // Setelah dibuka, notifikasi dianggap sudah dibaca
    // Di sini bisa ada modal pop-up untuk daftar notifikasi
  };

  return (
    <button 
      onClick={handleOpenNotifications} 
      className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors"
      title={`Notifikasi (${unreadCount} belum dibaca)`}
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
      )}
    </button>
  );
}