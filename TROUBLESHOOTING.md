# 🔧 Troubleshooting Guide

This guide covers common issues and their solutions.

---

## 📋 Quick Diagnostic Checklist

Before diving into specific issues, run through this checklist:

\`\`\`powershell
# 1. Check Node.js version (should be 16+)
node --version

# 2. Check npm version
npm --version

# 3. Verify environment variables
Get-Content .env.local

# 4. Check for running processes on port 3000
netstat -ano | findstr :3000

# 5. Try a clean restart
Remove-Item -Recurse -Force .next
npm run dev
\`\`\`

---

## ❌ Common Errors & Solutions

### 1. "Cannot find module" Error

**Error Message:**
\`\`\`
Error: Cannot find module 'next'
Module not found: Can't resolve 'react'
\`\`\`

**Cause:** Missing dependencies

**Solution:**
\`\`\`powershell
# Install all dependencies
npm install

# If that doesn't work, clean install
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
\`\`\`

---

### 2. "Invalid API Key" Error

**Error Message:**
\`\`\`
TMDb API Error: 401
Authentication failed: Invalid API key
\`\`\`

**Cause:** Incorrect or missing TMDb API key

**Solution:**
\`\`\`powershell
# 1. Check your .env.local file
Get-Content .env.local

# 2. Ensure format is correct (no spaces):
NEXT_PUBLIC_TMDB_API_KEY=your_actual_key_here

# 3. Verify key is valid at TMDb website
# 4. Restart development server
npm run dev
\`\`\`

**Common Mistakes:**
- ❌ Extra spaces: \`NEXT_PUBLIC_TMDB_API_KEY = abc123\`
- ❌ Wrong variable name: \`TMDB_API_KEY=abc123\`
- ❌ Quotes around value: \`NEXT_PUBLIC_TMDB_API_KEY="abc123"\`
- ✅ Correct: \`NEXT_PUBLIC_TMDB_API_KEY=abc123\`

---

### 3. Port 3000 Already in Use

**Error Message:**
\`\`\`
Error: listen EADDRINUSE: address already in use :::3000
\`\`\`

**Cause:** Another process is using port 3000

**Solution Option 1** - Use different port:
\`\`\`powershell
$env:PORT=3001; npm run dev
\`\`\`

**Solution Option 2** - Kill the process:
\`\`\`powershell
# Find process ID
netstat -ano | findstr :3000

# Kill it (replace PID with actual number)
taskkill /PID 12345 /F
\`\`\`

---

### 4. Images Not Loading

**Symptom:** Broken image icons, no posters showing

**Possible Causes & Solutions:**

**A. Invalid API Key**
\`\`\`powershell
# Check browser console (F12) for 401 errors
# Fix: Update .env.local with correct key
\`\`\`

**B. Internet Connection**
\`\`\`powershell
# Test TMDb API directly
curl https://api.themoviedb.org/3/movie/popular?api_key=YOUR_KEY
\`\`\`

**C. Next.js Image Configuration**
- Check \`next.config.js\` includes TMDb domain
- Should have: \`hostname: 'image.tmdb.org'\`

---

### 5. My List Not Saving

**Symptom:** Items disappear after page refresh

**Possible Causes & Solutions:**

**A. localStorage Disabled**
\`\`\`javascript
// Open browser console (F12) and run:
localStorage.setItem('test', 'value');
console.log(localStorage.getItem('test'));

// If error, localStorage is disabled
// Solution: Enable in browser settings or try different browser
\`\`\`

**B. Incognito/Private Mode**
- localStorage doesn't persist in private browsing
- Solution: Use normal browsing mode

**C. Browser Storage Full**
\`\`\`javascript
// Clear localStorage
localStorage.clear();

// Or just clear app data
localStorage.removeItem('netflix_clone_my_list');
\`\`\`

---

### 6. Build Errors

**Error Message:**
\`\`\`
Failed to compile
Module parse failed
\`\`\`

**Solution:**
\`\`\`powershell
# Step 1: Clear Next.js cache
Remove-Item -Recurse -Force .next

# Step 2: Restart dev server
npm run dev

# If still failing, clean install:
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .next
npm install
npm run dev
\`\`\`

---

### 7. Video Player Not Working

**Symptom:** Black screen, no video loads

**Possible Causes:**

**A. Incorrect TMDb ID**
- Check URL: \`/watch/movie/550\` (550 must be valid)
- Test in browser: \`https://www.vidking.net/embed/movie/550\`

**B. VidKing Doesn't Have Content**
- Not all TMDb movies are on VidKing
- Try different movie/show
- Popular titles more likely to work

**C. Geographic Restrictions**
- VidKing may be blocked in some regions
- Try VPN if necessary

**D. Ad Blockers**
- Some ad blockers prevent iframe loading
- Disable temporarily to test

---

### 8. Tailwind Styles Not Working

**Symptom:** No styling, plain HTML appearance

**Solution:**
\`\`\`powershell
# 1. Check tailwind.config.js exists
# 2. Check postcss.config.js exists
# 3. Verify globals.css has @tailwind directives
# 4. Clear cache and restart
Remove-Item -Recurse -Force .next
npm run dev
\`\`\`

---

### 9. Hydration Errors

**Error Message:**
\`\`\`
Warning: Text content did not match
Hydration failed
\`\`\`

**Cause:** Server HTML doesn't match client HTML

**Common Culprits:**
- Using \`window\` or \`localStorage\` outside useEffect
- Random numbers or dates without consistency
- Browser extensions modifying DOM

**Solution:**
\`\`\`javascript
// ❌ Wrong - runs on server
const MyComponent = () => {
  const data = localStorage.getItem('key');
  return <div>{data}</div>;
};

// ✅ Correct - only runs on client
const MyComponent = () => {
  const [data, setData] = useState('');
  
  useEffect(() => {
    setData(localStorage.getItem('key'));
  }, []);
  
  return <div>{data}</div>;
};
\`\`\`

---

### 10. Context Not Working

**Symptom:** \`useMyList\` returns undefined or errors

**Error Message:**
\`\`\`
Error: useMyList must be used within a MyListProvider
\`\`\`

**Cause:** Component not wrapped in provider

**Solution:**
\`\`\`javascript
// Check _app.js has MyListProvider
export default function App({ Component, pageProps }) {
  return (
    <MyListProvider>  {/* Must be here */}
      <Component {...pageProps} />
    </MyListProvider>
  );
}
\`\`\`

---

## 🔍 Debugging Tools

### Browser DevTools (F12)

**Console Tab**
\`\`\`javascript
// Check for JavaScript errors
// Look for red error messages

// Test API calls manually
fetch('https://api.themoviedb.org/3/movie/popular?api_key=YOUR_KEY')
  .then(r => r.json())
  .then(console.log);

// Check localStorage
console.log(localStorage.getItem('netflix_clone_my_list'));
\`\`\`

**Network Tab**
- See all API requests
- Check response status (200 = success, 401 = auth error)
- View response data
- Check request headers

**Application Tab**
- View localStorage data
- Clear storage
- Check cookies (if using auth)

**Elements Tab**
- Inspect HTML structure
- Check applied CSS
- Test hover states

---

### VS Code Debugging

**Add to \`.vscode/launch.json\`:**
\`\`\`json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    }
  ]
}
\`\`\`

---

### Logging Strategies

**Add Debug Logs:**
\`\`\`javascript
// In component
useEffect(() => {
  console.log('Component mounted');
  console.log('Current myList:', myList);
}, [myList]);

// In API function
async function getTrending() {
  console.log('Fetching trending...');
  const data = await fetchFromTMDb('/trending/all/week');
  console.log('Received:', data);
  return data;
}
\`\`\`

**Remove in Production:**
\`\`\`javascript
// Use environment check
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info');
}
\`\`\`

---

## 🛠️ Emergency Fixes

### Nuclear Option (When Nothing Works)

\`\`\`powershell
# 1. Stop all Node processes
Get-Process node | Stop-Process -Force

# 2. Delete everything
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force .git  # Only if not using Git!
Remove-Item package-lock.json

# 3. Fresh install
npm install

# 4. Clear browser cache
# In browser: Ctrl+Shift+Delete

# 5. Restart everything
npm run dev
\`\`\`

---

### Verify Installation

**Create test file** \`test.js\`:
\`\`\`javascript
// Test if Node.js works
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV);

// Test if can read .env
require('dotenv').config({ path: '.env.local' });
console.log('API Key exists:', !!process.env.NEXT_PUBLIC_TMDB_API_KEY);
\`\`\`

**Run test:**
\`\`\`powershell
node test.js
\`\`\`

---

## 📊 Common Symptoms & Quick Fixes

| Symptom | Likely Cause | Quick Fix |
|---------|--------------|-----------|
| Blank white screen | Build error | Check console, clear .next |
| No images | API key issue | Check .env.local |
| Styles missing | Tailwind not loaded | Clear .next, restart |
| 404 on all pages | Build not complete | Wait for build, check terminal |
| List not saving | localStorage disabled | Check browser settings |
| Can't start server | Port in use | Use different port |
| API errors | Network/key issue | Check console, verify key |
| Video won't load | VidKing issue | Try different movie |

---

## 🔗 Getting Help

### Before Asking for Help

Collect this information:

1. **Error Message** (exact text from console)
2. **Steps to Reproduce** (what you did)
3. **Environment** (Node version, OS, browser)
4. **Code Changes** (if you modified anything)

### Where to Get Help

- Check documentation files in project
- Search GitHub issues for similar problems
- Stack Overflow with \`next.js\` tag
- Next.js Discord community

---

## 📝 Preventive Measures

### Best Practices

✅ **Always**
- Use version control (Git)
- Commit working code frequently
- Keep dependencies updated
- Test in multiple browsers
- Check console regularly

❌ **Never**
- Commit \`.env.local\` to Git
- Modify \`node_modules\` directly
- Ignore TypeScript/ESLint errors
- Delete files without understanding purpose

---

## 🎯 Performance Issues

### Slow Page Load

**Symptoms:** Long loading times, laggy interface

**Solutions:**
\`\`\`javascript
// 1. Reduce API calls
// Fetch less data or implement pagination

// 2. Optimize images
// Use smaller size parameter in getImageUrl

// 3. Lazy load components
const ContentModal = dynamic(() => import('./ContentModal'));

// 4. Memoize expensive computations
const filtered = useMemo(() => 
  items.filter(item => item.rating > 7),
  [items]
);
\`\`\`

---

### Memory Leaks

**Symptoms:** Browser becomes slow over time

**Solution:**
\`\`\`javascript
// Clean up useEffect
useEffect(() => {
  const timer = setTimeout(() => {...}, 1000);
  
  // Cleanup function
  return () => clearTimeout(timer);
}, []);
\`\`\`

---

## 🔄 Reset to Known Good State

If you've made changes and things broke:

\`\`\`powershell
# If using Git
git status
git diff  # See what changed
git checkout .  # Discard all changes

# Re-download from source
# Or copy fresh files from backup
\`\`\`

---

**Still stuck? Check the documentation files:**
- \`README.md\` - Overview
- \`SETUP.md\` - Setup guide
- \`DOCUMENTATION.md\` - Code details
- \`COMMANDS.md\` - Command reference

---

*Last Updated: October 2025*
