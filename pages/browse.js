/**
 * Browse Page
 *
 * Discover movies and TV shows by media type, genre, and sort order.
 * Filters are mirrored to the URL so views can be shared/bookmarked.
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import MovieCard from '../components/MovieCard';
import Footer from '../components/Footer';
import Reveal from '../components/Reveal';
import {
  getGenres,
  getMoviesByGenre,
  getTVShowsByGenre,
  getWatchProviders,
  getTrending,
  getImageUrl,
  getBackdropUrl,
} from '../lib/tmdb';

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Top Rated' },
  { value: 'release_date.desc', label: 'Newest First' },
  { value: 'original_title.asc', label: 'A–Z' },
];

const TV_SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Top Rated' },
  { value: 'first_air_date.desc', label: 'Newest First' },
  { value: 'name.asc', label: 'A–Z' },
];

// Countries supported by TMDb's watch-provider listings
const WATCH_REGIONS = [
  'US', 'GB', 'CA', 'AU', 'IN', 'DE', 'FR', 'ES', 'IT', 'BR',
  'MX', 'AR', 'JP', 'KR', 'NL', 'SE', 'PL', 'TR', 'PH', 'ZA',
];

// Only the major subscription services are offered as streaming filters.
// TMDb's provider feed also returns niche services and add-on tiers (JustWatch,
// fuboTV, MGM+, "Amazon Channel" bundles, storefronts like Apple TV Store) that
// clutter the row. Matched by name because provider IDs vary across regions.
const MAIN_STREAMING_SERVICES = [
  'netflix',
  'disney plus',
  'disney+',
  'amazon prime video',
  'prime video',
  'apple tv+',
  'apple tv',
  'hulu',
  'hbo max',
  'max',
  'paramount plus',
  'paramount+',
  'peacock',
];

// Normalize a provider name to a stable key for matching and deduping.
// Tiers of the same service (e.g. "Paramount Plus Premium" vs "Essential")
// collapse to the base service so it appears once in the row.
const providerKey = (name) => {
  const n = (name || '').toLowerCase().trim();
  if (n.startsWith('paramount plus') || n.startsWith('paramount+')) return 'paramount plus';
  return n;
};

const isMainStreamingService = (name) => {
  const key = providerKey(name);
  return key === 'paramount plus' || MAIN_STREAMING_SERVICES.includes(key);
};

// Short consumer-facing labels under each tile; TMDb's raw names
// ("Paramount Plus Premium", "Amazon Prime Video") are too long for chips.
const PROVIDER_LABELS = {
  'netflix': 'Netflix',
  'disney plus': 'Disney+',
  'disney+': 'Disney+',
  'amazon prime video': 'Prime Video',
  'prime video': 'Prime Video',
  'apple tv+': 'Apple TV+',
  'apple tv': 'Apple TV',
  'hulu': 'Hulu',
  'hbo max': 'Max',
  'max': 'Max',
  'paramount plus': 'Paramount+',
  'paramount+': 'Paramount+',
  'peacock': 'Peacock',
};

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1989 }, (_, i) => CURRENT_YEAR - i);

const RATING_OPTIONS = [
  { value: 0, label: 'Any' },
  { value: 5, label: '5+' },
  { value: 6, label: '6+' },
  { value: 7, label: '7+' },
  { value: 8, label: '8+' },
  { value: 9, label: '9+' },
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'tr', name: 'Turkish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'sv', name: 'Swedish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'ru', name: 'Russian' },
  { code: 'id', name: 'Indonesian' },
];

const selectClass =
  'w-full bg-batflix-black text-white border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-white/40 transition cursor-pointer';

export default function BrowsePage() {
  const router = useRouter();
  const query = router.query;

  // Filters (initialized from the URL so views can be shared)
  const mediaType = query.mediaType === 'tv' ? 'tv' : 'movie';
  const genreId = query.genre ? parseInt(query.genre, 10) : null;
  const sortBy = typeof query.sort === 'string' ? query.sort : 'popularity.desc';
  const providerId = query.provider ? parseInt(query.provider, 10) : null;
  const region = typeof query.region === 'string' && WATCH_REGIONS.includes(query.region)
    ? query.region
    : 'US';
  const yearFrom = query.yearFrom ? Math.min(Math.max(parseInt(query.yearFrom, 10) || 0, 1990), CURRENT_YEAR) : null;
  const yearTo = query.yearTo ? Math.min(Math.max(parseInt(query.yearTo, 10) || 0, 1990), CURRENT_YEAR) : null;
  const minRating = query.rating ? parseFloat(query.rating) : null;
  const language = typeof query.language === 'string' && query.language ? query.language : null;

  const [genres, setGenres] = useState([]);
  const [providers, setProviders] = useState([]);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Random trending title used for the page's cinematic backdrop hero
  const [heroContent, setHeroContent] = useState(null);

  const sortOptions = mediaType === 'tv' ? TV_SORT_OPTIONS : SORT_OPTIONS;

  // Keep the selected sort valid for the media type
  const validSortBy = sortOptions.some((o) => o.value === sortBy) ? sortBy : 'popularity.desc';

  // Mirrors the latest filters we have committed to the URL. router.query lags
  // behind router.replace, so rapid consecutive filter changes would otherwise
  // merge against a stale snapshot and silently drop earlier updates.
  const filtersRef = useRef(null);
  const snapshotFilters = () => {
    filtersRef.current = {
      mediaType,
      genre: genreId === null ? 'all' : genreId,
      sort: validSortBy,
      provider: providerId,
      region,
      yearFrom,
      yearTo,
      rating: minRating,
      language,
    };
  };
  if (filtersRef.current === null) snapshotFilters();

  // Resync when the URL changes from outside (browser back/forward, a shared link)
  const lastPathRef = useRef(router.asPath);
  useEffect(() => {
    if (lastPathRef.current !== router.asPath) {
      lastPathRef.current = router.asPath;
      snapshotFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath]);

  // Fetch the genre list for the current media type
  useEffect(() => {
    let cancelled = false;
    getGenres(mediaType)
      .then((data) => {
        if (!cancelled) setGenres(data.genres || []);
      })
      .catch((err) => console.error('Error fetching genres:', err));
    return () => {
      cancelled = true;
    };
  }, [mediaType]);

  // Pick a random trending title with a backdrop for the hero
  useEffect(() => {
    let cancelled = false;
    getTrending('all')
      .then((data) => {
        if (cancelled) return;
        const pool = (data.results || []).filter(
          (item) => (item.media_type === 'movie' || item.media_type === 'tv') && item.backdrop_path
        );
        if (pool.length > 0) {
          setHeroContent(pool[Math.floor(Math.random() * Math.min(10, pool.length))]);
        }
      })
      .catch((err) => console.error('Error fetching hero backdrop:', err));
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch the streaming providers for the current media type and region,
  // keeping only the main subscription services (deduped per provider)
  useEffect(() => {
    let cancelled = false;
    getWatchProviders(mediaType, region)
      .then((data) => {
        if (cancelled) return;
        const list = (data.results || [])
          .filter((p) => p.logo_path && isMainStreamingService(p.provider_name))
          .sort((a, b) => (a.display_priorities?.[region] ?? 99) - (b.display_priorities?.[region] ?? 99))
          .filter((p, i, arr) => arr.findIndex((x) => providerKey(x.provider_name) === providerKey(p.provider_name)) === i)
          .slice(0, 12);
        setProviders(list);
      })
      .catch((err) => console.error('Error fetching watch providers:', err));
    return () => {
      cancelled = true;
    };
  }, [mediaType, region]);

  // Discover options shared by the initial fetch and "Load More"
  const discoverOptions = useMemo(() => {
    const options = { sort_by: validSortBy };
    if (providerId) {
      options.with_watch_providers = providerId;
      options.watch_region = region;
    }
    const dateField = mediaType === 'tv' ? 'first_air_date' : 'primary_release_date';
    if (yearFrom) options[`${dateField}.gte`] = `${yearFrom}-01-01`;
    if (yearTo) options[`${dateField}.lte`] = `${yearTo}-12-31`;
    if (minRating) options['vote_average.gte'] = minRating;
    if (language) options.with_original_language = language;
    return options;
  }, [validSortBy, providerId, region, mediaType, yearFrom, yearTo, minRating, language]);

  // Fetch content whenever a filter changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPage(1);
    setItems([]);

    const fetchPage = mediaType === 'tv'
      ? getTVShowsByGenre(genreId, 1, discoverOptions)
      : getMoviesByGenre(genreId, 1, discoverOptions);

    fetchPage
      .then((data) => {
        if (cancelled) return;
        setItems(data.results || []);
        setTotalPages(data.total_pages || 1);
        setTotalResults(data.total_results || 0);
      })
      .catch((err) => {
        console.error('Browse fetch failed:', err);
        if (!cancelled) setError('Could not load content. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mediaType, genreId, discoverOptions]);

  // Load the next page and append
  const loadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);

    try {
      const next = page + 1;
      const data = mediaType === 'tv'
        ? await getTVShowsByGenre(genreId, next, discoverOptions)
        : await getMoviesByGenre(genreId, next, discoverOptions);
      const newResults = data.results || [];

      setItems((prev) => {
        const seen = new Set(prev.map((item) => `${item.id}-${item.media_type || mediaType}`));
        const unique = newResults.filter((item) => {
          const key = `${item.id}-${item.media_type || mediaType}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        return [...prev, ...unique];
      });
      setPage(next);
      setTotalPages(data.total_pages || 1);
      setTotalResults(data.total_results || 0);
    } catch (err) {
      console.error('Load more failed:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Mirror filters to the URL (shallow) so views can be shared.
  // Merges with the filters we have already committed (filtersRef), so rapid
  // consecutive changes compose correctly instead of reading a stale query.
  const updateFilters = (next) => {
    filtersRef.current = { ...filtersRef.current, ...next };
    const merged = { ...filtersRef.current };
    // Normalize: 'all' genre and null/empty values are dropped from the URL
    if (merged.genre === 'all') merged.genre = undefined;
    const params = {};
    Object.keys(merged).forEach((key) => {
      if (merged[key] !== undefined && merged[key] !== null && merged[key] !== '') {
        params[key] = merged[key];
      }
    });
    router.replace({ pathname: '/browse', query: params }, undefined, { shallow: true });
  };

  const toggleProvider = (id) => {
    updateFilters({
      provider: providerId === id ? null : id,
    });
  };

  const activeProvider = providers.find((p) => p.provider_id === providerId);
  const activeGenre = genreId || 'all';
  const activeGenreName = genres.find((g) => g.id === activeGenre)?.name;
  const activeFilterCount = [yearFrom, yearTo, minRating, language].filter(Boolean).length;

  return (
    <>
      <Head>
        <title>Browse - BatFlix</title>
        <meta name="description" content="Browse and discover movies and TV shows by genre" />
      </Head>

      <div className="relative min-h-screen bg-batflix-black">
        <Header />

        {/* Cinematic hero */}
        <div className="relative h-[44vh] min-h-[320px] max-h-[500px] w-full overflow-hidden bg-batflix-ink">
          {heroContent?.backdrop_path && (
            <Image
              src={getBackdropUrl(heroContent.backdrop_path)}
              alt=""
              fill
              priority
              className="object-cover animate-kenburns"
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-aurora opacity-60 pointer-events-none" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-batflix-black via-batflix-black/30 to-transparent" />
          <div className="absolute inset-0 [background:radial-gradient(120%_80%_at_18%_55%,transparent_45%,rgba(0,0,0,0.55)_100%)]" />

          <div className="relative h-full max-w-[1700px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 flex flex-col justify-end pb-8 md:pb-12">
            <div className="flex items-center gap-2.5 animate-fade-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-batflix-red opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-batflix-red" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.32em] text-white/80">Discover</span>
            </div>
            <h1
              className="text-4xl md:text-6xl font-extrabold tracking-tight mt-3 drop-shadow-xl animate-fade-up"
              style={{ animationDelay: '80ms' }}
            >
              Browse
            </h1>
            <p className="text-sm md:text-base text-gray-300 mt-2.5 animate-fade-up" style={{ animationDelay: '160ms' }}>
              {mediaType === 'tv' ? 'TV Shows' : 'Movies'}
              {activeGenreName && activeGenre !== 'all' ? ` · ${activeGenreName}` : ''}
              {activeProvider ? ` · ${activeProvider.provider_name}` : ''}
            </p>
          </div>
        </div>

        {/* Subtle brand glow for depth */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] bg-[radial-gradient(ellipse_at_top,rgba(229,9,20,0.07),transparent_65%)]"
          aria-hidden="true"
        />

        <main className="relative max-w-[1700px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 pb-20">
          {/* Filter toolbar: eyebrow + sort/region */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 md:pt-8 pb-8">
            <div className="flex items-center gap-2 animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-batflix-red" />
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-batflix-red text-white text-[0.65rem] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </div>

            {/* Sort + region toolbar */}
            <div className="flex flex-wrap items-center gap-3 animate-fade-up" style={{ animationDelay: '60ms' }}>
              <label className="glass flex items-center gap-3 rounded-full pl-4 pr-1.5 py-1.5 focus-within:border-white/40 transition">
                <span className="text-xs uppercase tracking-wider text-gray-500">Sort</span>
                <select
                  value={validSortBy}
                  onChange={(e) => updateFilters({ mediaType, genre: activeGenre, sort: e.target.value, provider: providerId, region })}
                  className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-batflix-darkGray">{opt.label}</option>
                  ))}
                </select>
              </label>
              <label className="glass flex items-center gap-3 rounded-full pl-4 pr-1.5 py-1.5 focus-within:border-white/40 transition">
                <span className="text-xs uppercase tracking-wider text-gray-500">Region</span>
                <select
                  value={region}
                  onChange={(e) => updateFilters({ mediaType, genre: activeGenre, sort: validSortBy, provider: null, region: e.target.value })}
                  className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
                >
                  {WATCH_REGIONS.map((code) => (
                    <option key={code} value={code} className="bg-batflix-darkGray">{code}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Media type segmented control */}
          <div className="mb-10 animate-fade-up" style={{ animationDelay: '100ms' }} role="tablist" aria-label="Content type">
            <div className="glass inline-flex rounded-full p-1 gap-1">
              {['movie', 'tv'].map((type) => (
                <button
                  key={type}
                  role="tab"
                  aria-selected={mediaType === type}
                  onClick={() => updateFilters({ mediaType: type, genre: 'all', sort: 'popularity.desc', provider: null, region })}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                    mediaType === type
                      ? 'bg-batflix-red text-white shadow-soft'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {type === 'movie' ? 'Movies' : 'TV Shows'}
                </button>
              ))}
            </div>
          </div>

          {/* Genre section */}
          <section className="mb-12 animate-fade-up" style={{ animationDelay: '140ms' }}>
            <div className="flex items-center gap-4 mb-5">
              <span className="w-2 h-2 rounded-full bg-batflix-red shrink-0" />
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Genre</h2>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => updateFilters({ mediaType, genre: 'all', sort: validSortBy, provider: providerId, region })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition active:scale-95 ${
                  activeGenre === 'all'
                    ? 'bg-batflix-red text-white shadow-soft'
                    : 'bg-batflix-darkGray text-gray-300 hover:bg-white/10'
                }`}
              >
                All
              </button>
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => updateFilters({ mediaType, genre: genre.id, sort: validSortBy, provider: providerId, region })}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    activeGenre === genre.id
                      ? 'bg-batflix-red text-white shadow-soft'
                      : 'bg-batflix-darkGray text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </section>

          {/* Streaming services section */}
          <section className="mb-12 animate-fade-up" style={{ animationDelay: '180ms' }}>
            <div className="flex items-center gap-4 mb-5">
              <span className="w-2 h-2 rounded-full bg-batflix-red shrink-0" />
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Streaming service</h2>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <div className="flex flex-wrap items-start gap-4 sm:gap-5">
              <button
                onClick={() => toggleProvider(null)}
                className={`mt-1 px-4 py-2 rounded-full text-sm font-medium transition border ${
                  !providerId
                    ? 'bg-batflix-red border-batflix-red text-white shadow-soft'
                    : 'bg-batflix-darkGray border-white/10 text-gray-300 hover:border-white/40'
                }`}
              >
                All services
              </button>
              {providers.map((p) => (
                <div key={p.provider_id} className="group flex flex-col items-center gap-1.5">
                  <button
                    title={p.provider_name}
                    aria-label={p.provider_name}
                    aria-pressed={providerId === p.provider_id}
                    onClick={() => toggleProvider(p.provider_id)}
                    className={`flex items-center justify-center w-12 h-12 rounded-xl overflow-hidden bg-white border transition-all duration-300 ${
                      providerId === p.provider_id
                        ? 'ring-2 ring-batflix-red border-transparent scale-105 shadow-[0_0_28px_rgba(229,9,20,0.45)]'
                        : 'border-black/20 hover:border-white/40 hover:scale-105 hover:shadow-[0_10px_32px_rgba(0,0,0,0.65)]'
                    }`}
                  >
                    <Image
                      src={getImageUrl(p.logo_path, 'w185')}
                      alt={p.provider_name}
                      width={185}
                      height={185}
                      className="w-[78%] h-[78%] object-contain"
                    />
                  </button>
                  <span className="text-[0.65rem] font-medium text-gray-400 group-hover:text-gray-200 transition-colors leading-none truncate max-w-[76px] text-center">
                    {PROVIDER_LABELS[providerKey(p.provider_name)] || p.provider_name}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Advanced filters */}
          <section className="mb-12 animate-fade-up" style={{ animationDelay: '220ms' }}>
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setShowAdvanced((v) => !v)}
                aria-expanded={showAdvanced}
                className="flex items-center gap-2.5 text-sm font-semibold text-gray-300 hover:text-white transition group"
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Advanced filters
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-batflix-red text-white text-xs font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => updateFilters({ yearFrom: null, yearTo: null, rating: null, language: null })}
                  className="text-xs font-medium text-gray-500 hover:text-white transition"
                >
                  Clear all
                </button>
              )}
            </div>

            {showAdvanced && (
              <div
                className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 p-4 md:p-5 rounded-2xl bg-batflix-darkGray/60 border border-white/10 animate-fade-up"
                style={{ animationDelay: '60ms' }}
              >
                <label className="block">
                  <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Year from</span>
                  <select
                    value={yearFrom || ''}
                    onChange={(e) => updateFilters({ yearFrom: e.target.value ? parseInt(e.target.value, 10) : null })}
                    className={selectClass}
                  >
                    <option value="">Any</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Year to</span>
                  <select
                    value={yearTo || ''}
                    onChange={(e) => updateFilters({ yearTo: e.target.value ? parseInt(e.target.value, 10) : null })}
                    className={selectClass}
                  >
                    <option value="">Any</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Min rating</span>
                  <select
                    value={minRating || ''}
                    onChange={(e) => updateFilters({ rating: e.target.value ? parseFloat(e.target.value) : null })}
                    className={selectClass}
                  >
                    {RATING_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Language</span>
                  <select
                    value={language || ''}
                    onChange={(e) => updateFilters({ language: e.target.value || null })}
                    className={selectClass}
                  >
                    <option value="">Any</option>
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </section>

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center gap-4 py-24" role="status">
              <div className="spinner" />
              <div className="text-batflix-lightGray text-sm">Loading titles...</div>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-white text-xl mb-6">{error}</p>
              <button
                onClick={() => router.reload()}
                className="px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-200 active:scale-95 transition"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Results grid */}
          {!loading && !error && (
            <>
              {items.length === 0 ? (
                <div className="text-center py-24">
                  <h2 className="text-2xl font-semibold mb-2">Nothing here</h2>
                  <p className="text-gray-400">Try adjusting the filters or a different genre.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline justify-between gap-4 mb-6">
                    <h2 className="text-xl font-bold tracking-tight">Results</h2>
                    <span className="px-3 py-1 rounded-full bg-batflix-darkGray border border-white/10 text-xs font-medium text-gray-400">
                      {items.length}{totalResults > items.length ? ` of ${totalResults}` : ''} titles
                    </span>
                  </div>
                  <Reveal>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                      {items.map((item) => (
                        <MovieCard
                          key={`${item.id}-${item.media_type || mediaType}`}
                          item={item}
                        />
                      ))}
                    </div>
                  </Reveal>

                  {page < totalPages && (
                    <div className="flex justify-center mt-12">
                      <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="px-8 py-3 bg-batflix-darkGray hover:bg-white/10 text-white rounded-full font-semibold transition disabled:opacity-50 border border-white/10 active:scale-95"
                      >
                        {loadingMore ? 'Loading...' : 'Load More'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
