import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import React from 'react';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/redux/store';
import { fetchOrder, updateOrderStatus } from '@/lib/redux/slices/orderSlice';
import { IExtendedOrder } from '@/lib/interfaces';
import toast from 'react-hot-toast';

const OrderCard = ({ orders, setOrders }: { orders: IExtendedOrder[]; setOrders: any }) => {
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

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        try {
            toast.loading("Please Wait...");
            await dispatch(updateOrderStatus({ order_id: orderId, order_status: newStatus }));
            const user = JSON?.parse(Cookies.get("user") || "");
            const userId = user?.id;
            if (userId) {
                const newOrders = await dispatch(fetchOrder(userId));
                if (newOrders?.payload?.length) {
                    setOrders(newOrders?.payload);
                    toast.dismiss();
                    toast.success("Status Updated!");
                } else {
                    toast.dismiss();
                    toast.error("Unable To Update Order Status!");
                }
            } else {
                toast.dismiss();
                toast.error("Unable To Update Order Status!");
            }
        } catch (error) {
            toast.dismiss();
            toast.error("Unable To Update Order Status!");
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 capitalize">
            <div className="space-y-6">
                {Array.isArray(orders) && orders?.map((order) => {
                    const total = order?.orderItems.reduce((sum, item) => {
                        return sum + item.quantity * item.product.price;
                    }, 0);

                    return (
                        <Card key={order.id} className="shadow-lg hover:shadow-xl transition-shadow duration-200">
                            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-6 py-4 bg-gray-50">
                                <CardTitle className="text-lg font-semibold text-gray-800">Order ID: {order.id}</CardTitle>
                                <Badge
                                    className={`${statusColor(order.order_status)} rounded-full px-3 py-1 uppercase tracking-wide text-xs font-semibold`}
                                >
                                    {order.order_status}
                                </Badge>
                            </CardHeader>
                            <Separator className="bg-gray-100" />
                            <CardContent className="px-6 py-4 space-y-4">
                                <div>
                                    <h3 className="font-medium text-gray-700 mb-3">Items:</h3>
                                    <ul className="space-y-4">
                                        {order?.orderItems?.length &&
                                            order?.orderItems?.map((item, i) => (
                                                <li
                                                    key={i}
                                                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <img
                                                            src={item.product.image}
                                                            alt={item.product.name}
                                                            className="w-12 h-12 rounded-lg border object-cover"
                                                        />
                                                        <span className="font-semibold text-gray-800">{item.product.name}</span>
                                                    </div>
                                                    <div className="text-gray-600">
                                                        <span className="font-medium">
                                                            {item.quantity} × ₹{item.product.price.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </li>
                                            ))}
                                    </ul>
                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                                        <span className="font-medium text-gray-700">Total:</span>
                                        <span className="text-lg font-semibold text-gray-900">₹{total.toFixed(2)}</span>
                                    </div>
                                </div>
                                {user_role === "SELLER" && (
                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <label
                                                htmlFor={`status-${order.id}`}
                                                className="font-medium text-gray-700"
                                            >
                                                Update Order Status:
                                            </label>
                                            <select
                                                id={`status-${order.id}`}
                                                className="w-full sm:w-48 border-gray-300 rounded-md shadow-sm px-4 py-2 
                                                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                                          transition-all text-sm"
                                                value={order.order_status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="APPROVED">Approved</option>
                                                <option value="DELIVERED">Delivered</option>
                                                <option value="CANCELLED">Cancelled</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderCard;