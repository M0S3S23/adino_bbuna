"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, Loader2, FileText, Globe } from "lucide-react";

type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string | null;
  category: string | null;
  published: boolean;
  created_at: string;
};

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error.message);
    } else if (data) {
      setArticles(data);
    }
    setLoading(false);
  }

  async function confirmDelete() {
    if (!deleteId) return;

    setIsDeleting(true);
    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", deleteId);

    if (error) {
      alert(`Error deleting: ${error.message}`);
    } else {
      setArticles(articles.filter((a) => a.id !== deleteId));
    }

    setIsDeleting(false);
    setDeleteId(null);
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full gap-4 bg-sky-50">
      <Loader2 className="animate-spin text-sky-500" size={40} />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Fetching Articles...</p>
    </div>
  );

  return (
    <div className="flex-1 w-full p-8 bg-sky-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl text-slate-900 font-medium">Admin Articles</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your content. {articles.filter(a => a.published).length} live, {articles.filter(a => !a.published).length} drafts.
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-all shadow-lg shadow-sky-100 font-bold text-xs uppercase tracking-widest"
        >
          <Plus size={16} /> New Article
        </Link>
      </div>

      {/* TABLE / LIST */}
      <div className="bg-white border border-sky-100 rounded-2xl shadow-sm overflow-hidden">
        {articles.length === 0 ? (
          <div className="p-20 text-center text-slate-500">
            No articles found. Create your first one!
          </div>
        ) : (
          <div className="divide-y divide-sky-50">
            {articles.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between px-6 py-5 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-5">
                  {/* Image Preview */}
                  <div className="w-16 h-12 rounded-lg bg-slate-100 overflow-hidden border border-sky-50 flex-shrink-0">
                    {a.cover_image ? (
                      <img src={a.cover_image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50">
                         <FileText size={16} className="text-slate-300" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-slate-800 font-bold text-sm">{a.title}</p>
                    <div className="flex gap-3 items-center mt-1">
                      {/* STATUS BADGE */}
                      <span className={`text-xs ${a.published ? "text-green-500" : "text-yellow-500"}`}>
                        {a.published ? "Published" : "Draft"}
                      </span>
                      <p className="text-[10px] text-slate-400 font-medium uppercase">
                        {new Date(a.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1">
                  {/* View Live - Only enabled/visible if published */}
                  <a 
                    href={a.published ? `/articles` : `/admin/articles/edit/${a.id}`} 
                    target={a.published ? "_blank" : "_self"}
                    className={`p-2.5 rounded-xl transition-all ${
                        a.published 
                        ? 'text-slate-400 hover:text-sky-600 hover:bg-sky-50' 
                        : 'text-slate-200 cursor-not-allowed'
                    }`}
                    title={a.published ? "View Live" : "Draft (Cannot view live)"}
                  >
                    <Eye size={18} />
                  </a>

                  <Link 
                    href={`/admin/articles/edit/${a.id}`}
                    className="p-2.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all"
                    title="Edit"
                  >
                    <Pencil size={18} />
                  </Link>

                  <button 
                    onClick={() => setDeleteId(a.id)}
                    className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DELETE CONFIRM MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-sky-100">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Article?</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              This action cannot be undone. The article will be removed from your database and the live site.
            </p>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setDeleteId(null)}
                className="px-6 py-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-100 font-bold text-xs uppercase tracking-widest"
              >
                {isDeleting ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}