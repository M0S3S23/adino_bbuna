"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Twitter, Linkedin, Instagram, Youtube, Mail, Facebook } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchProfile() {
      const { data } = await supabase
        .from("profile")
        .select("*")
        .maybeSingle();
      if (data) setProfile(data);
    }
    fetchProfile();
  }, []);

  if (pathname?.startsWith("/admin") || pathname === "/login") return null;

  // This array maps icons to your database columns
  const socialConfigs = [
    { icon: Linkedin, href: profile?.linkedin_url },
    { icon: Twitter, href: profile?.twitter_url },
    { icon: Instagram, href: profile?.instagram_url },
    { icon: Youtube, href: profile?.youtube_url },
    { icon: Facebook, href: profile?.facebook_url },
  ];

  // Filter out any socials that don't have a URL saved
  const activeSocials = socialConfigs.filter(social => social.href && social.href.trim() !== "");

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Brand/Bio Section */}
          <div>
            <div className="mb-4">
              <span className="text-sky-500 tracking-widest uppercase text-[10px] font-black block">
                {profile?.name?.split(" ")[0] || "Portfolio"}
              </span>
              <span className="text-white text-xl tracking-wider uppercase font-bold">
                {profile?.name?.split(" ").slice(1).join(" ") || "Owner"}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-500 max-w-xs font-light">
              {profile?.hero_subtitle || "Professional Portfolio"}
            </p>
          </div>

          {/* Navigation Section */}
          <div>
            <h4 className="text-white text-[10px] font-black tracking-widest uppercase mb-5">Navigation</h4>
            <ul className="space-y-3">
              {["Home", "About", "Articles", "Contact"].map((label) => (
                <li key={label}>
                  <Link href={`/${label.toLowerCase() === 'home' ? '' : label.toLowerCase()}`}
                    className="text-sm hover:text-sky-400 transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact/Socials Section */}
          <div>
            <h4 className="text-white text-[10px] font-black tracking-widest uppercase mb-5">Connect</h4>
            
            {/* Social Icons - Only visible if links are provided */}
            <div className="flex flex-wrap gap-4 mb-6">
              {activeSocials.map((social, i) => (
                <a key={i} href={social.href} target="_blank" rel="noreferrer"
                  className="p-2 rounded-full border border-slate-700 text-slate-400 hover:border-sky-500 hover:text-sky-500 transition-all duration-200">
                  <social.icon size={15} />
                </a>
              ))}
            </div>

            {/* Email - Dynamic from Supabase */}
            {profile?.email && (
              <a href={`mailto:${profile.email}`}
                className="flex items-center gap-2 text-sm hover:text-sky-400 transition-colors duration-200 group">
                <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-sky-500/10 transition-colors">
                  <Mail size={14} className="text-sky-500" />
                </div>
                <span className="truncate">{profile.email}</span>
              </a>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-widest">
          <p>© {new Date().getFullYear()} {profile?.name}. All rights reserved.</p>
          <Link href="/login" className="text-slate-600 hover:text-sky-500 transition-colors">
            Admin Panel
          </Link>
        </div>
      </div>
    </footer>
  );
}