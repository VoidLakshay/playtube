import { configureStore } from '@reduxjs/toolkit';
// Fixed import path - verify the relative path from store file to authSlice matches your project structure
import authReducer from '../features/auth/authSlice';
// Check if the file path is correct - common issues might be:
// 1. Typo in the directory or file name (e.g., 'video' instead of 'videos')
// 2. Missing file extension if not configured in tsconfig.json
// 3. Incorrect relative path from this store file to the videoSlice file
import videoReducer from '../features/videos/videoSlice';
import searchReducer from '../features/search/searchSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    videos: videoReducer,
    search: searchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
