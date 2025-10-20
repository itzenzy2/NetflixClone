# 🚀 Quick Start Commands

## Initial Setup (First Time Only)

### 1. Install Node.js Dependencies
\`\`\`powershell
npm install
\`\`\`

**What this does**: Downloads and installs all required packages listed in package.json

**Expected output**:
\`\`\`
added 300+ packages in 30s
\`\`\`

---

## Development Commands

### Start Development Server
\`\`\`powershell
npm run dev
\`\`\`

**What this does**: Starts the Next.js development server with hot-reload

**Expected output**:
\`\`\`
ready - started server on 0.0.0.0:3000
info  - Loaded env from .env.local
\`\`\`

**Then open**: [http://localhost:3000](http://localhost:3000)

**To stop**: Press `Ctrl + C` in the terminal

---

### Build for Production
\`\`\`powershell
npm run build
\`\`\`

**What this does**: Creates an optimized production build

**Expected output**:
\`\`\`
info  - Creating an optimized production build
info  - Compiled successfully
\`\`\`

---

### Start Production Server
\`\`\`powershell
npm start
\`\`\`

**What this does**: Runs the production build (must run \`npm run build\` first)

**When to use**: Testing production build locally before deploying

---

### Run ESLint
\`\`\`powershell
npm run lint
\`\`\`

**What this does**: Checks code for potential errors and style issues

**Expected output**:
\`\`\`
✔ No ESLint warnings or errors
\`\`\`

---

## Troubleshooting Commands

### Clear Next.js Cache
\`\`\`powershell
Remove-Item -Recurse -Force .next
npm run dev
\`\`\`

**When to use**: If you're seeing stale content or build errors

---

### Clean Install (Nuclear Option)
\`\`\`powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .next
Remove-Item package-lock.json
npm install
npm run dev
\`\`\`

**When to use**: If nothing else works and you suspect corrupted dependencies

---

### Check Node Version
\`\`\`powershell
node --version
\`\`\`

**Required**: v16.x or higher

---

### Check npm Version
\`\`\`powershell
npm --version
\`\`\`

**Required**: v7.x or higher

---

## Environment Setup

### View Environment Variables
\`\`\`powershell
Get-Content .env.local
\`\`\`

### Set TMDb API Key (Quick Method)
\`\`\`powershell
echo "NEXT_PUBLIC_TMDB_API_KEY=your_api_key_here" | Out-File -Encoding UTF8 .env.local
\`\`\`

**⚠️ Warning**: Replace \`your_api_key_here\` with your actual API key!

---

## Port Management

### Check What's Using Port 3000
\`\`\`powershell
netstat -ano | findstr :3000
\`\`\`

### Kill Process on Port 3000
\`\`\`powershell
# Find the PID from above command, then:
taskkill /PID <pid_number> /F
\`\`\`

### Run on Different Port
\`\`\`powershell
$env:PORT=3001; npm run dev
\`\`\`

---

## Git Commands (Optional)

### Initialize Git Repository
\`\`\`powershell
git init
git add .
git commit -m "Initial commit: Netflix clone"
\`\`\`

### Create GitHub Repository and Push
\`\`\`powershell
# Create repo on GitHub first, then:
git remote add origin https://github.com/yourusername/netflix-clone.git
git branch -M main
git push -u origin main
\`\`\`

---

## Package Management

### Update All Dependencies
\`\`\`powershell
npm update
\`\`\`

### Check for Outdated Packages
\`\`\`powershell
npm outdated
\`\`\`

### Install Specific Package
\`\`\`powershell
npm install package-name
\`\`\`

### Uninstall Package
\`\`\`powershell
npm uninstall package-name
\`\`\`

---

## Quick Testing Checklist

Run these commands in order to verify everything works:

\`\`\`powershell
# 1. Check versions
node --version
npm --version

# 2. Install dependencies
npm install

# 3. Verify environment
Get-Content .env.local

# 4. Start dev server
npm run dev

# 5. Open browser to http://localhost:3000

# 6. Check console for errors (F12 in browser)
\`\`\`

---

## Common Error Solutions

### Error: "Cannot find module"
**Solution**:
\`\`\`powershell
npm install
\`\`\`

### Error: "Port 3000 is already in use"
**Solution**:
\`\`\`powershell
$env:PORT=3001; npm run dev
\`\`\`

### Error: "Invalid API key"
**Solution**:
1. Check \`.env.local\` file
2. Ensure no spaces around the \`=\` sign
3. Restart dev server

### Error: "Module parse failed"
**Solution**:
\`\`\`powershell
Remove-Item -Recurse -Force .next
npm run dev
\`\`\`

---

## Production Deployment

### Vercel (Recommended)
\`\`\`powershell
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
\`\`\`

### Manual Build & Export
\`\`\`powershell
npm run build
npm start
\`\`\`

---

## Performance Monitoring

### Check Build Size
\`\`\`powershell
npm run build
\`\`\`

Look for the output table showing page sizes.

### Analyze Bundle
\`\`\`powershell
# Install analyzer
npm install @next/bundle-analyzer

# Add to next.config.js and run build
\`\`\`

---

## Development Tips

### Auto-format on Save
Install Prettier extension in VS Code and add to settings:
\`\`\`json
{
  "editor.formatOnSave": true
}
\`\`\`

### View Network Requests
In browser DevTools (F12):
1. Go to Network tab
2. Refresh page
3. Filter by "Fetch/XHR"
4. Inspect TMDb API calls

### Check localStorage
In browser Console (F12):
\`\`\`javascript
// View My List
console.log(localStorage.getItem('netflix_clone_my_list'));

// Clear My List
localStorage.clear();
\`\`\`

---

**Happy Coding! 🎬**
