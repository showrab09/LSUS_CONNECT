"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid credentials.");
        return;
      }

      // Store admin token separately from user token
      localStorage.setItem("adminToken", data.token);
      router.push("/admin-dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0520] flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#2E1065_0%,#0D0520_70%)]" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-xl bg-[#F5A623] flex items-center justify-center">
              <span className="text-[#1E0A42] font-black text-lg">A</span>
            </div>
            <div>
              <p className="text-white font-extrabold text-xl leading-none">LSUS Connect</p>
              <p className="text-[#F5A623] text-xs font-semibold tracking-widest uppercase">Admin Portal</p>
            </div>
          </div>
          <p className="text-[#8B72BE] text-sm mt-3">Restricted access. Authorized personnel only.</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-[#1A0A35]/80 backdrop-blur p-8 shadow-2xl">
          <h1 className="text-white text-2xl font-bold mb-6 text-center">Admin Sign In</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#C4B0E0] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@lsus.edu"
                required
                autoComplete="username"
                className="w-full h-12 px-4 rounded-xl border border-white/10 bg-[#2A0F5A] text-white outline-none transition focus:border-[#F5A623] placeholder:text-[#8B72BE]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#C4B0E0] mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full h-12 px-4 rounded-xl border border-white/10 bg-[#2A0F5A] text-white outline-none transition focus:border-[#F5A623] placeholder:text-[#8B72BE]"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full h-12 rounded-xl bg-[#F5A623] font-bold text-[#1E0A42] transition hover:bg-[#FFD166] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1E0A42] border-t-transparent" />
                  Signing in...
                </div>
              ) : "Sign In to Admin Portal"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#8B72BE]">
            Not an admin?{" "}
            <a href="/signin" className="text-[#F5A623] hover:underline">
              Go to regular sign in
            </a>
          </p>
        </div>

        <p className="text-center text-xs text-[#8B72BE]/50 mt-6">
          All admin actions are logged and audited.
        </p>
      </div>
    </div>
  );
}
