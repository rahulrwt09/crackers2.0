"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle, IndianRupee } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/cart-contexts";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define validation schema using Zod (works in plain JS)
const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  orderNotes: z.string().optional(),
});

export default function Checkout() {
  const { items, clearCart, subtotal, price } = useCart();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [formSubmitted, setFormSubmitted] = useState(false);

  const shipping = ((subtotal - price) * 10) / 100;
  const total = subtotal + shipping;

  // Initialize form without TypeScript generics
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      orderNotes: "",
    },
  });

  const postOrder = async (payload) => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}orders`,
        payload
      );
      setLoading(false);
      toast.success("Order submitted successfully!");
      // Clear cart and local storage after successful submission
      clearCart();
      router.push("/products");
    } catch (error) {
      setLoading(false);
      toast.error("Failed to submit order. Please try again.");
      console.error("Order submission error:", error);
    }
  };

  // `values` parameter no longer has a type
  function onSubmit(values) {
    const finalItems = items.map((el) => {
      return {
        ...el,
        price: el.price.toFixed(2),
        subTotal: (el.price * el.quantity).toFixed(2),
      };
    });

    const orderPayload = {
      ...values,
      orderItems: finalItems,
      subtotal: (subtotal - price).toFixed(2),
      price,
      shipping,
      total: (subtotal - price + shipping).toFixed(2),
    };
    console.log("Submitting Order:", orderPayload);
    postOrder(orderPayload);
    // Note: Moving setFormSubmitted and clearCart to the postOrder success handler
  }

  if (formSubmitted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center py-16 space-y-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-3xl font-bold">Thank You for Your Order!</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            We've received your order details and will contact you shortly to
            confirm your purchase.
          </p>
          <Button asChild className="mt-8">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-gray-600 hover:text-red-600 mb-8"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Shopping
      </Link>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Contact Form */}
        <div className="md:col-span-3">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your phone number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter your address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="orderNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Special instructions for your order"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Order"}
                  </Button>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    No payment required now. We'll contact you to arrange
                    payment.
                  </p>
                </div>
              </form>
            </Form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg border shadow-sm sticky top-30">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {items.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Your cart is empty
                </p>
              ) : (
                items.map((item) => (
                  <div key={item._id} className="flex gap-4">
                    {" "}
                    {/* Corrected key to item._id */}
                    <div className="h-16 w-16 grid place-items-center flex-shrink-0 overflow-hidden rounded-md border">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="size-12 object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium flex justify-start items-center">
                      <IndianRupee size={15} />
                      {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))
              )}
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <p>Subtotal</p>
                <p className="flex justify-start items-center">
                  <IndianRupee size={15} />
                  {(subtotal - price).toFixed(2)}
                </p>
              </div>
              <div className="flex justify-between text-sm">
                <p>Shipping</p>
                <p className="flex justify-start items-center">
                  <IndianRupee size={15} />
                  {shipping.toFixed(2)}
                </p>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <p>Total</p>
                <p className="flex justify-start items-center">
                  <IndianRupee size={15} />
                  {(subtotal - price + shipping).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
