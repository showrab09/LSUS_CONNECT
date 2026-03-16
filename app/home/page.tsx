"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import UserDropdown from "@/components/UserDropdown";

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
  title?: string;
  content?: string;
  description?: string;
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

const CATEGORIES = ["Furniture", "Books", "Housing", "Electronics", "Free / Swap", "Lost & Found", "Social"];

const NAV_LINKS = [
  { href: "/home", label: "Home", active: true },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/housing", label: "Housing" },
  { href: "/social", label: "Social" },
  { href: "/lost-found", label: "Lost & Found" },
  { href: "/post-listing", label: "Post a Listing" },
];

const EMOJI_LIST = [
  "😀","😂","😍","🥰","😎","🤔","😊","🙌","👍","❤️",
  "🔥","✨","🎉","💯","😭","🤣","😅","👀","💪","🙏",
  "😤","🥳","😱","🤩","😴","💀","🤯","😬","🫶","💬",
  "👋","🎊","🏆","🎯","💡","📚","☕","🍕","🎵","⭐",
];

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
}

function timeAgo(dateString: string) {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString();
}

function formatPrice(price?: number) {
  if (!price || price === 0) return "FREE";
  return `$${price}`;
}

function Avatar({ user, size = "md" }: { user: { full_name: string; profile_picture?: string }; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "w-11 h-11" : size === "sm" ? "w-8 h-8" : "w-10 h-10";
  return (
    <div className={`${cls} rounded-full bg-gradient-to-br from-[#FDD023] to-[#FFE34A] flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-[#FDD023]`}>
      {user.profile_picture
        ? <img src={user.profile_picture} alt={user.full_name} className="w-full h-full object-cover" />
        : <span className="text-black font-bold text-sm">{getInitials(user.full_name)}</span>
      }
    </div>
  );
}

// ── Inline Compose Box ───────────────────────────────────────────────────────

function ComposeBox({ currentUser, onPost }: {
  currentUser: { id: string; full_name: string; profile_picture?: string };
  onPost: (item: FeedItem) => void;
}) {
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [showLocation, setShowLocation] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; }
  }, [content]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setShowEmojis(false);
    };
    if (showEmojis) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showEmojis]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 4 - previews.length);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const result = ev.target?.result as string;
        setPreviews(prev => [...prev, result]);
        setImages(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removePreview = (i: number) => {
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
    setImages(prev => prev.filter((_, idx) => idx !== i));
  };

  const insertEmoji = (emoji: string) => {
    const ta = textareaRef.current;
    if (ta) {
      const s = ta.selectionStart, e2 = ta.selectionEnd;
      setContent(content.slice(0, s) + emoji + content.slice(e2));
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = s + emoji.length; ta.focus(); }, 0);
    } else {
      setContent(p => p + emoji);
    }
    setShowEmojis(false);
  };

  const handleSubmit = async () => {
    if (!content.trim()) { setError("Please write something."); return; }
    setIsPosting(true); setError("");
    try {
      const res = await fetch("/api/posts", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ content: content.trim(), location: location.trim() || null, images }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to post."); return; }
      const p = data.post;
      const owner = Array.isArray(p.user) ? p.user[0] : p.user;
      onPost({ id: p.id, type: "social", user: owner || currentUser, content: p.content, location: p.location, images: p.images || [], created_at: p.created_at });
      setContent(""); setLocation(""); setImages([]); setPreviews([]); setShowLocation(false);
    } catch { setError("Something went wrong. Try again."); }
    finally { setIsPosting(false); }
  };

  return (
    <div className="bg-[#3a1364] rounded-xl border border-[#5a2d8c] p-4 mb-4">
      <div className="flex gap-3">
        <Avatar user={currentUser} size="lg" />
        <div className="flex-1">
          <textarea ref={textareaRef} value={content} onChange={e => setContent(e.target.value)}
            placeholder={`What's on your mind, ${currentUser.full_name.split(" ")[0]}?`}
            maxLength={1000} rows={2}
            className="w-full bg-[#2a0d44] text-white text-sm px-4 py-3 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FDD023]/30 resize-none border border-[#5a2d8c] focus:border-[#FDD023] transition-colors min-h-[56px]"
          />
        </div>
      </div>

      {previews.length > 0 && (
        <div className={`mt-3 grid gap-2 ${previews.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {previews.map((src, i) => (
            <div key={i} className="relative aspect-video bg-[#2a0d44] rounded-lg overflow-hidden">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button onClick={() => removePreview(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/70 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xs transition-colors">✕</button>
            </div>
          ))}
        </div>
      )}

      {showLocation && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-base">📍</span>
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Add your location..."
            className="flex-1 bg-[#2a0d44] border border-[#5a2d8c] text-white text-sm px-3 py-2 rounded-lg placeholder-gray-500 focus:outline-none focus:border-[#FDD023]" />
          <button onClick={() => { setShowLocation(false); setLocation(""); }} className="text-gray-500 hover:text-red-400 text-xs transition-colors">Remove</button>
        </div>
      )}

      {error && <p className="mt-2 text-red-400 text-xs">{error}</p>}

      <div className="border-t border-[#5a2d8c] mt-3 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button onClick={() => fileInputRef.current?.click()} disabled={previews.length >= 4}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#2a0d44] disabled:opacity-40 transition-colors text-sm">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">Photo</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoChange} />

          <div className="relative" ref={emojiRef}>
            <button onClick={() => setShowEmojis(!showEmojis)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#2a0d44] transition-colors text-sm">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">Emoji</span>
            </button>
            {showEmojis && (
              <div className="absolute left-0 bottom-11 z-50 bg-[#2a0d44] border border-[#5a2d8c] rounded-xl p-3 shadow-2xl w-72">
                <div className="grid grid-cols-10 gap-1">
                  {EMOJI_LIST.map(emoji => (
                    <button key={emoji} onClick={() => insertEmoji(emoji)}
                      className="text-xl hover:bg-[#3a1364] rounded-lg p-1 transition-colors leading-none">{emoji}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={() => setShowLocation(!showLocation)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-sm ${showLocation ? "text-[#FDD023] bg-[#2a0d44]" : "text-gray-300 hover:text-white hover:bg-[#2a0d44]"}`}>
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:inline">Location</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {content.length > 800 && (
            <span className={`text-xs ${content.length >= 1000 ? "text-red-400" : "text-gray-400"}`}>{content.length}/1000</span>
          )}
          <button onClick={handleSubmit} disabled={isPosting || !content.trim()}
            className="px-6 py-2 bg-[#FDD023] text-black font-bold text-sm rounded-lg hover:bg-[#FFE34A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {isPosting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Comment Section ──────────────────────────────────────────────────────────

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
      const key = item.type === "social" ? "post_id" : item.type === "listing" ? "listing_id" : "lost_found_id";
      const res = await fetch(`/api/comments?${key}=${item.id}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } finally { setIsLoading(false); }
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
      const key = item.type === "social" ? "post_id" : item.type === "listing" ? "listing_id" : "lost_found_id";
      const res = await fetch("/api/comments", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ content: newComment.trim(), [key]: item.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments(prev => [...prev, data.comment]);
        setNewComment("");
      }
    } finally { setIsPosting(false); }
  };

  return (
    <div className="mt-3 border-t border-[#5a2d8c] pt-3">
      <button onClick={handleToggle}
        className="w-full py-2.5 bg-[#5a2d8c]/50 hover:bg-[#5a2d8c] text-white font-medium rounded-lg transition-colors text-sm">
        {isOpen ? "Hide Comments" : "💬 Leave a Comment"}
      </button>
      {isOpen && (
        <div className="mt-3 space-y-3">
          {isLoading ? <p className="text-gray-400 text-sm text-center py-2">Loading...</p>
            : comments.length === 0 ? <p className="text-gray-400 text-sm text-center py-2">No comments yet. Be the first!</p>
            : comments.map(comment => (
              <div key={comment.id} className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FDD023] to-[#FFE34A] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {comment.user.profile_picture
                    ? <img src={comment.user.profile_picture} alt="" className="w-full h-full object-cover" />
                    : <span className="text-black font-bold text-xs">{getInitials(comment.user.full_name)}</span>
                  }
                </div>
                <div className="flex-1 bg-[#2a0d44] rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white text-xs font-semibold">{comment.user.full_name}</span>
                    <span className="text-gray-500 text-xs">{timeAgo(comment.created_at)}</span>
                  </div>
                  <p className="text-gray-200 text-sm">{comment.content}</p>
                </div>
              </div>
            ))
          }
          <div className="flex gap-2">
            <input ref={inputRef} type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} placeholder="Write a comment..."
              className="flex-1 bg-[#2a0d44] border border-[#5a2d8c] text-white text-sm px-3 py-2 rounded-xl placeholder-gray-500 focus:outline-none focus:border-[#FDD023]" />
            <button onClick={handleSubmit} disabled={isPosting || !newComment.trim()}
              className="px-4 py-2 bg-[#FDD023] text-black font-bold text-sm rounded-xl hover:bg-[#FFE34A] disabled:opacity-50 transition-colors">
              {isPosting ? "..." : "Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Feed Card ────────────────────────────────────────────────────────────────

function FeedCard({ item }: { item: FeedItem }) {
  const displayText = item.content || item.description || "";
  const displayTitle = item.title || "";

  return (
    <div className="bg-[#3a1364] rounded-xl border border-[#5a2d8c] hover:border-[#7a4dac] transition-colors p-4">
      <div className="flex items-start gap-3 mb-3">
        <Avatar user={item.user} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold text-sm">{item.user.full_name}</span>
            {item.lost_found_type && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.lost_found_type === "LOST" ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-green-500/20 text-green-300 border border-green-500/30"}`}>
                {item.lost_found_type}
              </span>
            )}
            {item.category && (
              <span className="text-xs text-gray-400 bg-[#2a0d44] px-2 py-0.5 rounded-full">{item.category}</span>
            )}
          </div>
          {displayTitle && (
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-gray-200 text-sm font-medium">{displayTitle}</p>
              {item.price !== undefined && (
                <p className={`text-sm font-bold ${item.price === 0 ? "text-green-400" : "text-[#FDD023]"}`}>{formatPrice(item.price)}</p>
              )}
            </div>
          )}
          {displayText && displayText !== displayTitle && (
            <p className="text-gray-300 text-sm mt-1 line-clamp-3 leading-relaxed">{displayText}</p>
          )}
          {item.location && <p className="text-gray-500 text-xs mt-1">📍 {item.location}</p>}
        </div>
        <span className="text-gray-500 text-xs whitespace-nowrap flex-shrink-0">{timeAgo(item.created_at)}</span>
      </div>

      {item.images && item.images.length > 0 && (
        <div className={`grid gap-2 mb-3 ${item.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {item.images.slice(0, 2).map((img, i) => (
            <div key={i} className="aspect-video bg-[#2a0d44] rounded-lg overflow-hidden">
              <img src={img} alt="" className="w-full h-full object-cover"
                onError={e => { e.currentTarget.parentElement!.style.display = "none"; }} />
            </div>
          ))}
        </div>
      )}

      {item.type === "listing" && (
        <Link href={`/product-detail?id=${item.id}`} className="inline-block text-xs text-[#FDD023] hover:underline mb-3">View full listing →</Link>
      )}
      {item.type === "lost_found" && (
        <Link href="/lost-found" className="inline-block text-xs text-[#FDD023] hover:underline mb-3">View on Lost & Found →</Link>
      )}

      <CommentSection item={item} />
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function HomeFeedPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; full_name: string; profile_picture?: string }>({ id: "", full_name: "User" });

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(decodeURIComponent(atob(base64).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")));
        setCurrentUser({ id: payload.userId || "", full_name: payload.name || payload.email?.split("@")[0] || "User" });
      }
    } catch {}
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    setIsLoading(true); setError("");
    try {
      const [listingsRes, postsRes, lostFoundRes] = await Promise.all([
        fetch("/api/listings?limit=20", { credentials: "include" }),
        fetch("/api/posts?limit=20", { credentials: "include" }),
        fetch("/api/lost-found", { credentials: "include" }),
      ]);

      const combined: FeedItem[] = [];

      if (listingsRes.ok) {
        const data = await listingsRes.json();
        (data.listings || data.items || []).forEach((l: any) => {
          const owner = Array.isArray(l.user) ? l.user[0] : l.user;
          if (!owner) return;
          combined.push({ id: l.id, type: "listing", user: owner, title: l.title, description: l.description, price: l.price, images: l.images || [], location: l.location, category: l.category, created_at: l.created_at });
        });
      }

      if (postsRes.ok) {
        const data = await postsRes.json();
        (data.posts || []).forEach((p: any) => {
          const owner = Array.isArray(p.user) ? p.user[0] : p.user;
          if (!owner) return;
          combined.push({ id: p.id, type: "social", user: owner, content: p.content, location: p.location, images: p.images || [], created_at: p.created_at });
        });
      }

      if (lostFoundRes.ok) {
        const data = await lostFoundRes.json();
        (data.items || []).forEach((lf: any) => {
          const owner = Array.isArray(lf.user) ? lf.user[0] : lf.user;
          if (!owner) return;
          combined.push({ id: lf.id, type: "lost_found", user: owner, title: lf.title, description: lf.description, images: lf.images || [], location: lf.location, category: lf.category, lost_found_type: lf.type, created_at: lf.created_at });
        });
      }

      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setFeedItems(combined);
    } catch { setError("Failed to load feed. Please try again."); }
    finally { setIsLoading(false); }
  };

  const toggleFilter = (cat: string) => {
    setActiveFilters(prev => prev.includes(cat) ? prev.filter(f => f !== cat) : [...prev, cat]);
  };

  const filteredItems = activeFilters.length === 0 ? feedItems : feedItems.filter(item => {
    if (activeFilters.includes("Lost & Found") && item.type === "lost_found") return true;
    if (activeFilters.includes("Social") && item.type === "social") return true;
    if (item.category && activeFilters.includes(item.category)) return true;
    return false;
  });

  return (
    <div className="min-h-screen bg-[#461D7C]">
      <header className="bg-[#3a1364] border-b border-[#5a2d8c] py-4 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-white hover:text-[#FDD023] transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  }
                </svg>
              </button>
              <Link href="/home" className="text-2xl sm:text-3xl font-bold flex items-center gap-1">
                <span className="text-[#FDD023]">LSUS</span>
                <span className="text-white">CONNECT</span>
              </Link>
            </div>
            <nav className="hidden lg:flex items-center gap-5">
              {NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href} className={`text-sm transition-colors ${link.active ? "text-[#FDD023] font-semibold border-b-2 border-[#FDD023] pb-0.5" : "text-white hover:text-[#FDD023]"}`}>
                  {link.label}
                </Link>
              ))}
            </nav>
            <UserDropdown />
          </div>
          {isMobileMenuOpen && (
            <nav className="lg:hidden mt-4 pt-4 border-t border-[#5a2d8c] flex flex-col gap-1">
              {NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}
                  className={`py-2 px-3 rounded transition-colors ${link.active ? "text-[#FDD023]" : "text-white hover:text-[#FDD023] hover:bg-[#461D7C]"}`}>
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="bg-[#3a1364] rounded-xl border border-[#5a2d8c] p-5">
            <h3 className="text-white font-bold text-base mb-4">Filters</h3>
            <div className="space-y-3">
              {CATEGORIES.map(cat => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={activeFilters.includes(cat)} onChange={() => toggleFilter(cat)} className="w-4 h-4 accent-[#FDD023] cursor-pointer" />
                  <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{cat}</span>
                </label>
              ))}
            </div>
            {activeFilters.length > 0 && (
              <button onClick={() => setActiveFilters([])} className="mt-4 w-full py-2 bg-[#FDD023] text-black font-bold text-sm rounded-lg hover:bg-[#FFE34A] transition-colors">
                Clear Filters
              </button>
            )}
          </div>

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
                <Link key={link.href} href={link.href} className="block text-gray-300 hover:text-[#FDD023] text-sm py-1 transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Feed */}
        <main>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-xl">
              {activeFilters.length > 0 ? `Filtered Feed (${filteredItems.length})` : "All Posts"}
            </h2>
            <button onClick={fetchFeed} className="text-[#FDD023] text-sm hover:underline">Refresh</button>
          </div>

          {/* Inline compose box */}
          {currentUser.id && <ComposeBox currentUser={currentUser} onPost={item => setFeedItems(prev => [item, ...prev])} />}

          {isLoading && (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-[#FDD023] border-t-transparent rounded-full animate-spin" />
              <p className="text-white mt-4">Loading feed...</p>
            </div>
          )}
          {error && !isLoading && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg p-4 mb-4">
              {error} <button onClick={fetchFeed} className="ml-4 underline">Retry</button>
            </div>
          )}
          {!isLoading && !error && filteredItems.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">{activeFilters.length > 0 ? "No posts match your filters." : "The feed is empty."}</p>
            </div>
          )}
          <div className="space-y-4">
            {!isLoading && !error && filteredItems.map(item => (
              <FeedCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
