import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { subscriptionService } from '../services/subscription';
import { Loader2, Users } from 'lucide-react';
import { getImageUrl, getFallbackAvatar } from '../utils/image';
import type { Channel } from '../types';

const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      const loadSubscriptions = async () => {
        try {
          setLoading(true);
          const channels = await subscriptionService.getMySubscriptions();
          setSubscriptions(channels);
        } catch (err) {
          console.error('Failed to load subscriptions:', err);
        } finally {
          setLoading(false);
        }
      };
      loadSubscriptions();
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
        <Users className="w-6 h-6" />
        Subscriptions
      </h1>
      {subscriptions.length === 0 ? (
        <div className="text-center py-12 bg-dark-card rounded-xl">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Subscriptions Yet</h3>
          <p className="text-gray-400">Browse channels and subscribe!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {subscriptions.map((channel) => (
            <Link
              key={channel.id}
              to={`/channel/${channel.handle}`}
              className="bg-dark-card rounded-xl p-4 hover:bg-dark-card/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src={getImageUrl(channel.logoUrl)}
                  alt={channel.channelName}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getFallbackAvatar();
                  }}
                />
                <div>
                  <h3 className="text-white font-medium">{channel.channelName}</h3>
                  <p className="text-gray-400 text-sm">@{channel.handle}</p>
                  <p className="text-gray-500 text-xs">
                    {channel.subscribersCount?.toLocaleString() || 0} subscribers
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
