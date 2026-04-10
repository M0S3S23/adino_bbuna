"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Search } from "lucide-react";

type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string | null;
  category: string | null;
  created_at: string;
};

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setArticles(data);
    }
  }

  const categories = [
    "All",
    ...Array.from(
      new Set(articles.map((a) => a.category).filter(Boolean))
    ),
  ];

  const filtered = articles.filter((a) => {
    const matchCat =
      activeCategory === "All" || a.category === activeCategory;

    const matchSearch = a.title
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchCat && matchSearch;
  });

  return (
    <div className="bg-sky-50 text-slate-900 min-h-screen">

      {/* HEADER */}
      <section className="pt-32 pb-16 border-b border-sky-100">
        <div className="max-w-6xl mx-auto px-6">

          <p className="text-sky-500 text-xs tracking-[0.3em] uppercase mb-4">
            Writing
          </p>

          <h1 className="text-5xl md:text-6xl mb-6 font-light">
            Articles
          </h1>

          <p className="text-slate-500 max-w-lg">
            In-depth analysis, insights, and articles on technology and beyond.
          </p>

        </div>
      </section>

      {/* FILTERS */}
      <section className="py-8 border-b border-sky-100 sticky top-[68px] z-40 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">

          {/* CATEGORY */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat || "")}
                className={`px-4 py-1.5 text-xs uppercase tracking-wider transition rounded ${
                  activeCategory === cat
                    ? "bg-sky-500 text-white"
                    : "border border-sky-200 text-slate-600 hover:bg-sky-100 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* SEARCH */}
          <div className="relative w-full sm:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 pl-9 pr-4 py-2 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-300 transition rounded"
            />
          </div>

        </div>
      </section>

      {/* ARTICLES GRID */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">

          {filtered.length === 0 ? (
            <div className="text-center py-24 text-slate-400">
              No articles found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">

              {filtered.map((article) => (

                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="group block bg-white border border-sky-100 rounded-lg overflow-hidden hover:shadow-md transition"
                >

                  {/* IMAGE */}
                  <div className="aspect-[16/10] overflow-hidden">
                    {article.cover_image && (
                      <img
                        src={article.cover_image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="p-5">

                    {/* META */}
                    <div className="flex items-center gap-3 mb-3 text-xs">
                      <span className="text-sky-500 uppercase">
                        {article.category || "General"}
                      </span>

                      <span className="text-slate-300">·</span>

                      <span className="text-slate-400">
                        {new Date(article.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* TITLE */}
                    <h3 className="text-slate-900 text-lg group-hover:text-sky-600 transition">
                      {article.title}
                    </h3>

                  </div>

                </Link>

              ))}

            </div>
          )}

        </div>
      </section>
    </div>
  );
}