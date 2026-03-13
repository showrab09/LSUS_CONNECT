"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const isLoggingOut = sessionStorage.getItem('isLoggingOut');
    if (isLoggingOut) {
      sessionStorage.removeItem('isLoggingOut');
      router.push('/signin');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
    } else {
      router.push('/home'); // ← changed from /marketplace
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#250D44] via-[#461D7C] to-[#5a2d8c]">
      <div className="text-center">
        <h1 className="text-6xl font-black mb-6">
          <span className="text-[#FDD023]">LSUS</span>{" "}
          <span className="text-white">CONNECT</span>
        </h1>
        <p className="text-white text-xl">Loading...</p>
      </div>
    </div>
  );
}
