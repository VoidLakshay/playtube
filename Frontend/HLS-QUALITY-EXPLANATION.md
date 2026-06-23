# HLS Quality Selection Implementation

## Overview
This document explains how the manual quality selection feature works in the PlayTube frontend, and how YouTube's quality switching works conceptually.

## Key Concepts

### 1. HLS Levels
- **Levels**: Represents different quality variants of the video (different resolutions, bitrates).
- **Hls.levels**: Array of available quality levels from the HLS manifest.
- **Each level contains**: Height (resolution), bitrate, codec info, etc.

### 2. Current Level
- **Hls.currentLevel**: Controls which quality variant is currently playing.
- **Values**:
  - **-1**: Auto (adaptive bitrate streaming - HLS.js automatically switches based on network conditions)
  - **0 to n**: Specific quality level (e.g., 0 = 360p, 1 = 720p, 2 = 1080p)

### 3. Adaptive Bitrate Streaming (Auto Mode)
When `currentLevel` is -1, HLS.js automatically:
- Monitors network bandwidth
- Switches to appropriate quality level
- Balances quality vs. buffering
- Ensures smooth playback

## YouTube Quality Switching Conceptually
- YouTube also uses adaptive bitrate streaming
- "Auto" mode chooses the best quality for your connection
- Manual selection locks to a specific quality
- Quality options shown based on available variants in the manifest
- Switches quality seamlessly between segments

## How HLS.js Switches Levels Internally
1. Parses master playlist to get available variants
2. When quality changes, loads the new variant playlist
3. Downloads segments of the new quality
4. Seamlessly switches when the current segment completes
5. Maintains smooth playback without stuttering

## Our Implementation

### 1. QualitySelector Component
- Displays Auto + all available quality levels
- Shows currently selected quality
- Handles level switching
- Graceful degradation: hides if only one quality or no HLS

### 2. Watch.tsx Integration
- Stores HLS instance in ref
- Cleans up HLS instance on unmount
- Passes HLS ref to QualitySelector
- Adds error handling

### 3. Features Implemented
- ✅ Auto mode (adaptive streaming)
- ✅ Manual quality selection (360p, 720p, 1080p, etc.)
- ✅ Shows currently selected quality
- ✅ Error handling for level switching
- ✅ Handles single quality case (hides selector)
- ✅ Handles missing levels case
- ✅ TypeScript definitions
- ✅ Cleanup on unmount

### 4. Files Modified
- `src/components/video/QualitySelector.tsx`: New component
- `src/pages/Watch.tsx`: Updated to integrate quality selector
- `src/components/common/Skeletons.tsx`: Added missing skeleton component
