"use client";

import React from "react";
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
  Mail // Imported for the Messages link
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { 
      name: "Dashboard", 
      href: "/admin/dashboard", 
      icon: LayoutDashboard,
      exact: true 
    },
    { 
      name: "Articles", 
      href: "/admin/articles", 
      icon: FileText,
      exact: false 
    },
    { 
      name: "Video Library", 
      href: "/admin/videos", 
      icon: Video,
      exact: false 
    },
    { 
      name: "Messages", 
      href: "/admin/messages", 
      icon: Mail,
      exact: false 
    },
    { 
      name: "Profile", 
      href: "/admin/profile", 
      icon: UserCircle,
      exact: false 
    },
  ];

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/login");
      router.refresh();
    } catch (error: any) {
      alert(`Error logging out: ${error.message}`);
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Sidebar - RESTORED FULL CODE */}
      <aside className="w-64 bg-slate-50 border-r border-sky-100 flex-shrink-0 hidden md:flex flex-col sticky top-0 h-screen">
        {/* Logo Section */}
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

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Main Menu</p>
          
          {navItems.map((item) => {
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href);
              
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all group ${
                  isActive 
                    ? "bg-sky-600 text-white shadow-lg shadow-sky-100" 
                    : "text-slate-500 hover:bg-sky-50 hover:text-sky-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-white" : "group-hover:text-sky-600"}>
                    <Icon size={18} />
                  </span>
                  {item.name}
                </div>
                {isActive && <ChevronRight size={14} className="opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-sky-100 space-y-1">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">System</p>
          
          <Link 
            href="/" 
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl font-bold text-sm transition-all group"
          >
            <Globe size={18} className="group-hover:text-sky-600" />
            View Site
          </Link>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm transition-all group"
          >
            <LogOut size={18} className="group-hover:text-red-600" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen bg-white overflow-x-hidden">
        <div className="flex-1 p-8"> {/* Added padding for dashboard content */}
          {children}
        </div>
      </main>
    </div>
  );
}