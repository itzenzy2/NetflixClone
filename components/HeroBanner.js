/**
 * Hero Banner Component
 *
 * Large featured content banner at the top of the homepage.
 * Displays a random trending movie/show with play and info actions.
 */

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { getBackdropUrl } from '../lib/tmdb';
import { useMyList } from '../context/MyListContext';
import { saveWatchProgress } from '../lib/storage';
import useParallax from '../lib/useParallax';

export default function HeroBanner({ content, onInfoClick }) {
  const router = useRouter();
  const { toggleItem, isItemInList } = useMyList();
  const [inList, setInList] = useState(false);
  const titleRef = useRef(null);
  const backdropWrapRef = useRef(null);

  // Cinematic parallax: the backdrop drifts slower than the page as you scroll
  useParallax(backdropWrapRef, 0.22);

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
  const rating = Number(content.vote_average) || 0;
  const year = content.release_date
    ? new Date(content.release_date).getFullYear()
    : content.first_air_date
    ? new Date(content.first_air_date).getFullYear()
    : null;

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

  const handleInfoClick = () => {
    onInfoClick(content);
  };


  return (
    <div className="relative h-[68vh] min-h-[620px] max-h-[920px] md:h-[78vh] lg:h-[88vh] w-full overflow-hidden bg-batflix-black">
      {/* Background Image with slow Ken Burns zoom + scroll parallax */}
      <div ref={backdropWrapRef} className="absolute inset-0">
        <Image
          src={backdropUrl}
          alt={title}
          fill
          priority
          className="object-cover animate-kenburns"
          sizes="100vw"
        />
      </div>

      {/* Ambient aurora wash over the imagery */}
      <div className="absolute inset-0 bg-aurora opacity-60 pointer-events-none" aria-hidden="true" />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-batflix-black via-batflix-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-batflix-black via-transparent to-black/45" />
      {/* Soft vignette to pull the eye to the title block */}
      <div className="absolute inset-0 [background:radial-gradient(120%_80%_at_18%_55%,transparent_45%,rgba(0,0,0,0.55)_100%)]" />

      {/* Content with staggered entrance - constrained to the same container
          as the rows below so left edges align at every resolution */}
      <div className="relative h-full max-w-[1700px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16">
        <div className="h-full flex flex-col justify-end pb-14 md:pb-24 lg:pb-28 space-y-4 md:space-y-6 max-w-2xl">
          {/* Eyebrow tag */}
          <div className="flex items-center gap-2.5 animate-fade-up" style={{ animationDelay: '80ms' }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-batflix-red opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-batflix-red" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-white/80">
              Trending
            </span>
          </div>

          {/* Title */}
          <h1
            ref={titleRef}
            className="text-gradient text-3xl md:text-5xl lg:text-7xl font-extrabold drop-shadow-xl tracking-tight animate-fade-up"
            style={{ animationDelay: '160ms' }}
          >
            {title}
          </h1>

          {/* Overview */}
          {content.overview && (
            <p
              className="text-sm md:text-base lg:text-lg line-clamp-2 md:line-clamp-3 text-white/85 drop-shadow-xl animate-fade-up"
              style={{ animationDelay: '240ms' }}
            >
              {content.overview}
            </p>
          )}

          {/* Metadata pills */}
          <div
            className="flex flex-wrap items-center gap-2 animate-fade-up"
            style={{ animationDelay: '320ms' }}
          >            {rating > 0 && (
              <span className="glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold text-white">
                <svg
                  className="w-3.5 h-3.5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {rating.toFixed(1)}
              </span>
            )}
            {year && !isNaN(year) && (
              <span className="glass inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-semibold text-white/90">
                {year}
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
              className="flex items-center gap-2.5 h-12 px-6 bg-white text-black rounded-full font-semibold text-sm hover:bg-gray-100 hover:shadow-glow-soft active:scale-95 transition-all duration-200 shadow-lg shadow-black/30 shrink-0"
            >
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span className="whitespace-nowrap">Play</span>
            </button>

            {/* More Info Button */}
            <button
              onClick={handleInfoClick}
              className="glass flex items-center gap-2.5 h-12 px-6 text-white rounded-full font-semibold text-sm hover:bg-white/15 hover:border-white/30 active:scale-95 transition-all duration-200 shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="whitespace-nowrap">More Info</span>
            </button>

            {/* My List Button */}
            <button
              onClick={handleMyListToggle}
              className="glass flex items-center justify-center w-12 h-12 text-white rounded-full hover:border-batflix-red/60 hover:bg-batflix-red/10 active:scale-90 transition-all duration-200 shrink-0"
              title={inList ? 'Remove from My List' : 'Add to My List'}
            >
              {inList ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
