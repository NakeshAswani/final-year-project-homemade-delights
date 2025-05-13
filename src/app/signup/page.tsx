"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/redux/store";
import Loader from "../components/common/Loader";
import { PasswordInput } from "../components/inputs/PasswordInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addCart } from "@/lib/redux/slices/cartSlice";

export default function RegisterPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"SELLER" | "BUYER" | "">("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkUserExistsLoader, setCheckUserExistsLoader] = useState(true);
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!role) {
      setError("Please select a role (Seller or Buyer)!");
      return;
    }

    if (role === "SELLER") {
      if (!address || !city || !state || !country || !pincode) {
        setError("All address fields are required for sellers!");
        return;
      }
      if (pincode.length !== 6 || isNaN(Number(pincode))) {
        setError("Pincode must be a 6-digit number!");
        return;
      }
    }

    if (!name) {
      setError("Please enter your name!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email,
        password,
        role,
        name,
        ...(role === "SELLER" && {
          addresses: [{
            address,
            city,
            state,
            country,
            pincode: Number(pincode)
          }]
        })
      };

      await axiosInstance.post("/auth/signup", payload);
      toast.success("Registration successful!");
      dispatch(addCart());
      setTimeout(() => router.push("/signin"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed!");
      toast.error("Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      router.replace("/");
    } else {
      setCheckUserExistsLoader(false);
    }
  }, [user, router]);

  if (checkUserExistsLoader) {
    return <Loader />;
  }

  return (
    <div className="px-4 py-8 flex justify-center items-center min-h-screen bg-gray-200">
      <Card className="w-full max-w-xl py-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Register</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                placeholder="abc"
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                placeholder="abc@gmail.com"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="confirmPassword">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="********"
                required
              />
            </div>
            <div>
              <Label htmlFor="role">
                Select Role <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={(value) => setRole(value as "SELLER" | "BUYER")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUYER">Buyer</SelectItem>
                  <SelectItem value="SELLER">Seller</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role === "SELLER" && (
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="address">
                    Street Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main Street"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter City Name..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">
                    State <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="state"
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Enter State Name..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country">
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="country"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Enter Country Name..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">
                    Pincode <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pincode"
                    type="text"
                    value={pincode}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d+$/.test(value)) {
                        setPincode(value.slice(0, 6));
                      }
                    }}
                    placeholder="Enter Pincode..."
                    required
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full mt-8" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p>
            Already have an account?{" "}
            <Link href="/signin" className="text-blue-500 hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}