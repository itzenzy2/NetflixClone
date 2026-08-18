/**
 * Video Player Page
 * 
 * Full-screen video player using VidKing embedded iframe.
 * Supports both movies and TV shows with season/episode parameters,
 * including an in-page season/episode switcher for TV shows.
 * 
 * Routes:
 * - /watch/movie/[id] for movies
 * - /watch/tv/[id]?season=1&episode=1 for TV shows
 */

import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { getMovieDetails, getTVShowDetails, getSeasonDetails, getBackdropUrl, getImageUrl } from '../../../lib/tmdb';
import { updateWatchProgress, getContinueWatching } from '../../../lib/storage';
import { useMyList } from '../../../context/MyListContext';

export default function WatchPage() {
  const router = useRouter();
  const { type, id } = router.query;
  const [iframeUrl, setIframeUrl] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // TV show episode state
  const [season, setSeason] = useState('1');
  const [episode, setEpisode] = useState('1');
  const prevEpisodeRef = useRef(null);
  const [totalSeasons, setTotalSeasons] = useState(0);
  const [episodes, setEpisodes] = useState([]);
  const [showTitle, setShowTitle] = useState('');
  const [movieDetails, setMovieDetails] = useState(null);
  const [tvDetails, setTvDetails] = useState(null);

  // My List state
  const { toggleItem, isItemInList } = useMyList();
  const [inList, setInList] = useState(false);

  // Sync season/episode state with the URL
  useEffect(() => {
    if (router.query.season) setSeason(String(router.query.season));
    if (router.query.episode) setEpisode(String(router.query.episode));
  }, [router.query.season, router.query.episode]);

  // Build the embed URL whenever type/id/season/episode changes.
  // router.isReady guards the first render of a directly-loaded URL, where
  // router.query is still empty for this auto-exported dynamic route.
  useEffect(() => {
    if (!router.isReady || !type || !id) return;

    let url = '';

    if (type === 'movie') {
      // Movie URL: https://www.vidking.net/embed/movie/{tmdbId}
      url = `https://www.vidking.net/embed/movie/${id}`;
    } else if (type === 'tv') {
      // TV Show URL: https://www.vidking.net/embed/tv/{tmdbId}/{season}/{episode}
      url = `https://www.vidking.net/embed/tv/${id}/${season}/${episode}`;
    } else {
      // Unknown type - leave URL null so we render the error state
      setIframeUrl(null);
      return;
    }

    // Add customization parameters
    const params = new URLSearchParams({
      color: 'E50914', // BatFlix red
      autoPlay: 'true',
    });

    setIframeUrl(`${url}?${params.toString()}`);

    // Record progress so Continue Watching stays up to date
    updateWatchProgress(id, type, type === 'tv' ? { season: Number(season), episode: Number(episode) } : {});
  }, [router.isReady, type, id, season, episode]);

  // Approximate watch progress over time. The embedded player is a
  // cross-origin iframe, so its position can't be read directly — instead the
  // fraction watched creeps up while the page is open and persists between
  // sessions, powering the progress bar on Continue Watching cards.
  useEffect(() => {
    if (!router.isReady || !type || !id || !iframeUrl) return;

    // First visit continues from the stored position; switching episode or
    // season restarts the bar for the new episode.
    const stored = getContinueWatching().find(
      (entry) => entry.id === Number(id) && entry.media_type === type
    );
    const epChanged =
      prevEpisodeRef.current &&
      (prevEpisodeRef.current.season !== season || prevEpisodeRef.current.episode !== episode);
    prevEpisodeRef.current = { season, episode };

    let progress = epChanged ? 0.02 : stored?.progress ?? 0.02;
    const tick = () => {
      progress = Math.min(progress + 0.02, 0.9);
      updateWatchProgress(id, type, { progress });
    };
    const timer = setInterval(tick, 15000);
    return () => clearInterval(timer);
  }, [router.isReady, type, id, season, episode, iframeUrl]);

  // Fetch show metadata for the TV episode switcher
  useEffect(() => {
    if (!router.isReady || type !== 'tv' || !id) return;
    let cancelled = false;

    getTVShowDetails(id)
      .then((data) => {
        if (!cancelled) {
          setTotalSeasons(data.number_of_seasons || 0);
          setShowTitle(data.name || '');
          setTvDetails(data);
        }
      })
      .catch((err) => console.error('Error fetching show details:', err));

    return () => {
      cancelled = true;
    };
  }, [router.isReady, type, id]);

  // Fetch movie metadata for the header + About panel
  useEffect(() => {
    if (!router.isReady || type !== 'movie' || !id) return;
    let cancelled = false;
    getMovieDetails(id)
      .then((data) => {
        if (!cancelled) {
          setShowTitle(data.title || '');
          setMovieDetails(data);
        }
      })
      .catch((err) => console.error('Error fetching movie details:', err));
    return () => {
      cancelled = true;
    };
  }, [router.isReady, type, id]);

  // Fetch episodes for the selected season
  useEffect(() => {
    if (!router.isReady || type !== 'tv' || !id) return;
    let cancelled = false;

    getSeasonDetails(id, season)
      .then((data) => {
        if (!cancelled) setEpisodes(data.episodes || []);
      })
      .catch((err) => console.error('Error fetching season details:', err));

    return () => {
      cancelled = true;
    };
  }, [router.isReady, type, id, season]);

  // My List membership
  useEffect(() => {
    if (!router.isReady || !id || !type) return;
    setInList(isItemInList(id, type));
  }, [router.isReady, id, type, isItemInList]);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  const handleGoBack = () => {
    router.back();
  };

  const handleSeasonChange = (nextSeason) => {
    setSeason(String(nextSeason));
    setEpisode('1');
    router.replace(
      `/watch/tv/${id}?season=${nextSeason}&episode=1`,
      undefined,
      { shallow: true }
    );
  };

  const handleEpisodeChange = (nextEpisode) => {
    setEpisode(String(nextEpisode));
    router.replace(
      `/watch/tv/${id}?season=${season}&episode=${nextEpisode}`,
      undefined,
      { shallow: true }
    );
  };

  const handleMyListToggle = () => {
    if (type === 'movie' && movieDetails) {
      toggleItem({ ...movieDetails, media_type: 'movie' });
    } else if (type === 'tv' && tvDetails) {
      toggleItem({ ...tvDetails, media_type: 'tv' });
    }
    setInList(!inList);
  };

  const toggleFullscreen = () => {
    const elem = document.getElementById('video-player');
    
    if (!isFullscreen) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Unknown content type (neither movie nor tv)
  if (type && iframeUrl === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-batflix-black px-4 text-center">
        <h1 className="text-white text-2xl font-semibold mb-4">Nothing to play here</h1>
        <p className="text-gray-400 mb-8">This link doesn't point to a valid movie or TV show.</p>
        <Link
          href="/"
          className="px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  if (!iframeUrl) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-screen bg-batflix-black">
        <div className="spinner" role="status" aria-label="Loading" />
        <div className="text-batflix-lightGray text-sm">Loading player...</div>
      </div>
    );
  }

  const selectedEpisodeInfo = episodes.find((ep) => ep.episode_number === Number(episode));
  const movieYear = movieDetails?.release_date
    ? new Date(movieDetails.release_date).getFullYear()
    : null;
  const tvYear = tvDetails?.first_air_date
    ? new Date(tvDetails.first_air_date).getFullYear()
    : null;
  const title = showTitle || 'Now Playing';
  const backdropPath = movieDetails?.backdrop_path || tvDetails?.backdrop_path;
  const backdropUrl = backdropPath ? getBackdropUrl(backdropPath) : null;

  return (
    <>
      <Head>
        <title>{(showTitle || 'Watch') + ' - BatFlix'}</title>
      </Head>

      <div className="relative min-h-screen bg-batflix-black">
        {/* Ambient backdrop so the player never floats in a void */}
        {backdropUrl && (
          <div
            className="absolute inset-x-0 top-0 h-[80vh] overflow-hidden pointer-events-none"
            aria-hidden="true"
          >
            <Image
              src={backdropUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-top opacity-25"
            />
            <div className="absolute inset-0 bg-aurora opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-batflix-black/50 to-batflix-black" />
          </div>
        )}

        <div className="relative z-10">
          {/* Player header: back · title · fullscreen */}
          <div className="max-w-[1700px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 pt-4 md:pt-6 safe-top">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleGoBack}
                aria-label="Go back"
                className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-black/50 hover:bg-black/75 border border-white/15 text-white backdrop-blur-md transition hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex-1 min-w-0 text-center px-2">
                <p className="flex items-center justify-center gap-2 text-[0.65rem] md:text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-batflix-red" />
                  {type === 'tv' ? 'TV Series' : 'Now Playing'}
                </p>
                <h1 className="text-lg md:text-2xl font-bold tracking-tight truncate mt-1">
                  {title}
                </h1>
                {type === 'tv' && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    S{season} • E{episode}
                    {selectedEpisodeInfo?.name ? ` • ${selectedEpisodeInfo.name}` : ''}
                  </p>
                )}
              </div>

              <button
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-black/50 hover:bg-black/75 border border-white/15 text-white backdrop-blur-md transition hover:scale-105 active:scale-95"
              >
                {isFullscreen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Cinematic player frame */}
          <div className="max-w-6xl mx-auto px-4 md:px-8 mt-4 md:mt-8 animate-fade-in">
            <div
              id="video-player"
              className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black ring-1 ring-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.85)]"
            >
              <iframe
                src={iframeUrl}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title="Video Player"
              />
            </div>
          </div>

          {/* Below the player */}
          <div className="max-w-6xl mx-auto px-4 md:px-8 pb-16 pt-6 md:pt-8 space-y-4 md:space-y-6">
            {/* Movie: about panel */}
            {type === 'movie' && movieDetails && (
              <div className="bg-batflix-darkGray/70 backdrop-blur-md rounded-2xl border border-white/10 p-4 md:p-6 animate-fade-up" style={{ animationDelay: '60ms' }}>
                <div className="flex items-center gap-4 mb-5">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">About</h2>
                  <div className="h-px flex-1 bg-white/5" />
                  <button
                    onClick={handleMyListToggle}
                    className={`inline-flex items-center gap-2 h-9 px-4 rounded-full text-xs font-semibold border transition active:scale-95 ${
                      inList
                        ? 'bg-batflix-red/20 border-batflix-red/40 text-white hover:bg-batflix-red/30'
                        : 'bg-white/5 border-white/15 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {inList ? (
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                    {inList ? 'In My List' : 'My List'}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-5 sm:gap-7">
                  {/* Poster */}
                  {movieDetails.poster_path && (
                    <div className="shrink-0 w-28 md:w-36 self-start">
                      <div className="relative aspect-[2/3] rounded-xl overflow-hidden ring-1 ring-white/10 bg-batflix-black shadow-card">
                        <Image
                          src={getImageUrl(movieDetails.poster_path, 'w342')}
                          alt={title}
                          fill
                          sizes="144px"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm md:text-base">
                      {movieDetails.vote_average > 0 && (
                        <span className="flex items-center gap-1.5 font-semibold">
                          <svg
                            className="w-4 h-4 md:w-[18px] md:h-[18px] text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {movieDetails.vote_average.toFixed(1)}
                        </span>
                      )}
                      {movieYear && <span className="text-green-500 font-semibold">{movieYear}</span>}
                      {movieDetails.runtime > 0 && (
                        <span className="text-batflix-lightGray">{movieDetails.runtime} min</span>
                      )}
                    </div>

                    {/* Genres */}
                    {movieDetails.genres?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3.5">
                        {movieDetails.genres.map((g) => (
                          <span
                            key={g.id}
                            className="px-3 py-1 rounded-full bg-batflix-black/60 border border-white/10 text-xs font-medium text-gray-300"
                          >
                            {g.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Overview */}
                    <p className="text-sm md:text-base text-gray-300 leading-relaxed mt-4">
                      {movieDetails.overview || 'No description available.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TV: about the series */}
            {type === 'tv' && tvDetails && (
              <div className="bg-batflix-darkGray/70 backdrop-blur-md rounded-2xl border border-white/10 p-4 md:p-6 animate-fade-up" style={{ animationDelay: '60ms' }}>
                <div className="flex items-center gap-4 mb-5">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">About the series</h2>
                  <div className="h-px flex-1 bg-white/5" />
                  <button
                    onClick={handleMyListToggle}
                    className={`inline-flex items-center gap-2 h-9 px-4 rounded-full text-xs font-semibold border transition active:scale-95 ${
                      inList
                        ? 'bg-batflix-red/20 border-batflix-red/40 text-white hover:bg-batflix-red/30'
                        : 'bg-white/5 border-white/15 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {inList ? (
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                    {inList ? 'In My List' : 'My List'}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm md:text-base">
                  {tvDetails.vote_average > 0 && (
                    <span className="flex items-center gap-1.5 font-semibold">
                      <svg
                        className="w-4 h-4 md:w-[18px] md:h-[18px] text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {tvDetails.vote_average.toFixed(1)}
                    </span>
                  )}
                  {tvYear && <span className="text-green-500 font-semibold">{tvYear}</span>}
                  {tvDetails.number_of_seasons > 0 && (
                    <span className="text-batflix-lightGray">
                      {tvDetails.number_of_seasons} Season{tvDetails.number_of_seasons > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {tvDetails.genres?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3.5">
                    {tvDetails.genres.map((g) => (
                      <span
                        key={g.id}
                        className="px-3 py-1 rounded-full bg-batflix-black/60 border border-white/10 text-xs font-medium text-gray-300"
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-sm md:text-base text-gray-300 leading-relaxed mt-4">
                  {tvDetails.overview || 'No description available.'}
                </p>
              </div>
            )}

            {/* TV: episode switcher */}
            {type === 'tv' && totalSeasons > 0 && (
              <div className="bg-batflix-darkGray/70 backdrop-blur-md rounded-2xl border border-white/10 p-4 md:p-5 animate-fade-up" style={{ animationDelay: '120ms' }}>
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Episodes</h2>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Season</span>
                    <select
                      value={season}
                      onChange={(e) => handleSeasonChange(e.target.value)}
                      className="w-full bg-batflix-black text-white border border-white/10 rounded-full pl-4 pr-3 py-2.5 focus:outline-none focus:border-white/40 transition cursor-pointer"
                    >
                      {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                        <option key={s} value={s}>Season {s}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Episode</span>
                    <select
                      value={episode}
                      onChange={(e) => handleEpisodeChange(e.target.value)}
                      className="w-full bg-batflix-black text-white border border-white/10 rounded-full pl-4 pr-3 py-2.5 focus:outline-none focus:border-white/40 transition cursor-pointer"
                    >
                      {episodes.length > 0 ? (
                        episodes.map((ep) => (
                          <option key={ep.episode_number} value={ep.episode_number}>
                            Episode {ep.episode_number}: {ep.name}
                          </option>
                        ))
                      ) : (
                        <option value={episode}>Episode {episode}</option>
                      )}
                    </select>
                  </label>
                </div>

                {selectedEpisodeInfo && (
                  <div className="mt-4 bg-black/30 rounded-xl border border-white/5 p-4">
                    <h3 className="font-semibold text-sm mb-1">{selectedEpisodeInfo.name}</h3>
                    <p className="text-sm text-batflix-lightGray leading-relaxed">
                      {selectedEpisodeInfo.overview || 'No description available.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex flex-wrap items-center gap-3 pt-2 animate-fade-up" style={{ animationDelay: '180ms' }}>
              <Link
                href="/"
                className="group inline-flex items-center gap-2 h-11 px-5 rounded-full bg-white/5 border border-white/10 text-sm font-semibold text-gray-200 hover:bg-white/10 hover:border-white/25 transition active:scale-95"
              >
                <svg
                  className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
              <Link
                href="/my-list"
                className="group inline-flex items-center gap-2 h-11 px-5 rounded-full bg-batflix-darkGray/70 border border-white/10 text-sm font-semibold text-gray-200 hover:bg-white/10 hover:border-white/25 transition active:scale-95"
              >
                Go to My List
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
