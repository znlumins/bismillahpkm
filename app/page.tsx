// app/page.tsx
import Link from "next/link";
import Image from "next/image"; // Import Image dari Next.js
// import { getServerSession } from "next-auth"; // TIDAK DIPAKAI KARENA KITA PAKAI SUPABASE AUTH

export default async function LandingPage() {
  // --- CATATAN:
  // Kita TIDAK LAGI menggunakan NextAuth.js (getServerSession)
  // karena sudah beralih ke Supabase Auth.
  // Untuk mengecek session di Server Component dengan Supabase,
  // perlu setup Supabase Server Component Client.
  // Untuk menyederhanakan, kita asumsikan jika user sudah login, mereka akan
  // langsung diarahkan ke /dashboard oleh mekanisme client-side di layout/dashboard.

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col items-center justify-center p-8 text-slate-900 antialiased">
      {/* Brand & Logo */}
      <div className="text-center mb-10">
        <Link href="/">
          <Image
            src="/vero-logo.svg" // Pastikan logo Anda ada di public/vero-logo.svg
            alt="VeroApp Logo"
            width={150}
            height={60}
            priority
            className="mx-auto mb-8 drop-shadow-md"
          />
        </Link>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight italic leading-tight">
          Selamat Datang di <span className="text-indigo-600">VeroApp</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-700 max-w-xl mx-auto font-medium leading-relaxed">
          Sistem informasi akademik terintegrasi untuk mendukung mahasiswa dan dosen meraih potensi maksimal.
        </p>
      </div>

      {/* Bagian Tombol Aksi */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        {/* Tombol Login */}
        <Link 
          href="/login" 
          className="w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-xl shadow-indigo-200 hover:shadow-2xl hover:-translate-y-1"
        >
          Masuk ke Akun
        </Link>
        
        {/* Tombol Register */}
        <Link 
          href="/register" 
          className="w-full text-center bg-white border-2 border-slate-300 text-slate-800 hover:bg-slate-50 hover:border-slate-400 font-bold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          Daftar Sekarang
        </Link>
      </div>

      {/* Footer Sederhana */}
      <footer className="absolute bottom-8 text-slate-500 text-sm font-medium">
        © {new Date().getFullYear()} VeroApp. Hak Cipta Dilindungi.
      </footer>
    </div>
  );
}