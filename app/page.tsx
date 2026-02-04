"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * LSUS Connect - Home Page / Marketplace Feed
 * Brand Compliant with LSUS Brand Guidelines (January 2026)
 */

// Mock data for listings
const mockListings = [
  {
    id: 1,
    title: "Office Desk",
    price: "$120",
    image: "/api/placeholder/300/200",
    user: { name: "Sarah Mitchell", avatar: "/api/placeholder/40/40", time: "2 hours ago" },
    category: "Furniture"
  },
  {
    id: 2,
    title: "Office Chair",
    price: "$80",
    image: "/api/placeholder/300/200",
    user: { name: "Sarah Mitchell", avatar: "/api/placeholder/40/40", time: "2 hours ago" },
    category: "Furniture"
  },
  {
    id: 3,
    title: "Gaming Setup",
    price: "$450",
    image: "/api/placeholder/300/200",
    user: { name: "Jason White", avatar: "/api/placeholder/40/40", time: "5 hours ago" },
    category: "Electronics"
  },
  {
    id: 4,
    title: "Textbooks Bundle",
    price: "$45",
    image: "/api/placeholder/300/200",
    user: { name: "Emma Davis", avatar: "/api/placeholder/40/40", time: "1 day ago" },
    category: "Books"
  },
  {
    id: 5,
    title: "Storage Containers",
    price: "$25",
    image: "/api/placeholder/300/200",
    user: { name: "Michael Chen", avatar: "/api/placeholder/40/40", time: "1 day ago" },
    category: "Home"
  },
  {
    id: 6,
    title: "House for Rent",
    price: "$1,200/mo",
    image: "/api/placeholder/300/200",
    user: { name: "Bryan Smith", avatar: "/api/placeholder/40/40", time: "2 days ago" },
    category: "Housing"
  },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [priceRange, setPriceRange] = useState([0, 1000]);

  const categories = [
    "All Categories",
    "Electronics",
    "Furniture",
    "Books",
    "Clothing",
    "Housing",
    "Home",
    "Other"
  ];

  return (
    <div className="min-h-screen bg-[#461D7C]">
      {/* Header */}
      <header className="bg-[#3a1364] border-b border-[#5a2d8c]">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-[#FDD023]">LSUS</span>
              <span>CONNECT</span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 px-4 pr-12 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FDD023] hover:text-[#FFE34A]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-white hover:text-[#FDD023] transition-colors">
                Home
              </Link>
              <Link href="/user-profile" className="text-white hover:text-[#FDD023] transition-colors">
                My Listings
              </Link>
              <Link href="/" className="text-white hover:text-[#FDD023] transition-colors">
                Messages
              </Link>
              <Link href="/post-listing" className="px-6 py-2 bg-[#FDD023] text-black font-semibold rounded-lg hover:bg-[#FFE34A] transition-colors">
                Post Listing
              </Link>
              {/* User Avatar */}
              <Link href="/user-profile" className="w-10 h-10 rounded-full bg-[#2a0d44] border-2 border-[#FDD023] overflow-hidden">
                <div className="w-full h-full bg-gray-600"></div>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c] sticky top-8">
              <h2 className="text-white font-bold text-lg mb-4">Filters</h2>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-[#FDD023] font-semibold text-sm mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === category
                          ? "bg-[#FDD023] text-black font-semibold"
                          : "text-white hover:bg-[#2a0d44]"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-[#FDD023] font-semibold text-sm mb-3">Price Range</h3>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full accent-[#FDD023]"
                  />
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}+</span>
                  </div>
                </div>
              </div>

              {/* Condition */}
              <div className="mb-6">
                <h3 className="text-[#FDD023] font-semibold text-sm mb-3">Condition</h3>
                <div className="space-y-2">
                  {["New", "Like New", "Good", "Fair"].map((condition) => (
                    <label key={condition} className="flex items-center gap-2 text-white text-sm cursor-pointer">
                      <input type="checkbox" className="accent-[#FDD023]" />
                      <span>{condition}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Delivery */}
              <div>
                <h3 className="text-[#FDD023] font-semibold text-sm mb-3">Delivery</h3>
                <div className="space-y-2">
                  {["Pickup", "Delivery Available", "Shipping"].map((delivery) => (
                    <label key={delivery} className="flex items-center gap-2 text-white text-sm cursor-pointer">
                      <input type="checkbox" className="accent-[#FDD023]" />
                      <span>{delivery}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="flex-1">
            {/* Listings Grid */}
            <div className="grid grid-cols-3 gap-6">
              {mockListings.map((listing) => (
                <Link
                  key={listing.id}
                  href="/product-detail"
                  className="bg-[#3a1364] rounded-lg overflow-hidden border border-[#5a2d8c] hover:border-[#FDD023] transition-all hover:shadow-lg hover:shadow-[#FDD023]/20 block"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-700">
                    <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800"></div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gray-600"></div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-semibold">{listing.user.name}</p>
                        <p className="text-gray-400 text-xs">{listing.user.time}</p>
                      </div>
                    </div>

                    {/* Title & Price */}
                    <h3 className="text-white font-bold text-lg mb-1">{listing.title}</h3>
                    <p className="text-[#FDD023] font-bold text-xl mb-3">{listing.price}</p>

                    {/* Action Button */}
                    <div className="w-full py-2 bg-[#2a0d44] text-white rounded-lg border border-[#5a2d8c] hover:bg-[#FDD023] hover:text-black hover:border-[#FDD023] transition-colors font-semibold text-center">
                      Leave a Comment
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </main>

          {/* Right Sidebar - Ads */}
          <aside className="w-80 flex-shrink-0">
            <div className="space-y-6 sticky top-8">
              {/* Student Discount Ad 1 */}
              <div className="bg-[#FDD023] rounded-lg p-6 text-center">
                <h3 className="text-black font-bold text-xl mb-2">STUDENT DISCOUNT</h3>
                <p className="text-black text-4xl font-bold mb-2">15% off</p>
                <p className="text-black text-sm">At Macbooks</p>
              </div>

              {/* Student Discount Ad 2 */}
              <div className="bg-[#FDD023] rounded-lg p-6 text-center">
                <h3 className="text-black font-bold text-xl mb-2">STUDENT DISCOUNT</h3>
                <p className="text-black text-4xl font-bold mb-2">15% off</p>
                <p className="text-black text-sm">At Textbooks</p>
              </div>

              {/* Academy Deal Days Banner */}
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-center">
                  <h3 className="font-bold text-lg">ACADEMY Deal DAYS</h3>
                  <p className="text-sm">Up to 30% off + Extra 20% off</p>
                </div>
              </div>

              {/* Pro Football Hall of Fame Ad */}
              <div className="bg-orange-500 rounded-lg p-6 text-center">
                <h3 className="text-white font-bold text-xl">PRO FOOTBALL</h3>
                <h3 className="text-white font-bold text-xl">HALL OF FAME</h3>
                <p className="text-white text-sm mt-2">CELEBRATE THE GAME</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
