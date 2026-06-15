"use client";

import { useState, useEffect } from "react";
import { useContentStore } from "@/store/useContentStore";
import { Users, Settings as SettingsIcon, CheckCircle, XCircle, Target, Tags, Trash2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // Import Supabase

export default function SettingsPage() {
  const { role, pendingMembers, activeMembers, approveMember, rejectMember, deleteMember } = useContentStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // State untuk form Settings
  const { monthlyTarget: storeTarget, contentPillars: storePillars, fetchAllData } = useContentStore(); // Tambahkan ini di atas
  const [monthlyTarget, setMonthlyTarget] = useState(30);
  const [pillars, setPillars] = useState("");

// Di dalam useEffect, sinkronkan datanya:
useEffect(() => {
  setIsMounted(true);
  if (role !== "ADMIN") router.push("/");
  setMonthlyTarget(storeTarget);
  setPillars(storePillars.join(', '));
}, [role, router, storeTarget, storePillars]);

  if (!isMounted || role !== "ADMIN") return null;

  // Fungsi Simpan Target
  const handleSaveTarget = async () => {
    const { error } = await supabase.from('app_settings').update({ monthly_target: monthlyTarget }).eq('id', 1);
    if (!error) alert("Target bulanan berhasil diperbarui!");
    else alert("Gagal menyimpan target. Pastikan tabel app_settings sudah ada.");
    fetchAllData();
  };

  // Fungsi Simpan Pilar
  const handleUpdatePillars = async () => {
    // Pecah teks berdasarkan koma menjadi array
    const pillarsArray = pillars.split(',').map(p => p.trim());
    const { error } = await supabase.from('app_settings').update({ pillars: pillarsArray }).eq('id', 1);
    if (!error) alert("Pilar konten berhasil diperbarui!");
    else alert("Gagal memperbarui pilar.");
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <SettingsIcon className="text-emerald-600" size={32} /> Pengaturan Workspace
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Area khusus Administrator.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI: SETTINGS APLIKASI */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 space-y-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Parameter Sistem</h3>
            
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2"><Target size={16} className="text-blue-500" /> Target Bulanan</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={monthlyTarget} 
                  onChange={(e) => setMonthlyTarget(Number(e.target.value))}
                  className="w-full p-2.5 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg text-sm outline-none" 
                />
                <button onClick={handleSaveTarget} className="px-4 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-lg text-sm font-bold transition-colors">Save</button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2"><Tags size={16} className="text-pink-500" /> Content Pillars</label>
              <textarea 
                value={pillars} 
                onChange={(e) => setPillars(e.target.value)}
                rows={3} 
                className="w-full p-2.5 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg text-sm outline-none resize-none" 
              />
              <button onClick={handleUpdatePillars} className="w-full py-2.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-lg text-sm font-bold transition-colors">Update Pillars</button>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: TABEL MANAJEMEN TIM */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* TABEL PENDING APPROVAL */}
          <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2"><Users size={20} className="text-emerald-600" /> Menunggu Persetujuan</h3>
              </div>
              {pendingMembers.length > 0 && <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full animate-pulse">{pendingMembers.length} Pending</span>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                  <tr><th className="px-5 py-3 font-medium">Nama & Email</th><th className="px-5 py-3 font-medium">Role</th><th className="px-5 py-3 font-medium text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {pendingMembers.length === 0 ? (
                    <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-500">Belum ada permintaan baru.</td></tr>
                  ) : (
                    pendingMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                        <td className="px-5 py-4">
                          <div className="font-bold text-gray-900 dark:text-white">{member.name}</div>
                          <div className="text-xs text-gray-500">{member.email}</div>
                        </td>
                        <td className="px-5 py-4"><span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{member.role}</span></td>
                        <td className="px-5 py-4 flex justify-end gap-2">
                          <button onClick={() => approveMember(member.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-md font-medium text-xs"><CheckCircle size={14} /> Approve</button>
                          <button onClick={() => rejectMember(member.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-md font-medium text-xs"><XCircle size={14} /> Tolak</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABEL KARYAWAN AKTIF */}
          <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2"><ShieldCheck size={20} className="text-blue-600" /> Anggota Tim Aktif</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                  <tr><th className="px-5 py-3 font-medium">Nama & Email</th><th className="px-5 py-3 font-medium">Role</th><th className="px-5 py-3 font-medium text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {activeMembers.length === 0 ? (
                    <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-500">Belum ada anggota tim.</td></tr>
                  ) : (
                    activeMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                        <td className="px-5 py-4">
                          <div className="font-bold text-gray-900 dark:text-white">{member.name} {member.email === 'admin@kampus.ac.id' && '(You)'}</div>
                          <div className="text-xs text-gray-500">{member.email}</div>
                        </td>
                        <td className="px-5 py-4"><span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${member.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>{member.role}</span></td>
                        <td className="px-5 py-4 flex justify-end gap-2">
                          {member.email !== 'admin@kampus.ac.id' && (
                            <button onClick={() => { if(confirm(`Yakin ingin menendang ${member.name} dari tim?`)) deleteMember(member.id) }} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Hapus Akun Karyawan">
                              <Trash2 size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}