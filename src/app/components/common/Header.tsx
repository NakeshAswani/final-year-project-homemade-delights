"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, X, LogOut } from "lucide-react";
import type { RootState, AppDispatch } from "@/lib/redux/store";
import { logoutUser } from "@/lib/redux/slices/authSlice"; // Import logout action
import Loader from "./Loader";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const user = useSelector((state: RootState) => state.auth.user);
  const cartItemCount = useSelector((state: RootState) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );

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
          <Button variant="destructive" size="sm" className="md:hidden block" onClick={handleLogout}>
            <LogOut />
          </Button>
        }
      </ul>
    );
  }, [user, isHydrated]);

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold" onClick={() => setIsMenuOpen(false)}>HomeMade Delights</Link>
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
  );
}