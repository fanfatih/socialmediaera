"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./sidebar";
import { useContentStore } from "@/store/useContentStore";
import { Menu } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const { role, fetchAllData } = useContentStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State untuk HP

  // Tunggu memori siap
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Proteksi & Tarik Data
  useEffect(() => {
    if (isMounted) {
      if (!role && !isLoginPage) router.push("/login");
      if (role) fetchAllData();
    }
  }, [role, isLoginPage, router, fetchAllData, isMounted]);

  // Tutup sidebar otomatis saat pindah halaman di layar HP
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (!isMounted) return <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617]" />;
  if (isLoginPage) return <main className="w-full min-h-screen bg-[#f8fafc] dark:bg-[#020617]">{children}</main>;
  if (!role) return <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617]" />;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      
      {/* Overlay Gelap: Hanya muncul di HP saat menu terbuka */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar: Bersembunyi di kiri pada HP, tapi tetap menempel di Desktop */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Area Konten Utama */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Navbar Mobile: Hanya terlihat di layar kecil */}
        <header className="md:hidden bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between z-30 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
            <h1 className="font-bold text-lg text-gray-900 dark:text-white">Workspace</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md active:scale-95 transition-transform"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Isi Halaman */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
}