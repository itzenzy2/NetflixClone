/**
 * My List Page
 * 
 * Dedicated page showing all items in the user's watchlist.
 * Allows users to view and manage their saved content.
 */

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import MovieCard from '../components/MovieCard';
import ContentModal from '../components/ContentModal';
import { useMyList } from '../context/MyListContext';

export default function MyListPage() {
  const { myList, clearList, isLoaded } = useMyList();
  const [selectedContent, setSelectedContent] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleContentClick = (content) => {
    setSelectedContent(content);
  };

  const handleCloseModal = () => {
    setSelectedContent(null);
  };

  const handleClearList = () => {
    clearList();
    setShowClearConfirm(false);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-netflix-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My List - Netflix Clone</title>
        <meta name="description" content="Your personal watchlist" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="relative isolate min-h-screen overflow-hidden bg-netflix-black">
        <div className="pointer-events-none absolute left-[-10%] top-0 h-96 w-96 rounded-full bg-netflix-red/10 blur-3xl animate-float" />
        <div className="pointer-events-none absolute right-[-8%] bottom-[10%] h-[28rem] w-[28rem] rounded-full bg-white/5 blur-3xl animate-float [animation-delay:1.3s]" />

        {/* Header */}
        <Header />

        {/* Main Content */}
        <div className="section-shell relative z-10 pt-28 pb-20 md:pt-32">
          {/* Page Title */}
          <div className="glass-panel mb-8 flex flex-col gap-4 rounded-[2rem] p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/45">Personal shelf</p>
              <h1 className="font-display mb-2 text-3xl font-semibold md:text-5xl">My List</h1>
              <p className="text-white/55">
                {myList.length} {myList.length === 1 ? 'title' : 'titles'}
              </p>
            </div>

            {/* Clear List Button */}
            {myList.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="rounded-full border border-white/10 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white/15"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Empty State */}
          {myList.length === 0 ? (
            <div className="glass-panel flex min-h-[60vh] flex-col items-center justify-center rounded-[2rem] text-center">
              <svg
                className="mb-6 h-24 w-24 text-white/20"
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
              <h2 className="font-display mb-2 text-2xl font-semibold md:text-3xl">Your list is empty</h2>
              <p className="mb-6 max-w-md text-white/55">
                Browse movies and TV shows and add them to your list to watch later.
              </p>
              <Link
                href="/"
                className="inline-block rounded-full bg-white px-6 py-3 font-semibold text-black transition duration-300 hover:-translate-y-0.5 hover:bg-white/90"
              >
                Browse Content
              </Link>
            </div>
          ) : (
            /* Grid of Content */
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {myList.map((item) => (
                <MovieCard
                  key={`${item.id}-${item.media_type}`}
                  item={item}
                  onClick={handleContentClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content Details Modal */}
        {selectedContent && (
          <ContentModal
            content={selectedContent}
            onClose={handleCloseModal}
          />
        )}

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl"
            onClick={() => setShowClearConfirm(false)}
          >
            <div
              className="glass-panel w-full max-w-md rounded-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-display mb-4 text-2xl font-semibold">Clear My List?</h2>
              <p className="mb-6 text-white/65">
                Are you sure you want to remove all items from your list? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleClearList}
                  className="flex-1 rounded-full bg-red-600 px-4 py-2.5 font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-red-500"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 rounded-full border border-white/10 bg-white/10 px-4 py-2.5 font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white/15"
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
