"use client";

import { useState, useEffect } from "react";
import { useContentStore } from "@/store/useContentStore";
import { 
  CheckCircle, ExternalLink, Clock, AlertCircle, PlayCircle, FileText, Link as LinkIcon, XCircle
} from "lucide-react";
import { format, parseISO } from "date-fns";

export default function ApprovalsPage() {
  const { contents, updateContent, role } = useContentStore(); // Kita pakai updateContent
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  const pendingApprovals = contents.filter(c => c.status === "Ready to Publish");

  const handleApprove = (id: string) => {
    if (confirm("Apakah kamu yakin ingin menyetujui konten ini?")) {
      // Hapus catatan revisi jika diapprove
      updateContent(id, { status: "Approved", revisionNote: "" });
    }
  };

  const handleRevise = (id: string) => {
    const reason = prompt("Berikan alasan revisi (karyawan akan melihat ini):");
    if (reason) {
      updateContent(id, { status: "Process", revisionNote: reason });
    }
  };

  const handleReject = (id: string) => {
    const reason = prompt("Berikan alasan kenapa konten ini ditolak:");
    if (reason) {
      updateContent(id, { status: "Rejected", revisionNote: reason });
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Content Approvals</h1>
        <p className="text-gray-500 dark:text-gray-400">Tinjau dan setujui konten yang telah disiapkan oleh tim kreatif.</p>
      </div>

      {pendingApprovals.length === 0 ? (
        <div className="bg-gray-50 dark:bg-[#121212] border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl h-64 flex flex-col items-center justify-center text-gray-500">
          <CheckCircle size={48} className="mb-4 opacity-20" />
          <p className="font-medium">Semua rapi! Tidak ada konten yang menunggu persetujuan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pendingApprovals.map((item) => (
            <div key={item.id} className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:border-blue-500/50 transition-colors">
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-[10px] font-bold rounded uppercase tracking-wider">Ready to Publish</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} /> Jadwal: {format(parseISO(item.publishDate), "dd MMM yyyy")}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1 italic">{item.pillar} Pillar</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><FileText size={12} /> Copywriting / Naskah</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed">{item.copywriting || "Tidak ada naskah."}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><FileText size={12} /> Caption</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed">{item.caption || "Tidak ada caption."}</p>
                  </div>
                </div>
              </div>

              <div className="md:w-64 flex flex-col gap-3 justify-between border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-6">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase">Review File</h4>
                  <a href={item.linkVideo} target="_blank" className="flex items-center justify-between w-full p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors group">
                    <div className="flex items-center gap-2 font-medium text-sm"><PlayCircle size={18} /> Tonton Video</div>
                    <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                  {item.referenceUrl && (
                    <a href={item.referenceUrl} target="_blank" className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1.5 px-1"><LinkIcon size={12} /> Lihat Referensi</a>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button disabled={role === "KARYAWAN"} onClick={() => handleApprove(item.id)} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"><CheckCircle size={16} /> Approve</button>
                  <button disabled={role === "KARYAWAN"} onClick={() => handleRevise(item.id)} className="w-full py-2.5 bg-white dark:bg-transparent border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2"><AlertCircle size={16} /> Minta Revisi</button>
                  <button disabled={role === "KARYAWAN"} onClick={() => handleReject(item.id)} className="w-full py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2"><XCircle size={16} /> Tolak</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}