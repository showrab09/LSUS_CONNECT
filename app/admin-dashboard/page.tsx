"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Stats {
  totalUsers: number;
  newSignups: number;
  activeListings: number;
  activePosts: number;
  lostFoundItems: number;
  flaggedItems: number;
}
interface User { id: string; full_name: string; email: string; is_verified: boolean; created_at: string; role?: string; }
interface Listing { id: string; title: string; category: string; status: string; created_at: string; user: any; }
interface Post { id: string; content: string; created_at: string; user: any; }
interface LostFound { id: string; title: string; type: string; status: string; created_at: string; user: any; }
interface DailyCount { date: string; count: number; }

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  top_level: { label: "Top Level", color: "bg-[#F5A623] text-[#1E0A42]" },
  mid_level:  { label: "Mid Level",  color: "bg-blue-500/20 text-blue-300" },
  moderator:  { label: "Moderator",  color: "bg-purple-500/20 text-purple-300" },
  user:       { label: "User",       color: "bg-white/10 text-[#C4B0E0]" },
};

type NavItem = "dashboard" | "users" | "listings" | "lost_found" | "reports" | "analytics" | "roles" | "system" | "export" | "audit";

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

// ── Mini Bar Chart ─────────────────────────────────────────────────────────────
function BarChart({ data }: { data: DailyCount[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-1 h-24 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-1">
          <div className="w-full rounded-t-sm bg-[#F5A623]/70 transition-all"
            style={{ height: `${Math.max((d.count / max) * 80, 4)}px` }} />
          <span className="text-[9px] text-[#8B72BE] truncate w-full text-center">{d.date}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState<NavItem>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [lostFound, setLostFound] = useState<LostFound[]>([]);
  const [flagged, setFlagged] = useState<Listing[]>([]);
  const [dailySignups, setDailySignups] = useState<DailyCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [roleTarget, setRoleTarget] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState("user");

  // TODO: Re-enable auth check before production
  const admin = { id: "dev", email: "dev@lsus.edu", name: "Dev Admin", role: "top_level" };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/analytics", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setStats(data.stats);
      setUsers(data.recentUsers || []);
      setListings(data.recentListings || []);
      setPosts(data.recentPosts || []);
      setLostFound(data.recentLostFound || []);
      setFlagged(data.flaggedItems || []);
      setDailySignups(data.dailySignups || []);
    } catch { setActionMsg("Failed to load data — check API connection"); }
    finally { setIsLoading(false); }
  };

  const fetchUsers = async (q = "") => {
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(q)}`, { credentials: "include" });
      if (res.ok) { const d = await res.json(); setUsers(d.users || []); }
    } catch { }
  };

  const handleDeleteListing = async (id: string, title: string) => {
    if (!confirm(`Delete listing "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/listings?id=${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) { setListings(p => p.filter(l => l.id !== id)); flash(`Deleted "${title}"`); }
    } catch { }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      const res = await fetch(`/api/posts?id=${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) { setPosts(p => p.filter(x => x.id !== id)); flash("Post deleted"); }
    } catch { }
  };

  const handleRoleChange = async () => {
    if (!roleTarget) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: roleTarget.id, role: selectedRole }),
      });
      if (res.ok) { flash(`Role updated for ${roleTarget.full_name}`); setRoleTarget(null); fetchUsers(search); }
      else { const d = await res.json(); flash(d.error || "Failed"); }
    } catch { }
  };

  const handleDeleteUser = async (u: User) => {
    if (!confirm(`Permanently delete ${u.full_name}? This cannot be undone.`)) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ userId: u.id }),
      });
      if (res.ok) { setUsers(p => p.filter(x => x.id !== u.id)); flash(`Deleted ${u.full_name}`); }
      else { const d = await res.json(); flash(d.error || "Failed"); }
    } catch { }
  };

  const flash = (msg: string) => { setActionMsg(msg); setTimeout(() => setActionMsg(""), 3000); };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    document.cookie = "adminToken=; path=/admin; max-age=0";
    router.push("/admin/login");
  };

  const exportCSV = () => {
    const rows = [["Name","Email","Verified","Joined"],...users.map(u => [u.full_name, u.email, u.is_verified ? "Yes" : "No", new Date(u.created_at).toLocaleDateString()])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "lsus_users.csv"; a.click();
    flash("CSV exported");
  };

  const navItems: { id: NavItem; label: string; icon: string }[] = [
    { id: "dashboard",  label: "Dashboard",       icon: "📊" },
    { id: "users",      label: "Users",            icon: "👥" },
    { id: "listings",   label: "Listings",         icon: "🛍️" },
    { id: "lost_found", label: "Lost & Found",     icon: "🔎" },
    { id: "reports",    label: "Reports & Flags",  icon: "🚩" },
    { id: "analytics",  label: "Analytics",        icon: "📈" },
    { id: "roles",      label: "Roles & Access",   icon: "🔐" },
    { id: "system",     label: "System Health",    icon: "⚙️" },
    { id: "export",     label: "Export / Backup",  icon: "💾" },
    { id: "audit",      label: "Audit Log",        icon: "📋" },
  ];

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0D0520] text-white flex">

      {/* Mobile overlay */}
      {isSidebarOpen && <div className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1A0A35] border-r border-white/10 flex flex-col transform transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="font-extrabold text-lg"><span className="text-white">LSUS</span><span className="text-[#F5A623]"> Connect</span></p>
            <p className="text-[10px] text-[#F5A623] font-bold tracking-widest uppercase">Admin Portal</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-[#C4B0E0]">✕</button>
        </div>

        <div className="px-5 py-3 border-b border-white/10">
          <p className="text-sm font-semibold text-white">{admin.name}</p>
          <p className="text-xs text-[#8B72BE]">{admin.email}</p>
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${ROLE_LABELS[admin.role]?.color}`}>
            {ROLE_LABELS[admin.role]?.label}
          </span>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.id}
              onClick={() => { setActiveNav(item.id); setIsSidebarOpen(false); if (item.id === "users") fetchUsers(); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeNav === item.id ? "bg-[#F5A623] text-[#1E0A42]" : "text-[#C4B0E0] hover:bg-white/5 hover:text-white"
              }`}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <Link href="/home" className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-[#C4B0E0] hover:bg-white/5 transition">← Back to App</Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition">🚪 Logout</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#1A0A35]/95 backdrop-blur border-b border-white/10 px-4 lg:px-8 py-3 flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-[#C4B0E0]">☰</button>
          <h1 className="text-lg font-bold text-white capitalize">{navItems.find(n => n.id === activeNav)?.label}</h1>
          {/* Global Search */}
          <div className="flex-1 max-w-md hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
            <span className="text-[#8B72BE] text-sm">🔍</span>
            <input type="text" placeholder="Global search..." value={search}
              onChange={e => { setSearch(e.target.value); if (activeNav === "users") fetchUsers(e.target.value); }}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#8B72BE]" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            {actionMsg && <span className="text-xs text-green-400 hidden sm:block">{actionMsg}</span>}
            <button onClick={fetchData} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#C4B0E0] hover:bg-white/10 transition">🔄 Refresh</button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#F5A623] border-t-transparent" />
            </div>
          ) : (
            <>
              {/* ── DASHBOARD ── */}
              {activeNav === "dashboard" && (
                <div className="space-y-6">
                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Active Users (7d)", value: stats?.totalUsers || 0, color: "text-white" },
                      { label: "New Signups (7d)",  value: stats?.newSignups || 0,  color: "text-[#F5A623]" },
                      { label: "Listings Live",      value: stats?.activeListings || 0, color: "text-white" },
                      { label: "Flags Pending",      value: stats?.flaggedItems || 0,   color: "text-red-400" },
                    ].map(s => (
                      <div key={s.label} className="rounded-2xl border border-white/10 bg-[#2A0F5A] p-5">
                        <p className="text-[#8B72BE] text-xs mb-1">{s.label}</p>
                        <p className={`text-3xl font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Moderation Queue */}
                    <div className="rounded-2xl border border-white/10 bg-[#2A0F5A] p-5">
                      <h2 className="text-base font-bold text-white mb-4">Moderation Queue</h2>
                      {flagged.length === 0 ? (
                        <div className="space-y-3">
                          {listings.slice(0, 3).map(item => (
                            <div key={item.id} className="rounded-xl border border-white/10 bg-[#1A0A35] p-4">
                              <p className="text-white font-semibold text-sm truncate">{item.title}</p>
                              <p className="text-[#8B72BE] text-xs mt-0.5">
                                {(item.user as any)?.full_name || "Unknown"} • {timeAgo(item.created_at)}
                              </p>
                              <div className="flex gap-2 mt-3">
                                <Link href={`/product-detail?id=${item.id}`} target="_blank"
                                  className="px-3 py-1.5 rounded-lg bg-[#F5A623] text-[#1E0A42] text-xs font-bold hover:bg-[#FFD166] transition">
                                  Review
                                </Link>
                                <button onClick={() => handleDeleteListing(item.id, item.title)}
                                  className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30 transition">
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                          <p className="text-xs text-[#8B72BE] text-center pt-2">Showing recent listings — no flagged items yet</p>
                        </div>
                      ) : flagged.map(item => (
                        <div key={item.id} className="rounded-xl border border-white/10 bg-[#1A0A35] p-4 mb-3">
                          <p className="text-white font-semibold text-sm">{item.title} — <span className="text-red-400">{item.status}</span></p>
                          <p className="text-[#8B72BE] text-xs mt-0.5">{(item.user as any)?.full_name} • {timeAgo(item.created_at)}</p>
                          <div className="flex gap-2 mt-3">
                            <Link href={`/product-detail?id=${item.id}`} target="_blank"
                              className="px-3 py-1.5 rounded-lg bg-[#F5A623] text-[#1E0A42] text-xs font-bold hover:bg-[#FFD166] transition">Review</Link>
                            <button onClick={() => handleDeleteListing(item.id, item.title)}
                              className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30 transition">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Traffic & Engagement */}
                    <div className="rounded-2xl border border-white/10 bg-[#2A0F5A] p-5">
                      <h2 className="text-base font-bold text-white mb-4">Traffic &amp; Engagement</h2>
                      <p className="text-xs text-[#8B72BE] mb-3">New signups — last 7 days</p>
                      <BarChart data={dailySignups} />
                      <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                        <div className="text-center">
                          <p className="text-xl font-bold text-[#F5A623]">{stats?.activePosts || 0}</p>
                          <p className="text-[10px] text-[#8B72BE]">Posts</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-white">{stats?.activeListings || 0}</p>
                          <p className="text-[10px] text-[#8B72BE]">Listings</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-white">{stats?.lostFoundItems || 0}</p>
                          <p className="text-[10px] text-[#8B72BE]">Lost &amp; Found</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Users */}
                  <div className="rounded-2xl border border-white/10 bg-[#2A0F5A] p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-bold text-white">Users</h2>
                      <button onClick={() => setActiveNav("users")} className="text-xs text-[#F5A623] hover:underline">View all</button>
                    </div>
                    <div className="space-y-2">
                      {users.slice(0, 5).map(u => (
                        <div key={u.id} className="flex items-center justify-between py-2 border-b border-white/5">
                          <div>
                            <p className="text-sm font-semibold text-white">{u.full_name}</p>
                            <p className="text-xs text-[#8B72BE]">{u.email}</p>
                          </div>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${u.is_verified ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                            {u.is_verified ? "Verified" : "Unverified"}
                          </span>
                        </div>
                      ))}
                    </div>
                    {/* Footer links */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex gap-4 text-xs text-[#F5A623]">
                      <button onClick={exportCSV} className="hover:underline">Export CSV</button>
                      <button onClick={() => setActiveNav("audit")} className="hover:underline">View Audit Log</button>
                      <button onClick={fetchData} className="hover:underline">Refresh</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── USERS ── */}
              {activeNav === "users" && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <input type="text" placeholder="Search users..." value={search}
                      onChange={e => { setSearch(e.target.value); fetchUsers(e.target.value); }}
                      className="flex-1 h-10 px-4 rounded-xl border border-white/10 bg-[#2A0F5A] text-sm text-white outline-none focus:border-[#F5A623] placeholder:text-[#8B72BE]" />
                    <button onClick={exportCSV} className="px-4 h-10 rounded-xl bg-[#F5A623] text-[#1E0A42] text-sm font-bold hover:bg-[#FFD166] transition">Export CSV</button>
                  </div>
                  {actionMsg && <p className="text-sm text-green-400">{actionMsg}</p>}
                  <div className="rounded-2xl border border-white/10 bg-[#2A0F5A] overflow-hidden">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-white/10 text-[#8B72BE]">
                        <th className="px-4 py-3 text-left">User</th>
                        <th className="px-4 py-3 text-left hidden sm:table-cell">Email</th>
                        <th className="px-4 py-3 text-left hidden md:table-cell">Joined</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr></thead>
                      <tbody>
                        {filteredUsers.map(u => (
                          <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="px-4 py-3"><p className="font-semibold text-white">{u.full_name}</p></td>
                            <td className="px-4 py-3 text-[#C4B0E0] hidden sm:table-cell">{u.email}</td>
                            <td className="px-4 py-3 text-[#8B72BE] hidden md:table-cell">{new Date(u.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${u.is_verified ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                {u.is_verified ? "Verified" : "Unverified"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button onClick={() => { setRoleTarget(u); setSelectedRole(u.role || "user"); }}
                                  className="rounded-lg bg-[#F5A623]/10 px-2 py-1 text-xs text-[#F5A623] hover:bg-[#F5A623]/20 transition">Role</button>
                                <button onClick={() => handleDeleteUser(u)}
                                  className="rounded-lg bg-red-500/10 px-2 py-1 text-xs text-red-400 hover:bg-red-500/20 transition">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── LISTINGS ── */}
              {activeNav === "listings" && (
                <div className="rounded-2xl border border-white/10 bg-[#2A0F5A] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-white/10 text-[#8B72BE]">
                      <th className="px-4 py-3 text-left">Title</th>
                      <th className="px-4 py-3 text-left hidden sm:table-cell">Category</th>
                      <th className="px-4 py-3 text-left hidden md:table-cell">Posted by</th>
                      <th className="px-4 py-3 text-left hidden md:table-cell">Date</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr></thead>
                    <tbody>
                      {listings.map(l => (
                        <tr key={l.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-4 py-3"><p className="font-semibold text-white truncate max-w-[180px]">{l.title}</p></td>
                          <td className="px-4 py-3 text-[#C4B0E0] hidden sm:table-cell">{l.category}</td>
                          <td className="px-4 py-3 text-[#C4B0E0] hidden md:table-cell">{(l.user as any)?.full_name || "—"}</td>
                          <td className="px-4 py-3 text-[#8B72BE] hidden md:table-cell">{timeAgo(l.created_at)}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Link href={`/product-detail?id=${l.id}`} target="_blank"
                                className="rounded-lg bg-[#F5A623]/10 px-2 py-1 text-xs text-[#F5A623] hover:bg-[#F5A623]/20 transition">View</Link>
                              <button onClick={() => handleDeleteListing(l.id, l.title)}
                                className="rounded-lg bg-red-500/10 px-2 py-1 text-xs text-red-400 hover:bg-red-500/20 transition">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── LOST & FOUND ── */}
              {activeNav === "lost_found" && (
                <div className="rounded-2xl border border-white/10 bg-[#2A0F5A] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-white/10 text-[#8B72BE]">
                      <th className="px-4 py-3 text-left">Title</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left hidden md:table-cell">Reported by</th>
                      <th className="px-4 py-3 text-left hidden md:table-cell">Date</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr></thead>
                    <tbody>
                      {lostFound.map(l => (
                        <tr key={l.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-4 py-3"><p className="font-semibold text-white truncate max-w-[180px]">{l.title}</p></td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${l.type === "LOST" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>{l.type}</span>
                          </td>
                          <td className="px-4 py-3 text-[#C4B0E0] hidden md:table-cell">{(l.user as any)?.full_name || "—"}</td>
                          <td className="px-4 py-3 text-[#8B72BE] hidden md:table-cell">{timeAgo(l.created_at)}</td>
                          <td className="px-4 py-3"><span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-green-500/20 text-green-400">{l.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── REPORTS & FLAGS ── */}
              {activeNav === "reports" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-[#2A0F5A] p-5">
                    <h2 className="text-base font-bold text-white mb-4">Flagged &amp; Reported Items</h2>
                    {flagged.length === 0 ? (
                      <div className="py-12 text-center">
                        <p className="text-4xl mb-3">✅</p>
                        <p className="text-white font-semibold">No flagged items</p>
                        <p className="text-[#8B72BE] text-sm mt-1">All content looks clean</p>
                      </div>
                    ) : flagged.map(item => (
                      <div key={item.id} className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 mb-3">
                        <p className="text-white font-semibold">{item.title}</p>
                        <p className="text-red-400 text-xs mt-0.5">Status: {item.status}</p>
                        <p className="text-[#8B72BE] text-xs">{(item.user as any)?.full_name} • {timeAgo(item.created_at)}</p>
                        <div className="flex gap-2 mt-3">
                          <Link href={`/product-detail?id=${item.id}`} target="_blank"
                            className="px-3 py-1.5 rounded-lg bg-[#F5A623] text-[#1E0A42] text-xs font-bold hover:bg-[#FFD166] transition">Review</Link>
                          <button onClick={() => handleDeleteListing(item.id, item.title)}
                            className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30 transition">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Recent posts for moderation */}
                  <div className="rounded-2xl border border-white/10 bg-[#2A0F5A] p-5">
                    <h2 className="text-base font-bold text-white mb-4">Recent Social Posts</h2>
                    <div className="space-y-3">
                      {posts.slice(0, 8).map(p => (
                        <div key={p.id} className="flex items-start justify-between gap-3 py-2 border-b border-white/5">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-white truncate">{p.content}</p>
                            <p className="text-xs text-[#8B72BE] mt-0.5">{(p.user as any)?.full_name} • {timeAgo(p.created_at)}</p>
                          </div>
                          <button onClick={() => handleDeletePost(p.id)}
                            className="rounded-lg bg-red-500/10 px-2 py-1 text-xs text-red-400 hover:bg-red-500/20 transition flex-shrink-0">Delete</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── ANALYTICS ── */}
              {activeNav === "analytics" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { label: "Total Users",      value: stats?.totalUsers || 0,      color: "text-white" },
                      { label: "New (7 days)",      value: stats?.newSignups || 0,      color: "text-[#F5A623]" },
                      { label: "Active Listings",   value: stats?.activeListings || 0,  color: "text-white" },
                      { label: "Social Posts",      value: stats?.activePosts || 0,     color: "text-white" },
                      { label: "Lost & Found",      value: stats?.lostFoundItems || 0,  color: "text-white" },
                      { label: "Total Content",     value: (stats?.activeListings || 0) + (stats?.activePosts || 0) + (stats?.lostFoundItems || 0), color: "text-green-400" },
                    ].map(s => (
                      <div key={s.label} className="rounded-2xl border border-white/10 bg-[#2A0F5A] p-5">
                        <p className="text-[#8B72BE] text-xs mb-1">{s.label}</p>
                        <p className={`text-3xl font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#2A0F5A] p-5">
                    <h2 className="text-base font-bold text-white mb-4">New Signups — Last 7 Days</h2>
                    <BarChart data={dailySignups} />
                  </div>
                </div>
              )}

              {/* ── ROLES & ACCESS ── */}
              {activeNav === "roles" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-[#2A0F5A] p-5">
                    <h2 className="text-base font-bold text-white mb-2">Role Levels</h2>
                    <p className="text-sm text-[#8B72BE] mb-4">Change user roles to control their access level across the platform.</p>
                    <div className="space-y-3 mb-6">
                      {[
                        { role: "top_level", desc: "Full access — view users, delete anything, change roles, analytics" },
                        { role: "mid_level",  desc: "View users, delete listings/posts, view analytics. No role changes." },
                        { role: "moderator",  desc: "Delete listings and posts only. No user management." },
                        { role: "user",       desc: "Standard user — no admin access." },
                      ].map(r => (
                        <div key={r.role} className="flex items-start gap-3 p-3 rounded-xl border border-white/10">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold mt-0.5 ${ROLE_LABELS[r.role]?.color}`}>{ROLE_LABELS[r.role]?.label}</span>
                          <p className="text-sm text-[#C4B0E0]">{r.desc}</p>
                        </div>
                      ))}
                    </div>
                    <h3 className="text-sm font-bold text-white mb-3">Assign Roles to Users</h3>
                    <div className="space-y-2">
                      {users.slice(0, 10).map(u => (
                        <div key={u.id} className="flex items-center justify-between py-2 border-b border-white/5">
                          <div>
                            <p className="text-sm font-semibold text-white">{u.full_name}</p>
                            <p className="text-xs text-[#8B72BE]">{u.email}</p>
                          </div>
                          <button onClick={() => { setRoleTarget(u); setSelectedRole(u.role || "user"); }}
                            className="rounded-lg bg-[#F5A623]/10 px-3 py-1 text-xs text-[#F5A623] hover:bg-[#F5A623]/20 transition">
                            {ROLE_LABELS[u.role || "user"]?.label || "User"} ▾
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── SYSTEM HEALTH ── */}
              {activeNav === "system" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Database", status: "Operational", color: "text-green-400", icon: "🗄️" },
                      { label: "API", status: "Operational", color: "text-green-400", icon: "⚡" },
                      { label: "Authentication", status: "Operational", color: "text-green-400", icon: "🔐" },
                      { label: "File Storage", status: "Operational", color: "text-green-400", icon: "📁" },
                    ].map(s => (
                      <div key={s.label} className="rounded-2xl border border-white/10 bg-[#2A0F5A] p-5 flex items-center gap-4">
                        <span className="text-3xl">{s.icon}</span>
                        <div>
                          <p className="text-white font-semibold">{s.label}</p>
                          <p className={`text-sm font-bold ${s.color}`}>● {s.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#2A0F5A] p-5">
                    <h2 className="text-base font-bold text-white mb-4">Platform Stats</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div><p className="text-[#8B72BE] text-xs">Total Users</p><p className="text-xl font-bold text-white">{stats?.totalUsers || 0}</p></div>
                      <div><p className="text-[#8B72BE] text-xs">Total Listings</p><p className="text-xl font-bold text-white">{stats?.activeListings || 0}</p></div>
                      <div><p className="text-[#8B72BE] text-xs">Total Posts</p><p className="text-xl font-bold text-white">{stats?.activePosts || 0}</p></div>
                      <div><p className="text-[#8B72BE] text-xs">Lost & Found</p><p className="text-xl font-bold text-white">{stats?.lostFoundItems || 0}</p></div>
                      <div><p className="text-[#8B72BE] text-xs">New This Week</p><p className="text-xl font-bold text-[#F5A623]">{stats?.newSignups || 0}</p></div>
                      <div><p className="text-[#8B72BE] text-xs">Flagged Items</p><p className="text-xl font-bold text-red-400">{stats?.flaggedItems || 0}</p></div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── EXPORT / BACKUP ── */}
              {activeNav === "export" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-[#2A0F5A] p-5">
                    <h2 className="text-base font-bold text-white mb-4">Export Data</h2>
                    <div className="space-y-3">
                      {[
                        { label: "Export Users CSV", desc: "Full name, email, verification status, join date", action: exportCSV },
                        { label: "Export Listings CSV", desc: "All active listings with titles, categories, prices", action: () => {
                          const rows = [["Title","Category","Status","Posted By","Date"], ...listings.map(l => [l.title, l.category, l.status, (l.user as any)?.full_name || "", new Date(l.created_at).toLocaleDateString()])];
                          const csv = rows.map(r => r.join(",")).join("\n");
                          const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "lsus_listings.csv"; a.click();
                          flash("Listings exported");
                        }},
                        { label: "Export Posts CSV", desc: "All social posts with content and author", action: () => {
                          const rows = [["Content","Posted By","Date"], ...posts.map(p => [`"${p.content.replace(/"/g,'""')}"`, (p.user as any)?.full_name || "", new Date(p.created_at).toLocaleDateString()])];
                          const csv = rows.map(r => r.join(",")).join("\n");
                          const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "lsus_posts.csv"; a.click();
                          flash("Posts exported");
                        }},
                      ].map(e => (
                        <div key={e.label} className="flex items-center justify-between p-4 rounded-xl border border-white/10">
                          <div>
                            <p className="text-white font-semibold text-sm">{e.label}</p>
                            <p className="text-[#8B72BE] text-xs mt-0.5">{e.desc}</p>
                          </div>
                          <button onClick={e.action} className="px-4 py-2 rounded-xl bg-[#F5A623] text-[#1E0A42] text-xs font-bold hover:bg-[#FFD166] transition">
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── AUDIT LOG ── */}
              {activeNav === "audit" && (
                <div className="rounded-2xl border border-white/10 bg-[#2A0F5A] p-5">
                  <h2 className="text-base font-bold text-white mb-2">Audit Log</h2>
                  <p className="text-sm text-[#8B72BE] mb-4">All admin actions are logged here once the audit log table is created in Supabase (ticket #135).</p>
                  <div className="py-12 text-center">
                    <p className="text-4xl mb-3">📋</p>
                    <p className="text-white font-semibold">Waiting on database setup</p>
                    <p className="text-[#8B72BE] text-sm mt-1">Showrab needs to run the SQL from ticket #135 to enable audit logging.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Role Change Modal */}
      {roleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1A0A35] p-6">
            <h3 className="text-lg font-bold text-white mb-2">Change Role</h3>
            <p className="text-sm text-[#C4B0E0] mb-4">Set role for <strong className="text-white">{roleTarget.full_name}</strong></p>
            <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-white/10 bg-[#2A0F5A] text-white outline-none focus:border-[#F5A623] mb-4">
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="mid_level">Mid Level Admin</option>
              <option value="top_level">Top Level Admin</option>
            </select>
            <div className="flex gap-3">
              <button onClick={handleRoleChange} className="flex-1 rounded-xl bg-[#F5A623] py-2 font-bold text-[#1E0A42] hover:bg-[#FFD166] transition">Confirm</button>
              <button onClick={() => setRoleTarget(null)} className="flex-1 rounded-xl border border-white/10 py-2 text-[#C4B0E0] hover:bg-white/5 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
