/**
 * MovieCard Component
 * 
 * Displays a single movie or TV show card with poster image.
 * Used in carousels and grid layouts.
 * Shows title on hover and handles click events.
 */

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function MovieCard({ item, onClick, onRemove }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get the poster image URL
  const posterPath = item.poster_path || item.backdrop_path;
  const imageUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : null;

  // Get the title (works for both movies and TV shows)
  const title = item.title || item.name || 'Untitled';

  // Handle card click: custom handler if given, otherwise open the title page
  const router = useRouter();
  const handleClick = () => {
    if (onClick) {
      onClick(item);
      return;
    }
    const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
    router.push(`/title/${item.id}?type=${type}`);
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
      className="relative min-w-[150px] md:min-w-[200px] h-[225px] md:h-[300px] shrink-0 snap-start cursor-pointer transition-all duration-300 ease-out hover:scale-[1.03] hover:z-10 hover:shadow-card group rounded-xl overflow-hidden ring-1 ring-white/5 hover:ring-white/15"
    >
      {/* Poster Image */}
      {imageUrl && !imageError ? (
        <>
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 shimmer" />
          )}
          
          {/* Image */}
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="200px"
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`
              object-cover rounded-xl
              transition-all duration-500 group-hover:scale-105
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            `}
          />
        </>
      ) : (
        // Fallback when no image
        <div className="w-full h-full bg-gray-800/70 rounded-xl flex items-center justify-center">
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

      {/* Remove button (continue watching) */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item);
          }}
          aria-label={`Remove ${title} from Continue Watching`}
          className="absolute top-2 left-2 z-10 w-8 h-8 bg-black/60 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition hover:bg-black/85 active:scale-90 [@media(pointer:coarse)]:opacity-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Quick Play Button (hover) */}
      <div className="absolute top-2 right-2 w-9 h-9 bg-black/60 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-100 scale-75 pointer-events-none">
        <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>

      {/* Hover Overlay with Title */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-end">
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
