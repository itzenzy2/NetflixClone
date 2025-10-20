# Code Documentation

## Architecture Overview

This Netflix clone follows a component-based architecture with clear separation of concerns:

\`\`\`
┌─────────────────────────────────────────┐
│           Browser (Client)              │
├─────────────────────────────────────────┤
│  React Context (Global State)           │
│  ├── MyListContext                      │
│  └── localStorage (Persistence)         │
├─────────────────────────────────────────┤
│  Pages (Next.js Routes)                 │
│  ├── index.js (Homepage)                │
│  ├── my-list.js (My List Page)          │
│  └── watch/[type]/[id].js (Player)     │
├─────────────────────────────────────────┤
│  Components (Reusable UI)               │
│  ├── Header, HeroBanner                 │
│  ├── CarouselRow, MovieCard             │
│  └── ContentModal                       │
├─────────────────────────────────────────┤
│  Utilities (Business Logic)             │
│  ├── lib/tmdb.js (API calls)            │
│  └── lib/storage.js (localStorage)      │
└─────────────────────────────────────────┘
         ↓                    ↓
    TMDb API            VidKing API
\`\`\`

## Data Flow

### 1. Content Loading Flow

\`\`\`
User visits homepage
    ↓
index.js useEffect runs
    ↓
Multiple API calls to TMDb (parallel)
    ↓
State updated with results
    ↓
Components re-render with data
    ↓
CarouselRows display content
\`\`\`

### 2. My List Flow

\`\`\`
User clicks "+" button
    ↓
toggleItem() in MyListContext
    ↓
addToMyList() in storage.js
    ↓
localStorage.setItem()
    ↓
Context state updates
    ↓
All components with useMyList() re-render
\`\`\`

## Key Components Explained

### 1. MyListContext.js

**Purpose**: Global state management for watchlist

**Key Functions**:
- \`addItem(item)\` - Add to watchlist
- \`removeItem(id, type)\` - Remove from watchlist
- \`toggleItem(item)\` - Add or remove intelligently
- \`isItemInList(id, type)\` - Check if item exists

**How it works**:
\`\`\`javascript
// 1. Provider wraps entire app in _app.js
<MyListProvider>
  <Component {...pageProps} />
</MyListProvider>

// 2. Any component can access the context
const { myList, addItem, removeItem } = useMyList();

// 3. Changes to myList trigger re-renders
\`\`\`

### 2. tmdb.js

**Purpose**: Centralized API communication with TMDb

**Key Functions**:
- \`fetchFromTMDb(endpoint, params)\` - Generic fetch wrapper
- \`getTrending(type)\` - Get trending content
- \`getMovieDetails(id)\` - Get detailed movie info
- \`getTVShowDetails(id)\` - Get detailed TV info
- \`getImageUrl(path, size)\` - Build image URLs

**Example Usage**:
\`\`\`javascript
// Fetch trending movies
const data = await getTrending('movie');
const movies = data.results;

// Get specific movie details
const details = await getMovieDetails(12345);
console.log(details.title, details.overview);
\`\`\`

### 3. storage.js

**Purpose**: localStorage abstraction layer

**Key Functions**:
- \`getMyList()\` - Retrieve saved list
- \`addToMyList(item)\` - Add item to storage
- \`removeFromMyList(id, type)\` - Remove item
- \`isInMyList(id, type)\` - Check existence

**Data Structure**:
\`\`\`javascript
// localStorage stores an array of objects:
[
  {
    id: 550,
    title: "Fight Club",
    media_type: "movie",
    poster_path: "/path.jpg",
    backdrop_path: "/path.jpg",
    overview: "Description...",
    addedAt: 1634567890123
  },
  // ... more items
]
\`\`\`

## Component Patterns

### Pattern 1: Content Card Click Handler

Used throughout the app to open detail modals:

\`\`\`javascript
// In parent component
const [selectedContent, setSelectedContent] = useState(null);

const handleContentClick = (content) => {
  setSelectedContent(content);
};

// Pass to children
<CarouselRow onItemClick={handleContentClick} />

// Render modal conditionally
{selectedContent && (
  <ContentModal 
    content={selectedContent} 
    onClose={() => setSelectedContent(null)} 
  />
)}
\`\`\`

### Pattern 2: Loading States

\`\`\`javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    const result = await apiCall();
    setData(result);
    setLoading(false);
  };
  fetchData();
}, []);

// Conditional rendering
{loading ? <LoadingSpinner /> : <Content data={data} />}
\`\`\`

### Pattern 3: My List Toggle Button

\`\`\`javascript
const { toggleItem, isItemInList } = useMyList();
const [inList, setInList] = useState(false);

useEffect(() => {
  setInList(isItemInList(item.id, item.media_type));
}, [item, isItemInList]);

const handleToggle = () => {
  toggleItem(item);
  setInList(!inList);
};

// Button shows different icon based on state
{inList ? <CheckIcon /> : <PlusIcon />}
\`\`\`

## API Integration Details

### TMDb API Structure

**Base URL**: \`https://api.themoviedb.org/3\`

**Authentication**: API key in query parameter
\`\`\`
?api_key=YOUR_KEY
\`\`\`

**Response Format**:
\`\`\`javascript
{
  page: 1,
  results: [
    {
      id: 550,
      title: "Fight Club",
      poster_path: "/path.jpg",
      backdrop_path: "/path.jpg",
      overview: "Description...",
      vote_average: 8.4,
      release_date: "1999-10-15"
    }
    // ... more items
  ],
  total_pages: 500,
  total_results: 10000
}
\`\`\`

### VidKing API

**Movie URL Pattern**:
\`\`\`
https://www.vidking.net/embed/movie/{tmdbId}?color=E50914&autoPlay=true
\`\`\`

**TV Show URL Pattern**:
\`\`\`
https://www.vidking.net/embed/tv/{tmdbId}/{season}/{episode}?color=E50914&autoPlay=true
\`\`\`

**Parameters**:
- \`color\` - Theme color (hex without #)
- \`autoPlay\` - Start playing automatically (true/false)

## Styling System

### Tailwind Configuration

Custom colors defined in \`tailwind.config.js\`:

\`\`\`javascript
colors: {
  netflix: {
    red: '#E50914',      // Primary brand color
    black: '#141414',    // Background
    darkGray: '#2F2F2F', // Cards/modals
    lightGray: '#B3B3B3' // Text/borders
  }
}
\`\`\`

### Common Utility Classes

\`\`\`css
/* Hide scrollbar but keep functionality */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Gradient overlays */
.bg-gradient-to-b  /* Black gradient bottom */
\`\`\`

### Responsive Breakpoints

\`\`\`
sm:  640px   - Small tablets
md:  768px   - Tablets
lg:  1024px  - Small laptops
xl:  1280px  - Desktop
2xl: 1536px  - Large desktop
\`\`\`

## State Management Deep Dive

### Why Context API?

1. **Simplicity**: No extra dependencies for small state
2. **Performance**: Only components using context re-render
3. **Persistence**: Easy integration with localStorage
4. **Scalability**: Can upgrade to Zustand/Redux later

### Context Provider Pattern

\`\`\`javascript
// 1. Create context
const MyListContext = createContext();

// 2. Create provider component
export function MyListProvider({ children }) {
  const [myList, setMyList] = useState([]);
  
  // Initialize from localStorage
  useEffect(() => {
    const stored = getMyList();
    setMyList(stored);
  }, []);
  
  // Provide value to consumers
  return (
    <MyListContext.Provider value={{ myList, ... }}>
      {children}
    </MyListContext.Provider>
  );
}

// 3. Create custom hook
export function useMyList() {
  const context = useContext(MyListContext);
  if (!context) throw new Error('Must use within provider');
  return context;
}
\`\`\`

## Performance Optimizations

### 1. Parallel API Calls

Instead of sequential:
\`\`\`javascript
// ❌ Slow - sequential
const trending = await getTrending();
const popular = await getPopular();
const topRated = await getTopRated();
\`\`\`

Use Promise.all:
\`\`\`javascript
// ✅ Fast - parallel
const [trending, popular, topRated] = await Promise.all([
  getTrending(),
  getPopular(),
  getTopRated()
]);
\`\`\`

### 2. Image Optimization

Next.js Image component:
- Lazy loading by default
- Automatic responsive images
- WebP format when supported

\`\`\`javascript
<Image
  src={url}
  alt={title}
  fill
  sizes="(max-width: 768px) 100vw, 1200px"
/>
\`\`\`

### 3. Code Splitting

Next.js automatically splits code by page:
- Homepage bundle
- My List page bundle
- Player page bundle

## Error Handling

### API Error Handling

\`\`\`javascript
async function fetchFromTMDb(endpoint) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(\`API Error: \${response.status}\`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error; // Re-throw for caller to handle
  }
}
\`\`\`

### localStorage Error Handling

\`\`\`javascript
export function getMyList() {
  if (typeof window === 'undefined') {
    return []; // SSR safety
  }
  
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Storage error:', error);
    return []; // Fail gracefully
  }
}
\`\`\`

## Testing Checklist

### Manual Testing

- [ ] Homepage loads with content
- [ ] Hero banner displays correctly
- [ ] All carousels load and scroll
- [ ] Movie cards are clickable
- [ ] Content modal opens with details
- [ ] Add to My List button works
- [ ] My List page shows saved items
- [ ] Remove from My List works
- [ ] Video player loads iframe
- [ ] TV show season/episode selector works
- [ ] Responsive design works on mobile
- [ ] Back button navigation works

### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari
- [ ] Mobile Chrome

## Debugging Tips

### Check API Key

\`\`\`javascript
// Add to page temporarily
console.log('API Key:', process.env.NEXT_PUBLIC_TMDB_API_KEY);
\`\`\`

### Check localStorage

Open browser console:
\`\`\`javascript
// View My List data
console.log(localStorage.getItem('netflix_clone_my_list'));

// Clear My List
localStorage.removeItem('netflix_clone_my_list');
\`\`\`

### Check Network Requests

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Click on request to see details
5. Check Response tab for data

## Extending the App

### Add a New Feature

Example: Recently Viewed

1. Create new utility functions in \`lib/storage.js\`:
\`\`\`javascript
export function addToRecentlyViewed(item) {
  // Similar to addToMyList
}
\`\`\`

2. Create new context in \`context/RecentlyViewedContext.js\`

3. Add provider to \`_app.js\`:
\`\`\`javascript
<MyListProvider>
  <RecentlyViewedProvider>
    <Component {...pageProps} />
  </RecentlyViewedProvider>
</MyListProvider>
\`\`\`

4. Use in components:
\`\`\`javascript
const { recentlyViewed, addItem } = useRecentlyViewed();
\`\`\`

### Add User Authentication

To add user accounts:

1. Choose auth provider (Firebase, Auth0, NextAuth)
2. Create authentication context
3. Replace localStorage with backend API calls
4. Add protected routes
5. Store user-specific data on server

## Deployment Checklist

- [ ] Build succeeds locally (\`npm run build\`)
- [ ] Environment variables configured
- [ ] Images load correctly
- [ ] All pages accessible
- [ ] Mobile responsive
- [ ] Error pages work (404)
- [ ] Video player loads
- [ ] localStorage works
- [ ] SEO meta tags present

---

**Last Updated**: October 2025
