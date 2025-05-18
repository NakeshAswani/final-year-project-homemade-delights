"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { fetchProducts } from "@/lib/redux/slices/productsSlice";
import { useEffect } from "react";
import Loader from "./components/common/Loader";
import FeaturedProducts from "./components/products/FeaturedProducts";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: products, loading, error } = useSelector((state: RootState) => state.products);
  const router = useRouter()

  const UserCookies = Cookies.get("user");
  const userData = UserCookies ? JSON.parse(UserCookies) : null;
  const user_role = userData?.role;

  useEffect(() => {
    user_role === "SELLER" ? router.push("/products") : null;
    !products?.length ? dispatch(fetchProducts()) : null;
  }, [dispatch]);

  if (loading || user_role === "SELLER") {
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

      <FeaturedProducts products={products} />
    </div>
  );
}