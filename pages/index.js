/**
 * Homepage
 * 
 * Main landing page of the Netflix clone.
 * Features a hero banner and multiple carousels of content from TMDb.
 * Displays the user's "My List" if it contains items.
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import HeroBanner from '../components/HeroBanner';
import CarouselRow from '../components/CarouselRow';
import ContentModal from '../components/ContentModal';
import { useMyList } from '../context/MyListContext';
import {
  getTrending,
  getPopularMovies,
  getPopularTVShows,
  getTopRatedMovies,
  getTopRatedTVShows,
  getMoviesByGenre,
  getTVShowsByGenre,
  GENRES
} from '../lib/tmdb';

export default function Home() {
  const { myList } = useMyList();
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

  // Fetch all content on component mount
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);

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

        // Set state for each carousel
        setTrending(trendingData.results || []);
        setPopularMovies(popularMoviesData.results || []);
        setPopularTVShows(popularTVData.results || []);
        setTopRatedMovies(topRatedMoviesData.results || []);
        setTopRatedTVShows(topRatedTVData.results || []);
        setActionMovies(actionData.results || []);
        setComedyMovies(comedyData.results || []);
        setHorrorMovies(horrorData.results || []);
        setDocumentaries(documentaryData.results || []);

        // Set a random trending item as hero content
        if (trendingData.results && trendingData.results.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(5, trendingData.results.length));
          setHeroContent(trendingData.results[randomIndex]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching content:', error);
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Handle clicking on a movie/show card
  const handleContentClick = (content) => {
    setSelectedContent(content);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setSelectedContent(null);
  };

  return (
    <>
      <Head>
        <title>Netflix Clone - Watch Movies & TV Shows</title>
        <meta name="description" content="Stream unlimited movies and TV shows" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative min-h-screen bg-netflix-black">
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
        <div className="relative pb-20 space-y-8 md:space-y-12 -mt-20 md:-mt-32 lg:-mt-40 z-10">
          {/* My List - Only show if user has items in their list */}
          {myList.length > 0 && (
            <CarouselRow
              title="My List"
              items={myList}
              onItemClick={handleContentClick}
            />
          )}

          {/* Trending Now */}
          <CarouselRow
            title="Trending Now"
            items={trending}
            onItemClick={handleContentClick}
          />

          {/* Popular Movies */}
          <CarouselRow
            title="Popular Movies"
            items={popularMovies}
            onItemClick={handleContentClick}
          />

          {/* Popular TV Shows */}
          <CarouselRow
            title="Popular TV Shows"
            items={popularTVShows}
            onItemClick={handleContentClick}
          />

          {/* Top Rated Movies */}
          <CarouselRow
            title="Top Rated Movies"
            items={topRatedMovies}
            onItemClick={handleContentClick}
          />

          {/* Action Movies */}
          <CarouselRow
            title="Action Movies"
            items={actionMovies}
            onItemClick={handleContentClick}
          />

          {/* Comedy Movies */}
          <CarouselRow
            title="Comedy Movies"
            items={comedyMovies}
            onItemClick={handleContentClick}
          />

          {/* Horror Movies */}
          <CarouselRow
            title="Horror Movies"
            items={horrorMovies}
            onItemClick={handleContentClick}
          />

          {/* Top Rated TV Shows */}
          <CarouselRow
            title="Top Rated TV Shows"
            items={topRatedTVShows}
            onItemClick={handleContentClick}
          />

          {/* Documentaries */}
          <CarouselRow
            title="Documentaries"
            items={documentaries}
            onItemClick={handleContentClick}
          />
        </div>

        {/* Content Details Modal */}
        {selectedContent && (
          <ContentModal
            content={selectedContent}
            onClose={handleCloseModal}
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
            <div className="text-white text-2xl">Loading...</div>
          </div>
        )}
      </div>
    </>
  );
}
