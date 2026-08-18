/**
 * Title Page
 *
 * Full-screen detail page for a movie or TV show: backdrop hero, overview,
 * cast, trailers, an episode browser for TV shows, and a more-like-this grid.
 * Reachable at /title/[id]?type=movie|tv.
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import MovieCard from '../../components/MovieCard';
import Reveal from '../../components/Reveal';
import { useMyList } from '../../context/MyListContext';
import { saveWatchProgress } from '../../lib/storage';
import {
  getMovieDetails,
  getTVShowDetails,
  getSeasonDetails,
  getBackdropUrl,
  getImageUrl,
} from '../../lib/tmdb';

export default function TitlePage() {
  const router = useRouter();
  const { id, type: typeParam } = router.query;
  const { toggleItem, isItemInList } = useMyList();

  const [type, setType] = useState(null);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);
  const [inList, setInList] = useState(false);

  // TV episode browser
  const [season, setSeason] = useState('1');
  const [episodes, setEpisodes] = useState([]);

  // Trailer player
  const [activeTrailer, setActiveTrailer] = useState(null);

  const isTVShow = type === 'tv';

  // Resolve the type (explicit from the URL, or guess movie -> tv) and fetch details
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setError(null);
    setDetails(null);

    const load = async () => {
      if (typeParam === 'movie' || typeParam === 'tv') {
        try {
          const data = typeParam === 'tv' ? await getTVShowDetails(id) : await getMovieDetails(id);
          if (!cancelled) {
            setType(typeParam);
            setDetails(data);
          }
        } catch (e) {
          if (!cancelled) setError('Could not load this title. Please try again.');
        }
        return;
      }

      // No type in the URL: try movie, then fall back to TV
      try {
        const data = await getMovieDetails(id);
        if (!cancelled) {
          setType('movie');
          setDetails(data);
        }
      } catch (e) {
        try {
          const data = await getTVShowDetails(id);
          if (!cancelled) {
            setType('tv');
            setDetails(data);
          }
        } catch (e2) {
          if (!cancelled) setError('Could not load this title. Please try again.');
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, typeParam]);

  // My List state
  useEffect(() => {
    if (!id || !type) return;
    setInList(isItemInList(id, type));
  }, [id, type, isItemInList]);

  // Episodes for the selected season (TV only)
  useEffect(() => {
    if (!isTVShow || !id) return;
    let cancelled = false;
    getSeasonDetails(id, season)
      .then((data) => {
        if (!cancelled) setEpisodes(data.episodes || []);
      })
      .catch(() => {
        if (!cancelled) setEpisodes([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isTVShow, id, season]);

  // Escape closes the trailer overlay
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setActiveTrailer(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handlePlay = () => {
    const progress = { ...details, media_type: type };
    if (isTVShow) {
      progress.season = Number(season);
      progress.episode = 1;
      saveWatchProgress(progress);
      router.push(`/watch/${type}/${id}?season=${season}&episode=1`);
    } else {
      saveWatchProgress(progress);
      router.push(`/watch/${type}/${id}`);
    }
  };

  const handleMyListToggle = () => {
    toggleItem({ ...details, media_type: type });
    setInList(!inList);
  };

  if (error) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <h1 className="text-2xl font-semibold mb-4">{error}</h1>
          <Link
            href="/"
            className="px-6 py-3 h-11 flex items-center bg-white text-black rounded-full font-semibold hover:bg-gray-200 active:scale-95 transition"
          >
            Back to Home
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  if (!details) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center gap-4 min-h-screen bg-batflix-black">
          <div className="spinner" role="status" aria-label="Loading" />
          <div className="text-batflix-lightGray text-sm">Loading title...</div>
        </div>
      </>
    );
  }

  const title = details.title || details.name || 'Untitled';
  const backdropUrl = getBackdropUrl(details.backdrop_path);
  const releaseYear = details.release_date
    ? new Date(details.release_date).getFullYear()
    : details.first_air_date
    ? new Date(details.first_air_date).getFullYear()
    : null;
  const trailers = (details.videos?.results || []).filter(
    (v) => v.site === 'YouTube' && v.type === 'Trailer'
  );
  const cast = details.credits?.cast || [];

  return (
    <>
      <Head>
        <title>{title} - BatFlix</title>
        <meta
          name="description"
          content={details.overview ? details.overview.slice(0, 160) : `Watch ${title} on BatFlix`}
        />
      </Head>

      <div className="min-h-screen bg-batflix-black">
        <Header />

        {/* Backdrop hero */}
        <div className="relative h-[55vh] min-h-[460px] md:h-[65vh] w-full overflow-hidden">
          {details.backdrop_path ? (
            <Image
              src={backdropUrl}
              alt={title}
              fill
              priority
              className="object-cover animate-kenburns"
              sizes="100vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-batflix-darkGray to-batflix-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-batflix-black via-batflix-black/40 to-transparent" />

          {/* Hero content - constrained to the same 1700px container as the
              body sections, so left edges stay aligned on wide screens */}
          <div className="relative h-full max-w-[1700px] mx-auto px-4 md:px-8 lg:px-16">
            <div className="h-full flex flex-col justify-end pb-10 md:pb-16 max-w-3xl">
            {/* Back button + type eyebrow share one row, so the top-left reads
                as a single cluster instead of a lone floating button */}
            <div className="flex items-center gap-3 mb-3 animate-fade-up" style={{ animationDelay: '60ms' }}>
              <button
                onClick={() => router.back()}
                aria-label="Go back"
                className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-black/50 hover:bg-black/75 border border-white/15 text-white backdrop-blur-md transition hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-batflix-red" />
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                  {isTVShow ? 'TV Series' : 'Movie'}
                </span>
              </span>
            </div>

            <div className="animate-fade-up" style={{ animationDelay: '120ms' }}>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-xl">{title}</h1>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm md:text-base animate-fade-up" style={{ animationDelay: '180ms' }}>
              {details.vote_average > 0 && (
                <span className="flex items-center gap-1 font-semibold">
                  <span className="text-yellow-400">⭐</span>
                  {details.vote_average.toFixed(1)}
                </span>
              )}
              {releaseYear && <span className="text-green-500 font-medium">{releaseYear}</span>}
              {details.runtime && <span className="text-batflix-lightGray">{details.runtime} min</span>}
              {details.number_of_seasons && (
                <span className="text-batflix-lightGray">
                  {details.number_of_seasons} Season{details.number_of_seasons > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="mt-5 md:mt-6 flex items-center space-x-3 animate-fade-up" style={{ animationDelay: '260ms' }}>
              <button
                onClick={handlePlay}
                className="flex items-center space-x-2 bg-white text-black h-11 px-6 md:px-8 rounded-full font-semibold hover:bg-white/80 active:scale-95 transition shadow-lg shadow-black/30 shrink-0"
              >
                <svg className="w-4 h-4 sm:w-5 md:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span className="text-sm md:text-base whitespace-nowrap">Play</span>
              </button>

              {trailers.length > 0 && (
                <button
                  onClick={() => setActiveTrailer(trailers[0])}
                  className="flex items-center space-x-2 bg-white/10 border border-white/20 backdrop-blur-md text-white h-11 px-5 md:px-6 rounded-full font-semibold hover:bg-white/20 active:scale-95 transition shrink-0"
                >
                  <svg className="w-4 h-4 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span className="text-sm md:text-base whitespace-nowrap">Trailer</span>
                </button>
              )}

              <button
                onClick={handleMyListToggle}
                className="flex items-center justify-center w-11 h-11 bg-white/10 border border-white/40 backdrop-blur-md text-white rounded-full hover:border-white hover:bg-white/20 active:scale-90 transition shrink-0"
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

        {/* Body */}
        <main className="max-w-[1700px] mx-auto px-4 md:px-8 lg:px-16 pb-20 space-y-12 -mt-4 relative z-10">
          {/* Overview */}
          <Reveal>
            <section>
              {details.genres?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {details.genres.map((g) => (
                    <span
                      key={g.id}
                      className="px-3 py-1 rounded-full bg-batflix-darkGray border border-white/10 text-xs font-medium text-gray-300"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-3xl">{details.overview}</p>
            </section>
          </Reveal>

          {/* Cast */}
          {cast.length > 0 && (
            <Reveal>
              <section>
                <div className="flex items-center gap-4 mb-5">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Cast</h2>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1 snap-x snap-proximity">
                  {cast.slice(0, 16).map((person) => (
                    <div key={person.id} className="flex flex-col items-center w-20 shrink-0 snap-start text-center">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-batflix-darkGray border border-white/10">
                        {person.profile_path ? (
                          <Image
                            src={getImageUrl(person.profile_path, 'w185')}
                            alt={person.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium mt-3 leading-tight line-clamp-2">{person.name}</span>
                      <span className="text-[0.65rem] text-gray-500 leading-tight line-clamp-2 mt-0.5">
                        {person.character}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          {/* Trailers */}
          {trailers.length > 0 && (
            <Reveal>
              <section>
                <div className="flex items-center gap-4 mb-5">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                    Trailers & Clips
                  </h2>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
                  {trailers.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setActiveTrailer(t)}
                      className="group relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-batflix-darkGray hover:border-white/30 transition"
                      aria-label={`Play trailer: ${t.name}`}
                    >
                      <Image
                        src={`https://img.youtube.com/vi/${t.key}/hqdefault.jpg`}
                        alt=""
                        fill
                        className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        sizes="(max-width: 768px) 100vw, 600px"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="w-14 h-14 rounded-full bg-batflix-red/90 flex items-center justify-center shadow-lg shadow-black/40 group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 ml-1 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      </div>
                      <span className="absolute bottom-2 left-3 right-3 text-xs font-medium text-white/90 truncate">
                        {t.name}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          {/* Episode browser (TV) */}
          {isTVShow && details.number_of_seasons > 0 && (
            <Reveal>
              <section>
                <div className="flex flex-wrap items-center gap-4 mb-5">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Episodes</h2>
                  <div className="h-px flex-1 bg-white/5" />
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    aria-label="Season"
                    className="bg-batflix-darkGray text-white text-sm border border-white/10 rounded-full pl-3 pr-2 py-1.5 focus:outline-none focus:border-white/40 transition cursor-pointer"
                  >
                    {Array.from({ length: details.number_of_seasons }, (_, i) => i + 1).map((s) => (
                      <option key={s} value={s} className="bg-batflix-darkGray">Season {s}</option>
                    ))}
                  </select>
                </div>

                {episodes.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {episodes.map((ep) => (
                      <button
                        key={ep.episode_number}
                        onClick={() => {
                          saveWatchProgress({ ...details, media_type: 'tv', season: Number(season), episode: ep.episode_number });
                          router.push(`/watch/tv/${id}?season=${season}&episode=${ep.episode_number}`);
                        }}
                        className="flex items-stretch overflow-hidden rounded-xl bg-batflix-darkGray/60 border border-white/5 hover:border-white/25 hover:bg-batflix-darkGray text-left transition group"
                      >
                        {/* Compact thumbnail: official still, or the show's backdrop, or a placeholder.
                            Static image only - no autoplay, so nothing can spoil the episode. */}
                        <div className="relative w-32 sm:w-40 shrink-0 self-stretch overflow-hidden bg-black/50">
                          {ep.still_path || details.backdrop_path ? (
                            <Image
                              src={getImageUrl(ep.still_path || details.backdrop_path, 'w500')}
                              alt=""
                              fill
                              sizes="(max-width: 640px) 128px, 160px"
                              className="object-cover opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-batflix-darkGray to-black">
                              <span className="w-9 h-9 rounded-full bg-batflix-red/80 flex items-center justify-center shadow-lg shadow-black/40">
                                <svg className="w-3.5 h-3.5 ml-0.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                          {/* Episode number badge */}
                          <span className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-[0.7rem] font-bold">
                            {ep.episode_number}
                          </span>

                          {/* Hover play affordance */}
                          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-75 transition-all duration-300 shadow-lg shadow-black/40">
                              <svg className="w-3.5 h-3.5 ml-0.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </span>
                          </span>
                        </div>

                        <div className="min-w-0 p-3 flex flex-col justify-center">
                          <h4 className="font-medium text-sm truncate group-hover:text-batflix-red transition">
                            {ep.name || `Episode ${ep.episode_number}`}
                          </h4>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                            {ep.overview || 'No description available.'}
                          </p>
                          {ep.runtime > 0 && (
                            <span className="text-[0.65rem] text-gray-500 mt-1.5">
                              {ep.runtime} min
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Loading episodes...</p>
                )}
              </section>
            </Reveal>
          )}

          {/* More like this */}
          {details.similar?.results?.length > 0 && (
            <Reveal>
              <section>
                <div className="flex items-center gap-4 mb-5">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">More like this</h2>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                  {details.similar.results.slice(0, 12).map((item) => (
                    <MovieCard
                      key={`${item.id}-${isTVShow ? 'tv' : 'movie'}`}
                      item={{ ...item, media_type: isTVShow ? 'tv' : 'movie' }}
                    />
                  ))}
                </div>
              </section>
            </Reveal>
          )}
        </main>

        <Footer />

        {/* Trailer overlay */}
        {activeTrailer && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in"
            onClick={() => setActiveTrailer(null)}
          >
            <div className="w-full max-w-3xl animate-modal-in" onClick={(e) => e.stopPropagation()}>
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-soft bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${activeTrailer.key}?autoplay=1`}
                  title={`${title} Trailer`}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-4">
                <span className="text-sm text-batflix-lightGray truncate">{activeTrailer.name}</span>
                <button
                  onClick={() => setActiveTrailer(null)}
                  className="shrink-0 h-11 px-6 flex items-center bg-white/10 border border-white/20 text-white rounded-full font-semibold hover:bg-white/20 active:scale-95 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
