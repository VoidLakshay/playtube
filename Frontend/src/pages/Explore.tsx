import React, { useEffect, useState } from 'react';
import { videoService } from '../services/video';
import VideoCard from '../components/video/VideoCard';
import { VideoCardSkeleton } from '../components/common/Skeletons';
import type { Video } from '../types';

const Explore: React.FC = () => {
  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [recentVideos, setRecentVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [trending, recent] = await Promise.all([
          videoService.getTrendingVideos(),
          videoService.getAllVideos(),
        ]);
        setTrendingVideos(trending);
        setRecentVideos(recent);
      } catch (err) {
        console.error('Failed to fetch explore data:', err);
        setError('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Trending</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {[...Array(4)].map((_, index) => (
              <VideoCardSkeleton key={`trending-${index}`} />
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Recent Uploads</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {[...Array(4)].map((_, index) => (
              <VideoCardSkeleton key={`recent-${index}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 md:px-6 lg:px-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">{error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      {/* Trending Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">Trending</h2>
        {trendingVideos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No trending videos yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {trendingVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Uploads Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Recent Uploads</h2>
        {recentVideos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No recent uploads yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {recentVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;