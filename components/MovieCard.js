/**
 * MovieCard Component
 *
 * Displays a single movie or TV show card with poster image.
 * Used in carousels and grid layouts.
 *
 * Interaction & motion:
 * - Subtle 3D tilt that follows the cursor (fine pointers only): the card
 *   rotates in perspective, the poster lifts toward the viewer, and a
 *   specular highlight trails the cursor. Transform-only, so it stays on
 *   the compositor.
 * - A thin red progress bar along the bottom when `item.progress` is set
 *   (Continue Watching entries).
 * - Clicking a card navigates to the title page.
 */

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

// Max tilt angles (degrees) — kept small for a "spatial, not gimmicky" feel
const TILT_MAX_X = 9;
const TILT_MAX_Y = 12;

export default function MovieCard({ item, onClick, onRemove }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const cardRef = useRef(null);
  const shineRef = useRef(null);
  const rafRef = useRef(null);

  // Get the poster image URL
  const posterPath = item.poster_path || item.backdrop_path;
  const imageUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : null;

  // Get the title (works for both movies and TV shows)
  const title = item.title || item.name || 'Untitled';
  const rating = Number(item.vote_average) || 0;

  const router = useRouter();

  // Tilt is only meaningful with a fine pointer and full motion
  const supportsTilt = useCallback(() => {
    if (typeof window === 'undefined') return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return window.matchMedia('(pointer: fine)').matches;
  }, []);

  // Rotate the card toward the cursor and move the specular highlight with it.
  // Direct style writes (rAF-throttled) — no React re-render per mousemove.
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const shine = shineRef.current;
    if (!card || !supportsTilt()) return;

    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const rx = (-py * TILT_MAX_X).toFixed(2);
      const ry = (px * TILT_MAX_Y).toFixed(2);
      card.style.transition = 'transform 0.1s ease-out';
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px) scale(1.02)`;

      if (shine) {
        const sx = ((px + 0.5) * 100).toFixed(1);
        const sy = ((py + 0.5) * 100).toFixed(1);
        shine.style.background = `radial-gradient(420px circle at ${sx}% ${sy}%, rgba(255,255,255,0.16), transparent 46%)`;
      }
    });
  };

  const handleMouseEnter = () => {
    if (supportsTilt()) setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const card = cardRef.current;
    if (card) {
      card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.transform = '';
    }
    if (shineRef.current) shineRef.current.style.background = '';
  };

  // Handle card click: custom handler if given, otherwise open the title page.
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

  const progress = typeof item.progress === 'number' ? item.progress : 0;

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={title}
      className="relative min-w-[150px] md:min-w-[200px] h-[225px] md:h-[300px] shrink-0 snap-start cursor-pointer group rounded-2xl bg-batflix-surface ring-1 ring-white/10 [transform-style:preserve-3d] transition-shadow duration-300 hover:z-20 hover:shadow-card-hover"
    >
      {/* Clipped image layer (flat at the card's z=0 plane) */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
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
                object-cover card-shine
                transition-all duration-700 ease-out group-hover:scale-110
                ${imageLoaded ? 'opacity-100' : 'opacity-0'}
              `}
            />
          </>
        ) : (
          // Fallback when no image
          <div className="w-full h-full bg-gradient-to-br from-batflix-surface to-batflix-black flex items-center justify-center">
            <svg
              className="w-14 h-14 text-gray-600"
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
      </div>

      {/* Cursor-following specular highlight (driven by JS on mousemove) */}
      <div
        ref={shineRef}
        aria-hidden="true"
        className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Top gradient for badge legibility */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />

      {/* Rating badge */}
      {rating > 0 && (
        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/70 border border-white/10 px-2 py-1 shadow-card transition-transform duration-300 group-hover:[transform:translateZ(28px)]">
          <svg
            className="w-3 h-3 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-[0.65rem] font-semibold text-white leading-none">
            {rating.toFixed(1)}
          </span>
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
          className="absolute top-2 left-2 z-10 w-8 h-8 bg-black/70 border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition hover:bg-black/85 hover:border-white/40 active:scale-90 [@media(pointer:coarse)]:opacity-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Hover play affordance (pops toward the viewer on hover) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:[transform:translateZ(40px)]">
        <span className="w-12 h-12 rounded-full bg-batflix-red/95 flex items-center justify-center shadow-glow-red group-hover:scale-100 scale-75 transition-transform duration-300">
          <svg className="w-5 h-5 ml-0.5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>

      {/* Bottom scrim with title: hidden until hover on desktop, always on touch */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent pt-14 px-3 pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 [@media(pointer:coarse)]:opacity-100">
        <h3 className="text-white font-semibold text-sm md:text-base line-clamp-2 drop-shadow">
          {title}
        </h3>
      </div>

      {/* Continue-watching progress bar */}
      {progress > 0 && (
        <div
          className="absolute inset-x-0 bottom-0 z-10 h-[3px] bg-white/15 pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="h-full bg-batflix-red shadow-[0_0_8px_rgba(229,9,20,0.75)]"
            style={{ width: `${Math.min(100, Math.round(progress * 100))}%` }}
          />
        </div>
      )}
    </div>
  );
}
