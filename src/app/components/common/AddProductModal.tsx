import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Cookies from 'js-cookie';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import { addProduct, updateProduct } from '@/lib/redux/slices/productsSlice';

const formSchema = z.object({
    name: z.string().min(1, { message: "Product name is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    price: z.number().min(1, { message: "Price is required" }),
    discounted_price: z.number().min(1, { message: "Discounted Price is required" }),
    stock: z.number().min(1, { message: "Stock is required" }),
    image: z
        .any()
        .refine(
            (file) => {
                if (typeof window === "undefined" || !file) return true; // Skip validation on the server
                return file instanceof File && file.size <= 2 * 1024 * 1024;
            },
            { message: "Image size should be less than 2MB" }
        ),
    category_id: z.number().min(1, { message: "Category is required" }),
});

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: any; // Pass product data for updating
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, product }) => {
    const dispatch = useDispatch<AppDispatch>();
    const UserCookies = Cookies.get("user");
    const userData = UserCookies ? JSON.parse(UserCookies) : null;
    const user_id = userData?.id;
    const { items:categories } = useSelector((state: RootState) => state.category);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: product?.name || "",
            description: product?.description || "",
            price: product?.price || 0,
            discounted_price: product?.discounted_price || 0,
            stock: product?.stock || 0,
            image: null,
            category_id: product?.category_id || 0,
        },
    });

    useEffect(() => {
        if (product) {
            form.reset({
                name: product.name,
                description: product.description,
                price: product.price,
                discounted_price: product.discounted_price,
                stock: product.stock,
                image: null,
                category_id: product.category_id,
            });
        }
    }, [product, form]);

    const handleSubmit = async (data: any) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("price", data.price);
        formData.append("discounted_price", data.discounted_price);
        formData.append("stock", data.stock);
        if (data.image && data.image[0]) {
            formData.append("image", data.image[0]);
        }
        formData.append("category_id", data.category_id);
        formData.append("user_id", user_id);

        if (product) {
            // Update product
            dispatch(updateProduct({ id: product.id, formData }))
                .then((response: any) => {
                    if (response.meta.requestStatus === "fulfilled") {
                        onClose();
                    } else {
                        console.error("Failed to update product:", response.payload);
                    }
                })
                .catch((error: any) => {
                    console.error("Error updating product:", error);
                });
        } else {
            // Add new product
            dispatch(addProduct(formData));
        }

        onClose(); // Close the modal after submission
    };


    return (
        <div>
            {isOpen && (
                <Dialog open={isOpen} onOpenChange={onClose}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{product ? "Update Product" : "Add Product"}</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)}>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <div>
                                            <label htmlFor="name">Product Name</label>
                                            <input
                                                id="name"
                                                type="text"
                                                {...field}
                                                placeholder="Product Name"
                                                className="border rounded p-2 w-full"
                                            />
                                        </div>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <div>
                                            <label htmlFor="description">Description</label>
                                            <textarea
                                                id="description"
                                                {...field}
                                                placeholder="Description"
                                                className="border rounded p-2 w-full"
                                            />
                                        </div>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <div>
                                            <label htmlFor="price">Price</label>
                                            <input
                                                id="price"
                                                type="number"
                                                {...field}
                                                placeholder="Price"
                                                className="border rounded p-2 w-full"
                                            />
                                        </div>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="discounted_price"
                                    render={({ field }) => (
                                        <div>
                                            <label htmlFor="discounted_price">Discounted Price</label>
                                            <input
                                                id="discounted_price"
                                                type="number"
                                                {...field}
                                                placeholder="Discounted Price"
                                                className="border rounded p-2 w-full"
                                            />
                                        </div>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="stock"
                                    render={({ field }) => (
                                        <div>
                                            <label htmlFor="stock">Stock</label>
                                            <input
                                                id="stock"
                                                type="number"
                                                {...field}
                                                placeholder="Stock"
                                                className="border rounded p-2 w-full"
                                            />
                                        </div>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <div>
                                            <label htmlFor="image">Image</label>
                                            <input
                                                id="image"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => field.onChange(e.target.files)}
                                                className="border rounded p-2 w-full"
                                            />
                                        </div>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="category_id"
                                    render={({ field }) => (
                                        <div>
                                            <label htmlFor="category_id">Category</label>
                                            <select
                                                id="category_id"
                                                {...field}
                                                className="border rounded p-2 w-full"
                                            >
                                                
                                                <option value="">Select Category</option>
                                                {categories.map((category: any) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                />
                                <Button type="submit">{product ? "Update Product" : "Add Product"}</Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default AddProductModal;