"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import "./auth-pages.css";

type VerificationStatus = "verifying" | "success" | "error";

function EmailVerificationContent() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<VerificationStatus>("verifying");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    setToken(tokenParam);

    if (!tokenParam) {
      setStatus("error");
      setMessage(
        "Invalid or missing verification token. Please check your email or request a new verification link."
      );
      return;
    }

    verifyEmail(tokenParam);
  }, [searchParams]);

  async function verifyEmail(verificationToken: string) {
    setStatus("verifying");
    setMessage("Verifying your email...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStatus("success");
      setMessage("Email verified successfully! Redirecting to sign in...");

      setTimeout(() => {
        window.location.href = "/signin";
      }, 3000);
    } catch (error) {
      setStatus("error");
      setMessage(
        "This verification link is invalid or has expired. Please request a new verification email."
      );
    }
  }

  return (
    <div className="authPage">
      <div className="authCard">
        <div
          style={{
            textAlign: "center",
            marginBottom: "1.5rem",
          }}
        >
          {status === "verifying" && (
            <div
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto",
                border: "4px solid rgba(253, 208, 35, 0.3)",
                borderTop: "4px solid var(--lsus-gold)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
          )}
          {status === "success" && (
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ margin: "0 auto" }}
            >
              <circle cx="32" cy="32" r="32" fill="rgba(253, 208, 35, 0.2)" />
              <path
                d="M20 32L28 40L44 24"
                stroke="var(--lsus-gold)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {status === "error" && (
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ margin: "0 auto" }}
            >
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

        <h1 className="authTitle">
          {status === "verifying" && "Verifying Email"}
          {status === "success" && "Email Verified!"}
          {status === "error" && "Verification Failed"}
        </h1>

        <p
          className="authSubtitle"
          style={{
            color:
              status === "error"
                ? "#ff9999"
                : status === "success"
                ? "var(--lsus-gold)"
                : "var(--lsus-text-secondary)",
          }}
        >
          {message}
        </p>

        {status === "error" && (
          <div style={{ marginTop: "2rem" }}>
            <div className="authBottomLinkWrap" style={{ marginTop: "1rem" }}>
              <Link className="authBottomLink" href="/signup">
                Back to Sign Up
              </Link>
            </div>
            <div className="authBottomLinkWrap" style={{ marginTop: "0.5rem" }}>
              <Link className="authBottomLink" href="/signin">
                Go to Sign In
              </Link>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="authBottomLinkWrap">
            <Link className="authBottomLink" href="/signin">
              Go to Sign In Now
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default function EmailVerificationPage() {
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
      <EmailVerificationContent />
    </Suspense>
  );
}