"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AddCategoryModalProps } from '@/lib/interfaces';
import { addCategory } from '@/lib/redux/slices/categorySlice';
import { AppDispatch } from '@/lib/redux/store';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import toast from "react-hot-toast";
import Cookies from 'js-cookie';

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = JSON?.parse(Cookies.get("user") || "");
        const userId = user?.id;
        if (!userId) {
            toast.error("User Not Found. Please Login Again.")
            return;
        }
        setLoading(true);

        const data = new FormData();
        data.append("name", formData.name);
        data.append("description", formData.description);
        data.append("user_id", userId);
        data.append("image", "temp");

        try {
            await dispatch(addCategory(data));
            toast.success("Category added successfully");
            onClose();
            setFormData({ name: "", description: "" });
        } catch (error) {
            toast.error("Failed to add category");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Add New Category</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="mb-4">
                        <Label htmlFor="name">Category Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter category name"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Category description"
                            className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full mt-4"
                        disabled={loading}
                    >
                        {loading ? "Processing..." : "Add Category"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddCategoryModal;