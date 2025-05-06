"use client";
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/redux/store'; // Adjust the path to your store file
import { fetchOrder } from '@/lib/redux/slices/orderSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import OrderCard from '../components/common/OrderCard';


const sample = [
    {
        id: 123456,
        status: "Delivered",
        date: "2025-04-25",
        total: 1299,
        items: [
            { name: "Aam Ka Achar", quantity: 2 },
            { name: "Masala Papad", quantity: 1 },
        ],
    },
    {
        id: 123457,
        status: "Processing",
        date: "2025-04-29",
        total: 499,
        items: [
            { name: "Nimbu Achar", quantity: 1 },
        ],
    },
];




const MyOrders = () => {
    const dispatch: AppDispatch = useDispatch();
    // const dispatch = useDispatch();
    const [orders, setOrders] = useState([]);
    const user = JSON.parse(Cookies.get("user") || "");
    const userId = user?.data?.id;
    useEffect(() => {
        if (!userId) {
            console.error("User ID not found in cookies");
            return;
        }
        dispatch(fetchOrder(userId))
            // .unwrap()
            .then((response) => {
                console.log("Orders fetched successfully:", response);
                setOrders(response.payload)
            })
            .catch((error) => {
                console.error("Error fetching orders:", error.message);
            });

    }, [])


    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">My Orders</h1>
            {orders.length > 0 ? (
                <OrderCard orders={orders} />
            ) : (
                <div className="text-center mt-4">
                    <h2 className="text-xl font-semibold">No Orders Found</h2>
                    <p className="text-gray-500">You have no orders yet.</p>
                </div>
            )}
            {/* <p>You have no orders yet.</p> */}
        </div>
    );
}

export default MyOrders;