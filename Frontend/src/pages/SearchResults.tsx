import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchService } from '../services/search';
import VideoCard from '../components/video/VideoCard';
import type { Video } from '../types';
import { Loader2 } from 'lucide-react';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim()) {
      const fetchSearchResults = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await searchService.searchVideos(query);
          setVideos(data.videos);
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Search failed');
        } finally {
          setLoading(false);
        }
      };
      fetchSearchResults();
    } else {
      setVideos([]);
    }
  }, [query]);

  if (loading) {
    return (
      <div className="px-4 py-6 md:px-6 lg:px-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 md:px-6 lg:px-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <h1 className="text-xl font-bold text-white mb-6">
        Search Results for: <span className="text-blue-400">{query}</span>
      </h1>
      
      {videos.length === 0 && query.trim() ? (
        <div className="text-center mt-10">
          <h2 className="text-xl font-bold text-white mb-2">No videos found</h2>
          <p className="text-gray-400">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
