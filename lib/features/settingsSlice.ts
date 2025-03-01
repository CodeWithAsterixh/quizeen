import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SettingsState, User } from "@/types";
import api from "@/utils/api";

// Load settings from localStorage if available
const loadSettings = (): SettingsState => {
  if (typeof window !== "undefined") {
    const storedSettings = localStorage.getItem("userSettings");
    return storedSettings ? JSON.parse(storedSettings) : { theme: "light", saveResults: true };
  }
  return { theme: "light", saveResults: true };
};

// Initial state
const initialState: SettingsState = loadSettings();

export const ToggleSavedResults = createAsyncThunk<User, boolean>("settings/toggleSavedResults", async (saveResults, {rejectWithValue})=>{
  try {
    const res = await api.post('/auth/profile', {
      preferences:{
        saveResults
      }
    })
    return res.data.user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error:any) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete quiz");
  }
})

// Slice for user settings
const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
      localStorage.setItem("userSettings", JSON.stringify(state));
    },
  },
  extraReducers:(builder)=>{
    builder
    .addCase(ToggleSavedResults.pending, (state)=>{
      return state
    })
    .addCase(ToggleSavedResults.fulfilled, (state,action: PayloadAction<User>)=>{
      state.saveResults = action.payload.preferences.saveResults
      localStorage.setItem("userSettings", JSON.stringify(state));
    })
    .addCase(ToggleSavedResults.rejected, (state)=>{
      return state
    })
  }
});

export const { setTheme } = settingsSlice.actions;
export default settingsSlice.reducer;
