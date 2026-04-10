"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <span className="text-sky-500 tracking-widest uppercase text-xs block">
            ADINO
          </span>

          <span className="text-slate-900 text-2xl tracking-wider uppercase">
            BBUNA
          </span>

          <p className="text-slate-500 text-sm mt-2 tracking-wider">
            Admin Panel
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-sky-100 shadow-sm p-8 rounded-lg">

          <h2 className="text-xl text-slate-900 mb-8" style={{ fontWeight: 400 }}>
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="text-slate-500 text-xs tracking-wider uppercase block mb-2">
                Email
              </label>

              <div className="relative">
                <User
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 pl-9 pr-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-300 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-slate-500 text-xs tracking-wider uppercase block mb-2">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 pl-9 pr-10 py-3 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-300 transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm bg-red-50 border border-red-200 px-4 py-2.5 rounded">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-sky-500 text-white text-sm tracking-wider uppercase hover:bg-sky-600 transition disabled:opacity-50 flex items-center justify-center gap-2 rounded"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}