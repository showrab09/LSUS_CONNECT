"use client";

import AppLayout from "@/components/AppLayout";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import EditListingModal from "@/components/EditListingModal";

interface User {
  id: string;
  full_name: string;
  email: string;
  bio: string;
  location: string;
  profile_picture: string;
  created_at: string;
}

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  price_type: string;
  category: string;
  condition: string;
  location: string;
  images: string[];
  tags: string[];
  status: string;
  created_at: string;
}

interface SocialPost {
  id: string;
  content: string;
  location?: string;
  images: string[];
  created_at: string;
}

interface ContentItem {
  id: string;
  type: "listing" | "post";
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  image?: string;
  href?: string;
  raw: Listing | SocialPost;
}

function getInitials(name: string) {
  return name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
}

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getCategoryBadge(category: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    "Books":       { label: "Buy & Sell",    color: "text-[#F5A623] bg-[#F5A623]/10" },
    "Electronics": { label: "Buy & Sell",    color: "text-[#F5A623] bg-[#F5A623]/10" },
    "Clothing":    { label: "Buy & Sell",    color: "text-[#F5A623] bg-[#F5A623]/10" },
    "Housing":     { label: "Housing",       color: "text-blue-400 bg-blue-500/10" },
    "Free":        { label: "Donate",        color: "text-green-400 bg-green-500/10" },
    "Services":    { label: "Services",      color: "text-purple-400 bg-purple-500/10" },
    "Tutoring":    { label: "Query",         color: "text-cyan-400 bg-cyan-500/10" },
    "Other":       { label: "Free/Swap",     color: "text-orange-400 bg-orange-500/10" },
  };
  return map[category] || { label: category || "Listing", color: "text-[#F5A623] bg-[#F5A623]/10" };
}

