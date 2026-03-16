"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import UserDropdown from "@/components/UserDropdown";

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
      const next = content.slice(0, s) + emoji + content.slice(e2);
      setContent(next);
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
    <div className="bg-[#3a1364] rounded-xl border border-[#5a2d8c] p-4 mb-5">
      <div className="flex gap-3">
        <Avatar user={currentUser} size="lg" />
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={`What's on your mind, ${currentUser.full_name.split(" ")[0]}?`}
            maxLength={1000}
            rows={2}
            className="w-full bg-[#2a0d44] text-white text-sm px-4 py-3 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FDD023]/30 resize-none border border-[#5a2d8c] focus:border-[#FDD023] transition-colors min-h-[56px]"
          />
        </div>
      </div>

      {/* Image previews */}
      {previews.length > 0 && (
        <div className={`mt-3 ml-13 grid gap-2 ${previews.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {previews.map((src, i) => (
            <div key={i} className="relative aspect-video bg-[#2a0d44] rounded-lg overflow-hidden">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button onClick={() => removePreview(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/70 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xs transition-colors">✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Location input */}
      {showLocation && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-base">📍</span>
          <input type="text" value={location} onChange={e => setLocation(e.target.value)}
            placeholder="Add your location..."
            className="flex-1 bg-[#2a0d44] border border-[#5a2d8c] text-white text-sm px-3 py-2 rounded-lg placeholder-gray-500 focus:outline-none focus:border-[#FDD023]" />
          <button onClick={() => { setShowLocation(false); setLocation(""); }} className="text-gray-500 hover:text-red-400 text-xs transition-colors">Remove</button>
        </div>
      )}

      {error && <p className="mt-2 text-red-400 text-xs">{error}</p>}

      <div className="border-t border-[#5a2d8c] mt-3 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-1">

          {/* Photo */}
          <button onClick={() => fileInputRef.current?.click()} disabled={previews.length >= 4}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#2a0d44] disabled:opacity-40 transition-colors text-sm">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">Photo</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoChange} />

          {/* Emoji */}
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
                      className="text-xl hover:bg-[#3a1364] rounded-lg p-1 transition-colors leading-none">
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Location */}
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
    <div className="bg-[#3a1364] rounded-xl border border-[#5a2d8c] hover:border-[#7a4dac] transition-colors p-4">
      <div className="flex items-start gap-3 mb-3">
        <Avatar user={post.user} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-white font-semibold text-sm">{post.user.full_name}</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs">{timeAgo(post.created_at)}</span>
              {post.user.id === currentUserId && (
                <button onClick={handleDelete} disabled={isDeleting}
                  className="text-gray-500 hover:text-red-400 transition-colors text-xs">
                  {isDeleting ? "..." : "✕"}
                </button>
              )}
            </div>
          </div>
          {post.location && <p className="text-gray-500 text-xs mt-0.5">📍 {post.location}</p>}
          <p className="text-gray-100 text-sm mt-1 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>
      </div>

      {post.images && post.images.length > 0 && (
        <div className={`grid gap-2 mb-3 ${post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {post.images.slice(0, 4).map((img, i) => (
            <div key={i} className="aspect-video bg-[#2a0d44] rounded-lg overflow-hidden">
              <img src={img} alt="" className="w-full h-full object-cover"
                onError={e => { e.currentTarget.parentElement!.style.display = "none"; }} />
            </div>
          ))}
        </div>
      )}

      <CommentSection postId={post.id} />
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function SocialPage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUser, setCurrentUser] = useState<{ id: string; full_name: string; profile_picture?: string }>({ id: "", full_name: "User" });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(decodeURIComponent(atob(base64).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")));
        const id = payload.userId || "";
        const name = payload.name || payload.email?.split("@")[0] || "User";
        setCurrentUserId(id);
        setCurrentUser({ id, full_name: name });
      }
    } catch {}
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
    <div className="min-h-screen bg-[#461D7C]">
      <header className="bg-[#3a1364] border-b border-[#5a2d8c] py-4 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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

      <div className="max-w-[680px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-white font-bold text-2xl">Social Feed</h1>
          <button onClick={fetchPosts} className="text-[#FDD023] text-sm hover:underline">Refresh</button>
        </div>

        {currentUser.id && <ComposeBox currentUser={currentUser} onPost={post => setPosts(prev => [post, ...prev])} />}

        {isLoading && (
          <div className="text-center py-16">
            <div className="inline-block w-12 h-12 border-4 border-[#FDD023] border-t-transparent rounded-full animate-spin" />
            <p className="text-white mt-4">Loading posts...</p>
          </div>
        )}
        {error && !isLoading && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg p-4 mb-4">
            {error} <button onClick={fetchPosts} className="ml-4 underline">Retry</button>
          </div>
        )}
        {!isLoading && !error && posts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-white text-xl font-bold mb-2">No posts yet</h3>
            <p className="text-gray-400">Be the first to share something with the LSUS community!</p>
          </div>
        )}
        <div className="space-y-4">
          {!isLoading && !error && posts.map(post => (
            <PostCard key={post.id} post={post} onDelete={id => setPosts(prev => prev.filter(p => p.id !== id))} currentUserId={currentUserId} />
          ))}
        </div>
      </div>
    </div>
  );
}
