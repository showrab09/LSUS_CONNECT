"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import UserDropdown from "@/components/UserDropdown";

// ─── Types ────────────────────────────────────────────────────────────────────

type FeedItemType = "listing" | "social" | "lost_found";

interface FeedUser {
  id: string;
  full_name: string;
  email: string;
  profile_picture?: string;
}

interface FeedItem {
  id: string;
  type: FeedItemType;
  user: FeedUser;
  title?: string;        // listings + lost_found
  content?: string;      // social posts
  description?: string;  // listings + lost_found
  price?: number;
  images: string[];
  location?: string;
  category?: string;
  lost_found_type?: "LOST" | "FOUND";
  created_at: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: FeedUser;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
}

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

function formatPrice(price?: number) {
  if (!price || price === 0) return "FREE";
  return `$${price}`;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ user, size = 10 }: { user: FeedUser; size?: number }) {
  const sizeClass = `w-${size} h-${size}`;
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-[#FDD023] to-[#FFE34A] flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-[#FDD023]`}>
      {user.profile_picture ? (
        <img src={user.profile_picture} alt={user.full_name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-black font-bold text-sm">{getInitials(user.full_name)}</span>
      )}
    </div>
  );
}

// ─── Comment Section ──────────────────────────────────────────────────────────

function CommentSection({ item }: { item: FeedItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const paramKey =
        item.type === "social" ? "post_id" :
        item.type === "listing" ? "listing_id" : "lost_found_id";

      const res = await fetch(`/api/comments?${paramKey}=${item.id}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isOpen) fetchComments();
    setIsOpen(!isOpen);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSubmit = async () => {
    if (!newComment.trim() || isPosting) return;
    setIsPosting(true);
    try {
      const paramKey =
        item.type === "social" ? "post_id" :
        item.type === "listing" ? "listing_id" : "lost_found_id";

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content: newComment.trim(),
          [paramKey]: item.id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments(prev => [...prev, data.comment]);
        setNewComment("");
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="mt-4 border-t border-[#5a2d8c] pt-3">
      <button
        onClick={handleToggle}
        className="w-full py-3 px-4 bg-[#5a2d8c] hover:bg-[#6a3d9c] text-white font-semibold rounded-lg transition-colors text-sm"
      >
        {isOpen ? "Hide Comments" : `Leave a Comment`}
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3">
          {/* Existing comments */}
          {isLoading ? (
            <p className="text-gray-400 text-sm text-center py-2">Loading...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-2">No comments yet. Be the first!</p>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <Avatar user={comment.user} size={8} />
                <div className="flex-1 bg-[#2a0d44] rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white text-xs font-semibold">{comment.user.full_name}</span>
                    <span className="text-gray-500 text-xs">{timeAgo(comment.created_at)}</span>
                  </div>
                  <p className="text-gray-200 text-sm">{comment.content}</p>
                </div>
              </div>
            ))
          )}

          {/* New comment input */}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="Write a comment..."
              className="flex-1 bg-[#2a0d44] border border-[#5a2d8c] text-white text-sm px-3 py-2 rounded-lg placeholder-gray-500 focus:outline-none focus:border-[#FDD023]"
            />
            <button
              onClick={handleSubmit}
              disabled={isPosting || !newComment.trim()}
              className="px-4 py-2 bg-[#FDD023] text-black font-bold text-sm rounded-lg hover:bg-[#FFE34A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPosting ? "..." : "Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Feed Card ────────────────────────────────────────────────────────────────

function FeedCard({ item }: { item: FeedItem }) {
  const displayText = item.content || item.description || "";
  const displayTitle = item.title || "";

  return (
    <div className="bg-[#3a1364] rounded-xl border border-[#5a2d8c] hover:border-[#7a4dac] transition-colors p-5">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar user={item.user} size={10} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold text-sm">{item.user.full_name}</span>
            {item.lost_found_type && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                item.lost_found_type === "LOST"
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : "bg-green-500/20 text-green-300 border border-green-500/30"
              }`}>
                {item.lost_found_type}
              </span>
            )}
            {item.category && (
              <span className="text-xs text-gray-400 bg-[#2a0d44] px-2 py-0.5 rounded-full">
                {item.category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {displayTitle && (
              <p className="text-gray-200 text-sm font-medium">{displayTitle}</p>
            )}
            {item.price !== undefined && (
              <p className={`text-sm font-bold ${item.price === 0 ? "text-green-400" : "text-[#FDD023]"}`}>
                {formatPrice(item.price)}
              </p>
            )}
          </div>
          {displayText && displayText !== displayTitle && (
            <p className="text-gray-300 text-sm mt-1 line-clamp-3">{displayText}</p>
          )}
          {item.location && (
            <p className="text-gray-500 text-xs mt-1">📍 {item.location}</p>
          )}
        </div>
        <span className="text-gray-500 text-xs whitespace-nowrap flex-shrink-0">
          {timeAgo(item.created_at)}
        </span>
      </div>

      {/* Images */}
      {item.images && item.images.length > 0 && (
        <div className={`grid gap-2 mb-3 ${item.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {item.images.slice(0, 2).map((img, i) => (
            <div key={i} className="aspect-video bg-[#2a0d44] rounded-lg overflow-hidden">
              <img
                src={img}
                alt={`Image ${i + 1}`}
                className="w-full h-full object-cover"
                onError={e => {
                  e.currentTarget.parentElement!.style.display = "none";
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* View detail link for listings */}
      {item.type === "listing" && (
        <Link
          href={`/product-detail?id=${item.id}`}
          className="inline-block text-xs text-[#FDD023] hover:underline mb-3"
        >
          View full listing →
        </Link>
      )}
      {item.type === "lost_found" && (
        <Link
          href="/lost-found"
          className="inline-block text-xs text-[#FDD023] hover:underline mb-3"
        >
          View on Lost & Found →
        </Link>
      )}

      {/* Comments */}
      <CommentSection item={item} />
    </div>
  );
}

// ─── Create Post Modal ────────────────────────────────────────────────────────

function CreatePostModal({ onClose, onPost }: { onClose: () => void; onPost: (post: FeedItem) => void }) {
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("Please write something before posting.");
      return;
    }
    setIsPosting(true);
    setError("");
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: content.trim(), location: location.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to post.");
        return;
      }

      const post = data.post;
      const owner = Array.isArray(post.user) ? post.user[0] : post.user;
      onPost({
        id: post.id,
        type: "social",
        user: owner,
        content: post.content,
        location: post.location,
        images: post.images || [],
        created_at: post.created_at,
      });
      onClose();
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#3a1364] rounded-xl border border-[#5a2d8c] w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#5a2d8c]">
          <h2 className="text-white font-bold text-lg">Share a Post</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's on your mind? Share with the LSUS community..."
            rows={4}
            maxLength={1000}
            className="w-full bg-[#2a0d44] border border-[#5a2d8c] text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-[#FDD023] resize-none"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{content.length}/1000</span>
          </div>

          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="📍 Add a location (optional)"
            className="w-full bg-[#2a0d44] border border-[#5a2d8c] text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-[#FDD023]"
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-[#2a0d44] text-white font-semibold rounded-lg hover:bg-[#3a1364] border border-[#5a2d8c] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPosting || !content.trim()}
            className="flex-1 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPosting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const CATEGORIES = ["Furniture", "Books", "Housing", "Electronics", "Free / Swap", "Lost & Found", "Social"];

export default function HomeFeedPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [listingsRes, postsRes, lostFoundRes] = await Promise.all([
        fetch("/api/listings?limit=20", { credentials: "include" }),
        fetch("/api/posts?limit=20", { credentials: "include" }),
        fetch("/api/lost-found", { credentials: "include" }),
      ]);

      const combined: FeedItem[] = [];

      if (listingsRes.ok) {
        const data = await listingsRes.json();
        const listings = data.listings || data.items || [];
        listings.forEach((l: any) => {
          const owner = Array.isArray(l.user) ? l.user[0] : l.user;
          if (!owner) return;
          combined.push({
            id: l.id,
            type: "listing",
            user: owner,
            title: l.title,
            description: l.description,
            price: l.price,
            images: l.images || [],
            location: l.location,
            category: l.category,
            created_at: l.created_at,
          });
        });
      }

      if (postsRes.ok) {
        const data = await postsRes.json();
        const posts = data.posts || [];
        posts.forEach((p: any) => {
          const owner = Array.isArray(p.user) ? p.user[0] : p.user;
          if (!owner) return;
          combined.push({
            id: p.id,
            type: "social",
            user: owner,
            content: p.content,
            location: p.location,
            images: p.images || [],
            created_at: p.created_at,
          });
        });
      }

      if (lostFoundRes.ok) {
        const data = await lostFoundRes.json();
        const items = data.items || [];
        items.forEach((lf: any) => {
          const owner = Array.isArray(lf.user) ? lf.user[0] : lf.user;
          if (!owner) return;
          combined.push({
            id: lf.id,
            type: "lost_found",
            user: owner,
            title: lf.title,
            description: lf.description,
            images: lf.images || [],
            location: lf.location,
            category: lf.category,
            lost_found_type: lf.type,
            created_at: lf.created_at,
          });
        });
      }

      // Sort everything by newest first
      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setFeedItems(combined);
    } catch (err) {
      console.error("Feed error:", err);
      setError("Failed to load feed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFilter = (cat: string) => {
    setActiveFilters(prev =>
      prev.includes(cat) ? prev.filter(f => f !== cat) : [...prev, cat]
    );
  };

  const filteredItems = activeFilters.length === 0 ? feedItems : feedItems.filter(item => {
    if (activeFilters.includes("Lost & Found") && item.type === "lost_found") return true;
    if (activeFilters.includes("Social") && item.type === "social") return true;
    if (item.category && activeFilters.includes(item.category)) return true;
    return false;
  });

  return (
    <div className="min-h-screen bg-[#461D7C]">

      {/* ── Header ── */}
      <header className="bg-[#3a1364] border-b border-[#5a2d8c] py-4 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-white hover:text-[#FDD023] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              <Link href="/home" className="text-2xl sm:text-3xl font-bold flex items-center gap-1">
                <span className="text-[#FDD023]">LSUS</span>
                <span className="text-white">CONNECT</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/home" className="text-[#FDD023] font-semibold text-sm border-b-2 border-[#FDD023] pb-0.5">
                Home
              </Link>
              <Link href="/marketplace" className="text-white hover:text-[#FDD023] transition-colors text-sm">
                Marketplace
              </Link>
              <Link href="/housing" className="text-white hover:text-[#FDD023] transition-colors text-sm">
                Housing
              </Link>
              <Link href="/social" className="text-white hover:text-[#FDD023] transition-colors text-sm">
                Social
              </Link>
              <Link href="/lost-found" className="text-white hover:text-[#FDD023] transition-colors text-sm">
                Lost & Found
              </Link>
              <Link href="/post-listing" className="text-white hover:text-[#FDD023] transition-colors text-sm">
                Post a Listing
              </Link>
            </nav>

            <UserDropdown />
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <nav className="lg:hidden mt-4 pt-4 border-t border-[#5a2d8c] flex flex-col gap-2">
              {[
                { href: "/home", label: "Home" },
                { href: "/marketplace", label: "Marketplace" },
                { href: "/housing", label: "Housing" },
                { href: "/social", label: "Social" },
                { href: "/lost-found", label: "Lost & Found" },
                { href: "/post-listing", label: "Post a Listing" },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white hover:text-[#FDD023] py-2 px-3 rounded hover:bg-[#461D7C] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* ── Body ── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

        {/* ── Left Sidebar ── */}
        <aside className="space-y-4">
          {/* Filters */}
          <div className="bg-[#3a1364] rounded-xl border border-[#5a2d8c] p-5">
            <h3 className="text-white font-bold text-base mb-4">Filters</h3>
            <div className="space-y-3">
              {CATEGORIES.map(cat => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={activeFilters.includes(cat)}
                    onChange={() => toggleFilter(cat)}
                    className="w-4 h-4 accent-[#FDD023] cursor-pointer"
                  />
                  <span className="text-gray-300 text-sm group-hover:text-white transition-colors">
                    {cat}
                  </span>
                </label>
              ))}
            </div>
            {activeFilters.length > 0 && (
              <button
                onClick={() => setActiveFilters([])}
                className="mt-4 w-full py-2 bg-[#FDD023] text-black font-bold text-sm rounded-lg hover:bg-[#FFE34A] transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Share a Post CTA */}
          <button
            onClick={() => setShowCreatePost(true)}
            className="w-full py-3 bg-[#FDD023] text-black font-bold rounded-xl hover:bg-[#FFE34A] transition-colors"
          >
            + Share a Post
          </button>

          {/* Quick Links */}
          <div className="bg-[#3a1364] rounded-xl border border-[#5a2d8c] p-5">
            <h3 className="text-white font-bold text-base mb-3">Quick Links</h3>
            <div className="space-y-2">
              {[
                { href: "/marketplace", label: "🛍️ Marketplace" },
                { href: "/housing", label: "🏠 Housing" },
                { href: "/lost-found", label: "🔍 Lost & Found" },
                { href: "/post-listing", label: "➕ Post a Listing" },
                { href: "/contact-team", label: "📧 Contact Team" },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-gray-300 hover:text-[#FDD023] text-sm py-1 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Feed ── */}
        <main className="space-y-4">
          {/* Feed Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-xl">
              {activeFilters.length > 0 ? `Filtered Feed (${filteredItems.length})` : "All Posts"}
            </h2>
            <button
              onClick={fetchFeed}
              className="text-[#FDD023] text-sm hover:underline"
            >
              Refresh
            </button>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-[#FDD023] border-t-transparent rounded-full animate-spin" />
              <p className="text-white mt-4">Loading feed...</p>
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg p-4">
              {error}
              <button onClick={fetchFeed} className="ml-4 underline hover:text-red-200">Retry</button>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !error && filteredItems.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg mb-4">
                {activeFilters.length > 0 ? "No posts match your filters." : "The feed is empty."}
              </p>
              <button
                onClick={() => setShowCreatePost(true)}
                className="px-6 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
              >
                Be the first to post!
              </button>
            </div>
          )}

          {/* Feed Cards */}
          {!isLoading && !error && filteredItems.map(item => (
            <FeedCard key={`${item.type}-${item.id}`} item={item} />
          ))}
        </main>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onPost={newPost => setFeedItems(prev => [newPost, ...prev])}
        />
      )}
    </div>
  );
}
