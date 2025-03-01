"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchProducts } from "@/lib/redux/slices/productsSlice"
import type { AppDispatch, RootState } from "@/lib/redux/store"
import ProductCard from "@/app/components/common/ProductCard"

export default function ProductsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { items: products, status, error } = useSelector((state: RootState) => state.products)
  // console.log("products", products);

  const featuredProducts = [
    { id: 1, name: "Homemade Mango Pickle", price: 9.99, image: "/placeholder.jpg", seller: "Seller A", description: "Delicious homemade mango pickle." },
    { id: 2, name: "Spicy Garlic Papad", price: 4.99, image: "/placeholder.jpg", seller: "Seller B", description: "Crispy and spicy garlic papad." },
    { id: 3, name: "Traditional Lemon Pickle", price: 7.99, image: "/placeholder.jpg", seller: "Seller C", description: "Traditional lemon pickle with authentic taste." },
    { id: 4, name: "Crispy Masala Papad", price: 5.99, image: "/placeholder.jpg", seller: "Seller D", description: "Crispy papad with a blend of spices." },
  ]
  // useEffect(() => {
  //   if (status === "idle") {
  //     dispatch(fetchProducts())
  //   }
  // }, [status, dispatch])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "failed") {
    return <div>Error: {error}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <Input type="search" placeholder="Search products..." className="w-full md:w-64 mb-4 md:mb-0" />
        <Select>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price-low-high">Price: Low to High</SelectItem>
            <SelectItem value="price-high-low">Price: High to Low</SelectItem>
            <SelectItem value="name-a-z">Name: A to Z</SelectItem>
            <SelectItem value="name-z-a">Name: Z to A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

