"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Edit3, Trash2, Calendar, Folder, BarChart3, Images } from "lucide-react";
import Link from "next/link";

export default function ViewProject() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjectData() {
      const { data, error } = await supabase
        .from("projects")
        .select(`*, project_impact (*)`)
        .eq("id", id)
        .single();

      if (error) router.push("/admin/projects");
      else setProject(data);
      setLoading(false);
    }
    fetchProjectData();
  }, [id]);

  if (loading) return <div className="p-20 text-center font-black uppercase text-slate-400 animate-pulse">Loading project details...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      <Link href="/admin/projects" className="flex items-center gap-2 text-slate-500 hover:text-sky-600 mb-8 font-bold text-xs uppercase tracking-widest">
        <ArrowLeft size={14} /> Back to Projects
      </Link>

      <div className="space-y-12">
        {/* HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex gap-3">
              <span className="bg-sky-50 text-sky-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border border-sky-100">
                {project.category}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter uppercase">
              {project.title}
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed font-medium">
              {project.description}
            </p>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-sky-400 rounded-[48px] rotate-3 group-hover:rotate-1 transition-transform -z-10 blur-xl opacity-20" />
            <img 
              src={project.image_url || 'https://via.placeholder.com/800x600?text=No+Cover'} 
              className="w-full aspect-video rounded-[40px] object-cover shadow-2xl border-4 border-white"
            />
          </div>
        </div>

        {/* STATS & GALLERY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Stats Sidebar */}
          <div className="lg:col-span-1 bg-slate-900 rounded-[40px] p-8 text-white flex flex-col justify-between">
            <div className="space-y-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-sky-400">Impact Data</h3>
              <div className="space-y-6">
                {project.project_impact?.map((imp: any) => (
                  <div key={imp.id}>
                    <p className="text-4xl font-black tracking-tighter">{imp.metric_value}</p>
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-1">{imp.metric_label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-10 flex gap-2">
               <button className="flex-1 bg-white/10 p-3 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all"><Edit3 size={18}/></button>
               <button className="flex-1 bg-red-500/20 text-red-400 p-3 rounded-2xl flex items-center justify-center hover:bg-red-500/30 transition-all"><Trash2 size={18}/></button>
            </div>
          </div>

          {/* Additional Images Gallery */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Images size={20} className="text-slate-400" />
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Project Gallery</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {project.images?.length > 0 ? (
                project.images.map((img: string, i: number) => (
                  <div key={i} className="aspect-square rounded-3xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer shadow-lg">
                    <img src={img} className="w-full h-full object-cover" />
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">No gallery images uploaded</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}