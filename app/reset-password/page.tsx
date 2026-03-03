"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import "./auth-pages.css";

/**
 * LSUS Connect - Reset Password Page
 * Brand Compliant with LSUS Brand Guidelines (January 2026)
 */

function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    setToken(tokenParam);

    if (!tokenParam) {
      setMessage({
        type: "error",
        text: "Invalid or missing reset token. Please request a new password reset link.",
      });
    }
  }, [searchParams]);

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

    if (!token) {
      setMessage({
        type: "error",
        text: "Invalid reset token. Please request a new password reset link.",
      });
      return;
    }

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
      // REAL API CALL - Actually resets the password in database
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: token,
          newPassword: password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: data.message || "Password reset successfully! Redirecting to sign in...",
        });

        // Clear form
        setPassword("");
        setConfirmPassword("");

        // Redirect to sign in after confirmation
        setTimeout(() => {
          window.location.href = "/signin";
        }, 3000);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to reset password. Please try again or request a new reset link.",
        });
      }
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
    <div className="authPage">
      <div className="authCard">
        <h1 className="authTitle">Reset Password</h1>
        <p className="authSubtitle">Enter your new password</p>

        <form onSubmit={handleSubmit}>
          <div className="authField">
            <label className="authLabel" htmlFor="password">
              New Password
            </label>
            <input
              id="password"
              className="authInput"
              type="password"
              autoComplete="new-password"
              placeholder="New Password (min. 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(passwordError)}
              aria-describedby={passwordError ? "password-error" : undefined}
              required
              disabled={!token}
            />
            {passwordError && (
              <span
                id="password-error"
                style={{
                  color: "#ff9999",
                  fontSize: "12px",
                  marginTop: "4px",
                }}
                role="alert"
              >
                {passwordError}
              </span>
            )}
          </div>

          <div className="authField">
            <label className="authLabel" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              className="authInput"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={Boolean(confirmPasswordError)}
              aria-describedby={confirmPasswordError ? "confirm-password-error" : undefined}
              required
              disabled={!token}
            />
            {confirmPasswordError && (
              <span
                id="confirm-password-error"
                style={{
                  color: "#ff9999",
                  fontSize: "12px",
                  marginTop: "4px",
                }}
                role="alert"
              >
                {confirmPasswordError}
              </span>
            )}
          </div>

          <button
            className="authButton"
            type="submit"
            disabled={
              !token ||
              isSubmitting ||
              Boolean(passwordError) ||
              Boolean(confirmPasswordError) ||
              !password.trim() ||
              !confirmPassword.trim()
            }
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
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

        <div className="authBottomLinkWrap">
          <Link className="authBottomLink" href="/signin">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="authPage">
          <div className="authCard">
            <h1 className="authTitle">Loading...</h1>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}