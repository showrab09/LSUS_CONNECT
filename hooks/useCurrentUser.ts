/**
 * hooks/useCurrentUser.ts
 *
 * Loads the authenticated user's full profile (including profile_picture)
 * from the API rather than just decoding the JWT.
 *
 * The JWT only contains userId, email, name, and isAdmin — it never has
 * profile_picture. This hook fetches the real profile from /api/user/profile
 * so every page that shows the logged-in user's avatar gets the correct image.
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

// Decode the JWT from localStorage to get userId quickly (no API call needed)
function getUserIdFromToken(): string {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "";
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split("")
          .map(c => `%${"00" + c.charCodeAt(0).toString(16).slice(-2)}`)
          .join("")
      )
    );
    return payload.userId || "";
  } catch {
    return "";
  }
}

export function useCurrentUser(): UseCurrentUserResult {
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    id: "",
    full_name: "User",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = getUserIdFromToken();
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Fetch the full profile so we get profile_picture and other fields
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
        // Silently fall back — the compose box will just show initials
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { currentUser, isLoading };
}
