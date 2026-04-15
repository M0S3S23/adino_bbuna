"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Plus, ExternalLink, Trash2, Loader2 } from "lucide-react"; // Added Loader2

export default function AdminProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null); // Track which item is deleting

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setProjects(data);
    setLoading(false);
  }

  // --- NEW DELETE FUNCTION ---
  async function handleDelete(id: string) {
    const confirmed = window.confirm("Are you sure you want to delete this project? This will also remove associated impact metrics.");
    
    if (!confirmed) return;

    setDeletingId(id);
    try {
      // 1. Delete from Supabase
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // 2. Update local state so the project disappears immediately
      setProjects(projects.filter(p => p.id !== id));
      
    } catch (error: any) {
      alert("Error deleting project: " + error.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase">Projects</h1>
          <p className="text-slate-500">Manage work and link impact metrics.</p>
        </div>
        <Link 
          href="/admin/projects/new" 
          className="bg-sky-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-sky-700 transition-all shadow-lg shadow-sky-100"
        >
          <Plus size={20} />
          New Project
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-sky-500" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-800">{project.title}</h3>
                <div className="flex gap-2">
                  {/* UPDATED BUTTON */}
                  <button 
                    onClick={() => handleDelete(project.id)}
                    disabled={deletingId === project.id}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    {deletingId === project.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-slate-500 text-sm mb-4 line-clamp-2">{project.description}</p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                <span className="text-xs font-black uppercase tracking-widest text-sky-600 bg-sky-50 px-3 py-1 rounded-full">
                  {project.category}
                </span>
                <Link 
                  href={`/admin/projects/edit/${project.id}`} 
                  className="text-slate-400 hover:text-sky-600 transition-colors"
                >
                  <ExternalLink size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}