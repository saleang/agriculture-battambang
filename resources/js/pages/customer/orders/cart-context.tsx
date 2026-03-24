import React, { createContext, useContext, useState, useEffect } from 'react';

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
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('agriconnect_cart');
            if (saved) {
                try {
                    const parsed: any[] = JSON.parse(saved);
                    return parsed.map(i => ({
                        ...i,
                        farm_name: i.farm_name || 'Unknown Farm',
                    }));
                } catch {
                    return [];
                }
            }
            return [];
        }
        return [];
    });

    // allow external components to patch farm_name for sellers already in cart
    const setFarmNameForSeller = (sellerId: number, name: string) => {
        setCartItems(prev => prev.map(item =>
            item.seller_id === sellerId ? { ...item, farm_name: name } : item
        ));
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('agriconnect_cart', JSON.stringify(cartItems));
        }
    }, [cartItems]);

    const addToCart = (product: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.product_id === product.product_id);

            if (existingItem) {
                return prevItems.map(item =>
                    item.product_id === product.product_id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                return [...prevItems, { ...product, quantity }];
            }
        });
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