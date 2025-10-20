/**
 * Hero Banner Component
 * 
 * Large featured content banner at the top of the homepage.
 * Displays a random trending movie/show with play and info buttons.
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { getBackdropUrl } from '../lib/tmdb';
import { useMyList } from '../context/MyListContext';

export default function HeroBanner({ content, onInfoClick }) {
  const router = useRouter();
  const { toggleItem, isItemInList } = useMyList();
  const [inList, setInList] = useState(false);

  useEffect(() => {
    if (content) {
      setInList(isItemInList(content.id, content.media_type));
    }
  }, [content, isItemInList]);

  if (!content) {
    return null;
  }

  const title = content.title || content.name || 'Unknown';
  const backdropUrl = getBackdropUrl(content.backdrop_path);

  const handlePlay = () => {
    const type = content.media_type === 'tv' ? 'tv' : 'movie';
    router.push(`/watch/${type}/${content.id}`);
  };

  const handleMyListToggle = () => {
    toggleItem(content);
    setInList(!inList);
  };

  return (
    <div className="relative h-[56vw] lg:h-[80vh] w-full">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={backdropUrl}
          alt={title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center px-4 md:px-8 lg:px-16 space-y-4 md:space-y-6 max-w-2xl">
        {/* Title */}
        <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold drop-shadow-xl">
          {title}
        </h1>

        {/* Overview */}
        {content.overview && (
          <p className="text-sm md:text-base lg:text-lg line-clamp-3 md:line-clamp-4 drop-shadow-xl">
            {content.overview}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center space-x-4 text-sm md:text-base">
          {content.vote_average > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">⭐</span>
              <span className="font-semibold">{content.vote_average.toFixed(1)}</span>
            </div>
          )}
          {content.release_date && (
            <span className="text-netflix-lightGray">
              {new Date(content.release_date).getFullYear()}
            </span>
          )}
          {content.first_air_date && (
            <span className="text-netflix-lightGray">
              {new Date(content.first_air_date).getFullYear()}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* Play Button */}
          <button
            onClick={handlePlay}
            className="flex items-center space-x-2 bg-white text-black px-6 md:px-8 py-2 md:py-3 rounded font-semibold hover:bg-white/80 transition"
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            <span className="text-sm md:text-base">Play</span>
          </button>

          {/* More Info Button */}
          <button
            onClick={() => onInfoClick(content)}
            className="flex items-center space-x-2 bg-gray-500/70 text-white px-6 md:px-8 py-2 md:py-3 rounded font-semibold hover:bg-gray-500/50 transition"
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm md:text-base">More Info</span>
          </button>

          {/* My List Button */}
          <button
            onClick={handleMyListToggle}
            className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-transparent border-2 border-gray-400 text-white rounded-full hover:border-white hover:bg-gray-700/50 transition"
            title={inList ? 'Remove from My List' : 'Add to My List'}
          >
            {inList ? (
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
