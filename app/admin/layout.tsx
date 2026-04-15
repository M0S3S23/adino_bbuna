"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  LayoutDashboard, 
  FileText, 
  Video, 
  UserCircle, 
  Settings, 
  LogOut,
  ChevronRight,
  Globe,
  Mail,
  Briefcase,
  Trophy,
  Loader2
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  // AUTH PROTECTOR: Checks session on every admin page load
  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // If no session, force redirect to login
        window.location.href = "/login";
      } else {
        setIsVerifying(false);
      }
    }
    checkUser();
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, exact: true },
    { name: "Articles", href: "/admin/articles", icon: FileText, exact: false },
    { name: "Projects", href: "/admin/projects", icon: Briefcase, exact: false },
    { name: "Achievements", href: "/admin/achievements", icon: Trophy, exact: false },
    { name: "Videos", href: "/admin/videos", icon: Video, exact: false },
    { name: "Messages", href: "/admin/messages", icon: Mail, exact: false },
    { name: "Profile", href: "/admin/profile", icon: UserCircle, exact: false },
  ];

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear cache and redirect
      window.location.href = "/login"; 
    } catch (error: any) {
      alert(`Error logging out: ${error.message}`);
    }
  }

  // Prevent UI flicker while checking auth
  if (isVerifying) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <Loader2 className="animate-spin text-sky-600" size={32} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-white font-sans">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-slate-50 border-r border-sky-100 flex-shrink-0 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <Link href="/admin/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center shadow-lg shadow-sky-200 group-hover:rotate-3 transition-transform">
              <Settings className="text-white" size={18} />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">
              Admin<span className="text-sky-600">Panel</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Main Menu</p>
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all group ${
                  isActive ? "bg-sky-600 text-white shadow-lg shadow-sky-100" : "text-slate-500 hover:bg-sky-50 hover:text-sky-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  {item.name}
                </div>
                {isActive && <ChevronRight size={14} className="opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sky-100 space-y-1">
          <Link href="/" className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl font-bold text-sm transition-all group">
            <Globe size={18} />
            View Site
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm transition-all group">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-sky-100 flex justify-around items-center py-3 px-2 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        {navItems.slice(0, 5).map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href} className={`flex flex-col items-center gap-1 ${isActive ? "text-sky-600" : "text-slate-400"}`}>
              <Icon size={20} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.name.split(' ')[0]}</span>
            </Link>
          );
        })}
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-slate-400">
          <LogOut size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Exit</span>
        </button>
      </nav>

      <main className="flex-1 flex flex-col min-h-screen bg-white overflow-x-hidden pb-20 md:pb-0">
        <div className="flex-1 p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}