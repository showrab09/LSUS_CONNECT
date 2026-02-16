"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";

/**
 * LSUS Connect - Home Page / Marketplace Feed
 * Brand Compliant with LSUS Brand Guidelines (January 2026)
 *
 * ─── SWITCHING TO PRODUCTION DATA ────────────────────────────────────────
 * 1. Set USE_MOCK_DATA to false below.
 * 2. Replace the body of fetchListings() with your real API call:
 *        const res = await fetch("/api/listings");
 *        return res.json();
 *    Make sure your API returns an array that matches the Listing type.
 * 3. Done. Mock data, the simulated delay, and the mock array are all ignored.
 * ─────────────────────────────────────────────────────────────────────────
 */

// ┌─────────────────────────────────────────┐
// │  FLIP THIS TO false WHEN GOING LIVE     │
// └─────────────────────────────────────────┘
const USE_MOCK_DATA = true;

// ─── Shared type — mock data and your API must both conform to this ─────────
interface Listing {
  id: number;
  title: string;
  price: number;
  image: string;
  user: {
    name: string;
    avatar: string;
    time: string;
  };
  category: string;
  condition: string;
  delivery: string;
}

// ─── Mock data (only used when USE_MOCK_DATA is true) ────────────────────────
const MOCK_LISTINGS: Listing[] = [
  {
    id: 1,
    title: "Office Desk",
    price: 120,
    image: "/api/placeholder/300/200",
    user: { name: "Sarah Mitchell", avatar: "/api/placeholder/40/40", time: "2 hours ago" },
    category: "Furniture",
    condition: "Good",
    delivery: "Pickup",
  },
  {
    id: 2,
    title: "Office Chair",
    price: 80,
    image: "/api/placeholder/300/200",
    user: { name: "Sarah Mitchell", avatar: "/api/placeholder/40/40", time: "2 hours ago" },
    category: "Furniture",
    condition: "Like New",
    delivery: "Delivery Available",
  },
  {
    id: 3,
    title: "Gaming Setup",
    price: 450,
    image: "/api/placeholder/300/200",
    user: { name: "Jason White", avatar: "/api/placeholder/40/40", time: "5 hours ago" },
    category: "Electronics",
    condition: "Good",
    delivery: "Shipping",
  },
  {
    id: 4,
    title: "Textbooks Bundle",
    price: 45,
    image: "/api/placeholder/300/200",
    user: { name: "Emma Davis", avatar: "/api/placeholder/40/40", time: "1 day ago" },
    category: "Books",
    condition: "Fair",
    delivery: "Pickup",
  },
  {
    id: 5,
    title: "Storage Containers",
    price: 25,
    image: "/api/placeholder/300/200",
    user: { name: "Michael Chen", avatar: "/api/placeholder/40/40", time: "1 day ago" },
    category: "Home",
    condition: "New",
    delivery: "Pickup",
  },
  {
    id: 6,
    title: "House for Rent",
    price: 1200,
    image: "/api/placeholder/300/200",
    user: { name: "Bryan Smith", avatar: "/api/placeholder/40/40", time: "2 days ago" },
    category: "Housing",
    condition: "New",
    delivery: "Delivery Available",
  },
];

// ─── Data fetcher — single place to swap mock vs real ────────────────────────
async function fetchListings(): Promise<Listing[]> {
  if (USE_MOCK_DATA) {
    // Simulate network latency so loading state is visible during dev
    await new Promise((resolve) => setTimeout(resolve, 800));
    return MOCK_LISTINGS;
  }

  // ── PRODUCTION: replace with your actual API call ──
  // const res = await fetch("/api/listings");
  // if (!res.ok) throw new Error("Failed to fetch listings");
  // return res.json();

  throw new Error("Production fetch not yet implemented");
}

// ─── Skeleton card rendered while data is loading ───────────────────────────
function ListingSkeleton() {
  return (
    <div className="bg-[#3a1364] rounded-lg overflow-hidden border border-[#5a2d8c] animate-pulse">
      <div className="h-48 bg-[#2a0d44]" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#2a0d44]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-[#2a0d44] rounded w-3/4" />
            <div className="h-2 bg-[#2a0d44] rounded w-1/2" />
          </div>
        </div>
        <div className="h-4 bg-[#2a0d44] rounded w-2/3" />
        <div className="h-5 bg-[#2a0d44] rounded w-1/3" />
        <div className="h-9 bg-[#2a0d44] rounded w-full" />
      </div>
    </div>
  );
}

