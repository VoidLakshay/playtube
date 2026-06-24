import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import Hls from 'hls.js';

interface QualityLevel {
  index: number;
  height?: number;
  bitrate?: number;
}

interface QualitySelectorProps {
  hls: Hls | null;
}

const QualitySelector: React.FC<QualitySelectorProps> = ({ hls }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<number>(-1);
  const [loading, setLoading] = useState(false);

  // Get available levels
  const levels: QualityLevel[] = hls?.levels.map((level, index) => ({
    index,
    height: level.height,
    bitrate: level.bitrate
  })) || [];

  // Format quality label
  const formatQualityLabel = (levelIndex: number): string => {
    if (levelIndex === -1) return 'Auto';
    const level = levels.find(l => l.index === levelIndex);
    if (!level?.height) return `${levelIndex}`;
    return `${level.height}p`;
  };

  // Handle quality change
  const handleQualityChange = async (levelIndex: number) => {
    if (!hls) return;
    setLoading(true);
    try {
      hls.currentLevel = levelIndex;
      setCurrentLevel(levelIndex);
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to switch quality:', err);
    } finally {
      setLoading(false);
    }
  };

  // If no levels available
  if (levels.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="p-2 hover:bg-dark-card rounded-full transition-colors flex items-center gap-2"
      >
        <Settings className="w-5 h-5 text-white" />
        <span className="text-white text-sm">{formatQualityLabel(hls?.currentLevel ?? currentLevel)}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-dark-card border border-dark-border rounded-xl shadow-xl">
          <div className="p-2">
            {/* Auto option */}
            <button
              onClick={() => handleQualityChange(-1)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                (hls?.currentLevel ?? currentLevel) === -1
                  ? 'bg-blue-600 text-white'
                  : 'text-white hover:bg-[#2a2a2a]'
              }`}
            >
              Auto
            </button>

            {/* Manual quality options */}
            {levels
              .sort((a, b) => (b.height || 0) - (a.height || 0))
              .map((level) => (
                <button
                  key={level.index}
                  onClick={() => handleQualityChange(level.index)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    (hls?.currentLevel ?? currentLevel) === level.index
                      ? 'bg-blue-600 text-white'
                      : 'text-white hover:bg-[#2a2a2a]'
                  }`}
                >
                  {formatQualityLabel(level.index)}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QualitySelector;
