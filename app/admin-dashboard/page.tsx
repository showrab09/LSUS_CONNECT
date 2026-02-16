"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * LSUS Connect - Admin Dashboard
 * Brand Compliant with LSUS Brand Guidelines (January 2026)
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
    details: "Reported by 2 trusters. 16 ago",
    action: "Review",
  },
];

const recentUsers = [
  {
    email: "jane.doe@lsus.edu",
    role: "Student",
    status: "Verified",
  },
  {
    email: "mike49@lsus.edu",
    role: "Student",
    status: "Suspended",
  },
  {
    email: "jane.doe@lsus.edu",
    role: "Student",
    status: "Verified",
  },
  {
    email: "mark49@lsus.edu",
    role: "Student",
    status: "Suspended",
  },
  {
    email: "mike98@lsus.edu",
    role: "Student",
    status: "Suspended",
  },
];

export default function AdminDashboardPage() {
  const [activeNav, setActiveNav] = useState("Dashboard");

  const navItems = [
    "Dashboard",
    "Users",
    "Listings",
    "Lost & Found",
    "Reports & Flags",
    "Messages",
    "Analytics",
    "Roles & Access",
    "System Health",
    "Settings",
    "Export / Backup",
    "Audit Log",
  ];

  return (
    <div className="min-h-screen bg-[#461D7C] flex">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 bg-[#2a0d44] border-r border-[#5a2d8c] flex-shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-[#5a2d8c]">
          <Link href="/" className="text-xl font-bold text-white">
            <span className="text-[#FDD023]">LSUS</span> CONNECT
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item}>
                <button
                  onClick={() => setActiveNav(item)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                    activeNav === item
                      ? "bg-[#FDD023] text-black font-semibold"
                      : "text-gray-300 hover:bg-[#3a1364] hover:text-white"
                  }`}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Header */}
        <header className="bg-[#3a1364] border-b border-[#5a2d8c] px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-white text-2xl font-bold">Admin Dashboard</h1>

            <div className="flex items-center gap-4">
              {/* Global Search */}
              <button className="px-6 py-2 bg-[#FDD023] text-black font-semibold rounded-lg hover:bg-[#FFE34A] transition-colors">
                Global Search
              </button>

              {/* Admin Avatar */}
              <div className="w-10 h-10 rounded-full bg-[#FDD023] flex items-center justify-center">
                <span className="text-black font-bold text-sm">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {/* Active Users */}
            <div className="bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c]">
              <p className="text-gray-400 text-sm mb-1">Active Users (7d)</p>
              <p className="text-white text-4xl font-bold">
                {stats.activeUsers.toLocaleString()}
              </p>
            </div>

            {/* New Signups */}
            <div className="bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c]">
              <p className="text-gray-400 text-sm mb-1">New Signups (7d)</p>
              <p className="text-white text-4xl font-bold">{stats.newSignups}</p>
            </div>

            {/* Listings Live */}
            <div className="bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c]">
              <p className="text-gray-400 text-sm mb-1">Listings Live</p>
              <p className="text-white text-4xl font-bold">
                {stats.listingsLive.toLocaleString()}
              </p>
            </div>

            {/* Items Pending */}
            <div className="bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c]">
              <p className="text-gray-400 text-sm mb-1">Items Pending</p>
              <p className="text-white text-4xl font-bold">{stats.itemsPending}</p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-[1fr,400px] gap-8">
            {/* Left - Moderation Queue */}
            <div>
              <h2 className="text-white text-xl font-bold mb-4">
                Moderation Queue
              </h2>

              <div className="space-y-4">
                {moderationQueue.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#3a1364] rounded-lg p-4 border border-[#5a2d8c] flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 text-sm">{item.details}</p>
                    </div>
                    <button className="px-6 py-2 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors ml-4">
                      {item.action}
                    </button>
                  </div>
                ))}
              </div>

              {/* Traffic & Engagement */}
              <div className="mt-8">
                <h2 className="text-white text-xl font-bold mb-4">
                  Traffic & Engagement
                </h2>
                <div className="bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c] h-64 flex items-center justify-center">
                  <p className="text-gray-400">Chart placeholder</p>
                </div>
              </div>
            </div>

            {/* Right - Users Table */}
            <div>
              <h2 className="text-white text-xl font-bold mb-4">Users</h2>

              <div className="bg-[#3a1364] rounded-lg border border-[#5a2d8c] overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[2fr,1fr,1fr] gap-4 px-4 py-3 bg-[#2a0d44] border-b border-[#5a2d8c]">
                  <span className="text-gray-400 text-sm font-semibold">
                    Email
                  </span>
                  <span className="text-gray-400 text-sm font-semibold">
                    Role
                  </span>
                  <span className="text-gray-400 text-sm font-semibold">
                    Status
                  </span>
                </div>

                {/* Table Rows */}
                {recentUsers.map((user, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[2fr,1fr,1fr] gap-4 px-4 py-3 border-b border-[#5a2d8c] last:border-b-0"
                  >
                    <span className="text-white text-sm truncate">
                      {user.email}
                    </span>
                    <span className="text-gray-300 text-sm">{user.role}</span>
                    <span
                      className={`text-sm font-semibold ${
                        user.status === "Verified"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-[#5a2d8c] flex gap-6 text-sm">
            <Link
              href="/admin/export"
              className="text-gray-400 hover:text-[#FDD023] transition-colors"
            >
              Export CSV
            </Link>
            <span className="text-gray-600">•</span>
            <Link
              href="/admin/reports"
              className="text-gray-400 hover:text-[#FDD023] transition-colors"
            >
              Create Report
            </Link>
            <span className="text-gray-600">•</span>
            <Link
              href="/admin/audit"
              className="text-gray-400 hover:text-[#FDD023] transition-colors"
            >
              View Audit Log
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
