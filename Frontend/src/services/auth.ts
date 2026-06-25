import api from './api';
import type { User } from '../types';

export interface SignupData {
  userName: string;
  email: string;
  password: string;
  photo?: File;
}

export interface SigninData {
  email: string;
  password: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  accessToken?: string;
  refreshToken?: string;
}

export const authService = {
  signup: async (data: SignupData): Promise<SignupResponse> => {
    const formData = new FormData();

    formData.append("userName", data.userName);
    formData.append("email", data.email);
    formData.append("password", data.password);

    if (data.photo) {
      formData.append("photo", data.photo);
    }

    const response = await api.post("/auth/signup", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  signin: async (data: SigninData): Promise<LoginResponse> => {
    const response = await api.post("/auth/signin", data);
    return response.data;
  },

  signout: async (): Promise<void> => {
    await api.post("/auth/signout");
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get("/auth/me");
    return response.data.user;
  },

  refreshAccessToken: async (): Promise<{
    accessToken: string;
    refreshToken: string;
  }> => {
    const response = await api.post("/auth/refresh-token");
    return response.data;
  },
};