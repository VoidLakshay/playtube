import api from './api';

export const watchLaterService = {
  getWatchLater: async () => {
    const response = await api.get('/watch-later');
    return response.data.watchLaterVideos || [];
  },
  toggleWatchLater: async (videoId: string) => {
    const response = await api.post(`/watch-later/${videoId}`);
    return response.data;
  }
};
