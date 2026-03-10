import Link from "next/link";

/**
 * LSUS Connect - 404 Not Found Page
 */

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#461D7C] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-[#3a1364] border-4 border-[#5a2d8c] mb-6">
            <span className="text-[#FDD023] text-6xl font-bold">404</span>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-white text-4xl sm:text-5xl font-bold mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-300 text-lg mb-8">
          Sorry, we couldn't find the page you're looking for. It may have been moved or deleted.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/marketplace"
            className="px-8 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
          >
            Go to Marketplace
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-[#3a1364] text-white font-bold rounded-lg hover:bg-[#461D7C] transition-colors border border-[#5a2d8c]"
          >
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-[#5a2d8c]">
          <p className="text-gray-400 text-sm mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/marketplace" className="text-[#FDD023] hover:text-[#FFE34A]">
              Browse Listings
            </Link>
            <Link href="/post-listing" className="text-[#FDD023] hover:text-[#FFE34A]">
              Post Listing
            </Link>
            <Link href="/lost-found" className="text-[#FDD023] hover:text-[#FFE34A]">
              Lost & Found
            </Link>
            <Link href="/user-profile" className="text-[#FDD023] hover:text-[#FFE34A]">
              My Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}