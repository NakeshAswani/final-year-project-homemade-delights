import { configureStore } from "@reduxjs/toolkit"
import productsReducer from "./slices/productsSlice"
import cartReducer from "./slices/cartSlice"
import authReducer from "./slices/authSlice"
import addressReducer from "./slices/addressSlice"
import { orderReducer } from "./slices/orderSlice"
import categoryReducer from "./slices/categorySlice"

export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    auth: authReducer,
    address: addressReducer,
    order: orderReducer,
    category:categoryReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch