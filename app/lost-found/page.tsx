"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * LSUS Connect - Lost & Found Page (FULLY RESPONSIVE)
 * Mobile: Stacked layout, 1 column grid
 * Tablet: 2 column grid
 * Desktop: 3 column grid
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
    description: "Black Ray-Ban style sunglasses. Case included.",
    image: "/api/placeholder/200/200",
    date: "10/03",
  },
];

export default function LostFoundPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredItems = lostFoundItems.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || item.type.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  const handleLogout = () => {
    document.cookie = "token=; path=/; max-age=0";
    localStorage.removeItem("token");
    router.push("/signin");
  };

  return (
    <div className="min-h-screen bg-[#461D7C]">
      {/* Header - Responsive */}
      <header className="bg-[#461D7C] border-b border-[#5a2d8c] py-4 sm:py-6 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            {/* Logo */}
            <Link href="/marketplace" className="text-2xl sm:text-3xl font-bold text-white">
              <span className="text-[#FDD023]">LSUS</span> CONNECT
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-4 text-white text-sm">
              <Link href="/marketplace" className="hover:text-[#FDD023] transition-colors">
                Marketplace
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
            <div className="md:hidden mb-4 pb-4 border-t border-[#5a2d8c] pt-4">
              <nav className="flex flex-col gap-3">
                <Link href="/marketplace" className="text-white hover:text-[#FDD023] transition-colors py-2 px-3 rounded hover:bg-[#3a1364]">
                  Marketplace
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

          {/* Search Bar & Report Button - Responsive */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 sm:h-14 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white text-base placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
              />
            </div>

            {/* Report Button */}
            <Link 
              href="/post-listing" 
              className="min-h-[48px] sm:min-h-[56px] px-6 sm:px-8 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors whitespace-nowrap flex items-center justify-center"
            >
              + Report Item
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Filter Tabs - Scrollable on mobile */}
        <div className="flex gap-3 sm:gap-4 mb-6 sm:mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 sm:px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap min-h-[44px] ${
              filter === "all"
                ? "bg-[#FDD023] text-black"
                : "bg-[#3a1364] text-white border border-[#5a2d8c] hover:border-[#FDD023]"
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setFilter("lost")}
            className={`px-4 sm:px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap min-h-[44px] ${
              filter === "lost"
                ? "bg-[#FDD023] text-black"
                : "bg-[#3a1364] text-white border border-[#5a2d8c] hover:border-[#FDD023]"
            }`}
          >
            Lost Items
          </button>
          <button
            onClick={() => setFilter("found")}
            className={`px-4 sm:px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap min-h-[44px] ${
              filter === "found"
                ? "bg-[#FDD023] text-black"
                : "bg-[#3a1364] text-white border border-[#5a2d8c] hover:border-[#FDD023]"
            }`}
          >
            Found Items
          </button>
        </div>

        {/* Items Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#3a1364] rounded-lg overflow-hidden border border-[#5a2d8c] hover:border-[#FDD023] transition-all hover:shadow-lg hover:shadow-[#FDD023]/20"
            >
              {/* Image */}
              <div className="relative aspect-video sm:h-48 bg-gray-700">
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
                <h3 className="text-white font-bold text-base sm:text-lg mb-2">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {item.description}
                </p>

                {/* Contact Button - Touch friendly */}
                <Link 
                  href="/contact-team" 
                  className="block w-full min-h-[44px] py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors text-center flex items-center justify-center"
                >
                  Contact
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#3a1364] flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-white text-lg sm:text-xl font-bold mb-2">No items found</p>
            <p className="text-gray-400 text-sm sm:text-base mb-6">
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilter("all");
              }}
              className="px-6 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors min-h-[48px]"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
