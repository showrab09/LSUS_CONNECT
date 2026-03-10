"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import UserDropdown from "@/components/UserDropdown";
import MessageSellerButton from "@/components/MessageSellerButton";
import SaveButton from "@/components/SaveButton";

/**
 * LSUS Connect - Product Detail Page (WITH MESSAGE SELLER BUTTON)
 */

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  price_type: string;
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
    profile_picture?: string;
  };
}

export default function ProductDetailPage() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get("id");

  const [listing, setListing] = useState<Listing | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    if (listingId) {
      fetchListing();
    }
    getCurrentUserId();
  }, [listingId]);

  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      const decoded = JSON.parse(jsonPayload);
      setCurrentUserId(decoded.userId || "");
    } catch (e) {
      console.error("Error getting user ID:", e);
    }
  };

  const fetchListing = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/listings/${listingId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Listing not found');
      }

      const data = await response.json();
      setListing(data.listing);
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const nextImage = () => {
    if (listing && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
    }
  };

  const prevImage = () => {
    if (listing && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  const formatPrice = () => {
    if (!listing) return "";
    if (listing.price_type === "FREE") return "Free";
    if (listing.price_type === "SWAP") return "Trade/Swap";
    return `$${listing.price.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

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

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[#461D7C]">
        <header className="bg-[#3a1364] border-b border-[#5a2d8c]">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <Link href="/marketplace" className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-[#FDD023]">LSUS</span>
                <span>CONNECT</span>
              </Link>
              <UserDropdown />
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <h1 className="text-white text-2xl font-bold mb-4">Listing Not Found</h1>
            <p className="text-gray-300 mb-6">This listing may have been removed or doesn't exist.</p>
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

  const isOwnListing = currentUserId === listing.user_id;

  return (
    <div className="min-h-screen bg-[#461D7C]">
      {/* Header */}
      <header className="bg-[#3a1364] border-b border-[#5a2d8c] sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/marketplace" className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-[#FDD023]">LSUS</span>
              <span>CONNECT</span>
            </Link>
            <div className="flex items-center gap-4">
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Back Button */}
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-[#FDD023] hover:text-[#FFE34A] mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div>
            {/* Main Image */}
            <div className="bg-[#3a1364] rounded-lg overflow-hidden border border-[#5a2d8c] mb-4 relative">
              <div className="aspect-square bg-[#2a0d44] relative">
                {listing.images && listing.images.length > 0 ? (
                  <>
                    <img
                      src={listing.images[currentImageIndex]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Save Button */}
                    <div className="absolute top-4 right-4">
                      <SaveButton listingId={listing.id} size="lg" />
                    </div>
                    {/* Navigation Arrows */}
                    {listing.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No image available
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {listing.images && listing.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index
                        ? 'border-[#FDD023]'
                        : 'border-[#5a2d8c] hover:border-[#FDD023]/50'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${listing.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div>
            <div className="bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c]">
              {/* Title */}
              <h1 className="text-white text-3xl font-bold mb-4">{listing.title}</h1>

              {/* Price */}
              <div className="mb-6">
                <p className="text-[#FDD023] text-4xl font-bold">{formatPrice()}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-[#5a2d8c]">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Category</p>
                  <p className="text-white font-semibold">{listing.category}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Condition</p>
                  <p className="text-white font-semibold">{listing.condition}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Location</p>
                  <p className="text-white font-semibold">{listing.location}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Posted</p>
                  <p className="text-white font-semibold">{formatDate(listing.created_at)}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-white text-xl font-bold mb-3">Description</h2>
                <p className="text-gray-300 whitespace-pre-wrap">{listing.description}</p>
              </div>

              {/* Tags */}
              {listing.tags && listing.tags.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-white text-xl font-bold mb-3">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {listing.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#2a0d44] text-[#FDD023] rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Seller Info */}
              {listing.user && (
                <div className="mb-6 pb-6 border-b border-[#5a2d8c]">
                  <h2 className="text-white text-xl font-bold mb-3">Seller</h2>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FDD023] to-[#FFE34A] flex items-center justify-center border-2 border-[#FDD023]">
                      {listing.user.profile_picture ? (
                        <img
                          src={listing.user.profile_picture}
                          alt={listing.user.full_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-black font-bold text-lg">
                          {getInitials(listing.user.full_name)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{listing.user.full_name}</p>
                      <p className="text-gray-400 text-sm">Member</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {!isOwnListing ? (
                  <MessageSellerButton
                    listingId={listing.id}
                    sellerId={listing.user_id}
                    listingTitle={listing.title}
                  />
                ) : (
                  <div className="bg-[#2a0d44] border border-[#5a2d8c] rounded-lg p-4 text-center">
                    <p className="text-gray-400 text-sm">This is your listing</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}