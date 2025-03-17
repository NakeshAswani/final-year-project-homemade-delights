import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axiosInstance";
import Cookies from "js-cookie";
import { AuthState, User } from "@/lib/interfaces";

const storedUser = Cookies.get("user");
const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  loading: false,
  error: null,
};

// **Login action**
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/signin", { email, password });
      const userData: User = response.data;
      
      // **Save user & token in cookies**
      Cookies.set("user", JSON.stringify(userData), { expires: 7 }); // Store for 7 days

      return userData;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      Cookies.remove("user");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logoutUser } = authSlice.actions;
export default authSlice.reducer;