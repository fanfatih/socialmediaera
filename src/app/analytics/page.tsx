"use client";

import { useState, useEffect } from "react";
import { useContentStore } from "@/store/useContentStore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ExternalLink, Link as LinkIcon, Eye, Heart, MessageCircle, Share2, BarChart2, Download, X } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AnalyticsPage() {
  const { contents, updateContent } = useContentStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  const exportToPDF = () => {
  const doc = new jsPDF();
  doc.text("Laporan Performa Konten - Social Media Era", 14, 15);
  
  const tableData = contents.map(c => [
    c.title, c.status, c.pillar, c.platforms.join(', '), c.views || 0
  ]);

  autoTable(doc, {
    head: [['Judul', 'Status', 'Pillar', 'Platform', 'Views']],
    body: tableData,
    startY: 25
  });

  doc.save(`Laporan_Analitik_${new Date().toLocaleDateString()}.pdf`);
};

// Pasang button-nya di UI:
<button onClick={exportToPDF} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">
  Export PDF
</button>
  
  // Hanya ambil konten yang sudah Approved atau Published
  const trackableContents = contents.filter(c => c.status === "Approved" || c.status === "Published");

  // Data untuk Grafik Recharts
  const chartData = trackableContents.filter(c => c.status === "Published").map(c => ({
    name: c.title.length > 15 ? c.title.substring(0, 15) + "..." : c.title,
    Views: c.views || 0,
    Likes: c.likes || 0,
  }));

  // Fungsi Download Grafik jadi PNG
  const handleDownloadChart = async () => {
    const chartElement = document.getElementById("chart-container");
    if (!chartElement) return;

    try {
      // Mengubah elemen HTML/SVG menjadi Canvas
      const canvas = await html2canvas(chartElement, {
        backgroundColor: "#121212", // Background gelap agar rapi
        scale: 2, // Resolusi tinggi (Retina)
      });
      
      // Mengubah Canvas menjadi URL Gambar
      const image = canvas.toDataURL("image/png");
      
      // Memicu download
      const link = document.createElement("a");
      link.href = image;
      link.download = `Grafik-Performa-${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    } catch (error) {
      console.error("Gagal mendownload grafik", error);
      alert("Gagal mendownload grafik.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-12">
      {/* HEADER & TOMBOL TRIGGER MODAL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Analytics Tracker</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Masukkan angka metrik secara manual. Data akan otomatis masuk ke laporan grafik.
          </p>
        </div>
        
        {chartData.length > 0 && (
          <button 
            onClick={() => setIsChartModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-600/20"
          >
            <BarChart2 size={18} />
            Lihat Grafik Laporan
          </button>
        )}
      </div>

      {/* TABEL DATA ENTRY */}
      <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Data Entry (Manual)</h2>
          <p className="text-xs text-gray-500 mt-1">Ubah status menjadi "Published" agar konten terhitung di grafik performa.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-4 py-3 font-medium">Konten & Link Live</th>
                <th className="px-4 py-3 font-medium w-32">Status</th>
                <th className="px-4 py-3 font-medium w-28"><div className="flex items-center gap-1"><Eye size={14}/> Views</div></th>
                <th className="px-4 py-3 font-medium w-28"><div className="flex items-center gap-1"><Heart size={14}/> Likes</div></th>
                <th className="px-4 py-3 font-medium w-28"><div className="flex items-center gap-1"><MessageCircle size={14}/> Komen</div></th>
                <th className="px-4 py-3 font-medium w-28"><div className="flex items-center gap-1"><Share2 size={14}/> Share</div></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {trackableContents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Belum ada konten yang di-Approve.</td>
                </tr>
              ) : (
                trackableContents.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900 dark:text-white mb-1 truncate max-w-xs">{item.title}</div>
                      <div className="flex items-center gap-2">
                        <LinkIcon size={12} className="text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="Paste link live..." 
                          value={item.liveUrl || ""}
                          onChange={(e) => updateContent(item.id, { liveUrl: e.target.value })}
                          className="bg-transparent border-b border-dashed border-gray-300 dark:border-gray-700 focus:border-blue-500 outline-none text-xs w-48 text-blue-600 dark:text-blue-400 placeholder-gray-400"
                        />
                        {item.liveUrl && (
                          <a href={item.liveUrl} target="_blank" className="text-gray-400 hover:text-blue-500"><ExternalLink size={12} /></a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select 
                        value={item.status} 
                        onChange={(e) => updateContent(item.id, { status: e.target.value as any })}
                        className={`text-xs font-bold rounded-md px-2 py-1 outline-none cursor-pointer border ${item.status === "Published" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"}`}
                      >
                        <option value="Approved">Approved</option>
                        <option value="Published">Published 🚀</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" min="0" value={item.views || ""} onChange={(e) => updateContent(item.id, { views: parseInt(e.target.value) || 0 })} placeholder="0" className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 outline-none focus:border-blue-500 text-sm" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" min="0" value={item.likes || ""} onChange={(e) => updateContent(item.id, { likes: parseInt(e.target.value) || 0 })} placeholder="0" className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 outline-none focus:border-pink-500 text-sm" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" min="0" value={item.comments || ""} onChange={(e) => updateContent(item.id, { comments: parseInt(e.target.value) || 0 })} placeholder="0" className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 outline-none focus:border-blue-500 text-sm" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" min="0" value={item.shares || ""} onChange={(e) => updateContent(item.id, { shares: parseInt(e.target.value) || 0 })} placeholder="0" className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 outline-none focus:border-blue-500 text-sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POP-UP MODAL GRAFIK */}
      {isChartModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121212] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col">
            
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="font-bold text-xl text-gray-900 dark:text-white">Laporan Performa Konten</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Distribusi Views dan Likes dari konten yang telah dipublish.</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleDownloadChart}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Download size={16} /> Download PNG
                </button>
                <button 
                  onClick={() => setIsChartModalOpen(false)} 
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Container yang akan di-screenshot oleh html2canvas */}
            <div id="chart-container" className="p-8 bg-[#121212]">
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <Tooltip cursor={{ fill: '#374151', opacity: 0.2 }} contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none', color: '#fff' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '20px', color: '#fff' }} />
                    <Bar dataKey="Views" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar dataKey="Likes" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Watermark kecil saat didownload */}
              <p className="text-center text-gray-600 text-xs mt-6 font-medium">Generated by Social Manager Era</p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}