"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Articles", to: "/articles" },
  { label: "Videos", to: "/videos" },
  { label: "Projects", to: "/projects" },
  { label: "Achievements", to: "/achievements" },
  { label: "Contact", to: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent Navbar from rendering in admin routes or login page
  if (pathname?.startsWith("/admin") || pathname === "/login") return null;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-sky-100 py-3 shadow-sm"
          : "bg-white py-5 border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex flex-col leading-none group">
          <span className="text-sky-500 tracking-widest uppercase text-[10px] font-black">
            Adino
          </span>
          <span className="text-slate-900 text-lg tracking-wider uppercase font-medium">
            Bbuna
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              className={`text-[11px] font-bold tracking-widest uppercase transition-colors duration-200 ${
                pathname === link.to
                  ? "text-sky-500"
                  : "text-slate-600 hover:text-sky-500"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          className="md:hidden p-1 text-slate-900 transition-colors hover:text-sky-500"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-sky-50 px-6 py-6 flex flex-col gap-5 shadow-2xl">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              className={`text-xs font-bold tracking-widest uppercase transition-colors ${
                pathname === link.to ? "text-sky-500" : "text-slate-600 hover:text-sky-500"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}