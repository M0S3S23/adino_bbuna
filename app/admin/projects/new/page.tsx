"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save, Plus, Trash2, Loader2, X, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Completed"); // Added status state
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [impacts, setImpacts] = useState([{ metric_label: "", metric_value: "" }]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setGalleryFiles(prev => [...prev, ...files]);
    setGalleryPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('project-images').upload(fileName, file);
    if (error) throw error;
    return supabase.storage.from('project-images').getPublicUrl(fileName).data.publicUrl;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication failed. Please login.");

      const image_url = coverFile ? await uploadFile(coverFile) : "";
      const galleryUrls = await Promise.all(galleryFiles.map(f => uploadFile(f)));

      const { data: project, error: pErr } = await supabase
        .from("projects")
        .insert([{ 
            title, 
            description, 
            category, 
            status, // Included status here
            image_url, 
            images: galleryUrls, 
            user_id: user.id 
        }])
        .select().single();

      if (pErr) throw pErr;

      const validImpacts = impacts
        .filter(i => i.metric_label && i.metric_value)
        .map(i => ({ ...i, project_id: project.id }));
        
      if (validImpacts.length > 0) await supabase.from("project_impact").insert(validImpacts);

      router.push("/admin/projects");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 px-6 font-sans antialiased text-slate-900">
      <Link href="/admin/projects" className="flex items-center gap-2 text-slate-400 hover:text-sky-500 mb-10 font-bold text-[10px] uppercase tracking-[0.2em] transition-all">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* MEDIA SECTION (Same as your previous code) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Main Cover Photo</label>
            <div className="aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 relative overflow-hidden">
              {coverPreview ? (
                <>
                  <img src={coverPreview} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => {setCoverFile(null); setCoverPreview(null);}} className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-lg shadow-sm">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center h-full">
                  <Plus className="text-slate-300 mb-1" size={20} />
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Select Cover</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleCoverChange} />
                </label>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Gallery Photos</label>
            <div className="grid grid-cols-3 gap-2">
              {galleryPreviews.map((src, i) => (
                <div key={i} className="aspect-square bg-slate-100 rounded-lg relative overflow-hidden group">
                  <img src={src} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => {
                    setGalleryFiles(prev => prev.filter((_, idx) => idx !== i));
                    setGalleryPreviews(prev => prev.filter((_, idx) => idx !== i));
                  }} className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <label className="aspect-square bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer">
                <Plus size={18} className="text-slate-300" />
                <input type="file" multiple className="hidden" accept="image/*" onChange={handleGalleryChange} />
              </label>
            </div>
          </div>
        </div>

        {/* INPUT SECTION */}
        <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Project Title</label>
              <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-0 py-2 border-b-2 border-slate-100 focus:border-sky-400 outline-none text-slate-900 font-bold text-lg transition-all" placeholder="e.g. AgriLearn" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Category</label>
              <input required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-0 py-2 border-b-2 border-slate-100 focus:border-sky-400 outline-none text-slate-900 font-bold text-lg transition-all" placeholder="e.g. Software" />
            </div>
            {/* Added Status Dropdown */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)} 
                className="w-full px-0 py-2 border-b-2 border-slate-100 focus:border-sky-400 outline-none text-slate-900 font-bold text-lg transition-all bg-transparent"
              >
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
              </select>
            </div>
          </div>
          <div className="space-y-2 pt-4">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Project Description</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-4 py-4 rounded-xl bg-slate-50 border border-transparent focus:bg-white focus:border-sky-100 outline-none text-slate-800 font-medium transition-all resize-none" placeholder="What is this project about?" />
          </div>
        </div>

        {/* IMPACT SECTION (Same as your previous code) */}
        <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <BarChart3 size={14} className="text-sky-500" /> Success Metrics
            </h3>
            <button type="button" onClick={() => setImpacts([...impacts, { metric_label: "", metric_value: "" }])} className="text-[9px] font-black uppercase bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-all">
              Add Field
            </button>
          </div>
          <div className="space-y-3">
            {impacts.map((imp, i) => (
              <div key={i} className="flex gap-4 items-center group">
                <input value={imp.metric_label} onChange={(e) => {
                  const n = [...impacts]; n[i].metric_label = e.target.value; setImpacts(n);
                }} className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-transparent focus:border-sky-200 outline-none text-xs font-bold text-slate-900 transition-all" placeholder="Label" />
                <input value={imp.metric_value} onChange={(e) => {
                  const n = [...impacts]; n[i].metric_value = e.target.value; setImpacts(n);
                }} className="w-32 px-4 py-3 rounded-xl bg-sky-50 border border-transparent focus:border-sky-200 outline-none text-xs font-black text-sky-600 text-center transition-all" placeholder="Value" />
                {impacts.length > 1 && (
                  <button type="button" onClick={() => setImpacts(impacts.filter((_, idx) => idx !== i))} className="text-slate-200 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button type="submit" disabled={loading} className="bg-sky-500 text-white px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-sky-100 hover:bg-sky-600 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 flex items-center gap-3">
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {loading ? "Publishing..." : "Publish Project"}
          </button>
        </div>
      </form>
    </div>
  );
}