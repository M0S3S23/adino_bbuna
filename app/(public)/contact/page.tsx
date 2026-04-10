"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  MapPin,
  Phone,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Send,
  Check,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Profile = {
  email: string;
  phone: string;
  location: string;
  twitter: string | null;
  linkedin: string | null;
  instagram: string | null;
  youtube: string | null;
};

export default function Contact() {
  const [profile, setProfile] = useState<Profile | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data } = await supabase
      .from("profile")
      .select("*")
      .single();

    if (data) setProfile(data);
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("messages").insert({
      name: form.name,
      email: form.email,
      subject: form.subject,
      message: form.message,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setSubmitted(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  }

  return (
    <div className="bg-sky-50 text-slate-900 min-h-screen">
      {/* Header */}
      <section className="pt-32 pb-16 border-b border-sky-100">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-sky-500 text-xs uppercase mb-4">
            Reach Out
          </p>

          <h1 className="text-5xl md:text-6xl font-light mb-6">
            Contact
          </h1>

          <p className="text-slate-600 max-w-lg">
            Whether it's collaboration, speaking, or just a message — I’d love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-5 gap-16">

          {/* LEFT SIDE */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-medium">Get in Touch</h2>

            {profile && (
              <>
                <div className="flex gap-4">
                  <Mail className="text-sky-500" />
                  <a href={`mailto:${profile.email}`} className="text-slate-700">
                    {profile.email}
                  </a>
                </div>

                <div className="flex gap-4">
                  <Phone className="text-sky-500" />
                  <a href={`tel:${profile.phone}`} className="text-slate-700">
                    {profile.phone}
                  </a>
                </div>

                <div className="flex gap-4">
                  <MapPin className="text-sky-500" />
                  <p className="text-slate-700">{profile.location}</p>
                </div>

                {/* Social */}
                <div className="flex gap-3 pt-6">
                  {profile.twitter && (
                    <a href={profile.twitter}><Twitter /></a>
                  )}
                  {profile.linkedin && (
                    <a href={profile.linkedin}><Linkedin /></a>
                  )}
                  {profile.instagram && (
                    <a href={profile.instagram}><Instagram /></a>
                  )}
                  {profile.youtube && (
                    <a href={profile.youtube}><Youtube /></a>
                  )}
                </div>
              </>
            )}
          </div>

          {/* RIGHT SIDE */}
          <div className="md:col-span-3">
            {submitted ? (
              <div className="text-center py-20">
                <Check className="mx-auto text-sky-500 mb-4" size={32} />
                <h3 className="text-xl font-medium mb-2">Message Sent</h3>
                <p className="text-slate-600">Thanks! I’ll reply soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <input
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="border border-sky-200 p-3 rounded"
                  />

                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="border border-sky-200 p-3 rounded"
                  />
                </div>

                <select
                  name="subject"
                  required
                  value={form.subject}
                  onChange={handleChange}
                  className="border border-sky-200 p-3 w-full rounded"
                >
                  <option value="">Select subject</option>
                  <option value="speaking">Speaking</option>
                  <option value="collaboration">Collaboration</option>
                  <option value="general">General</option>
                </select>

                <textarea
                  name="message"
                  required
                  value={form.message}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Your message..."
                  className="border border-sky-200 p-3 w-full rounded"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-sky-500 text-white px-6 py-3 rounded hover:bg-sky-600"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}