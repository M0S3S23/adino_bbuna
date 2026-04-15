"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Trophy, Loader2, Calendar, Award, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

type Achievement = {
  id: string;
  title: string;
  issuer: string;
  date_received: string;
  description: string;
  created_at: string;
};

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  async function fetchAchievements() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("date_received", { ascending: false });

      if (error) {
        console.error("Error fetching achievements:", error.message);
        return;
      }

      if (data) {
        setAchievements(data);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this achievement? This action cannot be undone.")) return;

    try {
      setDeletingId(id);
      const { error } = await supabase
        .from("achievements")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Update local state to remove the deleted item
      setAchievements(achievements.filter(ach => ach.id !== id));
    } catch (err: any) {
      alert(`Error deleting: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = achievements.filter((a) => {
    const searchTerm = search.toLowerCase();
    return (
      a.title?.toLowerCase().includes(searchTerm) ||
      a.issuer?.toLowerCase().includes(searchTerm) ||
      a.description?.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="bg-sky-50 text-slate-900 min-h-screen font-sans">
      {/* HEADER */}
      <section className="pt-32 pb-16 border-b border-sky-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <p className="text-sky-500 text-[10px] tracking-[0.3em] uppercase mb-4 font-black">
                Admin Panel
              </p>
              <h1 className="text-5xl md:text-7xl mb-6 font-light tracking-tight">
                Achievements
              </h1>
              <p className="text-slate-500 text-lg font-light leading-relaxed">
                Manage your certifications, awards, and professional milestones.
              </p>
            </div>
            
            <Link 
              href="/admin/achievements/new" 
              className="inline-flex items-center gap-2 bg-sky-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-sky-700 transition-all shadow-xl shadow-sky-200/40"
            >
              <Plus size={16} />
              Add Achievement
            </Link>
          </div>
        </div>
      </section>

      {/* SEARCH BAR */}
      <section className="py-8 border-b border-sky-100 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 flex justify-end">
          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-sky-100 text-slate-900 placeholder-slate-400 pl-10 pr-4 py-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition rounded-xl shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* ACHIEVEMENTS GRID */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="animate-spin mb-4 text-sky-500" size={40} />
              <p className="text-xs font-black uppercase tracking-widest">Retrieving Records...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-sky-100 shadow-sm">
              <Trophy className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">
                {search ? `No results for "${search}"` : "No records found."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filtered.map((ach) => (
                <div
                  key={ach.id}
                  className="bg-white border border-sky-100 rounded-3xl p-10 hover:shadow-xl hover:shadow-sky-200/20 transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-all duration-500 shadow-sm">
                        <Award size={28} />
                      </div>
                      
                      <button
                        onClick={() => handleDelete(ach.id)}
                        disabled={deletingId === ach.id}
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                        title="Delete achievement"
                      >
                        {deletingId === ach.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-sky-600 uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full">
                        <Calendar size={12} />
                        {ach.date_received ? new Date(ach.date_received).getFullYear() : "N/A"}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {ach.issuer}
                      </span>
                    </div>

                    <h3 className="text-slate-900 text-2xl font-light mb-4 group-hover:text-sky-600 transition-colors">
                      {ach.title}
                    </h3>

                    <p className="text-slate-500 text-sm leading-relaxed font-light">
                      {ach.description}
                    </p>
                  </div>

                  <Trophy 
                    size={120} 
                    className="absolute -right-8 -bottom-8 text-slate-50 opacity-50 group-hover:text-sky-50 group-hover:opacity-100 transition-all duration-500 rotate-12" 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}