"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * LSUS Connect - Product Detail Page
 * Brand Compliant with LSUS Brand Guidelines (January 2026)
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

  const handleSendMessage = () => {
    console.log("Sending message:", message);
    // TODO: Implement message sending
    setMessage("");
  };

  const handleSaveItem = () => {
    console.log("Saving item");
    // TODO: Implement save functionality
  };

  const handleMessageSeller = () => {
    console.log("Message seller clicked");
    // TODO: Implement message modal or inline messaging
  };

  return (
    <div className="min-h-screen bg-[#461D7C]">
      {/* Header */}
      <header className="bg-[#461D7C] border-b border-[#5a2d8c] py-4">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-white">
              <span className="text-[#FDD023]">LSUS</span> CONNECT
            </Link>

            {/* Right side links */}
            <div className="flex items-center gap-6 text-white text-sm">
              <Link href="/marketplace" className="hover:text-[#FDD023] transition-colors">
                Back to listings
              </Link>
              <Link href="/" className="hover:text-[#FDD023] transition-colors">
                Search
              </Link>
              <Link href="/user-profile" className="hover:text-[#FDD023] transition-colors">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-white text-sm">
          <Link href="/" className="hover:text-[#FDD023] transition-colors">
            Home
          </Link>
          <span className="mx-2">›</span>
          <Link href="/marketplace" className="hover:text-[#FDD023] transition-colors">
            Category
          </Link>
          <span className="mx-2">›</span>
          <span className="text-gray-400">Item</span>
        </div>

        <div className="grid grid-cols-[1fr,400px] gap-8">
          {/* Left Side - Images */}
          <div>
            {/* Main Image */}
            <div className="bg-white rounded-lg overflow-hidden mb-4">
              <div className="aspect-[4/3] relative">
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400"></div>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-3">
              {productData.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? "border-[#FDD023] scale-105"
                      : "border-[#5a2d8c] hover:border-[#FDD023]/50"
                  }`}
                >
                  <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-700"></div>
                </button>
              ))}
            </div>

            {/* Safety Tips */}
            <div className="mt-6 bg-[#3a1364] rounded-lg p-4 border border-[#5a2d8c]">
              <p className="text-white text-sm">
                <span className="font-semibold">Safety:</span> meet on campus • avoid wires • report listing
              </p>
            </div>
          </div>

          {/* Right Side - Product Info */}
          <div className="space-y-6">
            {/* Product Title & Price */}
            <div className="bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c]">
              <h1 className="text-white text-3xl font-bold mb-2">
                {productData.title}
              </h1>
              <div className="flex items-center gap-4 mb-3">
                <p className="text-[#FDD023] text-2xl font-bold">
                  {productData.price}
                </p>
                <span className="text-white text-sm">•</span>
                <p className="text-white text-sm">
                  <span className="font-semibold">Condition:</span> {productData.condition}
                </p>
                <span className="text-white text-sm">•</span>
                <p className="text-white text-sm">
                  <span className="font-semibold">Category:</span> {productData.category}
                </p>
              </div>
              <p className="text-gray-400 text-sm">Posted {productData.postedTime}</p>
            </div>

            {/* Seller Info */}
            <div className="bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c]">
              <div className="flex items-center gap-4 mb-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gray-600 flex-shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-[#461D7C] to-[#5a2d8c] rounded-full"></div>
                </div>
                {/* Name & Rating */}
                <div>
                  <p className="text-white font-semibold">{productData.seller.name}</p>
                  <p className="text-gray-400 text-sm">Rating: {productData.seller.rating}/5</p>
                </div>
              </div>

              {/* Message Seller */}
              <button
                onClick={handleMessageSeller}
                className="w-full py-2 bg-[#2a0d44] text-white rounded-lg border border-[#5a2d8c] hover:bg-[#3a1364] hover:border-[#FDD023] transition-colors mb-4"
              >
                Message seller
              </button>

              {/* Save Item */}
              <button
                onClick={handleSaveItem}
                className="w-full py-2 bg-[#2a0d44] text-white rounded-lg border border-[#5a2d8c] hover:bg-[#3a1364] hover:border-[#FDD023] transition-colors"
              >
                Save Item
              </button>
            </div>

            {/* Description */}
            <div className="bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c]">
              <h3 className="text-white font-semibold mb-3">Description</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {productData.description}
              </p>
              <p className="text-gray-300 text-sm">
                <span className="font-semibold">Mileage:</span> {productData.mileage}
              </p>
            </div>

            {/* Message Seller Box */}
            <div className="bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c]">
              <h3 className="text-[#FDD023] font-bold mb-4">Message Seller</h3>
              <textarea
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20 resize-none mb-4"
              />
              <button
                onClick={handleSendMessage}
                className="w-full py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
              >
                Message Seller
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
