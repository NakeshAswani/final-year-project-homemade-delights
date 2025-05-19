import axiosInstance from "@/lib/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

export const addCategory = createAsyncThunk(
  "category/addCategory",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const user = JSON.parse(Cookies.get("user") || "{}");
      const user_token = user?.token;
      const response = await axiosInstance.post("/category", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: user_token,
        },
      });
      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add category"
      );
    }
  }
);

export const fetchCategories = createAsyncThunk(
  "category/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const user = JSON.parse(Cookies.get("user") || "{}");
      const user_token = user?.token;
      const response = await axiosInstance.get("/category", {
        headers: {
          token: user_token,
        },
      });
      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);

export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async ({ id, formData }: { id: number; formData: FormData }, { rejectWithValue }) => {
    try {
      const user = JSON.parse(Cookies.get("user") || "{}");
      const user_token = user?.token;
      const response = await axiosInstance.put(`/category?id=${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: user_token,
        },
      });
      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update category"
      );
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  "category/fetchCategoryById",
  async (id: number, { rejectWithValue }) => {
    try {
      const user = JSON.parse(Cookies.get("user") || "{}");
      const user_token = user?.token;
      const response = await axiosInstance.get(`/category?id=${id}`, {
        headers: {
          token: user_token,
        },
      });
      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch category"
      );
    }
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setCategories: (state, action) => {
      state.items = action.payload;
    }
  },
});
export const { setCategories } = categorySlice.actions;
export default categorySlice.reducer;