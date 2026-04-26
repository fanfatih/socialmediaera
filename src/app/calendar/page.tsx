"use client";

import { useState, useEffect } from "react";
import { useContentStore, Content, Status, Platform, Pillar } from "@/store/useContentStore";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, X, Link as LinkIcon, Smile, Megaphone, BookOpen, Lightbulb, AlertCircle } from "lucide-react";

const InstagramIcon = () => <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const FacebookIcon = () => <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
const TiktokIcon = () => <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a3 3 0 0 1-3-3v11a7 7 0 1 1-7-7v3a4 4 0 0 0 4 4z"></path></svg>;

const PLATFORM_DETAILS = { IG: { name: "Instagram", icon: <InstagramIcon /> }, FB: { name: "Facebook", icon: <FacebookIcon /> }, TT: { name: "TikTok", icon: <TiktokIcon /> } };
const PILLAR_ICONS = { Entertaint: <Smile size={10} />, Promosi: <Megaphone size={10} />, Edukasi: <BookOpen size={10} />, Inspirasi: <Lightbulb size={10} /> };

export default function CalendarPage() {
  const { contents, addContent, updateContent, updateDate, role } = useContentStore();
  const [isMounted, setIsMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  
  const [title, setTitle] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [copywriting, setCopywriting] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [status, setStatus] = useState<Status>("Idea");
  const [pillar, setPillar] = useState<Pillar>("Edukasi");
  const [linkVideo, setLinkVideo] = useState("");
  const [revisionNote, setRevisionNote] = useState("");

  useEffect(() => setIsMounted(true), []);
  if (!isMounted) return null;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); 
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleDragStart = (e: React.DragEvent, id: string) => e.dataTransfer.setData("contentId", id);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault(); 
  const handleDrop = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("contentId");
    if (id) updateDate(id, targetDate);
  };

  const togglePlatform = (p: Platform) => {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const openModalForNew = (dateStr: string) => {
    setEditId(null); setSelectedDate(dateStr); setTitle(""); setReferenceUrl(""); 
    setCaption(""); setCopywriting(""); setPlatforms([]); setStatus("Idea"); 
    setPillar("Edukasi"); setLinkVideo(""); setRevisionNote("");
    setIsModalOpen(true);
  };

  const openModalForEdit = (e: React.MouseEvent, item: Content) => {
    e.stopPropagation(); 
    setEditId(item.id); setSelectedDate(item.publishDate); setTitle(item.title); 
    setReferenceUrl(item.referenceUrl || ""); setCaption(item.caption || ""); 
    setCopywriting(item.copywriting || ""); setPlatforms(item.platforms); 
    setStatus(item.status); setPillar(item.pillar || "Edukasi"); 
    setLinkVideo(item.linkVideo || ""); setRevisionNote(item.revisionNote || "");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    if ((status === "Ready to Publish" || status === "Approved" || status === "Published") && !linkVideo) {
      alert("Masukkan Link Video Final terlebih dahulu!");
      return;
    }

    const dataPayload = {
      title, status, publishDate: selectedDate, platforms, pillar,
      referenceUrl, caption, copywriting, linkVideo
    };

    if (editId) {
      updateContent(editId, dataPayload);
    } else {
      addContent(dataPayload);
    }
    
    setIsModalOpen(false);
  };

  const getStatusStyle = (s: Status) => {
    switch (s) {
      case "Idea": return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
      case "In Development": return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50";
      case "Process": return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50";
      case "Ready to Publish": return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50";
      case "Approved": 
      case "Published": 
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50";
      case "Rejected": return "bg-slate-800 text-slate-200 border-slate-700 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50";
      default: return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Logika Kunci Form: Jika Karyawan membuka konten yang sudah Approved/Published/Rejected, form jadi Read-Only
  const isLockedForKaryawan = role === "KARYAWAN" && (status === "Approved" || status === "Published" || status === "Rejected");

  return (
    <div className="max-w-7xl mx-auto min-h-screen flex flex-col pb-12">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{format(currentDate, "MMMM yyyy")}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Kelola jadwal tayang dengan drag & drop.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 dark:bg-gray-800/50 rounded-lg p-1 border border-transparent dark:border-gray-800">
            <button onClick={prevMonth} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-all shadow-sm"><ChevronLeft size={18} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-medium hover:bg-white dark:hover:bg-gray-700 rounded-md transition-all">Today</button>
            <button onClick={nextMonth} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-all shadow-sm"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col shadow-sm">
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7" style={{ gridAutoRows: 'minmax(130px, auto)' }}>
          {days.map((day, idx) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayContents = contents.filter(c => c.publishDate === dateStr);
            const isCurrentMonth = isSameMonth(day, monthStart);
            
            return (
              <div 
                key={day.toString()} 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, dateStr)}
                onClick={() => openModalForNew(dateStr)}
                className={`p-2 border-r border-b border-gray-100 dark:border-gray-800/60 relative group cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors
                  ${!isCurrentMonth ? "bg-gray-50/30 dark:bg-black/20 text-gray-400 dark:text-gray-600" : ""}
                  ${idx % 7 === 6 ? "border-r-0" : ""}
                  ${idx >= 28 ? "border-b-0" : ""}
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[11px] font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday(day) ? "bg-blue-600 text-white shadow-md" : "text-gray-700 dark:text-gray-400"}`}>
                    {format(day, "d")}
                  </span>
                  <Plus size={12} className="text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="space-y-2">
                  {dayContents.map(item => (
                    <div 
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      onClick={(e) => openModalForEdit(e, item)}
                      className={`px-2 py-2 rounded-md border text-xs cursor-pointer shadow-sm hover:shadow-md transition-all ${getStatusStyle(item.status)}`}
                    >
                      <div className="font-semibold leading-tight">{item.title}</div>
                      
                      <div className="flex flex-wrap items-center justify-between mt-2 gap-1">
                        <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-[9px] font-medium opacity-80">
                          {PILLAR_ICONS[item.pillar || "Edukasi"]}
                          <span>{item.pillar}</span>
                        </div>
                        
                        <div className="flex gap-0.5">
                          {item.platforms.map(p => (
                            <span key={p} className="text-[9px] bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded flex items-center">
                              {PLATFORM_DETAILS[p].icon}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="font-bold text-xl text-gray-900 dark:text-white">
                  {editId ? "Detail Konten" : "Rencana Konten"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Jadwal Tayang: {format(new Date(selectedDate), "dd MMMM yyyy")}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
              
              {revisionNote && (
                <div className="col-span-2 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800/50 flex gap-3 items-start">
                  <AlertCircle size={20} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-red-800 dark:text-red-300 uppercase mb-1">Catatan Manager:</h4>
                    <p className="text-sm text-red-700 dark:text-red-400">{revisionNote}</p>
                  </div>
                </div>
              )}

              {isLockedForKaryawan && (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800/50 text-sm text-amber-800 dark:text-amber-400 mb-4 flex gap-2">
                  <Lock size={18} className="flex-shrink-0" />
                  Konten ini sudah ditinjau Manager dan tidak bisa diubah oleh Karyawan.
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Konten</label>
                  <input readOnly={isLockedForKaryawan} required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Video Tips & Trick..." className="w-full p-2.5 bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 disabled:opacity-60" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select disabled={isLockedForKaryawan} value={status} onChange={(e) => setStatus(e.target.value as Status)} className="w-full p-2.5 bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white outline-none cursor-pointer disabled:opacity-60">
                    <option value="Idea">Idea</option>
                    <option value="In Development">In Development</option>
                    <option value="Process">Process</option>
                    <option value="Ready to Publish">Ready to Publish</option>
                    
                    {/* Logika Dropdown Cerdas */}
                    {role !== "KARYAWAN" && <option value="Approved">Approved</option>}
                    {role !== "KARYAWAN" && <option value="Published">Published</option>}
                    {role !== "KARYAWAN" && <option value="Rejected">Rejected</option>}
                    
                    {/* Tetap tampilkan status terkini walau dia Karyawan agar dropdown tidak kosong */}
                    {role === "KARYAWAN" && (status === "Approved" || status === "Published" || status === "Rejected") && (
                      <option value={status}>{status}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content Pillar</label>
                  <select disabled={isLockedForKaryawan} value={pillar} onChange={(e) => setPillar(e.target.value as Pillar)} className="w-full p-2.5 bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white outline-none cursor-pointer disabled:opacity-60">
                    <option value="Entertaint">Entertaint</option>
                    <option value="Promosi">Promosi</option>
                    <option value="Edukasi">Edukasi</option>
                    <option value="Inspirasi">Inspirasi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Platform Tayang</label>
                <div className="flex gap-3">
                  {(['IG', 'FB', 'TT'] as Platform[]).map(p => (
                    <button key={p} type="button" onClick={() => { if (!isLockedForKaryawan) togglePlatform(p); }} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center gap-2 ${platforms.includes(p) ? 'bg-indigo-50 dark:bg-indigo-500/20 border-indigo-200 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-[#121212] border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400'} ${isLockedForKaryawan ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {PLATFORM_DETAILS[p].icon} {PLATFORM_DETAILS[p].name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 bg-gray-50 dark:bg-[#121212] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Referensi Konten (URL)</label>
                  <div className="relative">
                    <LinkIcon size={16} className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
                    <input readOnly={isLockedForKaryawan} value={referenceUrl} onChange={(e) => setReferenceUrl(e.target.value)} placeholder="https://tiktok.com/..." className="w-full pl-9 p-2.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 disabled:opacity-60" />
                  </div>
                </div>
                
                {(status === "Ready to Publish" || status === "Approved" || status === "Published") && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-bold text-purple-700 dark:text-purple-400 mb-1">🔗 Link Video Final</label>
                    <input readOnly={isLockedForKaryawan} value={linkVideo} onChange={(e) => setLinkVideo(e.target.value)} placeholder="Link Google Drive / Draft TikTok..." className="w-full p-2.5 bg-purple-50 dark:bg-purple-500/10 border-2 border-purple-200 dark:border-purple-500/30 rounded-lg text-sm text-gray-900 dark:text-purple-100 outline-none focus:border-purple-500 disabled:opacity-60" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Copywriting (Naskah)</label>
                  <textarea readOnly={isLockedForKaryawan} value={copywriting} onChange={(e) => setCopywriting(e.target.value)} placeholder="Tulis hook dan isi video di sini..." rows={4} className="w-full p-3 bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white outline-none resize-none disabled:opacity-60" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Caption Posting</label>
                  <textarea readOnly={isLockedForKaryawan} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Tulis caption dan hashtag..." rows={4} className="w-full p-3 bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white outline-none resize-none disabled:opacity-60" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  {isLockedForKaryawan ? "Tutup" : "Batal"}
                </button>
                {!isLockedForKaryawan && (
                  <button type="submit" className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 rounded-lg transition-colors">
                    Simpan Perubahan
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}