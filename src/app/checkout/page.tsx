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
import Loader from "../components/common/Loader";
import { IExtendedUser } from "@/lib/interfaces";
import { capitalizeWords } from "@/lib/utils";

const CheckoutPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const total = cartItems && cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "" });

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (!userCookie) {
      router.push("/signin");
      return;
    }

    const user = JSON.parse(userCookie)?.data as IExtendedUser;
    const { name, email, addresses } = user;

    setFormData({ name, email });

    // Select the first available address by default
    if (addresses.length > 0) {
      setSelectedAddress(addresses[0]);
    }

    setPageLoading(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress) {
      toast.error("Please select a shipping address.");
      return;
    }
    toast.loading("Placing Order...")
    setLoading(true);

    cartItems && total && dispatch(addOrder({
      cartItems,
      total,
      ...formData,
      address_id: selectedAddress.id,
    }))
      .then((result) => {
        if (addOrder.fulfilled.match(result)) {
          dispatch(setOrder(result.payload));
          dispatch(clearCart());
          router.push("/myorders");
          toast.dismiss();
          toast.success("Thank you for your order!");
        } else {
          toast.dismiss();
          toast.error("Failed to place order");
        }
      })
      .catch(() => {
        toast.dismiss();
        toast.error("Failed to place order")
      })
      .finally(() => setLoading(false));
  };

  if (pageLoading) return <Loader />;

  return (
    <div className="px-4 py-10 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">Checkout</h1>

        <div className="space-y-8">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>

            <div className="divide-y">
              {cartItems && Array.isArray(cartItems) && cartItems?.length && cartItems?.map((item) => (
                <div key={item.id} className="py-3 flex justify-between text-sm">
                  <div>
                    <span className="font-bold capitalize">{item.name}</span>
                    <span className="ml-2 text-gray-500">(Qty: {item.quantity})</span>
                  </div>
                  <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4 text-lg font-bold flex justify-between">
              <span>Total</span>
              <span>₹{total && total.toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Shipping Address</h2>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="text-sm bg-black hover:bg-gray-800 text-white"
              >
                {selectedAddress ? "Change Address" : "Add Address"}
              </Button>
            </div>

            {selectedAddress ? (
              <div className="p-4 border rounded bg-gray-50 text-sm leading-6">
                <p>{selectedAddress.address}</p>
                <p>{selectedAddress.city}, {selectedAddress.state}</p>
                <p>{selectedAddress.country} - {selectedAddress.pincode}</p>
              </div>
            ) : (
              <p className="text-gray-500">No address selected. Please add an address.</p>
            )}
          </div>

          {/* Contact Info & Place Order */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="text-2xl font-semibold mb-2">Contact Info</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={capitalizeWords(formData.name)}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={loading}
              >
                {loading ? "Placing Order..." : "Place Order"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <AddressDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSelect={(address) => {
          setSelectedAddress(address);
          setIsDialogOpen(false);
        }}
      />
    </div>
  );
};

export default CheckoutPage;