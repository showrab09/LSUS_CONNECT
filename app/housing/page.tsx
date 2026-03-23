"use client";
import { HorizontalCard, CardItem } from "@/components/ItemCard";

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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredListings.map(listing => {
                  const owner = Array.isArray(listing.user) ? listing.user[0] : listing.user;
                  const rent = listing.monthly_rent || listing.price || 0;
                  const cardItem: CardItem = {
                    id: listing.id,
                    type: "housing",
                    title: listing.title,
                    description: listing.description,
                    price: rent,
                    price_type: rent > 0 ? "PAID" : "FREE",
                    category: "Housing",
                    location: listing.location,
                    images: listing.images,
                    created_at: listing.created_at,
                    user: owner,
                  };
                  return <HorizontalCard key={listing.id} item={cardItem} />;
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
