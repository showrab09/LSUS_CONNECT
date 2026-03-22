"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "top_level" | "mid_level" | "moderator";
}

interface Stats {
  totalUsers: number;
  newSignups: number;
  activeListings: number;
  activePosts: number;
  lostFoundItems: number;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_verified: boolean;
  created_at: string;
}

interface Listing {
  id: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
  user: { full_name: string } | null;
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  top_level: { label: "Top Level", color: "bg-[#F5A623] text-[#1E0A42]" },
  mid_level: { label: "Mid Level", color: "bg-blue-500/20 text-blue-300" },
  moderator: { label: "Moderator", color: "bg-purple-500/20 text-purple-300" },
  user:      { label: "User",      color: "bg-white/10 text-[#C4B0E0]" },
};

function getAdminFromToken(): AdminUser | null {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) return null;
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(decodeURIComponent(atob(base64).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")));
    if (!payload.isAdmin) return null;
    return { id: payload.userId, email: payload.email, name: payload.name, role: payload.role };
  } catch { return null; }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, color = "text-white" }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#2A0F5A] p-6">
      <p className="text-[#8B72BE] text-sm mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value.toLocaleString()}</p>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "listings" | "analytics">("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // User management state
  const [userSearch, setUserSearch] = useState("");
  const [roleChangeTarget, setRoleChangeTarget] = useState<{ id: string; name: string } | null>(null);
  const [selectedRole, setSelectedRole] = useState("user");
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    // TODO: Re-enable auth check before production
    // const a = getAdminFromToken();
    // if (!a) { router.push("/admin/login"); return; }
    // setAdmin(a);
    setAdmin({ id: "dev", email: "dev@lsus.edu", name: "Dev Admin", role: "top_level" });
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/analytics", { credentials: "include" });
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      setStats(data.stats);
      setUsers(data.recentUsers || []);
      setListings(data.recentListings || []);
    } catch { setError("Failed to load dashboard data."); }
    finally { setIsLoading(false); }
  };

  const fetchUsers = async (search = "") => {
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch { }
  };

  const handleRoleChange = async () => {
    if (!roleChangeTarget) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: roleChangeTarget.id, role: selectedRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(`Role updated for ${roleChangeTarget.name}`);
        setRoleChangeTarget(null);
        fetchUsers(userSearch);
        setTimeout(() => setActionMessage(""), 3000);
      } else {
        setActionMessage(data.error || "Failed to update role");
      }
    } catch { setActionMessage("Something went wrong"); }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${userName}? This cannot be undone.`)) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(`User ${userName} deleted`);
        fetchUsers(userSearch);
        setTimeout(() => setActionMessage(""), 3000);
      } else {
        setActionMessage(data.error || "Failed to delete user");
      }
    } catch { setActionMessage("Something went wrong"); }
  };

  const handleDeleteListing = async (listingId: string, title: string) => {
    if (!confirm(`Delete listing "${title}"?`)) return;
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setListings(prev => prev.filter(l => l.id !== listingId));
        setActionMessage(`Listing "${title}" deleted`);
        setTimeout(() => setActionMessage(""), 3000);
      }
    } catch { }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    document.cookie = "adminToken=; path=/admin; max-age=0";
    router.push("/admin/login");
  };

  if (!admin) return null;

  const navItems = [
    { id: "overview",  label: "Overview",  icon: "📊" },
    { id: "users",     label: "Users",     icon: "👥", roles: ["top_level", "mid_level"] },
    { id: "listings",  label: "Listings",  icon: "🛍️" },
    { id: "analytics", label: "Analytics", icon: "📈", roles: ["top_level", "mid_level"] },
  ].filter(item => !item.roles || item.roles.includes(admin.role));

  return (
    <div className="min-h-screen bg-[#0D0520] text-white flex">

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1A0A35] border-r border-white/10 flex flex-col transform transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="font-extrabold text-lg">
              <span className="text-white">LSUS</span>
              <span className="text-[#F5A623]"> Connect</span>
            </p>
            <p className="text-xs text-[#F5A623] font-semibold tracking-widest uppercase">Admin Portal</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-[#C4B0E0] hover:text-white">✕</button>
        </div>

        {/* Admin info */}
        <div className="px-6 py-4 border-b border-white/10">
          <p className="text-sm font-semibold text-white truncate">{admin.name}</p>
          <p className="text-xs text-[#8B72BE] truncate">{admin.email}</p>
          <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${ROLE_LABELS[admin.role]?.color}`}>
            {ROLE_LABELS[admin.role]?.label}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); if (item.id === "users") fetchUsers(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === item.id
                  ? "bg-[#F5A623] text-[#1E0A42]"
                  : "text-[#C4B0E0] hover:bg-white/5 hover:text-white"
              }`}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link href="/home" className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-[#C4B0E0] hover:bg-white/5 hover:text-white transition">
            ← Back to App
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#1A0A35]/95 backdrop-blur border-b border-white/10 px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-[#C4B0E0]">☰</button>
            <h1 className="text-xl font-bold text-white capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-3">
            {actionMessage && (
              <span className="text-sm text-green-400 hidden sm:block">{actionMessage}</span>
            )}
            <button onClick={fetchAnalytics} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#C4B0E0] hover:bg-white/10 transition">
              🔄 Refresh
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-8 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#F5A623] border-t-transparent" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">{error}</div>
          ) : (
            <>
              {/* ── Overview ── */}
              {activeTab === "overview" && stats && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard label="Total Users" value={stats.totalUsers} />
                    <StatCard label="New (7 days)" value={stats.newSignups} color="text-[#F5A623]" />
                    <StatCard label="Active Listings" value={stats.activeListings} />
                    <StatCard label="Social Posts" value={stats.activePosts} />
                    <StatCard label="Lost & Found" value={stats.lostFoundItems} />
                  </div>

                  {/* Recent activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-white/10 bg-[#2A0F5A] p-6">
                      <h2 className="text-lg font-bold text-white mb-4">Recent Users</h2>
                      <div className="space-y-3">
                        {users.slice(0, 5).map(user => (
                          <div key={user.id} className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-white truncate">{user.full_name}</p>
                              <p className="text-xs text-[#8B72BE] truncate">{user.email}</p>
                            </div>
                            <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${user.is_verified ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                              {user.is_verified ? "Verified" : "Unverified"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#2A0F5A] p-6">
                      <h2 className="text-lg font-bold text-white mb-4">Recent Listings</h2>
                      <div className="space-y-3">
                        {listings.slice(0, 5).map(listing => (
                          <div key={listing.id} className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-white truncate">{listing.title}</p>
                              <p className="text-xs text-[#8B72BE]">{listing.category}</p>
                            </div>
                            {admin.role !== "moderator" && (
                              <button onClick={() => handleDeleteListing(listing.id, listing.title)}
                                className="ml-2 rounded-lg bg-red-500/10 px-2 py-1 text-xs text-red-400 hover:bg-red-500/20 transition">
                                Delete
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Users ── */}
              {activeTab === "users" && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={userSearch}
                      onChange={e => { setUserSearch(e.target.value); fetchUsers(e.target.value); }}
                      className="flex-1 h-10 px-4 rounded-xl border border-white/10 bg-[#2A0F5A] text-sm text-white outline-none focus:border-[#F5A623] placeholder:text-[#8B72BE]"
                    />
                  </div>

                  {actionMessage && (
                    <p className="text-sm text-green-400">{actionMessage}</p>
                  )}

                  <div className="rounded-2xl border border-white/10 bg-[#2A0F5A] overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-[#8B72BE]">
                          <th className="px-4 py-3 text-left font-semibold">User</th>
                          <th className="px-4 py-3 text-left font-semibold hidden sm:table-cell">Email</th>
                          <th className="px-4 py-3 text-left font-semibold">Role</th>
                          <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Status</th>
                          {admin.role === "top_level" && <th className="px-4 py-3 text-left font-semibold">Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="px-4 py-3">
                              <p className="font-semibold text-white">{user.full_name}</p>
                              <p className="text-xs text-[#8B72BE] sm:hidden truncate">{user.email}</p>
                            </td>
                            <td className="px-4 py-3 text-[#C4B0E0] hidden sm:table-cell truncate max-w-[200px]">{user.email}</td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${ROLE_LABELS[user.role || "user"]?.color}`}>
                                {ROLE_LABELS[user.role || "user"]?.label || user.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${user.is_verified ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                {user.is_verified ? "Verified" : "Unverified"}
                              </span>
                            </td>
                            {admin.role === "top_level" && (
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => { setRoleChangeTarget({ id: user.id, name: user.full_name }); setSelectedRole(user.role || "user"); }}
                                    className="rounded-lg bg-[#F5A623]/10 px-2 py-1 text-xs text-[#F5A623] hover:bg-[#F5A623]/20 transition">
                                    Role
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(user.id, user.full_name)}
                                    className="rounded-lg bg-red-500/10 px-2 py-1 text-xs text-red-400 hover:bg-red-500/20 transition">
                                    Delete
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── Listings ── */}
              {activeTab === "listings" && (
                <div className="rounded-2xl border border-white/10 bg-[#2A0F5A] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-[#8B72BE]">
                        <th className="px-4 py-3 text-left font-semibold">Title</th>
                        <th className="px-4 py-3 text-left font-semibold hidden sm:table-cell">Category</th>
                        <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Posted by</th>
                        <th className="px-4 py-3 text-left font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map(listing => (
                        <tr key={listing.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-white truncate max-w-[200px]">{listing.title}</p>
                          </td>
                          <td className="px-4 py-3 text-[#C4B0E0] hidden sm:table-cell">{listing.category}</td>
                          <td className="px-4 py-3 text-[#C4B0E0] hidden md:table-cell">
                            {(listing.user as any)?.full_name || "Unknown"}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleDeleteListing(listing.id, listing.title)}
                              className="rounded-lg bg-red-500/10 px-3 py-1 text-xs text-red-400 hover:bg-red-500/20 transition">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── Analytics ── */}
              {activeTab === "analytics" && stats && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard label="Total Users" value={stats.totalUsers} />
                    <StatCard label="New Signups (7 days)" value={stats.newSignups} color="text-[#F5A623]" />
                    <StatCard label="Active Listings" value={stats.activeListings} />
                    <StatCard label="Social Posts" value={stats.activePosts} />
                    <StatCard label="Lost & Found Items" value={stats.lostFoundItems} />
                    <StatCard label="Total Content" value={stats.activeListings + stats.activePosts + stats.lostFoundItems} color="text-green-400" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Role Change Modal */}
      {roleChangeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1A0A35] p-6">
            <h3 className="text-lg font-bold text-white mb-2">Change Role</h3>
            <p className="text-sm text-[#C4B0E0] mb-4">Set role for <strong className="text-white">{roleChangeTarget.name}</strong></p>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-white/10 bg-[#2A0F5A] text-white outline-none focus:border-[#F5A623] mb-4"
            >
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="mid_level">Mid Level Admin</option>
              <option value="top_level">Top Level Admin</option>
            </select>
            <div className="flex gap-3">
              <button onClick={handleRoleChange}
                className="flex-1 rounded-xl bg-[#F5A623] py-2 font-bold text-[#1E0A42] hover:bg-[#FFD166] transition">
                Confirm
              </button>
              <button onClick={() => setRoleChangeTarget(null)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-[#C4B0E0] hover:bg-white/10 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
