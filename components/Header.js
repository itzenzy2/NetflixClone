/**
 * Header Component
 * 
 * Main navigation bar for BatFlix.
 * Includes logo and navigation links.
 * Gains a blurred, darkened backdrop once the page is scrolled.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import BatLogo from './BatLogo';

export default function Header() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  // Track scroll state to switch between transparent and blurred backgrounds
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper function to check if current route is active
  const isActive = (path) => {
    return router.pathname === path;
  };

  const linkClass = (path) => {
    // Consistent padding at every breakpoint so all nav items share the same height
    const base = 'transition whitespace-nowrap rounded-full px-2 py-1.5 sm:px-2.5 sm:py-1.5 hover:bg-white/10';
    const state = isActive(path) ? 'font-semibold text-white' : 'text-batflix-lightGray hover:text-gray-300';
    return `${base} ${state}`;
  };

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-[background-color,backdrop-filter,border-color] duration-300 safe-top ${
        scrolled ? 'bg-batflix-black/85 backdrop-blur-md border-b border-black/50' : ''
      }`}
    >      <div
        className={`max-w-[1700px] mx-auto flex items-center justify-between px-4 md:px-8 lg:px-16 transition-all duration-300 ${scrolled ? 'py-2.5 md:py-3' : 'py-3 md:py-4'}`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0 group" aria-label="BatFlix Home">
          <h1 className="text-xl sm:text-2xl md:text-4xl cursor-pointer">
            <BatLogo />
          </h1>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2 md:gap-3">
          {/* Home is hidden on the smallest screens; the logo already links home */}
          <Link href="/" className={`hidden sm:inline text-xs sm:text-sm md:text-base ${linkClass('/')}`}>
            Home
          </Link>

          <Link href="/browse" className={`text-xs sm:text-sm md:text-base ${linkClass('/browse')}`}>
            Browse
          </Link>
          
          <Link href="/my-list" className={`text-xs sm:text-sm md:text-base ${linkClass('/my-list')}`}>
            My List
          </Link>

          {/* Search - padding matched to the text links so it never looks oversized */}
          <Link
            href="/search"
            aria-label="Search"
            title="Search"
            className={`p-1.5 rounded-full transition hover:bg-white/10 ${
              isActive('/search') ? 'text-white' : 'text-batflix-lightGray hover:text-gray-300'
            }`}
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </Link>
        </nav>
      </div>
      
      {/* Gradient overlay for better visibility when scrolling */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black to-transparent -z-10" />
    </header>
  );
}
