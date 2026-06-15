import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Workspace - Social Manager Era",
  description: "Aplikasi Manajemen Konten Sosial Media",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark"> 
      <body className={`${inter.className} text-gray-900 dark:text-white`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}