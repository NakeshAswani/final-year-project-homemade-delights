"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchProducts, setSearchQuery, setSortOrder } from "@/lib/redux/slices/productsSlice";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import ProductCard from "@/app/components/common/ProductCard";
import { Loader2 } from "lucide-react";

export default function ProductsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: products, loading, error, searchQuery, sortOrder } = useSelector(
    (state: RootState) => state.products
  );

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleSortChange = (value: string) => {
    dispatch(setSortOrder(value));
  };

  // **Filter & Sort Products**
  const filteredProducts = products?.length ? products
    .filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortOrder) {
        case "price-low-high":
          return a.price - b.price;
        case "price-high-low":
          return b.price - a.price;
        case "name-a-z":
          return a.name.localeCompare(b.name);
        case "name-z-a":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    }) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-100 w-full h-screen">
        <Loader2 className="animate-spin h-16 w-16 text-gray-950" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>

      {/* Search & Sort */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <Input
          type="search"
          placeholder="Search products..."
          className="w-full md:w-64 mb-4 md:mb-0"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <Select onValueChange={handleSortChange}>
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

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.length ? (
          filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <p className="text-center col-span-full">Out Of Stock! Sorry For The Inconvenience...</p>
        )}
      </div>
    </div>
  );
}