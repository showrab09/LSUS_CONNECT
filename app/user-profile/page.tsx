"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UserDropdown from "@/components/UserDropdown";

/**
 * LSUS Connect - User Profile Page (READS FROM JWT TOKEN)
 */

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  location: string;
  phone: string;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  price_type: string;
  status: string;
  images: string[];
}

// Decode JWT token
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return null;
  }
}

export default function UserProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile>({
    name: "",
    email: "",
    bio: "",
    location: "",
    phone: "",
  });
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile>({
    name: "",
    email: "",
    bio: "",
    location: "",
    phone: "",
  });

  useEffect(() => {
    loadUserProfile();
    loadUserListings();
  }, []);

  const loadUserProfile = () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (token) {
        // Decode the JWT token
        const decoded = parseJwt(token);
        console.log('Decoded token:', decoded);
        
        // Check if there are any saved profile edits
        const savedProfile = localStorage.getItem('userProfileEdits');
        
        const baseProfile = {
          name: decoded?.name || decoded?.user?.name || "User",
          email: decoded?.email || decoded?.user?.email || "",
          bio: decoded?.bio || "",
          location: decoded?.location || "",
          phone: decoded?.phone || "",
        };

        if (savedProfile) {
          const edits = JSON.parse(savedProfile);
          setUser({ ...baseProfile, ...edits });
        } else {
          setUser(baseProfile);
        }
      } else {
        console.log("No token found in localStorage");
        setUser({
          name: "User",
          email: "",
          bio: "",
          location: "",
          phone: "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserListings = async () => {
    try {
      const response = await fetch('/api/listings', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const allListings = data.listings || [];
        setListings(allListings);
      }
    } catch (error) {
      console.error("Error loading listings:", error);
      setListings([]);
    }
  };

  const handleEditClick = () => {
    setEditForm({ ...user });
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    // Get token to preserve name/email from auth
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = parseJwt(token);
      const updatedUser = {
        name: decoded?.name || decoded?.user?.name || editForm.name,
        email: decoded?.email || decoded?.user?.email || editForm.email,
        bio: editForm.bio,
        location: editForm.location,
        phone: editForm.phone,
      };
      
      setUser(updatedUser);
      
      // Save only the editable parts
      localStorage.setItem('userProfileEdits', JSON.stringify({
        bio: editForm.bio,
        location: editForm.location,
        phone: editForm.phone,
      }));
    }
    
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({ ...user });
  };

  const getInitials = () => {
    if (!user.name) return "?";
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const activeListings = listings.filter(l => l.status === "ACTIVE");
  const soldListings = listings.filter(l => l.status === "SOLD");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#461D7C] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[#FDD023] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

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
              <Link href="/marketplace" className="text-white hover:text-[#FDD023] transition-colors text-sm">
                Marketplace
              </Link>
              <Link href="/post-listing" className="text-white hover:text-[#FDD023] transition-colors text-sm">
                Post Listing
              </Link>
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#3a1364] rounded-lg p-6 max-w-md w-full border border-[#5a2d8c]">
            <h2 className="text-white text-2xl font-bold mb-6">Edit Profile</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2 text-sm">Name (from account)</label>
                <div className="w-full h-10 px-4 rounded-lg bg-[#1a0d24] border border-[#5a2d8c] text-gray-400 flex items-center">
                  {user.name}
                </div>
                <p className="text-xs text-gray-500 mt-1">Contact support to change</p>
              </div>

              <div>
                <label className="block text-gray-400 mb-2 text-sm">Email (from account)</label>
                <div className="w-full h-10 px-4 rounded-lg bg-[#1a0d24] border border-[#5a2d8c] text-gray-400 flex items-center">
                  {user.email}
                </div>
                <p className="text-xs text-gray-500 mt-1">Contact support to change</p>
              </div>

              <div>
                <label className="block text-[#FDD023] font-semibold mb-2 text-sm">Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="e.g., Shreveport, LA"
                  className="w-full h-10 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023]"
                />
              </div>

              <div>
                <label className="block text-[#FDD023] font-semibold mb-2 text-sm">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="(318) 555-1234"
                  className="w-full h-10 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023]"
                />
              </div>

              <div>
                <label className="block text-[#FDD023] font-semibold mb-2 text-sm">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="flex-1 h-11 bg-[#2a0d44] text-white font-semibold rounded-lg border border-[#5a2d8c] hover:border-[#FDD023] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 h-11 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {/* Profile Header */}
        <div className="bg-[#3a1364] rounded-lg p-6 sm:p-8 border border-[#5a2d8c] mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#FDD023] flex items-center justify-center text-black text-4xl sm:text-5xl font-bold">
              {getInitials()}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-white text-2xl sm:text-3xl font-bold mb-2">{user.name}</h1>
              <p className="text-gray-300 mb-4">{user.email}</p>
              
              {user.bio && (
                <p className="text-gray-300 mb-4">{user.bio}</p>
              )}

              {user.location && (
                <p className="text-gray-400 text-sm mb-4">📍 {user.location}</p>
              )}

              <div className="flex flex-wrap gap-6 justify-center sm:justify-start mb-4">
                <div>
                  <div className="text-[#FDD023] text-2xl font-bold">{activeListings.length}</div>
                  <div className="text-gray-300 text-sm">Active Listings</div>
                </div>
                <div>
                  <div className="text-[#FDD023] text-2xl font-bold">{soldListings.length}</div>
                  <div className="text-gray-300 text-sm">Sold</div>
                </div>
                <div>
                  <div className="text-[#FDD023] text-2xl font-bold">4.8</div>
                  <div className="text-gray-300 text-sm">Rating</div>
                </div>
              </div>

              <button
                onClick={handleEditClick}
                className="px-8 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button className="px-6 py-3 bg-[#FDD023] text-black font-bold rounded-lg">
            My Listings
          </button>
          <button className="px-6 py-3 bg-[#2a0d44] text-white font-semibold rounded-lg border border-[#5a2d8c] hover:border-[#FDD023] transition-colors">
            Saved Items
          </button>
        </div>

        {/* Listings Grid */}
        {activeListings.length === 0 ? (
          <div className="text-center py-16 bg-[#3a1364] rounded-lg border border-[#5a2d8c]">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#2a0d44] flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-white text-xl font-bold mb-2">No listings yet</h3>
            <p className="text-gray-300 mb-6">Create your first listing to get started!</p>
            <Link
              href="/post-listing"
              className="inline-block px-8 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
            >
              Create Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-[#3a1364] rounded-lg overflow-hidden border border-[#5a2d8c]"
              >
                <div className="aspect-square bg-[#2a0d44]">
                  {listing.images && listing.images.length > 0 ? (
                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">No image</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-white font-bold mb-2 line-clamp-2">{listing.title}</h3>
                  <p className="text-[#FDD023] font-bold text-xl mb-3">
                    {listing.price_type === "FREE" ? "Free" : listing.price_type === "SWAP" ? "Trade/Swap" : `$${listing.price.toFixed(2)}`}
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-[#2a0d44] text-white text-sm font-semibold rounded border border-[#5a2d8c] hover:border-[#FDD023] transition-colors">
                      Edit
                    </button>
                    <button className="flex-1 py-2 bg-red-500/20 text-red-300 text-sm font-semibold rounded border border-red-500/30 hover:bg-red-500/30 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
