"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * LSUS Connect - Global Error Page
 */

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error caught by error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#461D7C] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* Error Illustration */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-red-500/20 border-4 border-red-500/30 mb-6">
            <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-white text-4xl sm:text-5xl font-bold mb-4">
          Something Went Wrong
        </h1>
        <p className="text-gray-300 text-lg mb-2">
          We encountered an unexpected error. Don't worry, it's not your fault!
        </p>
        
        {/* Error Details (dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="my-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-left">
            <p className="text-red-300 text-sm font-mono break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button
            onClick={reset}
            className="px-8 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/marketplace"
            className="px-8 py-3 bg-[#3a1364] text-white font-bold rounded-lg hover:bg-[#461D7C] transition-colors border border-[#5a2d8c]"
          >
            Go to Marketplace
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-12 pt-8 border-t border-[#5a2d8c]">
          <p className="text-gray-400 text-sm">
            If this problem persists, please contact support or try refreshing the page.
          </p>
        </div>
      </div>
    </div>
  );
}