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
  Share2,
  Twitter,
  Linkedin,
} from "lucide-react";

export default function ArticleDetail() {
  const params = useParams();
  const slug = params.slug as string;

  const [article, setArticle] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!error && data) {
      setArticle(data);

      // --- START OF UPDATE LOGIC ---
      // This part was missing. It increments the views in the database.
      await supabase
        .from("articles")
        .update({ views: (data.views || 0) + 1 })
        .eq("id", data.id);
      // --- END OF UPDATE LOGIC ---

      const { data: relatedData } = await supabase
        .from("articles")
        .select("*")
        .neq("id", data.id)
        .limit(2);

      setRelated(relatedData || []);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-50 text-slate-500 flex items-center justify-center">
        Loading article...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-sky-50 text-slate-600 flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Article not found.</p>
          <link href="/articles" className="text-sky-500 text-sm hover:underline">
            ← Back to Articles
          </link>
        </div>
      </div>
    );
  }

  const renderContent = (text: string) => {
    return text.split("\n\n").map((block, i) => {
      if (block.startsWith("**") && block.endsWith("**")) {
        return (
          <h3
            key={i}
            className="text-slate-900 text-xl mt-10 mb-4 font-medium"
          >
            {block.replace(/\*\*/g, "")}
          </h3>
        );
      }

      const parts = block.split(/(\*\*[^*]+\*\*)/g);

      return (
        <p key={i} className="text-slate-600 leading-relaxed">
          {parts.map((part, j) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={j} className="text-slate-900 font-medium">
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

  return (
    <div className="bg-sky-50 text-slate-900 min-h-screen">
      {/* Hero Image */}
      {article.cover_image && (
        <div className="relative h-[50vh] min-h-[380px] overflow-hidden">
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-sky-50" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 -mt-10 relative z-10 pb-24">

        {/* Back */}
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 text-slate-500 text-sm mb-8 hover:text-sky-600 transition"
        >
          <ArrowLeft size={14} /> Back to Articles
        </Link>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-xs">
          <span className="text-slate-500 flex items-center gap-1">
            <Calendar size={11} />
            {new Date(article.created_at).toDateString()}
          </span>

          <span className="text-slate-300">·</span>

          <span className="flex items-center gap-1 text-slate-500">
            <BookOpen size={11} /> Article
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl mb-8 leading-tight font-light">
          {article.title}
        </h1>

        {/* Body */}
        <div className="space-y-6 text-base">
          {renderContent(article.content)}
        </div>

        {/* Tag + Share */}
        <div className="mt-12 pt-8 border-t border-sky-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag size={13} className="text-slate-400" />
            <span className="px-3 py-1 border border-sky-200 text-slate-500 text-xs rounded">
              {article.category || "General"}
            </span>
          </div>

          <div className="flex gap-3">
            {/* Twitter Share */}
            <a 
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-sky-500 transition"
            >
              <Twitter size={15} />
            </a>

            {/* LinkedIn Share */}
            <a 
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-sky-500 transition"
            >
              <Linkedin size={15} />
            </a>

            {/* Copy Link to Clipboard */}
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }}
              className="text-slate-400 hover:text-sky-500 transition"
            >
              <Share2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}