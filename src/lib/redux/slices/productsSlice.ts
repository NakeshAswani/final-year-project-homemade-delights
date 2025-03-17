import axiosInstance from "@/lib/axiosInstance";
import { Product, ProductsState } from "@/lib/interfaces";
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null,
  searchQuery: "",
  sortOrder: "",
};

// Async thunk to fetch products
export const fetchProducts = createAsyncThunk<Product[], void, { rejectValue: string }>(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/product");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch products");
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
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
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