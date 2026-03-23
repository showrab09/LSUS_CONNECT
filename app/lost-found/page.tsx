"use client";
import { HorizontalCard, CardItem } from "@/components/ItemCard";

import AppLayout from "@/components/AppLayout";
import { useState, useEffect } from "react";
import Link from "next/link";

interface LostFoundItem {
  id: string;
  type: "LOST" | "FOUND";
  title: string;
  description: string;
  location: string;
  images: string[];
  category?: string;
  status: string;
  created_at: string;
  user?: { id: string; full_name: string; profile_picture?: string };
}

function timeAgo(dateString: string) {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString();
}

function getInitials(name: string) {
  return name?.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2) || "U";
}

export default function LostFoundPage() {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"ALL" | "LOST" | "FOUND">("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/lost-found", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      setError("Failed to load items. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = items.filter(item => {
    const matchesFilter = filter === "ALL" || item.type === filter;
    const matchesSearch = search === "" ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.location?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Lost &amp; Found</h1>
            <p className="text-sm text-[#C4B0E0]">Help reunite people with their belongings</p>
          </div>
          <Link href="/report-lost-found"
            className="rounded-full bg-[#F5A623] px-5 py-2 text-sm font-bold text-[#1E0A42] transition hover:bg-[#FFD166]">
            + Report Item
          </Link>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-white/10 bg-[#2A0F5A] px-4 py-2">
            <span className="text-[#C4B0E0]">🔍</span>
            <input
              type="text"
              placeholder="Search lost & found..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#8B72BE]"
            />
          </div>
          <div className="flex gap-2">
            {(["ALL", "LOST", "FOUND"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  filter === f
                    ? f === "LOST" ? "bg-red-500 text-white"
                    : f === "FOUND" ? "bg-green-500 text-white"
                    : "bg-[#F5A623] text-[#1E0A42]"
                    : "border border-white/10 bg-white/5 text-[#C4B0E0] hover:bg-white/10"
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="py-20 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#F5A623] border-t-transparent" />
          <p className="mt-4 text-white">Loading...</p>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          {error} <button onClick={fetchItems} className="ml-3 underline">Retry</button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && filtered.length === 0 && (
        <div className="py-20 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#351470] text-4xl">🔎</div>
          <h3 className="mb-2 text-xl font-bold text-white">
            {search ? `No results for "${search}"` : "No items reported yet"}
          </h3>
          <p className="mb-6 text-[#C4B0E0]">Be the first to report a lost or found item</p>
          <Link href="/report-lost-found"
            className="inline-block rounded-full bg-[#F5A623] px-8 py-3 font-bold text-[#1E0A42] transition hover:bg-[#FFD166]">
            Report an Item
          </Link>
        </div>
      )}

      {/* Items Grid */}
      {!isLoading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(item => {
            const owner = Array.isArray(item.user) ? item.user[0] : item.user;
            const cardItem: CardItem = {
              id: item.id,
              type: "lost_found",
              title: item.title,
              description: item.description,
              location: item.location,
              images: item.images,
              lost_found_type: item.type as "LOST" | "FOUND",
              category: item.category,
              created_at: item.created_at,
              user: owner,
            };
            return <HorizontalCard key={item.id} item={cardItem} />;
          })}
        </div>
      )}
    </AppLayout>
  );
}
