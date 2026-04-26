"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./sidebar";
import { useContentStore } from "@/store/useContentStore";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const { fetchAllData } = useContentStore();

  // Panggil data dari Supabase SAAT APLIKASI PERTAMA KALI DIBUKA
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  if (isLoginPage) {
    return <main className="w-full min-h-screen bg-[#f8fafc] dark:bg-[#020617]">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 p-8 h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}