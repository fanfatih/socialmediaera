"use client";

import { useState, useEffect } from "react";
import { useContentStore, Account } from "@/store/useContentStore";
import { Shield, Plus, X, Eye, EyeOff, Key, User, Clock, Trash2, Edit } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function AccountsPage() {
  const { accounts, addAccount, updateAccount, deleteAccount, role } = useContentStore();
  const [isMounted, setIsMounted] = useState(false);
  
  // State Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // State Form
  const [platform, setPlatform] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // State Keamanan (Melihat Password)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  const isKaryawan = role === "KARYAWAN";

  const togglePasswordVisibility = (id: string) => {
    if (isKaryawan) return; // Karyawan tidak bisa melihat password
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openModalForNew = () => {
    if (isKaryawan) return;
    setEditId(null); setPlatform(""); setUsername(""); setPassword("");
    setIsModalOpen(true);
  };

  const openModalForEdit = (acc: Account) => {
    if (isKaryawan) return;
    setEditId(acc.id); setPlatform(acc.platform); setUsername(acc.username); setPassword(acc.password);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (isKaryawan) return;
    if (confirm("Yakin ingin menghapus akun ini dari sistem?")) deleteAccount(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform || !username || !password) return;

    const payload = {
      platform,
      username,
      password,
      // PERBAIKAN: Gunakan '||' agar jika role null, dia akan mengirim string "Unknown"
      lastUpdatedBy: role || "Unknown", 
      lastUpdatedAt: new Date().toISOString()
    };

    if (editId) updateAccount(editId, payload);
    else addAccount({ id: Math.random().toString(36).substr(2, 9), ...payload });
    
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-12">
      {/* HEADER */}
      <div className="flex justify-between items-end gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="text-blue-600" size={32} /> Password Manager
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Penyimpanan aman akun sosial media. Hanya Admin dan Manager yang dapat melihat dan mengubah kredensial.
          </p>
        </div>
        {!isKaryawan && (
          <button onClick={openModalForNew} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Plus size={18} /> Tambah Akun
          </button>
        )}
      </div>

      {/* GRID AKUN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((acc) => {
          const isVisible = visiblePasswords[acc.id] && !isKaryawan;
          
          return (
            <div key={acc.id} className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm hover:border-blue-500/30 transition-colors flex flex-col gap-4">
              
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
                    <User size={16} />
                  </div>
                  {acc.platform}
                </h3>
                {!isKaryawan && (
                  <div className="flex gap-2">
                    <button onClick={() => openModalForEdit(acc)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(acc.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"><Trash2 size={16} /></button>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-3 space-y-3 border border-gray-100 dark:border-gray-800/60">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email / Username</label>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-200 font-mono bg-white dark:bg-[#1a1a1a] p-2 rounded border border-gray-200 dark:border-gray-800 select-all">
                    {acc.username}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <div className={`text-sm font-medium font-mono p-2 rounded border transition-colors flex items-center ${isKaryawan ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 text-red-500 select-none' : 'bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-200 select-all'}`}>
                      {isKaryawan ? "•••••••• (Akses Ditolak)" : (isVisible ? acc.password : "••••••••••••")}
                    </div>
                    {!isKaryawan && (
                      <button 
                        onClick={() => togglePasswordVisibility(acc.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1.5" title="Terakhir diperbarui oleh">
                  <Key size={12} />
                  Diubah oleh: <span className="font-semibold text-gray-700 dark:text-gray-300">{acc.lastUpdatedBy}</span>
                </div>
                <div className="flex items-center gap-1.5" title="Waktu pembaruan">
                  <Clock size={12} />
                  {format(parseISO(acc.lastUpdatedAt), "dd MMM yyyy, HH:mm")}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* MODAL FORM (Hanya untuk Admin/Manager) */}
      {isModalOpen && !isKaryawan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">{editId ? "Edit Akun" : "Tambah Akun Baru"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Platform</label>
                <input required autoFocus value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder="Contoh: TikTok Utama..." className="w-full p-2.5 bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email / Username</label>
                <input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="email@kampus.ac.id" className="w-full p-2.5 bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password yang kuat..." className="w-full p-2.5 bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-md rounded-lg transition-colors">Simpan Akun</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}