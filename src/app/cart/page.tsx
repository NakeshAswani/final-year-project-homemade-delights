"use client"

import { useSelector, useDispatch } from "react-redux"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { addCart, addCartItem, clearCart, fetchCartItems, removeFromCart, updateQuantity } from "@/lib/redux/slices/cartSlice"
import type { RootState, AppDispatch } from "@/lib/redux/store"
import { Minus, Plus } from "lucide-react"
import { use, useEffect, useState } from "react"
import { CartItem } from "@prisma/client"

export default function CartPage() {
  const dispatch = useDispatch<AppDispatch>()
  // const cartItems2 = useSelector((state: RootState) => state.cart.items)
  const cartItems = useSelector((state: RootState) => state.cart.items)
  // const [cartData, setCartData] = useState({})
  // const [cartData, setCartData] = useState<CartItem[]>([]);
  // const cartItemsFromRedux = useSelector((state: RootState) => state.cart.items);
  // console.log("Redux cartItems:", cartItemsFromRedux);
  console.log('cartItems', cartItems);


  // Then, update your state based on this
  // useEffect(() => {
  //   setTimeout(() => {
  //     dispatch(fetchCartItems())
  //       .unwrap()
  //       .then((data) => {
  //         console.log("📦 Data passed to setCartData:", data);
  //         setCartData(data);  // Ensure it's a fresh array
  //       });
  //   }, 1000);
  // }, [dispatch]);

  // useEffect(() => {
  //   console.log("✅ Final updated cartData:", cartData);
  // }, [cartData]);


  // useEffect(() => {
  //   dispatch(fetchCartItems())
  //     .unwrap()
  //     .then((response) => {
  //       console.log('Full response:', response); // <- This includes status, message, and data
  //       const data = response.data.cartItems; // <-- Extract only the useful payload
  //       console.log('Data passed to setCartData:', data);
  //       setCartData(data); // Now cartData = { id, user_id, cartItems }
  //     })
  //     .catch((error) => {
  //       console.error('Error fetching cart items:', error);
  //     });
  // }, [dispatch]);

  // useEffect(() => {
  //   if (cartData.length > 0) {
  //     console.log("✅ Final updated cartData:", cartData);
  //   } else {
  //     console.log("⏳ cartData still empty or not updated yet.");
  //   }
  // }, [cartData]);

  const total = Array.isArray(cartItems)
    ? cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : 0;
  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ id, quantity: newQuantity }))
    } else {
      dispatch(removeFromCart(id))
    }
  }



  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>
          Your cart is empty.{" "}
          <Link href="/products" className="text-primary hover:underline">
            Continue shopping
          </Link>
        </p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>
                  <Button variant='ghost' className="hover:bg-red-500" onClick={() => dispatch(clearCart())}>
                    Clear Cart
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cartItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center">
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
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="mx-2">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant='ghost' className="hover:bg-red-500" onClick={() => dispatch(removeFromCart(item.id))}>
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-6 flex justify-between items-center">
            <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
            <Button asChild>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

