import React, { useEffect, useState } from 'react';
import { videoService } from '../services/video';
import VideoCard from '../components/video/VideoCard';
import { VideoCardSkeleton } from '../components/common/Skeletons';
import { ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '../app/hooks';
import { Navigate } from 'react-router-dom';
import type { Like } from '../types';

const Liked: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [likedVideos, setLikedVideos] = useState<Like[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLikedVideos = async () => {
    try {
      setLoading(true);
      const data = await videoService.getLikedVideos();
      setLikedVideos(data || []);
    } catch (err) {
      console.error('Failed to load liked videos:', err);
      toast.error('Failed to load liked videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadLikedVideos();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white">Liked Videos</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {[...Array(8)].map((_, index) => (
            <VideoCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-2">
        <ThumbsUp className="w-8 h-8 text-blue-500" />
        <h1 className="text-2xl font-bold text-white">Liked Videos</h1>
        <span className="text-gray-400 text-lg">
          ({likedVideos.length})
        </span>
      </div>

      {likedVideos.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-xl font-bold text-white mb-2">
            No liked videos yet
          </h2>
          <p className="text-gray-400">
            Start liking videos to add them here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {likedVideos.map((item) => (
            <VideoCard key={item.id} video={item.video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Liked;
