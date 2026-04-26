"use client";

import { useState, useEffect } from "react";
import { useContentStore } from "@/store/useContentStore";
import { format, isSameMonth, isAfter, isToday, parseISO, subMonths } from "date-fns";
import { 
  BarChart3, CheckCircle2, Clock, Target, CalendarDays, ArrowRight 
} from "lucide-react";
import Link from "next/link";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";

export default function DashboardPage() {
  const { contents, role } = useContentStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  const today = new Date();
  
  // --- STATISTIK BULAN INI ---
  const thisMonthContents = contents.filter(c => isSameMonth(parseISO(c.publishDate), today));
  const totalContent = thisMonthContents.length;
  const publishedContent = thisMonthContents.filter(c => c.status === "Approved" || c.status === "Published").length;
  const waitingApproval = thisMonthContents.filter(c => c.status === "Ready to Publish").length;
  const inProgress = thisMonthContents.filter(c => c.status === "Idea" || c.status === "In Development" || c.status === "Process").length;

  // --- TARGET BULANAN ---
  const {monthlyTarget} = useContentStore();
  const progressPercentage = Math.min(Math.round((publishedContent / monthlyTarget) * 100), 100);

  // --- JADWAL TERDEKAT ---
  const upcomingContents = contents
    .filter(c => isToday(parseISO(c.publishDate)) || isAfter(parseISO(c.publishDate), today))
    .sort((a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime())
    .slice(0, 4);

  // ==========================================
  // DATA UNTUK GRAFIK (RECHARTS)
  // ==========================================

  // 1. Data Tren 6 Bulan Terakhir (Line Chart)
  const last6Months = Array.from({ length: 6 }).map((_, i) => format(subMonths(today, 5 - i), 'MMM'));
  const trendData = last6Months.map(monthLabel => {
    const count = contents.filter(c => format(parseISO(c.publishDate), 'MMM') === monthLabel).length;
    return { name: monthLabel, Konten: count };
  });

  // 2. Data Content Pillar (Donut Chart)
  const pillarColors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6']; // Biru, Oren, Hijau, Ungu
  const rawPillarData = [
    { name: 'Edukasi', value: contents.filter(c => c.pillar === 'Edukasi').length },
    { name: 'Promosi', value: contents.filter(c => c.pillar === 'Promosi').length },
    { name: 'Entertaint', value: contents.filter(c => c.pillar === 'Entertaint').length },
    { name: 'Inspirasi', value: contents.filter(c => c.pillar === 'Inspirasi').length },
  ];
  // Hanya tampilkan pillar yang ada datanya
  const pillarData = rawPillarData.filter(d => d.value > 0);
  // Fallback jika belum ada data sama sekali
  if (pillarData.length === 0) pillarData.push({ name: 'Belum ada data', value: 1 });

  // 3. Data Platform (Bar Chart)
  const platformData = [
    { name: 'Instagram', Jumlah: contents.filter(c => c.platforms.includes('IG')).length },
    { name: 'TikTok', Jumlah: contents.filter(c => c.platforms.includes('TT')).length },
    { name: 'Facebook', Jumlah: contents.filter(c => c.platforms.includes('FB')).length },
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Selamat datang, <span className="text-blue-600 dark:text-blue-500">{role}</span>! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Pantau ringkasan performa dan target kontenmu di sini.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 shadow-sm">
          <CalendarDays size={18} className="text-gray-400" />
          {format(today, "dd MMMM yyyy")}
        </div>
      </div>

      {/* BARIS 1: STATISTIK CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#121212] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-500 rounded-lg"><BarChart3 size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Direncanakan</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalContent}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-[#121212] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-500 rounded-lg"><CheckCircle2 size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Siap Tayang / Selesai</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{publishedContent}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-[#121212] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-500 rounded-lg"><Clock size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Menunggu Approval</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{waitingApproval}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-[#121212] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-500 rounded-lg"><Target size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sedang Diproses</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{inProgress}</h3>
          </div>
        </div>
      </div>

      {/* BARIS 2: TREN KONTEN & JADWAL TERDEKAT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart (Lebar 2/3) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Tren Produksi Konten (6 Bulan)</h2>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Line type="monotone" dataKey="Konten" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Jadwal Terdekat (Lebar 1/3) */}
        <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col h-[330px]">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Jadwal Terdekat</h2>
            <Link href="/calendar" className="text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline flex items-center gap-1">
              Kalender <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-hide">
            {upcomingContents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600">
                <CalendarDays size={32} className="mb-2 opacity-50" />
                <p className="text-sm">Kosong.</p>
              </div>
            ) : (
              upcomingContents.map((item) => (
                <div key={item.id} className="flex gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
                  <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-md min-w-[45px] h-[45px] border border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] font-medium uppercase text-gray-500">{format(parseISO(item.publishDate), "MMM")}</span>
                    <span className="text-base font-bold text-gray-800 dark:text-gray-200 leading-none">{format(parseISO(item.publishDate), "dd")}</span>
                  </div>
                  <div className="flex flex-col justify-center overflow-hidden">
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate text-sm">{item.title}</h4>
                    <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">{item.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* BARIS 3: TARGET, DONUT CHART (PILLAR), BAR CHART (PLATFORM) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Target Bulanan */}
        <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Target Bulan Ini</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Konten Approved/Published</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{publishedContent}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium"> / {monthlyTarget}</span>
            </div>
          </div>
          <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-1000 ease-out rounded-full" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-3 text-right">{progressPercentage}% Tercapai</p>
        </div>

        {/* Donut Chart (Content Pillar) */}
        <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Sebaran Pillar</h2>
          <div className="flex-1 min-h-[160px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pillarData} innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                  {pillarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pillarColors[index % pillarColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend Manual */}
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {pillarData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pillarColors[index % pillarColors.length] }}></div>
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart (Platform) */}
        <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Aktivitas Platform</h2>
          <div className="flex-1 min-h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="Jumlah" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}