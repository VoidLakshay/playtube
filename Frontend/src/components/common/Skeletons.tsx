import React from 'react';

export const VideoCardSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      <div className="aspect-video bg-dark-card rounded-xl animate-pulse" />
      <div className="flex gap-3">
        <div className="w-9 h-9 bg-dark-card rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-dark-card rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-dark-card rounded w-1/2 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export const WatchPageSkeleton: React.FC = () => {
  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-video bg-dark-card rounded-xl animate-pulse" />
          <div className="h-6 bg-dark-card rounded w-3/4 animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-dark-card rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-dark-card rounded w-32 animate-pulse" />
              <div className="h-3 bg-dark-card rounded w-24 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
