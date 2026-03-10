"use client";

import { useState, useEffect } from "react";

interface SaveButtonProps {
  listingId: string;
  size?: "sm" | "md" | "lg";
}

export default function SaveButton({ listingId, size = "md" }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Size variants
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  useEffect(() => {
    checkIfSaved();
  }, [listingId]);

  const checkIfSaved = async () => {
    try {
      const response = await fetch(`/api/saved-listings/check?listing_id=${listingId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.is_saved);
      }
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  };

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if button is inside a Link
    e.stopPropagation(); // Stop event from bubbling

    setIsLoading(true);

    try {
      if (isSaved) {
        // Unsave
        const response = await fetch('/api/saved-listings', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ listing_id: listingId }),
        });

        if (response.ok) {
          setIsSaved(false);
        }
      } else {
        // Save
        const response = await fetch('/api/saved-listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ listing_id: listingId }),
        });

        if (response.ok) {
          setIsSaved(true);
        }
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleSave}
      disabled={isLoading}
      className={`${sizeClasses[size]} rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
      title={isSaved ? "Remove from favorites" : "Save to favorites"}
    >
      {isLoading ? (
        <div className={`${iconSizes[size]} border-2 border-red-500 border-t-transparent rounded-full animate-spin`} />
      ) : (
        <svg
          className={`${iconSizes[size]} ${isSaved ? 'text-red-500 fill-red-500' : 'text-gray-600'}`}
          fill={isSaved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
    </button>
  );
}