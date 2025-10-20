# Netflix Clone

A high-fidelity Netflix clone built with Next.js, featuring movie/TV show browsing and video playback. This application uses The Movie Database (TMDb) API for content metadata and VidKing for video streaming.

## 🎯 Features

- **Browse Content**: Multiple carousels featuring trending, popular, top-rated content, and genre-specific rows
- **Hero Banner**: Dynamic featured content with play and info actions
- **Search & Details**: Click any title to view detailed information including ratings, overview, and similar content
- **Video Player**: Full-screen video playback using VidKing embedded player
- **My List**: Personal watchlist saved in browser localStorage (persists between sessions)
- **TV Show Support**: Season and episode selector for TV series
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **No Backend Required**: Runs entirely in the browser with localStorage persistence

## 🛠️ Technology Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **APIs**: 
  - TMDb API (content metadata)
  - VidKing API (video playback)
- **Storage**: Browser localStorage

## 📋 Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager
- TMDb API key (free)

## 🚀 Getting Started

### 1. Clone the repository

\`\`\`bash
git clone <your-repo-url>
cd netflix-clone
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 3. Set up environment variables

Create a \`.env.local\` file in the root directory:

\`\`\`env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
\`\`\`

**To get your TMDb API key:**
1. Go to [https://www.themoviedb.org/](https://www.themoviedb.org/)
2. Create a free account
3. Go to Settings > API
4. Request an API key (choose "Developer" option)
5. Copy your API Key (v3 auth) and paste it in \`.env.local\`

### 4. Run the development server

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

\`\`\`
netflix-clone/
├── components/           # React components
│   ├── Header.js        # Navigation bar
│   ├── HeroBanner.js    # Featured content banner
│   ├── MovieCard.js     # Content card component
│   ├── CarouselRow.js   # Horizontal scrolling row
│   └── ContentModal.js  # Details modal/page
├── context/             # React Context providers
│   └── MyListContext.js # Watchlist state management
├── lib/                 # Utility functions
│   ├── tmdb.js         # TMDb API functions
│   └── storage.js      # localStorage utilities
├── pages/              # Next.js pages
│   ├── _app.js         # App wrapper with providers
│   ├── index.js        # Homepage
│   ├── my-list.js      # My List page
│   └── watch/          # Video player pages
│       └── [type]/
│           └── [id].js
├── styles/             # Global styles
│   └── globals.css
└── public/             # Static assets
\`\`\`

## 🎬 How It Works

### Content Browsing

1. **Homepage**: Displays multiple carousels fetching data from various TMDb endpoints (trending, popular, genre-specific)
2. **Hero Banner**: Shows a random trending title with key information
3. **Movie Cards**: Clickable cards that open detailed modal views

### My List Functionality

- **Add/Remove**: Users can add/remove content using the "+" button
- **Persistence**: List is saved in browser's localStorage
- **State Management**: React Context keeps the UI in sync across all components
- **My List Page**: Dedicated page showing all saved content

### Video Playback

- **VidKing Integration**: Uses embedded iframe player
- **Movies**: `/watch/movie/{tmdbId}`
- **TV Shows**: `/watch/tv/{tmdbId}?season=1&episode=1`
- **Customization**: Player supports color themes and autoplay

### State Management Flow

\`\`\`
User Action → Context API → localStorage → UI Update
\`\`\`

1. User adds/removes item from My List
2. Context function updates state
3. localStorage saves the change
4. All components using the context re-render with new data

## 🎨 Customization

### Changing Netflix Red Color

Edit \`tailwind.config.js\`:

\`\`\`javascript
colors: {
  netflix: {
    red: '#E50914', // Change this value
    // ...
  }
}
\`\`\`

### Adding More Content Rows

In \`pages/index.js\`, add new API calls and carousel rows:

\`\`\`javascript
// Fetch data
const [newCategory, setNewCategory] = useState([]);

// In useEffect
const newData = await getMoviesByGenre(GENRES.YOUR_GENRE);
setNewCategory(newData.results);

// Add carousel
<CarouselRow
  title="Your Category"
  items={newCategory}
  onItemClick={handleContentClick}
/>
\`\`\`

### Player Customization

Edit \`pages/watch/[type]/[id].js\`:

\`\`\`javascript
const params = new URLSearchParams({
  color: 'E50914',      // Change color
  autoPlay: 'true',     // Enable/disable autoplay
  // Add more parameters as needed
});
\`\`\`

## 🔑 API Usage

### TMDb API

The app uses these main endpoints:

- \`/trending/{media_type}/{time_window}\` - Trending content
- \`/movie/popular\` - Popular movies
- \`/tv/popular\` - Popular TV shows
- \`/movie/top_rated\` - Top rated movies
- \`/tv/top_rated\` - Top rated TV shows
- \`/discover/movie\` - Discover movies by genre
- \`/movie/{id}\` - Movie details
- \`/tv/{id}\` - TV show details
- \`/tv/{id}/season/{season_number}\` - Season details

### VidKing API

Video player URLs:
- Movies: \`https://www.vidking.net/embed/movie/{tmdbId}\`
- TV Shows: \`https://www.vidking.net/embed/tv/{tmdbId}/{season}/{episode}\`

## 📱 Responsive Design

The app is fully responsive with breakpoints:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🐛 Troubleshooting

### API Key Issues

- Ensure your TMDb API key is correctly set in \`.env.local\`
- Restart the dev server after adding environment variables
- Check the browser console for API error messages

### Images Not Loading

- Verify your \`next.config.js\` includes TMDb domain in \`remotePatterns\`
- Check your internet connection
- Ensure TMDb API is accessible

### My List Not Persisting

- Check if localStorage is enabled in your browser
- Try clearing browser cache and localStorage
- Check browser console for storage errors

### Video Player Not Working

- VidKing availability may vary by region
- Check if the TMDb ID is correct
- Try a different movie/show

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variable: \`NEXT_PUBLIC_TMDB_API_KEY\`
5. Deploy!

### Build for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## 📝 Notes

- This is a educational project for learning purposes
- No user authentication or backend database
- All user data is stored locally in the browser
- Video availability depends on VidKing API and content licensing

## 🤝 Contributing

Feel free to fork this project and customize it for your own learning!

## 📄 License

This project is for educational purposes. Please respect TMDb's API terms of service and content licensing agreements.

## 🙏 Acknowledgments

- [The Movie Database (TMDb)](https://www.themoviedb.org/) for the awesome API
- [VidKing](https://www.vidking.net/) for video playback
- Netflix for design inspiration
