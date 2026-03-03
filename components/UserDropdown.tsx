"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

/**
 * UserDropdown Component
 * Displays user avatar/name with dropdown menu
 * Includes: Profile, Settings, Logout
 */

interface User {
  id: string;
  full_name: string;
  email: string;
  profile_picture: string | null;
}

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch current user info
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const fetchCurrentUser = async () => {
    try {
      // TODO: Replace with actual user API endpoint
      const mockUser = {
        id: "1",
        full_name: "Robert Lovelace",
        email: "robert@lsus.edu",
        profile_picture: null,
      };
      setUser(mockUser);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("LOGOUT CLICKED - Starting logout process...");
    
    // Clear everything
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    localStorage.clear();
    sessionStorage.clear();
    console.log("All storage cleared");
    
    // Close dropdown
    setIsOpen(false);
    
    // Multiple redirect attempts
    console.log("Attempting redirect...");
    window.location.replace("/signin");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <div className="w-10 h-10 rounded-full bg-[#2a0d44] border-2 border-[#5a2d8c] animate-pulse" />
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 sm:gap-3 p-1 sm:p-2 rounded-lg hover:bg-[#3a1364] transition-colors group"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="relative">
          {user.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={user.full_name}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-[#FDD023] group-hover:border-[#FFE34A] transition-colors"
            />
          ) : (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#FDD023] to-[#FFE34A] flex items-center justify-center border-2 border-[#FDD023] group-hover:border-[#FFE34A] transition-colors">
              <span className="text-black font-bold text-sm sm:text-base">
                {getInitials(user.full_name)}
              </span>
            </div>
          )}
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-[#461D7C] rounded-full" />
        </div>
        <span className="hidden md:block text-white font-medium text-sm">
          {user.full_name.split(" ")[0]}
        </span>
        <svg
          className={`hidden sm:block w-4 h-4 text-white transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-[#3a1364] border border-[#5a2d8c] rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#5a2d8c] bg-[#2a0d44]">
            <p className="text-white font-semibold text-sm truncate">
              {user.full_name}
            </p>
            <p className="text-gray-400 text-xs truncate">{user.email}</p>
          </div>

          <div className="py-2">
            <Link
              href="/user-profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#461D7C] transition-colors group"
            >
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-[#FDD023]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-sm font-medium">My Profile</span>
            </Link>

            <Link
              href="/user-profile?tab=settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#461D7C] transition-colors group"
            >
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-[#FDD023]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-sm font-medium">Settings</span>
            </Link>

            <div className="border-t border-[#5a2d8c] my-2" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-white hover:bg-red-500/20 transition-colors group w-full text-left"
            >
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="text-sm font-medium group-hover:text-red-400">
                Logout
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
