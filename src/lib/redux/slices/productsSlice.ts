import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

export interface Product {
  id: number
  name: string
  price: number
  image: string
  seller: string
  description: string
}

interface ProductsState {
  items: Product[]
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: ProductsState = {
  items: [],
  status: "idle",
  error: null,
}

export const fetchProducts = createAsyncThunk("products/fetchProducts", async () => {
  // Replace this with your actual API call
  const response = await fetch("https://api.example.com/products")
  return response.json()
})

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.status = "succeeded"
        state.items = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Something went wrong"
      })
  },
})

export default productsSlice.reducer

