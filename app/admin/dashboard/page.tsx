"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Video,
  Eye,
  TrendingUp,
  ArrowRight,
  Plus,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Article = {
  id: string;
  title: string;
  cover_image: string | null;
  published: boolean;
  created_at: string;
  views: number; // Added views to type
};

type VideoType = {
  id: string;
  title: string;
  thumbnail: string | null;
  created_at: string;
  views: number; // Added views to type
};

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    setError(null);

    try {
      // Fetch articles with views
      const { data: articlesData, error: articlesError } = await supabase
        .from("articles")
        .select("id,title,cover_image,published,created_at,views")
        .order("created_at", { ascending: false });

      if (articlesError) throw articlesError;

      // Fetch videos with views
      const { data: videosData, error: videosError } = await supabase
        .from("videos")
        .select("id,title,thumbnail,created_at,views")
        .order("created_at", { ascending: false });

      if (videosError) throw videosError;

      setArticles(articlesData || []);
      setVideos(videosData || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  // --- CALCULATIONS ---
  const totalArticleViews = articles.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalVideoViews = videos.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalViews = totalArticleViews + totalVideoViews;

  const totalContent = articles.length + videos.length;
  const engagementRate = totalContent > 0 ? (totalViews / totalContent).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50 text-slate-600">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50 text-red-500">
        {error}
      </div>
    );
  }

  const stats = [
    {
      label: "Total Articles",
      value: articles.length,
      icon: FileText,
      color: "text-sky-500",
    },
    {
      label: "Total Videos",
      value: videos.length,
      icon: Video,
      color: "text-indigo-500",
    },
    {
      label: "Total Views",
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: "text-green-500",
    },
    {
      label: "Engagement",
      value: `${engagementRate} v/p`,
      icon: TrendingUp,
      color: "text-sky-400",
    },
  ];

  return (
    <div className="p-8 bg-sky-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-2xl text-slate-900 font-medium">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Welcome back. Here's what's happening.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border rounded-lg p-5 shadow-sm">
            <div className="flex justify-between mb-4">
              <p className="text-slate-500 text-xs uppercase">{s.label}</p>
              <s.icon size={16} className={s.color} />
            </div>
            <p className="text-3xl text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        <Link
          href="/admin/articles"
          className="flex items-center gap-4 p-5 border border-dashed border-slate-300 hover:border-sky-500 hover:bg-sky-100/50 transition-all duration-200 group bg-white rounded-lg"
        >
          <div className="p-3 border border-slate-200 group-hover:border-sky-500 rounded-md">
            <Plus size={16} className="text-slate-400 group-hover:text-sky-500 transition-colors" />
          </div>
          <div>
            <p className="text-slate-900 text-sm font-normal">New Article</p>
            <p className="text-slate-400 text-xs mt-0.5">Write and publish a new article</p>
          </div>
          <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-sky-500 transition-colors" />
        </Link>
        <Link
          href="/admin/videos"
          className="flex items-center gap-4 p-5 border border-dashed border-slate-300 hover:border-sky-500 hover:bg-sky-100/50 transition-all duration-200 group bg-white rounded-lg"
        >
          <div className="p-3 border border-slate-200 group-hover:border-sky-500 rounded-md">
            <Plus size={16} className="text-slate-400 group-hover:text-sky-500 transition-colors" />
          </div>
          <div>
            <p className="text-slate-900 text-sm font-normal">New Video</p>
            <p className="text-slate-400 text-xs mt-0.5">Upload or embed a new video</p>
          </div>
          <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-sky-500 transition-colors" />
        </Link>
      </div>

      {/* RECENT ARTICLES */}
      <div className="mb-10">
        <div className="flex justify-between mb-5">
          <h2 className="text-sm uppercase text-slate-600">Recent Articles</h2>
          <Link href="/admin/articles" className="text-sky-500 text-xs hover:underline">
            View All
          </Link>
        </div>

        <div className="bg-white border rounded-lg divide-y">
          {articles.slice(0, 3).map((a) => (
            <div key={a.id} className="flex items-center gap-4 px-5 py-4">
              <img
                src={a.cover_image || "https://placehold.co/100x70"}
                className="w-12 h-9 object-cover rounded"
                alt=""
              />
              <div className="flex-1">
                <p className="text-sm text-slate-800">{a.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-slate-400">
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
                  <span className="text-slate-300">·</span>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Eye size={10} /> {a.views || 0}
                  </p>
                </div>
              </div>
              <span className={`text-xs ${a.published ? "text-green-500" : "text-yellow-500"}`}>
                {a.published ? "Published" : "Draft"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* RECENT VIDEOS */}
      <div>
        <div className="flex justify-between mb-5">
          <h2 className="text-sm uppercase text-slate-600">Recent Videos</h2>
          <Link href="/admin/videos" className="text-sky-500 text-xs hover:underline">
            View All
          </Link>
        </div>

        <div className="bg-white border rounded-lg divide-y">
          {videos.slice(0, 3).map((v) => (
            <div key={v.id} className="flex items-center gap-4 px-5 py-4">
              <img
                src={v.thumbnail || "https://placehold.co/120x70"}
                className="w-16 h-9 object-cover rounded"
                alt=""
              />
              <div className="flex-1">
                <p className="text-sm text-slate-800">{v.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-slate-400">
                    {new Date(v.created_at).toLocaleDateString()}
                  </p>
                  <span className="text-slate-300">·</span>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Eye size={10} /> {v.views || 0}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}