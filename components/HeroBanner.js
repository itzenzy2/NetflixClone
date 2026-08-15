/**
 * Hero Banner Component
 *
 * Large featured content banner at the top of the homepage.
 * Displays a random trending movie/show with play and info buttons.
 */

import { useEffect, useState } from 'react';
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
    <div className="relative isolate h-[82svh] min-h-[560px] w-full overflow-hidden sm:h-[86vh] sm:min-h-[620px] lg:h-[88vh] lg:min-h-[680px]">
      <div className="absolute inset-0">
        <Image
          src={backdropUrl}
          alt={title}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-black/20 to-transparent" />
        <div className="absolute left-[-10%] top-[-5%] h-72 w-72 rounded-full bg-netflix-red/20 blur-3xl animate-float" />
        <div className="absolute right-[-8%] top-[18%] h-80 w-80 rounded-full bg-white/10 blur-3xl animate-float [animation-delay:1.2s]" />
      </div>

      <div className="section-shell relative flex h-full flex-col justify-end pb-16 pt-24 sm:pb-20 sm:pt-28 md:pb-24 lg:pt-32">
        <div className="max-w-3xl space-y-4 sm:space-y-5 md:space-y-6 animate-fade-up">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 backdrop-blur-xl">
            Featured Now
          </div>

          <h1 className="font-display text-3xl font-semibold leading-[0.95] text-white drop-shadow-2xl sm:text-4xl md:text-6xl lg:text-7xl">
            {title}
          </h1>

          {content.overview && (
            <p className="max-w-2xl text-sm leading-6 text-white/80 drop-shadow-xl sm:leading-7 md:text-base lg:text-lg">
              {content.overview}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs sm:gap-3 sm:text-sm md:text-base">
            {content.vote_average > 0 && (
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-white/90 backdrop-blur-xl">
                <span className="text-yellow-400">★</span>
                <span className="font-semibold">{content.vote_average.toFixed(1)}</span>
              </div>
            )}
            {content.release_date && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/70 backdrop-blur-xl">
                {new Date(content.release_date).getFullYear()}
              </span>
            )}
            {content.first_air_date && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/70 backdrop-blur-xl">
                {new Date(content.first_air_date).getFullYear()}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              onClick={handlePlay}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-black shadow-xl shadow-black/30 transition duration-300 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-2xl sm:w-auto"
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span className="text-sm sm:text-base">Play</span>
            </button>

            <button
              onClick={() => onInfoClick(content)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/15 sm:w-auto"
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm sm:text-base">More Info</span>
            </button>

            <button
              onClick={handleMyListToggle}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10"
              title={inList ? 'Remove from My List' : 'Add to My List'}
            >
              {inList ? (
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </div>
  );
}
