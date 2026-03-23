"use client";

import Link from "next/link";
import MessageSellerButton from "@/components/MessageSellerButton";
import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CardItem {
  id: string;
  type: "listing" | "housing" | "lost_found" | "social";
  sellerId?: string;
  title?: string;
  content?: string;
  description?: string;
  price?: number;
  price_type?: string;
  category?: string;
  location?: string;
  images?: string[];
  lost_found_type?: "LOST" | "FOUND";
  condition?: string;
  created_at: string;
  user?: {
    id?: string;
    full_name?: string;
    profile_picture?: string;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatPrice(price?: number, price_type?: string) {
  if (price_type === "FREE" || price === 0) return { label: "Free", color: "text-green-400" };
  if (price_type === "SWAP") return { label: "Trade/Swap", color: "text-blue-400" };
  if (price !== undefined) return { label: `$${price.toFixed(2)}`, color: "text-[#F5A623]" };
  return null;
}

function getInitials(name?: string) {
  return name?.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2) || "U";
}

function Avatar({ user, size = "sm" }: { user?: CardItem["user"]; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm";
  return (
    <div className={`${sz} flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#F5A623]/40 bg-gradient-to-br from-[#FFD166] to-[#F5A623]`}>
      {user?.profile_picture
        ? <img src={user.profile_picture} alt={user.full_name} className="h-full w-full object-cover" />
        : <span className="font-bold text-[#1E0A42]">{getInitials(user?.full_name)}</span>}
    </div>
  );
}

// ── Horizontal Card (Listings, Housing, Lost & Found) ─────────────────────────

export function HorizontalCard({ item, onContact }: { item: CardItem; onContact?: (item: CardItem) => void }) {
  const price = formatPrice(item.price, item.price_type);
  const isLostFound = item.type === "lost_found";
  const isHousing = item.type === "housing" || item.category === "Housing";
  const href = isLostFound ? "/lost-found" : isHousing ? "/housing" : `/product-detail?id=${item.id}`;

  return (
    <div className="group overflow-hidden rounded-2xl border border-white/10 bg-[#351470] shadow-[0_4px_24px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-[#F5A623]/40">
      <div className="flex">
        {/* Image */}
        <div className="relative h-36 w-36 shrink-0 overflow-hidden bg-[#2A0F5A] sm:h-40 sm:w-40">
          {item.images?.[0] ? (
            <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover transition group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl">
              {isLostFound ? (item.lost_found_type === "LOST" ? "😢" : "🎉") : isHousing ? "🏠" : "📦"}
            </div>
          )}

          {/* Badge overlay */}
          {isLostFound && item.lost_found_type && (
            <div className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              item.lost_found_type === "LOST" ? "bg-red-500 text-white" : "bg-green-500 text-white"
            }`}>
              {item.lost_found_type}
            </div>
          )}
          {item.condition && !isLostFound && (
            <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
              {item.condition}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
          <div>
            {/* Category + time */}
            <div className="mb-1 flex flex-wrap items-center gap-2">
              {item.category && !isLostFound && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-[#C4B0E0]">
                  {item.category}
                </span>
              )}
              <span className="text-[10px] text-[#8B72BE]">{timeAgo(item.created_at)}</span>
            </div>

            {/* Title */}
            {item.title && (
              <h3 className="mb-1 font-bold text-white line-clamp-1">{item.title}</h3>
            )}

            {/* Price */}
            {price && (
              <p className={`mb-1 text-base font-extrabold ${price.color}`}>{price.label}</p>
            )}

            {/* Description */}
            {item.description && (
              <p className="line-clamp-2 text-xs leading-5 text-[#C4B0E0]">{item.description}</p>
            )}

            {/* Location */}
            {item.location && (
              <p className="mt-1 text-xs text-[#8B72BE]">📍 {item.location}</p>
            )}
          </div>

          {/* Footer — user + action button */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <Avatar user={item.user} size="sm" />
              <span className="truncate text-xs text-[#C4B0E0]">{item.user?.full_name || "LSUS Student"}</span>
            </div>
            {isHousing && item.user?.id ? (
              <div className="ml-2 shrink-0 [&>div]:!min-h-0 [&_button]:!rounded-full [&_button]:!py-1.5 [&_button]:!px-4 [&_button]:!text-xs [&_button]:!min-h-0 [&_button]:!w-auto">
                <MessageSellerButton
                  listingId={item.id}
                  sellerId={item.user.id}
                  listingTitle={item.title || ""}
                />
              </div>
            ) : isLostFound && item.user?.id ? (
              <Link
                href={`/messages?user=${item.user.id}&name=${encodeURIComponent(item.user.full_name || "")}`}
                className="ml-2 shrink-0 rounded-full bg-[#F5A623] px-4 py-1.5 text-xs font-bold text-[#1E0A42] transition hover:bg-[#FFD166]"
              >
                Contact
              </Link>
            ) : (
              <Link
                href={href}
                className="ml-2 shrink-0 rounded-full bg-[#F5A623] px-4 py-1.5 text-xs font-bold text-[#1E0A42] transition hover:bg-[#FFD166]"
              >
                View
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Social Card ───────────────────────────────────────────────────────────────

export function SocialCard({ item }: { item: CardItem }) {
  const [expanded, setExpanded] = useState(false);
  const text = item.content || item.description || "";
  const isLong = text.length > 200;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#351470] shadow-[0_4px_24px_rgba(0,0,0,0.35)] transition hover:-translate-y-1">
      {/* Image banner */}
      {item.images && item.images.length > 0 && (
        <div className={`overflow-hidden bg-[#2A0F5A] ${item.images.length === 1 ? "h-48" : "grid grid-cols-2 gap-0.5 h-48"}`}>
          {item.images.length === 1 ? (
            <img src={item.images[0]} alt="" className="h-full w-full object-contain" />
          ) : (
            item.images.slice(0, 4).map((img, i) => (
              <img key={i} src={img} alt="" className="h-full w-full object-cover" />
            ))
          )}
        </div>
      )}

      <div className="p-4">
        {/* User row */}
        <div className="mb-3 flex items-center gap-2">
          <Avatar user={item.user} size="md" />
          <div>
            <p className="text-sm font-semibold text-white">{item.user?.full_name || "LSUS Student"}</p>
            <p className="text-xs text-[#8B72BE]">{timeAgo(item.created_at)}</p>
          </div>
          {item.location && (
            <span className="ml-auto text-xs text-[#8B72BE]">📍 {item.location}</span>
          )}
        </div>

        {/* Content */}
        <p className={`text-sm leading-6 text-[#E9DFFF] ${!expanded && isLong ? "line-clamp-3" : ""}`}>
          {text}
        </p>
        {isLong && (
          <button onClick={() => setExpanded(v => !v)} className="mt-1 text-xs font-bold text-[#F5A623] hover:underline">
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Grid wrapper ──────────────────────────────────────────────────────────────

export function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {children}
    </div>
  );
}
