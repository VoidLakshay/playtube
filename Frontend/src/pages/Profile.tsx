import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { channelService } from '../services/channel';
import VideoCard from '../components/video/VideoCard';
import { Loader2, Bell } from 'lucide-react';
import { toast } from 'sonner';
import type { Video } from '../types';
import { getImageUrl, getFallbackAvatar } from '../utils/image';

const Profile: React.FC = () => {
  const { handle } = useParams<{ handle: string }>();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [channel, setChannel] = useState<{
    id: string;
    channelName: string;
    handle: string;
    logoUrl?: string;
    bannerUrl?: string;
    description?: string;
    subscribersCount: number;
    videos: Video[];
  } | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (handle) {
      const loadChannel = async () => {
        try {
          setLoading(true);
          setError(null);
          console.log('Loading channel for handle:', handle);
          const data = await channelService.getChannelByHandle(handle!);
          console.log('Loaded channel data:', data);
          setChannel(data.channel);
          setVideos(data.videos || []);
          setSubscribersCount(data.channel.subscribersCount || 0);
          
          // Load subscription status if user is logged in
          if (isAuthenticated && data.channel.id) {
            try {
              const subStatus = await channelService.checkSubscriptionStatus(data.channel.id);
              setIsSubscribed(subStatus.subscribed);
            } catch (subErr) {
              console.error('Failed to load subscription status:', subErr);
            }
          }
        } catch (err) {
          console.error('Failed to load channel:', err);
          setError('Failed to load channel');
          toast.error('Failed to load channel');
        } finally {
          setLoading(false);
        }
      };

      loadChannel();
    }
  }, [handle, isAuthenticated]);

  const handleSubscribe = async () => {
    if (!isAuthenticated) {

      toast.error('Please sign in to subscribe');
      return;
    }
    if (!channel) return;
    try {
      const result = await channelService.toggleSubscribe(channel.id);
      setIsSubscribed(result.subscribed);
      setSubscribersCount((prev) => result.subscribed ? prev + 1 : Math.max(0, prev - 1));
      toast.success(result.subscribed ? 'Subscribed!' : 'Unsubscribed!');
    } catch (err) {
      toast.error('Failed to subscribe');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">{error}</h2>
          <p className="text-gray-400">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Channel not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600">
      {channel.bannerUrl ? (
  <img
    src={getImageUrl(channel.bannerUrl)}
    alt="Banner"
    className="w-full h-full object-cover"
    onError={(e) => {
      e.currentTarget.style.display = "none";
    }}
  />
) : (
  <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-white text-lg font-bold">
    BANNER
  </div>
)}
      </div>

      <div className="px-4 py-6 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 mb-6">
          <img
            src={getImageUrl(channel.logoUrl)}
            alt={channel.channelName}
            className="w-32 h-32 rounded-full border-4 border-dark-bg object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getFallbackAvatar();
            }}
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{channel.channelName}</h1>
            <p className="text-gray-400 mt-1">@{channel.handle}</p>
            <p className="text-gray-400 text-sm mt-2">
              {subscribersCount.toLocaleString()} subscribers • {videos.length} videos
            </p>
          </div>
          <button
            onClick={handleSubscribe}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              isSubscribed
                ? 'bg-dark-card text-white hover:bg-[#2a2a2a]'
                : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            {isSubscribed ? (
              <span className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Subscribed
              </span>
            ) : (
              'Subscribe'
            )}
          </button>
        </div>

        {channel.description && (
          <p className="text-gray-400 mb-6">{channel.description}</p>
        )}

        <div className="border-t border-dark-border pt-4">
          <h2 className="text-xl font-bold text-white mb-4">Videos</h2>
          {videos.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-white mb-2">No videos yet</h3>
              <p className="text-gray-400">This channel hasn't uploaded any videos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
