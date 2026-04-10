"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play, Clock, Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Video = {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  thumbnail: string | null;
  video_url: string | null;
  duration: string | null;
  created_at: string;
};

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    setLoading(true);
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setVideos(data);
    }
    setLoading(false);
  }

  // FIXED: Explicitly filter out nulls and tell TypeScript these are strings
  const categories = [
    "All",
    ...Array.from(
      new Set(
        videos
          .map((v) => v.category)
          .filter((cat): cat is string => !!cat)
      )
    ),
  ];

  const filtered = videos.filter(
    (v) => activeCategory === "All" || v.category === activeCategory
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
        <Loader2 className="animate-spin text-sky-600" size={40} />
      </div>
    );

  return (
    <div className="bg-white min-h-screen">
      {/* HEADER */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-sky-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-sky-600 text-xs font-black uppercase tracking-[0.3em] mb-4">
            Video Library
          </p>
          <h1 className="text-5xl md:text-6xl mb-6 font-medium text-slate-900 tracking-tight">
            On Screen
          </h1>
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="py-4 border-y border-sky-100 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                activeCategory === cat
                  ? "bg-sky-600 text-white shadow-lg shadow-sky-200"
                  : "bg-slate-50 text-slate-500 hover:bg-sky-100 hover:text-sky-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="py-16 max-w-6xl mx-auto px-6">
        {/* FEATURED VIDEO */}
        {activeCategory === "All" && filtered.length > 0 && (
          <Link
            href={`/videos/${filtered[0].id}`}
            className="group block mb-20"
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-sky-200/50">
                <img
                  src={filtered[0].thumbnail || ""}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt={filtered[0].title}
                />
                <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                    <Play size={32} className="text-white fill-white" />
                  </div>
                </div>
              </div>
              <div>
                <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  Featured
                </span>
                <h2 className="text-3xl md:text-4xl mt-6 mb-4 font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                  {filtered[0].title}
                </h2>
                <p className="text-slate-500 leading-relaxed text-lg line-clamp-3">
                  {filtered[0].description}
                </p>
                <div className="flex items-center gap-6 mt-8 text-slate-400 font-bold text-xs uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Clock size={14} /> {filtered[0].duration}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />{" "}
                    {new Date(filtered[0].created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {(activeCategory === "All" ? filtered.slice(1) : filtered).map(
            (video) => (
              <Link
                key={video.id}
                href={`/videos/${video.id}`}
                className="group block"
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-5 shadow-lg shadow-sky-100 border border-sky-50">
                  <img
                    src={video.thumbnail || ""}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt={video.title}
                  />
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="w-12 h-12 rounded-full bg-sky-600 flex items-center justify-center text-white shadow-xl">
                      <Play size={20} className="fill-current" />
                    </div>
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md tracking-tighter">
                      {video.duration}
                    </div>
                  )}
                </div>
                <p className="text-sky-600 text-[10px] font-black uppercase tracking-widest mb-2">
                  {video.category || "General"}
                </p>
                <h3 className="text-slate-900 font-bold group-hover:text-sky-600 transition-colors line-clamp-2">
                  {video.title}
                </h3>
              </Link>
            )
          )}
        </div>
      </section>
    </div>
  );
}