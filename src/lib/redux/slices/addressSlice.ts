import axiosInstance from "@/lib/axiosInstance";
import { Address } from "@prisma/client";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
    address: null,
    city: null,
    state: null,
    country: null,
    pincode: null
};

export const fetchAddress = createAsyncThunk<Address[], number, { rejectValue: string }>(
    "address/fetchAddress",
    async (userId, { rejectWithValue }) => {
        try {
            const user = Cookies.get("user") ? JSON.parse(Cookies.get("user") || "") : null;
            const token = user?.token;
            const response = await axiosInstance.get(`/user/address?user_id=${userId}`,
                {
                    headers: {
                        token: token
                    },
                }
            );
            if (response.status !== 200) {
                return rejectWithValue("Failed to fetch address");
            }
            if (response.data?.data.length === 0) {
                return rejectWithValue("No address found for this user");
            }

            return response.data?.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch address");
        }
    }
);

export const addAddress = createAsyncThunk(
    "address/addAddress",
    async (addressData: any, { rejectWithValue }) => {
        try {
            const user = Cookies.get("user") ? JSON.parse(Cookies.get("user") || "") : null;
            const token = user?.token;
            const response = await axiosInstance.post(
                `/user/address?user_id=${addressData.user_id}`, // Add user_id as a query parameter
                addressData,
                {
                    headers: {
                        token: token, // Ensure the token is included
                    },
                }
            );
            if (response.status !== 200) {
                return rejectWithValue("Failed to add address");
            }
            return response.data?.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to add address");
        }
    }
);

export const deleteAddress = createAsyncThunk(
    "address/deleteAddress",
    async (addressId: number, { rejectWithValue }) => {
        try {
            const user = Cookies.get("user") ? JSON.parse(Cookies.get("user") || "") : null;
            const token = user?.token;
            const response = await axiosInstance.delete(`/user/address?id=${addressId}`, {
                headers: {
                    token: token, // Ensure the token is included
                },
            });
            if (response.status !== 200) {
                return rejectWithValue("Failed to delete address");
            }
            return response.data?.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete address");
        }
    }
);

export const updatingAddress = createAsyncThunk(
    "address/updateAddress",
    async (addressData: any, { rejectWithValue }) => {
        try {
            const user = Cookies.get("user") ? JSON.parse(Cookies.get("user") || "") : null;
            const token = user?.token;
            const response = await axiosInstance.put(
                '/user/address',
                addressData,
                {
                    headers: {
                        token: token, // Ensure the token is included
                    },
                }
            );
            if (response.status !== 200) {
                return rejectWithValue("Failed to update address");
            }
            return response.data?.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to update address");
        }
    }
);

const addressSlice = createSlice({
    name: "address",
    initialState,
    reducers: {
        setAddress: (state, action) => {
            state.address = action.payload.address;
            state.city = action.payload.city;
            state.state = action.payload.state;
            state.country = action.payload.country;
            state.pincode = action.payload.pincode;
        },
        updateAddress: (state, action) => {
            state.address = action.payload.address;
            state.city = action.payload.city;
            state.state = action.payload.state;
            state.country = action.payload.country;
            state.pincode = action.payload.pincode;
        }
    }
});

export const { setAddress, updateAddress } = addressSlice.actions;
export default addressSlice.reducer;