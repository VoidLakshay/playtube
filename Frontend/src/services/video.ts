import api from './api';
import type { Video } from '../types';

export interface UploadVideoData {
  title: string;
  description?: string;
  video: File;
  thumbnail: File;
  isShort?: boolean;
}

export interface UpdateVideoData {
  title?: string;
  description?: string;
  thumbnail?: File;
}

export const videoService = {
  getAllVideos: async (): Promise<Video[]> => {
    const response = await api.get('/video');
    return response.data.videos;
  },

  getTrendingVideos: async (): Promise<Video[]> => {
    // Get all videos and sort by views descending for trending
    const response = await api.get('/video');
    return [...response.data.videos].sort((a, b) => b.views - a.views);
  },

  getVideoById: async (id: string): Promise<{ video: Video; recommendedVideos: Video[] }> => {
    const response = await api.get(`/video/${id}`);
    return response.data;
  },

  uploadVideo: async (data: UploadVideoData): Promise<Video> => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('video', data.video);
    formData.append('thumbnail', data.thumbnail);
    if (data.isShort) formData.append('isShort', 'true');

    const response = await api.post('/video/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.video;
  },

  toggleLike: async (videoId: string): Promise<{ liked: boolean; likesCount: number }> => {
    const response = await api.post(`/video/like/${videoId}`);
    return response.data;
  },

  getLikedVideos: async (): Promise<any[]> => {
    const response = await api.get('/video/liked/all');
    return response.data.likedVideos;
  },

  searchVideos: async (query: string): Promise<{ videos: Video[] }> => {
    const response = await api.get(`/video/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  updateVideo: async (videoId: string, data: UpdateVideoData): Promise<Video> => {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.thumbnail) formData.append('thumbnail', data.thumbnail);

    const response = await api.put(`/video/update/${videoId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.video;
  },

  deleteVideo: async (videoId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/video/delete/${videoId}`);
    return response.data;
  },
};
