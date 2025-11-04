# Landing Page Video Setup

## Video File Location

The landing page video should be placed in the **`public`** folder with the exact filename:

```
Plated/public/landingPageVideo.mp4
```

**Important**: 
- The file must be named exactly `landingPageVideo.mp4` (case-sensitive)
- It must be in the `public` folder (not `src/assets`)
- Vite automatically serves files from `public` at the root URL

## How It Works

The video is displayed inside the phone mockup on the landing page hero section with:
- ✅ **Auto-play**: Starts automatically when page loads
- ✅ **Loop**: Continuously loops without stopping
- ✅ **Muted**: Required for autoplay in most browsers
- ✅ **Plays inline**: Works on mobile devices
- ✅ **Responsive**: Fits perfectly within the phone frame

## Video Specifications (Recommended)

For best results, your video should be:
- **Format**: MP4 (H.264 codec)
- **Aspect Ratio**: 9:16 (portrait/vertical) - matches phone screen
- **Resolution**: 1080x1920 or 720x1280 (HD quality)
- **Duration**: 10-30 seconds (loops seamlessly)
- **File Size**: Keep under 5MB for fast loading

## Testing

1. Place `landingPageVideo.mp4` in `Plated/public/`
2. Start the dev server: `npm run dev`
3. Navigate to the landing page
4. The video should play automatically in the phone mockup

## Troubleshooting

### Video not playing?
1. Check file name is exactly `landingPageVideo.mp4`
2. Check file is in `public/` folder (not `src/assets/`)
3. Check browser console for errors
4. Verify video format is MP4 (H.264)

### Video not looping?
- The `loop` attribute should handle this automatically
- If issues persist, ensure video file is not corrupted

### Video not autoplaying?
- Video must be muted for autoplay to work (this is set in code)
- Some browsers require user interaction before autoplay
- Check browser autoplay policies

## Alternative File Locations

If you need to use a different location or filename, update the `src` attribute in `Landing.tsx`:

```tsx
<video
  src="/your-video-name.mp4"  // Change this path
  ...
/>
```

**Note**: Files in `public/` are accessible at the root (`/filename.mp4`), while files in `src/assets/` need to be imported.

