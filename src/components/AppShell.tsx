"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { useContentStore } from "@/store/useContentStore";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const { role, fetchAllData } = useContentStore();
  const [isMounted, setIsMounted] = useState(false);

  // Tunggu sampai memori browser (Zustand) selesai dimuat
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (!role && !isLoginPage) router.push("/login");
      if (role) fetchAllData();
    }
  }, [role, isLoginPage, router, fetchAllData, isMounted]);

  // Tampilkan layar kosong 1 detik sebelum memori terbaca agar tidak mental
  if (!isMounted) return <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617]" />;

  if (isLoginPage) return <main className="w-full min-h-screen bg-[#f8fafc] dark:bg-[#020617]">{children}</main>;
  if (!role) return <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617]" />;

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 p-8 h-screen overflow-y-auto">{children}</main>
    </div>
  );
}