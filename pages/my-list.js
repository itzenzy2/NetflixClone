/**
 * My List Page
 *
 * The user's library, organized into three buckets: the main watchlist,
 * "Planning to Watch", and "Watched". Matches the homepage's cinematic hero,
 * glass controls, and card grid so every page shares one visual language.
 */

import { useState, useMemo } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../components/Header';
import MovieCard from '../components/MovieCard';
import Footer from '../components/Footer';
import Reveal from '../components/Reveal';
import { useMyList } from '../context/MyListContext';
import { getBackdropUrl } from '../lib/tmdb';

// Status tabs for filtering the library
const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'list', label: 'Watchlist' },
  { key: 'planning', label: 'Planning to Watch' },
  { key: 'watched', label: 'Watched' },
];

// Options shown in each card's status control
const STATUS_OPTIONS = [
  { key: 'list', label: 'My List' },
  { key: 'planning', label: 'Planning to Watch' },
  { key: 'watched', label: 'Watched' },
];

const normalizeType = (item) => item.media_type || (item.first_air_date ? 'tv' : 'movie');

export default function MyListPage() {
  const { myList, clearList, removeItem, changeItemStatus, isLoaded } = useMyList();
  const [activeStatus, setActiveStatus] = useState('all');
  const [sortBy, setSortBy] = useState('added');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filter to the active status tab, then sort a copy
  const sortedList = useMemo(() => {
    const filtered = myList.filter(
      (item) => activeStatus === 'all' || (item.status || 'list') === activeStatus
    );
    const copy = [...filtered];
    if (sortBy === 'rating') {
      copy.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    } else if (sortBy === 'title') {
      copy.sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || ''));
    } else {
      copy.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
    }
    return copy;
  }, [myList, activeStatus, sortBy]);

  const counts = useMemo(
    () => ({
      total: myList.length,
      list: myList.filter((i) => (i.status || 'list') === 'list').length,
      planning: myList.filter((i) => i.status === 'planning').length,
      watched: myList.filter((i) => i.status === 'watched').length,
    }),
    [myList]
  );

  // Cinematic hero backdrop: prefer the first item that has one
  const heroItem = myList.find((i) => i.backdrop_path) || myList[0] || null;
  const heroBackdrop = heroItem?.backdrop_path ? getBackdropUrl(heroItem.backdrop_path) : null;

  const handleClearList = () => {
    clearList();
    setShowClearConfirm(false);
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-screen bg-batflix-black">
        <div className="spinner" role="status" aria-label="Loading" />
        <div className="text-batflix-lightGray text-sm">Loading your list...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My List - BatFlix</title>
        <meta name="description" content="Your personal watchlist, planning, and watched library" />
      </Head>

      <div className="relative min-h-screen bg-batflix-black">
        <Header />

        {/* Cinematic hero */}
        <div className="relative h-[44vh] min-h-[320px] max-h-[500px] w-full overflow-hidden bg-batflix-ink">
          {heroBackdrop && (
            <Image
              src={heroBackdrop}
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

          <div className="relative h-full max-w-[1700px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 flex flex-col justify-end pb-8 md:pb-12">
            <div className="flex items-center gap-2.5 animate-fade-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-batflix-red opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-batflix-red" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.32em] text-white/80">
                Your Library
              </span>
            </div>
            <h1
              className="text-4xl md:text-6xl font-extrabold tracking-tight mt-3 drop-shadow-xl animate-fade-up"
              style={{ animationDelay: '80ms' }}
            >
              My List
            </h1>
            <p className="text-sm md:text-base text-gray-300 mt-2.5 animate-fade-up" style={{ animationDelay: '160ms' }}>
              {counts.total} {counts.total === 1 ? 'title' : 'titles'}
              {counts.planning > 0 && ` · ${counts.planning} planning`}
              {counts.watched > 0 && ` · ${counts.watched} watched`}
            </p>
          </div>
        </div>

        <main className="relative max-w-[1700px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 pb-20">
          {/* Toolbar: status tabs + list controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-8 pb-8">
            <div className="glass inline-flex rounded-full p-1 gap-1 flex-wrap animate-fade-up" role="tablist" aria-label="Library sections">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={activeStatus === tab.key}
                  onClick={() => setActiveStatus(tab.key)}
                  className={`px-4 sm:px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                    activeStatus === tab.key
                      ? 'bg-batflix-red text-white shadow-soft'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                  {tab.key !== 'all' && (
                    <span
                      className={`ml-1.5 text-xs ${
                        activeStatus === tab.key ? 'text-white/75' : 'text-gray-500'
                      }`}
                    >
                      {tab.key === 'list' ? counts.list : tab.key === 'planning' ? counts.planning : counts.watched}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {myList.length > 0 && (
              <div className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: '60ms' }}>
                <label className="glass flex items-center gap-2 rounded-full pl-4 pr-2 py-2 focus-within:border-white/40 transition">
                  <span className="text-xs uppercase tracking-wider text-gray-500 hidden sm:inline">Sort</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort My List"
                    className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="added" className="bg-batflix-darkGray">Recently Added</option>
                    <option value="rating" className="bg-batflix-darkGray">Top Rated</option>
                    <option value="title" className="bg-batflix-darkGray">Title A–Z</option>
                  </select>
                </label>

                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="glass px-4 py-2 rounded-full text-sm font-semibold text-gray-300 hover:text-white hover:border-batflix-red/60 hover:bg-batflix-red/10 active:scale-95 transition"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Empty library */}
          {myList.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <div className="glass w-24 h-24 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-11 h-11 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Your list is empty</h2>
              <p className="text-gray-400 mb-6 max-w-md">
                Save titles here to watch later, plan upcoming shows, and keep track of what you have finished.
              </p>
              <Link
                href="/browse"
                className="px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-200 active:scale-95 transition inline-block"
              >
                Browse Content
              </Link>
            </div>
          ) : sortedList.length === 0 ? (
            /* Library has items, but none in this status tab */
            <div className="text-center py-24">
              <h2 className="text-2xl font-semibold mb-2">Nothing here yet</h2>
              <p className="text-gray-400">
                {activeStatus === 'watched'
                  ? 'Titles you mark as watched will appear here.'
                  : activeStatus === 'planning'
                  ? 'Titles you are planning to watch will appear here.'
                  : 'Titles you add to your list will appear here.'}
              </p>
            </div>
          ) : (
            /* Grid of content with a per-item status control */
            <Reveal>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {sortedList.map((item) => {
                  const type = normalizeType(item);
                  const title = item.title || item.name || 'Untitled';
                  return (
                    <div key={`${item.id}-${type}`} className="flex flex-col gap-2">
                      <MovieCard item={item} />
                      <div className="flex items-center gap-2">
                        <label className="glass relative flex-1 flex items-center rounded-full pl-3 pr-2 py-1.5 min-w-0 focus-within:border-white/40 transition">
                          <select
                            value={item.status || 'list'}
                            onChange={(e) => changeItemStatus(item.id, type, e.target.value)}
                            aria-label={`Status for ${title}`}
                            className="w-full bg-transparent text-xs font-medium text-white focus:outline-none cursor-pointer appearance-none pr-1"
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.key} value={opt.key} className="bg-batflix-darkGray">
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <svg
                            className="w-3.5 h-3.5 text-gray-500 shrink-0 pointer-events-none"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </label>
                        <button
                          onClick={() => removeItem(item.id, type)}
                          aria-label={`Remove ${title}`}
                          className="glass w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:border-batflix-red/60 hover:bg-batflix-red/10 active:scale-90 transition shrink-0"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          )}
        </main>

        <Footer />

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
            onClick={() => setShowClearConfirm(false)}
          >
            <div
              className="glass bg-batflix-ink/95 rounded-2xl border border-white/10 shadow-soft max-w-md w-full p-6 animate-modal-in"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">Clear My List?</h2>
              <p className="text-gray-300 mb-6">
                This removes every title from your list, including your planning and watched history. This cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleClearList}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold active:scale-95 transition"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full font-semibold active:scale-95 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
