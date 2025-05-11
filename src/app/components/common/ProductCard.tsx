import Image from "next/image"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { addCartItem, addToCart, removeFromCart, updateQuantity } from "@/lib/redux/slices/cartSlice"
import type { AppDispatch, RootState } from "@/lib/redux/store"
import { Minus, Plus } from "lucide-react"
import { IProduct } from "@/lib/interfaces"
import Cookies from "js-cookie"
import { deleteProduct } from "@/lib/redux/slices/productsSlice"
import { useState } from "react";
import AddProductModal from "./AddProductModal";

interface HandleDelete {
  (id: number): void;
}

export default function ProductCard({ product }: { product: IProduct }) {
  const dispatch = useDispatch<AppDispatch>()
  const cartItem = useSelector((state: RootState) => state.cart.items.find((item) => item.id === product.id))
  const userCookie = JSON.parse(Cookies.get("user") || "{}");
  const user_role = userCookie.role;
  const user_id = userCookie.id;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity: 1 }))
    dispatch(addCartItem({ product_id: product.id, quantity: 1 }))
  }

  const handleUpdateQuantity = (newQuantity: number) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ id: product.id, quantity: newQuantity }))
    } else {
      dispatch(removeFromCart(product.id))
    }
  }

  const handleUpdate = () => {
    setSelectedProduct(product); // Set the product to be updated
    setIsModalOpen(true); // Open the modal
  };

  const handleDelete: HandleDelete = (id) => {
    dispatch(deleteProduct(id));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={200}
            height={200}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        </CardHeader>
        <CardContent>
          <CardTitle className="capitalize">{product.name}</CardTitle>
          <p className="text-muted-foreground mt-1">₹{product.price.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground mt-2 capitalize">Seller: {product.user.name}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/products/${product.id}`}>View Details</Link>
          </Button>
          {user_role === "seller" ? (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleUpdate}>
                Update
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(product.id)}>
                Delete
              </Button>
            </div>
          ) : cartItem ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => handleUpdateQuantity(cartItem.quantity - 1)}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="mx-2">{cartItem.quantity}</span>
              <Button variant="outline" size="icon" onClick={() => handleUpdateQuantity(cartItem.quantity + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={handleAddToCart}>Add to Cart</Button>
          )}
        </CardFooter>
      </Card>

      {/* AddProductModal for updating */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
      />
    </>
  )
}

