"use client";

import { useState, useEffect } from "react";
import { useContentStore } from "@/store/useContentStore";
import { Users, Settings as SettingsIcon, CheckCircle, XCircle, Target, Tags } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { role, pendingMembers, approveMember, rejectMember } = useContentStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (role !== "ADMIN") {
      router.push("/");
    }
  }, [role, router]);

  if (!isMounted || role !== "ADMIN") return null;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <SettingsIcon className="text-emerald-600" size={32} /> Pengaturan Workspace
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Area khusus Administrator. Kelola persetujuan anggota tim dan target operasional di sini.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI: SETTINGS APLIKASI */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 space-y-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
              Parameter Sistem
            </h3>
            
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Target size={16} className="text-blue-500" /> Target Konten Bulanan
              </label>
              <div className="flex gap-2">
                <input type="number" defaultValue={30} className="w-full p-2.5 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg text-sm outline-none" />
                <button className="px-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold">Save</button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Tags size={16} className="text-pink-500" /> Content Pillars
              </label>
              <textarea 
                defaultValue="Entertaint, Promosi, Edukasi, Inspirasi" 
                rows={3} 
                className="w-full p-2.5 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg text-sm outline-none resize-none" 
              />
              <button className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold">Update Pillars</button>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: APPROVAL ANGGOTA BARU */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                  <Users size={20} className="text-emerald-600" /> Menunggu Persetujuan
                </h3>
                <p className="text-xs text-gray-500 mt-1">Akun yang baru mendaftar belum bisa login sebelum di-Approve.</p>
              </div>
              {pendingMembers.length > 0 && (
                <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                  {pendingMembers.length} Pending
                </span>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-5 py-3 font-medium">Nama & Email</th>
                    <th className="px-5 py-3 font-medium">Role Diminta</th>
                    <th className="px-5 py-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {pendingMembers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-5 py-8 text-center text-gray-500">Belum ada permintaan akun baru.</td>
                    </tr>
                  ) : (
                    pendingMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-bold text-gray-900 dark:text-white">{member.name}</div>
                          <div className="text-xs text-gray-500">{member.email}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${member.role === 'MANAGER' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="px-5 py-4 flex justify-end gap-2">
                          <button 
                            onClick={() => approveMember(member.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 dark:text-emerald-400 rounded-md transition-colors font-medium text-xs"
                          >
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button 
                            onClick={() => rejectMember(member.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-md transition-colors font-medium text-xs"
                          >
                            <XCircle size={14} /> Tolak
                          </button>
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