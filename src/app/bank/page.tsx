"use client";

import { useState, useEffect, useRef } from "react";
import { useContentStore } from "@/store/useContentStore";
import { FolderOpen, ExternalLink, Trash2, Plus, Send, Copy, Zap, Lock } from "lucide-react"; // Tambah ikon Lock
import { format, parseISO } from "date-fns";

export default function BankKontenPage() {
  // Ambil 'role' dari brankas kita
  const { bankItems, addBankItem, deleteBankItem, role } = useContentStore();
  const [isMounted, setIsMounted] = useState(false);
  
  // State Form Manual
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");

  // --- STATE TELEGRAM ---
  const [botToken, setBotToken] = useState(""); 
  const [isPolling, setIsPolling] = useState(false);
  
  const lastUpdateIdRef = useRef(0); 
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Kunci akses untuk Karyawan
  const isKaryawan = role === "KARYAWAN";

  useEffect(() => {
    setIsMounted(true);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  const fetchTelegramMessages = async () => {
    if (!botToken) return;

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/getUpdates?offset=${lastUpdateIdRef.current + 1}`
      );
      const data = await response.json();

      if (data.ok && data.result.length > 0) {
        data.result.forEach((update: any) => {
          const messageText = update.message?.text;
          if (messageText) {
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const foundUrls = messageText.match(urlRegex);
            const newId = `tg-${update.update_id}`;

            let extractedUrl = "Pesan Telegram (Tanpa Link)";
            let extractedNote = messageText.trim();

            if (foundUrls) {
              extractedUrl = foundUrls[0];
              extractedNote = messageText.replace(extractedUrl, '').trim();
            }

            if (!extractedNote) {
              extractedNote = "Tanpa catatan tambahan.";
            }

            const currentItems = useContentStore.getState().bankItems;
            const isDuplicate = currentItems.some(item => item.id === newId);

            if (!isDuplicate) {
              addBankItem({
                id: newId,
                url: extractedUrl,
                note: extractedNote,
                dateAdded: new Date().toISOString(),
                source: "Telegram"
              });
            }
          }
          lastUpdateIdRef.current = update.update_id;
        });
      }
    } catch (error) {
      console.error("Gagal koneksi ke Telegram:", error);
    }
  };

  const togglePolling = () => {
    if (isPolling) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      setIsPolling(false);
    } else {
      if (!botToken) return alert("Masukkan Token Bot dulu!");
      setIsPolling(true);
      pollingRef.current = setInterval(fetchTelegramMessages, 5000);
    }
  };

  if (!isMounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    addBankItem({
      id: Math.random().toString(36).substr(2, 9),
      url, note, dateAdded: new Date().toISOString(), source: "Manual"
    });
    setUrl(""); setNote("");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Catatan disalin!");
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <FolderOpen className="text-blue-600" size={32} /> Bank Konten
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Kumpulkan referensi secara manual atau kirim lewat Telegram Bot.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex flex-col gap-6">
          
          {/* BANNER TELEGRAM DENGAN LOGIKA ROLE */}
          <div className={`rounded-xl p-5 text-white shadow-md relative overflow-hidden transition-all duration-500 ${isKaryawan ? 'bg-slate-700 dark:bg-slate-800' : (isPolling ? 'bg-emerald-600' : 'bg-blue-600')}`}>
            <div className="relative z-10 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Send size={18} /> {isKaryawan ? 'Integrasi Telegram' : (isPolling ? 'Telegram Aktif!' : 'Koneksi Telegram')}
              </h3>
              
              {isKaryawan ? (
                // Tampilan Khusus Karyawan (Digembok)
                <div className="bg-white/10 border border-white/20 rounded-lg p-3 text-sm flex items-start gap-2">
                  <Lock size={16} className="mt-0.5 flex-shrink-0 text-slate-300" />
                  <p className="text-slate-200 text-xs leading-relaxed">
                    Akses dikunci. Hanya Manager dan Administrator yang memiliki wewenang untuk mengkonfigurasi Token Telegram Bot.
                  </p>
                </div>
              ) : (
                // Tampilan Normal untuk Manager & Admin
                <>
                  {!isPolling && (
                    <input 
                      type="password"
                      placeholder="Paste Token Bot di sini..."
                      value={botToken}
                      onChange={(e) => setBotToken(e.target.value)}
                      className="w-full p-2 rounded bg-white/20 border border-white/30 text-white placeholder-blue-200 text-xs outline-none focus:ring-2 focus:ring-white/50"
                    />
                  )}

                  <button 
                    onClick={togglePolling}
                    className={`w-full py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${isPolling ? 'bg-white text-emerald-700 shadow-lg shadow-emerald-900/20' : 'bg-white/20 text-white border border-white/40 hover:bg-white/30'}`}
                  >
                    {isPolling ? <><Zap size={16} fill="currentColor" /> Berhenti Menarik Data</> : 'Hubungkan Bot'}
                  </button>
                  
                  {isPolling && <p className="text-[10px] text-emerald-100 animate-pulse text-center italic">Bot sedang mendengarkan pesan baru...</p>}
                </>
              )}
            </div>
            <Send size={100} className={`absolute -bottom-4 -right-4 opacity-10 -rotate-12 ${isKaryawan ? 'text-slate-400' : 'text-white'}`} />
          </div>

          {/* Form Manual (Semua Role Bisa) */}
          <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Plus size={18} className="text-gray-400" /> Tambah Manual
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://tiktok.com/..." className="w-full p-2.5 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ide naskah..." rows={4} className="w-full p-2.5 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              <button type="submit" className="w-full py-2.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-lg text-sm font-bold transition-colors">Simpan ke Bank</button>
            </form>
          </div>
        </div>

        {/* Daftar Referensi */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Referensi Tersimpan</h2>
            <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{bankItems.length} Item</span>
          </div>

          {bankItems.length === 0 ? (
            <div className="flex-1 bg-white dark:bg-[#121212] border border-dashed border-gray-300 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center p-12 text-gray-500">
              <FolderOpen size={48} className="mb-4 opacity-20" />
              <p className="font-medium">Bank Konten masih kosong.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {bankItems.map((item) => (
                <div key={item.id} className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row gap-5">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${item.source === 'Telegram' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {item.source}
                      </span>
                      <span className="text-xs text-gray-400">{format(parseISO(item.dateAdded), "dd MMM, HH:mm")}</span>
                    </div>
                    <a href={item.url} target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm flex items-start gap-1.5 break-all line-clamp-2 italic">
                      <ExternalLink size={16} className="flex-shrink-0 mt-0.5" /> {item.url}
                    </a>
                    {item.note && (
                      <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 relative group">
                        <p className="pr-6 whitespace-pre-wrap">{item.note}</p>
                        <button onClick={() => handleCopy(item.note)} className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity" title="Salin catatan"><Copy size={14} /></button>
                      </div>
                    )}
                  </div>
                  
                  {/* Hapus Item (Digembok untuk Karyawan) */}
                  {!isKaryawan && (
                    <div className="flex sm:flex-col justify-end items-end border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800 pt-3 sm:pt-0 sm:pl-5">
                      <button onClick={() => deleteBankItem(item.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors self-end sm:self-center"><Trash2 size={18} /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}