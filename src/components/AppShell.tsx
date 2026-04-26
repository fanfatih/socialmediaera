"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation"; // Tambah useRouter
import Sidebar from "./sidebar";
import { useContentStore } from "@/store/useContentStore";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const { role, fetchAllData } = useContentStore();

  useEffect(() => {
    // PROTEKSI: Jika belum login dan bukan di halaman login, tendang ke /login
    if (!role && !isLoginPage) {
      router.push("/login");
    } 
    
    // Jika sudah login, tarik data
    if (role) {
      fetchAllData();
    }
  }, [role, isLoginPage, router, fetchAllData]);

  if (isLoginPage) {
    return <main className="w-full min-h-screen bg-[#f8fafc] dark:bg-[#020617]">{children}</main>;
  }

  // Jika sedang loading/redirect, tampilkan layar kosong sebentar agar tidak "flicker"
  if (!role) return <div className="min-h-screen bg-[#020617]" />;

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 p-8 h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}