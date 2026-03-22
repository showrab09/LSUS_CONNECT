"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import UserDropdown from "@/components/UserDropdown";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import SaveButton from "@/components/SaveButton";
import MessageSellerButton from "@/components/MessageSellerButton";

interface HousingListing {
  id: string;
  title: string;
  description: string;
  price: number;
  price_type: string;
  category: string;
  location: string;
  images: string[];
  tags: string[];
  status: string;
  created_at: string;
  user_id: string;
  // Housing-specific fields
  listing_type?: string;
  monthly_rent?: number;
  location_type?: string;
  move_in_date?: string;
  lease_length?: string;
  bedrooms?: number;
  bathrooms?: number;
  utilities_included?: boolean;
  pets_allowed?: boolean;
  gender_preference?: string;
  smoking_allowed?: boolean;
  user?: {
    id: string;
    full_name: string;
    email: string;
    profile_picture?: string;
  };
}

const LISTING_TYPES = ["All", "Apartment", "House", "Room", "Studio", "Condo", "Townhouse"];
const PRICE_RANGES = [
  { label: "Any Price", min: 0, max: Infinity },
  { label: "Under $500", min: 0, max: 500 },
  { label: "$500 – $800", min: 500, max: 800 },
  { label: "$800 – $1200", min: 800, max: 1200 },
  { label: "$1200+", min: 1200, max: Infinity },
];

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateString?: string) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function HousingPage() {
  const [listings, setListings] = useState<HousingListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [bedroomsFilter, setBedroomsFilter] = useState<number | null>(null);

  const { currentUser } = useCurrentUser();
  const currentUserId = currentUser.id;

  useEffect(() => { fetchListings(); }, []);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/listings?category=Housing&limit=50", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch listings");
      const data = await res.json();
      // Filter to only Housing category
      const housing = (data.listings || []).filter((l: HousingListing) => l.category === "Housing");
      setListings(housing);
      setError("");
    } catch (err) {
      setError("Failed to load housing listings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const priceRange = PRICE_RANGES[selectedPriceRange];

  const filteredListings = listings.filter(listing => {
    const matchesSearch =
      searchQuery === "" ||
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedType === "All" ||
      listing.listing_type?.toLowerCase() === selectedType.toLowerCase();

    const price = listing.monthly_rent || listing.price || 0;
    const matchesPrice = price >= priceRange.min && price <= priceRange.max;

    const matchesBedrooms =
      bedroomsFilter === null ||
      (bedroomsFilter === 4 ? (listing.bedrooms || 0) >= 4 : listing.bedrooms === bedroomsFilter);

    return matchesSearch && matchesType && matchesPrice && matchesBedrooms;
  });

  return (
    <div className="min-h-screen bg-[#1E0A42] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#2E1065]/95 backdrop-blur">
        <div className="mx-auto flex h-[60px] max-w-[1920px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/home" className="text-xl font-extrabold tracking-tight">
            <span className="text-white">LSUS</span>
            <span className="text-[#F5A623]"> Connect</span>
          </Link>

          {/* Search */}
          <div className="flex max-w-xl flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <span className="text-[#C4B0E0]">🔍</span>
            <input
              type="text"
              placeholder="Search housing near campus..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#8B72BE]"
            />
          </div>

          <div className="flex items-center gap-3">
            <Link href="/post-listing"
              className="hidden sm:block rounded-full bg-[#F5A623] px-5 py-2 text-sm font-bold text-[#1E0A42] transition hover:bg-[#FFD166]">
              + Post Housing
            </Link>
            <UserDropdown />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1920px] px-4 py-6 sm:px-6">
        <div className="flex gap-6">

          {/* Sidebar Filters */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-24 rounded-2xl border border-white/10 bg-[#351470] p-6">
              <h2 className="mb-6 text-lg font-bold text-white">Filters</h2>

              {/* Listing Type */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-semibold text-white">Type</h3>
                <div className="space-y-2">
                  {LISTING_TYPES.map(type => (
                    <label key={type} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 text-sm text-[#C4B0E0] transition hover:bg-white/5 hover:text-white">
                      <input type="radio" name="type" checked={selectedType === type}
                        onChange={() => setSelectedType(type)} className="accent-[#F5A623]" />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-semibold text-white">Monthly Rent</h3>
                <div className="space-y-2">
                  {PRICE_RANGES.map((range, i) => (
                    <label key={range.label} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 text-sm text-[#C4B0E0] transition hover:bg-white/5 hover:text-white">
                      <input type="radio" name="price" checked={selectedPriceRange === i}
                        onChange={() => setSelectedPriceRange(i)} className="accent-[#F5A623]" />
                      <span>{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-white">Bedrooms</h3>
                <div className="flex flex-wrap gap-2">
                  {[null, 1, 2, 3, 4].map(n => (
                    <button key={String(n)} onClick={() => setBedroomsFilter(n)}
                      className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${bedroomsFilter === n
                        ? "bg-[#F5A623] text-[#1E0A42]"
                        : "border border-white/10 bg-white/5 text-[#C4B0E0] hover:bg-white/10"}`}>
                      {n === null ? "Any" : n === 4 ? "4+" : `${n} BR`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              {(selectedType !== "All" || selectedPriceRange !== 0 || bedroomsFilter !== null || searchQuery) && (
                <button onClick={() => { setSelectedType("All"); setSelectedPriceRange(0); setBedroomsFilter(null); setSearchQuery(""); }}
                  className="mt-6 w-full rounded-full bg-white/10 py-2 text-sm font-bold text-[#C4B0E0] transition hover:bg-white/20">
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="min-w-0 flex-1">

            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">Housing Near Campus</h1>
              <p className="text-sm text-[#C4B0E0]">
                {!isLoading && `${filteredListings.length} listing${filteredListings.length !== 1 ? "s" : ""} available`}
              </p>
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

            {/* Empty State */}
            {!isLoading && !error && filteredListings.length === 0 && (
              <div className="py-20 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#351470] text-4xl">🏠</div>
                <h3 className="mb-2 text-xl font-bold text-white">
                  {searchQuery ? `No results for "${searchQuery}"` : "No housing listings yet"}
                </h3>
                <p className="mb-6 text-[#C4B0E0]">
                  {searchQuery ? "Try a different search or clear your filters" : "Be the first to post a housing listing!"}
                </p>
                <Link href="/post-listing"
                  className="inline-block rounded-full bg-[#F5A623] px-8 py-3 font-bold text-[#1E0A42] transition hover:bg-[#FFD166]">
                  Post Housing Listing
                </Link>
              </div>
            )}

            {/* Listings Grid */}
            {!isLoading && !error && filteredListings.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredListings.map(listing => {
                  const owner = Array.isArray(listing.user) ? listing.user[0] : listing.user;
                  const ownerName = owner?.full_name || "Unknown";
                  const ownerPic = owner?.profile_picture;
                  const isOwnListing = owner?.id === currentUserId;
                  const rent = listing.monthly_rent || listing.price || 0;

                  return (
                    <div key={listing.id}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-[#351470] shadow-[0_4px_24px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-[#F5A623]/40">

                      {/* Image */}
                      <Link href={`/product-detail?id=${listing.id}`} className="block">
                        <div className="relative h-48 bg-[#2A0F5A]">
                          {listing.images && listing.images.length > 0 ? (
                            <img src={listing.images[0]} alt={listing.title}
                              className="h-full w-full object-cover"
                              onError={e => { e.currentTarget.style.display = "none"; }} />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-5xl">🏠</div>
                          )}
                          {/* Type badge */}
                          {listing.listing_type && (
                            <div className="absolute left-2 top-2 rounded-full bg-[#F5A623] px-3 py-1 text-xs font-bold text-[#1E0A42]">
                              {listing.listing_type}
                            </div>
                          )}
                          {/* Save button */}
                          <div className="absolute right-2 top-2">
                            <SaveButton listingId={listing.id} size="md" />
                          </div>
                        </div>
                      </Link>

                      {/* Content */}
                      <div className="p-4">
                        <Link href={`/product-detail?id=${listing.id}`}>
                          <h3 className="mb-1 line-clamp-2 text-lg font-bold text-white hover:text-[#F5A623]">
                            {listing.title}
                          </h3>
                        </Link>

                        {/* Price */}
                        <p className="mb-2 text-xl font-bold text-[#F5A623]">
                          {rent > 0 ? `$${rent.toLocaleString()}/mo` : "Contact for price"}
                        </p>

                        {/* Key details */}
                        <div className="mb-3 flex flex-wrap gap-2">
                          {listing.bedrooms && (
                            <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-[#C4B0E0]">
                              🛏 {listing.bedrooms} bed{listing.bedrooms > 1 ? "s" : ""}
                            </span>
                          )}
                          {listing.bathrooms && (
                            <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-[#C4B0E0]">
                              🚿 {listing.bathrooms} bath{listing.bathrooms > 1 ? "s" : ""}
                            </span>
                          )}
                          {listing.utilities_included && (
                            <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-400 border border-green-500/20">
                              ⚡ Utilities incl.
                            </span>
                          )}
                          {listing.pets_allowed && (
                            <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs text-blue-400 border border-blue-500/20">
                              🐾 Pets OK
                            </span>
                          )}
                        </div>

                        <p className="mb-3 line-clamp-2 text-sm text-[#C4B0E0]">{listing.description}</p>

                        {/* Location & Move-in */}
                        <div className="mb-4 space-y-1 text-xs text-[#8B72BE]">
                          {listing.location && <p>📍 {listing.location}</p>}
                          {listing.move_in_date && <p>📅 Available {formatDate(listing.move_in_date)}</p>}
                          {listing.lease_length && <p>📋 {listing.lease_length}</p>}
                        </div>

                        {/* Owner */}
                        <div className="mb-4 flex items-center gap-2 border-t border-white/10 pt-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#F5A623] bg-gradient-to-br from-[#FFD166] to-[#F5A623]">
                            {ownerPic ? (
                              <img src={ownerPic} alt={ownerName} className="h-full w-full object-cover rounded-full" />
                            ) : (
                              <span className="text-xs font-bold text-[#1E0A42]">{getInitials(ownerName)}</span>
                            )}
                          </div>
                          <span className="text-sm text-[#C4B0E0]">{ownerName}</span>
                        </div>

                        {/* Message / Own listing */}
                        {!isOwnListing && owner?.id && (
                          <MessageSellerButton
                            listingId={listing.id}
                            sellerId={owner.id}
                            listingTitle={listing.title}
                          />
                        )}
                        {isOwnListing && (
                          <div className="rounded-xl bg-[#2A0F5A] py-2 text-center">
                            <span className="text-sm text-[#8B72BE]">Your listing</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
