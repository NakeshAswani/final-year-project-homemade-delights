"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearCart } from "@/lib/redux/slices/cartSlice";
import { RootState, AppDispatch } from "@/lib/redux/store";
import Cookies from "js-cookie";
import AddressDialog from "../components/common/AddressDialog";
import { addOrder, setOrder } from "@/lib/redux/slices/orderSlice";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import { Address } from "@prisma/client";

const CheckoutPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter()
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (!userCookie) {
      router.push("/signin");
      return;
    }

    const user = JSON.parse(userCookie);
    const { id: email, name } = user?.data;
    setFormData({ name, email })
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress) {
      toast.error("Please select a shipping address.");
      return;
    }
    setLoading(true);
    dispatch(addOrder({
      cartItems: cartItems,
      total,
      ...formData,
      address_id: selectedAddress.id,
    })).then((result) => {
      if (addOrder.fulfilled.match(result)) {
        dispatch(setOrder(result.payload));
        router.push("/myorders")
        dispatch(clearCart());
        toast.success("Thank you for your order!");
      } else {
        toast.error("Failed to place order");
      }
      setLoading(false);
    }).catch((err) => {
      toast.error("Failed to place order");
      setLoading(false);
    });

  };

  return (
    <div className="px-4 py-8 min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between mb-2">
                <span>{item.name} x {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Payment Details</h2>
              <Button
                type="button"
                onClick={() => setIsDialogOpen(true)}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm"
              >
                Manage Addresses
              </Button>
            </div>

            {selectedAddress && (
              <div className="mb-4 p-4 border rounded-md bg-gray-50">
                <h3 className="font-semibold mb-1">Shipping Address:</h3>
                <p>
                  {selectedAddress.address}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.country} - {selectedAddress.pincode}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required />
              </div>

              <div className="col-span-1 md:col-span-2 mt-4 flex justify-end">
                <Button type="submit" className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
                  {loading ? "Placing Order..." : "Place Order"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <AddressDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSelect={(address) => {
          setSelectedAddress({
            ...address,
            pincode: address.pincode
          });
          setIsDialogOpen(false);
        }}
      />
    </div>
  );
};

export default CheckoutPage;