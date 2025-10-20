# 📁 Project Structure

\`\`\`
netflix-clone/
│
├── 📂 components/              # Reusable React components
│   ├── CarouselRow.js         # Horizontal scrolling content row
│   ├── ContentModal.js        # Detailed movie/show modal view
│   ├── Header.js              # Navigation bar with logo and links
│   ├── HeroBanner.js          # Large featured content banner
│   └── MovieCard.js           # Individual content card
│
├── 📂 context/                 # React Context for state management
│   └── MyListContext.js       # Global state for user's watchlist
│
├── 📂 lib/                     # Utility functions and helpers
│   ├── storage.js             # localStorage wrapper functions
│   └── tmdb.js                # TMDb API integration functions
│
├── 📂 pages/                   # Next.js pages (routes)
│   ├── _app.js                # App wrapper with providers
│   ├── _document.js           # HTML document structure
│   ├── 404.js                 # Custom 404 error page
│   ├── index.js               # Homepage (/)
│   ├── my-list.js             # My List page (/my-list)
│   └── 📂 watch/              # Video player routes
│       └── 📂 [type]/         # Dynamic type (movie/tv)
│           └── [id].js        # Dynamic ID (/watch/movie/123)
│
├── 📂 public/                  # Static assets
│   ├── favicon.ico            # Browser tab icon
│   └── placeholder-image.png  # Fallback image
│
├── 📂 styles/                  # Global styles
│   └── globals.css            # Tailwind CSS and custom styles
│
├── 📄 .env.local              # Environment variables (API keys)
├── 📄 .eslintrc.json          # ESLint configuration
├── 📄 .gitignore              # Git ignore rules
├── 📄 jsconfig.json           # JavaScript configuration
├── 📄 next.config.js          # Next.js configuration
├── 📄 package.json            # Dependencies and scripts
├── 📄 postcss.config.js       # PostCSS configuration
├── 📄 tailwind.config.js      # Tailwind CSS configuration
│
├── 📄 README.md               # Main project documentation
├── 📄 SETUP.md                # Quick setup guide
├── 📄 DOCUMENTATION.md        # Detailed code documentation
└── 📄 COMMANDS.md             # Command reference guide
\`\`\`

---

## 📊 File Responsibilities

### Core Application Files

| File | Purpose | Key Exports |
|------|---------|-------------|
| \`pages/_app.js\` | App entry point, wraps with providers | N/A |
| \`pages/index.js\` | Homepage with hero and carousels | default component |
| \`pages/my-list.js\` | User's saved content page | default component |
| \`pages/watch/[type]/[id].js\` | Video player page | default component |

### Component Files

| File | Purpose | Props |
|------|---------|-------|
| \`Header.js\` | Navigation bar | None |
| \`HeroBanner.js\` | Featured content banner | \`content\`, \`onInfoClick\` |
| \`CarouselRow.js\` | Scrollable content row | \`title\`, \`items\`, \`onItemClick\` |
| \`MovieCard.js\` | Individual content card | \`item\`, \`onClick\` |
| \`ContentModal.js\` | Detailed content view | \`content\`, \`onClose\` |

### Utility Files

| File | Purpose | Key Functions |
|------|---------|---------------|
| \`lib/tmdb.js\` | TMDb API integration | \`getTrending\`, \`getMovieDetails\`, \`getImageUrl\` |
| \`lib/storage.js\` | localStorage management | \`getMyList\`, \`addToMyList\`, \`removeFromMyList\` |
| \`context/MyListContext.js\` | Global state | \`useMyList\` hook |

### Configuration Files

| File | Purpose | Configures |
|------|---------|------------|
| \`next.config.js\` | Next.js settings | Image domains, React strict mode |
| \`tailwind.config.js\` | Tailwind CSS | Colors, breakpoints, plugins |
| \`postcss.config.js\` | PostCSS | Tailwind and Autoprefixer |
| \`jsconfig.json\` | JavaScript | Path aliases, compiler options |
| \`.eslintrc.json\` | ESLint | Linting rules |

---

## 🔄 Data Flow Visualization

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                        User Action                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Component                           │
│  (Header, HeroBanner, CarouselRow, etc.)                    │
└────────────┬───────────────────────────┬────────────────────┘
             │                           │
             │ (uses)                    │ (uses)
             ▼                           ▼
┌──────────────────────┐    ┌─────────────────────────────────┐
│  MyListContext       │    │     Utility Functions           │
│  (Global State)      │    │  - lib/tmdb.js                  │
└──────────┬───────────┘    │  - lib/storage.js               │
           │                └────────┬────────────────────────┘
           │ (updates)               │ (calls)
           ▼                         ▼
┌──────────────────────┐    ┌─────────────────────────────────┐
│   localStorage       │    │    External APIs                 │
│   (Persistence)      │    │  - TMDb API                      │
└──────────────────────┘    │  - VidKing API                   │
                            └──────────────────────────────────┘
\`\`\`

---

## 🗂️ Import Path Examples

### Relative Imports
\`\`\`javascript
// From pages/index.js
import Header from '../components/Header';
import { getTrending } from '../lib/tmdb';
import { useMyList } from '../context/MyListContext';
\`\`\`

### Absolute Imports (with jsconfig.json)
\`\`\`javascript
// Alternative style (if you prefer)
import Header from '@/components/Header';
import { getTrending } from '@/lib/tmdb';
import { useMyList } from '@/context/MyListContext';
\`\`\`

---

## 📦 Package Dependencies

### Production Dependencies
\`\`\`json
{
  "next": "14.2.5",           // React framework
  "react": "^18.3.1",         // UI library
  "react-dom": "^18.3.1",     // React DOM renderer
  "zustand": "^4.5.2"         // State management (optional)
}
\`\`\`

### Development Dependencies
\`\`\`json
{
  "autoprefixer": "^10.4.19",      // CSS prefixer
  "postcss": "^8.4.39",            // CSS processor
  "tailwindcss": "^3.4.4",         // Utility CSS framework
  "eslint": "^8",                  // Code linter
  "eslint-config-next": "14.2.5"  // Next.js ESLint rules
}
\`\`\`

---

## 🌐 Route Structure

| URL | File | Description |
|-----|------|-------------|
| \`/\` | \`pages/index.js\` | Homepage with hero and carousels |
| \`/my-list\` | \`pages/my-list.js\` | User's watchlist |
| \`/watch/movie/123\` | \`pages/watch/[type]/[id].js\` | Movie player |
| \`/watch/tv/456?season=1&episode=2\` | \`pages/watch/[type]/[id].js\` | TV show player |
| \`/random-url\` | \`pages/404.js\` | Custom 404 page |

---

## 🎨 Styling Architecture

\`\`\`
styles/globals.css
    │
    ├── Tailwind base layer
    ├── Tailwind components layer
    ├── Tailwind utilities layer
    │
    └── Custom utilities
        ├── .scrollbar-hide (hides scrollbars)
        └── body styles

tailwind.config.js
    │
    ├── Custom colors (Netflix theme)
    ├── Custom breakpoints
    ├── Custom gradients
    └── Content paths (what to scan)
\`\`\`

---

## 🔐 Environment Variables

| Variable | Purpose | Where Used |
|----------|---------|------------|
| \`NEXT_PUBLIC_TMDB_API_KEY\` | TMDb authentication | \`lib/tmdb.js\` |

**Note**: Variables prefixed with \`NEXT_PUBLIC_\` are available in the browser.

---

## 📱 Component Hierarchy

\`\`\`
App (_app.js)
│
├── MyListProvider (context)
│   │
│   └── Page Component
│       │
│       ├── Header
│       │
│       ├── HeroBanner
│       │   ├── Image
│       │   ├── Play Button
│       │   ├── Info Button
│       │   └── My List Button
│       │
│       ├── CarouselRow (x10)
│       │   └── MovieCard (x20)
│       │       ├── Image
│       │       └── Title (on hover)
│       │
│       └── ContentModal (conditional)
│           ├── Image
│           ├── Details
│           ├── Play Button
│           ├── My List Button
│           └── Season/Episode Selector (TV)
\`\`\`

---

## 🧩 State Management

### Local State (useState)
- Component-specific UI state
- Modal open/closed
- Loading states
- Selected items

### Global State (Context)
- User's My List
- Shared across all components
- Persisted to localStorage

### Server State (SWR/TanStack Query - Future)
- API response caching
- Background refetching
- Optimistic updates

---

## 📋 File Checklist

Essential files for the app to work:

- [x] \`package.json\` - Dependencies
- [x] \`.env.local\` - API key
- [x] \`next.config.js\` - Next.js config
- [x] \`tailwind.config.js\` - Tailwind config
- [x] \`pages/_app.js\` - App wrapper
- [x] \`pages/index.js\` - Homepage
- [x] \`context/MyListContext.js\` - State management
- [x] \`lib/tmdb.js\` - API integration
- [x] \`lib/storage.js\` - localStorage
- [x] \`components/\` - All UI components

---

**This structure provides a clean, maintainable, and scalable codebase!** 🚀
