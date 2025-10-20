/**
 * My List Page
 * 
 * Dedicated page showing all items in the user's watchlist.
 * Allows users to view and manage their saved content.
 */

import { useState } from 'react';
import Head from 'next/head';
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

      <div className="min-h-screen bg-netflix-black">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <div className="pt-20 md:pt-24 px-4 md:px-8 lg:px-16 pb-20">
          {/* Page Title */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">My List</h1>
              <p className="text-gray-400">
                {myList.length} {myList.length === 1 ? 'title' : 'titles'}
              </p>
            </div>

            {/* Clear List Button */}
            {myList.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Empty State */}
          {myList.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <svg
                className="w-24 h-24 text-gray-600 mb-6"
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
              <h2 className="text-2xl font-semibold mb-2">Your list is empty</h2>
              <p className="text-gray-400 mb-6 max-w-md">
                Browse movies and TV shows and add them to your list to watch later.
              </p>
              <a
                href="/"
                className="px-6 py-3 bg-white text-black rounded font-semibold hover:bg-gray-200 transition"
              >
                Browse Content
              </a>
            </div>
          ) : (
            /* Grid of Content */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setShowClearConfirm(false)}
          >
            <div
              className="bg-netflix-darkGray rounded-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">Clear My List?</h2>
              <p className="text-gray-300 mb-6">
                Are you sure you want to remove all items from your list? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleClearList}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-semibold transition"
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
