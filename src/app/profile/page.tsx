"use client";

import { useState, useEffect } from "react";
import { useContentStore } from "@/store/useContentStore";
import { UserCircle2, Mail, Lock, CheckCircle, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  const { currentUser, updateProfile } = useContentStore();
  const [isMounted, setIsMounted] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (currentUser) {
      setEmail(currentUser.email);
      setPassword(currentUser.password);
    }
  }, [currentUser]);

  if (!isMounted || !currentUser) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await updateProfile(currentUser.id, email, password);
    setIsLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <UserCircle2 className="text-emerald-600" size={32} /> Profil Saya
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Perbarui informasi email dan ganti kata sandimu di sini.</p>
      </div>

      <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Kolom Info Kiri */}
        <div className="md:w-1/3 bg-gray-50/50 dark:bg-gray-900/50 p-6 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mb-4 border-4 border-white dark:border-gray-800 shadow-sm">
            <UserCircle2 size={48} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="font-bold text-xl text-gray-900 dark:text-white">{currentUser.name}</h2>
          <span className={`mt-2 text-[10px] font-bold uppercase px-3 py-1 rounded-full flex items-center gap-1 ${
            currentUser.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
            currentUser.role === 'MANAGER' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          }`}>
            <ShieldCheck size={12} /> {currentUser.role}
          </span>
        </div>

        {/* Form Update Kanan */}
        <div className="md:w-2/3 p-6 sm:p-8">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 mb-6">
            Ubah Kredensial
          </h3>
          
          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider ml-1">Email Anda</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full pl-10 p-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider ml-1">Password Baru</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input required value={password} onChange={(e) => setPassword(e.target.value)} type="text" className="w-full pl-10 p-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
              </div>
              <p className="text-[10px] text-gray-500 ml-1 mt-1">*Ubah teks di atas jika ingin mengganti password lama Anda.</p>
            </div>

            <div className="pt-4">
              <button type="submit" disabled={isLoading} className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-70">
                {isLoading ? "Memproses..." : <><CheckCircle size={18} /> Simpan Perubahan</>}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}