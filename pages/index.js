/**
 * Homepage
 * 
 * Main landing page of BatFlix.
 * Features a hero banner and multiple carousels of content from TMDb.
 * Displays the user's "My List" if it contains items.
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import HeroBanner from '../components/HeroBanner';
import CarouselRow from '../components/CarouselRow';
import ContentModal from '../components/ContentModal';
import Footer from '../components/Footer';
import { useMyList } from '../context/MyListContext';
import { getContinueWatching, removeWatchProgress } from '../lib/storage';
import {
  getTrending,
  getPopularMovies,
  getPopularTVShows,
  getTopRatedMovies,
  getTopRatedTVShows,
  getMoviesByGenre,
  getSimilar,
  GENRES
} from '../lib/tmdb';

export default function Home() {
  const router = useRouter();
  const { myList } = useMyList();
  const [continueWatching, setContinueWatching] = useState([]);
  const [heroContent, setHeroContent] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  
  // Content state for each carousel
  const [trending, setTrending] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [topRatedTVShows, setTopRatedTVShows] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [comedyMovies, setComedyMovies] = useState([]);
  const [horrorMovies, setHorrorMovies] = useState([]);
  const [documentaries, setDocumentaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Client-side recommendations built from watch history + My List
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationSource, setRecommendationSource] = useState(null);

  // Fetch all content on component mount
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all content in parallel for better performance
        const [
          trendingData,
          popularMoviesData,
          popularTVData,
          topRatedMoviesData,
          topRatedTVData,
          actionData,
          comedyData,
          horrorData,
          documentaryData,
        ] = await Promise.all([
          getTrending('all'),
          getPopularMovies(),
          getPopularTVShows(),
          getTopRatedMovies(),
          getTopRatedTVShows(),
          getMoviesByGenre(GENRES.ACTION),
          getMoviesByGenre(GENRES.COMEDY),
          getMoviesByGenre(GENRES.HORROR),
          getMoviesByGenre(GENRES.DOCUMENTARY),
        ]);

        // Only keep movies and TV shows (trending 'all' also includes people)
        const movieTvResults = (trendingData.results || []).filter(
          (item) => item.media_type === 'movie' || item.media_type === 'tv'
        );

        // Set state for each carousel
        setTrending(movieTvResults);
        setPopularMovies(popularMoviesData.results || []);
        setPopularTVShows(popularTVData.results || []);
        setTopRatedMovies(topRatedMoviesData.results || []);
        setTopRatedTVShows(topRatedTVData.results || []);
        setActionMovies(actionData.results || []);
        setComedyMovies(comedyData.results || []);
        setHorrorMovies(horrorData.results || []);
        setDocumentaries(documentaryData.results || []);

        // Set a random trending item as hero content
        if (movieTvResults.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(8, movieTvResults.length));
          setHeroContent(movieTvResults[randomIndex]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching content:', error);
        setError('Something went wrong while loading content. Please try again.');
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Load Continue Watching from localStorage on mount
  useEffect(() => {
    setContinueWatching(getContinueWatching());
  }, []);

  // Build "Because you watched X" recommendations from watch history + My List
  useEffect(() => {
    const sources = [...continueWatching, ...myList];
    if (sources.length === 0) {
      setRecommendations([]);
      setRecommendationSource(null);
      return;
    }

    let cancelled = false;

    const build = async () => {
      const seen = new Set();
      const pool = [];
      for (const source of sources.slice(0, 3)) {
        const type = source.media_type === 'tv' ? 'tv' : 'movie';
        try {
          const data = await getSimilar(type, source.id);
          for (const item of data.results || []) {
            const key = `${type}-${item.id}`;
            if (seen.has(key)) continue;
            seen.add(key);
            pool.push({ ...item, media_type: type });
          }
        } catch (err) {
          // skip sources that fail; the rest still build a row
        }
      }
      if (!cancelled) {
        const first = sources[0];
        setRecommendationSource(first.title || first.name || 'your history');
        setRecommendations(pool.slice(0, 20));
      }
    };

    build();
    return () => {
      cancelled = true;
    };
  }, [continueWatching, myList]);

  // Resume playback for a Continue Watching item
  const handleResume = (item) => {
    const type = item.media_type === 'tv' ? 'tv' : 'movie';
    const query = type === 'tv' ? `?season=${item.season || 1}&episode=${item.episode || 1}` : '';
    router.push(`/watch/${type}/${item.id}${query}`);
  };

  // Remove an item from Continue Watching
  const handleRemoveContinue = (item) => {
    setContinueWatching(removeWatchProgress(item.id, item.media_type));
  };

  // Handle clicking on a movie/show card -> open the dedicated title page
  const handleCardClick = (content) => {
    const type = content.media_type || (content.first_air_date ? 'tv' : 'movie');
    router.push(`/title/${content.id}?type=${type}`);
  };

  // Handle clicking on a movie/show card -> open the quick details modal (hero)
  const handleContentClick = (content) => {
    // Normalize the media type so My List lookups work for items without it
    setSelectedContent({
      ...content,
      media_type: content.media_type || (content.first_air_date ? 'tv' : 'movie'),
    });
  };

  // Surprise Me: pick a random title from everything already loaded
  const handleSurprise = () => {
    const pool = [
      ...trending,
      ...popularMovies,
      ...popularTVShows,
      ...topRatedMovies,
      ...topRatedTVShows,
      ...actionMovies,
      ...comedyMovies,
      ...horrorMovies,
      ...documentaries,
    ].filter((item) => item && item.id);
    if (pool.length === 0) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const type = pick.media_type || (pick.first_air_date ? 'tv' : 'movie');
    router.push(`/title/${pick.id}?type=${type}`);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setSelectedContent(null);
  };

  return (
    <>
      <Head>
        <title>BatFlix - Watch Movies & TV Shows</title>
        <meta name="description" content="Stream unlimited movies and TV shows" />
      </Head>

      <div className="relative min-h-screen bg-batflix-black">
        {/* Header */}
        <Header />

        {/* Hero Banner */}
        {heroContent && (
          <HeroBanner
            content={heroContent}
            onInfoClick={handleContentClick}
          />
        )}

        {/* Content Rows */}
        <div className="relative max-w-[1700px] mx-auto pb-20 space-y-8 md:space-y-12 -mt-8 md:-mt-14 lg:-mt-20 z-10">
          {/* Surprise Me */}
          <div className="px-4 md:px-8 lg:px-16">
            <button
              onClick={handleSurprise}
              className="flex items-center gap-2 h-11 px-5 rounded-full bg-batflix-darkGray border border-white/10 text-sm font-semibold text-gray-200 hover:bg-white/10 hover:border-white/30 active:scale-95 transition"
              title="Open a random title"
            >
              <svg className="w-4 h-4 text-batflix-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.5 12a7.5 7.5 0 0115 0m-15 0a7.5 7.5 0 0015 0M12 4.5v3m0 9v3M4.5 12h3m9 0h3"
                />
              </svg>
              <span className="whitespace-nowrap">Surprise Me</span>
            </button>
          </div>

          {/* Continue Watching - Only show if the user has started watching something */}
          {continueWatching.length > 0 && (
            <CarouselRow
              title="Continue Watching"
              items={continueWatching}
              onItemClick={handleResume}
              onRemoveItem={handleRemoveContinue}
            />
          )}

          {/* My List - Only show if user has items in their list */}
          {myList.length > 0 && (
            <CarouselRow
              title="My List"
              items={myList}
              onItemClick={handleCardClick}
            />
          )}

          {/* Because you watched... (client-side recommendations) */}
          {recommendations.length > 0 && (
            <CarouselRow
              title={`Because you watched ${recommendationSource}`}
              items={recommendations}
              onItemClick={handleCardClick}
            />
          )}

          {/* Trending Now */}
          <CarouselRow
            title="Trending Now"
            items={trending}
            onItemClick={handleCardClick}
          />

          {/* Popular Movies */}
          <CarouselRow
            title="Popular Movies"
            items={popularMovies}
            onItemClick={handleCardClick}
          />

          {/* Popular TV Shows */}
          <CarouselRow
            title="Popular TV Shows"
            items={popularTVShows}
            onItemClick={handleCardClick}
          />

          {/* Top Rated Movies */}
          <CarouselRow
            title="Top Rated Movies"
            items={topRatedMovies}
            onItemClick={handleCardClick}
          />

          {/* Action Movies */}
          <CarouselRow
            title="Action Movies"
            items={actionMovies}
            onItemClick={handleCardClick}
          />

          {/* Comedy Movies */}
          <CarouselRow
            title="Comedy Movies"
            items={comedyMovies}
            onItemClick={handleCardClick}
          />

          {/* Horror Movies */}
          <CarouselRow
            title="Horror Movies"
            items={horrorMovies}
            onItemClick={handleCardClick}
          />

          {/* Top Rated TV Shows */}
          <CarouselRow
            title="Top Rated TV Shows"
            items={topRatedTVShows}
            onItemClick={handleCardClick}
          />

          {/* Documentaries */}
          <CarouselRow
            title="Documentaries"
            items={documentaries}
            onItemClick={handleCardClick}
          />
        </div>

        {/* Footer */}
        <Footer />

        {/* Content Details Modal */}
        {selectedContent && (
          <ContentModal
            content={selectedContent}
            onClose={handleCloseModal}
            onSelectContent={handleContentClick}
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black">
            <div className="spinner" role="status" aria-label="Loading" />
            <div className="text-batflix-lightGray text-sm">Loading your feed...</div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-6 text-center">
            <p className="text-white text-xl mb-6 max-w-md">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-200 active:scale-95 transition"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </>
  );
}
