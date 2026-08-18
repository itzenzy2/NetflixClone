/**
 * Hero Banner Component
 * 
 * Large featured content banner at the top of the homepage.
 * Displays a random trending movie/show with play and info buttons.
 */

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { getBackdropUrl } from '../lib/tmdb';
import { useMyList } from '../context/MyListContext';
import { saveWatchProgress } from '../lib/storage';

export default function HeroBanner({ content, onInfoClick }) {
  const router = useRouter();
  const { toggleItem, isItemInList } = useMyList();
  const [inList, setInList] = useState(false);
  const titleRef = useRef(null);

  // Auto-fit the title to a single line: long titles (e.g. "Spider-Man:
  // Brand New Day") would otherwise wrap to two lines, making the hero
  // content taller than the header clearance at some viewports. Shrinking
  // the font keeps the content height bounded so the eyebrow always stays
  // below the fixed header.
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const fit = () => {
      el.style.fontSize = ''; // start from the responsive class size
      const maxW = el.clientWidth;
      if (maxW <= 0) return;
      const fs = parseFloat(getComputedStyle(el).fontSize) || 24;
      el.style.whiteSpace = 'nowrap';
      const sw = el.scrollWidth;
      el.style.whiteSpace = '';
      if (sw > maxW) {
        el.style.fontSize = `${Math.max(18, Math.floor((fs * maxW) / sw))}px`;
      }
    };
    fit();
    const settle = setTimeout(fit, 60); // re-measure after fonts/images settle
    window.addEventListener('resize', fit);
    return () => {
      clearTimeout(settle);
      window.removeEventListener('resize', fit);
    };
  }, [content]);

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
    saveWatchProgress({
      ...content,
      media_type: type,
    });
    router.push(`/watch/${type}/${content.id}`);
  };

  const handleMyListToggle = () => {
    toggleItem({
      ...content,
      media_type: content.media_type || (content.first_air_date ? 'tv' : 'movie'),
    });
    setInList(!inList);
  };

  return (
    <div className="relative h-[60vh] min-h-[560px] max-h-[880px] md:h-[72vh] lg:h-[82vh] w-full overflow-hidden">
      {/* Background Image with slow Ken Burns zoom */}
      <div className="absolute inset-0">
        <Image
          src={backdropUrl}
          alt={title}
          fill
          priority
          className="object-cover animate-kenburns"
          sizes="100vw"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-batflix-black via-transparent to-transparent" />
      </div>

      {/* Content with staggered entrance - constrained to the same container
          as the rows below so left edges align at every resolution */}
      <div className="relative h-full max-w-[1700px] mx-auto px-4 md:px-8 lg:px-16">
        <div className="h-full flex flex-col justify-end pb-14 md:pb-24 lg:pb-28 space-y-4 md:space-y-6 max-w-2xl">
        {/* Eyebrow tag */}
        <div className="flex items-center gap-2 animate-fade-up" style={{ animationDelay: '80ms' }}>
          <span className="w-2 h-2 rounded-full bg-batflix-red" />
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
            Trending
          </span>
        </div>

        {/* Title */}
        <h1
          ref={titleRef}
          className="text-3xl md:text-5xl lg:text-7xl font-bold drop-shadow-xl tracking-tight animate-fade-up"
          style={{ animationDelay: '160ms' }}
        >
          {title}
        </h1>

        {/* Overview */}
        {content.overview && (
          <p
            className="text-sm md:text-base lg:text-lg line-clamp-2 md:line-clamp-3 drop-shadow-xl animate-fade-up"
            style={{ animationDelay: '240ms' }}
          >
            {content.overview}
          </p>
        )}

        {/* Stats */}
        <div
          className="flex items-center space-x-4 text-sm md:text-base animate-fade-up"
          style={{ animationDelay: '320ms' }}
        >
          {content.vote_average > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">⭐</span>
              <span className="font-semibold">{content.vote_average.toFixed(1)}</span>
            </div>
          )}
          {content.release_date && !isNaN(new Date(content.release_date).getFullYear()) && (
            <span className="text-batflix-lightGray">
              {new Date(content.release_date).getFullYear()}
            </span>
          )}
          {content.first_air_date && !isNaN(new Date(content.first_air_date).getFullYear()) && (
            <span className="text-batflix-lightGray">
              {new Date(content.first_air_date).getFullYear()}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div
          className="flex items-center space-x-3 animate-fade-up"
          style={{ animationDelay: '400ms' }}
        >
          {/* Play Button */}
          <button
            onClick={handlePlay}
            className="flex items-center space-x-2 bg-white text-black h-11 px-5 sm:px-6 md:px-8 rounded-full font-semibold hover:bg-white/80 active:scale-95 transition shadow-lg shadow-black/30 shrink-0"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            <span className="text-sm md:text-base whitespace-nowrap">Play</span>
          </button>

          {/* More Info Button */}
          <button
            onClick={() => onInfoClick(content)}
            className="flex items-center space-x-2 bg-white/10 text-white border border-white/20 backdrop-blur-md h-11 px-5 sm:px-6 md:px-8 rounded-full font-semibold hover:bg-white/20 active:scale-95 transition shrink-0"
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm md:text-base whitespace-nowrap">More Info</span>
          </button>

          {/* My List Button */}
          <button
            onClick={handleMyListToggle}
            className="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 bg-white/10 border border-white/40 backdrop-blur-md text-white rounded-full hover:border-white hover:bg-white/20 active:scale-90 transition"
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
            )}          </button>
        </div>
        </div>
      </div>
    </div>


  );
}