export default function HomePage() {
  // ─── Data state ──────────────────────────────────────────────────────────
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ─── Filter state ────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<string[]>([]);

  const categories = [
    "All Categories",
    "Electronics",
    "Furniture",
    "Books",
    "Clothing",
    "Housing",
    "Home",
    "Other",
  ];
  const conditions = ["New", "Like New", "Good", "Fair"];
  const deliveryOptions = ["Pickup", "Delivery Available", "Shipping"];

  // ─── Fetch on mount ──────────────────────────────────────────────────────
  const loadListings = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await fetchListings();
      setListings(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  // ─── Filter toggles ──────────────────────────────────────────────────────
  const toggleCondition = (condition: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    );
  };

  const toggleDelivery = (delivery: string) => {
    setSelectedDelivery((prev) =>
      prev.includes(delivery)
        ? prev.filter((d) => d !== delivery)
        : [...prev, delivery]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setPriceRange([0, 1500]);
    setSelectedConditions([]);
    setSelectedDelivery([]);
  };

  // ─── Derived filtered list ───────────────────────────────────────────────
  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.user.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All Categories" ||
        listing.category === selectedCategory;

      const matchesPrice =
        listing.price >= priceRange[0] && listing.price <= priceRange[1];

      const matchesCondition =
        selectedConditions.length === 0 ||
        selectedConditions.includes(listing.condition);

      const matchesDelivery =
        selectedDelivery.length === 0 ||
        selectedDelivery.includes(listing.delivery);

      return matchesSearch && matchesCategory && matchesPrice && matchesCondition && matchesDelivery;
    });
  }, [listings, searchQuery, selectedCategory, priceRange, selectedConditions, selectedDelivery]);

  // ─── Determine which main-feed state to render ──────────────────────────
  // Priority: error → loading → empty (zero listings in DB) → filtered-empty → populated
  const getFeedState = (): "error" | "loading" | "empty" | "filtered-empty" | "populated" => {
    if (fetchError) return "error";
    if (isLoading) return "loading";
    if (listings.length === 0) return "empty";
    if (filteredListings.length === 0) return "filtered-empty";
    return "populated";
  };

  const feedState = getFeedState();

  return (
    <div className="min-h-screen bg-[#461D7C]">
      {/* Header */}
      <header className="bg-[#3a1364] border-b border-[#5a2d8c]">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-[#FDD023]">LSUS</span>
              <span>CONNECT</span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 px-4 pr-12 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FDD023] hover:text-[#FFE34A]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-white hover:text-[#FDD023] transition-colors">
                Home
              </Link>
              <Link href="/user-profile" className="text-white hover:text-[#FDD023] transition-colors">
                My Listings
              </Link>
              <Link href="/" className="text-white hover:text-[#FDD023] transition-colors">
                Messages
              </Link>
              <Link href="/post-listing" className="px-6 py-2 bg-[#FDD023] text-black font-semibold rounded-lg hover:bg-[#FFE34A] transition-colors">
                Post Listing
              </Link>
              <Link href="/user-profile" className="w-10 h-10 rounded-full bg-[#2a0d44] border-2 border-[#FDD023] overflow-hidden">
                <div className="w-full h-full bg-gray-600"></div>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c] sticky top-8">
              <h2 className="text-white font-bold text-lg mb-4">Filters</h2>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-[#FDD023] font-semibold text-sm mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === category
                          ? "bg-[#FDD023] text-black font-semibold"
                          : "text-white hover:bg-[#2a0d44]"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-[#FDD023] font-semibold text-sm mb-3">Price Range</h3>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="1500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full accent-[#FDD023]"
                  />
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1].toLocaleString()}{priceRange[1] < 1500 ? "" : "+"}</span>
                  </div>
                </div>
              </div>

              {/* Condition */}
              <div className="mb-6">
                <h3 className="text-[#FDD023] font-semibold text-sm mb-3">Condition</h3>
                <div className="space-y-2">
                  {conditions.map((condition) => (
                    <label key={condition} className="flex items-center gap-2 text-white text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-[#FDD023]"
                        checked={selectedConditions.includes(condition)}
                        onChange={() => toggleCondition(condition)}
                      />
                      <span>{condition}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Delivery */}
              <div>
                <h3 className="text-[#FDD023] font-semibold text-sm mb-3">Delivery</h3>
                <div className="space-y-2">
                  {deliveryOptions.map((delivery) => (
                    <label key={delivery} className="flex items-center gap-2 text-white text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-[#FDD023]"
                        checked={selectedDelivery.includes(delivery)}
                        onChange={() => toggleDelivery(delivery)}
                      />
                      <span>{delivery}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="flex-1">

            {/* STATE: fetch error */}
            {feedState === "error" && (
              <div className="flex flex-col items-center justify-center py-24 bg-[#3a1364] rounded-lg border border-[#5a2d8c]">
                <p className="text-red-400 text-lg font-semibold mb-2">Failed to load listings</p>
                <p className="text-gray-400 text-sm mb-4">{fetchError}</p>
                <button
                  onClick={loadListings}
                  className="px-6 py-2 bg-[#FDD023] text-black font-semibold rounded-lg hover:bg-[#FFE34A] transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* STATE: loading skeletons */}
            {feedState === "loading" && (
              <div className="grid grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ListingSkeleton key={i} />
                ))}
              </div>
            )}

            {/* STATE: no listings exist at all (fresh launch / empty DB) */}
            {feedState === "empty" && (
              <div className="flex flex-col items-center justify-center py-32 bg-[#3a1364] rounded-lg border border-[#5a2d8c]">
                <div className="w-20 h-20 rounded-full bg-[#2a0d44] flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-[#FDD023]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h2 className="text-white text-2xl font-bold mb-3">No listings yet</h2>
                <p className="text-gray-400 text-sm text-center max-w-md mb-6">
                  LSUS Connect is brand new — be the first to post something and get the marketplace started.
                </p>
                <Link
                  href="/post-listing"
                  className="px-8 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
                >
                  Post the First Listing
                </Link>
              </div>
            )}

            {/* STATE: listings exist but filters knocked them all out */}
            {feedState === "filtered-empty" && (
              <div className="flex flex-col items-center justify-center py-24 bg-[#3a1364] rounded-lg border border-[#5a2d8c]">
                <p className="text-white text-lg font-semibold mb-2">No listings match your filters</p>
                <p className="text-gray-400 text-sm mb-4">Try adjusting your search or filters</p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2 bg-[#FDD023] text-black font-semibold rounded-lg hover:bg-[#FFE34A] transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* STATE: populated grid */}
            {feedState === "populated" && (
              <div className="grid grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href="/product-detail"
                    className="bg-[#3a1364] rounded-lg overflow-hidden border border-[#5a2d8c] hover:border-[#FDD023] transition-all hover:shadow-lg hover:shadow-[#FDD023]/20 block"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gray-700">
                      <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800"></div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* User Info */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gray-600"></div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-semibold">{listing.user.name}</p>
                          <p className="text-gray-400 text-xs">{listing.user.time}</p>
                        </div>
                      </div>

                      {/* Title & Price */}
                      <h3 className="text-white font-bold text-lg mb-1">{listing.title}</h3>
                      <p className="text-[#FDD023] font-bold text-xl mb-3">
                        {listing.category === "Housing"
                          ? `$${listing.price.toLocaleString()}/mo`
                          : `$${listing.price.toLocaleString()}`}
                      </p>

                      {/* Action Button */}
                      <div className="w-full py-2 bg-[#2a0d44] text-white rounded-lg border border-[#5a2d8c] hover:bg-[#FDD023] hover:text-black hover:border-[#FDD023] transition-colors font-semibold text-center">
                        Leave a Comment
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>

          {/* Right Sidebar - Ads */}
          <aside className="w-80 flex-shrink-0">
            <div className="space-y-6 sticky top-8">
              <div className="bg-[#FDD023] rounded-lg p-6 text-center">
                <h3 className="text-black font-bold text-xl mb-2">STUDENT DISCOUNT</h3>
                <p className="text-black text-4xl font-bold mb-2">15% off</p>
                <p className="text-black text-sm">At Macbooks</p>
              </div>

              <div className="bg-[#FDD023] rounded-lg p-6 text-center">
                <h3 className="text-black font-bold text-xl mb-2">STUDENT DISCOUNT</h3>
                <p className="text-black text-4xl font-bold mb-2">15% off</p>
                <p className="text-black text-sm">At Textbooks</p>
              </div>

              <div className="bg-white rounded-lg overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-center">
                  <h3 className="font-bold text-lg">ACADEMY Deal DAYS</h3>
                  <p className="text-sm">Up to 30% off + Extra 20% off</p>
                </div>
              </div>

              <div className="bg-orange-500 rounded-lg p-6 text-center">
                <h3 className="text-white font-bold text-xl">PRO FOOTBALL</h3>
                <h3 className="text-white font-bold text-xl">HALL OF FAME</h3>
                <p className="text-white text-sm mt-2">CELEBRATE THE GAME</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
