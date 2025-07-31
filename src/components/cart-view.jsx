"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Plus, Minus, ShoppingCart, IndianRupee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-contexts";

export default function CartView() {
  const router = useRouter();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { items, updateQuantity, removeItem, totalItems, subtotal, price } =
    useCart();

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push("/checkout");
  };

  return (
    <>
      {/* Cart Button */}
      <button
        className="relative p-2 text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-full"
        onClick={() => setIsCartOpen(true)}
        aria-label="Open shopping cart"
      >
        <ShoppingCart className="h-5 w-5" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
            {totalItems}
          </span>
        )}
      </button>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-lg"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex h-16 items-center justify-between px-4 border-b">
                <div className="text-lg font-semibold">
                  Your Cart ({totalItems} items)
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-red-600"
                  onClick={() => setIsCartOpen(false)}
                >
                  <X className="h-6 w-6" />
                  <span className="sr-only">Close cart</span>
                </button>
              </div>

              <div className="flex flex-col h-[calc(100vh-16rem)] overflow-y-auto p-4">
                {items?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">
                      Your cart is empty
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Add some exciting items to get started!
                    </p>
                    <Button
                      className="mt-6 bg-red-600 hover:bg-red-700"
                      onClick={() => setIsCartOpen(false)}
                    >
                      Continue Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center py-4 border-b"
                      >
                        <div className="h-20 w-20 grid place-items-center flex-shrink-0 overflow-hidden rounded-md border">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="size-16 object-contain"
                          />
                        </div>
                        <div className="ml-4 flex flex-1 flex-col">
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>{item.name}</h3>
                            <p className="ml-4 flex justify-start items-center">
                              <IndianRupee size={15} />
                              {(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 flex justify-start items-center">
                            <IndianRupee size={15} />
                            {item.price.toFixed(2)} each
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border rounded-md">
                              <button
                                className="p-1 text-gray-600 hover:text-red-600"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="px-2 text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                className="p-1 text-gray-600 hover:text-red-600"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <button
                              className="text-sm font-medium text-red-600 hover:text-red-800"
                              onClick={() => removeItem(item.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t border-gray-200 px-4 py-2 sm:px-6">
                  <div className="flex justify-between text-base font-medium text-gray-900 mb-2">
                    <p>Original Price (MRP):</p>
                    <p className="flex justify-start items-center">
                      <IndianRupee size={15} />
                      {subtotal.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex justify-between text-base font-medium text-gray-900 mb-2">
                    <p>Total Discount Applied: </p>
                    <p className="flex justify-start items-center">
                      <IndianRupee size={15} />
                      {price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                    <p>Total Payable: </p>
                    <p className="flex justify-start items-center">
                      <IndianRupee size={15} />
                      {(subtotal - price).toFixed(2)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Shipping and taxes calculated at checkout.
                  </p>
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 mb-2"
                    onClick={handleCheckout}
                  >
                    Checkout
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsCartOpen(false)}
                  >
                    Continue Shopping
                  </Button>
                </div>
              )}
            </motion.div>

            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/20 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
}
