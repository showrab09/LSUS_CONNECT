"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * LSUS Connect - Marketplace Home Page
 * Brand Compliant with LSUS Brand Guidelines (January 2026)
 */

// Mock data for listings
const mockListings = [
  {
    id: 1,
    title: "Toyota 4runner",
    price: "25,000 $",
    image: "/api/placeholder/400/300",
    category: "Vehicles"
  },
  {
    id: 2,
    title: "Chair",
    price: "Free",
    image: "/api/placeholder/400/300",
    category: "Furniture"
  },
  {
    id: 3,
    title: "Chemical Equipment",
    price: "10 $",
    image: "/api/placeholder/400/300",
    category: "Other"
  },
  {
    id: 4,
    title: "Table",
    price: "Free",
    image: "/api/placeholder/400/300",
    category: "Furniture"
  },
];

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    furniture: false,
    books: false,
    housing: false,
    freeSwap: false,
  });

  const toggleFilter = (filter: keyof typeof selectedFilters) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };

  const handleApplyFilters = () => {
    console.log("Applying filters:", selectedFilters);
    // TODO: Filter listings based on selected filters
  };

  return (
    <div className="min-h-screen bg-[#461D7C]">
      {/* Header */}
      <header className="bg-[#461D7C] border-b border-[#5a2d8c] py-4">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-between gap-8">
            {/* Logo */}
            <Link href="/marketplace" className="text-2xl font-bold text-white flex items-center gap-2 whitespace-nowrap">
              <span className="text-[#FDD023]">LSUS</span>
              <span>CONNECT</span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-3xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 px-4 pr-12 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FDD023]"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#461D7C]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Profile & Notifications */}
            <div className="flex items-center gap-2 text-white text-sm font-medium whitespace-nowrap">
              <Link href="/user-profile" className="hover:text-[#FDD023] transition-colors">Profile</Link>
              <span>•</span>
              <Link href="/" className="hover:text-[#FDD023] transition-colors">Notifications</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Filters */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c]">
              <h2 className="text-white font-bold text-lg mb-6">Filters</h2>

              {/* Filter Checkboxes */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-white cursor-pointer hover:text-[#FDD023] transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedFilters.furniture}
                    onChange={() => toggleFilter("furniture")}
                    className="w-5 h-5 accent-[#FDD023] cursor-pointer"
                  />
                  <span className="text-base">Furniture</span>
                </label>

                <label className="flex items-center gap-3 text-white cursor-pointer hover:text-[#FDD023] transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedFilters.books}
                    onChange={() => toggleFilter("books")}
                    className="w-5 h-5 accent-[#FDD023] cursor-pointer"
                  />
                  <span className="text-base">Books</span>
                </label>

                <label className="flex items-center gap-3 text-white cursor-pointer hover:text-[#FDD023] transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedFilters.housing}
                    onChange={() => toggleFilter("housing")}
                    className="w-5 h-5 accent-[#FDD023] cursor-pointer"
                  />
                  <span className="text-base">Housing</span>
                </label>

                <label className="flex items-center gap-3 text-white cursor-pointer hover:text-[#FDD023] transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedFilters.freeSwap}
                    onChange={() => toggleFilter("freeSwap")}
                    className="w-5 h-5 accent-[#FDD023] cursor-pointer"
                  />
                  <span className="text-base">Free / Swap</span>
                </label>
              </div>

              {/* Apply Filters Button */}
              <button
                onClick={handleApplyFilters}
                className="w-full mt-6 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
              >
                Apply Filters
              </button>

              {/* Help Links */}
              <div className="mt-8 pt-6 border-t border-[#5a2d8c]">
                <div className="space-y-3 text-sm">
                  <Link href="/contact-team" className="block text-gray-300 hover:text-[#FDD023] transition-colors">
                    Help
                  </Link>
                  <Link href="/contact-team" className="block text-gray-300 hover:text-[#FDD023] transition-colors">
                    About
                  </Link>
                  <Link href="/contact-team" className="block text-gray-300 hover:text-[#FDD023] transition-colors">
                    Report Issue
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content - Listings Grid */}
          <main className="flex-1">
            <div className="grid grid-cols-2 gap-6">
              {mockListings.map((listing) => (
                <Link
                  key={listing.id}
                  href="/product-detail"
                  className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow block"
                >
                  {/* Image */}
                  <div className="relative h-64 bg-gray-200">
                    <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400"></div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Title */}
                    <h3 className="text-black font-bold text-xl mb-2">
                      {listing.title}
                    </h3>

                    {/* Price */}
                    <p className="text-[#461D7C] font-bold text-lg mb-4">
                      {listing.price}
                    </p>

                    {/* Message Button */}
                    <div className="w-full py-2.5 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors text-center">
                      Message
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}