export default function UserProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [userPosts, setUserPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditListingModalOpen, setIsEditListingModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [editFormData, setEditFormData] = useState({ full_name: "", bio: "", location: "" });
  const [picturePreview, setPicturePreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [profileRes, listingsRes] = await Promise.all([
        fetch("/api/user/profile", { credentials: "include" }),
        fetch("/api/user/listings", { credentials: "include" }),
      ]);
      if (profileRes.ok) {
        const data = await profileRes.json();
        setUser(data.user);
        setEditFormData({ full_name: data.user.full_name || "", bio: data.user.bio || "", location: data.user.location || "" });
        setPicturePreview(data.user.profile_picture || "");
        // Fetch posts with user id
        const postsRes = await fetch(`/api/posts?user_id=${data.user.id}&limit=50`, { credentials: "include" });
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setUserPosts((postsData.posts || []).map((p: any) => ({ id: p.id, content: p.content, location: p.location, images: p.images || [], created_at: p.created_at })));
        }
      }
      if (listingsRes.ok) {
        const data = await listingsRes.json();
        setUserListings(data.listings || []);
      }
    } catch { }
    finally { setIsLoading(false); }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/posts?id=${postId}`, { method: "DELETE", credentials: "include" });
      if (res.ok) setUserPosts(prev => prev.filter(p => p.id !== postId));
      else { const d = await res.json(); setDeleteError(d.error || "Failed to delete post."); }
    } catch { setDeleteError("Failed to delete post."); }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/listings?id=${listingId}`, { method: "DELETE", credentials: "include" });
      if (res.ok) setUserListings(prev => prev.filter(l => l.id !== listingId));
      else { const d = await res.json(); setDeleteError(d.error || "Failed to delete."); }
    } catch { setDeleteError("Failed to delete listing."); }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setSaveError("Image must be under 2MB."); return; }
    const reader = new FileReader();
    reader.onloadend = () => setPicturePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true); setSaveError(""); setSaveSuccess(false);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...editFormData, profile_picture: picturePreview || undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setSaveSuccess(true);
        setIsEditingProfile(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const data = await res.json();
        setSaveError(data.error || "Failed to save.");
      }
    } catch { setSaveError("Something went wrong."); }
    finally { setIsSaving(false); }
  };

  // Build combined content grid
  const contentItems: ContentItem[] = [
    ...userListings.map(l => {
      const badge = getCategoryBadge(l.category);
      return {
        id: l.id,
        type: "listing" as const,
        title: l.title,
        subtitle: l.price_type === "FREE" ? "Free" : l.price_type === "SWAP" ? "Trade/Swap" : `$${l.price?.toFixed(2)} — ${l.description?.slice(0, 60) || ""}`,
        badge: badge.label,
        badgeColor: badge.color,
        image: l.images?.[0],
        href: `/product-detail?id=${l.id}`,
        raw: l,
      };
    }),
    ...userPosts.map(p => ({
      id: p.id,
      type: "post" as const,
      title: p.content?.slice(0, 80) || "",
      subtitle: p.location || timeAgo(p.created_at),
      badge: "Post",
      badgeColor: "text-purple-400 bg-purple-500/10",
      image: p.images?.[0],
      href: "/social",
      raw: p,
    })),
  ].sort((a, b) => new Date((b.raw as any).created_at).getTime() - new Date((a.raw as any).created_at).getTime());

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#F5A623] border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!user) return null;

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

        {/* ── Left: Profile Sidebar ── */}
        <div className="w-full lg:w-[280px] lg:flex-shrink-0 space-y-4">

          {/* Profile Card */}
          <div className="rounded-2xl border border-white/10 bg-[#351470] overflow-hidden">
            {/* Banner */}
            <div className="h-20 bg-[linear-gradient(135deg,#5B28A8_0%,#3D1A78_60%,#F5A623_100%)]" />

            {/* Avatar */}
            <div className="-mt-10 flex justify-center">
              <div className="relative">
                <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-[#351470] bg-gradient-to-br from-[#FFD166] to-[#F5A623]">
                  {picturePreview
                    ? <img src={picturePreview} alt={user.full_name} className="h-full w-full object-cover" />
                    : <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-[#1E0A42]">{getInitials(user.full_name)}</div>
                  }
                </div>
                {isEditingProfile && (
                  <button onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#F5A623] text-[10px] text-[#1E0A42] font-bold border-2 border-[#351470]">
                    ✎
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfilePictureChange} />
              </div>
            </div>

            <div className="px-5 pb-5 pt-3 text-center">
              {isEditingProfile ? (
                <input value={editFormData.full_name} onChange={e => setEditFormData(p => ({ ...p, full_name: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#2A0F5A] px-3 py-2 text-center text-sm text-white outline-none focus:border-[#F5A623] mb-2" />
              ) : (
                <h2 className="text-lg font-bold text-white">{user.full_name}</h2>
              )}
              <p className="text-sm text-[#C4B0E0]">{user.email}</p>
              {user.location && !isEditingProfile && (
                <p className="mt-1 text-xs text-[#8B72BE]">📍 {user.location}</p>
              )}
              <p className="mt-1 text-xs text-[#8B72BE]">
                Member since {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </p>
            </div>

            {/* About section */}
            <div className="mx-4 mb-4 rounded-xl border border-white/10 bg-[#2A0F5A] p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#F5A623]">About</p>
              {isEditingProfile ? (
                <>
                  <textarea value={editFormData.bio} onChange={e => setEditFormData(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Tell others about yourself..."
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-[#1E0A42] px-3 py-2 text-sm text-white outline-none focus:border-[#F5A623] resize-none mb-2 placeholder:text-[#8B72BE]" />
                  <input value={editFormData.location} onChange={e => setEditFormData(p => ({ ...p, location: e.target.value }))}
                    placeholder="Your location..."
                    className="w-full rounded-xl border border-white/10 bg-[#1E0A42] px-3 py-2 text-sm text-white outline-none focus:border-[#F5A623] placeholder:text-[#8B72BE]" />
                </>
              ) : (
                <p className="text-sm text-[#C4B0E0]">{user.bio || "No bio yet."}</p>
              )}
            </div>

            {/* Action buttons */}
            {saveError && <p className="mx-4 mb-2 text-xs text-red-400">{saveError}</p>}
            {saveSuccess && <p className="mx-4 mb-2 text-xs text-green-400">Profile saved!</p>}
            {deleteError && <p className="mx-4 mb-2 text-xs text-red-400">{deleteError}</p>}

            <div className="px-4 pb-5 space-y-2">
              {isEditingProfile ? (
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} disabled={isSaving}
                    className="flex-1 rounded-xl bg-[#F5A623] py-2 text-sm font-bold text-[#1E0A42] hover:bg-[#FFD166] transition disabled:opacity-50">
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => setIsEditingProfile(false)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-sm text-[#C4B0E0] hover:bg-white/10 transition">
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <button onClick={() => setIsEditingProfile(true)}
                    className="w-full rounded-xl bg-[#F5A623] py-2.5 text-sm font-bold text-[#1E0A42] hover:bg-[#FFD166] transition">
                    Edit Profile
                  </button>
                  <Link href="/settings"
                    className="block w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-center text-sm text-[#C4B0E0] hover:bg-white/10 transition">
                    Change Password
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-[#351470] p-3 text-center">
              <p className="text-2xl font-bold text-[#F5A623]">{userListings.length}</p>
              <p className="text-xs text-[#C4B0E0]">Listings</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#351470] p-3 text-center">
              <p className="text-2xl font-bold text-[#F5A623]">{userPosts.length}</p>
              <p className="text-xs text-[#C4B0E0]">Posts</p>
            </div>
          </div>

        </div>

        {/* ── Right: Content Grid ── */}
        <div className="flex-1 min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">My Listings &amp; Posts</h2>
            <span className="text-sm text-[#8B72BE]">{contentItems.length} items</span>
          </div>

          {contentItems.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#351470] p-12 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-white font-semibold mb-2">Nothing here yet</p>
              <p className="text-[#C4B0E0] text-sm mb-6">Post something to the social feed or create a marketplace listing</p>
              <div className="flex gap-3 justify-center">
                <Link href="/social" className="rounded-full bg-[#F5A623] px-5 py-2 text-sm font-bold text-[#1E0A42] hover:bg-[#FFD166] transition">Social Feed</Link>
                <Link href="/post-listing" className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-[#C4B0E0] hover:bg-white/10 transition">Post Listing</Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {contentItems.map(item => (
                <Link key={`${item.type}-${item.id}`} href={item.href || "#"}
                  className="group block overflow-hidden rounded-2xl border border-white/10 bg-[#351470] transition hover:border-[#F5A623]/40 hover:-translate-y-0.5">
                  <div className="flex">
                    {/* Image */}
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden bg-[#2A0F5A]">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl">
                          {item.type === "post" ? "💬" : "📦"}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
                      <div>
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold mb-1 ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                        <p className="text-sm font-semibold text-white line-clamp-1">{item.title}</p>
                        <p className="text-xs text-[#C4B0E0] line-clamp-1 mt-0.5">{item.subtitle}</p>
                      </div>

                      {/* Actions */}
                      <div className="mt-2 flex gap-1.5">
                        {item.type === "listing" ? (
                          <>

                            <button onClick={(e) => { e.preventDefault(); setSelectedListing(item.raw as Listing); setIsEditListingModalOpen(true); }}
                              className="rounded-lg bg-[#F5A623]/10 px-2.5 py-1 text-[11px] text-[#F5A623] hover:bg-[#F5A623]/20 transition">
                              Edit
                            </button>
                            <button onClick={(e) => { e.preventDefault(); handleDeleteListing(item.id); }}
                              className="rounded-lg bg-red-500/10 px-2.5 py-1 text-[11px] text-red-400 hover:bg-red-500/20 transition">
                              Delete
                            </button>
                          </>
                        ) : (
                          <button onClick={(e) => { e.preventDefault(); handleDeletePost(item.id); }}
                            className="rounded-lg bg-red-500/10 px-2.5 py-1 text-[11px] text-red-400 hover:bg-red-500/20 transition">
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Listing Modal */}
      {selectedListing && (
        <EditListingModal
          listing={selectedListing}
          isOpen={isEditListingModalOpen}
          onClose={() => { setIsEditListingModalOpen(false); setSelectedListing(null); }}
          onSuccess={() => { fetchAll(); setIsEditListingModalOpen(false); setSelectedListing(null); }}
        />
      )}
    </AppLayout>
  );
}
