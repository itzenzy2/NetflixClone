/**
 * BatLogo Component
 *
 * The BatFlix wordmark: a stylized bat wingmark in brand red paired with
 * the "BatFlix" wordmark and a small "by enzy" tagline beneath it.
 * Sizing is em-relative, so the parent controls the overall scale.
 * Add the `group` class to a parent to trigger a subtle wing-flap on hover.
 */

export default function BatLogo() {
  return (
    <span className="inline-flex items-center gap-1.5 sm:gap-2">
      {/* Stylized front-facing bat: ears, sweeping wings, and a center body point */}
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className="w-[1.15em] h-[1.15em] text-batflix-red drop-shadow-[0_0_10px_rgba(229,9,20,0.4)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
      >
        <path d="M12 1.5 L10.5 4 A1.5 1.5 0 0 0 9 5.5 L9 7 C6.5 7.5 3.5 9 2 12 C0.8 14.2 2 16 4 16 C6 16 8.5 14.5 10.5 11.5 L12 10 L13.5 11.5 C15.5 14.5 18 16 20 16 C22 16 23.2 14.2 22 12 C20.5 9 17.5 7.5 15 7 L15 5.5 A1.5 1.5 0 0 0 13.5 4 L12 1.5 Z" />
      </svg>

      {/* Wordmark + tagline lockup */}
      <span className="flex flex-col leading-none">
        <span className="text-white font-extrabold tracking-tight">BatFlix</span>
        <span className="mt-0.5 text-[0.3em] font-semibold uppercase tracking-[0.3em] text-batflix-lightGray/70 whitespace-nowrap">
          by enzy
        </span>
      </span>
    </span>
  );
}
