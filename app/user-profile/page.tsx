"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * LSUS Connect - User Profile Page (FULLY RESPONSIVE)
 * Mobile: Stacked layout, hamburger menu
 * Tablet: 2-column grid for listings
 * Desktop: Full layout with stats
 */

// Mock user data
const mockUser = {
  id: 1,
  name: "John Doe",
  email: "john.doe@lsus.edu",
  avatar: "/api/placeholder/128/128",
  stats: {
    listings: 12,
    sold: 8,
    rating: 4.8
  }
};

// Mock user listings
const mockListings = [
  { id: 1, title: "Gaming Laptop", price: "$800", image: "/api/placeholder/300/200", status: "Active" },
  { id: 2, title: "Desk Chair", price: "$50", image: "/api/placeholder/300/200", status: "Active" },
  { id: 3, title: "Textbooks", price: "$120", image: "/api/placeholder/300/200", status: "Sold" },
];

export default function UserProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"listings" | "saved">("listings");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    document.cookie = "token=; path=/; max-age=0";
    localStorage.removeItem("token");
    router.push("/signin");
  };

  return (
    <div className="min-h-screen bg-[#461D7C]">
      {/* Header - Responsive */}
      <header className="bg-[#3a1364] border-b border-[#5a2d8c] sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/marketplace" className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-[#FDD023]">LSUS</span>
              <span>CONNECT</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4 text-white text-sm">
              <Link href="/marketplace" className="hover:text-[#FDD023] transition-colors">
                Marketplace
              </Link>
              <Link href="/post-listing" className="hover:text-[#FDD023] transition-colors">
                Post Listing
              </Link>
              <button 
                onClick={handleLogout}
                className="hover:text-[#FDD023] transition-colors"
              >
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

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-[#5a2d8c] pt-4">
              <nav className="flex flex-col gap-3">
                <Link href="/marketplace" className="text-white hover:text-[#FDD023] transition-colors py-2 px-3 rounded hover:bg-[#461D7C]">
                  Marketplace
                </Link>
                <Link href="/post-listing" className="text-white hover:text-[#FDD023] transition-colors py-2 px-3 rounded hover:bg-[#461D7C]">
                  Post Listing
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-left text-white hover:text-[#FDD023] transition-colors py-2 px-3 rounded hover:bg-[#461D7C]"
                >
                  Logout
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Profile Header Card */}
        <div className="bg-[#3a1364] rounded-lg p-6 sm:p-8 border border-[#5a2d8c] mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-600 flex-shrink-0 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-gray-500 to-gray-700"></div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-white text-2xl sm:text-3xl font-bold mb-2">{mockUser.name}</h1>
              <p className="text-gray-300 mb-4">{mockUser.email}</p>

              {/* Stats - Responsive Grid */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 mb-4">
                <div>
                  <p className="text-[#FDD023] text-2xl font-bold">{mockUser.stats.listings}</p>
                  <p className="text-gray-300 text-sm">Listings</p>
                </div>
                <div>
                  <p className="text-[#FDD023] text-2xl font-bold">{mockUser.stats.sold}</p>
                  <p className="text-gray-300 text-sm">Sold</p>
                </div>
                <div>
                  <p className="text-[#FDD023] text-2xl font-bold">{mockUser.stats.rating}</p>
                  <p className="text-gray-300 text-sm">Rating</p>
                </div>
              </div>

              {/* Edit Profile Button */}
              <button className="w-full sm:w-auto px-6 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors min-h-[48px]">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Tabs - Responsive */}
        <div className="flex gap-2 sm:gap-4 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("listings")}
            className={`px-4 sm:px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap min-h-[44px] ${
              activeTab === "listings"
                ? "bg-[#FDD023] text-black"
                : "bg-[#3a1364] text-white border border-[#5a2d8c] hover:border-[#FDD023]"
            }`}
          >
            My Listings
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`px-4 sm:px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap min-h-[44px] ${
              activeTab === "saved"
                ? "bg-[#FDD023] text-black"
                : "bg-[#3a1364] text-white border border-[#5a2d8c] hover:border-[#FDD023]"
            }`}
          >
            Saved Items
          </button>
        </div>

        {/* Listings Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {mockListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-[#3a1364] rounded-lg overflow-hidden border border-[#5a2d8c] hover:border-[#FDD023] transition-all"
            >
              {/* Image */}
              <div className="aspect-video bg-gray-700">
                <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800"></div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-bold text-base sm:text-lg">{listing.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    listing.status === "Active" 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-gray-500/20 text-gray-400"
                  }`}>
                    {listing.status}
                  </span>
                </div>

                <p className="text-[#FDD023] font-bold mb-3">{listing.price}</p>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-[#2a0d44] text-white text-sm rounded-lg border border-[#5a2d8c] hover:border-[#FDD023] transition-colors min-h-[44px]">
                    Edit
                  </button>
                  <button className="flex-1 py-2 bg-[#2a0d44] text-white text-sm rounded-lg border border-[#5a2d8c] hover:border-red-500 transition-colors min-h-[44px]">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (when no listings) */}
        {mockListings.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#3a1364] flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-white text-xl font-bold mb-2">No listings yet</h3>
            <p className="text-gray-300 mb-6">Start selling by creating your first listing!</p>
            <Link
              href="/post-listing"
              className="inline-block px-6 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors min-h-[48px]"
            >
              Create Listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
