"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export function PasswordInput({ value = '', onChange = (e: any) => { }, placeholder = "Enter password", id = "password", required = false }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative">
            <Input
                id={id}
                type={showPassword ? "text" : "password"}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="pr-10"
                required={required}
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
        </div>
    );
}