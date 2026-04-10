"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

export default function VideoDetails() {
  const params = useParams();
  const id = params.id as string;

  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchVideo();
  }, [id]);

  const fetchVideo = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("Error:", error);
      setLoading(false);
      return;
    }

    setVideo(data);

    // INCREMENT VIEW COUNT
    await supabase
      .from("videos")
      .update({ views: (data.views || 0) + 1 })
      .eq("id", data.id);

    setLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white">Loading video...</div>;
  if (!video) return notFound();

  const getEmbedUrl = (url: string | null) => {
    if (!url) return "";
    if (url.includes("youtube.com/watch?v=")) return url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/")) {
      const videoId = url.split("/").pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="p-6 border-b border-sky-50 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto">
          <Link href="/videos" className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-600 font-bold text-xs uppercase tracking-widest transition-colors">
            <ArrowLeft size={16} /> Back to Library
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-slate-900 shadow-2xl shadow-sky-200 mb-10">
          <iframe
            src={getEmbedUrl(video.video_url)}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest">
              {video.category || "General"}
            </span>
            <h1 className="text-4xl font-bold text-slate-900 mt-4 mb-6">{video.title}</h1>
            <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
              {video.description}
            </p>
          </div>

          <div className="space-y-4">
             <div className="bg-slate-50 rounded-3xl p-8 border border-sky-100">
                <h3 className="text-slate-900 font-bold text-sm uppercase tracking-widest mb-6 pb-4 border-b border-sky-100">Details</h3>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Calendar className="text-sky-600" size={20} />
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Posted</p>
                            <p className="text-sm font-bold text-slate-900">{new Date(video.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Clock className="text-sky-600" size={20} />
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Duration</p>
                            <p className="text-sm font-bold text-slate-900">{video.duration || "N/A"}</p>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}