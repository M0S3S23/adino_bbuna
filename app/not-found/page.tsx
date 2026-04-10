import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-sky-50 text-slate-900 flex flex-col items-center justify-center px-6 text-center">
      
      {/* Label */}
      <p className="text-sky-500 text-xs tracking-[0.3em] uppercase mb-4">
        Error 404
      </p>

      {/* Big 404 */}
      <h1 className="text-6xl md:text-8xl text-sky-100 mb-6 font-light">
        404
      </h1>

      {/* Message */}
      <p className="text-slate-600 max-w-sm mb-10">
        This page doesn’t exist or has been moved.
      </p>

      {/* Button */}
      <Link
        href="/"
        className="px-8 py-3.5 bg-sky-500 text-white text-sm uppercase tracking-wider hover:bg-sky-600 transition-colors duration-200 rounded"
      >
        Back to Home
      </Link>
    </div>
  );
}