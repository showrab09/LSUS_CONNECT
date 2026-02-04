"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * LSUS Connect - Lost & Found Page
 * Brand Compliant with LSUS Brand Guidelines (January 2026)
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
    title: "Sunglasses — 10/03",
    description: "Black Ray. Style sunglasses. Case included.",
    image: "/api/placeholder/200/200",
    date: "10/03",
  },
];

export default function LostFoundPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");

  const filteredItems = lostFoundItems.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === "all" || item.type.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#461D7C]">
      {/* Header */}
      <header className="bg-[#461D7C] border-b border-[#5a2d8c] py-6">
        <div className="max-w-[1400px] mx-auto px-6">
          {/* Logo */}
          <Link href="/" className="text-3xl font-bold text-white inline-block mb-6">
            <span className="text-[#FDD023]">LSUS</span> CONNECT
          </Link>

          {/* Search Bar & Report Button */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <input
                type="text"
                placeholder="Search items or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
              />
            </div>

            {/* Report Lost Item Button */}
            <Link href="/post-listing" className="px-8 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors whitespace-nowrap inline-block">
              + Report Lost Item
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              filter === "all"
                ? "bg-[#FDD023] text-black"
                : "bg-[#3a1364] text-white border border-[#5a2d8c] hover:border-[#FDD023]"
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setFilter("lost")}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              filter === "lost"
                ? "bg-[#FDD023] text-black"
                : "bg-[#3a1364] text-white border border-[#5a2d8c] hover:border-[#FDD023]"
            }`}
          >
            Lost Items
          </button>
          <button
            onClick={() => setFilter("found")}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              filter === "found"
                ? "bg-[#FDD023] text-black"
                : "bg-[#3a1364] text-white border border-[#5a2d8c] hover:border-[#FDD023]"
            }`}
          >
            Found Items
          </button>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#3a1364] rounded-lg overflow-hidden border border-[#5a2d8c] hover:border-[#FDD023] transition-all hover:shadow-lg hover:shadow-[#FDD023]/20"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-700">
                <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800"></div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Type Badge */}
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
                    item.type === "Lost"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  }`}
                >
                  {item.type}
                </span>

                {/* Title */}
                <h3 className="text-white font-bold text-lg mb-2">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {item.description}
                </p>

                {/* Contact Button */}
                <Link href="/contact-team" className="block w-full py-2 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors text-center">
                  Contact
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white text-lg mb-2">No items found</p>
            <p className="text-gray-400 text-sm">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
