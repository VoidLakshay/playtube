import api from './api';
import type { Comment } from '../types';

export const commentService = {
  getCommentsByVideoId: async (videoId: string): Promise<Comment[]> => {
    const response = await api.get(`/comment/video/${videoId}`);
    return response.data.comments;
  },

  addComment: async (videoId: string, text: string): Promise<Comment> => {
    const response = await api.post(`/comment/create/${videoId}`, { text });
    return response.data.comment;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete(`/comment/${commentId}`);
  },
};
