/**
 * hooks/useCurrentUser.ts
 *
 * Loads the authenticated user's full profile (including profile_picture)
 * from the API rather than just decoding the JWT.
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

// Decode JWT to get name immediately (before API resolves)
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
  // Seed immediately from JWT so name shows right away (no flash of "User")
  const tokenUser = typeof window !== "undefined" ? getBasicUserFromToken() : { id: "", full_name: "", email: "" };

  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    id: tokenUser.id,
    full_name: tokenUser.full_name || "User",
    email: tokenUser.email,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get name from token immediately so UI shows it right away
    const basic = getBasicUserFromToken();
    if (basic.full_name) {
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

    // Then fetch full profile to get profile_picture and other fields
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
