"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Play, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [profile, setProfile] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: profileData } = await supabase.from("profile").select("*").limit(1).single();
    if (profileData) setProfile(profileData);

    const { data: articlesData } = await supabase
      .from("articles")
      .select("*")
      .eq("published", true)
      .limit(2) 
      .order("created_at", { ascending: false });
    if (articlesData) setArticles(articlesData);

    const { data: videosData } = await supabase
      .from("videos")
      .select("*")
      .limit(2)
      .order("created_at", { ascending: false });
    if (videosData) setVideos(videosData);
  }

  return (
    <div className="bg-white text-slate-800">
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden group/hero">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover/hero:scale-105"
          style={{ backgroundImage: `url(${profile?.hero_image || '/hero-bg.jpg'})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-500/20 via-white/40 to-white" />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          
          {/* SUBTITLE WITH GLOW - FONT WEIGHT RESTORED TO BOLD */}
          <p 
            className={`
              text-sky-500 text-[10px] md:text-xs tracking-[0.3em] uppercase mb-6 font-bold 
              transition-all duration-500 ease-in-out
              group-hover/hero:text-sky-400
              group-hover/hero:[text-shadow:0_0_12px_rgba(14,165,233,0.7),0_0_25px_rgba(14,165,233,0.4)]
            `}
          >
            Project Manager <span className="text-slate-300 mx-1 opacity-50">·</span>
            · <span className="text-slate-300 mx-1 opacity-50">·</span>
            Impact <span className="text-slate-300 mx-1 opacity-50">·</span>
            · <span className="text-slate-300 mx-1 opacity-50">·</span> 
            Accountability <span className="text-slate-300 mx-1 opacity-50">·</span> 
            · <span className="text-slate-300 mx-1 opacity-50">·</span>
            Sustainability
          </p>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl text-slate-900 mb-6 leading-tight font-light tracking-tight">
            {profile?.full_name?.split(' ')[0] || "Adino"} <span className="italic text-sky-500">{profile?.full_name?.split(' ')[1] || "Bbuna"}</span>
          </h1>
          
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            {profile?.hero_subtitle || "Delivering strategic oversight and complex digital solutions."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/about"
              className="px-8 py-3.5 bg-sky-500 text-white text-sm tracking-wider uppercase hover:bg-sky-600 transition-all duration-200 shadow-lg shadow-sky-200"
            >
              About Me
            </Link>
            <Link
              href="/articles"
              className="px-8 py-3.5 border border-sky-200 text-slate-700 text-sm tracking-wider uppercase hover:border-sky-500 hover:text-sky-600 transition-all duration-200 bg-white/50 backdrop-blur-sm"
            >
              Read Articles
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown size={20} className="text-slate-400" />
        </div>
      </section>

      {/* ── About Me Section ── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-sm">
              <img
                src={profile?.profile_pic}
                alt="Profile"
                className="w-full h-auto object-contain"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 border-2 border-sky-200 pointer-events-none" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl text-slate-900 mb-6 leading-snug font-light">
              About <span className="italic text-sky-500">Me</span>
            </h2>
            <p className="text-slate-600 leading-relaxed mb-8 font-light whitespace-pre-wrap">
              {profile?.bio || "Delivering results through strategic leadership."}
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-sky-500 text-sm tracking-wider uppercase font-bold hover:gap-4 transition-all duration-200"
            >
              Learn More <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-sky-500 text-xs tracking-[0.3em] uppercase mb-3 font-bold">Insights</p>
              <h2 className="text-3xl text-slate-900 font-light">Latest Writing</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {articles.map((article) => (
              <Link key={article.id} href={`/articles/${article.slug}`} className="group block">
                <div className="aspect-[16/9] overflow-hidden mb-6 rounded-sm">
                  <img src={article.cover_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <h3 className="text-slate-900 text-xl group-hover:text-sky-500 transition-colors font-medium">{article.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Videos */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {videos.map((video) => (
              <Link key={video.id} href={`/videos/${video.slug}`} className="group block">
                <div className="relative aspect-[16/9] overflow-hidden mb-6 rounded-sm">
                  <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt=""/>
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border border-white/50 flex items-center justify-center">
                      <Play size={20} className="text-white fill-white ml-1" />
                    </div>
                  </div>
                </div>
                <h3 className="text-slate-900 text-xl font-medium group-hover:text-sky-500 transition-colors">{video.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-slate-900">
        <div className="absolute inset-0 bg-sky-900/90" />
        <div className="relative z-10 text-center px-6">
          <h2 className="text-3xl text-white mb-8 font-light">Ready to bring your vision to life?</h2>
          <Link href="/contact" className="px-10 py-4 bg-white text-sky-600 uppercase font-bold shadow-xl">Start a Conversation</Link>
        </div>
      </section>
    </div>
  );
}