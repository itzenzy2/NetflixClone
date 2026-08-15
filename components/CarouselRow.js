/**
 * CarouselRow Component
 * 
 * Displays a horizontally scrollable row of movie/TV show cards.
 * Includes left and right scroll buttons.
 */

import { useRef, useState } from 'react';
import MovieCard from './MovieCard';

export default function CarouselRow({ title, items, onItemClick }) {
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
      setMaxScroll(scrollWidth - clientWidth);
    }
  };

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
    <div className="space-y-2 md:space-y-4 group relative">
      {/* Row Title */}
      <h2 className="text-xl md:text-2xl font-semibold px-4 md:px-8 lg:px-16">
        {title}
      </h2>

      {/* Carousel Container */}
      <div className="relative">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            onClick={handleScrollLeft}
            className="absolute left-0 top-0 bottom-0 z-40 w-12 md:w-16 bg-gradient-to-r from-black/80 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Scroll left"
          >
            <svg
              className="w-8 h-8 text-white"
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
          onLoad={updateScrollBounds}
          className="flex items-center space-x-2 md:space-x-4 overflow-x-scroll scrollbar-hide px-4 md:px-8 lg:px-16 py-4"
        >
          {items.map((item) => (
            <MovieCard
              key={`${item.id}-${item.media_type || 'movie'}`}
              item={item}
              onClick={onItemClick}
            />
          ))}
        </div>

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            onClick={handleScrollRight}
            className="absolute right-0 top-0 bottom-0 z-40 w-12 md:w-16 bg-gradient-to-l from-black/80 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Scroll right"
          >
            <svg
              className="w-8 h-8 text-white"
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
  );
}
