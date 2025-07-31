"use client";

import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCart } from "@/contexts/cart-contexts";

export default function ProductCard({
  _id,
  title,
  discountedPrice,
  price,
  discount,
  banner,
  slug,
  stockStatus,
  categories,
  quantity,
}) {
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);

    const cartItem = {
      id: _id,
      name: title,
      subTotal: price,
      price: discountedPrice,
      quantity: 1,
      image: banner.secure_url,
    };

    addItem(cartItem);

    toast.success("Added to cart", {
      description: `${title} has been added to your cart.`,
    });

    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  return (
    <motion.div
      className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      layoutId={`product-card-${_id}`}
    >
      {/* Product image with gradient overlay */}
      <div className="relative h-64 overflow-hidden">
        {/* Badges */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 w-full h-full">
          {discount > 0 && (
            <Badge className="bg-yellow-500 absolute left-5 text-black font-semibold">
              {discount}% OFF
            </Badge>
          )}
          {stockStatus === "Limited Stock" && (
            <Badge
              variant="outline"
              className="bg-white/80 absolute bottom-4 -right-1"
            >
              Limited Stock
            </Badge>
          )}
        </div>
        <Image
          src={banner?.secure_url || "/placeholder.svg"}
          alt={title}
          fill
          className="object-contain transition-transform duration-500 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

        {/* Quick view button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/80 backdrop-blur-sm hover:bg-white"
          >
            Quick View
          </Button>
        </div>
      </div>

      {/* Content section */}
      <div className="p-5">
        <div className="mb-1 inline-block rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
          {categories?.title}
        </div>
        <h3 className="mb-2 text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">
          {title}
        </h3>

        {/* Price - Modified to remove strikethrough */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-xl font-bold text-gray-900">
            ₹{discount > 0 ? discountedPrice?.toFixed(2) : price?.toFixed(2)}
          </div>
          {discount > 0 && (
            <div className="text-sm text-gray-500">
              MRP: ₹{price?.toFixed(2)}
            </div>
          )}
        </div>

        {/* Add to cart button */}
        <Button
          className="w-full bg-red-600 hover:bg-red-700 gap-2 py-6"
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          <ShoppingCart className="h-5 w-5" />
          {isAdding ? "Adding..." : "Add to Cart"}
        </Button>
      </div>
    </motion.div>
  );
}