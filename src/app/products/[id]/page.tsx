"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ShoppingCart } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/lib/redux/store"
import { addCart, addCartItem, addToCart } from "@/lib/redux/slices/cartSlice"
import { fetchProducts, fetchSingleProduct } from "@/lib/redux/slices/productsSlice"
import { useParams } from "next/navigation"
import Loader from "@/app/components/common/Loader"
import FeaturedProducts from "@/app/components/products/FeaturedProducts"
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const [quantity, setQuantity] = useState(1)
  const dispatch = useDispatch<AppDispatch>();
  const id = Number(useParams().id);

  const { items: products, loading } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    dispatch(fetchSingleProduct(id));

    !products?.length ? dispatch(fetchProducts()) : null;
  }, [dispatch, id]);

  const product = useSelector((state: RootState) => state.products.items.find((item) => item.id === id));

  const handleAddToCart = async () => {
    try {
      const cart = await dispatch(addCart()).unwrap();

      const item = product && await dispatch(
        addCartItem({ cart_id: cart.id, product_id: product.id, quantity: 1 })
      ).unwrap();

      product && dispatch(addToCart({ product, quantity: 1 }))
      toast.success("Added to cart!");
    } catch (err) {
      toast.error("Could not add to cart");
    }
  };

  if (!product || loading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 py-8 capitalize">
      <div className="grid md:grid-cols-2 gap-8 pb-12">
        <div className="flex items-center justify-center">
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
          <p className="text-xl text-muted-foreground mb-4">by {product?.user?.name}</p>
          <div className="flex items-center mb-4">
          </div>
          <p className="text-2xl font-bold mb-4">₹{product.price.toFixed(2)}</p>
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
      <FeaturedProducts products={products} />
    </div>
  )
}

