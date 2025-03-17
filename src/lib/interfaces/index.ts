export interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    seller: string;
    description: string;
}

export interface ProductsState {
    items: Product[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    sortOrder: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    token: string;
}

export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}