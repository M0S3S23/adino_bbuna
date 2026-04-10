"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2, Eye, X } from "lucide-react";

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
};

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMessages(data);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;

    await supabase.from("messages").delete().eq("id", deleteId);

    setDeleteId(null);
    fetchMessages();
  }

  return (
    <div className="p-8 bg-sky-50 min-h-screen">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Messages
        </h1>
        <p className="text-slate-600 text-sm">
          {messages.length} messages
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow-sm border border-sky-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-sky-100 text-slate-700">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Subject</th>
              <th className="text-left p-4">Date</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {messages.map((m) => (
              <tr
                key={m.id}
                className="border-t hover:bg-sky-50 transition"
              >
                <td className="p-4 text-slate-900">{m.name}</td>
                <td className="p-4 text-slate-700">{m.email}</td>
                <td className="p-4 text-slate-700">{m.subject}</td>
                <td className="p-4 text-slate-500">
                  {new Date(m.created_at).toLocaleDateString()}
                </td>

                <td className="p-4 flex gap-3 justify-center">
                  <button
                    onClick={() => setSelected(m)}
                    className="text-sky-600 hover:text-sky-800"
                  >
                    <Eye size={16} />
                  </button>

                  <button
                    onClick={() => setDeleteId(m.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VIEW MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded p-8 relative shadow-lg">

            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-black"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-semibold mb-6 text-slate-900 border-b pb-2">
              Message Details
            </h2>

            <div className="space-y-5 text-sm">
              {/* Sender Details - Bolded for visibility */}
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Sender Name</p>
                <p className="text-slate-900 font-bold text-base">{selected.name}</p>
              </div>

              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-sky-600 font-bold text-base">{selected.email}</p>
              </div>

              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Subject</p>
                <p className="text-slate-800 font-semibold">{selected.subject}</p>
              </div>

              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Date Received</p>
                <p className="text-slate-700">{new Date(selected.created_at).toLocaleString()}</p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Message Body</p>
                <div className="bg-slate-50 p-4 rounded border border-slate-100">
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                    {selected.message}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setSelected(null)}
                className="bg-slate-900 text-white px-6 py-2 rounded font-medium hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">

            <p className="text-slate-800 mb-4 font-medium">
              Delete this message?
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="text-slate-600 px-4 py-2 hover:bg-slate-100 rounded transition"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}