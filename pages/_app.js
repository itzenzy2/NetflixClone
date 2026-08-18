/**
 * Main App Component
 * 
 * Wraps the entire application with necessary providers.
 * Includes the MyListProvider for global state management.
 * Fades content in on each route change for a smooth page transition.
 */

import Head from 'next/head';
import { useRouter } from 'next/router';
import { Inter, Bebas_Neue } from 'next/font/google';
import { MyListProvider } from '../context/MyListContext';
import BottomNav from '../components/BottomNav';
import '../styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-display',
});

export default function App({ Component, pageProps }) {
  const router = useRouter();

  return (
    <MyListProvider>
      {/* Overrides Next's default viewport with the mobile-first version.
          Placed via next/head so the head-manager dedupes in our favor. */}
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <div key={router.pathname} className={`${inter.className} ${bebas.variable} min-h-screen animate-page`}>
        <Component {...pageProps} />
      </div>
      {/* Filmic grain over the whole app (fixed, pointer-transparent) */}
      <div aria-hidden="true" className="grain-overlay" />
      {/* Mobile bottom tab bar (hidden on desktop and the watch page) */}
      <BottomNav />
    </MyListProvider>
  );
}
