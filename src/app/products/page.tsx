"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchProducts, setSearchQuery, setSortOrder } from "@/lib/redux/slices/productsSlice";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import ProductCard from "@/app/components/common/ProductCard";
import Loader from "../components/common/Loader";
import Cookies from "js-cookie";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddProductModal from "../components/common/AddProductModal";
import AddCategoryModal from "../components/common/AddCategoryModal";
import { capitalizeWords } from "@/lib/utils";

export default function ProductsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: products = [], loading, error, searchQuery, sortOrder } = useSelector(
    (state: RootState) => state.products
  );
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const UserCookies = Cookies.get("user");
  const userData = UserCookies ? JSON.parse(UserCookies) : null;
  const user_role = userData?.data?.role;

  useEffect(() => {
    if (!products.length) dispatch(fetchProducts());
  }, [dispatch, products?.length]);

  // Extract _only_ the city names from the first address of each user
  const cities = Array.from(
    new Set(
      products
        .map((p) => p.user.addresses?.[0]?.city) // grab .city
        .filter((c): c is string => Boolean(c))
    )
  );

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };
  const handleSortChange = (value: string) => {
    dispatch(setSortOrder(value));
  };
  const handleCityChange = (value: string) => {
    setSelectedCity(value);
  };

  // Apply search, city-filter, then sort
  const filteredProducts = products
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((p) =>
      selectedCity === "all"
        ? true
        : p.user.addresses?.[0]?.city === selectedCity
    )
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

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>
      {/* Seller Actions */}
      {user_role === "SELLER" && (
        <div className="flex gap-3 mb-4">
          <Button onClick={() => setIsProductModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsCategoryModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      )}

      {/* Search, Sort & Filter */}
      <div className="flex flex-col md:flex-row justify-start items-center mb-6 gap-4">
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

        <Select onValueChange={handleCityChange} defaultValue="all">
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Filter by City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {capitalizeWords(city)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className="text-center col-span-full">
            No products found!
          </p>
        )}
      </div>
      {/* Modals */}
      <AddProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={null}
      />
      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </div>
  );
}