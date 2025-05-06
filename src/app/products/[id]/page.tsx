"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Star, ShoppingCart } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/lib/redux/store"
import { addCart, addCartItem, addToCart } from "@/lib/redux/slices/cartSlice"
import { fetchSingleProduct } from "@/lib/redux/slices/productsSlice"
import { useParams } from "next/navigation"

export default function ProductDetailPage() {
  const [quantity, setQuantity] = useState(1)
  const dispatch = useDispatch<AppDispatch>();
  const id = Number(useParams().id);

  // Fetch product data
  useEffect(() => {
    dispatch(fetchSingleProduct(id));
  }, [dispatch, id]);

  // Get product data from Redux store
  const product = useSelector((state: RootState) => state.products.items.find((item) => item.id === id));

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({ product, quantity }));
      dispatch(addCartItem({ product_id: product.id, quantity }));
    }
  }

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={400}
            height={400}
            className="w-full rounded-lg shadow-lg"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-xl text-muted-foreground mb-4">by {product?.user.name}</p>
          <div className="flex items-center mb-4">
            {/* {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
              />
            ))}
            <span className="ml-2 text-muted-foreground">({product.reviews} reviews)</span> */}
          </div>
          <p className="text-2xl font-bold mb-4">${product.price.toFixed(2)}</p>
          <p className="mb-6">{product.description}</p>
          <div className="flex items-center mb-6">
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number.parseInt(e.target.value))}
              className="w-20 mr-4"
            />
            <Button size="lg" onClick={() => handleAddToCart()}>
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
          </div>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Why buy from HomeMade Delights?</h3>
              <ul className="list-disc list-inside text-muted-foreground">
                <li>Support local home chefs</li>
                <li>Authentic homemade taste</li>
                <li>Fresh, preservative-free products</li>
                <li>Secure payments</li>
                <li>Fast delivery</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

