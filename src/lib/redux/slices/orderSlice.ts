import axiosInstance from "@/lib/axiosInstance";
import { IAddOrder } from "@/lib/interfaces";
import { Order } from "@prisma/client";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
    order: null,
    orderId: null,
    orderStatus: null,
    orderDetails: null,
    orderItems: null,
    orderTotal: null,
    orderDate: null,
};

const user = Cookies.get("user") ? JSON.parse(Cookies.get("user") || "") : null;
const token = user?.data?.token;
const userId = user?.data?.id;

export const fetchOrder = createAsyncThunk<Order[], number, { rejectValue: string }>(
    "order/fetchOrder",
    async (userId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/order?user_id=${userId}`,
                {
                    headers: {
                        token: token, // Ensure the token is included
                    },
                }
            );
            if (response.status !== 200) {
                return rejectWithValue("Failed to fetch order");
            }
            if (response.data?.data.length === 0) {
                return rejectWithValue("No order found for this user");
            }
            return response.data?.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch order");
        }
    }
);

export const addOrder = createAsyncThunk(
    "order/addOrder",
    async (orderData: IAddOrder, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(
                `/order?user_id=${userId}&address_id=${orderData?.address_id}`, // Add user_id as a query parameter
                orderData,
                {
                    headers: {
                        token: token, // Ensure the token is included
                    },
                }
            );
            if (response.status !== 200) {
                return rejectWithValue("Failed to add order");
            }
            return response.data?.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to add order");
        }
    }
);

export const updateOrderStatus = createAsyncThunk(
    "order/updateOrder",
    async ({ order_id, order_status }: { order_id: number; order_status: string }, { rejectWithValue }: { rejectWithValue: (value: string) => void }) => {
        try {
            const response = await axiosInstance.put(
                `/order`,
                { order_id, status: order_status },
                {
                    headers: {
                        token: token, // Ensure the token is included
                    },
                }
            );
            if (response.status !== 200) {
                return rejectWithValue("Failed to update order");
            }
            return response.data?.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to update order");
        }
    }
); 

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        setOrder: (state, action) => {
            state.order = action.payload;
        },
    },
});

export const { setOrder } = orderSlice.actions;
export const orderReducer = orderSlice.reducer;