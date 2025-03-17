"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { addToCart } from "@/lib/redux/slices/cartSlice";
import { fetchProducts } from "@/lib/redux/slices/productsSlice";
import { useEffect } from "react";
import { Product } from "@/lib/interfaces";
import { Loader2 } from "lucide-react";

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: products, loading, error } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({ product, quantity: 1 }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-100 w-full h-screen">
        <Loader2 className="animate-spin h-16 w-16 text-gray-950" />
      </div>
    );
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
        {
          products?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardHeader>
                    <Link href={`/products/${product.id}`}>
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
                    <Button className="w-full" onClick={() => handleAddToCart(product)}>
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : <div className="text-xl">Out Of Stock! Sorry For The Inconvenience...</div>
        }
      </section>
    </div>
  );
}