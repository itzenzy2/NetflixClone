/**
 * Video Player Page
 *
 * Full-screen video player using VidKing embedded iframe.
 * Supports both movies and TV shows with season/episode parameters.
 */

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function WatchPage() {
  const router = useRouter();
  const { type, id } = router.query;
  const [iframeUrl, setIframeUrl] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (type && id) {
      let url = '';

      if (type === 'movie') {
        url = `https://www.vidking.net/embed/movie/${id}`;
      } else if (type === 'tv') {
        const season = router.query.season || '1';
        const episode = router.query.episode || '1';
        url = `https://www.vidking.net/embed/tv/${id}/${season}/${episode}`;
      }

      const params = new URLSearchParams({
        color: 'E50914',
        autoPlay: 'true',
      });

      setIframeUrl(`${url}?${params.toString()}`);
    }
  }, [type, id, router.query.season, router.query.episode]);

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

  if (!iframeUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="glass-panel rounded-3xl px-6 py-4 text-white">Loading player...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Watch - Netflix Clone</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="relative isolate min-h-screen overflow-hidden bg-black">
        <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-96 w-96 rounded-full bg-netflix-red/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[-8%] bottom-[-10%] h-[28rem] w-[28rem] rounded-full bg-white/5 blur-3xl" />

        <div className="fixed left-3 top-3 z-50 sm:left-4 sm:top-4">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-2 text-white shadow-xl shadow-black/30 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-black/75 sm:px-4"
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="text-sm font-semibold">Back</span>
          </button>
        </div>

        <div className="fixed right-3 top-3 z-50 sm:right-4 sm:top-4">
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-2 text-white shadow-xl shadow-black/30 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-black/75 sm:px-4"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        </div>

        <div
          id="video-player"
          className="flex min-h-screen w-full items-center justify-center p-0 md:p-8"
        >
          <div className="glass-panel h-[62svh] w-full md:h-[82vh] md:max-w-7xl md:rounded-[2rem]">
            <iframe
              src={iframeUrl}
              className="h-full w-full rounded-none md:rounded-[2rem]"
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title="Video Player"
            />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 md:px-8">
          <div className="glass-panel rounded-[1.5rem] p-4 sm:rounded-[2rem] sm:p-6">
            <h2 className="font-display mb-2 text-lg font-semibold sm:text-xl">Player Information</h2>
            <p className="mb-4 text-sm leading-6 text-white/55">
              You are watching {type === 'movie' ? 'a movie' : 'a TV show'}
              {type === 'tv' && router.query.season && router.query.episode && (
                <> - Season {router.query.season}, Episode {router.query.episode}</>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/" className="text-sm text-netflix-red transition hover:text-red-400 hover:underline">
                ← Back to Home
              </Link>
              <Link href="/my-list" className="text-sm text-netflix-red transition hover:text-red-400 hover:underline">
                Go to My List →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
