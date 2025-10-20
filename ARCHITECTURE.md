# 🎯 Netflix Clone - Visual Architecture

## System Overview Diagram

\`\`\`
┌─────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                                 │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                    Next.js Application                       │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │              React Context Providers                  │  │   │
│  │  │  - MyListContext (Watchlist State)                   │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  │                            │                                 │   │
│  │  ┌─────────────────────────┼─────────────────────────────┐  │   │
│  │  │            Pages        │      Components              │  │   │
│  │  │  - index.js             │      - Header                │  │   │
│  │  │  - my-list.js           │      - HeroBanner            │  │   │
│  │  │  - watch/[type]/[id].js │      - CarouselRow           │  │   │
│  │  │  - 404.js               │      - MovieCard             │  │   │
│  │  │                         │      - ContentModal          │  │   │
│  │  └─────────────────────────┴─────────────────────────────┘  │   │
│  │                            │                                 │   │
│  │  ┌─────────────────────────┴─────────────────────────────┐  │   │
│  │  │                  Utility Libraries                     │  │   │
│  │  │  - lib/tmdb.js    (API Communication)                 │  │   │
│  │  │  - lib/storage.js (localStorage Wrapper)              │  │   │
│  │  └────────────────────────────────────────────────────────┘  │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                            │              │                          │
│  ┌─────────────────────────┤              │                          │
│  │    localStorage          │              │                          │
│  │  ["My List" Data]        │              │                          │
│  └──────────────────────────┘              │                          │
│                                             │                          │
└─────────────────────────────────────────────┼──────────────────────────┘
                                              │
                         ┌────────────────────┴────────────────────┐
                         │                                          │
                         ▼                                          ▼
              ┌─────────────────────┐                  ┌──────────────────────┐
              │    TMDb API         │                  │   VidKing API        │
              │  (Content Metadata) │                  │  (Video Streaming)   │
              └─────────────────────┘                  └──────────────────────┘
\`\`\`

---

## User Journey Flow

### 1. Homepage Visit
\`\`\`
User opens app
     │
     ▼
App loads → MyListContext initializes → Reads localStorage
     │                                         │
     ▼                                         ▼
Multiple API calls to TMDb         Displays "My List" row (if items exist)
     │
     ▼
Hero banner + 10 content carousels displayed
\`\`\`

### 2. Browse & Add to List
\`\`\`
User clicks movie card
     │
     ▼
ContentModal opens → Shows details from TMDb
     │
     ▼
User clicks "+ My List"
     │
     ▼
MyListContext.toggleItem() → storage.js.addToMyList()
     │
     ▼
localStorage saves data → Context updates → UI re-renders
     │
     ▼
"My List" row appears on homepage
\`\`\`

### 3. Watch Content
\`\`\`
User clicks "Play" button
     │
     ▼
Router navigates to /watch/movie/123
     │
     ▼
Player page constructs VidKing URL
     │
     ▼
Iframe loads video player
     │
     ▼
User watches content
\`\`\`

---

## Component Interaction Diagram

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                        Homepage                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                      Header                            │  │
│  │  [Logo]  [Home]  [My List]                            │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    HeroBanner                          │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ [Featured Movie Backdrop]                        │  │  │
│  │  │ Title, Description                               │  │  │
│  │  │ [▶ Play] [ℹ More Info] [+ My List]             │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  CarouselRow: "My List"                              │  │
│  │  [Card][Card][Card][Card][Card]...                   │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  CarouselRow: "Trending Now"                         │  │
│  │  [Card][Card][Card][Card][Card]...                   │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  CarouselRow: "Popular Movies"                       │  │
│  │  [Card][Card][Card][Card][Card]...                   │  │
│  └───────────────────────────────────────────────────────┘  │
│  ... (8 more carousels)                                    │
└─────────────────────────────────────────────────────────────┘

                    Click Card ↓

┌─────────────────────────────────────────────────────────────┐
│                    ContentModal                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  [Large Backdrop Image]                     [X Close] │  │
│  │  [▶ Play] [+ My List]                                │  │
│  └───────────────────────────────────────────────────────┘  │
│  Title: "Movie Title"                         ⭐ 8.5      │
│  Year: 2023   Runtime: 150 min                            │
│                                                            │
│  Overview: Description of the movie...                     │
│                                                            │
│  Genres: Action, Thriller                                  │
│                                                            │
│  [TV Shows: Season/Episode Selector]                       │
│                                                            │
│  More Like This: [Similar1] [Similar2] [Similar3]         │
└─────────────────────────────────────────────────────────────┘

                    Click Play ↓

┌─────────────────────────────────────────────────────────────┐
│                   Player Page                                │
│  [← Back]                                   [⛶ Fullscreen] │
│                                                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                        │  │
│  │          [VidKing Embedded Player]                    │  │
│  │                                                        │  │
│  │               ▶ Video Playing                         │  │
│  │                                                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                            │
│  Player Info: Movie Name - Season 1, Episode 1             │
│  [← Back to Home]  [Go to My List →]                      │
└─────────────────────────────────────────────────────────────┘
\`\`\`

---

## State Management Flow

\`\`\`
┌──────────────────────────────────────────────────────────────┐
│                    MyListContext                              │
│  State: { myList: [...items], isLoaded: true }              │
└────────┬─────────────────────────────────────────────────────┘
         │
         │ Provides to all components via useMyList() hook
         │
    ┌────┴────┬────────────┬────────────┬──────────┐
    │         │            │            │          │
    ▼         ▼            ▼            ▼          ▼
 Header   HeroBanner   MovieCard   ContentModal  MyListPage
    │         │            │            │          │
    │         │            │            │          │
    └─────────┴────────────┴────────────┴──────────┘
                           │
                   User clicks + button
                           │
                           ▼
              MyListContext.toggleItem(item)
                           │
                           ▼
              storage.js.addToMyList(item)
                           │
                           ▼
              localStorage.setItem('...', JSON.stringify(item))
                           │
                           ▼
              Context state updates: myList = [...myList, item]
                           │
                           ▼
              All components re-render with new myList
\`\`\`

---

## API Call Sequence

### Homepage Load
\`\`\`
index.js useEffect triggers
        │
        ├─→ getTrending('all')          → TMDb API
        ├─→ getPopularMovies()          → TMDb API
        ├─→ getPopularTVShows()         → TMDb API
        ├─→ getTopRatedMovies()         → TMDb API
        ├─→ getTopRatedTVShows()        → TMDb API
        ├─→ getMoviesByGenre(ACTION)    → TMDb API
        ├─→ getMoviesByGenre(COMEDY)    → TMDb API
        ├─→ getMoviesByGenre(HORROR)    → TMDb API
        └─→ getMoviesByGenre(DOCUMENTARY) → TMDb API
        │
        ▼ All requests run in parallel (Promise.all)
        │
        ▼ Responses received
        │
        ▼ State updated with all data
        │
        ▼ Page renders with content
\`\`\`

### Content Details Click
\`\`\`
User clicks MovieCard
        │
        ▼
ContentModal opens with basic info
        │
        ▼
getMovieDetails(id) or getTVShowDetails(id) → TMDb API
        │
        ▼
Response includes:
  - Full details
  - Cast & crew
  - Videos (trailers)
  - Similar content
        │
        ▼
Modal shows complete information
        │
        ▼ (If TV Show)
        │
getSeasonDetails(id, seasonNumber) → TMDb API
        │
        ▼
Episodes list displayed in dropdown
\`\`\`

---

## Data Structure Examples

### TMDb Movie Object
\`\`\`javascript
{
  id: 550,
  title: "Fight Club",
  overview: "A ticking-time-bomb insomniac...",
  poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
  backdrop_path: "/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg",
  release_date: "1999-10-15",
  vote_average: 8.433,
  vote_count: 27000,
  genre_ids: [18, 53, 35],
  media_type: "movie"
}
\`\`\`

### localStorage My List Structure
\`\`\`javascript
[
  {
    id: 550,
    title: "Fight Club",
    media_type: "movie",
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    backdrop_path: "/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg",
    overview: "A ticking-time-bomb insomniac...",
    vote_average: 8.433,
    addedAt: 1697800000000
  },
  // ... more items
]
\`\`\`

### VidKing Player URL
\`\`\`javascript
// Movie
"https://www.vidking.net/embed/movie/550?color=E50914&autoPlay=true"

// TV Show
"https://www.vidking.net/embed/tv/1399/1/1?color=E50914&autoPlay=true"
//                                    ↑   ↑  ↑
//                                  id  s  ep
\`\`\`

---

## File Dependencies Graph

\`\`\`
_app.js
  └─→ MyListContext.js
       └─→ storage.js
            └─→ localStorage (browser)

index.js
  ├─→ Header.js
  ├─→ HeroBanner.js
  │    └─→ MyListContext.js
  ├─→ CarouselRow.js
  │    └─→ MovieCard.js
  ├─→ ContentModal.js
  │    ├─→ MyListContext.js
  │    └─→ tmdb.js
  └─→ tmdb.js
       └─→ TMDb API

watch/[type]/[id].js
  └─→ VidKing API

my-list.js
  ├─→ Header.js
  ├─→ MovieCard.js
  ├─→ ContentModal.js
  └─→ MyListContext.js
\`\`\`

---

## Performance Optimization Points

\`\`\`
┌─────────────────────────────────────────────────────────┐
│               Optimization Strategy                      │
├─────────────────────────────────────────────────────────┤
│  1. API Calls                                           │
│     - Parallel requests with Promise.all ✓              │
│     - Cache responses (future: SWR/React Query)         │
│                                                          │
│  2. Images                                              │
│     - Next.js Image component ✓                         │
│     - Lazy loading ✓                                    │
│     - Responsive sizes ✓                                │
│                                                          │
│  3. Code Splitting                                      │
│     - Automatic by Next.js pages ✓                      │
│     - Dynamic imports (future enhancement)              │
│                                                          │
│  4. State Management                                    │
│     - Context prevents prop drilling ✓                  │
│     - Only consuming components re-render ✓             │
│                                                          │
│  5. localStorage                                        │
│     - Read once on mount ✓                              │
│     - Write on changes only ✓                           │
└─────────────────────────────────────────────────────────┘
\`\`\`

---

This visual guide helps understand how all parts of the application work together! 🎬
