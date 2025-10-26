/* eslint-disable @typescript-eslint/no-explicit-any */
import Cookies from 'js-cookie'
import {
  AuthResponse,
  AuthState,
  LoginPayload,
  RegisterPayload,
  userRoles,
} from "@/types";
import api from "@/utils/api";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// Initial state for authentication
const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  role: "none",
};

// Async thunk for getting user profile
export const getUserProfile = createAsyncThunk<AuthResponse, void>(
  "auth/getUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<AuthResponse>("/auth/profile");

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Get user profile failed"
      );
    }
  }
);
// Async thunk for deleting user account
export const deleteAccount = createAsyncThunk<AuthResponse, { email: string }>(
  "auth/deleteAccount",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>(
        "/auth/deleteAccount",
        userData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Profile delete failed"
      );
    }
  }
);
// Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk<
  AuthResponse,
  { fullName: string; email: string; id: string }
>("auth/updateUserProfile", async (userData, { rejectWithValue }) => {
  try {
    const response = await api.put<AuthResponse>(
      "/auth/updateUserProfile",
      userData
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Profile update failed"
    );
  }
});

// Async thunk for user login
export const loginUser = createAsyncThunk<AuthResponse, LoginPayload>(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// Async thunk for user registration
export const registerUser = createAsyncThunk<AuthResponse, RegisterPayload>(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>("/auth/register", userData);
      
      return response.data;
    } catch (error: any) {
      console.log(error.response.data.error.message, "1")
      return rejectWithValue(
        error.response?.data?.message || error.response.data.error.message || "Registration failed"
      );
    }
  }
);

// Slice for authentication
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = "none";
      
      Cookies.remove("token")
    },
    setRole: (state, action: { payload: userRoles }) => {
      state.role = action.payload;
    },
    setToken: (state, action: { payload: string|null }) => {
      state.token = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.loading = false;
          state.role = action.payload.user?.role||"student";
        }
      )
      .addCase(loginUser.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle registration
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        registerUser.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.loading = false;
          state.role = action.payload.user.role;
        }
      )
      .addCase(registerUser.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle profile update
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateUserProfile.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.role = action.payload.user.role;
          
          state.loading = false;
        }
      )
      .addCase(
        updateUserProfile.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )
      // Handle get user profile
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getUserProfile.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.user = action.payload.user;
          // Optionally, you might not update the token if it's not part of the profile response
          state.loading = false;
        }
      )
      .addCase(getUserProfile.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      // handle delete case
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.loading = false;
        state.role = "none";
        Cookies.remove("token")
      })
      .addCase(deleteAccount.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, setRole,setToken } = authSlice.actions;
export default authSlice.reducer;
