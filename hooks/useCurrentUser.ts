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

export function useCurrentUser(): UseCurrentUserResult {
  // Start with empty state so SSR and client first render match
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    id: "",
    full_name: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return { currentUser, isLoading };
}
