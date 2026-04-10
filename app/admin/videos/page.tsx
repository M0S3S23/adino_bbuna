"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Pencil, Trash2, X, Save, Eye, Play, Film, Clock, Tag, Loader2 } from "lucide-react";

interface Video {
  id: string;
  title: string;
  category: string;
  description: string;
  thumbnail: string;
  video_url: string;
  duration: string;
  created_at: string;
}

const BLANK: Partial<Video> = {
  title: "",
  category: "",
  description: "",
  thumbnail: "",
  video_url: "",
  duration: "",
};

export default function AdminVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Partial<Video>>(BLANK);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    setLoading(true);
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setVideos(data);
    setLoading(false);
  }

  const openCreate = () => { setEditing(BLANK); setModal("create"); };
  const openEdit = (v: Video) => { setEditing({ ...v }); setModal("edit"); };

  const getYTThumbnail = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) 
      ? `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg` 
      : "https://images.unsplash.com/photo-1627667050609-d4ba6483a368?w=800";
  };

  const handleSave = async () => {
    if (!editing.title || !editing.category) return;
    setSaving(true);
    
    const finalThumbnail = editing.thumbnail || getYTThumbnail(editing.video_url || "");
    const payload = {
      title: editing.title,
      category: editing.category,
      description: editing.description,
      thumbnail: finalThumbnail,
      video_url: editing.video_url,
      duration: editing.duration,
    };

    let error;
    if (modal === "create") {
      const { error: insErr } = await supabase.from("videos").insert([payload]);
      error = insErr;
    } else {
      const { error: updErr } = await supabase.from("videos").update(payload).eq("id", editing.id);
      error = updErr;
    }

    if (!error) {
      setModal(null);
      fetchVideos();
    } else {
      alert(error.message);
    }
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("videos").delete().eq("id", deleteId);
    if (!error) setVideos(videos.filter((v) => v.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 border-b border-sky-100 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Video Library</h1>
          <p className="text-sky-600 font-semibold text-sm mt-1">
            {loading ? "Connecting..." : `${videos.length} videos published`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-6 py-3 bg-sky-600 text-white text-sm font-bold rounded-lg hover:bg-sky-700 transition-all shadow-lg shadow-sky-100 active:scale-95"
        >
          <Plus size={18} /> Add Video
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="animate-spin text-sky-500" size={40} />
          <p className="text-slate-500 font-bold">Loading Library...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((v) => (
            <div key={v.id} className="bg-white border border-sky-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-sky-50 transition-all duration-300 group">
              <div className="relative aspect-video overflow-hidden bg-slate-100">
                <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-sky-900/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play size={32} className="text-white fill-white shadow-2xl" />
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-900/90 text-white text-[10px] font-black px-2 py-1 rounded">
                  {v.duration}
                </div>
              </div>

              <div className="p-5">
                <span className="text-sky-700 text-[10px] font-black uppercase tracking-widest bg-sky-50 px-2 py-1 rounded border border-sky-100">
                  {v.category}
                </span>
                <h3 className="text-slate-900 font-bold mt-3 line-clamp-1 group-hover:text-sky-600 transition-colors">
                  {v.title}
                </h3>
                
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-sky-50">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(v)} className="p-2 text-slate-400 hover:text-sky-600 transition-all">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => setDeleteId(v.id)} className="p-2 text-slate-400 hover:text-red-500 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <a href={v.video_url} target="_blank" rel="noreferrer" className="text-sky-600 font-black text-xs hover:underline flex items-center gap-1">
                    <Eye size={14} /> View Source
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create / Edit (Enhanced Visibility) */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-sky-200 overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-sky-100 bg-sky-50/50">
              <h2 className="text-xl font-bold text-slate-900">
                {modal === "create" ? "Add YouTube Video" : "Update Video Details"}
              </h2>
              <button onClick={() => setModal(null)} className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-black text-sky-700 uppercase tracking-wider">Video Title *</label>
                <input
                  className="w-full bg-white border-2 border-sky-50 rounded-xl px-4 py-3 outline-none focus:border-sky-500 transition-all font-semibold text-slate-800 placeholder:text-slate-300 shadow-sm"
                  value={editing.title || ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  placeholder="e.g. Project Launch Keynote"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-sky-700 uppercase tracking-wider">Category *</label>
                  <input
                    className="w-full bg-white border-2 border-sky-50 rounded-xl px-4 py-3 outline-none focus:border-sky-500 font-semibold text-slate-800 shadow-sm"
                    value={editing.category || ""}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    placeholder="Keynote"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-sky-700 uppercase tracking-wider">Duration</label>
                  <input
                    className="w-full bg-white border-2 border-sky-50 rounded-xl px-4 py-3 outline-none focus:border-sky-500 font-semibold text-slate-800 shadow-sm"
                    value={editing.duration || ""}
                    onChange={(e) => setEditing({ ...editing, duration: e.target.value })}
                    placeholder="12:45"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-sky-700 uppercase tracking-wider">YouTube URL</label>
                <input
                  className="w-full bg-white border-2 border-sky-50 rounded-xl px-4 py-3 outline-none focus:border-sky-500 font-mono text-sm text-slate-700 shadow-sm"
                  value={editing.video_url || ""}
                  onChange={(e) => setEditing({ ...editing, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-sky-700 uppercase tracking-wider">Description</label>
                <textarea
                  rows={3}
                  className="w-full bg-white border-2 border-sky-50 rounded-xl px-4 py-3 outline-none focus:border-sky-500 resize-none font-medium text-slate-700 shadow-sm"
                  value={editing.description || ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  placeholder="Briefly describe this video..."
                />
              </div>
            </div>

            <div className="px-8 py-6 bg-sky-50/30 border-t border-sky-100 flex items-center justify-end gap-4">
              <button onClick={() => setModal(null)} className="text-slate-500 font-bold text-sm hover:text-slate-800 px-2 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-sky-600 text-white text-sm font-bold rounded-lg hover:bg-sky-700 transition-all shadow-lg shadow-sky-100 active:scale-95 disabled:bg-sky-300"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
                {modal === "create" ? "Add Video" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-6">
          <div className="w-full max-w-sm bg-white rounded-2xl p-8 border border-sky-200 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Video?</h3>
            <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">This will remove the video from your database permanently. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 text-white font-bold text-sm rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-100">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}