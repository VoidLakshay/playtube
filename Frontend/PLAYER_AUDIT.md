# Player Audit

## Player Library
The current player uses **hls.js** directly with native HTML5 video controls.
- No Plyr, Video.js, or other third-party players
- HLS integration via `hls.js` library
- Controls are the native browser HTML5 video controls (`controls` attribute on `<video>` tag)

## Current Architecture
From `src/pages/Watch.tsx`:
1. Video element with `ref` set to `videoRef`
2. HLS instance attached when `video.hlsUrl` is present
3. HLS error handling and manifest parsing
4. Fallback to native HLS support (for Safari)
5. Quality selector component that interacts with the hls.js instance

## Existing Seek Bar Implementation
- **Native HTML5 video controls seek bar**: Provided by the browser
- The `<video>` tag has `controls` attribute enabled
- Browser natively handles seeking

## Existing Quality Selector Implementation
Located at `src/components/video/QualitySelector.tsx`:
- Receives `hls` prop (the hls.js instance)
- Renders a dropdown of available video qualities
- On selection, calls `hls.currentLevel = level` to change quality

## Files Analyzed
1. `src/pages/Watch.tsx`: Main player page
2. `src/components/video/QualitySelector.tsx`: Quality selector component
