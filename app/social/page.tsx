"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import UserDropdown from "@/components/UserDropdown";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface SocialPost {
  id: string;
  content: string;
  location?: string;
  images: string[];
  created_at: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    profile_picture?: string;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    profile_picture?: string;
  };
}

const NAV_LINKS = [
  { href: "/home", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/housing", label: "Housing" },
  { href: "/social", label: "Social", active: true },
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

function Avatar({ user, size = "md" }: { user: { full_name: string; profile_picture?: string }; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  return (
    <div className={`${cls} flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#F5A623] bg-gradient-to-br from-[#FFD166] to-[#F5A623]`}>
      {user.profile_picture
        ? <img src={user.profile_picture} alt={user.full_name} className="h-full w-full object-cover" />
        : <span className="text-sm font-bold text-[#1E0A42]">{getInitials(user.full_name)}</span>
      }
    </div>
  );
}

// ── Compose Box ──────────────────────────────────────────────────────────────

function ComposeBox({ currentUser, onPost }: {
  currentUser: { id: string; full_name: string; profile_picture?: string };
  onPost: (post: SocialPost) => void;
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: content.trim(), location: location.trim() || null, images }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to post."); return; }
      const p = data.post;
      const owner = Array.isArray(p.user) ? p.user[0] : p.user;
      onPost({ id: p.id, content: p.content, location: p.location, images: p.images || [], created_at: p.created_at, user: owner || currentUser });
      setContent(""); setLocation(""); setImages([]); setPreviews([]); setShowLocation(false);
    } catch { setError("Something went wrong. Try again."); }
    finally { setIsPosting(false); }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#351470] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.35)] mb-6">
      <div className="mb-4 flex items-start gap-3">
        <Avatar user={currentUser} size="lg" />
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={`What's on your mind, ${currentUser.full_name.split(" ")[0]}?`}
            maxLength={1000}
            rows={2}
            className="min-h-[72px] w-full resize-none rounded-2xl border border-white/10 bg-[#2A0F5A] px-4 py-3 text-sm text-white outline-none transition focus:border-[#F5A623]"
          />
        </div>
      </div>

      {previews.length > 0 && (
        <div className={`mb-4 grid gap-2 ${previews.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {previews.map((src, i) => (
            <div key={i} className="relative aspect-video overflow-hidden rounded-xl bg-[#2A0F5A]">
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button onClick={() => removePreview(i)}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-xs text-white transition hover:bg-red-500">✕</button>
            </div>
          ))}
        </div>
      )}

      {showLocation && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#2A0F5A] p-3">
          <span>📍</span>
          <input type="text" value={location} onChange={e => setLocation(e.target.value)}
            placeholder="Add your location..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#8B72BE]" />
          <button onClick={() => { setShowLocation(false); setLocation(""); }}
            className="text-xs text-[#C4B0E0] transition hover:text-red-400">Remove</button>
        </div>
      )}

      {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => fileInputRef.current?.click()} disabled={previews.length >= 4}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#C4B0E0] transition hover:bg-[#4A1E8A] hover:text-white disabled:opacity-40">
            Photo
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoChange} />

          <div className="relative" ref={emojiRef}>
            <button onClick={() => setShowEmojis(prev => !prev)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#C4B0E0] transition hover:bg-[#4A1E8A] hover:text-white">
              Emoji
            </button>
            {showEmojis && (
              <div className="absolute bottom-12 left-0 z-50 w-72 rounded-2xl border border-white/10 bg-[#2A0F5A] p-3 shadow-2xl">
                <div className="grid grid-cols-10 gap-1">
                  {EMOJI_LIST.map(emoji => (
                    <button key={emoji} onClick={() => insertEmoji(emoji)}
                      className="rounded-lg p-1 text-xl leading-none transition hover:bg-[#3A1870]">{emoji}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={() => setShowLocation(prev => !prev)}
            className={`rounded-full border px-3 py-2 text-sm transition ${showLocation
              ? "border-[#F5A623] bg-[#4A1E8A] text-[#F5A623]"
              : "border-white/10 bg-white/5 text-[#C4B0E0] hover:bg-[#4A1E8A] hover:text-white"}`}>
            Location
          </button>
        </div>

        <div className="flex items-center gap-3">
          {content.length > 800 && (
            <span className={`text-xs ${content.length >= 1000 ? "text-red-400" : "text-[#C4B0E0]"}`}>
              {content.length}/1000
            </span>
          )}
          <button onClick={handleSubmit} disabled={isPosting || !content.trim()}
            className="rounded-full bg-[#F5A623] px-6 py-2 text-sm font-bold text-[#1E0A42] transition hover:bg-[#FFD166] disabled:cursor-not-allowed disabled:opacity-40">
            {isPosting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Comment Section ──────────────────────────────────────────────────────────

function CommentSection({ postId }: { postId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/comments?post_id=${postId}`, { credentials: "include" });
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
      const res = await fetch("/api/comments", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ content: newComment.trim(), post_id: postId }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments(prev => [...prev, data.comment]);
        setNewComment("");
      }
    } finally { setIsPosting(false); }
  };

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <button onClick={handleToggle}
        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white transition hover:bg-[#4A1E8A]">
        {isOpen ? "Hide Comments" : "💬 Leave a Comment"}
      </button>
      {isOpen && (
        <div className="mt-4 space-y-3">
          {isLoading
            ? <p className="py-2 text-center text-sm text-[#C4B0E0]">Loading...</p>
            : comments.length === 0
              ? <p className="py-2 text-center text-sm text-[#C4B0E0]">No comments yet. Be the first!</p>
              : comments.map(comment => (
                <div key={comment.id} className="flex gap-2">
                  <div className="h-8 w-8 flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#F5A623] bg-gradient-to-br from-[#FFD166] to-[#F5A623]">
                    {comment.user.profile_picture
                      ? <img src={comment.user.profile_picture} alt="" className="h-full w-full object-cover" />
                      : <span className="text-xs font-bold text-[#1E0A42]">{getInitials(comment.user.full_name)}</span>
                    }
                  </div>
                  <div className="flex-1 rounded-2xl bg-[#2A0F5A] px-3 py-2">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{comment.user.full_name}</span>
                      <span className="text-xs text-[#8B72BE]">{timeAgo(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-[#E9DFFF]">{comment.content}</p>
                  </div>
                </div>
              ))
          }
          <div className="flex gap-2">
            <input ref={inputRef} type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} placeholder="Write a comment..."
              className="flex-1 rounded-2xl border border-white/10 bg-[#2A0F5A] px-3 py-2 text-sm text-white outline-none placeholder:text-[#8B72BE] focus:border-[#F5A623]" />
            <button onClick={handleSubmit} disabled={isPosting || !newComment.trim()}
              className="rounded-2xl bg-[#F5A623] px-4 py-2 text-sm font-bold text-[#1E0A42] transition hover:bg-[#FFD166] disabled:opacity-50">
              {isPosting ? "..." : "Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Message Author Button ────────────────────────────────────────────────────

function MessageAuthorButton({ authorId, authorName }: { authorId: string; authorName: string }) {
  return (
    <div className="mb-4">
      <Link
        href={`/messages?user=${authorId}&name=${encodeURIComponent(authorName)}`}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#F5A623]/40 bg-[#F5A623]/10 py-2.5 text-sm font-bold text-[#F5A623] transition hover:bg-[#F5A623] hover:text-[#1E0A42]"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Message {authorName.split(" ")[0]}
      </Link>
    </div>
  );
}

// ── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post, onDelete, currentUserId }: { post: SocialPost; onDelete: (id: string) => void; currentUserId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts?id=${post.id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) onDelete(post.id);
    } finally { setIsDeleting(false); }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#351470] shadow-[0_4px_24px_rgba(0,0,0,0.35)] transition hover:-translate-y-1">
      {/* Image */}
      {post.images && post.images.length > 0 && (
        <div className={`overflow-hidden bg-[#2A0F5A] ${post.images.length === 1 ? "h-56" : "grid grid-cols-2 gap-0.5 h-56"}`}>
          {post.images.slice(0, post.images.length === 1 ? 1 : 4).map((img, i) => (
            <img key={i} src={img} alt=""
              className={`w-full h-full ${post.images.length === 1 ? "object-contain" : "object-cover"}`}
              onError={e => { e.currentTarget.parentElement!.style.display = "none"; }} />
          ))}
        </div>
      )}

      <div className="p-4">
        {/* User row */}
        <div className="mb-3 flex items-center gap-3">
          <Avatar user={post.user} size="md" />
          <div className="min-w-0 flex-1">
            <span className="text-sm font-semibold text-white">{post.user.full_name}</span>
            <div className="flex items-center gap-2">
              {post.location && <p className="text-xs text-[#8B72BE]">📍 {post.location}</p>}
              <span className="text-xs text-[#8B72BE]">{timeAgo(post.created_at)}</span>
            </div>
          </div>
          {post.user.id === currentUserId && (
            <button onClick={handleDelete} disabled={isDeleting}
              className="text-xs text-[#8B72BE] transition hover:text-red-400 ml-auto">
              {isDeleting ? "..." : "✕ Delete"}
            </button>
          )}
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed text-[#E9DFFF] whitespace-pre-wrap mb-3">{post.content}</p>

        {/* Message Author */}
        {post.user.id !== currentUserId && (
          <MessageAuthorButton authorId={post.user.id} authorName={post.user.full_name} />
        )}

        <CommentSection postId={post.id} />
      </div>
    </article>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function SocialPage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser } = useCurrentUser();
  const currentUserId = currentUser.id;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true); setError("");
    try {
      const res = await fetch("/api/posts", { credentials: "include" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPosts((data.posts || []).map((p: any) => ({ ...p, user: Array.isArray(p.user) ? p.user[0] : p.user })));
    } catch { setError("Failed to load posts. Please try again."); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#1E0A42] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#2E1065]/95 backdrop-blur">
        <div className="mx-auto flex h-[60px] max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="rounded-lg p-2 transition hover:bg-white/5 lg:hidden">
              {isMobileMenuOpen ? "✕" : "☰"}
            </button>
            <Link href="/home" className="text-xl font-extrabold tracking-tight">
              <span className="text-white">LSUS</span>
              <span className="text-[#F5A623]"> Connect</span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-5">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href}
                className={`text-sm transition ${link.active
                  ? "font-semibold text-[#F5A623] border-b-2 border-[#F5A623] pb-0.5"
                  : "text-[#C4B0E0] hover:text-white"}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          <UserDropdown />
        </div>

        {isMobileMenuOpen && (
          <nav className="lg:hidden border-t border-white/10 bg-[#2E1065] px-4 pb-4 pt-3">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}
                className={`block rounded-xl px-4 py-2.5 text-sm transition ${link.active
                  ? "font-semibold text-[#F5A623]"
                  : "text-[#C4B0E0] hover:bg-white/5 hover:text-white"}`}>
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <div className="mx-auto max-w-[680px] px-4 py-6 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Social Feed</h1>
            <p className="text-sm text-[#C4B0E0]">Share what's on your mind with the LSUS community</p>
          </div>
          <button onClick={fetchPosts}
            className="rounded-full border border-[#F5A623] px-4 py-2 text-sm font-bold text-[#F5A623] transition hover:bg-[#F5A623] hover:text-[#1E0A42]">
            Refresh
          </button>
        </div>

        {currentUser.id && <ComposeBox currentUser={currentUser} onPost={post => setPosts(prev => [post, ...prev])} />}

        {isLoading && (
          <div className="py-20 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#F5A623] border-t-transparent" />
            <p className="mt-4 text-white">Loading posts...</p>
          </div>
        )}
        {error && !isLoading && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error} <button onClick={fetchPosts} className="ml-3 underline">Retry</button>
          </div>
        )}
        {!isLoading && !error && posts.length === 0 && (
          <div className="py-20 text-center">
            <div className="mb-4 text-6xl">💬</div>
            <h3 className="mb-2 text-xl font-bold text-white">No posts yet</h3>
            <p className="text-[#C4B0E0]">Be the first to share something with the LSUS community!</p>
          </div>
        )}

        <div className="space-y-4">
          {!isLoading && !error && posts.map(post => (
            <PostCard key={post.id} post={post}
              onDelete={id => setPosts(prev => prev.filter(p => p.id !== id))}
              currentUserId={currentUserId} />
          ))}
        </div>
      </div>
    </div>
  );
}
