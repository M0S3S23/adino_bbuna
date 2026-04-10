"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  ArrowRight, 
  Briefcase, 
  GraduationCap, 
  Loader2, 
  MapPin, 
  Mail, 
  Phone, 
  Linkedin, 
  Twitter, 
  Facebook, 
  Youtube, 
  Instagram 
} from "lucide-react";

export default function About() {
  const [profile, setProfile] = useState<any>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true);

        // 1. Fetch Profile
        const { data: profileData, error: profileError } = await supabase
          .from("profile")
          .select("*")
          .maybeSingle();
        
        if (profileError) throw profileError;
        setProfile(profileData);

        if (profileData) {
          // 2. Fetch Related Data (Experience & Education)
          const [expRes, eduRes] = await Promise.all([
            supabase
              .from("experience")
              .select("*")
              .eq("profile_id", profileData.id)
              .order("created_at", { ascending: false }),
            supabase
              .from("education")
              .select("*")
              .eq("profile_id", profileData.id)
              .order("created_at", { ascending: false })
          ]);

          setExperiences(expRes.data || []);
          setEducation(eduRes.data || []);
        }
      } catch (err) {
        console.error("Error loading portfolio data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <Loader2 className="animate-spin text-sky-500" size={40} />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-4">Syncing Experience...</p>
    </div>
  );

  const socials = [
    { id: 'li', icon: <Linkedin size={18} />, url: profile?.linkedin_url, label: "LinkedIn" },
    { id: 'tw', icon: <Twitter size={18} />, url: profile?.twitter_url, label: "Twitter" },
    { id: 'fb', icon: <Facebook size={18} />, url: profile?.facebook_url, label: "Facebook" },
    { id: 'yt', icon: <Youtube size={18} />, url: profile?.youtube_url, label: "YouTube" },
    { id: 'ig', icon: <Instagram size={18} />, url: profile?.instagram_url, label: "Instagram" },
  ];

  return (
    <div className="bg-white text-slate-900">
      {/* ── Page Header ── */}
      <section className="pt-32 pb-16 border-b border-sky-100 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl text-slate-900 font-bold tracking-tighter">
            {profile?.name || "Adino Bbuna"}
          </h1>
        </div>
      </section>

      {/* ── Bio + Photo ── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-16 items-start">
          
          {/* Sidebar: Photo & Socials */}
          <div className="md:col-span-2 relative">
            <div className="aspect-[3/4] overflow-hidden rounded-3xl shadow-2xl border-8 border-white bg-slate-100">
              <img
                src={profile?.profile_pic || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800"}
                alt={profile?.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="mt-12 space-y-2">
              {[
                { label: "Location", value: profile?.location, icon: <MapPin size={14}/> },
                { label: "Email", value: profile?.email, icon: <Mail size={14}/> },
                { label: "Phone", value: profile?.phone, icon: <Phone size={14}/> },
              ].map((item) => item.value && (
                <div key={item.label} className="flex items-center gap-4 py-4 border-b border-sky-50">
                  <span className="text-sky-500 bg-sky-50 p-2 rounded-lg">{item.icon}</span>
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-[10px] font-black tracking-widest uppercase">{item.label}</span>
                    <span className="text-slate-700 font-semibold text-sm">{item.value}</span>
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap gap-3 pt-6">
                {socials.map((social) => social.url && (
                  <a 
                    key={social.id}
                    href={social.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-3 bg-slate-50 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all shadow-sm hover:-translate-y-1"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content: Bio */}
          <div className="md:col-span-3">
            <h2 className="text-3xl text-slate-900 font-bold mb-8 leading-tight italic">
              {profile?.title || "Software Engineer"}
            </h2>
            
            <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
              {profile?.bio ? (
                profile.bio.split("\n\n").map((para: string, i: number) => (
                  <p key={i}>{para}</p>
                ))
              ) : (
                <p>Architecting digital solutions with a focus on scalability and user experience.</p>
              )}
            </div>

            <div className="mt-12">
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 px-10 py-4 bg-sky-600 text-white text-xs font-black tracking-widest uppercase rounded-2xl hover:bg-sky-700 transition-all shadow-xl shadow-sky-100 active:scale-95"
              >
                Let's Collaborate <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Experience & Education (Dynamic Sections) ── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16">
          
          {/* Experience List */}
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2 bg-sky-100 rounded-lg text-sky-600">
                <Briefcase size={18} />
              </div>
              <p className="text-sky-600 text-xs font-black tracking-[0.2em] uppercase">Professional History</p>
            </div>
            <div className="relative pl-8 border-l-2 border-sky-100 space-y-12">
              {experiences.length > 0 ? experiences.map((exp) => (
                <div key={exp.id} className="relative">
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-white bg-sky-500 shadow-sm" />
                  <span className="text-sky-500 font-bold text-[10px] tracking-widest uppercase">{exp.duration}</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">{exp.role}</h3>
                  <p className="text-slate-500 font-semibold mb-3">{exp.company}</p>
                  {exp.description && <p className="text-slate-600 text-sm leading-relaxed">{exp.description}</p>}
                </div>
              )) : (
                <p className="text-slate-400 text-sm italic">No experience records found.</p>
              )}
            </div>
          </div>

          {/* Education List */}
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2 bg-sky-100 rounded-lg text-sky-600">
                <GraduationCap size={18} />
              </div>
              <p className="text-sky-600 text-xs font-black tracking-[0.2em] uppercase">Academic Foundation</p>
            </div>
            <div className="relative pl-8 border-l-2 border-sky-100 space-y-12">
              {education.length > 0 ? education.map((edu) => (
                <div key={edu.id} className="relative">
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-white bg-sky-600 shadow-sm" />
                  <span className="text-sky-600 font-bold text-[10px] tracking-widest uppercase">{edu.duration}</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">{edu.degree}</h3>
                  <p className="text-slate-500 font-semibold mb-3">{edu.institution}</p>
                  {edu.description && <p className="text-slate-600 text-sm leading-relaxed">{edu.description}</p>}
                </div>
              )) : (
                <p className="text-slate-400 text-sm italic">No academic records found.</p>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}