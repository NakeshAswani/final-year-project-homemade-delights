"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Star, ShoppingCart } from "lucide-react"

// This is a mock product. In a real app, you'd fetch this data from your API
const product = {
  id: 1,
  name: "Homemade Mango Pickle",
  price: 9.99,
  image: "/placeholder.svg?height=400&width=400",
  seller: "Aarti's Kitchen",
  description:
    "A delicious, tangy mango pickle made with love using a traditional family recipe. Perfect accompaniment for your meals.",
  rating: 4.5,
  reviews: 28,
}

export default function ProductDetailPage() {
  const [quantity, setQuantity] = useState(1)

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
          <p className="text-xl text-muted-foreground mb-4">by {product.seller}</p>
          <div className="flex items-center mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
              />
            ))}
            <span className="ml-2 text-muted-foreground">({product.reviews} reviews)</span>
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
            <Button size="lg">
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

