import api from "./api";

export const studioService = {
  getDashboard: async () => {
    const response = await api.get("/studio/dashboard");
    return response.data;
  },
};
