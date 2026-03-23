"use client";
import { HorizontalCard, CardItem } from "@/components/ItemCard";

import { useState, useEffect } from "react";
import Link from "next/link";
import UserDropdown from "@/components/UserDropdown";
import { useCurrentUser } from "@/hooks/useCurrentUser";
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

  const { currentUser } = useCurrentUser();
  const currentUserId = currentUser.id;

  useEffect(() => { fetchListings(); }, []);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/listings", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch listings");
      const data = await response.json();
      // Exclude Housing — those belong on the Housing page
      setListings((data.listings || []).filter((l: any) => l.category !== "Housing"));
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
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredListings.map((listing) => {
                      const owner = Array.isArray(listing.user) ? listing.user[0] : listing.user;
                      const cardItem: CardItem = {
                        id: listing.id,
                        type: "listing",
                        title: listing.title,
                        description: listing.description,
                        price: listing.price,
                        price_type: listing.price_type,
                        category: listing.category,
                        condition: listing.condition,
                        location: listing.location,
                        images: listing.images,
                        created_at: listing.created_at,
                        user: owner,
                      };
                      return <HorizontalCard key={listing.id} item={cardItem} />;
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
