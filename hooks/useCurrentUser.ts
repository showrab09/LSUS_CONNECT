/**
 * hooks/useCurrentUser.ts
 *
 * Loads the authenticated user's full profile (including profile_picture)
 * from the API rather than just decoding the JWT.
 *
 * SSR-safe: initial state is always empty so server and client render
 * the same thing on first pass, avoiding hydration mismatches.
 */

"use client";

import { useEffect, useState } from "react";

export interface CurrentUser {
  id: string;
  full_name: string;
  email: string;
  profile_picture?: string;
  bio?: string;
  location?: string;
  is_admin?: boolean;
}

interface UseCurrentUserResult {
  currentUser: CurrentUser;
  isLoading: boolean;
}

function getBasicUserFromToken(): { id: string; full_name: string; email: string } {
  try {
    const token = localStorage.getItem("token");
    if (!token) return { id: "", full_name: "", email: "" };
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    return {
      id: payload.userId || "",
      full_name: payload.name || payload.email?.split("@")[0] || "",
      email: payload.email || "",
    };
  } catch {
    return { id: "", full_name: "", email: "" };
  }
}

export function useCurrentUser(): UseCurrentUserResult {
  // IMPORTANT: Start with empty state so SSR and client first render match
  // Never read localStorage or window at module/state init time
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    id: "",
    full_name: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Step 1: Read token immediately for fast name display
    const basic = getBasicUserFromToken();
    if (basic.id) {
      setCurrentUser(prev => ({
        ...prev,
        id: basic.id,
        full_name: basic.full_name,
        email: basic.email,
      }));
    }

    if (!basic.id) {
      setIsLoading(false);
      return;
    }

    // Step 2: Fetch full profile for profile_picture and other fields
    fetch("/api/user/profile", { credentials: "include" })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.user) {
          setCurrentUser({
            id: data.user.id,
            full_name: data.user.full_name,
            email: data.user.email,
            profile_picture: data.user.profile_picture || undefined,
            bio: data.user.bio || undefined,
            location: data.user.location || undefined,
            is_admin: data.user.is_admin,
          });
        }
      })
      .catch(() => {
        // Keep token-decoded name if API fails
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { currentUser, isLoading };
}
