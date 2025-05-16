"use client"

import { useSelector, useDispatch } from "react-redux"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fetchCartItems, removeFromCart, removeItemFromCart, updateQuantity } from "@/lib/redux/slices/cartSlice"
import type { RootState, AppDispatch } from "@/lib/redux/store"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import Loader from "../components/common/Loader"
import toast from 'react-hot-toast';

export default function CartPage() {
  const dispatch = useDispatch<AppDispatch>()
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchCartItems()).finally(() => setPageLoading(false));
  }, [])

  const total = Array.isArray(cartItems)
    ? cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : 0;

  const handleUpdateQuantity = (id: number, newQuantity: number, cartItemId?: number) => {
    if (cartItemId) {
      try {
        if (newQuantity > 0) {
          dispatch(updateQuantity({ id, quantity: newQuantity }))
        } else {
          dispatch(removeFromCart(id))
          dispatch(removeItemFromCart({ product_id: cartItemId, deleteItem: true }))
        }
      } catch (error) {
        toast.error("Unable To Update Quantity!")
      }
    } else {
      toast.error("Unable To Update Quantity!")
    }
  }

  const handleRemoveItem = (id: number, cartItemId?: number) => {
    if (cartItemId) {
      const toastId = toast.loading("Please Wait...");

      dispatch(removeItemFromCart({ product_id: cartItemId, deleteItem: true }))
        .then((result) => {
          if (removeItemFromCart.rejected.match(result)) {
            toast.error("Failed to remove item", { id: toastId });
            return;
          }

          dispatch(fetchCartItems())
          .then(() => {
            dispatch(removeFromCart(id));
            toast.success("Item Removed From Cart!", { id: toastId });
          })
        });
    } else {
      toast.error("Failed to remove item");
    }
  };

  if (pageLoading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8 capitalize">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      {Array.isArray(cartItems) && cartItems?.length ?
        (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cartItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="sm:flex items-center">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={50}
                          height={50}
                          className="rounded mr-4"
                        />
                        {item.name}
                      </div>
                    </TableCell>
                    <TableCell>₹{item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.cartItemId)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="mx-2">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.cartItemId)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant='outline' className="hover:bg-red-500" onClick={() => handleRemoveItem(item.id, item.cartItemId)}>
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-6 flex justify-between items-center">
              <p className="text-xl font-bold">Total: ₹{total.toFixed(2)}</p>
              <Button asChild>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </div>
          </>
        )
        :
        (
          <p>
            Your cart is empty.{" "}
            <Link href="/products" className="text-primary hover:underline">
              Continue shopping
            </Link>
          </p>
        )
      }
    </div>
  )
}

