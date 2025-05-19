import { Address, Cart, CartItem, Category, Order, OrderItem, Product, User } from "@prisma/client";

export interface ProductsState {
    items: IExtendedProduct[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    sortOrder: string;
}

export interface IExtendedUser extends User {
    categories: Category[];
    products: Product[];
    carts: Cart[];
    orders: Order[];
    addresses: Address[];
    token: string
}

export interface AuthState {
    user: IExtendedUser | null;
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

export interface CartState {
    items: IExtendedCartItem[] | null;
    loading: boolean;
    error: string | null;
}

export interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: IExtendedProduct | null;
}

export interface AddCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export interface AddressDialogProps {
    open: boolean;
    onClose: () => void;
    onSelect: (address: Address) => void;
    selectedAddressId?: number;
}

export interface IAddOrder {
    address_id: number;
    cartItems: IExtendedCartItem[];
    total: number;
    name: string;
    email: string;
}

export interface IExtendedOrder extends Order {
    orderItems: (OrderItem & {
        product: IExtendedProduct;
    })[];
}

export interface IExtendedProduct extends Product {
    address: Address
    user: IExtendedUser;
    orderItems: (OrderItem & {
        order: Order;
    })[];
    cartItems: (CartItem & {
        cart: Cart;
    })[];
    category: Category
}

export interface LogoutModalProps {
    open: boolean;
    onClose: () => void;
    onLogout: () => void;
}

export interface IExtendedCartItem extends Product {
    id: number
    product?: IExtendedProduct
    cart?: Cart;
    product_id?: number
    cart_id?: number
    quantity: number
    cartItemId?: number;
}