"use client"

import Link from "next/link"
import { useState } from "react"
import { useSelector } from "react-redux"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Menu, X } from "lucide-react"
import type { RootState } from "@/lib/redux/store"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const cartItemCount = useSelector((state: RootState) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0),
  )

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          HomeMade Delights
        </Link>
        <div className="hidden md:flex items-center space-x-4">
          <Input type="search" placeholder="Search products..." className="w-64" />
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/products">Products</Link>
              </li>
              <li>
                <Link href="/login">Login</Link>
              </li>
              <li>
                <Link href="/register">Register</Link>
              </li>
            </ul>
          </nav>
          <Link href="/cart">
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
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <nav className="px-4 pt-2 pb-4 space-y-2">
            <Input type="search" placeholder="Search products..." className="w-full mb-2" />
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="block">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/login" className="block">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/signup" className="block">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/cart" className="block">
                  Cart ({cartItemCount})
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}

