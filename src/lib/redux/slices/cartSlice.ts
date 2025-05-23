import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axiosInstance";
import { CartState, IExtendedCartItem } from "@/lib/interfaces";
import Cookies from "js-cookie";
import { Product } from "@prisma/client";

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

// Async thunk to fetch cart items
export const fetchCartItems = createAsyncThunk<IExtendedCartItem[], void, { rejectValue: string }>(
  "cart/fetchCartItems",
  async (_, { rejectWithValue }) => {
    try {
      const user = Cookies.get("user") ? JSON.parse(Cookies.get("user") || "") : null;
      const token = user?.token;
      const user_id = user?.id;
      const response = await axiosInstance.get(`/cart?user_id=${user_id}`, {
        headers: {
          token: token,
        },
      });

      const cartItems = response.data.data.cartItems.map((item: IExtendedCartItem) => ({
        ...item.product,
        cartItemId: item.id,
        quantity: item.quantity,
      }));

      return cartItems;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch cart items");
    }
  }
);

export const addCart = createAsyncThunk<
  { id: number },
  void,
  { rejectValue: string }
>(
  "cart/addCart",
  async (_, { rejectWithValue }) => {
    try {
      const user = Cookies.get("user") ? JSON.parse(Cookies.get("user") || "") : null;
      const token = user?.token;
      const user_id = user?.id;
      const response = await axiosInstance.post(
        `/cart?user_id=${user_id}`,
        {},
        { headers: { token } }
      );
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to create cart");
    }
  }
);

export const addCartItem = createAsyncThunk<
  IExtendedCartItem,
  { cart_id: number; product_id: number; quantity: number },
  { rejectValue: string }
>(
  "cart/addCartItem",
  async ({ cart_id, product_id, quantity }, { rejectWithValue }) => {
    try {
      const user = Cookies.get("user") ? JSON.parse(Cookies.get("user") || "") : null;
      const token = user?.token;
      const user_id = user?.id;
      const response = await axiosInstance.post(
        `/cart/item`,
        { cart_id, product_id, quantity, user_id },
        { headers: { token } }
      );
      return response.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to add item");
    }
  }
);

export const removeItemFromCart = createAsyncThunk<IExtendedCartItem, { product_id: number, deleteItem?: boolean }>(
  "cart/item/removeFromCart",
  async ({ product_id, deleteItem }, { rejectWithValue }) => {
    try {
      const user = Cookies.get("user") ? JSON.parse(Cookies.get("user") || "") : null;
      const token = user?.token;
      const user_id = user?.id;
      const response = await axiosInstance.delete(`cart/item?id=${product_id}&deleteItem=${deleteItem ? "true" : "false"}`, {
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
      const existingProduct = state.items && state.items.find(item => item.id === action.payload.product.id);
      if (existingProduct) {
        existingProduct.quantity += action.payload.quantity;
      } else {
        state.items && state.items.push({ ...action.payload.product, quantity: action.payload.quantity });
      }
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items && state.items.filter((item) => item.id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
      const item = state.items && state.items.find((item) => item.id === action.payload.id);
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
        const existingIds = new Set(state.items && state.items.map(item => item.id));
        const newItems = action.payload.filter(item => !existingIds.has(item.id));
        state.items = state.items ? [...state.items, ...newItems] : newItems;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.loading = false;
        state.items = [];
        state.error = action.payload as string;
      });
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;