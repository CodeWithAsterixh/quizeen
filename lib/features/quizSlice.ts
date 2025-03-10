/* eslint-disable @typescript-eslint/no-explicit-any */
import { QuizFormState } from "@/components/QuizForm";
import { QuestionResultSubmission, Quiz, QuizAttempt, QuizResult, QuizState } from "@/types";
import api from "@/utils/api";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// Initial state for quizzes
const initialState: QuizState = {
  quizzes: [],
  currentQuiz: null,
  loading: false,
  error: null,
  results: null,
  userCompleted:[]
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
export const submitQuiz = createAsyncThunk<QuizResult, QuestionResultSubmission>(
  "quiz/submitQuiz",
  async (submissionData, { rejectWithValue }) => {
    try {
      const response = await api.post<QuizResult>(`/quizzes/${submissionData.quizId}/submit`, submissionData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to submit quiz");
    }
  }
);
// Async thunk to submit quiz answers
export const getResults = createAsyncThunk<QuizAttempt[], string>(
  "quiz/getresults",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get<QuizAttempt[]>(`/results?uid=${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to submit quiz");
    }
  }
);

// Async thunk to submit quiz
export const CreateQuiz = createAsyncThunk<Quiz, Quiz>(
  "quiz/createQuiz",
  async (submissionData, { rejectWithValue }) => {
    try {
      const response = await api.post<Quiz>("/admin/create", submissionData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to submit quiz");
    }
  }
);
// Async thunk to Update quiz
export const UpdateQuiz = createAsyncThunk<Quiz, QuizFormState>(
  "quiz/updateQuiz",
  async (submissionData, { rejectWithValue }) => {
    try {
      const response = await api.put<Quiz>(`/quizzes/${submissionData._id}`,submissionData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to submit quiz");
    }
  }
);
export const DeleteQuiz = createAsyncThunk<string, string>(
  "quiz/deleteQuiz",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/quizzes/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete quiz");
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
      })
      // Handle Creating a quiz
      .addCase(CreateQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(CreateQuiz.fulfilled, (state, action: PayloadAction<Quiz>) => {
        state.quizzes = [...state.quizzes,action.payload];
        state.loading = false;
      })
      .addCase(CreateQuiz.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle updating a quiz
      .addCase(UpdateQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(UpdateQuiz.fulfilled, (state, action: PayloadAction<Quiz>) => {
        const filtered = state.quizzes.filter(q=>q._id!==action.payload._id)
        state.quizzes = [...filtered,action.payload];
        state.loading = false;
      })
      .addCase(UpdateQuiz.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle deleting a quiz
      .addCase(DeleteQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(DeleteQuiz.fulfilled, (state, action: PayloadAction<string>) => {
        const filtered = state.quizzes.filter(q=>q._id!==action.payload)
        state.quizzes = [...filtered];
        state.loading = false;
      })
      .addCase(DeleteQuiz.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle getting results
      .addCase(getResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getResults.fulfilled, (state, action: PayloadAction<QuizAttempt[]>) => {
        state.userCompleted = action.payload;
        state.loading = false;
      })
      .addCase(getResults.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearQuizState } = quizSlice.actions;
export default quizSlice.reducer;
