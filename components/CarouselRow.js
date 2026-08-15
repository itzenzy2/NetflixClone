/**
 * CarouselRow Component
 *
 * Displays a horizontally scrollable row of movie/TV show cards.
 * Includes left and right scroll buttons.
 */

import { useEffect, useRef, useState } from 'react';
import MovieCard from './MovieCard';

export default function CarouselRow({ title, items, onItemClick }) {
  const rowRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollPosition < maxScroll;

  const updateScrollBounds = () => {
    if (rowRef.current) {
      const { scrollWidth, clientWidth } = rowRef.current;
      setMaxScroll(Math.max(scrollWidth - clientWidth, 0));
    }
  };

  useEffect(() => {
    updateScrollBounds();

    const handleResize = () => updateScrollBounds();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [items]);

  const handleScrollLeft = () => {
    if (rowRef.current) {
      const newPosition = Math.max(scrollPosition - 720, 0);
      rowRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  const handleScrollRight = () => {
    if (rowRef.current) {
      const newPosition = Math.min(scrollPosition + 720, maxScroll);
      rowRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  const handleScroll = () => {
    if (rowRef.current) {
      setScrollPosition(rowRef.current.scrollLeft);
      updateScrollBounds();
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="group relative space-y-3 md:space-y-4">
      <div className="section-shell flex items-end justify-between gap-4">
        <div>
          <h2 className="section-title">{title}</h2>
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-white/35">
            {items.length} titles
          </p>
        </div>
      </div>

      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={handleScrollLeft}
            className="absolute left-2 top-1/2 z-40 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/55 text-white opacity-0 shadow-xl shadow-black/40 backdrop-blur-xl transition duration-300 hover:bg-black/75 group-hover:opacity-100 md:flex"
            aria-label="Scroll left"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex items-start gap-3 overflow-x-auto scrollbar-hide px-4 py-4 md:items-center md:gap-4 md:px-8 lg:px-12"
        >
          {items.map((item) => (
            <MovieCard
              key={`${item.id}-${item.media_type || 'movie'}`}
              item={item}
              onClick={onItemClick}
            />
          ))}
        </div>

        {canScrollRight && (
          <button
            onClick={handleScrollRight}
            className="absolute right-2 top-1/2 z-40 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/55 text-white opacity-0 shadow-xl shadow-black/40 backdrop-blur-xl transition duration-300 hover:bg-black/75 group-hover:opacity-100 md:flex"
            aria-label="Scroll right"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-netflix-black to-transparent sm:w-14 lg:w-16" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-netflix-black to-transparent sm:w-14 lg:w-16" />
      </div>
    </div>
  );
}
