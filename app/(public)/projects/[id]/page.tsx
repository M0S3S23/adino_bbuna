"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, BarChart3, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ProjectDetail() {
  const params = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjectData() {
      // Fetch the project and its related impact metrics
      const { data, error } = await supabase
        .from("projects")
        .select(`*, project_impact (*)`)
        .eq("id", params.id)
        .single();

      if (!error) {
        setProject(data);
      }
      setLoading(false);
    }

    if (params.id) fetchProjectData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-sky-500" size={40} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center space-y-4">
        <p className="text-slate-500">Project not found.</p>
        <Link href="/projects" className="text-sky-500 font-bold hover:underline">
          Return to Portfolio
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-sky-50 text-slate-900 min-h-screen font-sans">
      {/* NAVIGATION */}
      <nav className="pt-10 px-6 max-w-6xl mx-auto">
        <Link 
          href="/projects" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-sky-500 font-bold text-[10px] uppercase tracking-widest transition-colors"
        >
          <ArrowLeft size={14} /> Back to Projects
        </Link>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-16 pb-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-4 mb-6">
                <span className="bg-sky-500 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                  {project.category || "Case Study"}
                </span>
                <span className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <Calendar size={12} /> {new Date(project.created_at).getFullYear()}
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-light leading-tight tracking-tight text-slate-900">
                {project.title}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE IMAGE (COVER) */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <div className="aspect-video w-full rounded-2xl overflow-hidden border border-sky-100 bg-white shadow-xl shadow-sky-100/50">
          {project.image_url ? (
            <img 
              src={project.image_url} 
              alt={project.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
              No Preview Image Available
            </div>
          )}
        </div>
      </section>

      {/* MAIN CONTENT GRID */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* DESCRIPTION */}
          <div className="lg:col-span-7 space-y-8">
            <div className="prose prose-slate max-w-none">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-sky-500 mb-6">Project Overview</h2>
              <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap font-light">
                {project.description}
              </p>
            </div>
          </div>

          {/* SIDEBAR: IMPACT & INFO */}
          <div className="lg:col-span-5 space-y-10">
            
            {/* IMPACT DASHBOARD */}
            {project.project_impact && project.project_impact.length > 0 && (
              <div className="bg-white border border-sky-100 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-8 pb-4 border-b border-sky-50">
                  <BarChart3 size={18} className="text-sky-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Impact Metrics</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-8">
                  {project.project_impact.map((imp: any) => (
                    <div key={imp.id} className="group">
                      <span className="block text-4xl font-light text-slate-900 group-hover:text-sky-500 transition-colors">
                        {imp.metric_value}
                      </span>
                      <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                        {imp.metric_label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QUICK INFO */}
            <div className="space-y-6 px-4">
              <div className="flex items-center justify-between py-4 border-b border-sky-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</span>
                <span className="text-xs font-bold text-slate-900">{project.category}</span>
              </div>
              
              <div className="flex items-center justify-between py-4 border-b border-sky-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
                <span className={`text-xs font-bold ${
                  project.status === 'In Progress' ? 'text-amber-500' : 'text-sky-500'
                }`}>
                  {project.status || "Completed"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECT PHOTOSS (EXTRA IMAGES) */}
      {project.images && project.images.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-32">
          <div className="pt-16 border-t border-sky-100">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-sky-500 mb-10">Project Photos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {project.images.map((url: string, index: number) => (
                <div 
                  key={index} 
                  className="aspect-video rounded-2xl overflow-hidden border border-sky-100 bg-white shadow-lg shadow-sky-100/30 group"
                >
                  <img 
                    src={url} 
                    alt={`${project.title} gallery image ${index + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}