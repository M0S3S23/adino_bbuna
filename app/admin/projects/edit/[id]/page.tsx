"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save, Plus, Trash2, Loader2, X, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function EditProjectPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Completed"); // Added status state
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [impacts, setImpacts] = useState([{ metric_label: "", metric_value: "" }]);

  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);

  useEffect(() => {
    async function fetchProject() {
        const { data, error } = await supabase
        .from("projects")
        .select(`*, project_impact (*)`)
        .eq("id", id)
        .single();

        if (error) {
        alert("Project not found");
        router.push("/admin/projects");
        return;
        }

        // --- UPDATE THESE STATES ---
        setTitle(data.title);
        setDescription(data.description);
        setCategory(data.category);
        setStatus(data.status || "Completed"); // <--- ADD THIS LINE
        setCoverUrl(data.image_url);
        setGalleryUrls(data.images || []);
        
        if (data.project_impact?.length > 0) {
        setImpacts(data.project_impact);
        }
        setLoading(false);
    }
    fetchProject();
    }, [id, router]);

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('project-images').upload(fileName, file);
    if (error) throw error;
    return supabase.storage.from('project-images').getPublicUrl(fileName).data.publicUrl;
  };

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      let finalCoverUrl = coverUrl;
      if (newCoverFile) {
        finalCoverUrl = await uploadFile(newCoverFile);
      }

      const uploadedGalleryUrls = await Promise.all(newGalleryFiles.map(f => uploadFile(f)));
      const finalGalleryUrls = [...galleryUrls, ...uploadedGalleryUrls];

      const { error: pErr } = await supabase
        .from("projects")
        .update({ 
          title, 
          description, 
          category, 
          status, // Included status here
          image_url: finalCoverUrl, 
          images: finalGalleryUrls 
        })
        .eq("id", id);

      if (pErr) throw pErr;

      await supabase.from("project_impact").delete().eq("project_id", id);
      const validImpacts = impacts
        .filter(i => i.metric_label && i.metric_value)
        .map(i => ({ 
            metric_label: i.metric_label, 
            metric_value: i.metric_value, 
            project_id: id 
        }));
        
      if (validImpacts.length > 0) {
        await supabase.from("project_impact").insert(validImpacts);
      }

      router.push("/admin/projects");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-20 text-center font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs">Loading Project Data...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20 px-6 font-sans text-slate-900">
      <Link href="/admin/projects" className="flex items-center gap-2 text-slate-400 hover:text-sky-500 mb-10 font-bold text-[10px] uppercase tracking-[0.2em] transition-all">
        <ArrowLeft size={14} /> Cancel Editing
      </Link>

      <form onSubmit={handleUpdate} className="space-y-8">
        {/* MEDIA SECTION (Same as your previous code) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Cover Photo</label>
            <div className="aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 relative overflow-hidden">
              {(newCoverFile || coverUrl) ? (
                <>
                  <img src={newCoverFile ? URL.createObjectURL(newCoverFile) : coverUrl!} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => {setNewCoverFile(null); setCoverUrl(null);}} className="absolute top-2 right-2 bg-white text-red-500 p-1.5 rounded-lg shadow-sm">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center h-full">
                  <Plus className="text-slate-300 mb-1" size={20} />
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => setNewCoverFile(e.target.files?.[0] || null)} />
                </label>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Gallery</label>
            <div className="grid grid-cols-3 gap-2">
              {galleryUrls.map((url, i) => (
                <div key={i} className="aspect-square bg-slate-100 rounded-lg relative overflow-hidden group">
                  <img src={url} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setGalleryUrls(prev => prev.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <label className="aspect-square bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:bg-sky-50 transition-colors">
                <Plus size={18} className="text-slate-300" />
                <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setNewGalleryFiles(prev => [...prev, ...files]);
                }} />
              </label>
            </div>
          </div>
        </div>

        {/* INPUT SECTION */}
        <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Project Title</label>
              <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-0 py-2 border-b-2 border-slate-100 focus:border-sky-400 outline-none text-slate-900 font-bold text-lg transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Category</label>
              <input required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-0 py-2 border-b-2 border-slate-100 focus:border-sky-400 outline-none text-slate-900 font-bold text-lg transition-all" />
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
          <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-4 py-4 rounded-xl bg-slate-50 border border-transparent focus:bg-white focus:border-sky-100 outline-none text-slate-800 font-medium transition-all resize-none" />
        </div>

        {/* IMPACT SECTION (Same as your previous code) */}
        <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <BarChart3 size={14} className="text-sky-500" /> Performance Metrics
            </h3>
            <button type="button" onClick={() => setImpacts([...impacts, { metric_label: "", metric_value: "" }])} className="text-[9px] font-black uppercase bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-all">
              Add Metric
            </button>
          </div>
          <div className="space-y-3">
            {impacts.map((imp, i) => (
              <div key={i} className="flex gap-4 items-center group">
                <input value={imp.metric_label} onChange={(e) => {
                  const n = [...impacts]; n[i].metric_label = e.target.value; setImpacts(n);
                }} className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-transparent focus:border-sky-200 outline-none text-xs font-bold text-slate-900 transition-all" />
                <input value={imp.metric_value} onChange={(e) => {
                  const n = [...impacts]; n[i].metric_value = e.target.value; setImpacts(n);
                }} className="w-32 px-4 py-3 rounded-xl bg-sky-50 border border-transparent focus:border-sky-200 outline-none text-xs font-black text-sky-600 text-center transition-all" />
                <button type="button" onClick={() => setImpacts(impacts.filter((_, idx) => idx !== i))} className="text-slate-200 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button type="submit" disabled={saving} className="bg-sky-500 text-white px-10 py-3.5 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-sky-100 hover:bg-sky-600 transition-all disabled:opacity-50 flex items-center gap-3">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {saving ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}