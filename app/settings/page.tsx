"use client";
import AppLayout from "@/components/AppLayout";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UserDropdown from "@/components/UserDropdown";

/**
 * LSUS Connect - Settings Page
 * Account settings, password change, preferences
 */

interface User {
  id: string;
  full_name: string;
  email: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"account" | "notifications" | "privacy">("account");
  const [isLoading, setIsLoading] = useState(true);

  // Password Change
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Notification Preferences
  const [notificationSettings, setNotificationSettings] = useState({
    email_new_messages: true,
    email_listing_updates: true,
    email_marketing: false,
    push_new_messages: true,
    push_listing_updates: false,
  });

  // Delete Account
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/signin');
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      router.push('/signin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    // Validation
    if (passwordData.new_password.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError("Passwords do not match");
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordSuccess("Password changed successfully!");
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      } else {
        setPasswordError(data.error || "Failed to change password");
      }
    } catch (error) {
      setPasswordError("Failed to change password. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      alert('Please type "DELETE" to confirm');
      return;
    }

    if (!confirm("Are you absolutely sure? This action cannot be undone. All your listings, messages, and data will be permanently deleted.")) {
      return;
    }

    setIsDeletingAccount(true);

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        alert("Your account has been deleted.");
        sessionStorage.clear();
        router.push('/');
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete account");
      }
    } catch (error) {
      alert("Failed to delete account. Please try again.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1E0A42] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white text-lg">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AppLayout>
      <div>
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-white text-3xl font-bold mb-2">Settings</h1>
          <p className="text-[#C4B0E0]">Manage your account settings and preferences</p>
        </div>

        <div className="flex gap-6">
          {/* Left Sidebar - Navigation */}
          <aside className="w-64 flex-shrink-0">
            <div className="rounded-2xl border border-white/10 bg-[#351470] p-4 sticky top-24">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("account")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "account"
                      ? "bg-[#F5A623] text-[#1E0A42] font-bold"
                      : "text-white hover:bg-[#1E0A42]"
                  }`}
                >
                  🔒 Account & Security
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "notifications"
                      ? "bg-[#F5A623] text-[#1E0A42] font-bold"
                      : "text-white hover:bg-[#1E0A42]"
                  }`}
                >
                  🔔 Notifications
                </button>
                <button
                  onClick={() => setActiveTab("privacy")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "privacy"
                      ? "bg-[#F5A623] text-[#1E0A42] font-bold"
                      : "text-white hover:bg-[#1E0A42]"
                  }`}
                >
                  🛡️ Privacy & Data
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Account & Security Tab */}
            {activeTab === "account" && (
              <div className="space-y-6">
                {/* Account Info */}
                <div className="rounded-2xl border border-white/10 bg-[#351470] p-6">
                  <h2 className="text-white text-xl font-bold mb-4">Account Information</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[#8B72BE] text-sm mb-1">Full Name</label>
                      <p className="text-white font-semibold">{user.full_name}</p>
                    </div>
                    <div>
                      <label className="block text-[#8B72BE] text-sm mb-1">Email</label>
                      <p className="text-white font-semibold">{user.email}</p>
                    </div>
                    <div className="pt-3">
                      <Link
                        href="/user-profile"
                        className="text-[#FDD023] hover:text-[#FFE34A] text-sm font-semibold"
                      >
                        Edit Profile →
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Change Password */}
                <div className="rounded-2xl border border-white/10 bg-[#351470] p-6">
                  <h2 className="text-white text-xl font-bold mb-4">Change Password</h2>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-white text-sm font-semibold mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                        required
                        className="w-full h-12 px-4 rounded-lg bg-[#2A0F5A] border border-white/10 text-white outline-none transition focus:border-[#F5A623]"
                      />
                    </div>

                    <div>
                      <label className="block text-white text-sm font-semibold mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        required
                        minLength={8}
                        className="w-full h-12 px-4 rounded-lg bg-[#2A0F5A] border border-white/10 text-white outline-none transition focus:border-[#F5A623]"
                      />
                      <p className="text-[#8B72BE] text-xs mt-1">At least 8 characters</p>
                    </div>

                    <div>
                      <label className="block text-white text-sm font-semibold mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                        required
                        className="w-full h-12 px-4 rounded-lg bg-[#2A0F5A] border border-white/10 text-white outline-none transition focus:border-[#F5A623]"
                      />
                    </div>

                    {passwordError && (
                      <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg p-3 text-sm">
                        {passwordError}
                      </div>
                    )}

                    {passwordSuccess && (
                      <div className="bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg p-3 text-sm">
                        {passwordSuccess}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="px-6 py-3 bg-[#F5A623] text-[#1E0A42] font-bold rounded-lg hover:bg-[#FFE34A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isChangingPassword ? "Changing Password..." : "Change Password"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="rounded-2xl border border-white/10 bg-[#351470] p-6">
                <h2 className="text-white text-xl font-bold mb-4">Notification Preferences</h2>
                <p className="text-[#C4B0E0] text-sm mb-6">
                  Choose how you want to be notified about activity on your account
                </p>

                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div>
                    <h3 className="text-white font-semibold mb-3">Email Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-4 rounded-xl bg-[#2A0F5A] cursor-pointer hover:bg-[#351470] transition-colors">
                        <div>
                          <p className="text-white font-semibold">New Messages</p>
                          <p className="text-[#8B72BE] text-sm">Get notified when someone messages you</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.email_new_messages}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, email_new_messages: e.target.checked })}
                          className="w-5 h-5 rounded accent-[#F5A623]"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 rounded-xl bg-[#2A0F5A] cursor-pointer hover:bg-[#351470] transition-colors">
                        <div>
                          <p className="text-white font-semibold">Listing Updates</p>
                          <p className="text-[#8B72BE] text-sm">Updates about your listings and saved items</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.email_listing_updates}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, email_listing_updates: e.target.checked })}
                          className="w-5 h-5 rounded accent-[#F5A623]"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 rounded-xl bg-[#2A0F5A] cursor-pointer hover:bg-[#351470] transition-colors">
                        <div>
                          <p className="text-white font-semibold">Marketing & Tips</p>
                          <p className="text-[#8B72BE] text-sm">News, updates, and tips from LSUS Connect</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.email_marketing}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, email_marketing: e.target.checked })}
                          className="w-5 h-5 rounded accent-[#F5A623]"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div>
                    <h3 className="text-white font-semibold mb-3">Push Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-4 rounded-xl bg-[#2A0F5A] cursor-pointer hover:bg-[#351470] transition-colors">
                        <div>
                          <p className="text-white font-semibold">New Messages</p>
                          <p className="text-[#8B72BE] text-sm">Real-time alerts for new messages</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.push_new_messages}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, push_new_messages: e.target.checked })}
                          className="w-5 h-5 rounded accent-[#F5A623]"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 rounded-xl bg-[#2A0F5A] cursor-pointer hover:bg-[#351470] transition-colors">
                        <div>
                          <p className="text-white font-semibold">Listing Activity</p>
                          <p className="text-[#8B72BE] text-sm">Updates about your listings</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.push_listing_updates}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, push_listing_updates: e.target.checked })}
                          className="w-5 h-5 rounded accent-[#F5A623]"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      className="px-6 py-3 bg-[#F5A623] text-[#1E0A42] font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
                      onClick={() => alert("Notification preferences saved! (Backend needed)")}
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy & Data Tab */}
            {activeTab === "privacy" && (
              <div className="space-y-6">
                {/* Data Export */}
                <div className="rounded-2xl border border-white/10 bg-[#351470] p-6">
                  <h2 className="text-white text-xl font-bold mb-4">Download Your Data</h2>
                  <p className="text-[#C4B0E0] text-sm mb-4">
                    Request a copy of all your data including listings, messages, and account information.
                  </p>
                  <button
                    className="px-6 py-3 bg-[#F5A623] text-[#1E0A42] font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
                    onClick={() => alert("Data export request submitted! (Backend needed)")}
                  >
                    Request Data Export
                  </button>
                </div>

                {/* Delete Account */}
                <div className="bg-red-500/10 border-2 border-red-500/30 rounded-lg p-6">
                  <h2 className="text-red-400 text-xl font-bold mb-4">⚠️ Danger Zone</h2>
                  <h3 className="text-white font-semibold mb-2">Delete Account</h3>
                  <p className="text-[#C4B0E0] text-sm mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>

                  <div className="mb-4">
                    <label className="block text-white text-sm font-semibold mb-2">
                      Type "DELETE" to confirm:
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="DELETE"
                      className="w-full max-w-xs h-12 px-4 rounded-lg bg-[#2A0F5A] border border-red-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>

                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmation !== "DELETE" || isDeletingAccount}
                    className="px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeletingAccount ? "Deleting Account..." : "Delete My Account"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
      );
}
