"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Save, Loader2, ArrowLeft, AlertCircle, Eye, Edit3 } from "lucide-react";
import Link from "next/link";

export default function EditArticle({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "",
    published: true,
    cover_image: "" as string | null,
    slug: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (id) {
      fetchArticle();
    }
  }, [id]);

  async function fetchArticle() {
    setLoading(true);
    setErrorStatus(null);

    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("Fetch Error:", error);
      setErrorStatus(error?.message || "Article not found.");
      setLoading(false);
      return;
    }

    setForm({
      title: data.title,
      content: data.content,
      category: data.category || "",
      published: data.published,
      cover_image: data.cover_image,
      slug: data.slug,
    });
    setPreview(data.cover_image);
    setLoading(false);
  }

  async function uploadImage(): Promise<string | null> {
    if (!imageFile) return form.cover_image;
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from("article-images").upload(fileName, imageFile);
    if (error) return form.cover_image;
    const { data } = supabase.storage.from("article-images").getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const coverImage = await uploadImage();

    const { error } = await supabase
      .from("articles")
      .update({
        title: form.title,
        content: form.content,
        category: form.category || null,
        cover_image: coverImage,
        published: form.published,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      alert(`Update failed: ${error.message}`);
    } else {
      router.push("/admin/articles");
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-sky-500" size={40} />
      </div>
    );
  }

  if (errorStatus) {
    return (
      <div className="p-8 bg-white min-h-screen flex flex-col items-center justify-center text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900">Article Not Found</h1>
        <p className="text-slate-500 mt-2 mb-6">
          Could not find article with ID: <span className="font-mono bg-slate-100 px-2 py-1 rounded text-xs">{id}</span>
        </p>
        <Link href="/admin/articles" className="text-sky-600 font-semibold hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full p-8 bg-sky-50 min-h-screen">
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
            <h1 className="text-4xl font-extrabold text-slate-900 mt-2 mb-6 leading-tight">{form.title}</h1>
          </div>
          
          {preview && (
            <div className="mb-8 rounded-xl overflow-hidden shadow-lg border border-slate-200">
              <img src={preview} alt="" className="w-full h-[400px] object-cover" />
            </div>
          )}

          <div className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap">
            {form.content}
          </div>
          
          <div className="mt-12 pt-6 border-t border-slate-100 text-slate-400 text-sm">
            Status: {form.published ? "Published" : "Draft"}
          </div>
        </div>
      ) : (
        /* EDIT FORM VIEW */
        <div className="animate-in fade-in duration-300">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Edit Article</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
              <input
                name="title"
                required
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                className="w-full p-3 border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none bg-white transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <input
                  name="category"
                  value={form.category}
                  onChange={(e) => setForm({...form, category: e.target.value})}
                  className="w-full p-3 border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none bg-white transition-all"
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
                  <label htmlFor="published" className="text-sm font-medium text-slate-700 cursor-pointer">Published</label>
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
                onChange={(e) => setForm({...form, content: e.target.value})}
                className="w-full p-3 border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none bg-white transition-all font-sans"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300">
              <label className="block text-sm font-medium text-slate-700 mb-2">Cover Image</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                  if (file) setPreview(URL.createObjectURL(file));
                }} 
                className="text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
              />
              {preview && (
                <div className="mt-4 relative group">
                  <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-md border shadow-sm transition-opacity group-hover:opacity-90" />
                  <p className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded">Image Preview</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-sky-600 text-white px-8 py-4 rounded-md font-bold hover:bg-sky-700 transition-all shadow-lg active:scale-[0.99] disabled:bg-slate-400"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {saving ? "Updating..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}