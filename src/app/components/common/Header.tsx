"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ShoppingCart, Menu, X, LogOut } from "lucide-react";
import type { RootState, AppDispatch } from "@/lib/redux/store";
import logo from "../../../../public/Logo.png";
import { logoutUser } from "@/lib/redux/slices/authSlice"; // Import logout action
import Loader from "./Loader";
import Cookies from "js-cookie";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField } from "@/components/ui/form";
import { set, z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from "react-hook-form";
import AddProductModal from "./AddProductModal";





export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [categoryModel,setCategoryModel] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const user = useSelector((state: RootState) => state.auth.user);
  const cartItemCount = useSelector((state: RootState) =>
    Array.isArray(state.cart.items) ? state.cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0
  );

  const UserCookies = Cookies.get("user");
  const userData = UserCookies ? JSON.parse(UserCookies) : null;
  const user_role = userData?.role;
  const user_id = userData?.id;
  const user_token = userData?.token;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Logout handler
  const handleLogout = () => {
    dispatch(logoutUser()); // Clear Redux user state
    router.push("/signin"); // Redirect to signin page
  };

  const navigation = useMemo(() => {
    if (!isHydrated) {
      return null;
    }
    return (
      <ul className="flex md:flex-row flex-col md:gap-6 gap-4 items-center">
        {!user ? (
          <>
            <li>
              <Link href="/signin" className="hover:underline" onClick={() => setIsMenuOpen(false)}>Login</Link>
            </li>
            <li>
              <Link href="/signup" className="hover:underline" onClick={() => setIsMenuOpen(false)}>Register</Link>
            </li>
          </>
        ) :
          <Button variant="destructive" size="sm" className="md:block hidden" onClick={handleLogout}>
            <LogOut />
          </Button>
        }
        <li>
          <Link href="/products" className="hover:underline" onClick={() => setIsMenuOpen(false)}>Products</Link>
        </li>
        {!user ? (
          null
        ) :
          <div>
            <li>
              <Link href="/myorders" className="hover:underline" onClick={() => setIsMenuOpen(false)}>My Orders</Link>
            </li>
            <Button variant="destructive" size="sm" className="md:hidden block" onClick={handleLogout}>
              <LogOut />
            </Button>
          </div>
        }
        {user && user_role === "seller" && (
          <div>
            <li
              className="hover:underline"
              onClick={() => {
                setCategoryModel(true);
                setIsMenuOpen(false);
              }}
            >Add Category</li>
            <li>
   
            </li>
            <li
               className="hover:underline"
               onClick={() => {
                 setIsModelOpen(true);
                 setIsMenuOpen(false);
               }}
             >Add Product</li>
          </div>
        )}
      </ul>
    );
  }, [user, isHydrated]);

  return (
    <>
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold" onClick={() => setIsMenuOpen(false)}>
            <div className="flex justify-content-center items-center gap-2">
              <Image
                src={logo}
                alt="HomeMade Delights"
                width={70}
                height={70}
              />
              <span>
                HomeMade Delights
              </span>
            </div>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <nav>{navigation}</nav>
            <Link href="/cart" onClick={() => setIsMenuOpen(false)}>
              <Button variant="secondary" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
          <div className="flex md:hidden justify-start items-start gap-6">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            <Link href="/cart" onClick={() => setIsMenuOpen(false)}>
              <Button variant="secondary" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden flex justify-center items-center flex-col border-t">
            <nav className="p-4 space-y-2">{navigation}</nav>
          </div>
        )}
      </header>
     <AddProductModal isOpen ={isModelOpen} onClose={()=> setIsModelOpen(false)}/>
    </>
  );
}