import Image from "next/image"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { addCart, addCartItem, addToCart, removeFromCart, updateQuantity } from "@/lib/redux/slices/cartSlice"
import type { AppDispatch, RootState } from "@/lib/redux/store"
import { Minus, Plus } from "lucide-react"
import Cookies from "js-cookie"
import { deleteProduct } from "@/lib/redux/slices/productsSlice"
import { useState } from "react";
import AddProductModal from "./AddProductModal";
import { IExtendedProduct } from "@/lib/interfaces"
import toast from 'react-hot-toast';

export default function ProductCard({ product }: { product: IExtendedProduct }) {
  const dispatch = useDispatch<AppDispatch>()
  const cartItem = useSelector((state: RootState) => state.cart.items && state.cart.items.find((item) => item.id === product.id))
  const userCookie = JSON.parse(Cookies.get("user") || "{}");
  const user_role = userCookie?.role;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IExtendedProduct | null>(null);

  const handleAddToCart = async () => {
    try {
      toast.loading("Please Wait...");
      const cart = await dispatch(addCart()).unwrap();

      const item = await dispatch(
        addCartItem({ cart_id: cart.id, product_id: product.id, quantity: 1 })
      ).unwrap();

      dispatch(addToCart({ product, quantity: 1 }))
      toast.dismiss();
      toast.success("Added to cart!");
    } catch (err) {
      toast.dismiss();
      toast.error("Could not add to cart");
    }
  };

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ id: product.id, quantity: newQuantity }))
    } else {
      dispatch(removeFromCart(product.id))
    }
  }

  const handleUpdate = () => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    dispatch(deleteProduct(id));
  };

  return (
    <div>
      <Card>
        <CardHeader className="!p-[0px] !pb-6">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={200}
            height={200}
            className="w-full h-[13rem] object-cover rounded-t-lg"
          />
        </CardHeader>
        <CardContent>
          <CardTitle className="capitalize">{product.name}</CardTitle>
          <p className="text-muted-foreground mt-1">₹{product.price.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground mt-2 capitalize">Seller: {product.user.name}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          {user_role === "SELLER" ? (
            <div className="flex gap-4 items-center w-full justify-center">
              <Button size={"lg"} onClick={handleUpdate}>
                Update
              </Button>
              <Button variant="destructive" size={"lg"} onClick={() => handleDelete(product.id)}>
                Delete
              </Button>
            </div>
          ) :
            <Button variant="outline" asChild>
              <Link href={`/products/${product.id}`}>View Details</Link>
            </Button>
          }
          {
            cartItem && user_role !== "SELLER" ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => handleUpdateQuantity(cartItem.quantity - 1)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="mx-2">{cartItem.quantity}</span>
                <Button variant="outline" size="icon" onClick={() => handleUpdateQuantity(cartItem.quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : user_role !== "SELLER" ? (
              <Button onClick={handleAddToCart}>Add to Cart</Button>
            ) : null
          }
        </CardFooter>
      </Card>

      {/* AddProductModal for updating */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  )
}

