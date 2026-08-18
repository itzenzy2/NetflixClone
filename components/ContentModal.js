/**
 * ContentModal Component
 * 
 * Detailed modal view for a movie or TV show.
 * Includes play button, add to list, season/episode selector for TV shows.
 */

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { getBackdropUrl, getMovieDetails, getTVShowDetails, getSeasonDetails, getImageUrl } from '../lib/tmdb';
import { useMyList } from '../context/MyListContext';
import { saveWatchProgress } from '../lib/storage';


export default function ContentModal({ content, onClose, onSelectContent }) {
  const router = useRouter();
  const { toggleItem, isItemInList } = useMyList();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inList, setInList] = useState(false);
  
  // For TV shows
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [seasonDetails, setSeasonDetails] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  const isTVShow = content.media_type === 'tv' || content.first_air_date;

  // Fetch detailed information
  const loadDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const detailsData = isTVShow ? await getTVShowDetails(content.id) : await getMovieDetails(content.id);
      setDetails(detailsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching details:', error);
      setError('Could not load details for this title. Please try again.');
      setLoading(false);
    }
  }, [content.id, isTVShow]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

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
    const progress = {
      ...content,
      media_type: type,
    };

    if (isTVShow) {
      progress.season = selectedSeason;
      progress.episode = selectedEpisode;
      saveWatchProgress(progress);
      router.push(`/watch/${type}/${content.id}?season=${selectedSeason}&episode=${selectedEpisode}`);
    } else {
      saveWatchProgress(progress);
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

  // Open the dedicated title page for this content.
  const goToTitlePage = () => {
    const type = isTVShow ? 'tv' : 'movie';
    const url = `/title/${content.id}?type=${type}`;
    onClose();
    router.push(url);
  };

  // Close on Escape and lock page scroll while the modal is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showTrailer) {
          setShowTrailer(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, showTrailer]);

  if (error) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
        onClick={onClose}
      >
        <div
          className="glass bg-batflix-ink/90 rounded-3xl shadow-soft max-w-md w-full p-8 text-center animate-modal-in"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-white text-lg mb-6">{error}</p>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setDetails(null);
                loadDetails();
              }}
              className="flex-1 px-4 py-2 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition"
            >
              Retry
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !details) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md gap-4 animate-fade-in">
        <div className="spinner" role="status" aria-label="Loading" />
        <div className="text-white text-sm text-batflix-lightGray">Loading details...</div>
      </div>
    );
  }

  const title = details.title || details.name;
  const backdropUrl = getBackdropUrl(details.backdrop_path);
  const trailer = (details.videos?.results || []).find(
    (video) => video.type === 'Trailer' && video.site === 'YouTube'
  );
  const releaseYear = details.release_date && !isNaN(new Date(details.release_date).getFullYear())
    ? new Date(details.release_date).getFullYear()
    : details.first_air_date && !isNaN(new Date(details.first_air_date).getFullYear())
    ? new Date(details.first_air_date).getFullYear()
    : 'N/A';

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-black/90 backdrop-blur-md p-2 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-batflix-ink/95 backdrop-blur-2xl rounded-3xl max-w-5xl w-full my-auto overflow-hidden border border-white/10 ring-1 ring-white/5 shadow-soft animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with backdrop */}
        <div className="relative h-[38vh] min-h-[220px] md:h-[50vh]">
          <Image
            src={backdropUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-batflix-ink via-transparent to-transparent" />

          {/* Type badge */}
          <div className="absolute top-3 left-3 md:top-4 md:left-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-white/80">
            {isTVShow ? 'TV Series' : 'Movie'}
          </div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close details"
            className="absolute top-3 right-3 w-9 h-9 md:top-4 md:right-4 md:w-10 md:h-10 flex items-center justify-center bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-black/80 hover:rotate-90 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Action buttons */}
          <div className="absolute bottom-3 left-3 right-3 md:bottom-8 md:left-8 md:right-8 flex items-center space-x-2 md:space-x-3">
            <button
              onClick={handlePlay}
              className="flex items-center space-x-2 bg-white text-black h-11 md:h-12 px-5 sm:px-8 rounded-full font-semibold hover:bg-white/90 hover:shadow-glow-soft active:scale-95 transition-all duration-200 shadow-lg shadow-black/30 shrink-0"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span className="text-sm md:text-base whitespace-nowrap">Play</span>
            </button>

            {/* Trailer Button */}
            {trailer && (
              <button
                onClick={() => setShowTrailer(true)}
                className="glass flex items-center space-x-2 text-white h-11 md:h-12 px-4 sm:px-6 rounded-full font-semibold hover:bg-white/15 hover:border-white/25 active:scale-95 transition shrink-0"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span className="text-sm md:text-base whitespace-nowrap">Trailer</span>
              </button>
            )}

            <button
              onClick={handleMyListToggle}
              className="glass flex items-center justify-center w-11 h-11 md:w-12 md:h-12 text-white rounded-full hover:border-batflix-red/60 hover:bg-batflix-red/10 active:scale-90 transition-all duration-200 shrink-0"
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
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
          {/* Title + full details link */}
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
            <button
              onClick={goToTitlePage}
              className="shrink-0 mt-1.5 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-white transition active:scale-95"
            >
              Full details
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

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

          {/* Cast strip */}
          {details.credits?.cast && details.credits.cast.length > 0 && (
            <div className="pt-4 border-t border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Cast</h3>
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                {details.credits.cast.slice(0, 15).map((person) => (
                  <div key={person.id} className="flex flex-col items-center w-[72px] shrink-0 snap-start">
                    <div className="w-[68px] h-[68px] rounded-full overflow-hidden bg-batflix-darkGray ring-1 ring-white/10">
                      {person.profile_path ? (
                        <Image
                          src={getImageUrl(person.profile_path, 'w185')}
                          alt={person.name}
                          width={185}
                          height={185}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium text-white text-center mt-2 leading-tight line-clamp-2">
                      {person.name}
                    </span>
                    <span className="text-[0.65rem] text-gray-500 text-center mt-0.5 line-clamp-1 w-full">
                      {person.character}
                    </span>
                  </div>
                ))}
              </div>
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
                    className="w-full bg-batflix-black text-white border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-white/40 transition"
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
                    className="w-full bg-batflix-black text-white border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-white/40 transition"
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
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      const similarItem = {
                        ...item,
                        media_type: item.media_type || (item.first_air_date ? 'tv' : 'movie'),
                      };
                      if (onSelectContent) {
                        onSelectContent(similarItem);
                      } else {
                        router.push(`/watch/${similarItem.media_type}/${item.id}`);
                        onClose();
                      }
                    }}
                    className="bg-black/30 hover:bg-black/50 rounded-xl border border-white/5 hover:border-white/15 p-4 text-left transition group"
                  >
                    <div className="font-semibold group-hover:text-batflix-red transition">
                      {item.title || item.name}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      ⭐ {item.vote_average ? item.vote_average.toFixed(1) : '—'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trailer Overlay - sibling of the panel so its fixed positioning stays viewport-relative */}
      {showTrailer && trailer && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setShowTrailer(false)}
        >
          <div className="w-full max-w-3xl animate-modal-in" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-soft bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                title={`${title} Trailer`}
                className="w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-sm text-batflix-lightGray truncate">{title}</span>
              <button
                onClick={() => setShowTrailer(false)}
                className="shrink-0 px-6 py-2 bg-white/10 border border-white/20 text-white rounded-full font-semibold hover:bg-white/20 active:scale-95 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
