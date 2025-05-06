import Image from "next/image"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { addCartItem, addToCart, removeFromCart, updateQuantity } from "@/lib/redux/slices/cartSlice"
import type { AppDispatch, RootState } from "@/lib/redux/store"
import { Minus, Plus } from "lucide-react"
import { IProduct } from "@/lib/interfaces"

export default function ProductCard({ product }: { product: IProduct }) {
  const dispatch = useDispatch<AppDispatch>()
  const cartItem = useSelector((state: RootState) => state.cart.items.find((item) => item.id === product.id))

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

  return (
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
        {cartItem ? (
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
  )
}

