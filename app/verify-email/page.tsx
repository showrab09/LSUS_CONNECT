"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

/**
 * LSUS Connect - Email Verification Page (FULLY RESPONSIVE)
 * Mobile: Centered card, full-width on small screens
 * Desktop: Centered card with max-width
 */

type VerificationStatus = "verifying" | "success" | "error";

function EmailVerificationContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>("verifying");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const tokenParam = searchParams.get("token");

    if (!tokenParam) {
      setStatus("error");
      setMessage("Invalid or missing verification token. Please check your email or request a new verification link.");
      return;
    }

    verifyEmail(tokenParam);
  }, [searchParams]);

  async function verifyEmail(verificationToken: string) {
    setStatus("verifying");
    setMessage("Verifying your email...");

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "Email verified successfully! Redirecting to sign in...");

        setTimeout(() => {
          window.location.href = "/signin";
        }, 3000);
      } else {
        setStatus("error");
        setMessage(data.error || "This verification link is invalid or has expired. Please request a new verification email.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Something went wrong. Please try again or request a new verification email.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#250D44] via-[#461D7C] to-[#5a2d8c] p-4">
      <div className="w-full max-w-md bg-[#3a1364] rounded-2xl p-6 sm:p-8 border border-[#5a2d8c]">
        {/* Icon */}
        <div className="text-center mb-6">
          {status === "verifying" && (
            <div className="w-16 h-16 mx-auto border-4 border-[#FDD023]/30 border-t-[#FDD023] rounded-full animate-spin" />
          )}
          {status === "success" && (
            <svg className="w-16 h-16 mx-auto" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="rgba(253, 208, 35, 0.2)" />
              <path
                d="M20 32L28 40L44 24"
                stroke="#FDD023"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {status === "error" && (
            <svg className="w-16 h-16 mx-auto" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="rgba(255, 77, 77, 0.2)" />
              <path
                d="M24 24L40 40M40 24L24 40"
                stroke="#ff9999"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>

        {/* Title */}
        <h1 className="text-white text-2xl sm:text-3xl font-bold text-center mb-3">
          {status === "verifying" && "Verifying Email"}
          {status === "success" && "Email Verified!"}
          {status === "error" && "Verification Failed"}
        </h1>

        {/* Message */}
        <p className={`text-center mb-6 text-sm sm:text-base ${
          status === "error" ? "text-red-400" : 
          status === "success" ? "text-[#FDD023]" : 
          "text-gray-300"
        }`}>
          {message}
        </p>

        {/* Error Actions */}
        {status === "error" && (
          <div className="space-y-3">
            <Link
              href="/signup"
              className="block w-full py-3 bg-[#2a0d44] text-white font-semibold rounded-lg border border-[#5a2d8c] hover:border-[#FDD023] transition-colors text-center min-h-[48px] flex items-center justify-center"
            >
              Back to Sign Up
            </Link>
            <Link
              href="/signin"
              className="block w-full py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors text-center min-h-[48px] flex items-center justify-center"
            >
              Go to Sign In
            </Link>
          </div>
        )}

        {/* Success Action */}
        {status === "success" && (
          <Link
            href="/signin"
            className="block w-full py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors text-center min-h-[48px] flex items-center justify-center"
          >
            Go to Sign In Now
          </Link>
        )}
      </div>
    </div>
  );
}

export default function EmailVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#250D44] via-[#461D7C] to-[#5a2d8c]">
          <div className="w-full max-w-md bg-[#3a1364] rounded-2xl p-8 border border-[#5a2d8c]">
            <h1 className="text-white text-2xl font-bold text-center">Loading...</h1>
          </div>
        </div>
      }
    >
      <EmailVerificationContent />
    </Suspense>
  );
}
