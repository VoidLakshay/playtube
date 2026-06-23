import React, { useEffect, useState } from 'react';
import { historyService } from '../services/history';
import VideoCard from '../components/video/VideoCard';
import { VideoCardSkeleton } from '../components/common/Skeletons';
import { Loader2, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '../app/hooks';
import { Navigate } from 'react-router-dom';
import type { WatchHistory } from '../types';

const History: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [history, setHistory] = useState<WatchHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<WatchHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await historyService.getWatchHistory();
      setHistory(data.history || []);
      setFilteredHistory(data.history || []);
    } catch (err) {
      console.error('Failed to load history:', err);
      toast.error('Failed to load watch history');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear all watch history?')) return;

    setClearing(true);
    try {
      await historyService.clearWatchHistory();
      setHistory([]);
      setFilteredHistory([]);
      toast.success('Watch history cleared');
    } catch (err) {
      toast.error('Failed to clear watch history');
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = history.filter((item) =>
        item.video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.video.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredHistory(filtered);
    } else {
      setFilteredHistory(history);
    }
  }, [searchQuery, history]);

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Watch History</h1>
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
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Watch History</h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleClearHistory}
            disabled={clearing}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg flex items-center gap-2"
          >
            {clearing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Clear History
          </button>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-xl font-bold text-white mb-2">
            {searchQuery.trim() ? 'No videos found in history' : 'No watch history yet'}
          </h2>
          <p className="text-gray-400">
            {searchQuery.trim() ? 'Try a different search term' : 'Start watching videos to build your history'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {filteredHistory.map((item) => (
            <VideoCard key={item.id} video={item.video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
