"use client";
import "./auth-pages.css";
import Link from "next/link";
import { useMemo, useState } from "react";

/**
 * LSUS Connect - Forgot Password Page
 * Brand Compliant with LSUS Brand Guidelines (January 2026)
 * 
 * Colors: LSUS Purple (#461D7C), LSUS Gold (#FDD023)
 * Typography: Proxima Nova (headings), Roboto (body)
 */

function isValidEmail(value: string): boolean {
  // Basic email validation - UI side only
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
      // REAL API CALL - Actually sends password reset email
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await response.json();

      if (response.ok) {
        // Security best practice: Don't reveal whether account exists
        setMessage({
          type: "success",
          text: data.message || "If an account exists with this email, you will receive a password reset link.",
        });
        
        // Clear email field on success
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
    <div className="authPage">
      <div className="authCard">
        {/* Title - Matches Figma Design */}
        <h1 className="authTitle">Forgot Password?</h1>
        
        {/* Subtitle - Matches Figma Design */}
        <p className="authSubtitle">Enter your email to reset your password</p>

        <form onSubmit={handleSubmit}>
          <div className="authField">
            {/* Visually hidden label for accessibility - Figma doesn't show visible label */}
            <label className="authLabel" htmlFor="email">
              Email Address
            </label>
            
            {/* Email Input - Matches Figma Design */}
            <input
              id="email"
              className="authInput"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? "email-error" : undefined}
              required
            />
            
            {/* Inline error message for validation */}
            {emailError && (
              <span
                id="email-error"
                style={{
                  color: "#ff9999",
                  fontSize: "12px",
                  marginTop: "4px",
                }}
                role="alert"
              >
                {emailError}
              </span>
            )}
          </div>

          {/* Submit Button - Matches Figma Design */}
          <button
            className="authButton"
            type="submit"
            disabled={isSubmitting || Boolean(emailError) || !email.trim()}
          >
            {isSubmitting ? "Sending..." : "Reset Password"}
          </button>

          {/* Success/Error Message */}
          {message && (
            <div
              className={`authMessage authMessage--${message.type}`}
              role="status"
              aria-live="polite"
            >
              {message.text}
            </div>
          )}
        </form>

        {/* Back to Sign In Link - Matches Figma Design */}
        <div className="authBottomLinkWrap">
          <Link className="authBottomLink" href="/signin">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}