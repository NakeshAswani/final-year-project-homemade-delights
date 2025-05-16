import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppDispatch } from "@/lib/redux/store";
import { fetchAddress, addAddress, deleteAddress, updatingAddress } from "@/lib/redux/slices/addressSlice";
import Cookies from "js-cookie";
import toast from 'react-hot-toast';
import { Address } from "@prisma/client";
import { AddressDialogProps } from "@/lib/interfaces";

const AddressDialog: React.FC<AddressDialogProps> = ({ open, onClose, onSelect, selectedAddressId }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [addresses, setAddresses] = useState<Address[] | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAddress, setCurrentAddress] = useState<Partial<Address>>({});

    const userCookie = Cookies.get("user");
    if (!userCookie) {
        return null;
    }
    const user = JSON.parse(userCookie);
    const userId = user?.data?.id;

    useEffect(() => {
        if (open) {
            dispatch(fetchAddress(userId))
                .then((result) => {
                    if (fetchAddress.fulfilled.match(result)) {
                        setAddresses(result.payload); // Update state with fetched addresses
                    } else {
                        setAddresses([])
                    }
                })
                .catch((error) => {
                    toast.error("Failed to fetch address");
                });
        }
    }, [open, dispatch, userId]);

    const handleAddAddress = () => {
        setIsAdding(true);
        setCurrentAddress({});
    };

    const handleEditAddress = (address: Address) => {
        setIsEditing(true);
        setCurrentAddress(address);
    };

    const handleDeleteAddress = (id: number) => {
        dispatch(deleteAddress(id)).then(() => {
            dispatch(fetchAddress(userId)).then((result) => {
                if (fetchAddress.fulfilled.match(result)) {
                    setAddresses(result.payload);
                }
            });
        });
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(addAddress({ ...currentAddress, user_id: userId }))
            .then((result) => {
                dispatch(fetchAddress(userId)).then((result) => {
                    if (fetchAddress.fulfilled.match(result)) {
                        setAddresses(result.payload);
                    }
                });
                setIsAdding(false);
            });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(updatingAddress({ ...currentAddress, user_id: userId }))
            .then((result) => {
                dispatch(fetchAddress(userId)).then((result) => {
                    if (fetchAddress.fulfilled.match(result)) {
                        setAddresses(result.payload);
                    }
                });
                setIsEditing(false);
            });
    };

    return (
        <>
            {/* Main Dialog for Managing Addresses */}
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8 rounded-lg bg-white overflow-y-auto max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle className="text-center text-lg font-semibold">Manage Addresses</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {
                            Array.isArray(addresses) && addresses?.length ?
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {
                                        addresses?.map((address) => (
                                            <div key={address.id} className="border p-3 rounded-md shadow-sm">
                                                <p className="mb-8 capitalize leading-[30px]">
                                                    {address.address}, {address.city}, {address.state}, {address.country} - {address.pincode}
                                                </p>
                                                <div className="flex justify-end space-x-2 mt-2">
                                                    <Button variant="outline" onClick={() => onSelect(address)} className="text-xs" disabled={address.id === selectedAddressId}>
                                                        {address.id === selectedAddressId ? "Selected" : "Select"}
                                                    </Button>
                                                    <Button variant="outline" onClick={() => handleEditAddress(address)} className="text-xs">
                                                        Edit
                                                    </Button>
                                                    <Button variant="destructive" onClick={() => handleDeleteAddress(address.id)} className="text-xs">
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                                :
                                <div className="w-full my-4">{!addresses || isAdding || isEditing ? "Please Wait..." : "No Addresses Exists. Please Add New Address."}</div>
                        }

                        {/* Add New Address Button */}
                        <div className="flex justify-end">
                            <Button onClick={handleAddAddress}>+ Add New Address</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Address Dialog */}
            <Dialog open={isAdding} onOpenChange={() => setIsAdding(false)}>
                <DialogContent className="w-full max-w-lg mx-auto p-4 sm:p-6 md:p-8 rounded-lg bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-center text-lg font-semibold">Add New Address</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                name="address"
                                value={currentAddress.address || ""}
                                onChange={(e) => setCurrentAddress({ ...currentAddress, address: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                name="city"
                                value={currentAddress.city || ""}
                                onChange={(e) => setCurrentAddress({ ...currentAddress, city: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="state">State</Label>
                            <Input
                                id="state"
                                name="state"
                                value={currentAddress.state || ""}
                                onChange={(e) => setCurrentAddress({ ...currentAddress, state: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="country">Country</Label>
                            <Input
                                id="country"
                                name="country"
                                value={currentAddress.country || ""}
                                onChange={(e) => setCurrentAddress({ ...currentAddress, country: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="pincode">Pincode</Label>
                            <Input
                                id="pincode"
                                name="pincode"
                                type="number"
                                maxLength={6}
                                value={currentAddress.pincode || ""}
                                onChange={(e) => setCurrentAddress({ ...currentAddress, pincode: parseInt(e.target.value, 10) })}
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsAdding(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Add Address</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Address Dialog */}
            <Dialog open={isEditing} onOpenChange={() => setIsEditing(false)}>
                <DialogContent className="w-full max-w-lg mx-auto p-4 sm:p-6 md:p-8 rounded-lg bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-center text-lg font-semibold">Edit Address</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                name="address"
                                value={currentAddress.address || ""}
                                onChange={(e) => setCurrentAddress({ ...currentAddress, address: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                name="city"
                                value={currentAddress.city || ""}
                                onChange={(e) => setCurrentAddress({ ...currentAddress, city: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="state">State</Label>
                            <Input
                                id="state"
                                name="state"
                                value={currentAddress.state || ""}
                                onChange={(e) => setCurrentAddress({ ...currentAddress, state: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="country">Country</Label>
                            <Input
                                id="country"
                                name="country"
                                value={currentAddress.country || ""}
                                onChange={(e) => setCurrentAddress({ ...currentAddress, country: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="pincode">Pincode</Label>
                            <Input
                                id="pincode"
                                name="pincode"
                                type="number"
                                value={currentAddress.pincode || ""}
                                onChange={(e) => setCurrentAddress({ ...currentAddress, pincode: parseInt(e.target.value, 10) })}
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Update Address</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AddressDialog;
