"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, CalendarDays, CheckCircle, UserCircle2, BarChart2, Shield, FolderOpen, LogOut } from "lucide-react";
import { useContentStore } from "@/store/useContentStore";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Content Plan", icon: CalendarDays, href: "/calendar" },
  { name: "Approvals", icon: CheckCircle, href: "/approvals" },
  { name: "Analytics", icon: BarChart2, href: "/analytics" },
  { name: "Bank Konten", icon: FolderOpen, href: "/bank" },
  { name: "Akun Sosmed", icon: Shield, href: "/accounts" }, 
];

export default function Sidebar() {
  const pathname = usePathname();
  const { role } = useContentStore(); // Hanya panggil 'role', tidak ada lagi 'toggleRole'
  const router = useRouter();

  const handleLogout = () => {
    if (confirm("Yakin ingin keluar?")) {
      logout(); // Bersihkan store & storage
      router.push("/login");
    }
  };

  return (
    <aside className="w-64 h-screen sticky top-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col">
      <div className="p-6">
        <h1 className="font-bold text-xl tracking-tight">Workspace.</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          );
        })}

        {/* MENU KHUSUS ADMIN */}
        {role === 'ADMIN' && (
          <Link href="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors mt-4 border border-emerald-200 dark:border-emerald-900/50 ${
              pathname === "/settings" 
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" 
                : "text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20"
            }`}
          >
            <Shield size={18} />
            Admin Settings
          </Link>
        )}
      </nav>

      {/* FOOTER SIDEBAR (Profil & Logout) */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <Link href="/profile" className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors group cursor-pointer border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800">
          <UserCircle2 size={18} className="text-emerald-600 group-hover:scale-110 transition-transform" />
          <div className="flex flex-col flex-1">
            <span className="text-[10px] uppercase font-bold text-gray-400">Pengaturan Akun</span>
            <strong className="text-gray-900 dark:text-white leading-tight">{role}</strong>
          </div>
        </Link>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={18} />
          <span>Keluar Akun</span>
        </button>
      </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={18} />
          <span>Keluar Akun</span>
        </button>
      </div>
    </aside>
  );
}