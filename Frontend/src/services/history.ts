import api from "./api";

export const historyService = {
  getWatchHistory: async () => {
    const response = await api.get("/history");
    return response.data;
  },

  addToWatchHistory: async (videoId: string) => {
    const response = await api.post(`/history/${videoId}`);
    return response.data;
  },

  clearWatchHistory: async () => {
    const response = await api.delete("/history/clear");
    return response.data;
  },
};
