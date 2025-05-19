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
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  fetchProducts,
  setSearchQuery,
  setSortOrder,
} from "@/lib/redux/slices/productsSlice";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import ProductCard from "@/app/components/common/ProductCard";
import Loader from "../components/common/Loader";
import Cookies from "js-cookie";
import { capitalizeWords } from "@/lib/utils";
import AddProductModal from "../components/common/AddProductModal";
import AddCategoryModal from "../components/common/AddCategoryModal";

export default function ProductsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: products = [], loading, error, searchQuery, sortOrder } =
    useSelector((state: RootState) => state.products);

  // New local state for city & category
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] =
    useState<string>("all");

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const userData = Cookies.get("user")
    ? JSON.parse(Cookies.get("user")!)
    : null;
  const userRole = userData?.role;

  useEffect(() => {
    if (!products.length) dispatch(fetchProducts());
  }, [dispatch, products.length]);

  // Build unique lists
  const cities = Array.from(
    new Set(
      products
        .map((p) => p.user.addresses?.[0]?.city)
        .filter((c): c is string => Boolean(c))
    )
  );

  const categories = Array.from(
    new Set(
      products
        .map((p) => p.category?.name)
        .filter((c): c is string => Boolean(c))
    )
  );

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch(setSearchQuery(e.target.value));

  const handleSortChange = (value: string) =>
    dispatch(setSortOrder(value));

  const handleCityChange = (value: string) =>
    setSelectedCity(value);

  const handleCategoryChange = (value: string) =>
    setSelectedCategory(value);

  const handleResetFilters = () => {
    dispatch(setSearchQuery(""));
    dispatch(setSortOrder(""));
    setSelectedCity("all");
    setSelectedCategory("all");
  };

  // Apply: search → city → category → sort (price only)
  const filteredProducts = products
    .filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((p) =>
      selectedCity === "all"
        ? true
        : p.user.addresses?.[0]?.city === selectedCity
    )
    .filter((p) =>
      selectedCategory === "all"
        ? true
        : p.category?.name === selectedCategory
    )
    .sort((a, b) => {
      if (sortOrder === "price-low-high") return a.price - b.price;
      if (sortOrder === "price-high-low") return b.price - a.price;
      return 0;
    });

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>

      {/* Seller Actions */}
      {userRole === "SELLER" && (
        <div className="flex gap-3 mb-4">
          <Button onClick={() => setIsProductModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
          <Button
            onClick={() => setIsCategoryModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      )}

      {/* Search, Sort & Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 justify-start max-w-max mb-4 gap-4">
        {/* Search */}
        <Input
          type="search"
          placeholder="Search products..."
          className="w-full md:w-64"
          value={searchQuery}
          onChange={handleSearchChange}
        />

        {/* Sort by price */}
        <Select onValueChange={handleSortChange} value={sortOrder}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort by Price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price-low-high">
              Price: Low to High
            </SelectItem>
            <SelectItem value="price-high-low">
              Price: High to Low
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Filter by City */}
        <Select
          onValueChange={handleCityChange}
          defaultValue="all"
          value={selectedCity}
        >
          <SelectTrigger className="w-full">
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

        {/* Filter by Category */}
        <Select
          onValueChange={handleCategoryChange}
          defaultValue="all"
          value={selectedCategory}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {capitalizeWords(cat)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      <div className="mb-6">
        <Button variant="destructive" onClick={handleResetFilters}>
          Reset Filters
        </Button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className="text-center col-span-full capitalize mt-8 text-xl">
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