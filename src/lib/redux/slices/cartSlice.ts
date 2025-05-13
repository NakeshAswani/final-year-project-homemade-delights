import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axiosInstance";
import { CartItem, CartState } from "@/lib/interfaces";
import Cookies from "js-cookie";
import { Product } from "@prisma/client";

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

const user = Cookies.get("user") ? JSON.parse(Cookies.get("user") || "") : null;
const token = user?.data?.token;
const user_id = user?.data?.id;

// Async thunk to fetch cart items
export const fetchCartItems = createAsyncThunk<CartItem[], void, { rejectValue: string }>(
  "cart/fetchCartItems",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/cart?user_id=${user_id}`, {
        headers: {
          token: token,
        },
      });

      const cartItems = response.data.data; // ✅
      return cartItems;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch cart items");
    }
  }
);

export const addCart = createAsyncThunk<void, void, { rejectValue: string }>(
  "cart/addCartItem",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/cart?user_id=${user_id}`,
        {},
        {
          headers: {
            token: token, // Ensure the token is included
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add cart item");
    }
  }
);

export const addCartItem = createAsyncThunk<CartItem, { product_id: number; quantity?: number }>(
  "/cart/item/addCartItem",
  async ({ product_id, quantity }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("cart/item", { user_id, product_id, quantity },
        {
          headers: {
            token: token, // Ensure the token is included
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add cart item");
    }
  }
);

export const removeItemFromCart = createAsyncThunk<CartItem, { product_id: number }>(
  "cart/item/removeFromCart",
  async ({ product_id }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`cart/item?id=${product_id}`, {
        headers: {
          token: token, // Ensure the token is included
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to remove cart item");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
      const existingProduct = state.items.find(item => item.id === action.payload.product.id);
      if (existingProduct) {
        existingProduct.quantity += action.payload.quantity;
      } else {
        state.items.push({ ...action.payload.product, quantity: action.payload.quantity });
      }
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item && action.payload.quantity <= 8) {
        item.quantity = action.payload.quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;