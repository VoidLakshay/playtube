import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../app/hooks';
import { watchLaterService } from '../services/watchLater';
import VideoCard from '../components/video/VideoCard';
import { Loader2, Clock } from 'lucide-react';
import type { Video } from '../types';

const WatchLater: React.FC = () => {
  const [watchLaterVideos, setWatchLaterVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      const loadWatchLater = async () => {
        try {
          setLoading(true);
          const videosData = await watchLaterService.getWatchLater();
          // Extract videos from the response (could be items with video property)
          const videos = videosData.map((item: any) => item.video || item);
          setWatchLaterVideos(videos);
        } catch (err) {
          console.error('Failed to load watch later:', err);
        } finally {
          setLoading(false);
        }
      };
      loadWatchLater();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Clock className="w-6 h-6" />
        Watch Later
      </h1>
      {watchLaterVideos.length === 0 ? (
        <div className="text-center py-12 bg-dark-card rounded-xl">
          <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No videos in Watch Later</h3>
          <p className="text-gray-400">Add videos to Watch Later from video page!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {watchLaterVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchLater;
