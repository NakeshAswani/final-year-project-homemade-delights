"use client";
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/redux/store';
import { fetchOrder } from '@/lib/redux/slices/orderSlice';
import OrderCard from '../components/common/OrderCard';
import toast from 'react-hot-toast';
import { IExtendedOrder } from '@/lib/interfaces';
import { useRouter } from 'next/navigation';
import Loader from '../components/common/Loader';

const MyOrders = () => {
    const dispatch: AppDispatch = useDispatch();
    const [orders, setOrders] = useState<IExtendedOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const user = JSON?.parse(Cookies.get("user") || "");
        const userId = user?.data?.id;
        if (!userId) {
            router.push("/signin");
            return;
        }
        dispatch(fetchOrder(userId))
            .then((response) => {
                response.payload ? setOrders(response.payload as IExtendedOrder[]) : toast.error("Error fetching orders")
                setLoading(false);
            })
            .catch((error) => {
                toast.error("Error fetching orders")
            });

    }, [])

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-12">My Orders</h1>
            {Array.isArray(orders) ? (
                <OrderCard orders={orders} />
            ) : (
                <div className="text-center mt-4">
                    <h2 className="text-xl font-semibold">No Orders Found</h2>
                    <p className="text-gray-500">You have no orders yet.</p>
                </div>
            )}
        </div>
    );
}

export default MyOrders;