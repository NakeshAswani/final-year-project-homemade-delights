"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchProducts, setSearchQuery, setSortOrder } from "@/lib/redux/slices/productsSlice";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import ProductCard from "@/app/components/common/ProductCard";
import Loader from "../components/common/Loader";

export default function ProductsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: products, loading, error, searchQuery, sortOrder } = useSelector(
    (state: RootState) => state.products
  );

  const [selectedCity, setSelectedCity] = useState<string>(""); // State for selected city

  useEffect(() => {
    !products?.length ? dispatch(fetchProducts()) : null;
  }, [dispatch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleSortChange = (value: string) => {
    dispatch(setSortOrder(value));
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
  };

  // **Extract Unique Cities**
  const cities = Array.from(new Set(products.map((product) => product?.city))).filter(Boolean);

  // **Filter & Sort Products**
  const filteredProducts = products
    ?.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((product) => (selectedCity !== "all" ? product?.city === selectedCity : true)) // Check for "all"
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
    });

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>

      {/* Search, Sort & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <Input
          type="search"
          placeholder="Search products..."
          className="w-full md:w-64"
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
        <Select onValueChange={handleCityChange}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Filter by City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem> {/* Use "all" instead of an empty string */}
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.length ? (
          filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <p className="text-center col-span-full">Out Of Stock! Sorry For The Inconvenience...</p>
        )}
      </div>
    </div>
  );
}