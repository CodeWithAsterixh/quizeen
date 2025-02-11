import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SettingsState } from "@/types";

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

// Slice for user settings
const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
      localStorage.setItem("userSettings", JSON.stringify(state));
    },
    toggleSaveResults: (state) => {
      state.saveResults = !state.saveResults;
      localStorage.setItem("userSettings", JSON.stringify(state));
    },
  },
});

export const { setTheme, toggleSaveResults } = settingsSlice.actions;
export default settingsSlice.reducer;
