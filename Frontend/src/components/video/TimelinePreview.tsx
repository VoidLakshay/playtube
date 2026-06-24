import React, { useEffect, useRef } from "react";
import { getImageUrl } from "../../utils/image";

interface TimelinePreviewProps {
  spriteUrl: string | undefined | null;
  duration: number;
  hoverPosition: number; // 0-1
  previewContainerRef: React.RefObject<HTMLDivElement>;
  onDebug?: (data: any) => void;
}

// Exact parameters from backend FFmpeg command
const THUMBNAIL_WIDTH = 160;
const THUMBNAIL_HEIGHT = 90;
const COLUMNS = 10;
const ROWS = 10;
const INTERVAL = 1; // 1 thumbnail per second

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const TimelinePreview: React.FC<TimelinePreviewProps> = ({
  spriteUrl,
  duration,
  hoverPosition,
  previewContainerRef,
  onDebug,
}) => {
  const spriteImgRef = useRef<HTMLImageElement>(null);
  const [spriteDimensions, setSpriteDimensions] = React.useState<{
    width: number;
    height: number;
  } | null>(null);

  if (!spriteUrl) return null;

  const processedSpriteUrl = getImageUrl(spriteUrl);
  const hoverTime = hoverPosition * duration;
  const thumbnailIndex = Math.floor(hoverTime / INTERVAL);
  const row = Math.floor(thumbnailIndex / COLUMNS);
  const col = thumbnailIndex % COLUMNS;
  const x = -col * THUMBNAIL_WIDTH;
  const y = -row * THUMBNAIL_HEIGHT;

  useEffect(() => {
    if (onDebug && processedSpriteUrl) {
      const debugData = {
        spriteUrl: processedSpriteUrl,
        thumbnailWidth: THUMBNAIL_WIDTH,
        thumbnailHeight: THUMBNAIL_HEIGHT,
        columns: COLUMNS,
        rows: ROWS,
        interval: INTERVAL,
        hoverPosition,
        hoverTime,
        thumbnailIndex,
        row,
        col,
        backgroundPositionX: x,
        backgroundPositionY: y,
        spriteDimensions,
      };
      onDebug(debugData);
    }
  }, [onDebug, processedSpriteUrl, hoverPosition, hoverTime, thumbnailIndex, row, col, x, y, spriteDimensions]);

  return (
    <div
      className="absolute bottom-full left-0 mb-2 transform -translate-x-1/2 pointer-events-none"
      style={{
        left: `${hoverPosition * 100}%`,
      }}
      ref={previewContainerRef}
    >
      {/* Hidden image to get sprite dimensions */}
      <img
        ref={spriteImgRef}
        src={processedSpriteUrl}
        alt="sprite"
        className="hidden"
        onLoad={(e) => {
          const img = e.target as HTMLImageElement;
          setSpriteDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        }}
      />
      <div
        className="rounded overflow-hidden shadow-lg border border-white/20"
        style={{
          width: THUMBNAIL_WIDTH,
          height: THUMBNAIL_HEIGHT,
          backgroundImage: `url(${processedSpriteUrl})`,
          backgroundPosition: `${x}px ${y}px`,
          backgroundSize: "auto",
        }}
      />
      <div className="text-center text-white text-xs font-medium mt-1 bg-black/70 px-2 py-0.5 rounded">
        {formatTime(hoverTime)}
      </div>
    </div>
  );
};

export default TimelinePreview;
