"use client";
import AppLayout from "@/components/AppLayout";
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
    <AppLayout>
      {/* Search + Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-white/10 bg-[#2A0F5A] px-4 py-2">
            <span className="text-[#C4B0E0]">🔍</span>
            <input type="text" placeholder="Search housing near campus..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#8B72BE]" />
          </div>
          <Link href="/post-listing"
            className="rounded-full bg-[#F5A623] px-5 py-2 text-sm font-bold text-[#1E0A42] transition hover:bg-[#FFD166] text-center whitespace-nowrap">
            + Post Housing
          </Link>
        </div>

        {/* Type filters */}
        <div className="flex flex-wrap gap-2">
          {LISTING_TYPES.map(type => (
            <button key={type} onClick={() => setSelectedType(type)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                selectedType === type
                  ? "bg-[#F5A623] text-[#1E0A42]"
                  : "border border-white/10 bg-white/5 text-[#C4B0E0] hover:bg-white/10"
              }`}>
              {type}
            </button>
          ))}
          <div className="w-px bg-white/10" />
          {/* Bedrooms */}
          {[null, 1, 2, 3, 4].map((br, i) => (
            <button key={i} onClick={() => setBedroomsFilter(br)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                bedroomsFilter === br
                  ? "bg-[#F5A623] text-[#1E0A42]"
                  : "border border-white/10 bg-white/5 text-[#C4B0E0] hover:bg-white/10"
              }`}>
              {br === null ? "Any BR" : br === 4 ? "4+ BR" : `${br} BR`}
            </button>
          ))}
        </div>

        {/* Price range */}
        <div className="flex flex-wrap gap-2">
          {PRICE_RANGES.map((range, i) => (
            <button key={i} onClick={() => setSelectedPriceRange(i)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                selectedPriceRange === i
                  ? "bg-[#F5A623] text-[#1E0A42]"
                  : "border border-white/10 bg-white/5 text-[#C4B0E0] hover:bg-white/10"
              }`}>
              {range.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-[#8B72BE]">{filteredListings.length} listing{filteredListings.length !== 1 ? "s" : ""} available</p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="py-20 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#F5A623] border-t-transparent" />
          <p className="mt-4 text-white">Loading housing listings...</p>
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
          <p className="text-4xl mb-3">🏘️</p>
          <p className="text-white font-semibold mb-2">No housing listings found</p>
          <p className="text-[#C4B0E0] text-sm mb-6">Try adjusting your filters or post your own!</p>
          <Link href="/post-listing" className="inline-block rounded-full bg-[#F5A623] px-8 py-3 font-bold text-[#1E0A42] hover:bg-[#FFD166] transition">
            Post Housing
          </Link>
        </div>
      )}

      {/* Grid */}
      {!isLoading && !error && filteredListings.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredListings.map(listing => {
            const owner = Array.isArray(listing.user) ? listing.user[0] : listing.user;
            const isOwn = owner?.id === currentUserId;
            const rent = listing.monthly_rent || listing.price || 0;
            return (
              <div key={listing.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#351470] shadow-[0_4px_24px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-[#F5A623]/40">
                <div className="flex">
                  {/* Image */}
                  <div className="relative h-40 w-40 flex-shrink-0 overflow-hidden bg-[#2A0F5A]">
                    {listing.images?.[0] ? (
                      <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl">🏠</div>
                    )}
                    {listing.listing_type && (
                      <div className="absolute left-2 top-2 rounded-full bg-[#F5A623] px-2 py-0.5 text-[10px] font-bold text-[#1E0A42]">
                        {listing.listing_type}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
                    <div>
                      <p className="text-[#F5A623] text-base font-extrabold mb-0.5">
                        {rent > 0 ? `$${rent.toLocaleString()}/mo` : "Contact for price"}
                      </p>
                      <h3 className="font-bold text-white line-clamp-1 mb-1">{listing.title}</h3>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {listing.bedrooms && <span className="text-[10px] text-[#C4B0E0] bg-white/5 rounded-full px-2 py-0.5">🛏 {listing.bedrooms}bd</span>}
                        {listing.bathrooms && <span className="text-[10px] text-[#C4B0E0] bg-white/5 rounded-full px-2 py-0.5">🚿 {listing.bathrooms}ba</span>}
                        {listing.utilities_included && <span className="text-[10px] text-green-400 bg-green-500/10 rounded-full px-2 py-0.5">⚡ Utils incl.</span>}
                        {listing.pets_allowed && <span className="text-[10px] text-blue-400 bg-blue-500/10 rounded-full px-2 py-0.5">🐾 Pets OK</span>}
                      </div>
                      {listing.location && <p className="text-xs text-[#8B72BE]">📍 {listing.location}</p>}
                      {listing.move_in_date && <p className="text-xs text-[#8B72BE]">📅 Available {formatDate(listing.move_in_date)}</p>}
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
