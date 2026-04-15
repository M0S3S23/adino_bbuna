"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Search, ArrowRight } from "lucide-react";

type Project = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  category: string | null;
  created_at: string;
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
  }

  const categories = [
    "All",
    ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean))),
  ];

  const filtered = projects.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                        p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="bg-sky-50 text-slate-900 min-h-screen font-sans">
      {/* HEADER */}
      <section className="pt-32 pb-16 border-b border-sky-100">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl mb-6 font-light">
            Projects
          </h1>
          <p className="text-slate-500 max-w-lg">
            Here are some of the projects I have done.
          </p>
        </div>
      </section>

      {/* FILTERS */}
      <section className="py-8 border-b border-sky-100 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat || "All")}
                className={`px-4 py-1.5 text-[10px] uppercase tracking-wider transition rounded font-bold ${
                  activeCategory === cat
                    ? "bg-sky-500 text-white"
                    : "border border-sky-200 text-slate-600 hover:bg-sky-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 pl-9 pr-4 py-2 text-sm outline-none focus:border-sky-400 transition rounded"
            />
          </div>
        </div>
      </section>

      {/* PROJECTS GRID */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          {filtered.length === 0 ? (
            <div className="text-center py-24 text-slate-400">No projects found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filtered.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group block bg-white border border-sky-100 rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                    {project.image_url && (
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3 text-[10px] font-bold">
                      <span className="text-sky-500 uppercase tracking-widest">
                        {project.category || "Development"}
                      </span>
                    </div>
                    <h3 className="text-slate-900 text-lg group-hover:text-sky-600 transition mb-2">
                      {project.title}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-2 font-light">
                      {project.description}
                    </p>
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