"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ChevronRight, User, Mail, Shield, Bell, KeyRound, MessageSquare } from "lucide-react"; // Import icon baru
import LoadingScreen from "@/components/LoadingScreen";
import { format } from "date-fns"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter();

  // --- State untuk Ubah Password ---
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState("");

  // --- State untuk Notifikasi (Local State) ---
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false); // Contoh notif tambahan

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/login"); else setUser(user);
      setLoading(false);
    };
    getUser();
  }, [router]);

  // --- FUNGSI UBAH PASSWORD ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError("");
    setPasswordChangeSuccess("");
    setPasswordChangeLoading(true);

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError("Password baru dan konfirmasi tidak cocok.");
      setPasswordChangeLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      setPasswordChangeError("Password baru minimal 6 karakter.");
      setPasswordChangeLoading(false);
      return;
    }

    // Supabase tidak memiliki fungsi untuk memverifikasi "oldPassword" di client-side.
    // Keamanan oldPassword biasanya dicek di server atau user harus login ulang.
    // Untuk tujuan ini, kita akan langsung mencoba update newPassword.
    // Jika oldPassword dibutuhkan, user harus 'reauthenticate' atau ini jadi fitur backend.
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      // Error umum: "Bad Request" jika password sama, atau user tidak di-verify
      setPasswordChangeError("Gagal mengubah password: " + error.message);
    } else {
      setPasswordChangeSuccess("Password berhasil diubah!");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
    setPasswordChangeLoading(false);
  };

  if (loading) return <LoadingScreen />;
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-white text-slate-900 antialiased overflow-hidden">
      {/* SIDEBAR KIRI */}
      <Sidebar role={user.user_metadata.role} userName={user.user_metadata.full_name} />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 border-b border-slate-100 px-10 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
            <span className="text-indigo-600">Dashboard</span>
            <ChevronRight size={14} />
            <span className="text-slate-900">Pengaturan</span>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-10 space-y-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pengaturan Akun</h1>
          <p className="text-slate-500 font-medium max-w-xl">
            Kelola informasi profil Anda, pengaturan keamanan, dan preferensi notifikasi.
          </p>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Navigasi Tab */}
            <nav className="flex-none w-full md:w-60 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <ul className="space-y-2">
                <li><button onClick={() => setActiveTab("profile")} className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "profile" ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}><User size={18} /> Profil Saya</button></li>
                <li><button onClick={() => setActiveTab("account")} className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "account" ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}><Shield size={18} /> Akun & Keamanan</button></li>
                <li><button onClick={() => setActiveTab("notifications")} className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "notifications" ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}><Bell size={18} /> Notifikasi</button></li>
              </ul>
            </nav>

            {/* Konten Tab */}
            <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              {activeTab === "profile" && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><User size={20} className="text-indigo-600"/> Detail Profil</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <p className="font-semibold text-slate-700 w-28">Nama Lengkap:</p>
                      <p className="font-bold text-slate-900">{user.user_metadata.full_name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold text-slate-700 w-28">Email:</p>
                      <p className="font-bold text-slate-900">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold text-slate-700 w-28">Role:</p>
                      <p className="font-bold text-indigo-600 uppercase">{user.user_metadata.role}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "account" && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Shield size={20} className="text-indigo-600"/> Akun & Keamanan</h2>
                  
                  {/* Form Ubah Password */}
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2"><KeyRound size={18}/> Ubah Password</h3>
                    {passwordChangeError && <p className="text-red-500 text-sm font-medium">{passwordChangeError}</p>}
                    {passwordChangeSuccess && <p className="text-green-500 text-sm font-medium">{passwordChangeSuccess}</p>}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Password Baru</label>
                      <input 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none" 
                        required 
                        minLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password Baru</label>
                      <input 
                        type="password" 
                        value={confirmNewPassword} 
                        onChange={(e) => setConfirmNewPassword(e.target.value)} 
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none" 
                        required 
                        minLength={6}
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors"
                      disabled={passwordChangeLoading}
                    >
                      {passwordChangeLoading ? "Memproses..." : "Ubah Password"}
                    </button>
                  </form>
                  
                  {/* Contoh: Kelola Sesi */}
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mt-8 mb-2"><MessageSquare size={18}/> Kelola Sesi</h3>
                  <p className="text-slate-600 max-w-md">Anda saat ini login di {format(new Date(), 'dd MMM yyyy, HH:mm')}.</p>
                  <button onClick={() => alert('Fitur keluar dari semua perangkat belum diimplementasi')} className="mt-4 px-5 py-2.5 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors">Keluar dari Semua Perangkat</button>
                </div>
              )}

              {activeTab === "notifications" && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Bell size={20} className="text-indigo-600"/> Preferensi Notifikasi</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700">Notifikasi Email</label>
                      <input 
                        type="checkbox" 
                        checked={emailNotifications} 
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700">Notifikasi Dalam Aplikasi</label>
                      <input 
                        type="checkbox" 
                        checked={inAppNotifications} 
                        onChange={(e) => setInAppNotifications(e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700">Notifikasi SMS (membutuhkan nomor telepon)</label>
                      <input 
                        type="checkbox" 
                        checked={smsNotifications} 
                        onChange={(e) => setSmsNotifications(e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        disabled // Disabled karena fitur SMS belum diimplementasi
                      />
                    </div>
                    {/* <button className="mt-6 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Simpan Notifikasi</button> */}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <RightSidebar userId={user.id} />
    </div>
  );
}