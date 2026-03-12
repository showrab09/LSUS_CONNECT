"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import UserDropdown from "@/components/UserDropdown";

/**
 * LSUS Connect - Lost & Found Page (FIXED API INTEGRATION)
 */

interface LostFoundItem {
  id: string;
  title: string;
  description: string;
  type: "LOST" | "FOUND";
  category: string;
  location: string;
  date_lost_found?: string;
  contact_info?: string;
  images: string[];
  created_at: string;
  status: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
    profile_picture?: string;
  };
}

export default function LostFoundPage() {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<"LOST" | "FOUND">("LOST");

  useEffect(() => {
    fetchLostFoundItems();
  }, []);

  const fetchLostFoundItems = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/lost-found', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      setItems(data.items || []);
      setError("");
    } catch (err) {
      console.error("Error fetching lost & found items:", err);
      setError("Failed to load items. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      item.type.toLowerCase() === filter;

    return matchesSearch && matchesFilter && item.status === "ACTIVE";
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#461D7C]">
      {/* Header - Responsive */}
      <header className="bg-[#3a1364] border-b border-[#5a2d8c] py-4 sm:py-6 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          {/* Top Row - Logo & Profile */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
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

              <Link href="/marketplace" className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                <span className="text-[#FDD023]">LSUS</span>
                <span>CONNECT</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6">
              <Link href="/marketplace" className="text-white hover:text-[#FDD023] transition-colors text-sm">
                Marketplace
              </Link>
              <UserDropdown />
            </div>

            {/* Mobile Profile */}
            <div className="lg:hidden">
              <UserDropdown />
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mb-4 pb-4 border-b border-[#5a2d8c]">
              <nav className="flex flex-col gap-3">
                <Link href="/marketplace" className="text-white hover:text-[#FDD023] transition-colors py-2 px-3 rounded hover:bg-[#461D7C]">
                  Marketplace
                </Link>
              </nav>
            </div>
          )}

          {/* Search Bar & Report Buttons - Responsive */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search items or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white text-base placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
              />
            </div>

            {/* Report Buttons - Touch Optimized */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setReportType("LOST");
                  setIsReportModalOpen(true);
                }}
                className="flex-1 sm:flex-none min-h-[48px] px-4 sm:px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap text-center"
              >
                Report Lost
              </button>
              <button
                onClick={() => {
                  setReportType("FOUND");
                  setIsReportModalOpen(true);
                }}
                className="flex-1 sm:flex-none min-h-[48px] px-4 sm:px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap text-center"
              >
                Report Found
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Filter Tabs - Responsive */}
        <div className="flex gap-3 sm:gap-4 mb-6 sm:mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`min-h-[44px] px-6 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              filter === "all"
                ? "bg-[#FDD023] text-black"
                : "bg-[#2a0d44] text-white border border-[#5a2d8c] hover:border-[#FDD023]"
            }`}
          >
            All Items ({items.length})
          </button>
          <button
            onClick={() => setFilter("lost")}
            className={`min-h-[44px] px-6 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              filter === "lost"
                ? "bg-[#FDD023] text-black"
                : "bg-[#2a0d44] text-white border border-[#5a2d8c] hover:border-[#FDD023]"
            }`}
          >
            Lost ({items.filter(i => i.type === "LOST").length})
          </button>
          <button
            onClick={() => setFilter("found")}
            className={`min-h-[44px] px-6 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              filter === "found"
                ? "bg-[#FDD023] text-black"
                : "bg-[#2a0d44] text-white border border-[#5a2d8c] hover:border-[#FDD023]"
            }`}
          >
            Found ({items.filter(i => i.type === "FOUND").length})
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-[#FDD023] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white mt-4">Loading items...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg p-4 mb-6">
            {error}
            <button onClick={fetchLostFoundItems} className="ml-4 underline hover:text-red-200">
              Retry
            </button>
          </div>
        )}

        {/* Items Grid - Responsive */}
        {!isLoading && !error && (
          <>
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#3a1364] flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-white text-xl font-bold mb-2">No items found</h3>
                <p className="text-gray-300 mb-6">
                  {searchQuery ? `No results for "${searchQuery}"` : "No items reported yet"}
                </p>
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-8 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
                >
                  Report an Item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredItems.map((item) => {
                  const owner = Array.isArray(item.user) ? item.user[0] : item.user;
                  const ownerName = owner?.full_name || 'Unknown User';
                  const ownerProfilePic = owner?.profile_picture;
                  const emailSubject = encodeURIComponent(item.type + ': ' + item.title);

                  return (
                    <div
                      key={item.id}
                      className="bg-[#3a1364] rounded-lg overflow-hidden border border-[#5a2d8c] hover:border-[#FDD023] transition-colors"
                    >
                      {/* Image */}
                      <div className="aspect-square bg-[#2a0d44] relative">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-500">Image unavailable</div>';
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            No image
                          </div>
                        )}
                        {/* Type Badge */}
                        <span
                          className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold ${
                            item.type === "LOST"
                              ? "bg-red-500/90 text-white"
                              : "bg-green-500/90 text-white"
                          }`}
                        >
                          {item.type}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-4 sm:p-5">
                        {/* Title */}
                        <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                          {item.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                          {item.description}
                        </p>

                        {/* Location & Date */}
                        <div className="text-gray-400 text-xs mb-3 space-y-1">
                          <p>📍 {item.location}</p>
                          <p>🕒 {formatDate(item.created_at)}</p>
                          {item.category && <p>🏷️ {item.category}</p>}
                        </div>

                        {/* Owner Info */}
                        <div className="flex items-center gap-2 mb-3 pb-3 border-t border-[#5a2d8c] pt-3">
                          <div className="w-6 h-6 rounded-full bg-[#FDD023] flex items-center justify-center flex-shrink-0">
                            {ownerProfilePic ? (
                              <img
                                src={ownerProfilePic}
                                alt={ownerName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-black font-bold text-xs">
                                {getInitials(ownerName)}
                              </span>
                            )}
                          </div>
                          <span className="text-gray-300 text-xs">Posted by {ownerName}</span>
                        </div>

                        {/* Contact Button - Touch Optimized */}
                        <a
                          href={`mailto:${owner?.email || ''}?subject=${emailSubject}`}
                          className="block w-full text-center py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
                        >
                          Contact Owner
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Report Modal Placeholder */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#3a1364] rounded-lg max-w-md w-full p-6">
            <h2 className="text-white text-xl font-bold mb-4">
              Report {reportType === "LOST" ? "Lost" : "Found"} Item
            </h2>
            <p className="text-gray-300 mb-6">
              This feature is coming soon! The backend needs to implement the full report form.
            </p>
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="w-full py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}