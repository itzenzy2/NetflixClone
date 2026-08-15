/**
 * Main App Component
 * 
 * Wraps the entire application with necessary providers.
 * Includes the MyListProvider for global state management.
 */

import { Manrope, Space_Grotesk } from 'next/font/google';
import { MyListProvider } from '../context/MyListContext';
import '../styles/globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export default function App({ Component, pageProps }) {
  return (
    <div className={`${manrope.variable} ${spaceGrotesk.variable} min-h-screen bg-netflix-black text-white antialiased`}>
      <MyListProvider>
        <Component {...pageProps} />
      </MyListProvider>
    </div>
  );
}
