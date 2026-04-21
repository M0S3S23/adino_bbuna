"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  Save, Check, Loader2, User, Mail, Phone, MapPin, Camera, 
  Linkedin, Twitter, Facebook, Youtube, Instagram, Globe, AlertCircle,
  Briefcase, GraduationCap, Plus, Trash2, ShieldCheck, Layout
} from "lucide-react";

export default function AdminProfile() {
  const [form, setForm] = useState({
    name: "",
    title: "",
    hero_subtitle: "", // This maps to your DB column
    bio: "",
    email: "",
    phone: "",
    location: "",
    profile_pic: "",
    linkedin_url: "",
    twitter_url: "",
    facebook_url: "",
    youtube_url: "",
    instagram_url: "",
  });

  const [profileId, setProfileId] = useState<string | null>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfileData();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'profile' }, 
        (payload) => {
          if (payload.new) {
            setForm(prev => ({ ...prev, ...(payload.new as any) }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchProfileData() {
    try {
      setLoading(true);
      setError(null);

      let { data: profile, error: fetchError } = await supabase
        .from("profile")
        .select("*")
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!profile) {
        const { data: newProfile, error: createError } = await supabase
          .from("profile")
          .insert([{ name: "Portfolio Owner" }])
          .select()
          .single();
        if (createError) throw createError;
        profile = newProfile;
      }

      if (profile) {
        setProfileId(profile.id);
        setForm({
          name: profile.name || "",
          title: profile.title || "",
          hero_subtitle: profile.hero_subtitle || "",
          bio: profile.bio || "",
          email: profile.email || "",
          phone: profile.phone || "",
          location: profile.location || "",
          profile_pic: profile.profile_pic || "",
          linkedin_url: profile.linkedin_url || "",
          twitter_url: profile.twitter_url || "",
          facebook_url: profile.facebook_url || "",
          youtube_url: profile.youtube_url || "",
          instagram_url: profile.instagram_url || "",
        });

        const [expRes, eduRes] = await Promise.all([
          supabase.from("experience").select("*").eq("profile_id", profile.id).order("created_at", { ascending: false }),
          supabase.from("education").select("*").eq("profile_id", profile.id).order("created_at", { ascending: false })
        ]);

        setExperiences(expRes.data || []);
        setEducation(eduRes.data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    if (!profileId) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profile").update({ ...form }).eq("id", profileId);
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      alert("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const fileName = `profile-${Date.now()}.${file.name.split('.').pop()}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
      setForm(prev => ({ ...prev, profile_pic: publicUrl }));
      alert("Photo uploaded! Click 'Update Profile' to save.");
    } catch (error: any) {
      alert("Upload error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const addItem = async (type: 'experience' | 'education') => {
    if (!profileId) return;
    const newItem = type === 'experience' 
      ? { profile_id: profileId, role: "New Role", company: "Company Name", duration: "202X - Present" }
      : { profile_id: profileId, degree: "New Degree", institution: "University Name", duration: "202X - 202X" };

    const { data, error } = await supabase.from(type).insert([newItem]).select().single();
    if (!error && data) {
      type === 'experience' ? setExperiences([data, ...experiences]) : setEducation([data, ...education]);
    }
  };

  const updateItem = async (type: 'experience' | 'education', id: string, field: string, value: string) => {
    const list = type === 'experience' ? experiences : education;
    const setter = type === 'experience' ? setExperiences : setEducation;
    
    setter(list.map(item => item.id === id ? { ...item, [field]: value } : item));
    await supabase.from(type).update({ [field]: value }).eq("id", id);
  };

  const deleteItem = async (type: 'experience' | 'education', id: string) => {
    if (!confirm("Delete this record?")) return;
    const { error } = await supabase.from(type).delete().eq("id", id);
    if (!error) {
      type === 'experience' 
        ? setExperiences(experiences.filter(exp => exp.id !== id))
        : setEducation(education.filter(edu => edu.id !== id));
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full gap-4 bg-white">
      <Loader2 className="animate-spin text-sky-500" size={40} />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing Portfolio...</p>
    </div>
  );

  return (
    <div className="flex-1 w-full bg-white min-h-screen">
      <div className="max-w-4xl mx-auto p-8">
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
            <AlertCircle size={18} />
            <span>Database Error: {error}</span>
          </div>
        )}

        <div className="mb-10 border-b border-sky-100 pb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Portfolio Settings</h1>
          <p className="text-sky-600 font-semibold text-sm mt-1">Manage shared portfolio identity and history.</p>
        </div>

        <div className="space-y-12">
          {/* Profile Pic Section */}
          <div className="border border-sky-100 p-8 rounded-3xl bg-sky-50/30 flex flex-col md:flex-row items-center gap-8 shadow-sm">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white flex items-center justify-center">
                {form.profile_pic ? <img src={form.profile_pic} className="w-full h-full object-cover" alt="Profile" /> : <User size={48} className="text-sky-200" />}
                {uploading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><Loader2 className="animate-spin text-sky-600" /></div>}
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-2 bg-sky-600 text-white rounded-full shadow-lg hover:bg-sky-700 transition-all"><Camera size={16} /></button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            </div>
            <div className="flex-1 w-full">
              <h2 className="text-slate-900 font-bold text-lg mb-1">Display Photo</h2>
              <input name="profile_pic" value={form.profile_pic} onChange={handleChange} placeholder="Image URL..." className="w-full bg-white border border-sky-100 rounded-xl px-4 py-2 text-xs font-mono text-slate-500 outline-none focus:border-sky-500" />
            </div>
          </div>

          {/* Identity Section */}
          <div className="border border-sky-100 p-8 rounded-3xl bg-white shadow-sm space-y-6">
            <h2 className="text-sky-700 text-[10px] font-black tracking-widest uppercase flex items-center gap-2"><User size={14} /> Identity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="w-full bg-slate-50 border border-sky-100 text-slate-800 px-4 py-3 text-sm rounded-xl outline-none focus:bg-white focus:border-sky-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Title</label>
                <input name="title" value={form.title} onChange={handleChange} className="w-full bg-slate-50 border border-sky-100 text-slate-800 px-4 py-3 text-sm rounded-xl outline-none focus:bg-white focus:border-sky-500" />
              </div>
            </div>

            {/* NEW: HERO SUBTITLE FIELD */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-sky-600 uppercase tracking-wider flex items-center gap-2">
                <Layout size={12} /> Homepage Hero Subtitle
              </label>
              <input 
                name="hero_subtitle" 
                value={form.hero_subtitle} 
                onChange={handleChange} 
                placeholder="e.g. Delivering strategic oversight and complex digital solutions."
                className="w-full bg-slate-50 border border-sky-100 text-slate-800 px-4 py-3 text-sm rounded-xl outline-none focus:bg-white focus:border-sky-500 font-medium" 
              />
              <p className="text-[9px] text-slate-400 italic">This is the text that appears under your name on the main homepage.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Biography</label>
              <textarea name="bio" rows={4} value={form.bio} onChange={handleChange} className="w-full bg-slate-50 border border-sky-100 text-slate-800 px-4 py-3 text-sm rounded-xl outline-none focus:bg-white focus:border-sky-500 resize-none" />
            </div>
          </div>

          {/* Social Reach Section */}
          <div className="border border-sky-100 p-8 rounded-3xl bg-white shadow-sm space-y-6">
            <h2 className="text-sky-700 text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
              <Globe size={14} /> Social Reach
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: "linkedin_url", label: "LinkedIn", icon: <Linkedin size={14} /> },
                { name: "twitter_url", label: "Twitter / X", icon: <Twitter size={14} /> },
                { name: "facebook_url", label: "Facebook", icon: <Facebook size={14} /> },
                { name: "youtube_url", label: "YouTube", icon: <Youtube size={14} /> },
                { name: "instagram_url", label: "Instagram", icon: <Instagram size={14} /> },
              ].map((s) => (
                <div key={s.name} className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    {s.icon} {s.label}
                  </label>
                  <input 
                    name={s.name} 
                    value={(form as any)[s.name]} 
                    onChange={handleChange} 
                    placeholder="https://..." 
                    className="w-full bg-slate-50 border border-sky-100 text-slate-900 px-4 py-3 text-sm rounded-xl outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-50 transition-all shadow-sm" 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Reachability Section */}
          <div className="border border-sky-100 p-8 rounded-3xl bg-white shadow-sm space-y-6">
            <h2 className="text-sky-700 text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
              <Mail size={14} /> Reachability
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { name: "email", label: "Email", icon: <Mail size={12}/> },
                { name: "phone", label: "Phone", icon: <Phone size={12}/> },
                { name: "location", label: "Location", icon: <MapPin size={12}/> },
              ].map((f) => (
                <div key={f.name} className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    {f.icon} {f.label}
                  </label>
                  <input 
                    name={f.name} 
                    value={(form as any)[f.name]} 
                    onChange={handleChange} 
                    placeholder={`Enter your ${f.label.toLowerCase()}...`}
                    className="w-full bg-slate-50 border border-sky-100 text-slate-900 px-4 py-3 text-sm rounded-xl outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-50 transition-all shadow-sm" 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Professional History */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-900 font-bold text-xl flex items-center gap-3">
                <Briefcase className="text-sky-500" /> Professional History
              </h2>
              <button 
                onClick={() => addItem('experience')} 
                className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-sky-600 hover:text-white transition-all shadow-sm"
              >
                <Plus size={14}/> Add Experience
              </button>
            </div>
            
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="p-6 border border-sky-100 rounded-3xl bg-white shadow-md relative group transition-all hover:border-sky-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Role/Position</label>
                      <input 
                        value={exp.role} 
                        onChange={(e) => updateItem('experience', exp.id, 'role', e.target.value)} 
                        className="w-full font-bold text-slate-900 outline-none p-3 rounded-xl bg-slate-50 border border-transparent focus:border-sky-500 focus:bg-white transition-all" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Company</label>
                      <input 
                        value={exp.company} 
                        onChange={(e) => updateItem('experience', exp.id, 'company', e.target.value)} 
                        className="w-full text-slate-700 font-semibold outline-none p-3 rounded-xl bg-slate-50 border border-transparent focus:border-sky-500 focus:bg-white transition-all" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Duration</label>
                      <input 
                        value={exp.duration} 
                        onChange={(e) => updateItem('experience', exp.id, 'duration', e.target.value)} 
                        className="w-full text-sky-600 font-bold outline-none p-3 rounded-xl bg-slate-50 border border-transparent focus:border-sky-500 focus:bg-white transition-all" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Description</label>
                    <div className="flex items-start gap-4">
                      <textarea 
                        value={exp.description || ""} 
                        onChange={(e) => updateItem('experience', exp.id, 'description', e.target.value)} 
                        className="flex-1 text-sm text-slate-600 outline-none p-4 rounded-xl bg-slate-50 border border-transparent focus:border-sky-500 focus:bg-white transition-all resize-none min-h-[80px]" 
                      />
                      <button 
                        onClick={() => deleteItem('experience', exp.id)} 
                        className="mt-2 p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education History */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-900 font-bold text-xl flex items-center gap-3">
                <GraduationCap className="text-sky-600" /> Academic Foundation
              </h2>
              <button 
                onClick={() => addItem('education')} 
                className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-sky-600 hover:text-white transition-all shadow-sm"
              >
                <Plus size={14}/> Add Education
              </button>
            </div>

            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="p-6 border border-sky-100 rounded-3xl bg-white shadow-md relative group transition-all hover:border-sky-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Degree</label>
                      <input 
                        value={edu.degree} 
                        onChange={(e) => updateItem('education', edu.id, 'degree', e.target.value)} 
                        className="w-full font-bold text-slate-900 outline-none p-3 rounded-xl bg-slate-50 border border-transparent focus:border-sky-500 focus:bg-white transition-all" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Institution</label>
                      <input 
                        value={edu.institution} 
                        onChange={(e) => updateItem('education', edu.id, 'institution', e.target.value)} 
                        className="w-full text-slate-700 font-semibold outline-none p-3 rounded-xl bg-slate-50 border border-transparent focus:border-sky-500 focus:bg-white transition-all" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Duration</label>
                      <input 
                        value={edu.duration} 
                        onChange={(e) => updateItem('education', edu.id, 'duration', e.target.value)} 
                        className="w-full text-sky-600 font-bold outline-none p-3 rounded-xl bg-slate-50 border border-transparent focus:border-sky-500 focus:bg-white transition-all" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Details / Grade</label>
                    <div className="flex items-center gap-4">
                      <input 
                        value={edu.description || ""} 
                        onChange={(e) => updateItem('education', edu.id, 'description', e.target.value)} 
                        className="flex-1 text-sm text-slate-600 outline-none p-4 rounded-xl bg-slate-50 border border-transparent focus:border-sky-500 focus:bg-white transition-all" 
                      />
                      <button 
                        onClick={() => deleteItem('education', edu.id)} 
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pb-20">
            <button onClick={handleSaveProfile} disabled={saving} className={`flex items-center gap-2 px-10 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl active:scale-95 ${saved ? "bg-green-500 text-white" : "bg-sky-600 text-white hover:bg-sky-700"}`}>
              {saving ? <Loader2 className="animate-spin" size={16} /> : saved ? <><Check size={16} /> Saved</> : <><Save size={16} /> Update Profile</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}