"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import UserDropdown from "@/components/UserDropdown";
import { useCurrentUser } from "@/hooks/useCurrentUser";

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

const FILTERS = [
  "Furniture",
  "Books",
  "Housing",
  "Electronics",
  "Free / Swap",
  "Lost & Found",
  "Social",
];

const LEFT_NAV = [
  { href: "/home", label: "Home", icon: "🏠", active: true },
  { href: "/marketplace", label: "Marketplace", icon: "🛍️" },
  { href: "/housing", label: "Housing", icon: "🏠" },
  { href: "/social", label: "Social", icon: "👥" },
  { href: "/lost-found", label: "Lost & Found", icon: "🔎" },
  { href: "/post-listing", label: "Post a Listing", icon: "➕" },
];

const EMOJI_LIST = [
  "😀", "😂", "😍", "🥰", "😎", "🤔", "😊", "🙌", "👍", "❤️",
  "🔥", "✨", "🎉", "💯", "😭", "🤣", "😅", "👀", "💪", "🙏",
  "😤", "🥳", "😱", "🤩", "😴", "💀", "🤯", "😬", "🫶", "💬",
  "👋", "🎊", "🏆", "🎯", "💡", "📚", "☕", "🍕", "🎵", "⭐",
];

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
  );
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

function Avatar({
  user,
  size = "md",
}: {
  user: { full_name: string; profile_picture?: string };
  size?: "sm" | "md" | "lg";
}) {
  const cls =
    size === "lg"
      ? "h-12 w-12"
      : size === "sm"
        ? "h-8 w-8"
        : "h-10 w-10";

  return (
    <div
      className={`${cls} flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#F5A623] bg-gradient-to-br from-[#FFD166] to-[#F5A623]`}
    >
      {user.profile_picture ? (
        <img
          src={user.profile_picture}
          alt={user.full_name}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-sm font-bold text-[#1E0A42]">{getInitials(user.full_name)}</span>
      )}
    </div>
  );
}

function ComposeBox({
  currentUser,
  onPost,
}: {
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
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, [content]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojis(false);
      }
    };

    if (showEmojis) {
      document.addEventListener("mousedown", handler);
    }

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

  const removePreview = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const insertEmoji = (emoji: string) => {
    const ta = textareaRef.current;
    if (ta) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      setContent(content.slice(0, start) + emoji + content.slice(end));
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + emoji.length;
        ta.focus();
      }, 0);
    } else {
      setContent(prev => prev + emoji);
    }
    setShowEmojis(false);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("Please write something.");
      return;
    }

    setIsPosting(true);
    setError("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content: content.trim(),
          location: location.trim() || null,
          images,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to post.");
        return;
      }

      const p = data.post;
      const owner = Array.isArray(p.user) ? p.user[0] : p.user;
      onPost({
        id: p.id,
        type: "social",
        user: owner || currentUser,
        content: p.content,
        location: p.location,
        images: p.images || [],
        created_at: p.created_at,
      });

      setContent("");
      setLocation("");
      setImages([]);
      setPreviews([]);
      setShowLocation(false);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#351470] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
      <div className="mb-4 flex items-start gap-3">
        <Avatar user={currentUser} size="lg" />
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={`What’s on your mind, ${currentUser.full_name.split(" ")[0]}?`}
            maxLength={1000}
            rows={2}
            className="min-h-[72px] w-full resize-none rounded-2xl border border-white/10 bg-[#2A0F5A] px-4 py-3 text-sm text-white outline-none transition focus:border-[#F5A623]"
          />
        </div>
      </div>

      {previews.length > 0 && (
        <div className={`mb-4 grid gap-2 ${previews.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {previews.map((src, index) => (
            <div key={index} className="relative aspect-video overflow-hidden rounded-xl bg-[#2A0F5A]">
              <img src={src} alt="preview" className="h-full w-full object-cover" />
              <button
                onClick={() => removePreview(index)}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-xs text-white transition hover:bg-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {showLocation && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#2A0F5A] p-3">
          <span>📍</span>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Add your location..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#8B72BE]"
          />
          <button
            onClick={() => {
              setShowLocation(false);
              setLocation("");
            }}
            className="text-xs text-[#C4B0E0] transition hover:text-red-400"
          >
            Remove
          </button>
        </div>
      )}

      {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={previews.length >= 4}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#C4B0E0] transition hover:bg-[#4A1E8A] hover:text-white disabled:opacity-40"
          >
            Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoChange}
          />

          <div className="relative" ref={emojiRef}>
            <button
              onClick={() => setShowEmojis(prev => !prev)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#C4B0E0] transition hover:bg-[#4A1E8A] hover:text-white"
            >
              Emoji
            </button>
            {showEmojis && (
              <div className="absolute bottom-12 left-0 z-50 w-72 rounded-2xl border border-white/10 bg-[#2A0F5A] p-3 shadow-2xl">
                <div className="grid grid-cols-10 gap-1">
                  {EMOJI_LIST.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => insertEmoji(emoji)}
                      className="rounded-lg p-1 text-xl leading-none transition hover:bg-[#3A1870]"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowLocation(prev => !prev)}
            className={`rounded-full border px-3 py-2 text-sm transition ${
              showLocation
                ? "border-[#F5A623] bg-[#4A1E8A] text-[#F5A623]"
                : "border-white/10 bg-white/5 text-[#C4B0E0] hover:bg-[#4A1E8A] hover:text-white"
            }`}
          >
            Location
          </button>
        </div>

        <div className="flex items-center gap-3">
          {content.length > 800 && (
            <span className={`text-xs ${content.length >= 1000 ? "text-red-400" : "text-[#C4B0E0]"}`}>
              {content.length}/1000
            </span>
          )}
          <button
            onClick={handleSubmit}
            disabled={isPosting || !content.trim()}
            className="rounded-full bg-[#F5A623] px-6 py-2 text-sm font-bold text-[#1E0A42] transition hover:bg-[#FFD166] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPosting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

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
      const key =
        item.type === "social"
          ? "post_id"
          : item.type === "listing"
            ? "listing_id"
            : "lost_found_id";

      const res = await fetch(`/api/comments?${key}=${item.id}`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isOpen) fetchComments();
    setIsOpen(prev => !prev);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSubmit = async () => {
    if (!newComment.trim() || isPosting) return;
    setIsPosting(true);

    try {
      const key =
        item.type === "social"
          ? "post_id"
          : item.type === "listing"
            ? "listing_id"
            : "lost_found_id";

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newComment.trim(), [key]: item.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments(prev => [...prev, data.comment]);
        setNewComment("");
      }
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <button
        onClick={handleToggle}
        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white transition hover:bg-[#4A1E8A]"
      >
        {isOpen ? "Hide Comments" : "Leave a Comment"}
      </button>

      {isOpen && (
        <div className="mt-4 space-y-3">
          {isLoading ? (
            <p className="py-2 text-center text-sm text-[#C4B0E0]">Loading...</p>
          ) : comments.length === 0 ? (
            <p className="py-2 text-center text-sm text-[#C4B0E0]">No comments yet. Be the first.</p>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="flex gap-2">
                <Avatar user={comment.user} size="sm" />
                <div className="flex-1 rounded-2xl bg-[#2A0F5A] px-3 py-2">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{comment.user.full_name}</span>
                    <span className="text-xs text-[#8B72BE]">{timeAgo(comment.created_at)}</span>
                  </div>
                  <p className="text-sm text-[#E9DFFF]">{comment.content}</p>
                </div>
              </div>
            ))
          )}

          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="Write a comment..."
              className="flex-1 rounded-2xl border border-white/10 bg-[#2A0F5A] px-3 py-2 text-sm text-white outline-none placeholder:text-[#8B72BE] focus:border-[#F5A623]"
            />
            <button
              onClick={handleSubmit}
              disabled={isPosting || !newComment.trim()}
              className="rounded-2xl bg-[#F5A623] px-4 py-2 text-sm font-bold text-[#1E0A42] transition hover:bg-[#FFD166] disabled:opacity-50"
            >
              {isPosting ? "..." : "Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  const displayText = item.content || item.description || "";
  const displayTitle = item.title || "";

  // Listings and lost+found: horizontal card with small thumbnail
  // Social posts: small fixed-height banner image
  const isCardType = item.type === "listing" || item.type === "lost_found";
  const hasThumbnail = isCardType && item.images && item.images.length > 0;

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#351470] shadow-[0_4px_24px_rgba(0,0,0,0.35)] transition hover:-translate-y-1">

      {/* Social posts: small fixed-height banner */}
      {item.type === "social" && item.images && item.images.length > 0 && (
        <div className="h-48 overflow-hidden bg-[#2A0F5A]">
          <img src={item.images[0]} alt="post image" className="h-full w-full object-cover"
            onError={e => { e.currentTarget.parentElement!.style.display = "none"; }} />
        </div>
      )}

      <div className="p-4">
        {hasThumbnail ? (
          /* Listing / lost+found: small thumbnail left, content right */
          <div className="flex gap-3">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#2A0F5A]">
              <img src={item.images[0]} alt={displayTitle} className="h-full w-full object-cover"
                onError={e => { e.currentTarget.parentElement!.style.display = "none"; }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Avatar user={item.user} size="sm" />
                <span className="text-sm font-semibold text-white">{item.user.full_name}</span>
                <span className="text-xs text-[#8B72BE]">{timeAgo(item.created_at)}</span>
                {item.lost_found_type && (
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${item.lost_found_type === "LOST" ? "border border-red-500/30 bg-red-500/15 text-red-300" : "border border-green-500/30 bg-green-500/15 text-green-300"}`}>
                    {item.lost_found_type}
                  </span>
                )}
                {item.category && (
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-[#C4B0E0]">{item.category}</span>
                )}
              </div>
              {displayTitle && (
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-white">{displayTitle}</h3>
                  {item.price !== undefined && (
                    <span className={`text-sm font-bold ${item.price === 0 ? "text-green-400" : "text-[#F5A623]"}`}>
                      {formatPrice(item.price)}
                    </span>
                  )}
                </div>
              )}
              {displayText && displayText !== displayTitle && (
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#C4B0E0]">{displayText}</p>
              )}
              {item.location && <p className="mt-1 text-xs text-[#8B72BE]">📍 {item.location}</p>}
              {item.type === "listing" && (
                <a href={`/product-detail?id=${item.id}`} className="mt-1 inline-block text-xs font-bold text-[#F5A623] hover:text-[#FFD166]">View listing →</a>
              )}
              {item.type === "lost_found" && (
                <a href="/lost-found" className="mt-1 inline-block text-xs font-bold text-[#F5A623] hover:text-[#FFD166]">View on Lost & Found →</a>
              )}
            </div>
          </div>
        ) : (
          /* Social posts / no image: avatar left, content right */
          <div className="flex items-start gap-3">
            <Avatar user={item.user} size="md" />
            <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-white">{item.user.full_name}</span>
              <span className="text-xs text-[#8B72BE]">{timeAgo(item.created_at)}</span>
              {item.lost_found_type && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    item.lost_found_type === "LOST"
                      ? "border border-red-500/30 bg-red-500/15 text-red-300"
                      : "border border-green-500/30 bg-green-500/15 text-green-300"
                  }`}
                >
                  {item.lost_found_type}
                </span>
              )}
              {item.category && (
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-[#C4B0E0]">
                  {item.category}
                </span>
              )}
            </div>

            {displayTitle && (
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-white">{displayTitle}</h3>
                {item.price !== undefined && (
                  <span className={`text-sm font-bold ${item.price === 0 ? "text-green-400" : "text-[#F5A623]"}`}>
                    {formatPrice(item.price)}
                  </span>
                )}
              </div>
            )}

            {displayText && displayText !== displayTitle && (
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#E9DFFF]">{displayText}</p>
            )}

            {item.location && <p className="mt-2 text-xs text-[#C4B0E0]">📍 {item.location}</p>}
            </div>
          </div>
        )}

        <CommentSection item={item} />
      </div>
    </article>
  );
}

function RightPanel({
  currentUser,
  totalItems,
  activeFilters,
  userLoading,
}: {
  currentUser: { id: string; full_name: string; profile_picture?: string };
  totalItems: number;
  activeFilters: string[];
  userLoading: boolean;
}) {
  return (
    <aside className="hidden xl:flex xl:w-[280px] xl:flex-col xl:gap-4">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#351470]">
        <div className="h-20 bg-[linear-gradient(135deg,#5B28A8_0%,#3D1A78_60%,#F5A623_100%)]" />
        <div className="-mt-8 px-5 pb-5">
          <div className="mb-3 flex justify-center">
            <Avatar user={currentUser} size="lg" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-white">{currentUser.full_name || "User"}</h3>
            <p className="mt-1 text-xs text-[#C4B0E0]">LSUS Connect member</p>
          </div>
          <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-xl border border-white/10 text-center">
            <div className="border-r border-white/10 p-3">
              <div className="text-lg font-bold text-[#F5A623]">{totalItems}</div>
              <div className="text-[11px] text-[#C4B0E0]">Feed Items</div>
            </div>
            <div className="p-3">
              <div className="text-lg font-bold text-[#F5A623]">{activeFilters.length}</div>
              <div className="text-[11px] text-[#C4B0E0]">Active Filters</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#351470] p-4">
        <h4 className="mb-3 text-sm font-extrabold uppercase tracking-[0.15em] text-[#F5A623]">Quick Links</h4>
        <div className="space-y-2 text-sm">
          <Link href="/marketplace" className="block rounded-xl px-3 py-2 text-[#C4B0E0] transition hover:bg-white/5 hover:text-white">Marketplace</Link>
          <Link href="/housing" className="block rounded-xl px-3 py-2 text-[#C4B0E0] transition hover:bg-white/5 hover:text-white">Housing</Link>
          <Link href="/lost-found" className="block rounded-xl px-3 py-2 text-[#C4B0E0] transition hover:bg-white/5 hover:text-white">Lost & Found</Link>
          <Link href="/contact-team" className="block rounded-xl px-3 py-2 text-[#C4B0E0] transition hover:bg-white/5 hover:text-white">Contact Team</Link>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#351470] p-4">
        <h4 className="mb-3 text-sm font-extrabold uppercase tracking-[0.15em] text-[#F5A623]">Trending</h4>
        <div className="space-y-3">
          {[
            ["Campus Marketplace", "124 posts"],
            ["Apartment Search", "77 discussions"],
            ["Book Swaps", "54 updates"],
          ].map(([title, meta], index) => (
            <div key={title} className="flex items-center gap-3">
              <div className="min-w-[24px] text-xl font-black text-white/10">{index + 1}</div>
              <div>
                <div className="text-sm font-semibold text-white">{title}</div>
                <div className="text-xs text-[#C4B0E0]">{meta}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default function HomeFeedPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { currentUser, isLoading: userLoading } = useCurrentUser();

  useEffect(() => {
    void fetchFeed();
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
        (data.listings || data.items || []).forEach((listing: any) => {
          const owner = Array.isArray(listing.user) ? listing.user[0] : listing.user;
          if (!owner) return;
          combined.push({
            id: listing.id,
            type: "listing",
            user: owner,
            title: listing.title,
            description: listing.description,
            price: listing.price,
            images: listing.images || [],
            location: listing.location,
            category: listing.category,
            created_at: listing.created_at,
          });
        });
      }

      if (postsRes.ok) {
        const data = await postsRes.json();
        (data.posts || []).forEach((post: any) => {
          const owner = Array.isArray(post.user) ? post.user[0] : post.user;
          if (!owner) return;
          combined.push({
            id: post.id,
            type: "social",
            user: owner,
            content: post.content,
            location: post.location,
            images: post.images || [],
            created_at: post.created_at,
          });
        });
      }

      if (lostFoundRes.ok) {
        const data = await lostFoundRes.json();
        (data.items || []).forEach((lostFound: any) => {
          const owner = Array.isArray(lostFound.user) ? lostFound.user[0] : lostFound.user;
          if (!owner) return;
          combined.push({
            id: lostFound.id,
            type: "lost_found",
            user: owner,
            title: lostFound.title,
            description: lostFound.description,
            images: lostFound.images || [],
            location: lostFound.location,
            category: lostFound.category,
            lost_found_type: lostFound.type,
            created_at: lostFound.created_at,
          });
        });
      }

      combined.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setFeedItems(combined);
    } catch {
      setError("Failed to load feed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter) ? prev.filter(item => item !== filter) : [...prev, filter]
    );
  };

  const filteredItems = useMemo(() => {
    if (activeFilters.length === 0) return feedItems;
    return feedItems.filter(item => {
      if (activeFilters.includes("Lost & Found") && item.type === "lost_found") return true;
      if (activeFilters.includes("Social") && item.type === "social") return true;
      if (item.category && activeFilters.includes(item.category)) return true;
      return false;
    });
  }, [activeFilters, feedItems]);

  const socialCount = feedItems.filter(item => item.type === "social").length;
  const marketplaceCount = feedItems.filter(item => item.type === "listing").length;

  return (
    <div className="min-h-screen bg-[#1E0A42] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#2E1065]/95 backdrop-blur">
        <div className="mx-auto flex h-[60px] max-w-[1600px] items-center gap-4 px-4 lg:px-6">
          <div className="flex min-w-[220px] items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(prev => !prev)}
              className="rounded-lg p-2 transition hover:bg-white/5 lg:hidden"
            >
              ☰
            </button>
            <Link href="/home" className="text-xl font-extrabold tracking-tight">
              <span className="text-white">LSUS</span>
              <span className="text-[#F5A623]"> Connect</span>
            </Link>
          </div>

          <div className="hidden max-w-[480px] flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 md:flex">
            <span className="text-[#C4B0E0]">🔍</span>
            <input
              type="text"
              placeholder="Search LSUS Connect"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#8B72BE]"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <UserDropdown />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        <aside
          className={`fixed left-0 top-[60px] z-40 h-[calc(100vh-60px)] w-[220px] overflow-y-auto border-r border-white/10 bg-[#2E1065] p-4 transition-transform lg:sticky lg:top-[60px] lg:h-[calc(100vh-60px)] lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="space-y-2">
            {LEFT_NAV.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  link.active
                    ? "bg-[linear-gradient(135deg,#5B28A8,#4A1E8A)] text-white"
                    : "text-[#C4B0E0] hover:bg-white/5 hover:text-white"
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="my-4 h-px bg-white/10" />

          <div>
            <p className="mb-3 px-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#8B72BE]">
              Feed Filters
            </p>
            <div className="space-y-2">
              {FILTERS.map(filter => (
                <label key={filter} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#C4B0E0] transition hover:bg-white/5 hover:text-white">
                  <input
                    type="checkbox"
                    checked={activeFilters.includes(filter)}
                    onChange={() => toggleFilter(filter)}
                    className="h-4 w-4 accent-[#F5A623]"
                  />
                  <span>{filter}</span>
                </label>
              ))}
            </div>
            {activeFilters.length > 0 && (
              <button
                onClick={() => setActiveFilters([])}
                className="mt-4 w-full rounded-full bg-[#F5A623] px-4 py-2 text-sm font-bold text-[#1E0A42] transition hover:bg-[#FFD166]"
              >
                Clear Filters
              </button>
            )}
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 lg:ml-0 lg:px-7">
          <section className="mb-6 overflow-hidden rounded-2xl border border-[#F5A623]/20 bg-[linear-gradient(135deg,#4A1E8A_0%,#2A0F5A_60%,#1E0A42_100%)] p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="mb-1 text-sm text-[#C4B0E0]">Welcome back</p>
                <h1 className="text-3xl font-extrabold tracking-tight">{currentUser.full_name || "LSUS User"}</h1>
                <p className="mt-2 text-sm text-[#C4B0E0]">
                  Your campus hub for social posts, listings, housing, and lost and found updates.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="min-w-[130px] rounded-xl border border-white/10 bg-white/10 px-4 py-3">
                  <div className="text-2xl font-extrabold text-white">{feedItems.length}</div>
                  <div className="text-xs text-[#C4B0E0]">Total Feed Items</div>
                </div>
                <div className="min-w-[130px] rounded-xl border border-white/10 bg-white/10 px-4 py-3">
                  <div className="text-2xl font-extrabold text-white">{socialCount}</div>
                  <div className="text-xs text-[#C4B0E0]">Social Posts</div>
                </div>
                <div className="min-w-[130px] rounded-xl border border-white/10 bg-white/10 px-4 py-3">
                  <div className="text-2xl font-extrabold text-white">{marketplaceCount}</div>
                  <div className="text-xs text-[#C4B0E0]">Listings</div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {activeFilters.length > 0 ? `Filtered Feed (${filteredItems.length})` : "Campus Feed"}
                  </h2>
                  <p className="text-sm text-[#C4B0E0]">Fresh activity from the LSUS Connect community</p>
                </div>
                <button onClick={fetchFeed} className="rounded-full border border-[#F5A623] px-4 py-2 text-sm font-bold text-[#F5A623] transition hover:bg-[#F5A623] hover:text-[#1E0A42]">
                  Refresh
                </button>
              </div>

              {!userLoading && <ComposeBox currentUser={currentUser} onPost={item => setFeedItems(prev => [item, ...prev])} />}

              {isLoading && (
                <div className="py-20 text-center">
                  <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#F5A623] border-t-transparent" />
                  <p className="mt-4 text-white">Loading feed...</p>
                </div>
              )}

              {error && !isLoading && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                  {error}
                  <button onClick={fetchFeed} className="ml-3 underline">
                    Retry
                  </button>
                </div>
              )}

              {!isLoading && !error && filteredItems.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-lg text-[#C4B0E0]">
                    {activeFilters.length > 0 ? "No posts match your filters." : "The feed is empty."}
                  </p>
                </div>
              )}

              <div className="mt-6 space-y-6">
                {!isLoading && !error && filteredItems.map(item => <FeedCard key={`${item.type}-${item.id}`} item={item} />)}
              </div>
            </div>

            <RightPanel currentUser={currentUser} totalItems={feedItems.length} activeFilters={activeFilters} userLoading={userLoading} />
          </div>
        </main>
      </div>
    </div>
  );
}
