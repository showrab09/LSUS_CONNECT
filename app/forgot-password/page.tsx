"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

/**
 * LSUS Connect - Forgot Password Page (FULLY RESPONSIVE)
 * Mobile: Centered card, full-width on small screens
 * Desktop: Centered card with max-width
 */

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const emailError = useMemo(() => {
    if (!email) return null;
    return isValidEmail(email) ? null : "Please enter a valid email address.";
  }, [email]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const trimmed = email.trim();

    if (!trimmed || !isValidEmail(trimmed)) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: data.message || "If an account exists with this email, you will receive a password reset link.",
        });
        setEmail("");
      } else {
        setMessage({
          type: "error",
          text: data.error || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#250D44] via-[#461D7C] to-[#5a2d8c] p-4">
      <div className="w-full max-w-md bg-[#3a1364] rounded-2xl p-6 sm:p-8 border border-[#5a2d8c]">
        {/* Title */}
        <h1 className="text-white text-2xl sm:text-3xl font-bold text-center mb-2">
          Forgot Password?
        </h1>
        
        {/* Subtitle */}
        <p className="text-gray-300 text-sm sm:text-base text-center mb-6 sm:mb-8">
          Enter your email to reset your password
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="mb-6">
            <label htmlFor="email" className="sr-only">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? "email-error" : undefined}
              required
              className="w-full h-12 sm:h-14 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white text-base placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
            />
            
            {emailError && (
              <span
                id="email-error"
                className="text-red-400 text-xs mt-1 block"
                role="alert"
              >
                {emailError}
              </span>
            )}
          </div>

          {/* Submit Button - Touch friendly */}
          <button
            type="submit"
            disabled={isSubmitting || Boolean(emailError) || !email.trim()}
            className="w-full min-h-[48px] sm:min-h-[52px] py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg"
          >
            {isSubmitting ? "Sending..." : "Reset Password"}
          </button>

          {/* Success/Error Message */}
          {message && (
            <div
              className={`mt-4 p-3 sm:p-4 rounded-lg text-sm text-center ${
                message.type === "success"
                  ? "bg-[#FDD023]/20 text-[#FDD023] border border-[#FDD023]/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
              role="status"
              aria-live="polite"
            >
              {message.text}
            </div>
          )}
        </form>

        {/* Back to Sign In Link */}
        <div className="mt-6 sm:mt-8 text-center">
          <Link
            href="/signin"
            className="text-[#FDD023] font-semibold hover:text-[#FFE34A] transition-colors text-sm sm:text-base inline-block py-2"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
