"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserDropdown from "@/components/UserDropdown";
import { useCurrentUser } from "@/hooks/useCurrentUser";

function getInitials(name: string) {
  return name?.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2) || "U";
}

function Avatar({ user, size = "md" }: {
  user: { full_name?: string; profile_picture?: string };
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-16 w-16 text-lg" };
  return (
    <div className={`${sizes[size]} flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#F5A623] bg-gradient-to-br from-[#FFD166] to-[#F5A623]`}>
      {user?.profile_picture
        ? <img src={user.profile_picture} alt={user.full_name} className="h-full w-full object-cover" />
        : <span className="font-bold text-[#1E0A42]">{getInitials(user?.full_name || "U")}</span>}
    </div>
  );
}

const NAV_LINKS = [
  { href: "/home",         label: "Home",          icon: "🏠",  section: "top" },
  { href: "/marketplace",  label: "Marketplace",   icon: "🛍️", section: "marketplace" },
  { href: "/housing",      label: "Housing",       icon: "🏘️", section: "housing" },
  { href: "/social",       label: "Social",        icon: "👥",  section: "social" },
  { href: "/lost-found",   label: "Lost & Found",  icon: "🔎",  section: "lost-found" },
  { href: "/post-listing", label: "Post a Listing",icon: "➕",  section: null },
];

function RightPanel() {
  const { currentUser } = useCurrentUser();
  return (
    <div className="flex flex-col gap-4 pb-6 pt-6">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#351470]">
        <div className="h-20 bg-[linear-gradient(135deg,#5B28A8_0%,#3D1A78_60%,#F5A623_100%)]" />
        <div className="-mt-8 px-5 pb-5">
          <div className="mb-3 flex justify-center">
            <Avatar user={currentUser} size="lg" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-white">
              {currentUser.full_name || <span className="inline-block h-4 w-24 animate-pulse rounded bg-white/10" />}
            </h3>
            <p className="mt-1 text-xs text-[#C4B0E0]">LSUS Connect member</p>
          </div>
          <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-xl border border-white/10 text-center">
            <div className="border-r border-white/10 p-3">
              <Link href="/user-profile" className="text-sm font-bold text-[#F5A623] hover:underline">My Profile</Link>
            </div>
            <div className="p-3">
              <Link href="/settings" className="text-sm font-bold text-[#F5A623] hover:underline">Settings</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#351470] p-4">
        <h4 className="mb-3 text-sm font-extrabold uppercase tracking-[0.15em] text-[#F5A623]">Quick Links</h4>
        <div className="space-y-1 text-sm">
          <Link href="/marketplace"  className="block rounded-xl px-3 py-2 text-[#C4B0E0] transition hover:bg-white/5 hover:text-white">Marketplace</Link>
          <Link href="/housing"      className="block rounded-xl px-3 py-2 text-[#C4B0E0] transition hover:bg-white/5 hover:text-white">Housing</Link>
          <Link href="/lost-found"   className="block rounded-xl px-3 py-2 text-[#C4B0E0] transition hover:bg-white/5 hover:text-white">Lost &amp; Found</Link>
          <Link href="/messages"     className="block rounded-xl px-3 py-2 text-[#C4B0E0] transition hover:bg-white/5 hover:text-white">Messages</Link>
          <Link href="/contact-team" className="block rounded-xl px-3 py-2 text-[#C4B0E0] transition hover:bg-white/5 hover:text-white">Contact Team</Link>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#351470] p-4">
        <h4 className="mb-3 text-sm font-extrabold uppercase tracking-[0.15em] text-[#F5A623]">Trending</h4>
        <div className="space-y-3">
          {[["Campus Marketplace","124 posts"],["Apartment Search","77 discussions"],["Book Swaps","54 updates"]].map(([title, meta], i) => (
            <div key={title} className="flex items-center gap-3">
              <div className="min-w-[24px] text-xl font-black text-white/20">{i + 1}</div>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-xs text-[#C4B0E0]">{meta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [activeSection, setActiveSection] = useState("top");
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/messages/unread-count", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUnreadMessages(data.unread_count || 0);
        }
      } catch { }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  // Scroll-spy on home page
  useEffect(() => {
    const main = mainRef.current;
    if (!main || pathname !== "/home") { setActiveSection("top"); return; }
    const handleScroll = () => {
      const sections = ["marketplace", "housing", "social", "lost-found"];
      let current = "top";
      for (const id of sections) {
        const el = main.querySelector(`[data-section="${id}"]`) as HTMLElement | null;
        if (el && el.getBoundingClientRect().top <= 150) current = id;
      }
      setActiveSection(current);
    };
    main.addEventListener("scroll", handleScroll, { passive: true });
    return () => main.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const isNavActive = (link: typeof NAV_LINKS[0]) => {
    if (pathname === "/home" && link.section) return activeSection === link.section;
    return pathname === link.href || (link.href !== "/home" && pathname.startsWith(link.href));
  };

  return (
    <div className="h-screen overflow-hidden bg-[#1E0A42] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#2E1065]/95 backdrop-blur">
        <div className="mx-auto flex h-[60px] max-w-[1920px] items-center gap-4 px-4 lg:px-6">
          <button className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-[#C4B0E0]" onClick={() => setIsMobileMenuOpen(v => !v)}>☰</button>
          <Link href="/home" className="text-xl font-extrabold tracking-tight">
            <span className="text-white">LSUS</span><span className="text-[#F5A623]"> Connect</span>
          </Link>
          <div className="flex max-w-xl flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <span className="text-[#C4B0E0]">🔍</span>
            <input type="text" placeholder="Search LSUS Connect..." className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#8B72BE]" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#C4B0E0] transition hover:bg-[#4A1E8A] hover:text-white">🔔</button>
            <Link href="/messages" className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#C4B0E0] transition hover:bg-[#4A1E8A] hover:text-white">
              ✉️
              {unreadMessages > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </Link>
            <UserDropdown />
          </div>
        </div>
      </header>

      {/* Three-column body */}
      <div className="mx-auto flex max-w-[1920px]" style={{ height: "calc(100vh - 60px)" }}>

        {/* LEFT — never scrolls */}
        <aside className={`fixed left-0 top-[60px] z-40 h-[calc(100vh-60px)] w-[220px] flex-shrink-0 overflow-hidden border-r border-white/10 bg-[#2E1065] p-4 transition-transform lg:sticky lg:top-0 lg:h-full lg:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="rounded-2xl border border-white/10 bg-[#2A0F5A] p-3">
            <nav className="space-y-1">
              {NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isNavActive(link) ? "bg-[linear-gradient(135deg,#5B28A8,#4A1E8A)] text-white" : "text-[#C4B0E0] hover:bg-white/5 hover:text-white"
                  }`}>
                  <span>{link.icon}</span><span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {isMobileMenuOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}

        {/* MIDDLE — scrolls on hover */}
        <main ref={mainRef} className="app-scrollable min-w-0 flex-1 px-4 py-6 lg:px-7" style={{ overflowY: "auto" }}>
          {children}
        </main>

        {/* RIGHT — scrolls on hover */}
        <div className="app-scrollable hidden xl:block xl:w-[300px] xl:flex-shrink-0 xl:px-4" style={{ overflowY: "auto" }}>
          <RightPanel />
        </div>

      </div>
    </div>
  );
}
