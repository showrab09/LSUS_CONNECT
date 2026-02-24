"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * LSUS Connect - Sign In Page (FULLY RESPONSIVE)
 * Mobile: Single column, compact logo at top
 * Tablet: Single column, larger logo
 * Desktop: Two columns (branding + form)
 */

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const emailError = useMemo(() => {
    if (!email) return null;
    if (!isValidEmail(email)) return "Please enter a valid email address.";
    return null;
  }, [email]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return;
    }

    if (!trimmedPassword) {
      setMessage({
        type: "error",
        text: "Please enter your password.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Call signin API
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: trimmedEmail, 
          password: trimmedPassword 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signin failed');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Show success message
      setMessage({
        type: "success",
        text: "Sign in successful! Redirecting...",
      });

      // Redirect to marketplace
      setTimeout(() => {
        router.push('/marketplace');
      }, 1500);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Invalid email or password. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Branding (Hidden on mobile, visible on desktop) */}
      <div className="hidden lg:flex bg-gradient-to-br from-[#250D44] via-[#461D7C] to-[#5a2d8c] flex-col items-center justify-center p-12">
        <div className="max-w-md">
          {/* Logo */}
          <h1 className="text-5xl xl:text-6xl font-black mb-6">
            <span className="text-[#FDD023]">LSUS</span>{" "}
            <span className="text-white">CONNECT</span>
          </h1>

          {/* Tagline */}
          <p className="text-white text-xl xl:text-2xl font-light leading-relaxed">
            Where Students Connect, Trade, and Thrive.
          </p>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="bg-[#3a1364] flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo (Shown only on mobile/tablet) */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black">
              <span className="text-[#FDD023]">LSUS</span>{" "}
              <span className="text-white">CONNECT</span>
            </h1>
            <p className="text-white text-sm sm:text-base mt-2">
              Student Marketplace
            </p>
          </div>

          {/* Card */}
          <div className="bg-[#461D7C] rounded-2xl p-6 sm:p-8 border border-[#5a2d8c]">
            {/* Header */}
            <h2 className="text-white text-2xl sm:text-3xl font-bold mb-2">Welcome Back</h2>
            <p className="text-gray-300 text-sm mb-6 sm:mb-8">
              Sign In to continue to LSUS Connect
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="block text-white text-sm font-medium mb-2"
                >
                  LSUS Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="yourname@lsus.edu"
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

              {/* Password Field */}
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 sm:h-14 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white text-base placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
                />
              </div>

              {/* Forgot Password Link */}
              <div className="text-right mb-6">
                <Link
                  href="/forgot-password"
                  className="text-[#FDD023] text-sm font-medium hover:text-[#FFE34A] transition-colors inline-block py-2"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button - Touch friendly (min 48px height) */}
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  Boolean(emailError) ||
                  !email.trim() ||
                  !password.trim()
                }
                className="w-full min-h-[48px] sm:min-h-[52px] bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg"
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
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

            {/* Sign Up Link */}
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-gray-300 text-sm">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-[#FDD023] font-semibold hover:text-[#FFE34A] transition-colors inline-block py-2"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Home Link (Mobile friendly) */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-gray-300 text-sm hover:text-white transition-colors inline-flex items-center gap-2 py-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
