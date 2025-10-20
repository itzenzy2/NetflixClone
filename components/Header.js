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
    <header className="fixed top-0 z-50 w-full transition-all duration-500">
      <div className="flex items-center justify-between px-4 py-4 md:px-8 lg:px-16">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <h1 className="text-netflix-red text-2xl md:text-4xl font-bold tracking-tight cursor-pointer hover:text-red-600 transition">
            NETFLIX
          </h1>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-4 md:space-x-8">
          <Link 
            href="/" 
            className={`text-sm md:text-base transition hover:text-gray-300 ${
              isActive('/') ? 'font-semibold text-white' : 'text-netflix-lightGray'
            }`}
          >
            Home
          </Link>
          
          <Link 
            href="/my-list" 
            className={`text-sm md:text-base transition hover:text-gray-300 ${
              isActive('/my-list') ? 'font-semibold text-white' : 'text-netflix-lightGray'
            }`}
          >
            My List
          </Link>
        </nav>
      </div>
      
      {/* Gradient overlay for better visibility when scrolling */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black to-transparent -z-10" />
    </header>
  );
}
