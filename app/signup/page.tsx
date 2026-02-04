"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

/**
 * LSUS Connect - Sign Up Page
 * Brand Compliant with LSUS Brand Guidelines (January 2026)
 */

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password: string): boolean {
  // Password must be at least 8 characters
  return password.length >= 8;
}

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const emailError = useMemo(() => {
    if (!email) return null;
    return isValidEmail(email) ? null : "Please enter a valid email address.";
  }, [email]);

  const passwordError = useMemo(() => {
    if (!password) return null;
    return isValidPassword(password)
      ? null
      : "Password must be at least 8 characters.";
  }, [password]);

  const confirmPasswordError = useMemo(() => {
    if (!confirmPassword) return null;
    return password === confirmPassword ? null : "Passwords do not match.";
  }, [password, confirmPassword]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    // Validation
    if (!trimmedFullName) {
      setMessage({
        type: "error",
        text: "Please enter your full name.",
      });
      return;
    }

    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return;
    }

    if (!trimmedPassword || !isValidPassword(trimmedPassword)) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters.",
      });
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setMessage({
        type: "error",
        text: "Passwords do not match.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      // Example: await fetch('/api/auth/signup', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     fullName: trimmedFullName,
      //     email: trimmedEmail,
      //     password: trimmedPassword
      //   })
      // })

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate successful signup
      setMessage({
        type: "success",
        text: "Account created! Please check your email to verify your account.",
      });

      // Clear form
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Redirect to verify email page after 3 seconds
      setTimeout(() => {
        window.location.href = "/verify-email";
      }, 3000);
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
    <div className="min-h-screen grid grid-cols-2">
      {/* Left Side - Branding */}
      <div className="bg-gradient-to-br from-[#250D44] via-[#461D7C] to-[#5a2d8c] flex flex-col items-center justify-center p-12">
        <div className="max-w-md">
          {/* Logo */}
          <h1 className="text-6xl font-black mb-6">
            <span className="text-[#FDD023]">LSUS</span>{" "}
            <span className="text-white">CONNECT</span>
          </h1>

          {/* Tagline */}
          <p className="text-white text-2xl font-light leading-relaxed">
            Where Students Connect, Trade, and Thrive.
          </p>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="bg-[#3a1364] flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-[#461D7C] rounded-2xl p-8 border border-[#5a2d8c]">
            {/* Header */}
            <h2 className="text-white text-3xl font-bold mb-2">
              Create an Account
            </h2>
            <p className="text-gray-300 text-sm mb-8">
              Join LSUS Connect today!
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Full Name Field */}
              <div className="mb-5">
                <label
                  htmlFor="fullName"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
                />
              </div>

              {/* Email Field */}
              <div className="mb-5">
                <label
                  htmlFor="email"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(emailError)}
                  aria-describedby={emailError ? "email-error" : undefined}
                  required
                  className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
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
              <div className="mb-5">
                <label
                  htmlFor="password"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(passwordError)}
                  aria-describedby={passwordError ? "password-error" : undefined}
                  required
                  className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
                />
                {passwordError && (
                  <span
                    id="password-error"
                    className="text-red-400 text-xs mt-1 block"
                    role="alert"
                  >
                    {passwordError}
                  </span>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="mb-6">
                <label
                  htmlFor="confirmPassword"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  aria-invalid={Boolean(confirmPasswordError)}
                  aria-describedby={
                    confirmPasswordError ? "confirm-password-error" : undefined
                  }
                  required
                  className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
                />
                {confirmPasswordError && (
                  <span
                    id="confirm-password-error"
                    className="text-red-400 text-xs mt-1 block"
                    role="alert"
                  >
                    {confirmPasswordError}
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  Boolean(emailError) ||
                  Boolean(passwordError) ||
                  Boolean(confirmPasswordError) ||
                  !fullName.trim() ||
                  !email.trim() ||
                  !password.trim() ||
                  !confirmPassword.trim()
                }
                className="w-full h-12 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating Account..." : "Sign Up"}
              </button>

              {/* Success/Error Message */}
              {message && (
                <div
                  className={`mt-4 p-3 rounded-lg text-sm text-center ${
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

            {/* Sign In Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-300 text-sm">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="text-[#FDD023] font-semibold hover:text-[#FFE34A] transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
