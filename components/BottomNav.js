/**
 * BottomNav Component
 *
 * Mobile-only bottom tab bar (iPhone/Android pattern). Hidden on desktop
 * (md+) and on the watch page, where full-screen playback takes over.
 * Respects the home-indicator safe area and renders an in-flow spacer so
 * page content is never hidden behind the fixed bar.
 */

import Link from 'next/link';
import { useRouter } from 'next/router';

const TABS = [
  {
    href: '/',
    label: 'Home',
    icon: (active) => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={active ? 2.2 : 1.8}
          d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10"
        />
      </svg>
    ),
  },
  {
    href: '/browse',
    label: 'Browse',
    icon: (active) => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={active ? 2.2 : 1.8}
          d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
        />
        <circle cx="10" cy="10" r="2.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: '/my-list',
    label: 'My List',
    icon: (active) => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={active ? 2.2 : 1.8}
          d="M6 4h12a1 1 0 011 1v15l-7-4-7 4V5a1 1 0 011-1z"
        />
      </svg>
    ),
  },
  {
    href: '/search',
    label: 'Search',
    icon: (active) => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={active ? 2.2 : 1.8}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const router = useRouter();

  // Full-screen playback owns the screen; no bottom bar on the watch page
  if (router.pathname.startsWith('/watch')) {
    return null;
  }

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-batflix-black/90 backdrop-blur-xl border-t border-black/50 safe-bottom"
      >
        <div className="grid grid-cols-4 max-w-md mx-auto">
          {TABS.map((tab) => {
            const active = router.pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className="flex flex-col items-center justify-center gap-0.5 pt-2.5 pb-1.5 active:scale-95 transition-transform"
              >
                <span className={active ? 'text-batflix-red' : 'text-gray-500'}>
                  {tab.icon(active)}
                </span>
                <span
                  className={`text-[0.65rem] font-medium leading-none ${
                    active ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* In-flow spacer so the fixed bar never covers content */}
      <div className="h-[calc(3.75rem+env(safe-area-inset-bottom,0px))] md:hidden" aria-hidden="true" />
    </>
  );
}
