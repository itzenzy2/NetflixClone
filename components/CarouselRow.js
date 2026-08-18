/**
 * CarouselRow Component
 * 
 * Displays a horizontally scrollable row of movie/TV show cards.
 * Includes left and right scroll buttons.
 */

import { useEffect, useRef, useState } from 'react';
import MovieCard from './MovieCard';
import Reveal from './Reveal';

export default function CarouselRow({ title, items, onItemClick, onRemoveItem }) {
  const rowRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  // Check if we can scroll left or right
  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollPosition < maxScroll;

  // Update scroll bounds when component mounts or items change
  const updateScrollBounds = () => {
    if (rowRef.current) {
      const { scrollWidth, clientWidth } = rowRef.current;
      setMaxScroll(Math.max(scrollWidth - clientWidth, 0));
    }
  };

  // Measure bounds on mount and whenever items change or the window resizes
  useEffect(() => {
    updateScrollBounds();

    const handleResize = () => updateScrollBounds();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [items]);

  // Handle scroll left
  const handleScrollLeft = () => {
    if (rowRef.current) {
      const newPosition = Math.max(scrollPosition - 800, 0);
      rowRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    }
  };

  // Handle scroll right
  const handleScrollRight = () => {
    if (rowRef.current) {
      const newPosition = Math.min(scrollPosition + 800, maxScroll);
      rowRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    }
  };

  // Handle manual scroll
  const handleScroll = () => {
    if (rowRef.current) {
      setScrollPosition(rowRef.current.scrollLeft);
      updateScrollBounds();
    }
  };

  // Don't render if no items
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Reveal>
    <div className="space-y-2 md:space-y-4 group relative">
      {/* Row Title */}
      <div className="flex items-baseline gap-3 px-4 md:px-8 lg:px-16">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        {items.length > 0 && (
          <span className="text-xs text-batflix-lightGray/70 hidden sm:inline">
            {items.length} title{items.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            onClick={handleScrollLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-40 hidden md:flex h-11 w-11 items-center justify-center rounded-full bg-black/55 border border-white/10 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/80 hover:scale-110 active:scale-95 shadow-lg shadow-black/40"
            aria-label="Scroll left"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* Scrollable Row */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex items-center space-x-2 md:space-x-4 overflow-x-scroll scrollbar-hide snap-x snap-proximity scroll-pl-4 md:scroll-pl-8 lg:scroll-pl-16 px-4 md:px-8 lg:px-16 py-4"
        >
          {items.map((item) => (
            <MovieCard
              key={`${item.id}-${item.media_type || 'movie'}`}
              item={item}
              onClick={onItemClick}
              onRemove={onRemoveItem}
            />
          ))}
        </div>

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            onClick={handleScrollRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-40 hidden md:flex h-11 w-11 items-center justify-center rounded-full bg-black/55 border border-white/10 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/80 hover:scale-110 active:scale-95 shadow-lg shadow-black/40"
            aria-label="Scroll right"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
    </Reveal>
  );
}
