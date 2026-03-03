"use client";

import { useState } from "react";
import Link from "next/link";
import UserDropdown from "@/components/UserDropdown";

/**
 * LSUS Connect - Product Detail Page (RESPONSIVE + USER DROPDOWN)
 */

// Mock product data
const productData = {
  id: 1,
  title: "Toyota 4Runner 2022",
  price: "$25,000",
  condition: "Good",
  category: "Vehicle",
  postedTime: "2h ago",
  description: "Everything is perfect.",
  mileage: "80,000",
  seller: {
    name: "John Doe",
    avatar: "/api/placeholder/50/50",
    rating: 4.8,
  },
  images: [
    "/api/placeholder/800/600",
    "/api/placeholder/800/600",
    "/api/placeholder/800/600",
    "/api/placeholder/800/600",
  ],
};

export default function ProductDetailPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [message, setMessage] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSendMessage = () => {
    console.log("Sending message:", message);
    setMessage("");
  };

  const handleSaveItem = () => {
    console.log("Saving item");
  };

  const handleMessageSeller = () => {
    console.log("Message seller clicked");
  };

  return (
    <div className="min-h-screen bg-[#461D7C]">
      {/* Header - Responsive */}
      <header className="bg-[#461D7C] border-b border-[#5a2d8c] py-3 sm:py-4 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between">
            <Link href="/marketplace" className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-[#FDD023]">LSUS</span>
              <span>CONNECT</span>
            </Link>

            <div className="flex items-center gap-6 text-white text-sm">
              <Link href="/marketplace" className="hover:text-[#FDD023] transition-colors">
                Back to listings
              </Link>
              <Link href="/marketplace" className="hover:text-[#FDD023] transition-colors">
                Search
              </Link>
              <UserDropdown />
            </div>
          </div>

          {/* Mobile Header */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-white hover:text-[#FDD023] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              <Link href="/marketplace" className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#FDD023]">LSUS</span>
                <span>CONNECT</span>
              </Link>

              <UserDropdown />
            </div>

            {isMobileMenuOpen && (
              <div className="mt-4 pb-4 border-t border-[#5a2d8c] pt-4">
                <nav className="flex flex-col gap-3">
                  <Link href="/marketplace" className="text-white hover:text-[#FDD023] transition-colors py-2 px-3 rounded hover:bg-[#3a1364]">
                    Back to listings
                  </Link>
                  <Link href="/marketplace" className="text-white hover:text-[#FDD023] transition-colors py-2 px-3 rounded hover:bg-[#3a1364]">
                    Search
                  </Link>
                </nav>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Responsive */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-white text-sm">
          <Link href="/marketplace" className="hover:text-[#FDD023] transition-colors">
            Home
          </Link>
          <span className="mx-2">›</span>
          <Link href="/marketplace" className="hover:text-[#FDD023] transition-colors">
            Category
          </Link>
          <span className="mx-2">›</span>
          <span className="text-gray-300">{productData.title}</span>
        </div>

        {/* Product Grid - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6 lg:gap-8">
          {/* Left Column - Images & Details */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="bg-[#2a0d44] rounded-lg overflow-hidden border border-[#5a2d8c]">
              <div className="aspect-video bg-gray-700"></div>
            </div>

            {/* Thumbnail Images - Responsive Grid */}
            <div className="grid grid-cols-4 gap-3">
              {productData.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === idx
                      ? "border-[#FDD023]"
                      : "border-[#5a2d8c] hover:border-[#FDD023]/50"
                  }`}
                >
                  <div className="w-full h-full bg-gray-700"></div>
                </button>
              ))}
            </div>

            {/* Product Details */}
            <div className="bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c]">
              <h2 className="text-white font-bold text-xl mb-4">Details</h2>
              <div className="space-y-3 text-white">
                <div className="flex justify-between py-2 border-b border-[#5a2d8c]">
                  <span className="text-gray-300">Condition</span>
                  <span className="font-semibold">{productData.condition}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#5a2d8c]">
                  <span className="text-gray-300">Category</span>
                  <span className="font-semibold">{productData.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#5a2d8c]">
                  <span className="text-gray-300">Mileage</span>
                  <span className="font-semibold">{productData.mileage}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-300">Posted</span>
                  <span className="font-semibold">{productData.postedTime}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c]">
              <h2 className="text-white font-bold text-xl mb-4">Description</h2>
              <p className="text-gray-300 leading-relaxed">{productData.description}</p>
            </div>
          </div>

          {/* Right Column - Seller & Actions */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c] sticky top-24">
              <div className="mb-6">
                <h1 className="text-white font-bold text-2xl sm:text-3xl mb-2">{productData.title}</h1>
                <p className="text-[#FDD023] font-bold text-3xl sm:text-4xl">{productData.price}</p>
              </div>

              {/* Seller Info */}
              <div className="mb-6 pb-6 border-b border-[#5a2d8c]">
                <h3 className="text-white font-semibold mb-3">Seller</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#2a0d44] border-2 border-[#FDD023]"></div>
                  <div>
                    <p className="text-white font-semibold">{productData.seller.name}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-[#FDD023]">★</span>
                      <span className="text-white text-sm">{productData.seller.rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Touch Optimized */}
              <div className="space-y-3">
                <button
                  onClick={handleMessageSeller}
                  className="w-full min-h-[48px] py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
                >
                  Message Seller
                </button>
                <button
                  onClick={handleSaveItem}
                  className="w-full min-h-[48px] py-3 bg-[#2a0d44] text-white font-semibold rounded-lg border border-[#5a2d8c] hover:border-[#FDD023] transition-colors"
                >
                  Save Item
                </button>
              </div>

              {/* Safety Tips */}
              <div className="mt-6 p-4 bg-[#2a0d44] rounded-lg border border-[#5a2d8c]">
                <h4 className="text-[#FDD023] font-semibold mb-2 text-sm">Safety Tips</h4>
                <ul className="text-gray-300 text-xs space-y-1">
                  <li>• Meet in a public place</li>
                  <li>• Check the item before buying</li>
                  <li>• Don't share personal info</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Message Section - Mobile Friendly */}
        <div className="mt-8 bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c]">
          <h2 className="text-white font-bold text-xl mb-4">Send Message</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
            />
            <button
              onClick={handleSendMessage}
              className="min-h-[48px] px-6 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
