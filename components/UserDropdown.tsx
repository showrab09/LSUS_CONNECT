"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface User {
  full_name: string;
  email: string;
  profile_picture?: string;
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
}

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch full profile so we get profile_picture from the DB
    fetch("/api/user/profile", { credentials: "include" })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.user) {
          setUser({
            full_name: data.user.full_name || "User",
            email: data.user.email || "",
            profile_picture: data.user.profile_picture || undefined,
          });
        } else {
          // Fallback to JWT decode for name only
          try {
            const token = localStorage.getItem("token");
            if (token) {
              const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
              const payload = JSON.parse(decodeURIComponent(atob(base64).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")));
              setUser({ full_name: payload.name || "User", email: payload.email || "" });
            }
          } catch { setUser({ full_name: "User", email: "" }); }
        }
      })
      .catch(() => { setUser({ full_name: "User", email: "" }); });

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
      const res = await fetch("/api/messages/unread-count", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unread_count || 0);
      }
    } catch { /* silent */ }
  };

  const handleLogout = () => { window.location.href = "/logout"; };

  if (!user) return <div className="h-10 w-10 animate-pulse rounded-full bg-[#2A0F5A]" />;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 rounded-xl p-2 transition hover:bg-white/5"
      >
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-[#F5A623] bg-gradient-to-br from-[#FFD166] to-[#F5A623] flex items-center justify-center">
          {user.profile_picture ? (
            <img src={user.profile_picture} alt={user.full_name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-[#1E0A42]">{getInitials(user.full_name)}</span>
          )}
        </div>
        <span className="hidden text-sm font-medium text-white md:block">
          {user.full_name.split(" ")[0]}
        </span>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#2E1065] shadow-2xl">
          <div className="border-b border-white/10 bg-[#2A0F5A] px-4 py-3">
            <p className="text-sm font-semibold text-white">{user.full_name}</p>
            <p className="text-xs text-[#8B72BE]">{user.email}</p>
          </div>

          <div className="py-2">
            {[
              { href: "/home", label: "Home", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
              { href: "/marketplace", label: "Marketplace", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
              { href: "/messages", label: "Messages", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", badge: unreadCount },
              { href: "/lost-found", label: "Lost & Found", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
              { href: "/post-listing", label: "Post Listing", icon: "M12 4v16m8-8H4" },
            ].map(item => (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 text-[#C4B0E0] transition hover:bg-white/5 hover:text-white">
                <div className="flex items-center gap-3">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className="text-sm">{item.label}</span>
                </div>
                {item.badge && item.badge > 0 && (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </Link>
            ))}

            <div className="my-2 border-t border-white/10" />

            {[
              { href: "/user-profile", label: "My Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
              { href: "/settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
              { href: "/contact-team", label: "Contact Team", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
            ].map(item => (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-[#C4B0E0] transition hover:bg-white/5 hover:text-white">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}

            <div className="my-2 border-t border-white/10" />

            <button onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-[#C4B0E0] transition hover:bg-red-500/20 hover:text-red-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
