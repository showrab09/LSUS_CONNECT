"use client";

import Link from "next/link";

/**
 * LSUS Connect - 404 Not Found Page
 */

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1E0A42] text-white flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-[#351470] border-4 border-white/10 mb-6">
            <span className="text-[#F5A623] text-6xl font-bold">404</span>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-white text-4xl sm:text-5xl font-bold mb-4">
          Page Not Found
        </h1>
        <p className="text-[#C4B0E0] text-lg mb-8">
          Sorry, we couldn't find the page you're looking for. It may have been moved or deleted.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/marketplace"
            className="rounded-full bg-[#F5A623] px-8 py-3 font-bold text-[#1E0A42] transition hover:bg-[#FFD166] hover:bg-[#FFD166] transition-colors"
          >
            Go to Marketplace
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-[#351470] text-white font-bold rounded-lg hover:bg-[#1E0A42] transition-colors border border-white/10"
          >
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-[#8B72BE] text-sm mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/marketplace" className="text-[#F5A623] hover:text-[#FFE34A]">
              Browse Listings
            </Link>
            <Link href="/post-listing" className="text-[#F5A623] hover:text-[#FFE34A]">
              Post Listing
            </Link>
            <Link href="/lost-found" className="text-[#F5A623] hover:text-[#FFE34A]">
              Lost & Found
            </Link>
            <Link href="/user-profile" className="text-[#F5A623] hover:text-[#FFE34A]">
              My Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}