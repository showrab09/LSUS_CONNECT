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

function Avatar({ user, size = 10 }: { user: SocialPost["user"]; size?: number }) {
  return (
    <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-[#FDD023] to-[#FFE34A] flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-[#FDD023]`}>
      {user.profile_picture ? (
        <img src={user.profile_picture} alt={user.full_name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-black font-bold text-sm">{getInitials(user.full_name)}</span>
      )}
    </div>
  );
}

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
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newComment.trim(), post_id: postId }),
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
    <div className="mt-4 border-t border-[#5a2d8c] pt-3">
      <button
        onClick={handleToggle}
        className="w-full py-3 px-4 bg-[#5a2d8c] hover:bg-[#6a3d9c] text-white font-semibold rounded-lg transition-colors text-sm"
      >
        {isOpen ? "Hide Comments" : "Leave a Comment"}
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3">
          {isLoading ? (
            <p className="text-gray-400 text-sm text-center py-2">Loading...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-2">No comments yet. Be the first!</p>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FDD023] to-[#FFE34A] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {comment.user.profile_picture ? (
                    <img src={comment.user.profile_picture} alt={comment.user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-black font-bold text-xs">{getInitials(comment.user.full_name)}</span>
                  )}
                </div>
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
              className="px-4 py-2 bg-[#FDD023] text-black font-bold text-sm rounded-lg hover:bg-[#FFE34A] disabled:opacity-50 transition-colors"
            >
              {isPosting ? "..." : "Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PostCard({ post, onDelete, currentUserId }: {
  post: SocialPost;
  onDelete: (id: string) => void;
  currentUserId: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const isOwner = post.user.id === currentUserId;

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts?id=${post.id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) onDelete(post.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-[#3a1364] rounded-xl border border-[#5a2d8c] hover:border-[#7a4dac] transition-colors p-5">
      <div className="flex items-start gap-3 mb-3">
        <Avatar user={post.user} size={10} />
        <div className="flex-1 min-w-0">
          <span className="text-white font-semibold text-sm">{post.user.full_name}</span>
          {post.location && <p className="text-gray-500 text-xs mt-0.5">📍 {post.location}</p>}
          <p className="text-gray-200 text-sm mt-1">{post.content}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-gray-500 text-xs">{timeAgo(post.created_at)}</span>
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-gray-500 hover:text-red-400 transition-colors text-xs"
              title="Delete post"
            >
              {isDeleting ? "..." : "✕"}
            </button>
          )}
        </div>
      </div>

      {post.images && post.images.length > 0 && (
        <div className={`grid gap-2 mb-3 ${post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {post.images.slice(0, 2).map((img, i) => (
            <div key={i} className="aspect-video bg-[#2a0d44] rounded-lg overflow-hidden">
              <img src={img} alt={`Image ${i + 1}`} className="w-full h-full object-cover"
                onError={e => { e.currentTarget.parentElement!.style.display = "none"; }} />
            </div>
          ))}
        </div>
      )}

      <CommentSection postId={post.id} />
    </div>
  );
}

function CreatePostModal({ onClose, onPost }: {
  onClose: () => void;
  onPost: (post: SocialPost) => void;
}) {
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) { setError("Please write something."); return; }
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
      if (!res.ok) { setError(data.error || "Failed to post."); return; }
      const p = data.post;
      const owner = Array.isArray(p.user) ? p.user[0] : p.user;
      onPost({ id: p.id, content: p.content, location: p.location, images: p.images || [], created_at: p.created_at, user: owner });
      onClose();
    } catch {
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
          <div className="text-right text-xs text-gray-500">{content.length}/1000</div>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="📍 Add a location (optional)"
            className="w-full bg-[#2a0d44] border border-[#5a2d8c] text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-[#FDD023]"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-3 bg-[#2a0d44] text-white font-semibold rounded-lg border border-[#5a2d8c] hover:bg-[#3a1364] transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPosting || !content.trim()}
            className="flex-1 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] disabled:opacity-50 transition-colors"
          >
            {isPosting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SocialPage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(decodeURIComponent(atob(base64).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")));
        setCurrentUserId(payload.userId || "");
      }
    } catch {}
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/posts", { credentials: "include" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPosts((data.posts || []).map((p: any) => ({
        ...p,
        user: Array.isArray(p.user) ? p.user[0] : p.user,
      })));
    } catch {
      setError("Failed to load posts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#461D7C]">
      {/* Header */}
      <header className="bg-[#3a1364] border-b border-[#5a2d8c] py-4 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-white hover:text-[#FDD023] transition-colors"
              >
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
                <Link key={link.href} href={link.href} className={`text-sm transition-colors ${
                  link.active
                    ? "text-[#FDD023] font-semibold border-b-2 border-[#FDD023] pb-0.5"
                    : "text-white hover:text-[#FDD023]"
                }`}>
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
                  className={`py-2 px-3 rounded transition-colors ${
                    link.active ? "text-[#FDD023]" : "text-white hover:text-[#FDD023] hover:bg-[#461D7C]"
                  }`}>
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white font-bold text-2xl">Social Feed</h1>
            <p className="text-gray-400 text-sm mt-1">Share updates with the LSUS community</p>
          </div>
          <button
            onClick={() => setShowCreatePost(true)}
            className="px-5 py-2.5 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
          >
            + Share a Post
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-[#FDD023] border-t-transparent rounded-full animate-spin" />
            <p className="text-white mt-4">Loading posts...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg p-4 mb-6">
            {error}
            <button onClick={fetchPosts} className="ml-4 underline hover:text-red-200">Retry</button>
          </div>
        )}

        {!isLoading && !error && posts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-white text-xl font-bold mb-2">No posts yet</h3>
            <p className="text-gray-400 mb-6">Be the first to share something with the LSUS community!</p>
            <button
              onClick={() => setShowCreatePost(true)}
              className="px-6 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
            >
              Share a Post
            </button>
          </div>
        )}

        <div className="space-y-4">
          {!isLoading && !error && posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={id => setPosts(prev => prev.filter(p => p.id !== id))}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      </div>

      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onPost={newPost => setPosts(prev => [newPost, ...prev])}
        />
      )}
    </div>
  );
}
