"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Save, Loader2, ArrowLeft, Eye, Edit3 } from "lucide-react";
import Link from "next/link";

export default function NewArticle() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "",
    published: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  }

  function generateSlug(title: string) {
    return (
      title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") +
      "-" +
      Date.now()
    );
  }

  async function uploadImage(): Promise<string | null> {
    if (!imageFile) return null;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
        .from("article-images") 
        .upload(fileName, imageFile);

    if (error) {
        alert(`Upload error: ${error.message}`);
        return null;
    }

    const { data } = supabase.storage
        .from("article-images")
        .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title || !form.content) {
      alert("Title and content are required");
      return;
    }

    setLoading(true);

    const coverImage = await uploadImage();
    const slug = generateSlug(form.title);

    const { error } = await supabase.from("articles").insert({
      title: form.title,
      slug,
      content: form.content,
      category: form.category || null,
      cover_image: coverImage,
      published: form.published,
    });

    setLoading(false);

    if (error) {
      alert(`Database error: ${error.message}`);
      return;
    }

    router.push("/admin/articles");
  }

  return (
    <div className="flex-1 w-full p-8 bg-sky-50 min-h-screen">
      {/* TOP NAVIGATION */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/admin/articles" className="flex items-center gap-2 text-slate-500 hover:text-sky-600 transition-colors w-fit">
          <ArrowLeft size={16} /> Back
        </Link>
        
        <button 
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
        >
          {showPreview ? <><Edit3 size={16} /> Back to Editor</> : <><Eye size={16} /> Show Preview</>}
        </button>
      </div>

      {showPreview ? (
        /* PREVIEW VIEW */
        <div className="animate-in fade-in duration-300">
          <div className="mb-4">
            <span className="text-sky-600 font-bold uppercase text-xs tracking-widest">{form.category || "Uncategorized"}</span>
            <h1 className="text-4xl font-extrabold text-slate-900 mt-2 mb-6 leading-tight">
                {form.title || "Untitled Article"}
            </h1>
          </div>
          
          {preview && (
            <div className="mb-8 rounded-xl overflow-hidden shadow-lg border border-slate-200">
              <img src={preview} alt="" className="w-full h-[400px] object-cover" />
            </div>
          )}

          <div className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap">
            {form.content || "No content written yet..."}
          </div>
        </div>
      ) : (
        /* FORM VIEW */
        <div className="animate-in fade-in duration-300">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Create New Article</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
              <input
                name="title"
                type="text"
                required
                value={form.title}
                onChange={handleChange}
                placeholder="Enter article title"
                className="w-full p-3 border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none bg-white transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <input
                  name="category"
                  type="text"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. Tech, Lifestyle"
                  className="w-full p-3 border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none bg-white"
                />
              </div>
              <div className="flex items-end pb-3">
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-md border border-slate-200 w-full">
                  <input
                    id="published"
                    type="checkbox"
                    checked={form.published}
                    onChange={() => setForm({...form, published: !form.published})}
                    className="w-4 h-4 text-sky-600 border-slate-300 rounded cursor-pointer"
                  />
                  <label htmlFor="published" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Publish immediately
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Content *</label>
              <textarea
                name="content"
                rows={12}
                required
                value={form.content}
                onChange={handleChange}
                placeholder="Write your article..."
                className="w-full p-3 border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none bg-white"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300">
              <label className="block text-sm font-medium text-slate-700 mb-2">Cover Image</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange} 
                className="text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
              />

              {preview && (
                <div className="mt-4">
                  <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-md border border-slate-200" />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-sky-600 text-white px-8 py-4 rounded-md font-bold hover:bg-sky-700 transition-all shadow-lg active:scale-[0.99] disabled:bg-slate-400"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Saving Article...
                </>
              ) : (
                <>
                  <Save size={20} /> Save Article
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}