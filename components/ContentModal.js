/**
 * ContentModal Component
 * 
 * Detailed modal view for a movie or TV show.
 * Includes play button, add to list, season/episode selector for TV shows.
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { getBackdropUrl, getMovieDetails, getTVShowDetails, getSeasonDetails } from '../lib/tmdb';
import { useMyList } from '../context/MyListContext';

export default function ContentModal({ content, onClose }) {
  const router = useRouter();
  const { toggleItem, isItemInList } = useMyList();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inList, setInList] = useState(false);
  
  // For TV shows
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [seasonDetails, setSeasonDetails] = useState(null);

  const isTVShow = content.media_type === 'tv' || content.first_air_date;

  // Fetch detailed information
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        let detailsData;

        if (isTVShow) {
          detailsData = await getTVShowDetails(content.id);
        } else {
          detailsData = await getMovieDetails(content.id);
        }

        setDetails(detailsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching details:', error);
        setLoading(false);
      }
    };

    fetchDetails();
  }, [content.id, isTVShow]);

  // Fetch season details when season is selected (for TV shows)
  useEffect(() => {
    if (isTVShow && details) {
      const fetchSeasonDetails = async () => {
        try {
          const seasonData = await getSeasonDetails(content.id, selectedSeason);
          setSeasonDetails(seasonData);
        } catch (error) {
          console.error('Error fetching season details:', error);
        }
      };

      fetchSeasonDetails();
    }
  }, [selectedSeason, content.id, isTVShow, details]);

  // Check if item is in list
  useEffect(() => {
    setInList(isItemInList(content.id, content.media_type || (isTVShow ? 'tv' : 'movie')));
  }, [content.id, content.media_type, isTVShow, isItemInList]);

  const handlePlay = () => {
    const type = isTVShow ? 'tv' : 'movie';
    if (isTVShow) {
      router.push(`/watch/${type}/${content.id}?season=${selectedSeason}&episode=${selectedEpisode}`);
    } else {
      router.push(`/watch/${type}/${content.id}`);
    }
  };

  const handleMyListToggle = () => {
    const itemToToggle = {
      ...content,
      media_type: content.media_type || (isTVShow ? 'tv' : 'movie')
    };
    toggleItem(itemToToggle);
    setInList(!inList);
  };

  if (loading || !details) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const title = details.title || details.name;
  const backdropUrl = getBackdropUrl(details.backdrop_path);
  const releaseYear = details.release_date 
    ? new Date(details.release_date).getFullYear()
    : details.first_air_date 
    ? new Date(details.first_air_date).getFullYear()
    : 'N/A';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-netflix-darkGray rounded-lg max-w-5xl w-full my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with backdrop */}
        <div className="relative h-[40vh] md:h-[50vh]">
          <Image
            src={backdropUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-darkGray via-transparent to-transparent" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-black/50 rounded-full text-white hover:bg-black/70 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Action buttons */}
          <div className="absolute bottom-8 left-8 right-8 flex items-center space-x-3">
            <button
              onClick={handlePlay}
              className="flex items-center space-x-2 bg-white text-black px-8 py-3 rounded font-semibold hover:bg-white/80 transition"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Play</span>
            </button>

            <button
              onClick={handleMyListToggle}
              className="flex items-center justify-center w-12 h-12 bg-transparent border-2 border-gray-400 text-white rounded-full hover:border-white hover:bg-gray-700/50 transition"
              title={inList ? 'Remove from My List' : 'Add to My List'}
            >
              {inList ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Content details */}
        <div className="p-8 space-y-6">
          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
            {details.vote_average > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-yellow-400">⭐</span>
                <span className="font-semibold">{details.vote_average.toFixed(1)}</span>
              </div>
            )}
            <span className="text-green-500">{releaseYear}</span>
            {details.runtime && <span>{details.runtime} min</span>}
            {details.number_of_seasons && (
              <span>{details.number_of_seasons} Season{details.number_of_seasons > 1 ? 's' : ''}</span>
            )}
          </div>

          {/* Overview */}
          <p className="text-gray-300 text-sm md:text-base leading-relaxed">
            {details.overview}
          </p>

          {/* Genres */}
          {details.genres && details.genres.length > 0 && (
            <div>
              <span className="text-gray-400 text-sm">Genres: </span>
              <span className="text-white text-sm">
                {details.genres.map(g => g.name).join(', ')}
              </span>
            </div>
          )}

          {/* TV Show: Season & Episode Selector */}
          {isTVShow && details.number_of_seasons > 0 && (
            <div className="space-y-4 pt-4 border-t border-gray-700">
              <h3 className="text-xl font-semibold">Episodes</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Season Selector */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Season</label>
                  <select
                    value={selectedSeason}
                    onChange={(e) => {
                      setSelectedSeason(parseInt(e.target.value));
                      setSelectedEpisode(1); // Reset episode when season changes
                    }}
                    className="w-full bg-netflix-black text-white border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-white"
                  >
                    {Array.from({ length: details.number_of_seasons }, (_, i) => i + 1).map(season => (
                      <option key={season} value={season}>
                        Season {season}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Episode Selector */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Episode</label>
                  <select
                    value={selectedEpisode}
                    onChange={(e) => setSelectedEpisode(parseInt(e.target.value))}
                    className="w-full bg-netflix-black text-white border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-white"
                  >
                    {seasonDetails?.episodes?.map(episode => (
                      <option key={episode.episode_number} value={episode.episode_number}>
                        Episode {episode.episode_number}: {episode.name}
                      </option>
                    )) || (
                      <option value={1}>Episode 1</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Episode Details */}
              {seasonDetails?.episodes && (
                <div className="bg-black/30 rounded p-4">
                  <h4 className="font-semibold mb-2">
                    {seasonDetails.episodes[selectedEpisode - 1]?.name}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {seasonDetails.episodes[selectedEpisode - 1]?.overview || 'No description available.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Similar Content */}
          {details.similar?.results && details.similar.results.length > 0 && (
            <div className="pt-4 border-t border-gray-700">
              <h3 className="text-xl font-semibold mb-4">More Like This</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {details.similar.results.slice(0, 6).map(item => (
                  <div key={item.id} className="text-sm">
                    <div className="font-semibold">{item.title || item.name}</div>
                    <div className="text-gray-400 text-xs">
                      ⭐ {item.vote_average.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
