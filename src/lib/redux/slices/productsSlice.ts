import axiosInstance from "@/lib/axiosInstance";
import { IExtendedProduct, ProductsState } from "@/lib/interfaces";
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState: ProductsState = {
  items: [],
  loading: true,
  error: null,
  searchQuery: "",
  sortOrder: "",
};

const user = Cookies.get("user") ? JSON.parse(Cookies.get("user") || "") : null;
const user_role = user?.data?.role;
const user_id = user?.data?.id;
const token = user?.data?.token;

export const fetchProducts = createAsyncThunk<IExtendedProduct[], void, { rejectValue: string }>(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const url = user_role === "SELLER"
        ? `/product?user_id=${user_id}`
        : "/product";

      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch products");
    }
  }
);

// Async thunk to fetch single product
export const fetchSingleProduct = createAsyncThunk<IExtendedProduct, number, { rejectValue: string }>(
  "products/fetchSingleProduct",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/product?id=${id}`);
      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch product");
    }
  }
);

export const addProduct = createAsyncThunk<IExtendedProduct, FormData, { rejectValue: string }>(
  "products/addProduct",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/product", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: token
        },
      });
      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add product");
    }
  }
);

export const updateProduct = createAsyncThunk<IExtendedProduct, { id: number; formData: FormData }, { rejectValue: string }>(
  "products/updateProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/product?id=${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: token
        },
      });
      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update product");
    }
  }
);
export const deleteProduct = createAsyncThunk<void, number, { rejectValue: string }>(
  "products/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/product?id=${id}`, {
        headers: {
          token: token
        },
      });
      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete product");
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<string>) => {
      state.sortOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<IExtendedProduct[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSearchQuery, setSortOrder } = productsSlice.actions;
export default productsSlice.reducer;