# Timeline Debug Report

## Backend Sprite Generation Parameters
From `src/utils/generateSprite.ts`:
- FFmpeg Command: `ffmpeg -i "${inputPath}" -vf "fps=1,scale=160:90,tile=10x10" "${outputPath}"`
- FPS (interval between thumbnails): 1 second
- Thumbnail Dimensions: 160x90
- Tile Layout: 10 columns x 10 rows

## Frontend Calculations
```typescript
const THUMBNAIL_WIDTH = 160;
const THUMBNAIL_HEIGHT = 90;
const COLUMNS = 10;
const ROWS = 10;
const INTERVAL = 1; // seconds per thumbnail

const hoverTime = hoverPosition * duration;
const thumbnailIndex = Math.floor(hoverTime / INTERVAL);
const row = Math.floor(thumbnailIndex / COLUMNS);
const col = thumbnailIndex % COLUMNS;
const x = -col * THUMBNAIL_WIDTH;
const y = -row * THUMBNAIL_HEIGHT;
```

## Debug Instructions
1. Open your browser's DevTools (F12)
2. Go to the Watch page of a video that has a sprite (uploaded after sprite generation was implemented)
3. Check the Console for "=== FULL VIDEO DATA ===" to verify spriteUrl is present
4. Hover over the progress bar - the TimelinePreview component will log detailed debug data to the console via the onDebug callback
5. The debug data includes:
   - spriteUrl: Full URL to the sprite image
   - thumbnailWidth/thumbnailHeight: 160x90
   - columns/rows: 10x10
   - interval: 1 second
   - hoverPosition (0-1), hoverTime (in seconds)
   - thumbnailIndex, row, column
   - backgroundPositionX/Y
   - spriteDimensions: Natural dimensions of the loaded sprite image

## Interactive Features Added
- YouTube-style hover preview on progress bar
- Timestamp display below preview
- Click to seek to any position
- Progress fill indicator
- Play/Pause button
- Hidden native controls in favor of custom ones

## Files Modified
1. `src/types.ts`: Added `spriteUrl` to Video interface
2. `src/components/video/TimelinePreview.tsx`: Complete rewrite with correct calculations and debug logging
3. `src/pages/Watch.tsx`: Added interactive progress bar, seek, play/pause, and debug logging
