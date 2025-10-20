/**
 * Main App Component
 * 
 * Wraps the entire application with necessary providers.
 * Includes the MyListProvider for global state management.
 */

import { MyListProvider } from '../context/MyListContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <MyListProvider>
      <Component {...pageProps} />
    </MyListProvider>
  );
}
