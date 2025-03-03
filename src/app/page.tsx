'use client'
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/lib/redux/store"
import { addToCart } from "@/lib/redux/slices/cartSlice"

const featuredProducts = [
  { id: 1, name: "Homemade Mango Pickle", price: 9.99, image: "/placeholder.jpg" },
  { id: 2, name: "Spicy Garlic Papad", price: 4.99, image: "/placeholder.jpg" },
  { id: 3, name: "Traditional Lemon Pickle", price: 7.99, image: "/placeholder.jpg" },
  { id: 4, name: "Crispy Masala Papad", price: 5.99, image: "/placeholder.jpg" },
]

export default function Home() {
  const dispatch = useDispatch<AppDispatch>()
  // const cartItems = useSelector((state: RootState) => state.cart.items)
  const handleAddToCart = (product: any) => {
    console.log(product);
    dispatch(addToCart({ product, quantity: 1 }));
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Discover Authentic Homemade Delights</h1>
          <p className="text-xl text-muted-foreground">
            Support local home chefs and enjoy delicious homemade food items
          </p>
        </div>
        <div className="flex justify-center">
          <Link href="/products">
            <Button size="lg" className="text-lg">
              Explore Products
            </Button>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <Link href={`/products/${product.id}`} key={product.id}>
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                </Link>
              </CardHeader>
              <CardContent>
                <CardTitle>{product.name}</CardTitle>
                <p className="text-muted-foreground">${product.price.toFixed(2)}</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleAddToCart(product)}>Add to Cart</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

