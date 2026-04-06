import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface CartItem {
    product_id: number;
    productname: string;
    price: number;
    quantity: number;
    unit: string;
    image?: string;
    seller_id?: number;  // ✅ Added seller_id
    farm_name?: string;  // ✅ Added farm_name (replace seller_name)
}

interface CartContextType {
    cartItems: CartItem[];
    setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
    addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
    getSellerCount: () => number; // ✅ NEW: Get number of unique sellers
    setFarmNameForSeller: (sellerId: number, name: string) => void;
    onRemoveFromCart?: (productId: number) => void; // Add this line
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children, onRemoveFromCart }: { children: React.ReactNode, onRemoveFromCart?: (productId: number) => void }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // Load cart from localStorage on initial client-side render
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('agriconnect_cart');
            if (saved) {
                try {
                    const parsed: any[] = JSON.parse(saved);
                    // Ensure farm_name is present
                    const sanitized = parsed.map(i => ({
                        ...i,
                        farm_name: i.farm_name || 'Unknown Farm',
                    }));
                    setCartItems(sanitized);
                } catch {
                    // If parsing fails, start with an empty cart
                    setCartItems([]);
                }
            }
        }
    }, []); // Empty dependency array ensures this runs only once on mount

    // allow external components to patch farm_name for sellers already in cart
    const setFarmNameForSeller = (sellerId: number, name: string) => {
        setCartItems(prev => prev.map(item =>
            item.seller_id === sellerId ? { ...item, farm_name: name } : item
        ));
    };

    // Persist cart to localStorage whenever it changes
    useEffect(() => {
        if (cartItems.length > 0 || localStorage.getItem('agriconnect_cart')) {
            if (typeof window !== 'undefined') {
                localStorage.setItem('agriconnect_cart', JSON.stringify(cartItems));
            }
        }
    }, [cartItems]);

    const addToCart = async (product: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
        const existingItem = cartItems.find(item => item.product_id === product.product_id);

        if (existingItem) {
            // If item already exists, just update its quantity
            updateQuantity(product.product_id, existingItem.quantity + quantity);
            return;
        }

        // If it's a new item, prepare the complete item object before setting state.
        let newItem: CartItem;

        // Check if the incoming product object is incomplete.
        if (!product.farm_name || !product.image) {
            try {
                // Fetch the full product details from the server.
                const response = await axios.post('/api/cart-products', { product_ids: [product.product_id] });
                
                if (response.data && response.data.length > 0) {
                    const fullProductDetails = response.data[0];
                    // Create the new cart item with full details and the desired quantity.
                    newItem = { ...fullProductDetails, quantity };
                } else {
                    // If API fails to find the product, create a fallback item.
                    newItem = { ...product, quantity, farm_name: product.farm_name || 'Unknown Farm' };
                }
            } catch (error) {
                console.error("Failed to fetch product details for new cart item:", error);
                // On API error, create a fallback item.
                newItem = { ...product, quantity, farm_name: product.farm_name || 'Unknown Farm' };
            }
        } else {
            // If the provided product object is already complete.
            newItem = { ...product, quantity };
        }

        // Add the new, fully-detailed item to the cart.
        setCartItems(prevItems => [...prevItems, newItem]);
    };

    const removeFromCart = (productId: number) => {
        setCartItems(prevItems => prevItems.filter(item => item.product_id !== productId));
        if (onRemoveFromCart) {
            onRemoveFromCart(productId);
        }
    };

    const updateQuantity = (productId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCartItems(prevItems =>
            prevItems.map(item =>
                item.product_id === productId
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getTotalItems = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // ✅ NEW: Get number of unique sellers in cart
    const getSellerCount = () => {
        const uniqueSellers = new Set(cartItems.map(item => item.seller_id).filter(Boolean));
        return uniqueSellers.size;
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                setCartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getTotalItems,
                getTotalPrice,
                getSellerCount,
                setFarmNameForSeller,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}