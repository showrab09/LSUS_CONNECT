"use client";

import AppLayout from "@/components/AppLayout";

import { useState, useEffect } from "react";
import Link from "next/link";
import UserDropdown from "@/components/UserDropdown";
import SaveButton from "@/components/SaveButton";
import EditListingModal from "@/components/EditListingModal";

/**
 * LSUS Connect - User Profile Page
 */

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

interface SavedListing {
  id: string;
  created_at: string;
  listing: Listing;
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatPrice(listing: Listing) {
  if (listing.price_type === "FREE") return "Free";
  if (listing.price_type === "SWAP") return "Trade/Swap";
  return `$${listing.price.toFixed(2)}`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function UserProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [activeTab, setActiveTab] = useState<"listings" | "posts" | "saved">("listings");
  const [userPosts, setUserPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditListingModalOpen, setIsEditListingModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({ full_name: "", bio: "", location: "" });
  // profile_picture preview (base64 or existing URL)
  const [picturePreview, setPicturePreview] = useState<string>("");

  useEffect(() => {
    fetchUserProfile();
    fetchUserListings();
    fetchSavedListings();
    fetchUserPosts();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/user/profile", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setEditFormData({
          full_name: data.user.full_name || "",
          bio: data.user.bio || "",
          location: data.user.location || "",
        });
        // Seed preview from DB — no localStorage
        setPicturePreview(data.user.profile_picture || "");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const fetchUserListings = async () => {
    try {
      const res = await fetch("/api/user/listings", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUserListings(data.listings || []);
      }
    } catch (err) {
      console.error("Error fetching listings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSavedListings = async () => {
    try {
      const res = await fetch("/api/saved-listings", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSavedListings(data.savedListings || []);
      }
    } catch (err) {
      console.error("Error fetching saved listings:", err);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const profileRes = await fetch("/api/user/profile", { credentials: "include" });
      if (!profileRes.ok) return;
      const profileData = await profileRes.json();
      const userId = profileData.user?.id;
      if (!userId) return;

      const res = await fetch(`/api/posts?user_id=${userId}&limit=50`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUserPosts((data.posts || []).map((p: any) => ({
          id: p.id,
          content: p.content,
          location: p.location,
          images: p.images || [],
          created_at: p.created_at,
        })));
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Max 2MB guard (base64 inflates ~33%)
    if (file.size > 2 * 1024 * 1024) {
      setSaveError("Image must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPicturePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...editFormData,
          location: editFormData.location.replace(/,\s*-/g, ", ").trim(),
          // Only send profile_picture if it changed from what's in the DB
          profile_picture: picturePreview !== (user?.profile_picture || "")
            ? picturePreview
            : undefined,
        }),
      });

      if (res.ok) {
        await fetchUserProfile();
        setSaveSuccess(true);
        setTimeout(() => {
          setIsEditModalOpen(false);
          setSaveSuccess(false);
        }, 800);
      } else {
        const data = await res.json();
        setSaveError(data.error || "Failed to save profile.");
      }
    } catch {
      setSaveError("Something went wrong. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditListing = (listing: Listing) => {
    setSelectedListing(listing);
    setIsEditListingModalOpen(true);
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm("Are you sure you want to delete this listing? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/listings/${listingId}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        await fetchUserListings();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete listing");
      }
    } catch {
      alert("Failed to delete listing");
    }
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-[#F5A623] border-t-transparent" />
          <p className="text-lg text-white">Loading profile...</p>
        </div>
      </AppLayout>
    );
  }

  const displayListings = activeTab === "saved" ? savedListings.map(s => s.listing) : userListings;
  const displayPicture = user.profile_picture;

  return (
    <AppLayout>

      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
        {/* Profile Header Card */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-[#351470] shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
          <div className="h-24 bg-[linear-gradient(135deg,#5B28A8_0%,#3D1A78_60%,#F5A623_100%)]" />
          <div className="-mt-12 px-6 pb-6 sm:px-8 sm:pb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-5">
                {/* Avatar */}
                <div className="h-24 w-24 flex shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-[#1E0A42] bg-gradient-to-br from-[#FFD166] to-[#F5A623] shadow-lg sm:h-28 sm:w-28">
                  {displayPicture ? (
                    <img src={displayPicture} alt={user.full_name} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-[#1E0A42] sm:text-5xl">{getInitials(user.full_name)}</span>
                  )}
                </div>
                <div className="mb-1">
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">{user.full_name}</h1>
                  <p className="text-sm text-[#C4B0E0]">{user.email}</p>
                  {user.location && <p className="mt-0.5 text-sm text-[#C4B0E0]">📍 {user.location.replace(/,\s*-/g, ", ")}</p>}
                  {user.bio && <p className="mt-2 max-w-2xl text-sm text-[#E9DFFF]">{user.bio}</p>}
                  <p className="mt-1 text-xs text-[#8B72BE]">Member since {formatDate(user.created_at)}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="self-end rounded-full bg-[#F5A623] px-6 py-2.5 text-sm font-bold text-[#1E0A42] transition hover:bg-[#FFD166]"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 border-b border-white/10">
          <button onClick={() => setActiveTab("listings")}
            className={`px-5 pb-3 pt-1 text-sm font-semibold transition ${activeTab === "listings" ? "border-b-2 border-[#F5A623] text-[#F5A623]" : "text-[#C4B0E0] hover:text-white"}`}>
            My Listings ({userListings.length})
          </button>
          <button onClick={() => setActiveTab("posts")}
            className={`px-5 pb-3 pt-1 text-sm font-semibold transition ${activeTab === "posts" ? "border-b-2 border-[#F5A623] text-[#F5A623]" : "text-[#C4B0E0] hover:text-white"}`}>
            My Posts ({userPosts.length})
          </button>
          <button onClick={() => setActiveTab("saved")}
            className={`px-5 pb-3 pt-1 text-sm font-semibold transition ${activeTab === "saved" ? "border-b-2 border-[#F5A623] text-[#F5A623]" : "text-[#C4B0E0] hover:text-white"}`}>
            Saved Items ({savedListings.length})
          </button>
        </div>

        {/* Content */}
        {/* Posts Tab */}
        {activeTab === "posts" && (
          userPosts.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#351470] text-4xl">💬</div>
              <h3 className="mb-2 text-xl font-bold text-white">No posts yet</h3>
              <p className="mb-6 text-[#C4B0E0]">Share what&apos;s on your mind with the LSUS community!</p>
              <Link href="/social" className="inline-block rounded-full bg-[#F5A623] px-8 py-3 font-bold text-[#1E0A42] transition hover:bg-[#FFD166]">
                Go to Social Feed
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userPosts.map(post => (
                <div key={post.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#351470] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
                  {post.images && post.images.length > 0 && (
                    <div className="mb-4 h-48 overflow-hidden rounded-xl bg-[#2A0F5A]">
                      <img src={post.images[0]} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <p className="text-sm leading-relaxed text-[#E9DFFF] whitespace-pre-wrap">{post.content}</p>
                  {post.location && <p className="mt-2 text-xs text-[#8B72BE]">📍 {post.location}</p>}
                  <p className="mt-3 text-xs text-[#8B72BE]">{new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
              ))}
            </div>
          )
        )}

        {/* Listings & Saved Tabs */}
        {activeTab !== "posts" && isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#F5A623] border-t-transparent" />
            <p className="mt-4 text-white">Loading...</p>
          </div>
        ) : activeTab !== "posts" && displayListings.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#351470] text-4xl">
              {activeTab === "listings" ? "📦" : "❤️"}
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">
              {activeTab === "listings" ? "No listings yet" : "No saved items yet"}
            </h3>
            <p className="mb-6 text-[#C4B0E0]">
              {activeTab === "listings" ? "Start selling by creating your first listing!" : "Save items from the marketplace to view them here!"}
            </p>
            <Link href={activeTab === "listings" ? "/post-listing" : "/marketplace"}
              className="inline-block rounded-full bg-[#F5A623] px-8 py-3 font-bold text-[#1E0A42] transition hover:bg-[#FFD166]">
              {activeTab === "listings" ? "Create Listing" : "Browse Marketplace"}
            </Link>
          </div>
        ) : activeTab !== "posts" && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayListings.map((listing) => (
              <div key={listing.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#351470] transition hover:-translate-y-1 hover:border-[#F5A623]/40 shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
                <Link href={`/product-detail?id=${listing.id}`} className="block">
                  <div className="relative h-48 bg-[#2A0F5A]">
                    {listing.images && listing.images.length > 0 ? (
                      <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#8B72BE]">No image</div>
                    )}
                    <div className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
                      {listing.condition}
                    </div>
                    {activeTab === "saved" && (
                      <div className="absolute left-2 top-2">
                        <SaveButton listingId={listing.id} size="md" />
                      </div>
                    )}
                    {listing.status !== "ACTIVE" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <span className="text-lg font-bold text-white">{listing.status}</span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <Link href={`/product-detail?id=${listing.id}`}>
                    <h3 className="mb-2 line-clamp-2 text-lg font-bold text-white hover:text-[#F5A623]">{listing.title}</h3>
                  </Link>
                  <p className="mb-2 text-xl font-bold text-[#F5A623]">{formatPrice(listing)}</p>
                  <p className="mb-3 line-clamp-2 text-sm text-[#C4B0E0]">{listing.description}</p>
                  <div className="mb-3 flex items-center justify-between text-xs text-[#8B72BE]">
                    <span>📍 {listing.location}</span>
                    <span>{listing.category}</span>
                  </div>

                  {activeTab === "listings" && (
                    <div className="flex gap-2 border-t border-white/10 pt-3">
                      <button onClick={() => handleEditListing(listing)}
                        className="flex-1 rounded-xl bg-[#F5A623] py-2 text-sm font-bold text-[#1E0A42] transition hover:bg-[#FFD166]">
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDeleteListing(listing.id)}
                        className="flex-1 rounded-xl bg-red-500/80 py-2 text-sm font-bold text-white transition hover:bg-red-500">
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#2E1065] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
              <button onClick={() => { setIsEditModalOpen(false); setSaveError(""); }}
                className="text-[#8B72BE] transition hover:text-white">✕</button>
            </div>

            <div className="space-y-5">
              {/* Profile Picture */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-white">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-[#F5A623] bg-gradient-to-br from-[#FFD166] to-[#F5A623]">
                    {picturePreview ? (
                      <img src={picturePreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-[#1E0A42]">
                        {getInitials(editFormData.full_name || user.full_name)}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="cursor-pointer rounded-full bg-[#F5A623] px-4 py-2 text-center text-sm font-bold text-[#1E0A42] transition hover:bg-[#FFD166]">
                      Upload Photo
                      <input type="file" accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleProfilePictureChange} className="hidden" />
                    </label>
                    {picturePreview && (
                      <button onClick={() => setPicturePreview("")}
                        className="rounded-full bg-red-500/80 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500">
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xs text-[#8B72BE]">JPG, PNG, GIF or WebP. Max 2MB.</p>
              </div>

              {/* Full Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-white">Full Name</label>
                <input type="text" value={editFormData.full_name}
                  onChange={e => setEditFormData({ ...editFormData, full_name: e.target.value })}
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#2A0F5A] px-4 text-white outline-none transition focus:border-[#F5A623]" />
              </div>

              {/* Location */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-white">Location</label>
                <input type="text" value={editFormData.location}
                  onChange={e => setEditFormData({ ...editFormData, location: e.target.value })}
                  placeholder="e.g., Shreveport, LA"
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#2A0F5A] px-4 text-white outline-none transition focus:border-[#F5A623] placeholder:text-[#8B72BE]" />
              </div>

              {/* Bio */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-white">Bio</label>
                <textarea value={editFormData.bio}
                  onChange={e => setEditFormData({ ...editFormData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#2A0F5A] px-4 py-3 text-white outline-none transition focus:border-[#F5A623] placeholder:text-[#8B72BE]" />
              </div>

              {saveError && <p className="text-sm text-red-400">{saveError}</p>}
              {saveSuccess && <p className="text-sm text-green-400">Profile saved!</p>}
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => { setIsEditModalOpen(false); setSaveError(""); }}
                className="flex-1 rounded-full border border-white/10 bg-white/5 py-3 font-bold text-white transition hover:bg-white/10">
                Cancel
              </button>
              <button onClick={handleSaveProfile} disabled={isSaving}
                className="flex-1 rounded-full bg-[#F5A623] py-3 font-bold text-[#1E0A42] transition hover:bg-[#FFD166] disabled:opacity-50">
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Listing Modal */}
      {selectedListing && (
        <EditListingModal
          listing={selectedListing}
          isOpen={isEditListingModalOpen}
          onClose={() => { setIsEditListingModalOpen(false); setSelectedListing(null); }}
          onSuccess={() => { fetchUserListings(); }}
        />
      )}
    </AppLayout>
  );
}
