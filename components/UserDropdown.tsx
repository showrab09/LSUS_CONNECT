"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface User {
  full_name: string;
  email: string;
}

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
        );
        const decoded = JSON.parse(jsonPayload);
        
        // Extract name from email if no name field
        let displayName = decoded.name || "User";
        if (!decoded.name && decoded.email) {
          const emailName = decoded.email.split('@')[0];
          displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        }
        
        setUser({ 
          full_name: displayName, 
          email: decoded.email || "" 
        });
      } catch (e) {
        setUser({ full_name: "User", email: "" });
      }
    } else {
      setUser({ full_name: "User", email: "" });
    }

    // Fetch unread count
    fetchUnreadCount();
  }, []);

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

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/messages/unread-count', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unread_count || 0);
      }
    } catch (err) {
      // Mock data for development
      setUnreadCount(3);
    }
  };

  const handleLogout = () => {
    window.location.href = "/logout";
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  };

  if (!user) return <div className="w-10 h-10 rounded-full bg-[#2a0d44] animate-pulse" />;

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#3a1364] transition-colors relative">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FDD023] to-[#FFE34A] flex items-center justify-center border-2 border-[#FDD023]">
          <span className="text-black font-bold text-base">{getInitials(user.full_name)}</span>
        </div>
        <span className="hidden md:block text-white font-medium text-sm">{user.full_name.split(" ")[0]}</span>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#3a1364] border border-[#5a2d8c] rounded-lg shadow-xl z-50">
          <div className="px-4 py-3 border-b border-[#5a2d8c] bg-[#2a0d44]">
            <p className="text-white font-semibold text-sm">{user.full_name}</p>
            <p className="text-gray-400 text-xs">{user.email}</p>
          </div>
          
          <div className="py-2">
            <Link href="/marketplace" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#461D7C]">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-sm">Marketplace</span>
            </Link>

            <Link href="/messages" onClick={() => setIsOpen(false)} className="flex items-center justify-between px-4 py-3 text-white hover:bg-[#461D7C]">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-sm">Messages</span>
              </div>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <Link href="/lost-found" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#461D7C]">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm">Lost & Found</span>
            </Link>

            <Link href="/post-listing" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#461D7C]">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm">Post Listing</span>
            </Link>

            <div className="border-t border-[#5a2d8c] my-2" />

            <Link href="/user-profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#461D7C]">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm">My Profile</span>
            </Link>

            <div className="border-t border-[#5a2d8c] my-2" />

            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-white hover:bg-red-500/20 w-full text-left">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}