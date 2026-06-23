import api from './api';

export const playlistService = {
  getMyPlaylists: async () => {
    const response = await api.get('/playlist/my-playlists');
    return response.data.playlists || [];
  },
  createPlaylist: async (name: string) => {
    const response = await api.post('/playlist/create', { name });
    return response.data.playlist;
  },
  addVideoToPlaylist: async (videoId: string, playlistId: string) => {
    const response = await api.post('/playlist/add-video', { videoId, playlistId });
    return response.data;
  },
  removeVideoFromPlaylist: async (videoId: string, playlistId: string) => {
    const response = await api.delete('/playlist/remove-video', {
      data: { videoId, playlistId }
    });
    return response.data;
  },
  deletePlaylist: async (playlistId: string) => {
    const response = await api.delete(`/playlist/${playlistId}`);
    return response.data;
  }
};
