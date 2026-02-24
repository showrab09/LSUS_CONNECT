"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * LSUS Connect - Marketplace Home Page (FULLY RESPONSIVE)
 * Mobile: 375px (hamburger menu, filter modal, 1 column)
 * Tablet: 768px (2 columns)
 * Desktop: 1024px+ (original layout with sidebar)
 * 
 * INCLUDES: Logout functionality
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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    furniture: false,
    books: false,
    housing: false,
    freeSwap: false,
  });
  
  // Mobile UI state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const toggleFilter = (filter: keyof typeof selectedFilters) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };

  const handleApplyFilters = () => {
    console.log("Applying filters:", selectedFilters);
    setIsFilterModalOpen(false);
    // TODO: Filter listings based on selected filters
  };

  const clearFilters = () => {
    setSelectedFilters({
      furniture: false,
      books: false,
      housing: false,
      freeSwap: false,
    });
  };

  const handleLogout = () => {
    // Clear token from cookie and localStorage
    document.cookie = "token=; path=/; max-age=0";
    localStorage.removeItem("token");
    
    // Redirect to signin
    router.push("/signin");
  };

  const activeFilterCount = Object.values(selectedFilters).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#461D7C]">
      {/* Header - Responsive */}
      <header className="bg-[#461D7C] border-b border-[#5a2d8c] py-3 sm:py-4 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between gap-8">
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

            {/* Profile & Logout */}
            <div className="flex items-center gap-4 text-white text-sm font-medium whitespace-nowrap">
              <Link href="/user-profile" className="hover:text-[#FDD023] transition-colors">Profile</Link>
              <Link href="/" className="hover:text-[#FDD023] transition-colors">Notifications</Link>
              <button 
                onClick={handleLogout}
                className="hover:text-[#FDD023] transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile/Tablet Header */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between mb-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-white hover:text-[#FDD023] transition-colors"
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              {/* Logo */}
              <Link href="/marketplace" className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#FDD023]">LSUS</span>
                <span>CONNECT</span>
              </Link>

              {/* Profile Icon */}
              <Link href="/user-profile" className="p-2 text-white hover:text-[#FDD023] transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            </div>

            {/* Mobile Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 px-4 pr-12 rounded-lg bg-white text-black text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FDD023]"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-[#5a2d8c] pt-4">
              <nav className="flex flex-col gap-3">
                <Link href="/user-profile" className="text-white hover:text-[#FDD023] transition-colors py-2 px-3 rounded hover:bg-[#3a1364]">
                  Profile
                </Link>
                <Link href="/" className="text-white hover:text-[#FDD023] transition-colors py-2 px-3 rounded hover:bg-[#3a1364]">
                  Notifications
                </Link>
                <Link href="/post-listing" className="text-white hover:text-[#FDD023] transition-colors py-2 px-3 rounded hover:bg-[#3a1364]">
                  Post Listing
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-left text-white hover:text-[#FDD023] transition-colors py-2 px-3 rounded hover:bg-[#3a1364]"
                >
                  Logout
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex gap-6 lg:gap-8">
          {/* Desktop Sidebar - Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c] sticky top-24">
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
                  <span className="text-base">Free / Swaps</span>
                </label>
              </div>

              {/* Apply Filters Button */}
              <button
                onClick={handleApplyFilters}
                className="w-full mt-6 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors min-h-[44px]"
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
          <main className="flex-1 min-w-0">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4 flex items-center justify-between">
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="flex items-center gap-2 px-4 py-3 bg-[#3a1364] text-white rounded-lg border border-[#5a2d8c] hover:border-[#FDD023] transition-colors min-h-[44px]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-[#FDD023] text-black text-xs font-bold px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <p className="text-gray-300 text-sm">
                {mockListings.length} listing{mockListings.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Responsive Grid: 1 column (mobile), 2 columns (tablet+) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {mockListings.map((listing) => (
                <Link
                  key={listing.id}
                  href="/product-detail"
                  className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow block"
                >
                  {/* Image */}
                  <div className="relative h-48 sm:h-64 bg-gray-200">
                    <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400"></div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Title */}
                    <h3 className="text-black font-bold text-lg sm:text-xl mb-2 line-clamp-2">
                      {listing.title}
                    </h3>

                    {/* Price */}
                    <p className="text-[#461D7C] font-bold text-base sm:text-lg mb-4">
                      {listing.price}
                    </p>

                    {/* Message Button - Touch friendly */}
                    <div className="w-full py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors text-center min-h-[44px] flex items-center justify-center">
                      Message
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70"
            onClick={() => setIsFilterModalOpen(false)}
          />
          
          {/* Modal */}
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-[#3a1364] shadow-xl overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-xl">Filters</h2>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="p-2 text-white hover:text-[#FDD023] transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Filter Checkboxes */}
              <div className="space-y-4 mb-6">
                <label className="flex items-center gap-3 text-white cursor-pointer py-2">
                  <input
                    type="checkbox"
                    checked={selectedFilters.furniture}
                    onChange={() => toggleFilter("furniture")}
                    className="w-6 h-6 accent-[#FDD023] cursor-pointer"
                  />
                  <span className="text-base">Furniture</span>
                </label>

                <label className="flex items-center gap-3 text-white cursor-pointer py-2">
                  <input
                    type="checkbox"
                    checked={selectedFilters.books}
                    onChange={() => toggleFilter("books")}
                    className="w-6 h-6 accent-[#FDD023] cursor-pointer"
                  />
                  <span className="text-base">Books</span>
                </label>

                <label className="flex items-center gap-3 text-white cursor-pointer py-2">
                  <input
                    type="checkbox"
                    checked={selectedFilters.housing}
                    onChange={() => toggleFilter("housing")}
                    className="w-6 h-6 accent-[#FDD023] cursor-pointer"
                  />
                  <span className="text-base">Housing</span>
                </label>

                <label className="flex items-center gap-3 text-white cursor-pointer py-2">
                  <input
                    type="checkbox"
                    checked={selectedFilters.freeSwap}
                    onChange={() => toggleFilter("freeSwap")}
                    className="w-6 h-6 accent-[#FDD023] cursor-pointer"
                  />
                  <span className="text-base">Free / Swaps</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={clearFilters}
                  className="flex-1 py-3 bg-[#2a0d44] text-white rounded-lg border border-[#5a2d8c] hover:border-[#FDD023] transition-colors font-semibold min-h-[48px]"
                >
                  Clear All
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 py-3 bg-[#FDD023] text-black rounded-lg hover:bg-[#FFE34A] transition-colors font-bold min-h-[48px]"
                >
                  Apply
                </button>
              </div>

              {/* Help Links */}
              <div className="mt-8 pt-6 border-t border-[#5a2d8c]">
                <div className="space-y-3">
                  <Link 
                    href="/contact-team" 
                    className="block text-gray-300 hover:text-[#FDD023] transition-colors py-2"
                    onClick={() => setIsFilterModalOpen(false)}
                  >
                    Help
                  </Link>
                  <Link 
                    href="/contact-team" 
                    className="block text-gray-300 hover:text-[#FDD023] transition-colors py-2"
                    onClick={() => setIsFilterModalOpen(false)}
                  >
                    About
                  </Link>
                  <Link 
                    href="/contact-team" 
                    className="block text-gray-300 hover:text-[#FDD023] transition-colors py-2"
                    onClick={() => setIsFilterModalOpen(false)}
                  >
                    Report Issue
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
