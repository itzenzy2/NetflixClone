/**
 * MovieCard Component
 *
 * Displays a single movie or TV show card with poster image.
 * Used in carousels and grid layouts.
 */

import { useState } from 'react';
import Image from 'next/image';

export default function MovieCard({ item, onClick }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const posterPath = item.poster_path || item.backdrop_path;
  const imageUrl = posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;

  const title = item.title || item.name || 'Untitled';
  const year = item.release_date
    ? new Date(item.release_date).getFullYear()
    : item.first_air_date
      ? new Date(item.first_air_date).getFullYear()
      : null;
  const mediaType = item.media_type === 'tv' || item.first_air_date ? 'TV' : 'Movie';

  const handleClick = () => {
    if (onClick) {
      onClick(item);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className="group relative aspect-[2/3] w-[120px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left shadow-2xl shadow-black/30 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.03] hover:border-white/25 hover:shadow-black/50 sm:w-[140px] md:w-[170px] lg:w-[190px]"
    >
      {imageUrl && !imageError ? (
        <>
          {!imageLoaded && (
            <div className="absolute inset-0 animate-shimmer rounded-2xl bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
          )}

          <Image
            src={imageUrl}
            alt={title}
            onLoad={handleImageLoad}
            onError={handleImageError}
            fill
            sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, (max-width: 1024px) 170px, 190px"
            className={`object-cover transition duration-500 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
          />
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/10 via-white/5 to-black/40 p-4">
          <svg className="h-16 w-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
            />
          </svg>
        </div>
      )}

      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black via-black/25 to-transparent opacity-100 transition duration-300 group-hover:from-black/95 group-hover:via-black/35">
        <div className="w-full p-2.5 sm:p-3 md:p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur-xl sm:text-[0.62rem] sm:tracking-[0.25em]">
              {mediaType}
            </span>
            {year && (
              <span className="rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[0.58rem] text-white/70 backdrop-blur-xl sm:text-[0.62rem]">
                {year}
              </span>
            )}
          </div>
          <h3 className="font-display text-xs font-semibold leading-snug text-white line-clamp-2 sm:text-sm md:text-base">
            {title}
          </h3>
          {item.vote_average && item.vote_average > 0 && (
            <div className="mt-1.5 flex items-center gap-1.5 text-white/80">
              <svg className="h-3.5 w-3.5 text-yellow-400 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-[0.7rem] sm:text-xs">{item.vote_average.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
