"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Tag,
  Pencil,
  Eye,
  Loader2,
} from "lucide-react";

export default function AdminArticleDetail() {
  const params = useParams();
  const id = params.id as string; // Changed from slug to id

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchArticle();
    }
  }, [id]);

  const fetchArticle = async () => {
    setLoading(true);

    // Querying by ID instead of SLUG
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      setArticle(data);
    }

    setLoading(false);
  };

  const renderContent = (text: string) => {
    if (!text) return null;
    return text.split("\n\n").map((block, i) => {
      if (block.startsWith("**") && block.endsWith("**")) {
        return (
          <h3
            key={i}
            className="text-slate-900 text-xl mt-10 mb-4 font-semibold"
          >
            {block.replace(/\*\*/g, "")}
          </h3>
        );
      }

      const parts = block.split(/(\*\*[^*]+\*\*)/g);

      return (
        <p key={i} className="text-slate-600 leading-relaxed text-lg">
          {parts.map((part, j) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={j} className="text-slate-900 font-bold">
                  {part.replace(/\*\*/g, "")}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-500 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-sky-500" size={32} />
        <p>Fetching admin preview...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white text-slate-600 flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Article not found in database.</p>
          <Link href="/admin/articles" className="text-sky-600 font-medium hover:underline">
            ← Return to Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-slate-900 min-h-screen">
      {/* Header Image */}
      {article.cover_image && (
        <div className="relative h-[40vh] min-h-[75] overflow-hidden border-b border-slate-100">
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-white via-transparent to-transparent" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-12 relative z-10">
        
        {/* Admin Navigation Bar */}
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
          <Link
            href="/admin/articles"
            className="inline-flex items-center gap-2 text-slate-500 text-sm hover:text-sky-600 transition font-medium"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>

          <div className="flex gap-3">
            {/* Link to Edit Page */}
            <Link
              href={`/admin/articles/edit/${article.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-md text-sm font-semibold hover:bg-slate-200 transition"
            >
              <Pencil size={14} /> Edit
            </Link>
            {/* Link to Public Live Site */}
            <Link
              href={`/articles/${article.slug}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-semibold hover:bg-sky-700 transition shadow-sm"
            >
              <Eye size={14} /> View Live
            </Link>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6 flex gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${article.published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {article.published ? 'Published' : 'Draft'}
          </span>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(article.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <BookOpen size={12} /> Admin Review Mode
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl mb-10 leading-tight font-bold text-slate-900 tracking-tight">
          {article.title}
        </h1>

        {/* Body Content */}
        <div className="space-y-8 pb-20 border-b border-slate-100">
          {renderContent(article.content)}
        </div>

        {/* Footer Info */}
        <div className="mt-10 flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <Tag size={14} />
            <span className="text-xs font-semibold uppercase tracking-wider italic">
              {article.category || "Uncategorized"}
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-tighter">Database Entry: {article.id}</p>
        </div>
      </div>
    </div>
  );
}