"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import UserDropdown from "@/components/UserDropdown";
import SaveButton from "@/components/SaveButton";
import MessageSellerButton from "@/components/MessageSellerButton";

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

const CATEGORIES = ["Electronics", "Furniture", "Books", "Clothing", "Housing", "Home", "Other"];

const NAV_LINKS = [
  { href: "/home", label: "Home" },
  { href: "/marketplace", label: "Marketplace", active: true },
  { href: "/housing", label: "Housing" },
  { href: "/social", label: "Social" },
  { href: "/lost-found", label: "Lost & Found" },
  { href: "/post-listing", label: "Post a Listing" },
];

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceTypes, setSelectedPriceTypes] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    } catch {
      setError("Failed to load listings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(i => i !== category) : [...prev, category]
    );
  };

  const togglePriceType = (value: string) => {
    setSelectedPriceTypes(prev =>
      prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]
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
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(listing.category);
    const matchesPriceType = selectedPriceTypes.length === 0 || selectedPriceTypes.includes(listing.price_type);
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
    <div className="min-h-screen bg-[#461D7C]">
      {/* Header */}
      <header className="bg-[#3a1364] border-b border-[#5a2d8c] sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">

            {/* Logo + Hamburger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-white hover:text-[#FDD023] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  }
                </svg>
              </button>
              <Link href="/home" className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-[#FDD023]">LSUS</span>
                <span>CONNECT</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-5">
              {NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href} className={`text-sm transition-colors ${
                  link.active
                    ? "text-[#FDD023] font-semibold border-b-2 border-[#FDD023] pb-0.5"
                    : "text-white hover:text-[#FDD023]"
                }`}>
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Search + Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-56 h-10 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023]"
                />
              </div>
              <Link href="/post-listing" className="hidden sm:block px-5 py-2 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors text-sm whitespace-nowrap">
                + Create Listing
              </Link>
              <UserDropdown />
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-3">
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023]"
            />
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <nav className="lg:hidden mt-3 pt-3 border-t border-[#5a2d8c] flex flex-col gap-1">
              {NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}
                  className={`py-2 px-3 rounded transition-colors ${
                    link.active ? "text-[#FDD023]" : "text-white hover:text-[#FDD023] hover:bg-[#461D7C]"
                  }`}>
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
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
                {(selectedCategories.length > 0 || selectedPriceTypes.length > 0 || searchQuery) && (
                  <button onClick={clearFilters} className="text-[#FDD023] text-xs hover:underline">
                    Clear all
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-3 text-sm">Category</h3>
                <div className="space-y-2">
                  {CATEGORIES.map((category) => (
                    <label key={category} className="flex items-center gap-2 text-white text-sm cursor-pointer hover:text-[#FDD023] transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="w-4 h-4 accent-[#FDD023]"
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Type */}
              <div>
                <h3 className="text-white font-semibold mb-3 text-sm">Price Type</h3>
                <div className="space-y-2">
                  {priceTypes.map((type) => (
                    <label key={type.value} className="flex items-center gap-2 text-white text-sm cursor-pointer hover:text-[#FDD023] transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedPriceTypes.includes(type.value)}
                        onChange={() => togglePriceType(type.value)}
                        className="w-4 h-4 accent-[#FDD023]"
                      />
                      <span>{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="text-white text-sm">
                {!isLoading && (
                  <>{filteredListings.length} listing{filteredListings.length !== 1 ? "s" : ""}{searchQuery && ` for "${searchQuery}"`}</>
                )}
              </div>
              <Link href="/post-listing" className="sm:hidden px-6 py-2.5 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors">
                + Create
              </Link>
            </div>

            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-[#FDD023] border-t-transparent rounded-full animate-spin" />
                <p className="text-white mt-4">Loading listings...</p>
              </div>
            )}

            {error && !isLoading && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg p-4 mb-6">
                {error}
                <button onClick={fetchListings} className="ml-4 underline hover:text-red-200">Retry</button>
              </div>
            )}

            {!isLoading && !error && (
              <>
                {filteredListings.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#3a1364] flex items-center justify-center text-4xl">📦</div>
                    <h3 className="text-white text-xl font-bold mb-2">
                      {searchQuery ? `No results for "${searchQuery}"` : "No listings yet"}
                    </h3>
                    <p className="text-gray-300 mb-6">
                      {searchQuery ? "Try a different search term" : "Be the first to post a listing!"}
                    </p>
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="inline-block px-8 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors mr-4">
                        Clear Search
                      </button>
                    )}
                    <Link href="/post-listing" className="inline-block px-8 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors">
                      Create Listing
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredListings.map((listing) => {
                      const owner = Array.isArray(listing.user) ? listing.user[0] : listing.user;
                      const ownerName = owner?.full_name || "Unknown User";
                      const ownerProfilePic = owner?.profile_picture;
                      const isOwnListing = owner?.id === currentUserId;

                      return (
                        <div key={listing.id} className="bg-[#3a1364] rounded-lg overflow-hidden border border-[#5a2d8c] hover:border-[#FDD023] transition-all">
                          <Link href={`/product-detail?id=${listing.id}`} className="block">
                            <div className="aspect-square bg-[#2a0d44] relative">
                              {listing.images && listing.images.length > 0 ? (
                                <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover"
                                  onError={(e) => { e.currentTarget.style.display = "none"; }} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">No image</div>
                              )}
                              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                {listing.condition}
                              </div>
                              <div className="absolute top-2 left-2">
                                <SaveButton listingId={listing.id} size="md" />
                              </div>
                            </div>
                          </Link>

                          <div className="p-4">
                            <Link href={`/product-detail?id=${listing.id}`}>
                              <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 hover:text-[#FDD023]">{listing.title}</h3>
                            </Link>
                            <p className="text-[#FDD023] font-bold text-xl mb-2">{formatPrice(listing)}</p>
                            <p className="text-gray-300 text-sm mb-3 line-clamp-2">{listing.description}</p>

                            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#5a2d8c]">
                              <div className="w-8 h-8 rounded-full bg-[#FDD023] flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {ownerProfilePic ? (
                                  <img src={ownerProfilePic} alt={ownerName} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-black font-bold text-xs">{getInitials(ownerName)}</span>
                                )}
                              </div>
                              <span className="text-gray-300 text-sm">{ownerName}</span>
                            </div>

                            {!isOwnListing && owner?.id && (
                              <MessageSellerButton listingId={listing.id} sellerId={owner.id} listingTitle={listing.title} />
                            )}
                            {isOwnListing && (
                              <div className="text-center py-2 px-4 bg-[#2a0d44] rounded-lg">
                                <span className="text-gray-400 text-sm">Your listing</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-xs mt-3">
                              <span className="text-gray-400">{listing.location}</span>
                              <span className="text-gray-400">{listing.category}</span>
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
