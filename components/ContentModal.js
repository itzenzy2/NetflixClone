/**
 * ContentModal Component
 *
 * Detailed modal view for a movie or TV show.
 * Includes play button, add to list, season/episode selector for TV shows.
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { getBackdropUrl, getPosterUrl, getMovieDetails, getTVShowDetails, getSeasonDetails } from '../lib/tmdb';
import { useMyList } from '../context/MyListContext';

export default function ContentModal({ content, onClose }) {
  const router = useRouter();
  const { toggleItem, isItemInList } = useMyList();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inList, setInList] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [seasonDetails, setSeasonDetails] = useState(null);

  const isTVShow = content.media_type === 'tv' || content.first_air_date;

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const detailsData = isTVShow ? await getTVShowDetails(content.id) : await getMovieDetails(content.id);
        setDetails(detailsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching details:', error);
        setLoading(false);
      }
    };

    fetchDetails();
  }, [content.id, isTVShow]);

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl">
        <div className="glass-panel rounded-3xl px-6 py-4 text-white">
          Loading...
        </div>
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
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-2 backdrop-blur-xl sm:p-3 md:p-6"
      onClick={onClose}
    >
      <div
        className="glass-panel relative my-4 w-full max-w-6xl overflow-hidden rounded-[1.5rem] sm:my-6 sm:rounded-[2rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-[34vh] min-h-[260px] sm:h-[38vh] sm:min-h-[300px] md:h-[52vh] md:min-h-[320px]">
          <Image
            src={backdropUrl}
            alt={title}
            fill
            className="object-cover object-center"
            sizes="(max-width: 640px) 100vw, 1200px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(229,9,20,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%)]" />

          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/80 backdrop-blur-xl sm:left-6 sm:top-6">
            Details
          </div>

          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-black/65 sm:right-4 sm:top-4 sm:h-11 sm:w-11"
          >
            <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="absolute bottom-4 left-3 right-3 flex flex-col gap-3 sm:left-4 sm:right-4 sm:flex-row sm:flex-wrap sm:items-center md:bottom-8 md:left-8 md:right-8">
            <button
              onClick={handlePlay}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-black shadow-xl shadow-black/30 transition duration-300 hover:-translate-y-0.5 hover:bg-white/90 sm:w-auto sm:px-7"
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Play</span>
            </button>

            <button
              onClick={handleMyListToggle}
              className="inline-flex h-12 w-12 items-center justify-center self-start rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/15 sm:self-auto"
              title={inList ? 'Remove from My List' : 'Add to My List'}
            >
              {inList ? (
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6 p-4 sm:space-y-8 sm:p-5 md:p-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-white/45">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{isTVShow ? 'Series' : 'Film'}</span>
              {details.vote_average > 0 && <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">★ {details.vote_average.toFixed(1)}</span>}
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{releaseYear}</span>
              {details.runtime && <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{details.runtime} min</span>}
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-semibold sm:text-3xl md:text-5xl">{title}</h2>
              <p className="max-w-4xl text-sm text-white/50 sm:text-base">
                {isTVShow ? 'Stream the series, choose a season and episode, and jump back into the story instantly.' : 'Watch the movie with a clean player layout and a faster path back to your list.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {details.vote_average > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Rating</p>
                <div className="mt-1 flex items-center gap-2 text-white">
                  <span className="text-yellow-400">⭐</span>
                  <span className="font-semibold">{details.vote_average.toFixed(1)}</span>
                </div>
              </div>
            )}
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Year</p>
              <p className="mt-1 text-white/85">{releaseYear}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Type</p>
              <p className="mt-1 text-white/85">{isTVShow ? 'TV Series' : 'Movie'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Length</p>
              <p className="mt-1 text-white/85">
                {details.runtime
                  ? `${details.runtime} min`
                  : details.number_of_seasons
                    ? `${details.number_of_seasons} season${details.number_of_seasons > 1 ? 's' : ''}`
                    : '—'}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/25 p-4 sm:p-5">
            <p className="text-sm leading-7 text-white/75 md:text-base">
              {details.overview}
            </p>
          </div>

          {details.genres && details.genres.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-white/45">Genres:</span>
              {details.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          {isTVShow && details.number_of_seasons > 0 && (
            <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-5">
              <div className="flex items-end justify-between gap-3">
                <h3 className="text-xl font-semibold">Episodes</h3>
                <span className="text-xs uppercase tracking-[0.3em] text-white/35">Choose your jump-in point</span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-white/45">Season</label>
                  <select
                    value={selectedSeason}
                    onChange={(e) => {
                      setSelectedSeason(parseInt(e.target.value));
                      setSelectedEpisode(1);
                    }}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10"
                  >
                    {Array.from({ length: details.number_of_seasons }, (_, i) => i + 1).map(season => (
                      <option key={season} value={season}>
                        Season {season}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/45">Episode</label>
                  <select
                    value={selectedEpisode}
                    onChange={(e) => setSelectedEpisode(parseInt(e.target.value))}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10"
                  >
                    {seasonDetails?.episodes?.map(episode => (
                      <option key={episode.episode_number} value={episode.episode_number}>
                        Episode {episode.episode_number}: {episode.name}
                      </option>
                    )) || <option value={1}>Episode 1</option>}
                  </select>
                </div>
              </div>

              {seasonDetails?.episodes && (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <h4 className="mb-2 font-semibold">{seasonDetails.episodes[selectedEpisode - 1]?.name}</h4>
                  <p className="text-sm text-white/55">
                    {seasonDetails.episodes[selectedEpisode - 1]?.overview || 'No description available.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {details.similar?.results && details.similar.results.length > 0 && (
            <div className="pt-2">
              <h3 className="mb-4 text-xl font-semibold">More Like This</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {details.similar.results.slice(0, 6).map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      const targetType = item.media_type === 'tv' || item.first_air_date ? 'tv' : 'movie';
                      router.push(`/watch/${targetType}/${item.id}`);
                      onClose();
                    }}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left transition duration-300 hover:-translate-y-1 hover:bg-white/10"
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      <Image
                        src={getPosterUrl(item.poster_path || item.backdrop_path)}
                        alt={item.title || item.name || 'Related title'}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                    </div>
                    <div className="p-4">
                      <div className="font-semibold text-white line-clamp-2">{item.title || item.name}</div>
                      <div className="mt-1 text-xs text-white/50">★ {item.vote_average.toFixed(1)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
