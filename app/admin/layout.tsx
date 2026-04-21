"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  LayoutDashboard, FileText, Video, UserCircle, 
  Settings, LogOut, ChevronRight, Globe, Mail, 
  Briefcase, Trophy, Loader2, Menu, X 
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login";
      } else {
        setIsVerifying(false);
      }
    }
    checkUser();
  }, []);

  // Sync: Close menu on navigation
  useEffect(() => setIsMobileMenuOpen(false), [pathname]);

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
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (isVerifying) return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <Loader2 className="animate-spin text-sky-600" size={32} />
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-white font-sans">
      
      {/* SIDEBAR - DESKTOP (UNTOUCHED) */}
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
                <div className="flex items-center gap-3"><Icon size={18} />{item.name}</div>
                {isActive && <ChevronRight size={14} className="opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sky-100 space-y-1">
          <Link href="/" className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl font-bold text-sm transition-all group">
            <Globe size={18} /> View Site
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm transition-all group">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* NEW MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-sky-100 flex items-center justify-between px-6 z-50">
        <span className="font-black text-slate-900 uppercase tracking-tighter">Admin<span className="text-sky-600">Panel</span></span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      <div className={`md:hidden fixed inset-0 z-40 transition-all ${isMobileMenuOpen ? "visible" : "invisible"}`}>
        <div 
          className={`absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}`} 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
        <nav className={`absolute top-0 left-0 bottom-0 w-72 bg-white transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="p-8 border-b border-sky-50 flex items-center gap-3">
             <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center text-white"><Settings size={20}/></div>
             <span className="font-black text-slate-900 uppercase">Menu</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href} className={`flex items-center gap-4 px-4 py-4 rounded-xl font-bold text-sm ${isActive ? "bg-sky-600 text-white" : "text-slate-500 bg-slate-50"}`}>
                  <Icon size={20} /> {item.name}
                </Link>
              );
            })}
          </div>
          <div className="p-6 border-t border-sky-50 bg-slate-50/50">
             <button onClick={handleLogout} className="flex items-center gap-4 w-full px-4 py-4 bg-red-50 text-red-600 rounded-xl font-bold text-sm"><LogOut size={18} /> Logout</button>
          </div>
        </nav>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-h-screen bg-white overflow-x-hidden pt-16 md:pt-0 pb-0">
        <div className="flex-1 p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}