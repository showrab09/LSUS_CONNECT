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
    user: { name: "Sarah Mitchell", time: "2 hours ago" },
    category: "Furniture",
  },
  {
    id: 2,
    title: "Office Chair",
    price: "$80",
    user: { name: "Sarah Mitchell", time: "2 hours ago" },
    category: "Furniture",
  },
  {
    id: 3,
    title: "Gaming Setup",
    price: "$450",
    user: { name: "Jason White", time: "5 hours ago" },
    category: "Electronics",
  },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const categories = [
    "All Categories",
    "Electronics",
    "Furniture",
    "Books",
    "Clothing",
    "Housing",
    "Home",
    "Other",
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
              <input
                type="text"
                placeholder="Search for items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023]"
              />
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-white hover:text-[#FDD023] transition-colors">
                Home
              </Link>
              <Link href="/user-profile" className="text-white hover:text-[#FDD023] transition-colors">
                My Listings
              </Link>
              <Link href="/post-listing" className="px-6 py-2 bg-[#FDD023] text-black font-semibold rounded-lg hover:bg-[#FFE34A] transition-colors">
                Post Listing
              </Link>
              <Link href="/user-profile" className="w-10 h-10 rounded-full bg-[#2a0d44] border-2 border-[#FDD023]" />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-6 py-8 flex gap-6">
        {/* Sidebar */}
        <aside className="w-64">
          <div className="bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c]">
            <h2 className="text-white font-bold text-lg mb-4">Categories</h2>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
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
        </aside>

        {/* Marketplace Feed */}
        <main className="flex-1">
          <div className="grid grid-cols-3 gap-6">
            {mockListings.map((listing) => (
              <Link
                key={listing.id}
                href="/product-detail"
                className="bg-[#3a1364] rounded-lg p-4 border border-[#5a2d8c] hover:border-[#FDD023] transition-all block"
              >
                <h3 className="text-white font-bold text-lg">{listing.title}</h3>
                <p className="text-[#FDD023] font-bold text-xl">{listing.price}</p>
                <p className="text-gray-400 text-sm mt-2">
                  {listing.user.name} • {listing.user.time}
                </p>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
