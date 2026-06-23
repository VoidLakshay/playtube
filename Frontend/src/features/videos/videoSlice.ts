import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { videoService } from '../../services/video';
import type { Video } from '../../types';

interface VideosState {
  videos: Video[];
  currentVideo: Video | null;
  recommendedVideos: Video[];
  loading: boolean;
  error: string | null;
}

const initialState: VideosState = {
  videos: [],
  currentVideo: null,
  recommendedVideos: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchVideos = createAsyncThunk(
  'videos/fetchVideos',
  async (_, { rejectWithValue }) => {
    try {
      const data = await videoService.getAllVideos();
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch videos';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchVideoById = createAsyncThunk(
  'videos/fetchVideoById',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await videoService.getVideoById(id);
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch video';
      return rejectWithValue(errorMessage);
    }
  }
);

const videoSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    clearCurrentVideo: (state) => {
      state.currentVideo = null;
      state.recommendedVideos = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch videos
      .addCase(fetchVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action: PayloadAction<Video[]>) => {
        state.loading = false;
        state.videos = action.payload;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch video by ID
      .addCase(fetchVideoById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideoById.fulfilled, (state, action: PayloadAction<{ video: Video; recommendedVideos: Video[] }>) => {
        state.loading = false;
        state.currentVideo = action.payload.video;
        state.recommendedVideos = action.payload.recommendedVideos;
      })
      .addCase(fetchVideoById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentVideo } = videoSlice.actions;
export default videoSlice.reducer;
