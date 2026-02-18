"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * LSUS Connect - Home Page
 * Redirects to signin if not authenticated
 */

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in (localStorage is only available on client)
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Not logged in, redirect to signin
      router.push('/signin');
    } else {
      // Logged in, redirect to marketplace
      router.push('/marketplace');
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