/**
 * Search Page
 *
 * Lets users search for movies and TV shows by name using TMDb's multi-search.
 * Results update live as you type (debounced) and the query is mirrored to the
 * URL so results can be shared or bookmarked.
 */

import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import MovieCard from '../components/MovieCard';
import Footer from '../components/Footer';
import Reveal from '../components/Reveal';
import { searchMulti } from '../lib/tmdb';

// Small debounce hook
function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default function SearchPage() {
  const router = useRouter();
  const query = router.query.q || '';
  const [input, setInput] = useState(typeof query === 'string' ? query : '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef(null);
  const debouncedQuery = useDebouncedValue(input, 400);

  // Keep the input in sync with the URL (e.g. browser back/forward)
  useEffect(() => {
    if (typeof query === 'string' && query !== input) {
      setInput(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Mirror the query to the URL so it can be shared, and drop the param when cleared
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed && trimmed !== query) {
      router.replace(`/search?q=${encodeURIComponent(trimmed)}`, undefined, { shallow: true });
    } else if (!trimmed && query) {
      router.replace('/search', undefined, { shallow: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  // Fetch results whenever the debounced query settles
  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    searchMulti(trimmed)
      .then((data) => {
        if (cancelled) return;
        // Only movies and TV shows (multi-search also returns people)
        const filtered = (data.results || []).filter(
          (item) => item.media_type === 'movie' || item.media_type === 'tv'
        );
        setResults(filtered);
        setHasSearched(true);
      })
      .catch((err) => {
        console.error('Search failed:', err);
        if (!cancelled) {
          setError('Search failed. Please check your connection and try again.');
          setResults([]);
          setHasSearched(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const trimmedQuery = debouncedQuery.trim();

  return (
    <>
      <Head>
        <title>{trimmedQuery ? `Search: ${trimmedQuery} - BatFlix` : 'Search - BatFlix'}</title>
        <meta name="description" content="Search movies and TV shows" />
      </Head>

      <div className="min-h-screen bg-batflix-black">
        <Header />

        <main className="max-w-[1700px] mx-auto pt-24 md:pt-28 px-4 md:px-8 lg:px-12 xl:px-16 pb-20">
          {/* Search Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              inputRef.current?.blur();
            }}
            className="max-w-3xl mb-8"
            role="search"
          >
            <label htmlFor="search-input" className="block text-sm text-gray-400 mb-2">
              Search movies & TV shows
            </label>
            <div className="relative">
              <svg
                className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                id="search-input"
                ref={inputRef}
                type="search"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Try 'Spider-Man' or 'Breaking Bad'..."
                autoFocus
                className="w-full bg-batflix-darkGray border border-white/10 rounded-full pl-12 pr-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/10 transition shadow-soft"
              />
              {input && (
                <button
                  type="button"
                  onClick={() => setInput('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-gray-600 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </form>

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center gap-3 text-batflix-lightGray mb-6" role="status">
              <div className="spinner !w-5 !h-5 !border-t-batflix-red" />
              <span className="text-sm">Searching...</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <p className="text-red-400 mb-6">{error}</p>
          )}

          {/* Initial state */}
          {!trimmedQuery && !loading && (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold mb-2">Find something to watch</h2>
              <p className="text-gray-400 max-w-md mx-auto">
                Type a title above to search across movies and TV shows.
              </p>
            </div>
          )}

          {/* Results */}
          {trimmedQuery && !loading && hasSearched && results.length === 0 && (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold mb-2">No results for &ldquo;{trimmedQuery}&rdquo;</h2>
              <p className="text-gray-400">Try a different title or check the spelling.</p>
            </div>
          )}

          {results.length > 0 && (
            <>
              <p className="text-gray-400 mb-6">
                {results.length} result{results.length === 1 ? '' : 's'} for &ldquo;{trimmedQuery}&rdquo;
              </p>
              <Reveal>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                  {results.map((item) => (
                    <MovieCard
                      key={`${item.id}-${item.media_type}`}
                      item={item}
                    />
                  ))}
                </div>
              </Reveal>
            </>
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
