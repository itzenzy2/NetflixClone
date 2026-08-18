/**
 * 404 Error Page
 * 
 * Custom 404 page for BatFlix.
 */

import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Page Not Found - BatFlix</title>
      </Head>

      <div className="min-h-screen bg-batflix-black">
        <Header />

        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <h1
            className="text-7xl md:text-9xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 animate-fade-up"
            style={{ animationDelay: '80ms' }}
          >
            404
          </h1>
          <h2
            className="text-2xl md:text-4xl font-semibold mb-4 animate-fade-up"
            style={{ animationDelay: '160ms' }}
          >
            Lost your way?
          </h2>
          <p
            className="text-gray-400 mb-8 max-w-md animate-fade-up"
            style={{ animationDelay: '240ms' }}
          >
            Sorry, we can't find that page. You'll find lots to explore on the home page.
          </p>
          <Link
            href="/"
            className="h-11 px-6 flex items-center bg-white text-black rounded-full font-semibold hover:bg-gray-200 active:scale-95 transition animate-fade-up"
            style={{ animationDelay: '320ms' }}
          >
            BatFlix Home
          </Link>

          {/* Error code display */}
          <div className="mt-12 text-gray-600 text-sm animate-fade-up" style={{ animationDelay: '400ms' }}>
            Error Code: <span className="font-mono">BAT-404</span>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
