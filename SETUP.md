# Quick Setup Guide

## Step-by-Step Instructions

### 1. Install Dependencies

Open PowerShell in the project directory and run:

\`\`\`powershell
npm install
\`\`\`

This will install all required packages:
- Next.js
- React
- Tailwind CSS
- Zustand (state management)

### 2. Get Your TMDb API Key

1. Visit [https://www.themoviedb.org/signup](https://www.themoviedb.org/signup)
2. Create a free account
3. Go to your account settings
4. Click on "API" in the left sidebar
5. Click "Create" and choose "Developer"
6. Fill out the form (you can use dummy data for learning purposes)
7. Accept the terms and submit
8. Copy your **API Key (v3 auth)**

### 3. Configure Environment Variables

1. Open the `.env.local` file in the root directory
2. Replace `your_tmdb_api_key_here` with your actual API key:

\`\`\`
NEXT_PUBLIC_TMDB_API_KEY=abc123your_actual_key_here456
\`\`\`

3. Save the file

### 4. Start the Development Server

In PowerShell, run:

\`\`\`powershell
npm run dev
\`\`\`

You should see:

\`\`\`
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
\`\`\`

### 5. Open in Browser

Navigate to: [http://localhost:3000](http://localhost:3000)

You should see the Netflix clone homepage with:
- A hero banner featuring a trending movie/show
- Multiple rows of content (Trending, Popular, etc.)
- A navigation header with "Home" and "My List" links

## Testing Features

### Test the Homepage
- ✅ Hero banner loads with a movie
- ✅ Multiple carousel rows display
- ✅ Clicking on a movie card opens a modal

### Test My List
1. Click on any movie/show card
2. In the modal, click the "+" button
3. Click "My List" in the header
4. Your saved item should appear there
5. Click the item again and click the checkmark to remove it

### Test Video Player
1. Click on any movie/show card
2. Click the "Play" button in the modal
3. You should be redirected to the player page
4. The VidKing iframe should load

### Test TV Shows
1. Find a TV show (look for items with multiple seasons)
2. Click on it to open the modal
3. Use the season and episode dropdowns
4. Click "Play" to watch a specific episode

## Common Issues

### "API key invalid" error
- Check that you copied the entire API key
- Make sure there are no spaces before or after the key
- Restart the dev server after changing `.env.local`

### Images not loading
- This usually means the API key is incorrect
- Check the browser console for specific errors
- Make sure you have an internet connection

### "Module not found" errors
- Run `npm install` again
- Delete `node_modules` folder and `.next` folder, then run `npm install`

### My List not saving
- Check that your browser allows localStorage
- Try a different browser
- Check browser console for errors

## Next Steps

Once everything is working:

1. **Customize the design**: Edit `tailwind.config.js` to change colors
2. **Add more content rows**: Edit `pages/index.js` to add new genres
3. **Improve the UI**: Modify components in the `components/` folder
4. **Deploy online**: Use Vercel or Netlify for free hosting

## Need Help?

Check the main `README.md` for detailed documentation on:
- Project structure
- How each component works
- API usage and customization
- Deployment instructions

---

**Happy coding! 🎬🍿**
