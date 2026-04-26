"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, User, Shield, ArrowRight } from "lucide-react";
import { useContentStore } from "@/store/useContentStore";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // Import Supabase!

export default function LoginPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { setCurrentUser } = useContentStore();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<'KARYAWAN' | 'MANAGER' | 'ADMIN'>('KARYAWAN');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLoginView) {
        const { data: user, error } = await supabase
          .from('team_members')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .single();

        if (error || !user) {
          alert("Email atau password salah!");
        } else if (user.status === 'approved') {
          if (!rememberMe) {
            window.addEventListener('beforeunload', () => {
                if (!rememberMe) localStorage.removeItem('workspace-auth');
            });
          }
          setCurrentUser(user);
          router.push("/");
        } else if (user.status === 'pending') {
          alert("Akunmu sedang ditinjau. Tunggu persetujuan dari Admin ya!");
        } else if (user.status === 'rejected') {
          alert("Akses ditolak oleh Admin.");
        }
      } else {
        // INI KODE REGISTER YANG KEMARIN HILANG TERTELAN BUMI
        const { error } = await supabase
          .from('team_members')
          .insert([{ name, email, password, role: selectedRole, status: 'pending' }]);

        if (error) {
          if (error.code === '23505') alert("Email ini sudah pernah didaftarkan!");
          else alert("Gagal mendaftar. Silakan coba lagi.");
        } else {
          alert("Berhasil mendaftar! Tunggu Admin melakukan Approve sebelum kamu bisa masuk.");
          setIsLoginView(true); // Lempar balik ke tampilan Login
          setPassword(""); // Kosongkan password
        }
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#f8fafc] dark:bg-[#020617]">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-300/30 dark:bg-emerald-800/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] opacity-70 animate-pulse"></div>
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-teal-300/30 dark:bg-teal-800/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] opacity-70"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-300/30 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] opacity-70"></div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/60 dark:bg-black/50 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] p-8">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">Workspace.</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {isLoginView ? "Selamat datang kembali, kreator!" : "Minta akses bergabung ke tim."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLoginView && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider ml-1">Nama Lengkap</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input required value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="John Doe" className="w-full pl-10 p-3 bg-white/50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder-gray-400" />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider ml-1">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="halo@kampus.ac.id" className="w-full pl-10 p-3 bg-white/50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder-gray-400" />
              </div>
            </div>

            {!isLoginView && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider ml-1">Daftar Sebagai</label>
                <div className="relative">
                  <Shield size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as any)} className="w-full pl-10 p-3 bg-white/50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer appearance-none text-gray-700 dark:text-gray-200">
                    <option value="KARYAWAN">Karyawan (Kreator)</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input required value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full pl-10 pr-10 p-3 bg-white/50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder-gray-400" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isLoginView && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-4 h-4 border border-gray-400 rounded group-hover:border-emerald-500 transition-colors">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="peer appearance-none w-full h-full cursor-pointer" />
                    <svg className="absolute w-3 h-3 text-emerald-500 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">Ingat saya</span>
                </label>
                <a href="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors">Lupa Password?</a>
              </div>
            )}

            <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-xl text-sm font-bold shadow-lg shadow-gray-900/20 dark:shadow-white/10 transition-all flex items-center justify-center gap-2 group mt-2 disabled:opacity-70 disabled:cursor-wait">
              {isLoading ? "Memproses..." : (isLoginView ? "Masuk ke Workspace" : "Kirim Permintaan Akses")}
              {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200/50 dark:border-gray-700/50 pt-6">
            {isLoginView ? "Belum punya akun tim? " : "Sudah terdaftar di tim? "}
            <button onClick={() => setIsLoginView(!isLoginView)} className="font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors">
              {isLoginView ? "Daftar di sini" : "Masuk sekarang"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}