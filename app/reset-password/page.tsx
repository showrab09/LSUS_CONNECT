"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

/**
 * LSUS Connect - Reset Password Page (FULLY RESPONSIVE)
 * Mobile: Centered card, full-width on small screens
 * Desktop: Centered card with max-width
 */

function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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

    if (!password || !isValidPassword(password)) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters.",
      });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({
        type: "error",
        text: "Passwords do not match.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage({
        type: "success",
        text: "Password reset successfully! Redirecting to sign in...",
      });

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        window.location.href = "/signin";
      }, 2500);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again or request a new reset link.",
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
          Reset Password
        </h1>
        
        {/* Subtitle */}
        <p className="text-gray-300 text-sm sm:text-base text-center mb-6 sm:mb-8">
          Enter your new password
        </p>

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="mb-5">
            <label htmlFor="password" className="sr-only">
              New Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(passwordError)}
              aria-describedby={passwordError ? "password-error" : undefined}
              required
              className="w-full h-12 sm:h-14 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white text-base placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
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

          {/* Confirm Password */}
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="sr-only">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={Boolean(confirmPasswordError)}
              aria-describedby={confirmPasswordError ? "confirm-password-error" : undefined}
              required
              className="w-full h-12 sm:h-14 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white text-base placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
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

          {/* Submit Button - Touch friendly */}
          <button
            type="submit"
            disabled={
              isSubmitting ||
              Boolean(passwordError) ||
              Boolean(confirmPasswordError) ||
              !password.trim() ||
              !confirmPassword.trim()
            }
            className="w-full min-h-[48px] sm:min-h-[52px] py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg"
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
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
