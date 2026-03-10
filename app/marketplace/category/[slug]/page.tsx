"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import UserDropdown from "@/components/UserDropdown";
import SaveButton from "@/components/SaveButton";

/**
 * LSUS Connect - Category Page
 * Shows all listings in a specific category
 */

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  price_type: "PAID" | "FREE" | "SWAP";
  category: string;
  condition: string;
  location: string;
  images: string[];
  tags: string[];
  status: string;
  created_at: string;
  user_id: string;
}

const CATEGORIES = [
  { slug: "electronics", name: "Electronics", icon: "💻" },
  { slug: "furniture", name: "Furniture", icon: "🛋️" },
  { slug: "books", name: "Books", icon: "📚" },
  { slug: "clothing", name: "Clothing", icon: "👕" },
  { slug: "housing", name: "Housing", icon: "🏠" },
  { slug: "home", name: "Home", icon: "🏡" },
  { slug: "other", name: "Other", icon: "📦" },
];

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.slug as string;
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriceTypes, setSelectedPriceTypes] = useState<string[]>([]);

  const priceTypes = [
    { value: "PAID", label: "For Sale" },
    { value: "FREE", label: "Free" },
    { value: "SWAP", label: "Trade/Swap" },
  ];

  // Get current category info
  const currentCategory = CATEGORIES.find(
    cat => cat.slug === categorySlug.toLowerCase()
  );

  const categoryName = currentCategory?.name || categorySlug;
  const categoryIcon = currentCategory?.icon || "📦";

  useEffect(() => {
    fetchListings();
  }, [categorySlug]);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/listings', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }

      const data = await response.json();
      setListings(data.listings || []);
      setError("");
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError("Failed to load listings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePriceType = (value: string) => {
    setSelectedPriceTypes(prev =>
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  const clearFilters = () => {
    setSelectedPriceTypes([]);
    setSearchQuery("");
  };

  // Filter listings by category and other filters
  const filteredListings = listings.filter((listing) => {
    // Category filter (case-insensitive)
    const matchesCategory = listing.category.toLowerCase() === categorySlug.toLowerCase();

    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (listing.tags && listing.tags.some(tag =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ));

    // Price type filter
    const matchesPriceType =
      selectedPriceTypes.length === 0 ||
      selectedPriceTypes.includes(listing.price_type);

    // Only show active listings
    const isActive = listing.status === "ACTIVE";

    return matchesCategory && matchesSearch && matchesPriceType && isActive;
  });

  const formatPrice = (listing: Listing) => {
    if (listing.price_type === "FREE") return "Free";
    if (listing.price_type === "SWAP") return "Trade/Swap";
    return `$${listing.price.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-[#461D7C]">
      {/* Header */}
      <header className="bg-[#3a1364] border-b border-[#5a2d8c] sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/marketplace" className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-[#FDD023]">LSUS</span>
              <span>CONNECT</span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <input
                type="text"
                placeholder={`Search in ${categoryName}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
              />
            </div>

            <div className="flex items-center gap-3">
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c] sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-lg">Filters</h2>
                {(selectedPriceTypes.length > 0 || searchQuery) && (
                  <button
                    onClick={clearFilters}
                    className="text-[#FDD023] text-xs hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Price Type */}
              <div>
                <h3 className="text-white font-semibold mb-3 text-sm">Price Type</h3>
                <div className="space-y-2">
                  {priceTypes.map((type) => (
                    <label
                      key={type.value}
                      className="flex items-center gap-2 text-white text-sm cursor-pointer hover:text-[#FDD023] transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPriceTypes.includes(type.value)}
                        onChange={() => togglePriceType(type.value)}
                        className="w-4 h-4 rounded border-[#5a2d8c] bg-[#2a0d44] text-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
                      />
                      <span>{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* All Categories Link */}
              <div className="mt-6 pt-6 border-t border-[#5a2d8c]">
                <Link
                  href="/marketplace"
                  className="text-[#FDD023] hover:text-[#FFE34A] text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  All Categories
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Category Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{categoryIcon}</span>
                <h1 className="text-white text-3xl font-bold">{categoryName}</h1>
              </div>
              <p className="text-gray-300">
                Browse all {categoryName.toLowerCase()} listings
              </p>
            </div>

            {/* Results Count & Create Button */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-white text-sm">
                {!isLoading && (
                  <>
                    {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''}
                    {searchQuery && ` for "${searchQuery}"`}
                  </>
                )}
              </div>
              <Link
                href="/post-listing"
                className="px-6 py-2.5 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
              >
                + Create Listing
              </Link>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-[#FDD023] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white mt-4">Loading listings...</p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg p-4 mb-6">
                {error}
                <button onClick={fetchListings} className="ml-4 underline hover:text-red-200">
                  Retry
                </button>
              </div>
            )}

            {/* Listings Grid */}
            {!isLoading && !error && (
              <>
                {filteredListings.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#3a1364] flex items-center justify-center text-4xl">
                      {categoryIcon}
                    </div>
                    <h3 className="text-white text-xl font-bold mb-2">
                      {searchQuery ? `No results for "${searchQuery}"` : `No ${categoryName.toLowerCase()} listings yet`}
                    </h3>
                    <p className="text-gray-300 mb-6">
                      {searchQuery ? "Try a different search term" : `Be the first to post a ${categoryName.toLowerCase()} listing!`}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="inline-block px-8 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors mr-4"
                      >
                        Clear Search
                      </button>
                    )}
                    <Link
                      href="/post-listing"
                      className="inline-block px-8 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
                    >
                      Create Listing
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredListings.map((listing) => (
                      <Link
                        key={listing.id}
                        href={`/product-detail?id=${listing.id}`}
                        className="bg-[#3a1364] rounded-lg overflow-hidden border border-[#5a2d8c] hover:border-[#FDD023] transition-all hover:transform hover:scale-105"
                      >
                        {/* Image */}
                        <div className="aspect-square bg-[#2a0d44] relative">
                          {listing.images && listing.images.length > 0 ? (
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                              No image
                            </div>
                          )}
                          {/* Condition Badge */}
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {listing.condition}
                          </div>
                          {/* Save Button */}
                          <div className="absolute top-2 left-2">
                            <SaveButton listingId={listing.id} size="md" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                            {listing.title}
                          </h3>
                          <p className="text-[#FDD023] font-bold text-xl mb-2">
                            {formatPrice(listing)}
                          </p>
                          <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                            {listing.description}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">{listing.location}</span>
                            <span className="text-gray-400">{listing.category}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}