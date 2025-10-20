# 🚀 Deployment Guide - Netflix Clone

This guide covers deploying your Netflix clone to various platforms.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- ✅ Project builds successfully locally (`npm run build`)
- ✅ You have a TMDb API key
- ✅ All files are committed to Git (if using GitHub)
- ✅ `.env.local` is in `.gitignore` (✅ already done)

---

## 🌐 Netlify Deployment (Easiest)

### Method 1: Via GitHub (Recommended)

**Step 1: Push to GitHub**

\`\`\`powershell
cd "d:\\Netlfix Clone"

# Initialize Git
git init

# Add all files
git add .

# Create commit
git commit -m "Initial commit: Netflix clone"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/netflix-clone.git
git branch -M main
git push -u origin main
\`\`\`

**Step 2: Connect to Netlify**

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Sign up or log in
3. Click **"Add new site"** → **"Import an existing project"**
4. Choose **"Deploy with GitHub"**
5. Authorize Netlify to access GitHub
6. Select your `netflix-clone` repository

**Step 3: Configure Build Settings**

\`\`\`
Build command: npm run build
Publish directory: .next
Base directory: (leave empty)
\`\`\`

**Step 4: Add Environment Variables**

Click **"Add environment variables"**:
- **Key**: `NEXT_PUBLIC_TMDB_API_KEY`
- **Value**: Your TMDb API key

**Step 5: Deploy**

Click **"Deploy site"** and wait 2-3 minutes!

---

### Method 2: Netlify CLI (Quick Test)

\`\`\`powershell
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to project
cd "d:\\Netlfix Clone"

# Login to Netlify (opens browser)
netlify login

# Build the project
npm run build

# Deploy to production
netlify deploy --prod

# When prompted:
# - Create & configure a new site: Yes
# - Team: Select your team
# - Site name: netflix-clone
# - Publish directory: .next
\`\`\`

**Add environment variable:**
\`\`\`powershell
netlify env:set NEXT_PUBLIC_TMDB_API_KEY "your_api_key_here"
\`\`\`

**Redeploy after setting env:**
\`\`\`powershell
npm run build
netlify deploy --prod
\`\`\`

---

### Method 3: Drag & Drop (No CLI)

1. Build locally:
\`\`\`powershell
npm run build
\`\`\`

2. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)

3. Drag and drop the `.next` folder

4. After deployment, add environment variable in site settings

⚠️ **Note**: This method requires rebuilding and re-uploading for every change.

---

## 🔷 Vercel Deployment (Recommended for Next.js)

Vercel is the company behind Next.js, so it has the best Next.js support.

### Method 1: Via GitHub

**Step 1: Push to GitHub** (same as Netlify Method 1)

**Step 2: Import to Vercel**

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"Add New Project"**
4. Import your `netflix-clone` repository
5. Vercel auto-detects Next.js settings ✨

**Step 3: Add Environment Variables**

Under **"Environment Variables"**:
- **Name**: `NEXT_PUBLIC_TMDB_API_KEY`
- **Value**: Your TMDb API key
- **Environments**: Production, Preview, Development

**Step 4: Deploy**

Click **"Deploy"** - Done in 1-2 minutes!

---

### Method 2: Vercel CLI

\`\`\`powershell
# Install Vercel CLI
npm install -g vercel

# Navigate to project
cd "d:\\Netlfix Clone"

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? netflix-clone
# - Directory? ./
# - Override settings? No

# For production deployment
vercel --prod
\`\`\`

**Add environment variable:**
\`\`\`powershell
vercel env add NEXT_PUBLIC_TMDB_API_KEY
# Paste your API key when prompted
# Select: Production, Preview, Development

# Redeploy
vercel --prod
\`\`\`

---

## 🟠 AWS Amplify

**Step 1: Push to GitHub** (required)

**Step 2: AWS Console**

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click **"New app"** → **"Host web app"**
3. Choose **GitHub**
4. Select your repository
5. Configure build settings (auto-detected for Next.js)

**Step 3: Environment Variables**

Add in **"Environment variables"**:
- Key: `NEXT_PUBLIC_TMDB_API_KEY`
- Value: Your API key

**Step 4: Deploy**

Click **"Save and deploy"**

---

## 🐳 Docker Deployment (Advanced)

Create `Dockerfile`:

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG NEXT_PUBLIC_TMDB_API_KEY
ENV NEXT_PUBLIC_TMDB_API_KEY=\${NEXT_PUBLIC_TMDB_API_KEY}

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
\`\`\`

**Build and run:**
\`\`\`bash
docker build --build-arg NEXT_PUBLIC_TMDB_API_KEY=your_key -t netflix-clone .
docker run -p 3000:3000 netflix-clone
\`\`\`

---

## 🌍 Custom Domain Setup

### On Netlify:

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `mynetflix.com`)
4. Follow DNS configuration instructions

### On Vercel:

1. Go to **Project Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain
4. Update DNS records as shown

---

## 🔒 Environment Variables Setup

### Required Variable:

\`\`\`
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
\`\`\`

### How to Add:

**Netlify:**
- Site settings → Build & deploy → Environment → Add variable

**Vercel:**
- Project Settings → Environment Variables → Add

**AWS Amplify:**
- App settings → Environment variables → Add

---

## ✅ Post-Deployment Checklist

After deployment, test:

- [ ] Homepage loads
- [ ] Hero banner displays
- [ ] Content carousels load
- [ ] Images appear
- [ ] Click a movie opens modal
- [ ] Add to My List works
- [ ] My List page works
- [ ] Video player loads
- [ ] Mobile responsive
- [ ] No console errors

---

## 🐛 Common Deployment Issues

### Images Not Loading

**Problem**: TMDb images don't display

**Solution**: Check environment variable is set correctly
\`\`\`powershell
# Netlify
netlify env:list

# Vercel
vercel env ls
\`\`\`

### Build Fails

**Problem**: Build process errors

**Solution**: 
\`\`\`powershell
# Test build locally first
npm run build

# Check Node version
node --version  # Should be 16+
\`\`\`

### 404 on Routes

**Problem**: `/my-list` returns 404

**Solution**: Ensure `netlify.toml` redirects are configured (already done!)

### My List Not Persisting

**Problem**: Items disappear on refresh

**Solution**: localStorage works in deployed apps. Check browser settings.

---

## 🔄 Continuous Deployment

Once connected to GitHub:

1. Make code changes locally
2. Commit and push to GitHub:
\`\`\`powershell
git add .
git commit -m "Update feature"
git push
\`\`\`
3. Netlify/Vercel automatically rebuilds and deploys! 🎉

---

## 📊 Deployment Comparison

| Platform | Ease | Speed | Next.js | Free Tier |
|----------|------|-------|---------|-----------|
| **Vercel** | ⭐⭐⭐⭐⭐ | ⚡⚡⚡ | Best | Generous |
| **Netlify** | ⭐⭐⭐⭐⭐ | ⚡⚡⚡ | Good | Generous |
| **AWS Amplify** | ⭐⭐⭐ | ⚡⚡ | Good | Limited |
| **Docker** | ⭐⭐ | ⚡ | Full control | Varies |

**Recommendation**: Use **Vercel** for best Next.js experience, or **Netlify** for simplicity.

---

## 🎉 You're Live!

Once deployed, share your link:
- Add to portfolio
- Share on LinkedIn
- Include in resume
- Show to friends!

**Your Netflix clone is now live on the internet!** 🚀

---

## 📞 Need Help?

- Check build logs on your platform
- Review TROUBLESHOOTING.md
- Ensure environment variables are set
- Test locally first with `npm run build`

---

*Last Updated: October 2025*
