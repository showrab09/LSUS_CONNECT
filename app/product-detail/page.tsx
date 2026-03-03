"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * LSUS Connect - Product Detail Page (FULLY RESPONSIVE)
 * Mobile: Stacked layout, full-width images
 * Tablet: Balanced 2-column layout
 * Desktop: Image gallery + seller sidebar
 */

// Mock product data
const productData = {
  id: 1,
  title: "Toyota 4Runner 2022",
  price: "$25,000",
  condition: "Good",
  category: "Vehicle",
  postedTime: "2h ago",
  description: "Everything is perfect. Well-maintained vehicle with complete service history. Clean title, no accidents. Recently serviced with new tires. Perfect condition inside and out. Garage kept, non-smoker owner. All maintenance records available.",
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
  const router = useRouter();
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

  const handleLogout = () => {
    document.cookie = "token=; path=/; max-age=0";
    localStorage.removeItem("token");
    router.push("/signin");
  };

  return (
    <div className="min-h-screen bg-[#461D7C]">
      {/* Header - Responsive */}
      <header className="bg-[#461D7C] border-b border-[#5a2d8c] py-3 sm:py-4 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <Link href="/marketplace" className="text-xl sm:text-2xl font-bold text-white">
              <span className="text-[#FDD023]">LSUS</span> CONNECT
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-4 sm:gap-6 text-white text-sm">
              <Link href="/marketplace" className="hover:text-[#FDD023] transition-colors">
                Back to listings
              </Link>
              <Link href="/user-profile" className="hover:text-[#FDD023] transition-colors">
                Profile
              </Link>
              <button onClick={handleLogout} className="hover:text-[#FDD023] transition-colors">
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white hover:text-[#FDD023] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-[#5a2d8c] pt-4">
              <nav className="flex flex-col gap-3">
                <Link href="/marketplace" className="text-white hover:text-[#FDD023] transition-colors py-2 px-3 rounded hover:bg-[#3a1364]">
                  Back to listings
                </Link>
                <Link href="/user-profile" className="text-white hover:text-[#FDD023] transition-colors py-2 px-3 rounded hover:bg-[#3a1364]">
                  Profile
                </Link>
                <button onClick={handleLogout} className="text-left text-white hover:text-[#FDD023] transition-colors py-2 px-3 rounded hover:bg-[#3a1364]">
                  Logout
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Responsive Grid */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb - Hidden on mobile */}
        <div className="hidden sm:block mb-6 text-white text-sm">
          <Link href="/marketplace" className="hover:text-[#FDD023] transition-colors">
            Marketplace
          </Link>
          <span className="mx-2">›</span>
          <Link href="/marketplace" className="hover:text-[#FDD023] transition-colors">
            {productData.category}
          </Link>
          <span className="mx-2">›</span>
          <span className="text-gray-400">Item</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6 lg:gap-8">
          {/* Left Side - Images & Details */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="aspect-video sm:aspect-[4/3] bg-gray-700">
                <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800"></div>
              </div>
            </div>

            {/* Thumbnail Gallery - Scrollable on mobile */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {productData.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === idx ? "border-[#FDD023]" : "border-[#5a2d8c]"
                  }`}
                >
                  <div className="w-full h-full bg-gray-700"></div>
                </button>
              ))}
            </div>

            {/* Product Details Card */}
            <div className="bg-[#3a1364] rounded-lg p-4 sm:p-6 border border-[#5a2d8c]">
              <h1 className="text-white text-2xl sm:text-3xl font-bold mb-2">{productData.title}</h1>
              <p className="text-[#FDD023] text-3xl sm:text-4xl font-bold mb-4">{productData.price}</p>
              
              {/* Details Grid - Responsive */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-400 text-sm">Condition</p>
                  <p className="text-white font-semibold">{productData.condition}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Category</p>
                  <p className="text-white font-semibold">{productData.category}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Mileage</p>
                  <p className="text-white font-semibold">{productData.mileage} miles</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Posted</p>
                  <p className="text-white font-semibold">{productData.postedTime}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-[#FDD023] font-semibold mb-2">Description</h3>
                <p className="text-white leading-relaxed">{productData.description}</p>
              </div>
            </div>
          </div>

          {/* Right Side - Seller Info & Actions */}
          <div className="space-y-6">
            {/* Seller Card */}
            <div className="bg-[#3a1364] rounded-lg p-4 sm:p-6 border border-[#5a2d8c]">
              <h3 className="text-[#FDD023] font-semibold mb-4">Seller Information</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-600 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold">{productData.seller.name}</p>
                  <div className="flex items-center gap-1 text-[#FDD023]">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm">{productData.seller.rating}</span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons - Touch friendly */}
              <div className="space-y-3">
                <button
                  onClick={() => setMessage("I'm interested in this item")}
                  className="w-full min-h-[48px] bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
                >
                  Message Seller
                </button>
                <button
                  onClick={handleSaveItem}
                  className="w-full min-h-[48px] bg-[#2a0d44] text-white font-semibold rounded-lg border border-[#5a2d8c] hover:border-[#FDD023] transition-colors"
                >
                  Save Item
                </button>
              </div>
            </div>

            {/* Message Box - Appears when button clicked */}
            {message && (
              <div className="bg-[#3a1364] rounded-lg p-4 sm:p-6 border border-[#5a2d8c]">
                <h3 className="text-[#FDD023] font-semibold mb-3">Send Message</h3>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white text-base placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20 resize-none mb-3"
                />
                <button
                  onClick={handleSendMessage}
                  className="w-full min-h-[48px] bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
