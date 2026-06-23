import api from './api';
import type { Video } from '../types';

export const searchService = {
  searchVideos: async (query: string): Promise<{ videos: Video[] }> => {
    const response = await api.get(`/video/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },
};
