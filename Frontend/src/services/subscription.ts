import api from './api';

export const subscriptionService = {
  toggleSubscription: async (channelId: string) => {
    const response = await api.post(`/subscription/toggle/${channelId}`);
    return response.data;
  },
  checkSubscriptionStatus: async (channelId: string) => {
    const response = await api.get(`/subscription/status/${channelId}`);
    return response.data;
  },
  getMySubscriptions: async () => {
    const response = await api.get('/subscription/my');
    return response.data.channels || [];
  }
};
