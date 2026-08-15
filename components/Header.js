/**
 * Header Component
 * 
 * Main navigation bar for the Netflix clone.
 * Includes logo and navigation links.
 */

import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Header() {
  const router = useRouter();
  
  // Helper function to check if current route is active
  const isActive = (path) => {
    return router.pathname === path;
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/45 to-transparent backdrop-blur-xl" />
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8 lg:px-12">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-netflix-red shadow-lg shadow-black/30 transition duration-300 group-hover:-translate-y-0.5 group-hover:bg-white/15">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 3h4.5l5.5 13.5V3H19v18h-4.5L9 7.5V21H5z" />
            </svg>
          </span>
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-white/45">Streamline</p>
            <h1 className="font-display text-2xl font-semibold tracking-[0.2em] text-white transition group-hover:text-netflix-red">
              NETFLIX
            </h1>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-sm shadow-lg shadow-black/25 backdrop-blur-xl md:gap-3 md:text-base">
          <Link
            href="/"
            className={`rounded-full px-4 py-2 transition duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white ${
              isActive('/') ? 'bg-white/15 text-white shadow-md shadow-black/20' : 'text-netflix-lightGray'
            }`}
          >
            Home
          </Link>

          <Link
            href="/my-list"
            className={`rounded-full px-4 py-2 transition duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white ${
              isActive('/my-list') ? 'bg-white/15 text-white shadow-md shadow-black/20' : 'text-netflix-lightGray'
            }`}
          >
            My List
          </Link>
        </nav>
      </div>
    </header>
  );
}
