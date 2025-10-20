/**
 * 404 Error Page
 * 
 * Custom 404 page for the Netflix clone.
 */

import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Page Not Found - Netflix Clone</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-netflix-black">
        <Header />

        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <h1 className="text-6xl md:text-8xl font-bold mb-4">404</h1>
          <h2 className="text-2xl md:text-4xl font-semibold mb-4">
            Lost your way?
          </h2>
          <p className="text-gray-400 mb-8 max-w-md">
            Sorry, we can't find that page. You'll find lots to explore on the home page.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-white text-black rounded font-semibold hover:bg-gray-200 transition"
          >
            Netflix Home
          </Link>

          {/* Error code display */}
          <div className="mt-12 text-gray-600 text-sm">
            Error Code: <span className="font-mono">NFLX-404</span>
          </div>
        </div>
      </div>
    </>
  );
}
