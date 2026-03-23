"use client";
import AppLayout from "@/components/AppLayout";
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
  const [searchQuery, setSearchQuery] = useState(typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('search') || '' : '');
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams?.get('category') ? [searchParams.get('category')!] : []
  );
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
    <AppLayout>
      {/* Search + Filter Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-white/10 bg-[#2A0F5A] px-4 py-2">
            <span className="text-[#C4B0E0]">🔍</span>
            <input type="text" placeholder="Search listings..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#8B72BE]" />
          </div>
          <Link href="/post-listing"
            className="rounded-full bg-[#F5A623] px-5 py-2 text-sm font-bold text-[#1E0A42] transition hover:bg-[#FFD166] text-center">
            + Create Listing
          </Link>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {/* Categories */}
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => toggleCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                selectedCategories.includes(cat)
                  ? "bg-[#F5A623] text-[#1E0A42]"
                  : "border border-white/10 bg-white/5 text-[#C4B0E0] hover:bg-white/10"
              }`}>
              {cat}
            </button>
          ))}
          <div className="w-px bg-white/10" />
          {/* Price types */}
          {priceTypes.map(pt => (
            <button key={pt.value} onClick={() => togglePriceType(pt.value)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                selectedPriceTypes.includes(pt.value)
                  ? "bg-[#F5A623] text-[#1E0A42]"
                  : "border border-white/10 bg-white/5 text-[#C4B0E0] hover:bg-white/10"
              }`}>
              {pt.label}
            </button>
          ))}
          {(selectedCategories.length > 0 || selectedPriceTypes.length > 0 || searchQuery) && (
            <button onClick={clearFilters} className="rounded-full px-3 py-1 text-xs font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition">
              Clear all ✕
            </button>
          )}
        </div>

        <p className="text-sm text-[#8B72BE]">{filteredListings.length} listing{filteredListings.length !== 1 ? "s" : ""}</p>
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
          {error} <button onClick={fetchListings} className="ml-3 underline">Retry</button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && filteredListings.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-4xl mb-3">🛍️</p>
          <p className="text-white font-semibold mb-2">No listings found</p>
          <p className="text-[#C4B0E0] text-sm mb-6">Try adjusting your filters or be the first to post!</p>
          <Link href="/post-listing" className="inline-block rounded-full bg-[#F5A623] px-8 py-3 font-bold text-[#1E0A42] hover:bg-[#FFD166] transition">
            Post a Listing
          </Link>
        </div>
      )}

      {/* Grid */}
      {!isLoading && !error && filteredListings.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredListings.map(listing => {
            const owner = Array.isArray(listing.user) ? listing.user[0] : listing.user;
            const isOwn = owner?.id === currentUserId;
            return (
              <div key={listing.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#351470] shadow-[0_4px_24px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-[#F5A623]/40">
                <div className="flex">
                  {/* Image */}
                  <div className="relative h-40 w-40 flex-shrink-0 overflow-hidden bg-[#2A0F5A]">
                    {listing.images?.[0] ? (
                      <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl">📦</div>
                    )}
                    {listing.condition && (
                      <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                        {listing.condition}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-[#C4B0E0]">{listing.category}</span>
                        <span className="text-[10px] text-[#8B72BE]">{listing.created_at ? new Date(listing.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                      </div>
                      <h3 className="font-bold text-white line-clamp-1 mb-1">{listing.title}</h3>
                      <p className={`text-base font-extrabold mb-1 ${listing.price_type === 'FREE' ? 'text-green-400' : 'text-[#F5A623]'}`}>
                        {formatPrice(listing)}
                      </p>
                      {listing.description && <p className="line-clamp-2 text-xs text-[#C4B0E0]">{listing.description}</p>}
                      {listing.location && <p className="mt-1 text-xs text-[#8B72BE]">📍 {listing.location}</p>}
                    </div>

                    {/* Footer */}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#FFD166] to-[#F5A623] text-[10px] font-bold text-[#1E0A42]">
                          {owner?.profile_picture
                            ? <img src={owner.profile_picture} alt="" className="h-full w-full object-cover" />
                            : getInitials(owner?.full_name || "U")}
                        </div>
                        <span className="truncate text-xs text-[#C4B0E0]">{owner?.full_name || "Student"}</span>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <Link href={`/product-detail?id=${listing.id}`}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#C4B0E0] hover:bg-white/10 transition">
                          View
                        </Link>
                        {!isOwn && owner?.id && (
                          <div className="[&>div]:!min-h-0 [&_button]:!rounded-full [&_button]:!py-1 [&_button]:!px-3 [&_button]:!text-xs [&_button]:!min-h-0 [&_button]:!w-auto">
                            <MessageSellerButton listingId={listing.id} sellerId={owner.id} listingTitle={listing.title} />
                          </div>
                        )}
                        {isOwn && (
                          <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-[#8B72BE]">Your listing</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
