/**
 * Video Player Page
 * 
 * Full-screen video player using VidKing embedded iframe.
 * Supports both movies and TV shows with season/episode parameters.
 * 
 * Routes:
 * - /watch/movie/[id] for movies
 * - /watch/tv/[id]?season=1&episode=1 for TV shows
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
      // Build the VidKing embed URL
      let url = '';

      if (type === 'movie') {
        // Movie URL: https://www.vidking.net/embed/movie/{tmdbId}
        url = `https://www.vidking.net/embed/movie/${id}`;
      } else if (type === 'tv') {
        // TV Show URL: https://www.vidking.net/embed/tv/{tmdbId}/{season}/{episode}
        const season = router.query.season || '1';
        const episode = router.query.episode || '1';
        url = `https://www.vidking.net/embed/tv/${id}/${season}/${episode}`;
      }

      // Add customization parameters
      const params = new URLSearchParams({
        color: 'E50914', // Netflix red
        autoPlay: 'true',
      });

      setIframeUrl(`${url}?${params.toString()}`);
    }
  }, [type, id, router.query.season, router.query.episode]);

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
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white text-xl">Loading player...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Watch - Netflix Clone</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="relative min-h-screen bg-black">
        {/* Back button - Fixed position */}
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={handleGoBack}
            className="flex items-center space-x-2 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full transition backdrop-blur-sm"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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

        {/* Fullscreen toggle button */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={toggleFullscreen}
            className="flex items-center space-x-2 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full transition backdrop-blur-sm"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
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

        {/* Video Player Container */}
        <div
          id="video-player"
          className="flex items-center justify-center min-h-screen w-full p-0 md:p-8"
        >
          <div className="w-full h-screen md:h-[80vh] md:max-w-7xl">
            <iframe
              src={iframeUrl}
              className="w-full h-full rounded-none md:rounded-lg"
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title="Video Player"
            />
          </div>
        </div>

        {/* Info section below player */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-netflix-darkGray rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Player Information</h2>
            <p className="text-gray-400 text-sm mb-4">
              You are watching {type === 'movie' ? 'a movie' : 'a TV show'}
              {type === 'tv' && router.query.season && router.query.episode && (
                <> - Season {router.query.season}, Episode {router.query.episode}</>
              )}
            </p>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-netflix-red hover:underline text-sm"
              >
                ← Back to Home
              </Link>
              <Link
                href="/my-list"
                className="text-netflix-red hover:underline text-sm"
              >
                Go to My List →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
