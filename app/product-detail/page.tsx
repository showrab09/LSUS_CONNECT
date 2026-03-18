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
      <div className="min-h-screen bg-[#1E0A42] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white text-lg">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[#1E0A42] text-white">
        <header className="bg-[#351470] border-b border-white/10">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <Link href="/home" className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-white">LSUS</span>
                <span className="text-[#F5A623]"> Connect</span>
              </Link>
              <UserDropdown />
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <h1 className="text-white text-2xl font-bold mb-4">Listing Not Found</h1>
            <p className="text-[#C4B0E0] mb-6">This listing may have been removed or doesn't exist.</p>
            <Link
              href="/marketplace"
              className="inline-block rounded-full bg-[#F5A623] px-8 py-3 font-bold text-[#1E0A42] transition hover:bg-[#FFD166] hover:bg-[#FFD166] transition-colors"
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
    <div className="min-h-screen bg-[#1E0A42] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#2E1065]/95 backdrop-blur">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/home" className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-white">LSUS</span>
              <span className="text-[#F5A623]"> Connect</span>
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
          className="inline-flex items-center gap-2 text-[#F5A623] hover:text-[#FFE34A] mb-6 transition-colors"
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
            <div className="rounded-2xl bg-[#351470] overflow-hidden border border-white/10 mb-4 relative">
              <div className="aspect-square bg-[#2A0F5A] relative">
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
                  <div className="w-full h-full flex items-center justify-center text-[#8B72BE]">
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
                        ? 'border-[#F5A623]'
                        : 'border-white/10 hover:border-[#F5A623]/50'
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
            <div className="rounded-2xl bg-[#351470] p-6 border border-white/10">
              {/* Title */}
              <h1 className="text-white text-3xl font-bold mb-4">{listing.title}</h1>

              {/* Price */}
              <div className="mb-6">
                <p className="text-[#F5A623] text-4xl font-bold">{formatPrice()}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-white/10">
                <div>
                  <p className="text-[#8B72BE] text-sm mb-1">Category</p>
                  <p className="text-white font-semibold">{listing.category}</p>
                </div>
                <div>
                  <p className="text-[#8B72BE] text-sm mb-1">Condition</p>
                  <p className="text-white font-semibold">{listing.condition}</p>
                </div>
                <div>
                  <p className="text-[#8B72BE] text-sm mb-1">Location</p>
                  <p className="text-white font-semibold">{listing.location}</p>
                </div>
                <div>
                  <p className="text-[#8B72BE] text-sm mb-1">Posted</p>
                  <p className="text-white font-semibold">{formatDate(listing.created_at)}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-white text-xl font-bold mb-3">Description</h2>
                <p className="text-[#C4B0E0] whitespace-pre-wrap">{listing.description}</p>
              </div>

              {/* Tags */}
              {listing.tags && listing.tags.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-white text-xl font-bold mb-3">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {listing.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#2A0F5A] text-[#F5A623] rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Seller Info */}
              {listing.user && (
                <div className="mb-6 pb-6 border-b border-white/10">
                  <h2 className="text-white text-xl font-bold mb-3">Seller</h2>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD166] to-[#F5A623] flex items-center justify-center border-2 border-[#F5A623]">
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
                      <p className="text-[#8B72BE] text-sm">Member</p>
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
                  <div className="bg-[#2A0F5A] border border-white/10 rounded-lg p-4 text-center">
                    <p className="text-[#8B72BE] text-sm">This is your listing</p>
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