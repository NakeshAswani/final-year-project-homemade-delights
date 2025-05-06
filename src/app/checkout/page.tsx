"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearCart } from "@/lib/redux/slices/cartSlice";
import { RootState, AppDispatch } from "@/lib/redux/store";
// import AddressDialog from "@/components/AddressDialog";
// import AddressDialog from "@/components/common/AddressDialog";
import Cookies from "js-cookie";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import AddressDialog from "../components/common/AddressDialog";
import { addOrder, setOrder } from "@/lib/redux/slices/orderSlice";
import { useRouter } from "next/navigation";

const CheckoutPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router=useRouter()
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [orderData, setOrderData] = useState<any>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  const userCookie = Cookies.get("user");
  if (!userCookie) {
    return <p>User not logged in</p>;
  }

  const user = JSON.parse(userCookie);
  const { id: userId, email, name } = user.data;

  const [formData, setFormData] = useState({
    name: name,
    email: email,
    cardNumber: "",
    expirationDate: "",
    cvv: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress) {
      alert("Please select a shipping address.");
      return;
    }
    console.log('selectedAddress:', selectedAddress);
    setOrderData({
      items: cartItems,
      total,
      ...formData,
      shippingAddress: selectedAddress,
    });

    console.log("Order submitted", {
      items: cartItems,
      total,
      ...formData,
      shippingAddress: selectedAddress,
    });
    dispatch(addOrder({
      cartItems: cartItems,
      total,
      ...formData,
      shippingAddress: selectedAddress,
    })).then((result) => {
      if (addOrder.fulfilled.match(result)) {
        console.log("Order placed successfully:", result.payload);
        dispatch(setOrder(result.payload));
        router.push("/myorders")
        dispatch(clearCart());
        alert("Thank you for your order!");
      } else {
        console.error("Failed to place order:", result.payload);
      }
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
                <span>${total.toFixed(2)}</span>
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
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input 
                type="text"
                 name="cardNumber"
                  id="cardNumber"
                   value={formData.cardNumber} 
                   onChange={handleInputChange}
                    required />
              </div>
              <div>
                <Label htmlFor="expirationDate">Expiration Date</Label>
                <Input 
                type="text"
                 name="expirationDate"
                  id="expirationDate"
                   placeholder="MM/YY"
                    value={formData.expirationDate}
                     onChange={handleInputChange}
                      required />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input 
                type="password" 
                name="cvv" 
                id="cvv" 
                value={formData.cvv} 
                onChange={handleInputChange} 
                maxLength={3} 
                required />
              </div>

              <div className="col-span-1 md:col-span-2 mt-4 flex justify-end">
                <Button type="submit" className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white">
                  Place Order
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Address Dialog */}
      <AddressDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSelect={(address: { address: string; city: string; state: string; country: string; pincode: number }) => {
          setSelectedAddress({
            ...address,
            pincode: String(parseInt(String(address.pincode), 10)), // Ensure pincode is a string
          });
          setIsDialogOpen(false);
        }}
      />
    </div>
  );
};

export default CheckoutPage;



// const AddAddress = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  
//   const dispatch = useDispatch<AppDispatch>()
//   const userCookie = Cookies.get("user");
//   if (!userCookie) {
//     return ("User not logged in");
//   }
//   const user = JSON.parse(userCookie);
//   const userId = user.data.id;
//   const [address, setAddress] = useState({
//     address: "",
//     city: "",
//     state: "",
//     country: "",
//     pincode: "",
//     user_id: 0 // Added user_id with a default value
//   })
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setAddress({ ...address, [e.target.name]: e.target.value })
//   }

