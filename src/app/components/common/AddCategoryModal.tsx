import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form';
import { addCategory } from '@/lib/redux/slices/categorySlice';
import { AppDispatch } from '@/lib/redux/store';
import { zodResolver } from '@hookform/resolvers/zod';
import App from 'next/app';
import React from 'react'
import { Form, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { z } from 'zod';

interface AddCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category?: any; // Pass category data for updating
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  image: z
  .any()
  .refine(
      (file) => {
          if (typeof window === "undefined" || !file) return true; // Skip validation on the server
          return file instanceof File && file.size <= 2 * 1024 * 1024;
      },
      { message: "Image size should be less than 2MB" }
  ),
});

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({isOpen , onClose , category}) => {
    const dispatch = useDispatch<AppDispatch>();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
        name: "",
        description: "",
        image: null,
        },
    });
const handleSubmit = async (data: any) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("image", data.image);
    dispatch(addCategory(formData))
    .then((response: any) => {
        if (response.meta.requestStatus === "fulfilled") {
            onClose();
        } else {
            console.error("Failed to add category:", response.payload);
        }
    }
    )
    .catch((error: any) => {
        console.error("Error adding category:", error);
    }
    );
    form.reset();
    onClose();
}
  return (
    <div>
        {isOpen && (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Category</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)}>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <input {...field} placeholder="Category Name" />
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <textarea {...field} placeholder="Category Description" />
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => ( 
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => field.onChange(e.target.files?.[0])}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        ref={field.ref}
                                    />
                                )}
                            />
                            <button type="submit">Submit</button>
                        </form>
                    </Form>
                </DialogContent>
                <DialogFooter>
                    <button onClick={onClose}>Close</button>
                </DialogFooter>
            </Dialog>
        )}
    </div>
  )
}

export default AddCategoryModal