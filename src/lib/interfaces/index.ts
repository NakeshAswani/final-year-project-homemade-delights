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