import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/redux/store';
import { addProduct, fetchProducts, updateProduct } from '@/lib/redux/slices/productsSlice';
import { fetchCategories } from '@/lib/redux/slices/categorySlice';
import { AddProductModalProps } from '@/lib/interfaces';
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Address, Category } from '@prisma/client';
import AddressDialog from './AddressDialog';
import { capitalizeWords } from '@/lib/utils';

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, product }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        discounted_price: 0,
        stock: 0,
        image: null as File | null,
        category_id: 0,
        address_id: 0,
        address: null as Address | null
    });
    const [categories, setCategories] = useState<Category[] | null>();
    const [addressDialogOpen, setAddressDialogOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string>("");

    const UserCookies = Cookies.get("user");
    const userData = UserCookies ? JSON.parse(UserCookies) : null;
    const user_id = userData?.data?.id;

    useEffect(() => {
        if (isOpen) {
            if (product) {
                setFormData({
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    discounted_price: product.discounted_price,
                    stock: product.stock,
                    image: null,
                    category_id: product?.category_id,
                    address_id: product?.address_id ?? 0,
                    address: product?.address
                });

                setPreviewUrl(product.image);
            }
            // Fetch categories when modal opens
            dispatch(fetchCategories())
                .then((res) => setCategories(res.payload ?? []))
        }
    }, [isOpen, dispatch]);

    const handleAddressSelect = (address: Address) => {
        setFormData(prev => ({
            ...prev,
            address_id: address.id,
            address: address
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: id === 'price' || id === 'discounted_price' || id === 'stock'
                ? Number(value)
                : value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Revoke old object URL if one exists
        if (previewUrl && previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
        }

        const objectUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, image: file }));
        setPreviewUrl(objectUrl);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append("name", formData.name);
        data.append("address_id", String(formData.address_id));
        data.append("description", formData.description);
        data.append("price", formData.price.toString());
        data.append("discounted_price", formData.discounted_price.toString());
        data.append("stock", formData.stock.toString());
        if (formData.image) {
            data.append("image", formData.image)
        }
        if (!formData?.image && product?.image) {
            data.append("image", product?.image)
        }
        data.append("category_id", String(formData.category_id));
        data.append("user_id", user_id);

        try {
            if (product) {
                await dispatch(updateProduct({ id: product.id, formData: data }));
                toast.success("Product updated successfully");
            } else {
                await dispatch(addProduct(data));
                await dispatch(fetchProducts());
                toast.success("Product added successfully");
            }
            onClose();
        } catch (error) {
            toast.error("Unable to add product. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        {product ? "Update Product" : "Add New Product"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="mb-4">
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter product name"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Product description"
                            className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="mb-4">
                            <Label htmlFor="price">Price (₹)</Label>
                            <Input
                                id="price"
                                type="number"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="Enter price"
                                min="0"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <Label htmlFor="discounted_price">Discounted Price (₹)</Label>
                            <Input
                                id="discounted_price"
                                type="number"
                                value={formData.discounted_price}
                                onChange={handleChange}
                                placeholder="Enter discounted price"
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="mb-4">
                            <Label htmlFor="stock">Stock Quantity</Label>
                            <Input
                                id="stock"
                                type="number"
                                value={formData.stock}
                                onChange={handleChange}
                                placeholder="Enter stock quantity"
                                min="0"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <Label htmlFor="category_id">Category</Label>
                            <select
                                id="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                required
                                disabled={!categories}
                            >
                                <option value="">Select Category</option>
                                {!categories ? (
                                    <option disabled>
                                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                    </option>
                                ) : (
                                    Array.isArray(categories) && categories?.length ? categories?.map((category: Category) => (
                                        <option key={category.id} value={category.id}>
                                            {capitalizeWords(category?.name)}
                                        </option>
                                    )) : null
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="image">Product Image</Label>

                        {previewUrl && (
                            <div className="mt-2">
                                <img
                                    src={previewUrl}
                                    alt="Product preview"
                                    className="w-[200px] h-[150px] object-cover rounded-md border"
                                />
                            </div>
                        )}

                        <div className="mt-2">
                            <Label
                                htmlFor="image"
                                className="cursor-pointer border px-4 py-2 rounded-md"
                            >
                                {product?.image ? "Change Image" : "Upload Image"}
                            </Label>
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <Label>Product Address</Label>
                        {formData.address ? (
                            <div className="p-3 border rounded-md bg-muted">
                                <p className="text-sm">
                                    {formData.address.address}, {formData.address.city},<br />
                                    {formData.address.state}, {formData.address.country} - {formData.address.pincode}
                                </p>
                            </div>
                        ) : (
                            null
                        )}
                        <div className="mt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setAddressDialogOpen(true)}
                            >
                                {formData?.address ? "Change Address" : "Select Address"}
                            </Button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full !mt-8"
                        disabled={loading}
                    >
                        {loading ? "Processing..." : (product ? "Update Product" : "Add Product")}
                    </Button>
                </form>
            </DialogContent>
            {/* Address Dialog */}
            <AddressDialog
                open={addressDialogOpen}
                onClose={() => setAddressDialogOpen(false)}
                onSelect={handleAddressSelect}
                selectedAddressId={formData?.address_id}
            />
        </Dialog>
    );
};

export default AddProductModal;