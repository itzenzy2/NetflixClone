/**
 * BatLogo Component
 *
 * The BatFlix wordmark: the white "BATFLIX" wordmark with a small
 * "BY ENZY" tagline tucked beneath its left edge.
 * Sizing is em-relative, so the parent controls the overall scale.
 *
 * Behind the wordmark sits a bat-signal searchlight — a warm radial glow
 * that pulses, plus a thin beam sweeping side to side. Decorative only
 * (aria-hidden, pointer-events: none), and transform/opacity based so the
 * animation stays cheap.
 */

export default function BatLogo() {
  return (
    <span className="relative inline-flex flex-col items-start leading-none">
      {/* Bat-signal searchlight sweeping behind the wordmark */}
      <span aria-hidden="true" className="bat-signal">
        <span className="bat-signal-glow" />
        <span className="bat-signal-beam" />
      </span>

      <span className="relative font-display text-white tracking-[0.06em]">BATFLIX</span>
      <span className="relative ml-[0.1em] -mt-[0.25em] font-display text-[0.3em] font-normal uppercase tracking-[0.3em] text-batflix-lightGray/70 whitespace-nowrap">
        BY ENZY
      </span>
    </span>
  );
}
