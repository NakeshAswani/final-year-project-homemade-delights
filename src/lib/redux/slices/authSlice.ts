import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axiosInstance";
import Cookies from "js-cookie";
import { AuthState, IExtendedUser } from "@/lib/interfaces";

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
      
      const loginData: IExtendedUser = response.data?.data;

      // **Save user & token in cookies**
      Cookies.set("user", JSON.stringify(loginData), { expires: 365 });
      Cookies.set("token", JSON.stringify(loginData.token), { expires: 365 });

      return loginData;
    } catch (err: any) {
      console.log(err);
      
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
    setUser: (state, action) => {
      state.user = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<IExtendedUser>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logoutUser, setUser } = authSlice.actions;
export default authSlice.reducer;