//   let addressData;

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     const updatedAddress = {
//       ...address,
//       user_id: userId,
//       pincode: parseInt(address.pincode, 10), // Convert pincode to an integer
//     };
//     console.log("Dispatching address:", updatedAddress);
    
//     try {
//       const resultAction = await dispatch(addAddress(updatedAddress));
//       console.log("Result Action:", resultAction);
      
//       if (addAddress.fulfilled.match(resultAction)) {
//         console.log("Address added successfully:", resultAction.payload);
//         onClose(); // Close the dialog
//       } else {
//         console.error("Failed to add address:", resultAction.payload);
//       }
//     } catch (error) {
//       console.error("Error adding address:", error);
//     }
//     onClose(); // Close the dialog after submission
//   };
//   // console.log('address:', address);
//   // console.log('addressData:', addressData);


//   return (
//     <div>
//       <Dialog open={open} onOpenChange={onClose}>
//         <DialogContent
//           className="w-full max-w-sm mx-auto p-4 sm:p-6 md:p-8 rounded-lg bg-white overflow-y-auto"
//           style={{ maxHeight: "90vh" }}> {/* Limited width and height for responsiveness */}
//           <DialogHeader>
//             <DialogTitle className="text-center text-lg font-semibold">Add Address</DialogTitle>
//           </DialogHeader>
//           <form className="grid gap-4" onSubmit={handleSubmit}>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
//               <Label htmlFor="address" className="block mb-1">Address</Label>
//               <Input id="address" name="address" required onChange={handleInputChange} />
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
//               <Label htmlFor="city" className="block mb-1">City</Label>
//               <Input id="city" name="city" required onChange={handleInputChange} />
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
//               <Label htmlFor="state" className="block mb-1">State</Label>
//               <Input id="state" name="state" required onChange={handleInputChange} />
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
//               <Label htmlFor="country" className="block mb-1">Country</Label>
//               <Input id="country" name="country" required onChange={handleInputChange} />
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
//               <Label htmlFor="pincode" className="block mb-1">Pincode</Label>
//               <Input id="pincode" name="pincode" required onChange={handleInputChange} />
//             </div>
//             <div className="flex justify-end mt-4">
//               <Button variant="outline" onClick={onClose} className="mr-2">Cancel</Button>
//               <Button type="submit" className="bg-black text-white py-2 px-4 rounded-lg">Save Address</Button>
//             </div>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }

  // "use client";
  
  // import type React from "react"
  
  // import { use, useEffect, useState } from "react"
  // import { useSelector, useDispatch } from "react-redux"
  // import { Button } from "@/components/ui/button"
  // import { Input } from "@/components/ui/input"
  // import { Label } from "@/components/ui/label"
  // // import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
  // import { clearCart } from "@/lib/redux/slices/cartSlice"
  // import type { RootState } from "@/lib/redux/store"
  // import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
  // import { addAddress, fetchAddress } from "@/lib/redux/slices/addressSlice"
  // import Cookies from "js-cookie";
  // import { createAsyncThunk } from "@reduxjs/toolkit";
  // import axiosInstance from "@/lib/axiosInstance";
  // import { on } from "events";
  // import { AppDispatch } from "@/lib/redux/store";
  
  
  
  // export default function CheckoutPage() {
  
  //   const dispatch: AppDispatch = useDispatch();
  //   const cartItems = useSelector((state: RootState) => state.cart.items)
  //   const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  //   const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  //   const userCookie = Cookies.get("user");
  //   if (!userCookie) {
  //     return ("User not logged in");
  //   }
  
  //   const user = JSON.parse(userCookie);
  //   console.log('user:', user);
  //   const userId = user.data.id;
  //   const email = user.data.email;
  //   const name = user.data.name;
  
  //   const [formData, setFormData] = useState({
  //     name: name,
  //     email: email,
  //     address: "",
  //     city: "",
  //     zipCode: "",
  //     cardNumber: "",
  //     expirationDate: "",
  //     cvv: "",
  //   });
  
  //   let addressData;
  //   useEffect(() => {
  //     addressData = dispatch(fetchAddress(userId)).then((result) => {
  //       if (fetchAddress.fulfilled.match(result)) {
  //         addressData = result.payload;
  //         console.log("Fetched address data:", addressData);
  //       } else {
  //         console.error("Failed to fetch address:", result.payload);
  //       }
  //     }
  //     ).catch((error) => {
  //       console.error("Error fetching address:", error);
  //     })
  //   }, [userId])
  //   console.log('address:', addressData);
  
  //   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     setFormData({ ...formData, [e.target.name]: e.target.value })
  //   }
  
  //   const handelCloseDialog = () => {
  //     setIsDialogOpen(!isDialogOpen)
  //   }
  
  //   const handleSubmit = (e: React.FormEvent) => {
  //     e.preventDefault()
  //     // Here you would typically send the order to your backend
  //     console.log("Order submitted", { items: cartItems, total, ...formData })
  //     // Clear the cart after successful order
  //     dispatch(clearCart())
  //     // Redirect to a thank you page or show a success message
  //     alert("Thank you for your order!")
  //   }
  
  
  //   return (
  //     <div className="px-4 py-8 min-h-screen">
  //       <div className="max-w-7xl mx-auto">
  //         <h1 className="text-4xl font-bold text-center mb-6">Checkout</h1>
  //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  //           <div className="lg:col-span-1 bg-white rounded-2xl shadow-md p-6">
  //             <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
  //             {cartItems.map((item) => (
  //               <div key={item.id} className="flex justify-between mb-2">
  //                 <span>{item.name} x {item.quantity}</span>
  //                 <span>${(item.price * item.quantity).toFixed(2)}</span>
  //               </div>
  //             ))}
  //             <div className="border-t pt-2 mt-2">
  //               <div className="flex justify-between font-bold">
  //                 <span>Total</span>
  //                 <span>${total.toFixed(2)}</span>
  //               </div>
  //             </div>
  //           </div>
  
  //           <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
  //             <div className="flex justify-between items-center mb-6">
  //               <h2 className="text-2xl font-semibold">Payment Details</h2>
  //               <Button
  //                 type="button"
  //                 onClick={handelCloseDialog}
  //                 className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm">
  //                 + Add Address
  //               </Button>
  //             </div>
  
  //             <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
  //               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
  //                 <Label htmlFor="name" className="block mb-1">Full Name</Label>
  //                 <Input id="name" name="name" value={formData.name} required disabled />
  //               </div>
  //               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
  //                 <Label htmlFor="email" className="block mb-1">Email</Label>
  //                 <Input id="email" name="email" type="email" value={formData.email} required disabled />
  //               </div>
  
  
  //               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
  //                 <Label htmlFor="cardNumber" className="block mb-1">Card Number</Label>
  //                 <Input id="cardNumber" name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} required />
  //               </div>
  //               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
  //                 <Label htmlFor="expirationDate" className="block mb-1">Expiration Date</Label>
  //                 <Input id="expirationDate" name="expirationDate" placeholder="MM/YY" value={formData.expirationDate} onChange={handleInputChange} required />
  //               </div>
  //               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
  //                 <Label htmlFor="cvv" className="block mb-1">CVV</Label>
  //                 <Input id="cvv" name="cvv" placeholder="Enter the three digit code " type="password" maxLength={3} value={formData.cvv} onChange={handleInputChange} required />
  //               </div>
  //               <Button type="submit" className="w-full bg-black text-white py-3 rounded-lg text-lg hover:bg-gray-800 transition duration-200">
  //                 Place Order
  //               </Button>
  //             </form>
  //           </div>
  //         </div>
  //       </div>
  //       <AddAddress open={isDialogOpen} onClose={handelCloseDialog} />
  //     </div>
  //   )
  // }