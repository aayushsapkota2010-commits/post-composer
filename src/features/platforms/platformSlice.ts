import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PlatformState {
  selectedPlatforms: string[];
}

const initialState: PlatformState = {
  selectedPlatforms: [],
};

const platformSlice = createSlice({
  name: "platform",

  initialState,

  reducers: {
    setPlatforms: (
      state,
      action: PayloadAction<string[]>
    ) => {
      state.selectedPlatforms = action.payload;
    },
  },
});

export const { setPlatforms } = platformSlice.actions;

export default platformSlice.reducer;