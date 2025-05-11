import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Order } from '@prisma/client';
import React from 'react';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/redux/store';
import { updateOrderStatus } from '@/lib/redux/slices/orderSlice';

const OrderCard = ({ orders }: { orders: Order[] }) => {
    const dispatch = useDispatch<AppDispatch>();
    const user = JSON.parse(Cookies.get("user") || "");
    const user_role = user?.role;

    const statusColor = (status: string) => {
        switch (status) {
            case "DELIVERED":
                return "bg-green-100 text-green-700";
            case "PENDING":
                return "bg-yellow-100 text-yellow-700";
            case "CANCELLED":
                return "bg-red-100 text-red-700";
            case "APPROVED":
                return "bg-blue-100 text-blue-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const handleStatusChange = (orderId: number, newStatus: string) => {
        dispatch(updateOrderStatus({ order_id: orderId, order_status: newStatus }));
    };

    return (
        <div>
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="space-y-4">
                    {orders.map((order) => {
                        const total = order?.orderItems.reduce((sum, item) => {
                            return sum + item.quantity * item.product.price;
                        }, 0);

                        return (
                            <Card key={order.id}>
                                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                    <CardTitle className="text-base font-medium">Order #{order.id}</CardTitle>
                                    <Badge className={statusColor(order.order_status)}>{order.order_status}</Badge>
                                </CardHeader>
                                <Separator />
                                <CardContent className="text-sm space-y-2">
                                    <div>
                                        <span className="font-medium">Items:</span>
                                        <ul className="list-disc list-inside">
                                            {order?.orderItems.length &&
                                                order?.orderItems.map((item, i) => (
                                                    <div className="flex items-center my-2" key={i}>
                                                        <div className="flex items-center">
                                                            <img
                                                                src={item.product.image}
                                                                alt={item.product.name}
                                                                className="w-10 h-10 rounded-md mr-2"
                                                            />
                                                            <span className="font-medium">{item.product.name}</span>
                                                        </div>
                                                        <div className="flex items-center ml-auto">
                                                            <span>
                                                                {item.quantity} x {item.product.price}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                        </ul>
                                        <div className="flex items-center justify-end mt-4">
                                            <span className="font-medium text-right">Total:</span> ₹{total.toFixed(2)}
                                        </div>
                                    </div>
                                    {user_role === "seller" && (
                                        <div className="mt-4">
                                            <label htmlFor={`status-${order.id}`} className="font-medium">
                                                Update Status:
                                            </label>
                                            <select
                                                id={`status-${order.id}`}
                                                className="ml-2 border rounded p-1"
                                                value={order.order_status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="APPROVED">Approved</option>
                                                <option value="DELIVERED">Delivered</option>
                                                <option value="CANCELLED">Cancelled</option>
                                            </select>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default OrderCard;