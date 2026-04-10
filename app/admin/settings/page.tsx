"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
      setMessage("Error: User session not found.");
      setLoading(false);
      return;
    }

    // 2. Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      setMessage("Error: Current password is incorrect.");
      setLoading(false);
      return;
    }

    // 3. Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      setMessage("Error: " + updateError.message);
    } else {
      setMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    }
    setLoading(false);
  };

  return (
    <div className="p-8 bg-sky-50 min-h-screen">
      <h1 className="text-2xl font-medium mb-6 text-slate-900">Account Settings</h1>
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm max-w-md">
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 text-slate-900"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 text-slate-900"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>
          <button
            disabled={loading}
            className="w-full bg-sky-500 text-white px-4 py-2 rounded font-medium hover:bg-sky-600 transition disabled:bg-sky-300"
          >
            {loading ? "Verifying..." : "Update Password"}
          </button>
        </form>
        {message && (
          <p className={`mt-4 text-sm font-medium ${message.startsWith("Error") ? "text-red-500" : "text-green-600"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}