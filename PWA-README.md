# Position Size Calculator - PWA

Your web app is now a Progressive Web App (PWA)! 🎉

## What's New

### ✅ PWA Features Added:
- **Web App Manifest** - App metadata and icons
- **Service Worker** - Offline functionality and caching
- **Install Prompt** - Users can install the app on their device
- **Mobile Optimizations** - Better touch interactions and mobile UI
- **Offline Support** - App works without internet connection

### 📱 How to Install on Mobile:

1. **Android Chrome:**
   - Open the app in Chrome
   - Tap the "Install App" button when it appears
   - Or go to Chrome menu → "Add to Home screen"

2. **iOS Safari:**
   - Open the app in Safari
   - Tap the Share button
   - Select "Add to Home Screen"

3. **Desktop:**
   - Look for the install icon in the address bar
   - Or use the "Install App" button in the app

### 🚀 Testing Your PWA:

1. **Run the development server:**
   ```bash
   npm run dev
   ```

2. **Test on mobile:**
   - Open your phone's browser
   - Navigate to your local IP (e.g., `http://192.168.1.100:3000`)
   - Test the install functionality

3. **Test offline:**
   - Install the app
   - Turn off your internet connection
   - The app should still work!

### 📁 Files Added/Modified:

- `public/manifest.json` - App configuration
- `public/sw.js` - Service worker for offline support
- `app/layout.tsx` - PWA meta tags
- `app/page.tsx` - Install prompt functionality
- `app/globals.css` - Mobile optimizations
- `next.config.js` - PWA headers

### 🎨 Creating Icons:

1. Open `generate-icons.html` in your browser
2. Download the generated icons
3. Place them in the `public/` folder as:
   - `icon-192x192.png`
   - `icon-512x512.png`

### 🔧 Next Steps:

1. **Deploy to production** - Your PWA will work on any hosting service
2. **Add more offline features** - Consider caching calculation results
3. **Customize icons** - Replace the generated icons with your own design
4. **Add push notifications** - For future updates (optional)

Your Position Size Calculator is now a fully functional mobile app! 📱✨
