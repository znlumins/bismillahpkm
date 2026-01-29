"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Send, MessageSquare } from "lucide-react";
import { format } from "date-fns"; // Sudah diimpor dengan benar

// Definisikan Interface untuk Pesan
interface MessageData {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export default function DiskusiPage() {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fungsi untuk mengambil pesan dari Supabase
  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }
    setMessages(data || []);
  }, []);

  useEffect(() => {
    const fetchUserAndMessages = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);
      
      // Ambil pesan awal
      fetchMessages();
    };
    fetchUserAndMessages();

    // POLING: Ambil pesan setiap 2 detik (ini adalah "realtime" kita)
    const interval = setInterval(() => {
      fetchMessages();
    }, 2000); // Fetch setiap 2 detik

    // Cleanup saat komponen unmount
    return () => clearInterval(interval);
  }, [router, fetchMessages]);

  // Fungsi untuk scroll ke bawah setiap ada pesan baru
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !user) return;

    const { error } = await supabase.from('messages').insert({
      user_id: user.id,
      user_name: user.user_metadata.full_name || user.email,
      content: newMessage.trim(),
    });

    if (error) console.error("Error sending message:", error);
    else {
      setNewMessage("");
      fetchMessages(); // Ambil pesan terbaru setelah kirim
    }
  };

  if (!user) return <div className="min-h-screen bg-white" />;

  return (
    <div className="flex min-h-screen bg-white text-slate-900 antialiased overflow-hidden">
      <Sidebar role={user.user_metadata.role} userName={user.user_metadata.full_name} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER CHAT */}
        <header className="h-20 border-b border-slate-100 px-10 flex items-center justify-between bg-white/80 backdrop-blur-md">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-3">
            <MessageSquare size={24} className="text-indigo-600" />
            Diskusi Umum <span className="text-slate-400 text-sm font-medium">(Grup Default)</span>
          </h1>
        </header>

        {/* AREA PESAN (Custom UI) */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto bg-slate-50 p-8 space-y-4 custom-scrollbar">
          {messages.map((msg, index) => {
            const isMyMessage = msg.user_id === user.id;
            const messageTime = format(new Date(msg.created_at), 'HH:mm');
            const senderInitial = msg.user_name?.charAt(0).toUpperCase() || 'U';

            return (
              <div key={msg.id || index} className={`flex items-start gap-3 ${isMyMessage ? 'justify-end' : ''}`}>
                {/* Avatar untuk pesan dari orang lain */}
                {!isMyMessage && (
                  <div className="w-9 h-9 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                    {senderInitial}
                  </div>
                )}
                
                {/* Gelembung Pesan */}
                <div className={`p-4 rounded-3xl max-w-[70%] shadow-sm text-sm ${
                  isMyMessage ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                }`}>
                  {!isMyMessage && (
                    <p className="text-xs font-bold text-indigo-600 mb-1">
                      {msg.user_name}
                    </p>
                  )}
                  <p className="leading-relaxed">{msg.content}</p>
                  <p className={`text-[10px] mt-2 text-right ${isMyMessage ? 'text-white/60' : 'text-slate-400'}`}>
                    {messageTime}
                  </p>
                </div>

                {/* Avatar untuk pesan dari user sendiri (opsional) */}
                {/* {isMyMessage && (
                  <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {senderInitial}
                  </div>
                )} */}
              </div>
            );
          })}
        </div>

        {/* INPUT PESAN */}
        <div className="flex-none p-6 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ketik pesan Anda di sini..."
              className="flex-1 bg-transparent outline-none p-3 text-sm font-medium"
            />
            <button 
              onClick={handleSendMessage}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl shadow-md transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </main>
      {/* Tanpa Right Sidebar */}
    </div>
  );
}