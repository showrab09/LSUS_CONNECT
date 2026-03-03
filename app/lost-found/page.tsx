"use client";

import { useState } from "react";
import Link from "next/link";
import UserDropdown from "@/components/UserDropdown";

/**
 * LSUS Connect - Lost & Found Page (RESPONSIVE + USER DROPDOWN)
 */

// Mock lost and found items
const lostFoundItems = [
  {
    id: 1,
    type: "Lost",
    title: "Black wallet — 9/28",
    description: "Near Student Union. Contains ID and cards.",
    image: "/api/placeholder/200/200",
    date: "9/28",
  },
  {
    id: 2,
    type: "Found",
    title: "Blue water bottle — 9/29",
    description: "Found outside library. Red keys inside.",
    image: "/api/placeholder/200/200",
    date: "9/29",
  },
  {
    id: 3,
    type: "Lost",
    title: "Earbuds — 9/30",
    description: "Black charging case. Last seen in Cafeteria.",
    image: "/api/placeholder/200/200",
    date: "9/30",
  },
  {
    id: 4,
    type: "Found",
    title: "Winter jacket — 10/01",
    description: "Gray jacket found. Red tag. XL.",
    image: "/api/placeholder/200/200",
    date: "10/01",
  },
  {
    id: 5,
    type: "Lost",
    title: "Bike lock key — 10/02",
    description: "Small brass key near bike racks.",
    image: "/api/placeholder/200/200",
    date: "10/02",
  },
  {
    id: 6,
    type: "Found",
    title: "Textbook — 10/03",
    description: "Psychology 101 textbook. Found in Room 302.",
    image: "/api/placeholder/200/200",
    date: "10/03",
  },
];

export default function LostFoundPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredItems = lostFoundItems.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === "all" || item.type.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#461D7C]">
      {/* Header - Responsive */}
      <header className="bg-[#461D7C] border-b border-[#5a2d8c] py-4 sm:py-6">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          {/* Top Row - Logo & Profile */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-white hover:text-[#FDD023] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              <Link href="/marketplace" className="text-2xl sm:text-3xl font-bold text-white">
                <span className="text-[#FDD023]">LSUS</span> CONNECT
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6">
              <Link href="/marketplace" className="text-white hover:text-[#FDD023] transition-colors text-sm">
                Marketplace
              </Link>
              <UserDropdown />
            </div>

            {/* Mobile Profile */}
            <div className="lg:hidden">
              <UserDropdown />
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mb-4 pb-4 border-b border-[#5a2d8c]">
              <nav className="flex flex-col gap-3">
                <Link href="/marketplace" className="text-white hover:text-[#FDD023] transition-colors py-2 px-3 rounded hover:bg-[#3a1364]">
                  Marketplace
                </Link>
              </nav>
            </div>
          )}

          {/* Search Bar & Report Button - Responsive */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search items or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white text-base placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
              />
            </div>

            {/* Report Button - Touch Optimized */}
            <Link
              href="/post-listing"
              className="min-h-[48px] px-6 sm:px-8 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors whitespace-nowrap text-center"
            >
              + Report Lost Item
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Filter Tabs - Responsive */}
        <div className="flex gap-3 sm:gap-4 mb-6 sm:mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`min-h-[44px] px-6 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              filter === "all"
                ? "bg-[#FDD023] text-black"
                : "bg-[#2a0d44] text-white border border-[#5a2d8c] hover:border-[#FDD023]"
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setFilter("lost")}
            className={`min-h-[44px] px-6 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              filter === "lost"
                ? "bg-[#FDD023] text-black"
                : "bg-[#2a0d44] text-white border border-[#5a2d8c] hover:border-[#FDD023]"
            }`}
          >
            Lost
          </button>
          <button
            onClick={() => setFilter("found")}
            className={`min-h-[44px] px-6 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              filter === "found"
                ? "bg-[#FDD023] text-black"
                : "bg-[#2a0d44] text-white border border-[#5a2d8c] hover:border-[#FDD023]"
            }`}
          >
            Found
          </button>
        </div>

        {/* Items Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#3a1364] rounded-lg overflow-hidden border border-[#5a2d8c] hover:border-[#FDD023] transition-colors"
            >
              {/* Image */}
              <div className="aspect-square bg-[#2a0d44]"></div>

              {/* Content */}
              <div className="p-4 sm:p-5">
                {/* Badge */}
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                    item.type === "Lost"
                      ? "bg-red-500/20 text-red-300"
                      : "bg-green-500/20 text-green-300"
                  }`}
                >
                  {item.type}
                </span>

                {/* Title */}
                <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {item.description}
                </p>

                {/* Contact Button - Touch Optimized */}
                <button className="w-full min-h-[44px] py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors">
                  Contact
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#3a1364] flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-white text-xl font-bold mb-2">No items found</h3>
            <p className="text-gray-300 mb-6">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
