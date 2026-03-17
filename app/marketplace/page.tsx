"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import UserDropdown from "@/components/UserDropdown";
import SaveButton from "@/components/SaveButton";
import MessageSellerButton from "@/components/MessageSellerButton";

/**
 * LSUS Connect - Marketplace Page
 * Browse, search, and filter listings
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
  user?: {
    id: string;
    full_name: string;
    email: string;
    profile_picture?: string;
  };
}

const CATEGORIES = [
  "Electronics",
  "Furniture",
  "Books",
  "Clothing",
  "Housing",
  "Home",
  "Other",
];

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceTypes, setSelectedPriceTypes] = useState<string[]>([]);

  const priceTypes = [
    { value: "PAID", label: "For Sale" },
    { value: "FREE", label: "Free" },
    { value: "SWAP", label: "Trade/Swap" },
  ];

  const getCurrentUserId = (): string => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return "";
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
      );
      return JSON.parse(jsonPayload).userId || "";
    } catch { return ""; }
  };

  const currentUserId = getCurrentUserId();

  useEffect(() => { fetchListings(); }, []);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/listings", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch listings");
      const data = await response.json();
      setListings(data.listings || []);
      setError("");
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError("Failed to load listings. Please try again.");
    } finally { setIsLoading(false); }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(item => item !== category) : [...prev, category]
    );
  };

  const togglePriceType = (value: string) => {
    setSelectedPriceTypes(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceTypes([]);
    setSearchQuery("");
  };

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      searchQuery === "" ||
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (listing.tags && listing.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(listing.category);

    const matchesPriceType =
      selectedPriceTypes.length === 0 || selectedPriceTypes.includes(listing.price_type);

    return matchesSearch && matchesCategory && matchesPriceType;
  });

  const formatPrice = (listing: Listing) => {
    if (listing.price_type === "FREE") return "Free";
    if (listing.price_type === "SWAP") return "Trade/Swap";
    return `$${listing.price.toFixed(2)}`;
  };

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-[#1E0A42] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#2E1065]/95 backdrop-blur">
        <div className="mx-auto flex h-[60px] max-w-[1920px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/home" className="text-xl font-extrabold tracking-tight">
            <span className="text-white">LSUS</span>
            <span className="text-[#F5A623]"> Connect</span>
          </Link>

          {/* Search Bar */}
          <div className="flex max-w-2xl flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <span className="text-[#C4B0E0]">🔍</span>
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#8B72BE]"
            />
          </div>

          <div className="flex items-center gap-3">
            <Link href="/post-listing"
              className="hidden sm:block rounded-full bg-[#F5A623] px-5 py-2 text-sm font-bold text-[#1E0A42] transition hover:bg-[#FFD166]">
              + Create Listing
            </Link>
            <UserDropdown />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-[1920px] px-4 py-6 sm:px-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-24 rounded-2xl border border-white/10 bg-[#351470] p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Filters</h2>
                {(selectedCategories.length > 0 || selectedPriceTypes.length > 0 || searchQuery) && (
                  <button onClick={clearFilters} className="text-xs text-[#F5A623] hover:underline">
                    Clear all
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-semibold text-white">Category</h3>
                <div className="space-y-2">
                  {CATEGORIES.map((category) => (
                    <label key={category}
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 text-sm text-[#C4B0E0] transition hover:bg-white/5 hover:text-white">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="h-4 w-4 accent-[#F5A623]"
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Type */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-white">Price Type</h3>
                <div className="space-y-2">
                  {priceTypes.map((type) => (
                    <label key={type.value}
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 text-sm text-[#C4B0E0] transition hover:bg-white/5 hover:text-white">
                      <input
                        type="checkbox"
                        checked={selectedPriceTypes.includes(type.value)}
                        onChange={() => togglePriceType(type.value)}
                        className="h-4 w-4 accent-[#F5A623]"
                      />
                      <span>{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="min-w-0 flex-1">
            {/* Results count + mobile create */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-[#C4B0E0]">
                {!isLoading && (
                  <>
                    {filteredListings.length} listing{filteredListings.length !== 1 ? "s" : ""}
                    {searchQuery && ` for "${searchQuery}"`}
                  </>
                )}
              </p>
              <Link href="/post-listing"
                className="sm:hidden rounded-full bg-[#F5A623] px-5 py-2 text-sm font-bold text-[#1E0A42] transition hover:bg-[#FFD166]">
                + Create
              </Link>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="py-20 text-center">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#F5A623] border-t-transparent" />
                <p className="mt-4 text-white">Loading listings...</p>
              </div>
            )}

            {/* Error */}
            {error && !isLoading && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                {error}
                <button onClick={fetchListings} className="ml-4 underline hover:text-red-200">Retry</button>
              </div>
            )}

            {/* Listings Grid */}
            {!isLoading && !error && (
              <>
                {filteredListings.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#351470] text-4xl">📦</div>
                    <h3 className="mb-2 text-xl font-bold text-white">
                      {searchQuery ? `No results for "${searchQuery}"` : "No listings yet"}
                    </h3>
                    <p className="mb-6 text-[#C4B0E0]">
                      {searchQuery ? "Try a different search term" : "Be the first to post a listing!"}
                    </p>
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")}
                        className="mr-4 inline-block rounded-full bg-[#F5A623] px-8 py-3 font-bold text-[#1E0A42] transition hover:bg-[#FFD166]">
                        Clear Search
                      </button>
                    )}
                    <Link href="/post-listing"
                      className="inline-block rounded-full bg-[#F5A623] px-8 py-3 font-bold text-[#1E0A42] transition hover:bg-[#FFD166]">
                      Create Listing
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredListings.map((listing) => {
                      const owner = Array.isArray(listing.user) ? listing.user[0] : listing.user;
                      const ownerName = owner?.full_name || "Unknown User";
                      const ownerProfilePic = owner?.profile_picture;
                      const isOwnListing = owner?.id === currentUserId;

                      return (
                        <div key={listing.id}
                          className="overflow-hidden rounded-2xl border border-white/10 bg-[#351470] shadow-[0_4px_24px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-[#F5A623]/40">
                          {/* Image */}
                          <Link href={`/product-detail?id=${listing.id}`} className="block">
                            <div className="relative aspect-square bg-[#2A0F5A]">
                              {listing.images && listing.images.length > 0 ? (
                                <img
                                  src={listing.images[0]}
                                  alt={listing.title}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.parentElement!.innerHTML =
                                      '<div class="flex h-full w-full items-center justify-center text-[#8B72BE]">Image unavailable</div>';
                                  }}
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[#8B72BE]">No image</div>
                              )}
                              {/* Condition Badge */}
                              <div className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
                                {listing.condition}
                              </div>
                              {/* Save Button */}
                              <div className="absolute left-2 top-2">
                                <SaveButton listingId={listing.id} size="md" />
                              </div>
                            </div>
                          </Link>

                          {/* Content */}
                          <div className="p-4">
                            <Link href={`/product-detail?id=${listing.id}`}>
                              <h3 className="mb-2 line-clamp-2 text-lg font-bold text-white hover:text-[#F5A623]">
                                {listing.title}
                              </h3>
                            </Link>
                            <p className="mb-2 text-xl font-bold text-[#F5A623]">{formatPrice(listing)}</p>
                            <p className="mb-4 line-clamp-2 text-sm text-[#C4B0E0]">{listing.description}</p>

                            {/* Owner Info */}
                            <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#F5A623] bg-gradient-to-br from-[#FFD166] to-[#F5A623]">
                                {ownerProfilePic ? (
                                  <img src={ownerProfilePic} alt={ownerName} className="h-full w-full rounded-full object-cover" />
                                ) : (
                                  <span className="text-xs font-bold text-[#1E0A42]">{getInitials(ownerName)}</span>
                                )}
                              </div>
                              <span className="text-sm text-[#C4B0E0]">{ownerName}</span>
                            </div>

                            {/* Message Button */}
                            {!isOwnListing && owner?.id && (
                              <MessageSellerButton
                                listingId={listing.id}
                                sellerId={owner.id}
                                listingTitle={listing.title}
                              />
                            )}

                            {/* Own Listing */}
                            {isOwnListing && (
                              <div className="rounded-xl bg-[#2A0F5A] py-2 text-center">
                                <span className="text-sm text-[#8B72BE]">Your listing</span>
                              </div>
                            )}

                            {/* Metadata */}
                            <div className="mt-3 flex items-center justify-between text-xs text-[#8B72BE]">
                              <span>📍 {listing.location}</span>
                              <span>{listing.category}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
