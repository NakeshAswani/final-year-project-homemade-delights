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

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image: null as File | null
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, image: e.target.files![0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append("name", formData.name);
        data.append("description", formData.description);
        if (formData.image) data.append("image", formData.image);

        try {
            await dispatch(addCategory(data));
            toast.success("Category added successfully");
            onClose();
            setFormData({ name: "", description: "", image: null });
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

                    <div className="mb-4">
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

                    <div className="mb-6">
                        <Label htmlFor="image">Category Image</Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="file:text-foreground cursor-pointer"
                        />
                        <p className="text-sm text-muted-foreground mt-2 ps-1">
                            {formData.image?.name || "No file selected"}
                        </p>
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