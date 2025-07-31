"use client";

import { createContext, useContext, useState, useEffect } from "react";

// Create the context with a default value
const CartContext = createContext(undefined);

// Create a provider component
export function CartProvider({ children }) {
  // Initialize state from localStorage if available (client-side only)
  const [items, setItems] = useState([]);
  const [isClient, setIsClient] = useState(false);

  // Calculate derived values
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  let price = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const subtotal = items.reduce(
    (total, item) => total + item.subTotal * item.quantity,
    0
  );

  price = subtotal - price;

  // Effect to load cart from localStorage on the client-side
  useEffect(() => {
    setIsClient(true); // Indicate that the component has mounted on the client
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
        localStorage.removeItem("cart"); // Clear corrupted data
      }
    }
  }, []);

  // Effect to save cart to localStorage whenever it changes
  useEffect(() => {
    // Only run this on the client-side
    if (isClient) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, isClient]);

  // Add an item to the cart
  const addItem = (newItem) => {
    setItems((prevItems) => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === newItem.id
      );

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        return updatedItems;
      } else {
        // Add new item if it doesn't exist
        return [...prevItems, newItem];
      }
    });
  };

  // Update the quantity of an item
  const updateQuantity = (id, quantity) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  // Remove an item from the cart
  const removeItem = (id) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Clear the entire cart
  const clearCart = () => {
    setItems([]);
  };

  const value = {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    price,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Custom hook to use the cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
