"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { fetchProducts } from "@/lib/redux/slices/productsSlice";
import { useEffect } from "react";
import Loader from "./components/common/Loader";
import ProductCard from "./components/common/ProductCard";

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: products, loading, error } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    !products?.length ? dispatch(fetchProducts()) : null;
  }, [dispatch]);

  if (loading) {
    return <Loader />
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
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : <div className="text-xl">Out Of Stock! Sorry For The Inconvenience...</div>
        }
      </section>
    </div>
  );
}