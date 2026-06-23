import React from 'react';
import { Link } from 'react-router-dom';
import type { Video } from '../../types';
import { getImageUrl } from '../../utils/image';

interface VideoCardProps {
  video: Video;
}

const formatViews = (views: number): string => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K views`;
  }
  return `${views} views`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const channelName = video.channel?.channelName || 'Unknown Channel';
  const channelLogoUrl = video.channel?.logoUrl || '';

  return (
    <Link to={`/watch/${video.id}`} className="group">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-dark-card">
        <img
          src={getImageUrl(video.thumbnailUrl)}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x225?text=No+Thumbnail';
          }}
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
          {formatDuration(video.duration)}
        </div>
      </div>
      <div className="mt-3 flex gap-3">
        <img
          src={getImageUrl(channelLogoUrl)}
          alt={channelName}
          className="w-9 h-9 rounded-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=Channel';
          }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium text-sm line-clamp-2 group-hover:text-blue-400">
            {video.title}
          </h3>
          <p className="text-gray-400 text-sm mt-1">{channelName}</p>
          <p className="text-gray-400 text-xs">
            {formatViews(video.views)} • {formatDate(video.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
