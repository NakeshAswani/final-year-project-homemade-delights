"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ShoppingCart, Menu, X, LogOut } from "lucide-react";
import type { RootState, AppDispatch } from "@/lib/redux/store";
import logo from "../../../../public/Logo.png";
import { logoutUser } from "@/lib/redux/slices/authSlice";
import Cookies from "js-cookie";
import { fetchCartItems } from "@/lib/redux/slices/cartSlice";
import LogoutModal from "./LogoutModal";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: RootState) => state.auth.user);
  const cartItemCount = useSelector((state: RootState) =>
    Array.isArray(state.cart.items) ? state.cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0
  );

  const UserCookies = Cookies.get("user");
  const userData = UserCookies ? JSON.parse(UserCookies) : null;
  const user_role = userData?.role;

  useEffect(() => {
    user_role && user_role !== "SELLER" ? dispatch(fetchCartItems()) : null;
    setIsHydrated(true);
  }, []);

  // Logout handler
  const handleLogout = () => {
    dispatch(logoutUser());
    setLogoutModalOpen(false);
    window.location.href = "/signin";
  };

  const navigation = useMemo(() => {
    return (
      <ul className="flex md:flex-row flex-col gap-6 items-center">
        <li>
          <Link href="/products" className="hover:underline" onClick={() => setIsMenuOpen(false)}>Products</Link>
        </li>
        {
          !user ? (
            null
          ) :
            <>
              <li>
                <Link href="/myorders" className="hover:underline" onClick={() => setIsMenuOpen(false)}>My Orders</Link>
              </li>
            </>
        }
        {
          !user ? (
            <>
              <li>
                <Link href="/signin" className="hover:underline" onClick={() => setIsMenuOpen(false)}>Login</Link>
              </li>
              <li>
                <Link href="/signup" className="hover:underline" onClick={() => setIsMenuOpen(false)}>Register</Link>
              </li>
              <li>
                <Link href="/about" className="hover:underline" onClick={() => setIsMenuOpen(false)}>About Us</Link>
              </li>
            </>
          ) :
            <>
              <li>
                <Link href="/about" className="hover:underline" onClick={() => setIsMenuOpen(false)}>About Us</Link>
              </li>
              <li>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setLogoutModalOpen(true)}
                >
                  <LogOut />
                </Button>
              </li>
            </>
        }
      </ul>
    );
  }, [user, isHydrated]);

  if (!isHydrated) {
    return null;
  }

  return (
    <>
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={user_role === "SELLER" ? "/products" : "/"} className="text-2xl font-bold" onClick={() => setIsMenuOpen(false)}>
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
            {
              user_role === "SELLER" ?
                null
                :
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
            }
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
            {
              user_role === "SELLER" ?
                null
                :
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
            }
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden flex justify-center items-center flex-col border-t">
            <nav className="p-4 space-y-2">{navigation}</nav>
          </div>
        )}
      </header>
      <LogoutModal
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onLogout={handleLogout}
      />
    </>
  );
}