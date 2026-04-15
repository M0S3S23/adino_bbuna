"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, 
  Save, 
  Trophy, 
  Loader2, 
  Award, 
  Calendar, 
  Building2 
} from "lucide-react";
import Link from "next/link";

export default function NewAchievementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [dateReceived, setDateReceived] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("achievements")
        .insert([{ 
          title, 
          issuer, 
          date_received: dateReceived, 
          description,
          // We can default the icon to 'Trophy' for now as per our schema
          icon_name: 'Trophy' 
        }]);

      if (error) throw error;

      router.push("/admin/achievements");
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <Link 
        href="/admin/achievements" 
        className="flex items-center gap-2 text-slate-600 hover:text-sky-600 mb-8 transition-colors font-bold text-xs uppercase tracking-widest"
      >
        <ArrowLeft size={14} /> Back to Achievements
      </Link>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border-2 border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <Trophy size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Add Achievement</h2>
          </div>
          
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-[12px] font-black uppercase text-slate-700 tracking-wider ml-1 flex items-center gap-2">
              <Award size={14} className="text-slate-400" />
              Achievement Title
            </label>
            <input 
              required 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-sky-500 focus:bg-white outline-none transition-all text-slate-800 font-medium" 
              placeholder="e.g. Outstanding Developer of the Year" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Issuer Input */}
            <div className="space-y-2">
              <label className="text-[12px] font-black uppercase text-slate-700 tracking-wider ml-1 flex items-center gap-2">
                <Building2 size={14} className="text-slate-400" />
                Issuing Organization
              </label>
              <input 
                required 
                value={issuer} 
                onChange={(e) => setIssuer(e.target.value)} 
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-sky-500 focus:bg-white outline-none transition-all text-slate-800 font-medium" 
                placeholder="e.g. University of Zambia" 
              />
            </div>

            {/* Date Input */}
            <div className="space-y-2">
              <label className="text-[12px] font-black uppercase text-slate-700 tracking-wider ml-1 flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                Date Received
              </label>
              <input 
                required 
                type="date"
                value={dateReceived} 
                onChange={(e) => setDateReceived(e.target.value)} 
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-sky-500 focus:bg-white outline-none transition-all text-slate-800 font-medium uppercase text-xs" 
              />
            </div>
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label className="text-[12px] font-black uppercase text-slate-700 tracking-wider ml-1">Brief Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={3} 
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-sky-500 focus:bg-white outline-none transition-all text-slate-800 font-medium" 
              placeholder="What was this recognition for?" 
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full md:w-auto bg-sky-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-xl shadow-sky-100 flex items-center justify-center gap-3 text-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? "Adding..." : "Save Achievement"}
          </button>
        </div>
      </form>
    </div>
  );
}