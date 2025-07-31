"use client"

import Link from "next/link"
import Image from "next/image"
import { Phone, MapPin, Download, Menu, X, Facebook, Instagram, Map } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import CartView from "./cart-view"
import { useRouter } from "next/navigation"

export default function SiteHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const router = useRouter()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
            {/* Top Bar */}

            {/* Main Header */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center">
                            <Image

                                src={`/LogoC.jpg`}
                                alt="NAMMAPETIKADAI Crackers World"
                                width={50}
                                height={50}
                                className="w-auto"
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex md:items-center md:space-x-1">
                        <Link href="/" className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700">
                            Home
                        </Link>
                        <Link href="/about" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600">
                            About
                        </Link>
                        <Link href="/products" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600">
                            Products
                        </Link>

                        <Link href="/contact" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600">
                            Contact Us
                        </Link>
                        <a href="/PriceList.pdf" download>
                            <Button size="sm" className="ml-3 cursor-pointer bg-red-600 hover:bg-red-700">
                                <Download className="mr-2 h-4 w-4" /> Download Pricelist
                            </Button>
                        </a>

                        {/* Cart Component */}
                        <div className="ml-3">
                            <CartView />
                        </div>
                    </nav>

                    {/* Mobile menu and cart buttons */}
                    <div className="flex items-center md:hidden">
                        <div className="mr-2">
                            <CartView />
                        </div>
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-red-600"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation with Framer Motion */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-lg md:hidden"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <div className="flex h-16 items-center justify-between px-4 border-b">
                            <div className="text-lg font-semibold">Menu</div>
                            <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-red-600"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <X className="h-6 w-6" />
                                <span className="sr-only">Close menu</span>
                            </button>
                        </div>
                        <div className="flex flex-col p-4 space-y-4">
                            <Link
                                href="/"
                                className="flex items-center px-3 py-3 text-base font-medium text-red-600 rounded-md hover:bg-red-50"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                href="/about"
                                className="flex items-center px-3 py-3 text-base font-medium text-gray-700 rounded-md hover:bg-red-50 hover:text-red-600"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                About
                            </Link>
                            <Link
                                href="/products"
                                className="flex items-center px-3 py-3 text-base font-medium text-gray-700 rounded-md hover:bg-red-50 hover:text-red-600"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Products
                            </Link>
                            {/* <Link
                                href="/price-list"
                                className="flex items-center px-3 py-3 text-base font-medium text-gray-700 rounded-md hover:bg-red-50 hover:text-red-600"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Price List
                            </Link>
                            <Link
                                href="/gift-box"
                                className="flex items-center px-3 py-3 text-base font-medium text-gray-700 rounded-md hover:bg-red-50 hover:text-red-600"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Gift Box
                            </Link> */}
                            <Link
                                href="/contact"
                                className="flex items-center px-3 py-3 text-base font-medium text-gray-700 rounded-md hover:bg-red-50 hover:text-red-600"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Contact Us
                            </Link>
                            <div onClick={() => { router.push('/PriceList.pdf') }} className="pt-4 mt-4 border-t">
                                <Button className="w-full bg-red-600 hover:bg-red-700">
                                    <Download className="mr-2 h-5 w-5" /> Download Pricelist
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Semi-transparent overlay when menu is open */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/20 md:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMenuOpen(false)}
                    />
                )}
            </AnimatePresence>
        </header>
    )
}

