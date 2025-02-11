/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { QuizState, QuizResult, Quiz, QuizAttempt } from "@/types";
import api from "@/utils/api";

// Initial state for quizzes
const initialState: QuizState = {
  quizzes: [],
  currentQuiz: null,
  loading: false,
  error: null,
  results: null,
};

// Async thunk to fetch all quizzes
export const fetchQuizzes = createAsyncThunk<Quiz[]>(
  "quiz/fetchQuizzes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Quiz[]>("/quizzes");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch quizzes");
    }
  }
);

// Async thunk to fetch a specific quiz
export const fetchQuizById = createAsyncThunk<Quiz, string>(
  "quiz/fetchQuizById",
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await api.get<Quiz>(`/quizzes/${quizId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch quiz");
    }
  }
);

// Async thunk to submit quiz answers
export const submitQuiz = createAsyncThunk<QuizResult, QuizAttempt>(
  "quiz/submitQuiz",
  async (submissionData, { rejectWithValue }) => {
    try {
      const response = await api.post<QuizResult>("/quizzes/submit", submissionData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to submit quiz");
    }
  }
);

// Slice for quizzes
const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    clearQuizState: (state) => {
      state.currentQuiz = null;
      state.results = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetching quizzes
      .addCase(fetchQuizzes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action: PayloadAction<Quiz[]>) => {
        state.quizzes = action.payload;
        state.loading = false;
      })
      .addCase(fetchQuizzes.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle fetching a specific quiz
      .addCase(fetchQuizById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizById.fulfilled, (state, action: PayloadAction<Quiz>) => {
        state.currentQuiz = action.payload;
        state.loading = false;
      })
      .addCase(fetchQuizById.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle submitting a quiz
      .addCase(submitQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitQuiz.fulfilled, (state, action: PayloadAction<QuizResult>) => {
        state.results = action.payload;
        state.loading = false;
      })
      .addCase(submitQuiz.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearQuizState } = quizSlice.actions;
export default quizSlice.reducer;
