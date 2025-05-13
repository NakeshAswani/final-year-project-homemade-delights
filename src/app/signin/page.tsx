"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { loginUser } from "@/lib/redux/slices/authSlice";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import Loader from "../components/common/Loader";
import { PasswordInput } from "../components/inputs/PasswordInput";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkUserExistsLoader, setCheckUserExistsLoader] = useState(true)
  const user = useSelector((state: RootState) => state.auth.user)
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await dispatch(loginUser({ email, password })).unwrap();
      res?.role === "SELLER" ? router.push("/products") : router.push("/"); // Redirect after login success
    } catch (err: any) {
      toast.error("Login failed!");
      setError(err.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      router.replace("/") // Redirect if user is logged in
    } else {
      setCheckUserExistsLoader(false) // Stop loader if no user is found
    }
  }, [user])

  if (checkUserExistsLoader) {
    return <Loader />
  }

  return (
    <div className="px-4 py-8 flex justify-center items-center min-h-screen bg-gray-200">
      <Card className="w-full max-w-lg py-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="abc@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p>
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}