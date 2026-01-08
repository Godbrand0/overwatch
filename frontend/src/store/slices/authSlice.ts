import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  github_username: string;
  avatar_url: string;
}

interface AuthState {
  user: User | null;
  stats: {
    totalContracts: number;
    rwaContracts: number;
    verifiedContracts: number;
  } | null;
  recentActivity: any[] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  stats: null,
  recentActivity: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunk for fetching user data
export const fetchUserData = createAsyncThunk(
  "auth/fetchUserData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/user");
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Authentication failed");
    }
  }
);

// Async thunk for GitHub login
export const loginWithGithub = createAsyncThunk(
  "auth/loginWithGithub",
  async (_, { rejectWithValue }) => {
    try {
      // Redirect to GitHub OAuth
      window.location.href = "/api/auth/github";
      return { success: true };
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

// Async thunk for logout
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to logout");
      }
      return { success: true };
    } catch (error: any) {
      return rejectWithValue(error.message || "Logout failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.stats = null;
      state.recentActivity = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user data
      .addCase(fetchUserData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.stats = action.payload.stats;
        state.recentActivity = action.payload.recentActivity;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.stats = null;
        state.recentActivity = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      // GitHub login
      .addCase(loginWithGithub.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithGithub.fulfilled, (state) => {
        state.isLoading = false;
        // Note: The actual user data will be set after OAuth callback
      })
      .addCase(loginWithGithub.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.stats = null;
        state.recentActivity = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
