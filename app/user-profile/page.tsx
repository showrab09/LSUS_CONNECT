"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import UserDropdown from "@/components/UserDropdown";
import SaveButton from "@/components/SaveButton";
import EditListingModal from "@/components/EditListingModal";

/**
 * LSUS Connect - User Profile Page (WITH EDIT/DELETE LISTINGS)
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

interface SavedListing {
  id: string;
  created_at: string;
  listing: Listing;
}

export default function UserProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [activeTab, setActiveTab] = useState<"listings" | "saved">("listings");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditListingModalOpen, setIsEditListingModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    bio: "",
    location: "",
  });
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);

  useEffect(() => {
    fetchUserProfile();
    fetchUserListings();
    fetchSavedListings();
    
    // Load profile picture from localStorage
    const storedEdits = localStorage.getItem('userProfileEdits');
    if (storedEdits) {
      const edits = JSON.parse(storedEdits);
      if (edits.profilePicture) {
        setProfilePicture(edits.profilePicture);
      }
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setEditFormData({
          full_name: data.user.full_name || "",
          bio: data.user.bio || "",
          location: data.user.location || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchUserListings = async () => {
    try {
      const response = await fetch('/api/user/listings', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUserListings(data.listings || []);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSavedListings = async () => {
    try {
      const response = await fetch('/api/saved-listings', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSavedListings(data.saved_listings || []);
      }
    } catch (error) {
      console.error("Error fetching saved listings:", error);
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfilePicture(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture("");
    setProfilePictureFile(null);
  };

  const handleSaveProfile = async () => {
    try {
      // Update text fields
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        // Save profile picture to localStorage (temporary until backend ready)
        const edits = JSON.parse(localStorage.getItem('userProfileEdits') || '{}');
        edits.profilePicture = profilePicture;
        localStorage.setItem('userProfileEdits', JSON.stringify(edits));
        
        await fetchUserProfile();
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleEditListing = (listing: Listing) => {
    setSelectedListing(listing);
    setIsEditListingModalOpen(true);
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        // Refresh listings
        await fetchUserListings();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete listing");
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Failed to delete listing");
    }
  };

  const formatPrice = (listing: Listing) => {
    if (listing.price_type === "FREE") return "Free";
    if (listing.price_type === "SWAP") return "Trade/Swap";
    return `$${listing.price.toFixed(2)}`;
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#461D7C] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[#FDD023] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  const displayListings = activeTab === "listings" ? userListings : savedListings.map(s => s.listing);
  const displayProfilePicture = profilePicture || user.profile_picture;

  return (
    <div className="min-h-screen bg-[#461D7C]">
      {/* Header */}
      <header className="bg-[#3a1364] border-b border-[#5a2d8c] sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/marketplace" className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-[#FDD023]">LSUS</span>
              <span>CONNECT</span>
            </Link>
            <div className="flex items-center gap-4">
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Profile Header */}
        <div className="bg-[#3a1364] rounded-lg p-6 sm:p-8 border border-[#5a2d8c] mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Profile Picture */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#FDD023] to-[#FFE34A] flex items-center justify-center border-4 border-[#FDD023] flex-shrink-0">
              {displayProfilePicture ? (
                <img
                  src={displayProfilePicture}
                  alt={user.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-black font-bold text-4xl sm:text-5xl">
                  {getInitials(user.full_name)}
                </span>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-white text-2xl sm:text-3xl font-bold mb-2">
                {user.full_name}
              </h1>
              <p className="text-gray-300 mb-1">{user.email}</p>
              {user.location && (
                <p className="text-gray-400 text-sm mb-3">📍 {user.location}</p>
              )}
              {user.bio && (
                <p className="text-gray-300 text-sm mb-4 max-w-2xl">{user.bio}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Member since {formatDate(user.created_at)}</span>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-6 py-2.5 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[#5a2d8c]">
          <button
            onClick={() => setActiveTab("listings")}
            className={`pb-3 px-4 font-semibold transition-colors ${
              activeTab === "listings"
                ? "text-[#FDD023] border-b-2 border-[#FDD023]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            My Listings ({userListings.length})
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`pb-3 px-4 font-semibold transition-colors ${
              activeTab === "saved"
                ? "text-[#FDD023] border-b-2 border-[#FDD023]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Saved Items ({savedListings.length})
          </button>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-[#FDD023] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white mt-4">Loading...</p>
          </div>
        ) : displayListings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#3a1364] flex items-center justify-center">
              {activeTab === "listings" ? (
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </div>
            <h3 className="text-white text-xl font-bold mb-2">
              {activeTab === "listings" ? "No listings yet" : "No saved items yet"}
            </h3>
            <p className="text-gray-300 mb-6">
              {activeTab === "listings" 
                ? "Start selling by creating your first listing!" 
                : "Save items from the marketplace to view them here!"}
            </p>
            <Link
              href={activeTab === "listings" ? "/post-listing" : "/marketplace"}
              className="inline-block px-8 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
            >
              {activeTab === "listings" ? "Create Listing" : "Browse Marketplace"}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayListings.map((listing) => {
              const isOwnListing = activeTab === "listings";
              return (
                <div key={listing.id} className="bg-[#3a1364] rounded-lg overflow-hidden border border-[#5a2d8c] hover:border-[#FDD023] transition-all">
                  {/* Image */}
                  <Link href={`/product-detail?id=${listing.id}`} className="block">
                    <div className="aspect-square bg-[#2a0d44] relative">
                      {listing.images && listing.images.length > 0 ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          No image
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {listing.condition}
                      </div>
                      {activeTab === "saved" && (
                        <div className="absolute top-2 left-2">
                          <SaveButton listingId={listing.id} size="md" />
                        </div>
                      )}
                      {listing.status !== "ACTIVE" && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {listing.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-4">
                    <Link href={`/product-detail?id=${listing.id}`}>
                      <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 hover:text-[#FDD023]">
                        {listing.title}
                      </h3>
                    </Link>
                    <p className="text-[#FDD023] font-bold text-xl mb-2">
                      {formatPrice(listing)}
                    </p>
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                      {listing.description}
                    </p>
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="text-gray-400">{listing.location}</span>
                      <span className="text-gray-400">{listing.category}</span>
                    </div>

                    {/* Edit/Delete Buttons (only for own listings) */}
                    {isOwnListing && (
                      <div className="flex gap-2 pt-3 border-t border-[#5a2d8c]">
                        <button
                          onClick={() => handleEditListing(listing)}
                          className="flex-1 px-4 py-2 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors text-sm"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteListing(listing.id)}
                          className="flex-1 px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#3a1364] rounded-lg max-w-md w-full p-6 border border-[#5a2d8c] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-2xl font-bold">Edit Profile</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Profile Picture Upload */}
              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  {/* Preview */}
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#FDD023] to-[#FFE34A] flex items-center justify-center border-4 border-[#FDD023] flex-shrink-0">
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt="Preview"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-black font-bold text-4xl">
                        {getInitials(editFormData.full_name || user.full_name)}
                      </span>
                    )}
                  </div>

                  {/* Upload/Remove Buttons */}
                  <div className="flex flex-col gap-2">
                    <label className="px-4 py-2 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors cursor-pointer text-center text-sm">
                      Upload Photo
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                      />
                    </label>
                    {profilePicture && (
                      <button
                        onClick={removeProfilePicture}
                        className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  JPG, PNG, GIF or WebP. Max 5MB.
                </p>
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editFormData.full_name}
                  onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  placeholder="e.g., Shreveport, LA"
                  className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Bio
                </label>
                <textarea
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-6 py-3 bg-[#2a0d44] text-white font-bold rounded-lg hover:bg-[#3a1364] transition-colors border border-[#5a2d8c]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 px-6 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
              >
                Save Changes
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
          onClose={() => {
            setIsEditListingModalOpen(false);
            setSelectedListing(null);
          }}
          onSuccess={() => {
            fetchUserListings();
          }}
        />
      )}
    </div>
  );
}