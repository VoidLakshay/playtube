import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface SearchState {
  suggestions: string[];
  loading: boolean;
  error: string | null;
}

const initialState: SearchState = {
  suggestions: [],
  loading: false,
  error: null,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSuggestions: (state, action: PayloadAction<string[]>) => {
      state.suggestions = action.payload;
    },
    setSearchLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSearchError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearSearch: (state) => {
      state.suggestions = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setSuggestions, setSearchLoading, setSearchError, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
