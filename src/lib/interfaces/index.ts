export interface IProduct {
    id: number;
    name: string;
    price: number;
    image: string;
    seller: string;
    description: string;
    user: IUser;
}

export interface ProductsState {
    items: IProduct[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    sortOrder: string;
}

export interface CartItem extends IProduct {
    quantity: number;
}

export interface IUser {
    email: string;
    password: string;
    id: number;
    name: string;
    role: string;
    is_active: boolean;
    token: string;
}

export interface AuthState {
    user: IUser | null;
    loading: boolean;
    error: string | null;
}

interface ProductEmail {
    name: string;
    discounted_price: number;
}

interface OrderItemEmail {
    product: ProductEmail;
    quantity: number;
}

interface AddressEmail {
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: number;
}

export interface OrderDetails {
    id: number;
    status: string;
    items: OrderItemEmail[];
    address: AddressEmail;
    total: number;
}