/**
 * MovieCard Component
 * 
 * Displays a single movie or TV show card with poster image.
 * Used in carousels and grid layouts.
 * Shows title on hover and handles click events.
 */

import { useState } from 'react';

export default function MovieCard({ item, onClick }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get the poster image URL
  const posterPath = item.poster_path || item.backdrop_path;
  const imageUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : null;

  // Get the title (works for both movies and TV shows)
  const title = item.title || item.name || 'Untitled';

  // Handle card click
  const handleClick = () => {
    if (onClick) {
      onClick(item);
    }
  };

  // Handle image load
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <div
      onClick={handleClick}
      className="relative min-w-[150px] md:min-w-[200px] h-[225px] md:h-[300px] cursor-pointer transition-transform duration-300 ease-out hover:scale-105 group"
    >
      {/* Poster Image */}
      {imageUrl && !imageError ? (
        <>
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-700 animate-pulse rounded-md" />
          )}
          
          {/* Image */}
          <img
            src={imageUrl}
            alt={title}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`
              w-full h-full object-cover rounded-md
              transition-opacity duration-300
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            `}
          />
        </>
      ) : (
        // Fallback when no image
        <div className="w-full h-full bg-gray-800 rounded-md flex items-center justify-center">
          <svg
            className="w-16 h-16 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
            />
          </svg>
        </div>
      )}

      {/* Hover Overlay with Title */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md flex items-end">
        <div className="p-3 w-full">
          <h3 className="text-white font-semibold text-sm md:text-base line-clamp-2">
            {title}
          </h3>
          {/* Rating */}
          {item.vote_average && item.vote_average > 0 && (
            <div className="flex items-center mt-1">
              <svg
                className="w-4 h-4 text-yellow-400 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-gray-300 text-xs">
                {item.vote_average.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
