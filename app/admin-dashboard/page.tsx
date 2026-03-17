"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * LSUS Connect - Admin Dashboard (FULLY RESPONSIVE)
 * Mobile: Hamburger sidebar, stacked cards
 * Tablet: Collapsible sidebar, 2-column grid
 * Desktop: Full sidebar, 3-column grid
 */

// Mock data
const stats = {
  activeUsers: 1242,
  newSignups: 86,
  listingsLive: 2984,
  itemsPending: 12,
};

const moderationQueue = [
  {
    id: 1,
    title: "Listing: 'Used Couch' — reported for spam",
    details: "Posted by user_3847 • 2 reported flags",
    action: "Review",
  },
  {
    id: 2,
    title: "Message: 'Suspicious link' — reported",
    details: "Thread in @CS-210 • flag",
    action: "Open",
  },
  {
    id: 3,
    title: "Lost & Found: Wallet — verify ownership",
    details: "Reported by 2 users. 16h ago",
    action: "Review",
  },
];

const recentUsers = [
  { email: "jane.doe@lsus.edu", role: "Student", status: "Verified" },
  { email: "mike49@lsus.edu", role: "Student", status: "Suspended" },
  { email: "sarah.j@lsus.edu", role: "Student", status: "Verified" },
  { email: "mark49@lsus.edu", role: "Student", status: "Suspended" },
  { email: "mike98@lsus.edu", role: "Student", status: "Verified" },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    "Dashboard",
    "Users",
    "Listings",
    "Lost & Found",
    "Reports & Flags",
    "Messages",
    "Analytics",
    "Settings",
  ];

  const handleLogout = () => {
    document.cookie = "token=; path=/; max-age=0";
    localStorage.removeItem("token");
    router.push("/signin");
  };

  return (
    <div className="min-h-screen bg-[#461D7C] flex">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation - Responsive */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-[#2a0d44] border-r border-[#5a2d8c] flex-shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo & Close Button */}
        <div className="p-4 sm:p-6 border-b border-[#5a2d8c] flex items-center justify-between">
          <Link href="/home" className="text-lg sm:text-xl font-bold text-white">
            <span className="text-[#FDD023]">LSUS</span> CONNECT
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-white hover:text-[#FDD023]"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item}>
                <button
                  onClick={() => {
                    setActiveNav(item);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                    activeNav === item
                      ? "bg-[#FDD023] text-black"
                      : "text-white hover:bg-[#461D7C]"
                  }`}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>

          {/* Logout in Sidebar */}
          <div className="mt-6 pt-6 border-t border-[#5a2d8c]">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 rounded-lg text-white hover:bg-[#461D7C] transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Bar - Mobile */}
        <header className="bg-[#3a1364] border-b border-[#5a2d8c] p-4 lg:p-6 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-white hover:text-[#FDD023]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-white text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="hidden lg:block text-white hover:text-[#FDD023] text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Stats Grid - Responsive */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-[#3a1364] rounded-lg p-4 sm:p-6 border border-[#5a2d8c]">
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Active Users</p>
              <p className="text-white text-2xl sm:text-3xl font-bold">{stats.activeUsers.toLocaleString()}</p>
            </div>
            <div className="bg-[#3a1364] rounded-lg p-4 sm:p-6 border border-[#5a2d8c]">
              <p className="text-gray-400 text-xs sm:text-sm mb-1">New Signups</p>
              <p className="text-[#FDD023] text-2xl sm:text-3xl font-bold">{stats.newSignups}</p>
            </div>
            <div className="bg-[#3a1364] rounded-lg p-4 sm:p-6 border border-[#5a2d8c]">
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Listings Live</p>
              <p className="text-white text-2xl sm:text-3xl font-bold">{stats.listingsLive.toLocaleString()}</p>
            </div>
            <div className="bg-[#3a1364] rounded-lg p-4 sm:p-6 border border-[#5a2d8c]">
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Items Pending</p>
              <p className="text-red-400 text-2xl sm:text-3xl font-bold">{stats.itemsPending}</p>
            </div>
          </div>

          {/* Two Column Grid - Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Moderation Queue */}
            <div className="bg-[#3a1364] rounded-lg p-4 sm:p-6 border border-[#5a2d8c]">
              <h2 className="text-white text-lg sm:text-xl font-bold mb-4">Moderation Queue</h2>
              <div className="space-y-3">
                {moderationQueue.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#2a0d44] rounded-lg p-4 border border-[#5a2d8c]"
                  >
                    <h3 className="text-white font-semibold text-sm sm:text-base mb-1">{item.title}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm mb-3">{item.details}</p>
                    <button className="w-full sm:w-auto px-4 py-2 bg-[#FDD023] text-black font-semibold rounded-lg hover:bg-[#FFE34A] transition-colors text-sm min-h-[44px]">
                      {item.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-[#3a1364] rounded-lg p-4 sm:p-6 border border-[#5a2d8c]">
              <h2 className="text-white text-lg sm:text-xl font-bold mb-4">Recent Users</h2>
              <div className="space-y-3">
                {recentUsers.map((user, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-[#2a0d44] rounded-lg border border-[#5a2d8c]"
                  >
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="text-white font-semibold text-sm truncate">{user.email}</p>
                      <p className="text-gray-400 text-xs">{user.role}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        user.status === "Verified"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions - Mobile Optimized */}
          <div className="bg-[#3a1364] rounded-lg p-4 sm:p-6 border border-[#5a2d8c]">
            <h2 className="text-white text-lg sm:text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button className="px-4 py-3 bg-[#FDD023] text-black font-semibold rounded-lg hover:bg-[#FFE34A] transition-colors min-h-[48px]">
                Add User
              </button>
              <button className="px-4 py-3 bg-[#2a0d44] text-white font-semibold rounded-lg border border-[#5a2d8c] hover:border-[#FDD023] transition-colors min-h-[48px]">
                Export Data
              </button>
              <button className="px-4 py-3 bg-[#2a0d44] text-white font-semibold rounded-lg border border-[#5a2d8c] hover:border-[#FDD023] transition-colors min-h-[48px]">
                View Reports
              </button>
              <button className="px-4 py-3 bg-[#2a0d44] text-white font-semibold rounded-lg border border-[#5a2d8c] hover:border-[#FDD023] transition-colors min-h-[48px]">
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
