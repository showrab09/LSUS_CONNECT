"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import UserDropdown from "@/components/UserDropdown";

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

const NAV_LINKS = [
  { href: "/home", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/housing", label: "Housing" },
  { href: "/social", label: "Social" },
  { href: "/lost-found", label: "Lost & Found", active: true },
  { href: "/post-listing", label: "Post a Listing" },
];

export default function LostFoundPage() {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<"LOST" | "FOUND">("LOST");

  // Report form state
  const [reportForm, setReportForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    contact_info: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => { fetchLostFoundItems(); }, []);

  const fetchLostFoundItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/lost-found", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch items");
      const data = await response.json();
      setItems(data.items || []);
      setError("");
    } catch {
      setError("Failed to load items. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportSubmit = async () => {
    if (!reportForm.title || !reportForm.description || !reportForm.location) {
      setSubmitError("Title, description, and location are required.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/lost-found", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...reportForm, type: reportType }),
      });
      const data = await res.json();
      if (!res.ok) { setSubmitError(data.error || "Failed to submit."); return; }
      setItems(prev => [data.item, ...prev]);
      setIsReportModalOpen(false);
      setReportForm({ title: "", description: "", category: "", location: "", contact_info: "" });
    } catch {
      setSubmitError("Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || item.type.toLowerCase() === filter;
    return matchesSearch && matchesFilter && item.status === "ACTIVE";
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-[#461D7C]">
      {/* Header */}
      <header className="bg-[#3a1364] border-b border-[#5a2d8c] py-4 sm:py-5 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">

          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
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
              <Link href="/home" className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                <span className="text-[#FDD023]">LSUS</span>
                <span>CONNECT</span>
              </Link>
            </div>

            {/* Desktop Nav */}
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

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <nav className="lg:hidden mb-4 pb-4 border-b border-[#5a2d8c] flex flex-col gap-1">
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

          {/* Search + Report Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search items or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setReportType("LOST"); setIsReportModalOpen(true); }}
                className="flex-1 sm:flex-none min-h-[48px] px-4 sm:px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap"
              >
                Report Lost
              </button>
              <button
                onClick={() => { setReportType("FOUND"); setIsReportModalOpen(true); }}
                className="flex-1 sm:flex-none min-h-[48px] px-4 sm:px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap"
              >
                Report Found
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Filter Tabs */}
        <div className="flex gap-3 sm:gap-4 mb-6 sm:mb-8 overflow-x-auto pb-2">
          {(["all", "lost", "found"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`min-h-[44px] px-6 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                filter === f
                  ? "bg-[#FDD023] text-black"
                  : "bg-[#2a0d44] text-white border border-[#5a2d8c] hover:border-[#FDD023]"
              }`}
            >
              {f === "all" && `All Items (${items.length})`}
              {f === "lost" && `Lost (${items.filter(i => i.type === "LOST").length})`}
              {f === "found" && `Found (${items.filter(i => i.type === "FOUND").length})`}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-[#FDD023] border-t-transparent rounded-full animate-spin" />
            <p className="text-white mt-4">Loading items...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg p-4 mb-6">
            {error}
            <button onClick={fetchLostFoundItems} className="ml-4 underline hover:text-red-200">Retry</button>
          </div>
        )}

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
                  const ownerName = owner?.full_name || "Unknown User";
                  const ownerProfilePic = owner?.profile_picture;
                  const emailSubject = encodeURIComponent(`${item.type}: ${item.title}`);

                  return (
                    <div key={item.id} className="bg-[#3a1364] rounded-lg overflow-hidden border border-[#5a2d8c] hover:border-[#FDD023] transition-colors">
                      <div className="aspect-square bg-[#2a0d44] relative">
                        {item.images && item.images.length > 0 ? (
                          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = "none"; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">No image</div>
                        )}
                        <span className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold ${
                          item.type === "LOST" ? "bg-red-500/90 text-white" : "bg-green-500/90 text-white"
                        }`}>
                          {item.type}
                        </span>
                      </div>

                      <div className="p-4 sm:p-5">
                        <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{item.title}</h3>
                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">{item.description}</p>
                        <div className="text-gray-400 text-xs mb-3 space-y-1">
                          <p>📍 {item.location}</p>
                          <p>🕒 {formatDate(item.created_at)}</p>
                          {item.category && <p>🏷️ {item.category}</p>}
                        </div>

                        <div className="flex items-center gap-2 mb-3 pb-3 border-t border-[#5a2d8c] pt-3">
                          <div className="w-6 h-6 rounded-full bg-[#FDD023] flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {ownerProfilePic ? (
                              <img src={ownerProfilePic} alt={ownerName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-black font-bold text-xs">{getInitials(ownerName)}</span>
                            )}
                          </div>
                          <span className="text-gray-300 text-xs">Posted by {ownerName}</span>
                        </div>

                        <a
                          href={`mailto:${owner?.email || ""}?subject=${emailSubject}`}
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

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#3a1364] rounded-xl border border-[#5a2d8c] w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#5a2d8c]">
              <h2 className="text-white text-xl font-bold">
                Report {reportType === "LOST" ? "Lost" : "Found"} Item
              </h2>
              <button onClick={() => setIsReportModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex gap-2">
                {(["LOST", "FOUND"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setReportType(t)}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${
                      reportType === t
                        ? t === "LOST" ? "bg-red-500 text-white" : "bg-green-500 text-white"
                        : "bg-[#2a0d44] text-gray-300 border border-[#5a2d8c]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Item title *"
                value={reportForm.title}
                onChange={e => setReportForm(p => ({ ...p, title: e.target.value }))}
                className="w-full bg-[#2a0d44] border border-[#5a2d8c] text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-[#FDD023]"
              />

              <textarea
                placeholder="Description *"
                value={reportForm.description}
                onChange={e => setReportForm(p => ({ ...p, description: e.target.value }))}
                rows={3}
                className="w-full bg-[#2a0d44] border border-[#5a2d8c] text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-[#FDD023] resize-none"
              />

              <input
                type="text"
                placeholder="Location where lost/found *"
                value={reportForm.location}
                onChange={e => setReportForm(p => ({ ...p, location: e.target.value }))}
                className="w-full bg-[#2a0d44] border border-[#5a2d8c] text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-[#FDD023]"
              />

              <input
                type="text"
                placeholder="Category (optional)"
                value={reportForm.category}
                onChange={e => setReportForm(p => ({ ...p, category: e.target.value }))}
                className="w-full bg-[#2a0d44] border border-[#5a2d8c] text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-[#FDD023]"
              />

              <input
                type="text"
                placeholder="Contact info (optional)"
                value={reportForm.contact_info}
                onChange={e => setReportForm(p => ({ ...p, contact_info: e.target.value }))}
                className="w-full bg-[#2a0d44] border border-[#5a2d8c] text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-[#FDD023]"
              />

              {submitError && <p className="text-red-400 text-sm">{submitError}</p>}
            </div>

            <div className="flex gap-3 px-5 pb-5">
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="flex-1 py-3 bg-[#2a0d44] text-white font-semibold rounded-lg border border-[#5a2d8c] hover:bg-[#3a1364] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReportSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
