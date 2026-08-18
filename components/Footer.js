/**
 * Footer Component
 *
 * Minimal site footer with branding, a short tagline, and navigation links.
 * Kept subtle so it never competes with the content above it.
 */

import Link from 'next/link';
import BatLogo from './BatLogo';

export default function Footer() {
  return (
    <footer className="border-t border-black/50 bg-black/20 mt-8">
      <div className="mx-auto max-w-[1700px] px-4 md:px-8 lg:px-16 py-10">
        <div className="flex flex-col md:flex-row md:items-center gap-6 md:justify-between">
          {/* Brand */}
          <Link href="/" className="shrink-0 group" aria-label="BatFlix Home">
            <span className="text-2xl">
              <BatLogo />
            </span>
          </Link>

          {/* Tagline */}
          <p className="text-sm text-batflix-lightGray max-w-sm leading-relaxed">
            A demo streaming experience powered by The Movie Database (TMDb). Built for learning purposes only.
          </p>

          {/* Nav */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-batflix-lightGray" aria-label="Footer">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/browse" className="hover:text-white transition">Browse</Link>
            <Link href="/search" className="hover:text-white transition">Search</Link>
            <Link href="/my-list" className="hover:text-white transition">My List</Link>
          </nav>
        </div>

        <p className="mt-8 text-xs text-white/30">
          © {new Date().getFullYear()} BatFlix. Not affiliated with Netflix or TMDb.
        </p>
      </div>
    </footer>
  );
}
