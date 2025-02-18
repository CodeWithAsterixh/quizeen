/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


// Initial state
const initialState: {
    state:any|undefined,
    from:string
}={
    state:undefined,
    from:"home"
}

// Slice for user settings
const unknownSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setUnknownState: (state, action: PayloadAction<{state:any, from:string}>) => {
      state.state = action.payload.state
      state.from = action.payload.from
    },
    clearUnknownState: (state) => {
        state.state= undefined
    },
  },
});

export const { clearUnknownState,setUnknownState } = unknownSlice.actions;
export default unknownSlice.reducer;
