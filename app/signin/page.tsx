"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * LSUS Connect - Signin Page (WITH RESEND VERIFICATION)
 * Now includes ability to resend verification email
 */

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function SigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "verification";
    text: string;
  } | null>(null);
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  const emailError = useMemo(() => {
    if (!email) return null;
    return isValidEmail(email) ? null : "Please enter a valid email address.";
  }, [email]);

  const handleResendVerification = async () => {
    if (!email || !isValidEmail(email)) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address first.",
      });
      return;
    }

    setIsResendingEmail(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Verification email sent! Please check your inbox.",
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to resend email. Please try again.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setIsResendingEmail(false);
    }
  };

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
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          password: trimmedPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Sign in successful! Redirecting...",
        });

        setTimeout(() => {
          router.push("/home");
        }, 1000);
      } else {
        // Check if it's an email verification error
        if (
          response.status === 403 ||
          data.error?.includes("verify") ||
          data.error?.includes("verification")
        ) {
          setMessage({
            type: "verification",
            text: data.error || "Please verify your email before signing in.",
          });
        } else {
          setMessage({
            type: "error",
            text: data.error || "Invalid email or password.",
          });
        }
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
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex bg-gradient-to-br from-[#250D44] via-[#461D7C] to-[#5a2d8c] items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <h1 className="text-6xl font-black mb-6">
            <span className="text-[#FDD023]">LSUS</span>{" "}
            <span className="text-white">CONNECT</span>
          </h1>
          <p className="text-white text-xl leading-relaxed">
            Your campus marketplace for students, by students. Buy, sell, and
            connect with the LSUS community.
          </p>
        </div>
      </div>

      {/* Right Side - Signin Form */}
      <div className="flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-[#461D7C]">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-black">
              <span className="text-[#FDD023]">LSUS</span>{" "}
              <span className="text-white">CONNECT</span>
            </h1>
          </div>

          {/* Form Card */}
          <div className="bg-[#3a1364] rounded-2xl p-6 sm:p-8 border border-[#5a2d8c]">
            <h2 className="text-white text-2xl sm:text-3xl font-bold mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-300 text-sm sm:text-base mb-6 sm:mb-8">
              Sign in to your account
            </p>

            <form onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="mb-5">
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

              {/* Password Field */}
              <div className="mb-6">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 sm:h-14 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white text-base placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
                />
              </div>

              {/* Forgot Password Link */}
              <div className="mb-6 text-right">
                <Link
                  href="/forgot-password"
                  className="text-[#FDD023] text-sm hover:text-[#FFE34A] transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  isSubmitting || Boolean(emailError) || !email.trim() || !password.trim()
                }
                className="w-full min-h-[48px] sm:min-h-[52px] py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>

              {/* Success/Error Message */}
              {message && (
                <div
                  className={`mt-4 p-3 sm:p-4 rounded-lg text-sm ${
                    message.type === "success"
                      ? "bg-[#FDD023]/20 text-[#FDD023] border border-[#FDD023]/30"
                      : message.type === "verification"
                      ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  <p className="mb-2">{message.text}</p>
                  
                  {/* Resend Verification Button */}
                  {message.type === "verification" && (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={isResendingEmail}
                      className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold min-h-[40px]"
                    >
                      {isResendingEmail ? "Sending..." : "Resend Verification Email"}
                    </button>
                  )}
                </div>
              )}
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-gray-300 text-sm sm:text-base">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-[#FDD023] font-semibold hover:text-[#FFE34A] transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
