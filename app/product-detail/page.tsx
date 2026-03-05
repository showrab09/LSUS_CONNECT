"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import UserDropdown from "@/components/UserDropdown";

/**
 * LSUS Connect - Product Detail Page (DYNAMIC - FETCHES FROM API)
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
    name: string;
    email: string;
  };
}

export default function ProductDetailPage() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get("id");

  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [message, setMessage] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (listingId) {
      fetchListing(listingId);
    } else {
      setError("No listing ID provided");
      setIsLoading(false);
    }
  }, [listingId]);

  const fetchListing = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/listings/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch listing');
      }

      const data = await response.json();
      setListing(data.listing || data);
      setError("");
    } catch (err) {
      console.error("Error fetching listing:", err);
      setError("Failed to load listing. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = () => {
    if (!listing) return "";
    if (listing.price_type === "FREE") return "Free";
    if (listing.price_type === "SWAP") return "Trade/Swap";
    return `$${listing.price.toFixed(2)}`;
  };

  const handleSendMessage = () => {
    console.log("Sending message:", message);
    // TODO: Implement message sending
    setMessage("");
  };

  const handleSaveItem = () => {
    console.log("Saving item:", listingId);
    // TODO: Implement save functionality
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#461D7C] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[#FDD023] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white text-lg">Loading listing...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[#461D7C]">
        <header className="bg-[#3a1364] border-b border-[#5a2d8c] py-4">
          <div className="max-w-[1600px] mx-auto px-6">
            <Link href="/marketplace" className="text-2xl font-bold text-white">
              <span className="text-[#FDD023]">LSUS</span> CONNECT
            </Link>
          </div>
        </header>
        <div className="max-w-[1600px] mx-auto px-6 py-16 text-center">
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg p-8 inline-block">
            <h2 className="text-2xl font-bold mb-4">Listing Not Found</h2>
            <p className="mb-6">{error || "This listing could not be loaded."}</p>
            <Link
              href="/marketplace"
              className="inline-block px-8 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#461D7C]">
      {/* Header - Responsive */}
      <header className="bg-[#3a1364] border-b border-[#5a2d8c] py-3 sm:py-4 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <Link href="/marketplace" className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-[#FDD023]">LSUS</span>
              <span>CONNECT</span>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-white text-sm">
              <Link href="/marketplace" className="hover:text-[#FDD023] transition-colors">
                Back to listings
              </Link>
              <UserDropdown />
            </div>

            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-white hover:text-[#FDD023] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              <UserDropdown />
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-[#5a2d8c] pt-4">
              <nav className="flex flex-col gap-3">
                <Link href="/marketplace" className="text-white hover:text-[#FDD023] transition-colors py-2 px-3 rounded hover:bg-[#461D7C]">
                  Back to listings
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Responsive */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-white text-sm">
          <Link href="/marketplace" className="hover:text-[#FDD023] transition-colors">
            Home
          </Link>
          <span className="mx-2">›</span>
          <Link href="/marketplace" className="hover:text-[#FDD023] transition-colors">
            {listing.category}
          </Link>
          <span className="mx-2">›</span>
          <span className="text-gray-300">{listing.title}</span>
        </div>

        {/* Product Grid - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6 lg:gap-8">
          {/* Left Column - Images & Details */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="bg-[#2a0d44] rounded-lg overflow-hidden border border-[#5a2d8c]">
              <div className="aspect-video bg-gray-700">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[selectedImage]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No image available
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Images - Responsive Grid */}
            {listing.images && listing.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === idx
                        ? "border-[#FDD023]"
                        : "border-[#5a2d8c] hover:border-[#FDD023]/50"
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Product Details */}
            <div className="bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c]">
              <h2 className="text-white font-bold text-xl mb-4">Details</h2>
              <div className="space-y-3 text-white">
                <div className="flex justify-between py-2 border-b border-[#5a2d8c]">
                  <span className="text-gray-300">Condition</span>
                  <span className="font-semibold">{listing.condition}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#5a2d8c]">
                  <span className="text-gray-300">Category</span>
                  <span className="font-semibold">{listing.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#5a2d8c]">
                  <span className="text-gray-300">Location</span>
                  <span className="font-semibold">{listing.location}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-300">Posted</span>
                  <span className="font-semibold">
                    {new Date(listing.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c]">
              <h2 className="text-white font-bold text-xl mb-4">Description</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
              
              {listing.tags && listing.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {listing.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[#2a0d44] text-[#FDD023] text-sm rounded-full border border-[#5a2d8c]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Seller & Actions */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c] sticky top-24">
              <div className="mb-6">
                <h1 className="text-white font-bold text-2xl sm:text-3xl mb-2">{listing.title}</h1>
                <p className="text-[#FDD023] font-bold text-3xl sm:text-4xl">{formatPrice()}</p>
              </div>

              {/* Seller Info */}
              <div className="mb-6 pb-6 border-b border-[#5a2d8c]">
                <h3 className="text-white font-semibold mb-3">Seller</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#FDD023] flex items-center justify-center text-black font-bold text-xl">
                    {listing.user?.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {listing.user?.name || "Anonymous User"}
                    </p>
                    <p className="text-gray-400 text-sm">{listing.user?.email || "No email"}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Touch Optimized */}
              <div className="space-y-3">
                <button
                  onClick={() => console.log("Message seller")}
                  className="w-full min-h-[48px] py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
                >
                  Message Seller
                </button>
                <button
                  onClick={handleSaveItem}
                  className="w-full min-h-[48px] py-3 bg-[#2a0d44] text-white font-semibold rounded-lg border border-[#5a2d8c] hover:border-[#FDD023] transition-colors"
                >
                  Save Item
                </button>
              </div>

              {/* Safety Tips */}
              <div className="mt-6 p-4 bg-[#2a0d44] rounded-lg border border-[#5a2d8c]">
                <h4 className="text-[#FDD023] font-semibold mb-2 text-sm">Safety Tips</h4>
                <ul className="text-gray-300 text-xs space-y-1">
                  <li>• Meet in a public place</li>
                  <li>• Check the item before buying</li>
                  <li>• Don't share personal info</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
