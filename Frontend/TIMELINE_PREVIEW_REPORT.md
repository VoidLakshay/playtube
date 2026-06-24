# Timeline Preview Implementation Report

## 1. Files Modified/Added
- **Added**: `src/components/video/TimelinePreview.tsx`
- **Modified**: `src/types.ts` – Added `spriteUrl` to Video interface
- **Modified**: `src/pages/Watch.tsx` – Added state, refs, event handlers, and integrated TimelinePreview component

## 2. Logic Used
### TimelinePreview Component:
- Takes `spriteUrl`, `duration`, `hoverPosition` (0-1) and `previewContainerRef`
- Calculates which thumbnail to show from the sprite sheet
- Uses CSS `background-image` and `background-position` to display the correct frame
- Shows formatted timestamp below the thumbnail

### Watch Page Integration:
- Added `hoverPosition` and `isHoveringProgress` state
- Added `progressBarRef` and `previewContainerRef`
- Added `handleProgressMouseMove` to calculate hover position
- Added `handleProgressMouseLeave` to hide preview

## 3. Calculations Used
### Thumbnail Index:
```typescript
const hoverTime = hoverPosition * duration;
const thumbnailIndex = Math.floor(hoverTime / 10); // 10 second interval
```
### Position in Sprite Sheet:
```typescript
const row = Math.floor(thumbnailIndex / 10); // 10 columns
const col = thumbnailIndex % 10;
const x = -col * 160; // thumbnail width
const y = -row * 90; // thumbnail height
```

## 4. Bugs Found
- **Native Controls Conflict**: Using native video controls means the custom hover area may not perfectly align with the native progress bar
- **Hardcoded Values**: Used hardcoded thumbnail dimensions (160x90), columns (10), and interval (10s) because backend doesn't provide these values yet

## 5. Improvements Recommended
1. **Backend Updates**: Add thumbnailWidth, thumbnailHeight, columns, and interval to video response
2. **Custom Controls**: Replace native controls with custom ones for better integration
3. **Responsive Scaling**: Scale preview thumbnail size based on screen size
4. **Sprite Loading State**: Add a loading state for the sprite image
