import api from './api';
import type { Channel, Video } from '../types';

export interface CreateChannelData {
  channelName: string;
  handle: string;
  description?: string;
  logo?: File;
  banner?: File;
}

export interface UpdateChannelData {
  channelName?: string;
  handle?: string;
  description?: string;
  logo?: File;
  banner?: File;
}

export const channelService = {
  getChannelByHandle: async (handle: string): Promise<{ channel: Channel; videos: Video[] }> => {
    const response = await api.get(`/channel/${handle}`);
    return {
      channel: response.data.channel,
      videos: response.data.channel.videos || []
    };
  },

  toggleSubscribe: async (channelId: string): Promise<{ subscribed: boolean }> => {
    const response = await api.post(`/subscription/toggle/${channelId}`);
    return response.data;
  },

  checkSubscriptionStatus: async (channelId: string): Promise<{ subscribed: boolean }> => {
    const response = await api.get(`/subscription/status/${channelId}`);
    return response.data;
  },

  createChannel: async (data: CreateChannelData): Promise<{ success: boolean; channel: Channel }> => {
    const formData = new FormData();
    formData.append('channelName', data.channelName);
    formData.append('handle', data.handle);
    if (data.description) formData.append('description', data.description);
    if (data.logo) formData.append('logo', data.logo);
    if (data.banner) formData.append('banner', data.banner);

    const response = await api.post('/channel/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateChannel: async (data: UpdateChannelData): Promise<{ success: boolean; channel: Channel }> => {
    const formData = new FormData();
    if (data.channelName) formData.append('channelName', data.channelName);
    if (data.handle) formData.append('handle', data.handle);
    if (data.description) formData.append('description', data.description);
    if (data.logo) formData.append('logo', data.logo);
    if (data.banner) formData.append('banner', data.banner);

    const response = await api.put('/channel/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
