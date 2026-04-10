"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Pencil, Calendar, Tag, Clock, PlayCircle, Loader2 } from "lucide-react";

export default function AdminVideoView({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideo() {
      const { data } = await supabase.from("videos").select("*").eq("id", id).single();
      setVideo(data);
      setLoading(false);
    }
    fetchVideo();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-sky-500" size={32} />
    </div>
  );

  if (!video) return (
    <div className="p-20 text-center">
      <p className="text-slate-500 mb-4">Video not found.</p>
      <Link href="/admin/videos" className="text-sky-600 font-bold hover:underline">← Back to Library</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto p-8">
        {/* Navigation Bar */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-sky-50">
          <Link href="/admin/videos" className="flex items-center gap-2 text-slate-500 hover:text-sky-600 transition font-medium">
            <ArrowLeft size={18} /> Back to Library
          </Link>
          <Link href={`/admin/videos/edit/${video.id}`} className="bg-sky-600 text-white px-5 py-2 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-sky-700 shadow-sm transition-all">
            <Pencil size={14} /> Edit Details
          </Link>
        </div>

        {/* Video Player Section */}
        <div className="aspect-video w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl shadow-sky-100 mb-10 border-4 border-white ring-1 ring-sky-100">
          <iframe
            src={video.video_url?.replace("watch?v=", "embed/")}
            className="w-full h-full"
            allowFullScreen
            title={video.title}
          />
        </div>

        {/* Content Section */}
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-sky-100 text-sky-700 text-[10px] font-black uppercase tracking-widest rounded">
                {video.category || "General"}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">{video.title}</h1>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">{video.description}</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="p-8 bg-sky-50/50 rounded-2xl border border-sky-100">
              <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-sky-400 mb-6">Video Properties</h4>
              <div className="space-y-5">
                <div className="flex items-center gap-4 text-slate-600 text-sm font-medium">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-sky-500 shadow-sm">
                    <Clock size={16} />
                  </div>
                  <span>Duration: {video.duration || "N/A"}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-600 text-sm font-medium">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-sky-500 shadow-sm">
                    <Calendar size={16} />
                  </div>
                  <span>Uploaded: {new Date(video.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-600 text-sm font-medium">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-sky-500 shadow-sm">
                    <PlayCircle size={16} />
                  </div>
                  <span className="truncate">Source: {video.video_url?.includes('youtube') ? 'YouTube' : 'Other'}</span>
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-slate-300 font-mono text-center">Reference ID: {video.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}