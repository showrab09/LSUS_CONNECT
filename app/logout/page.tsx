"use client";

import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    async function logout() {
      try {
        // Call logout API to clear HTTP-only cookie
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
      } catch (e) {
        console.error('Logout API error:', e);
      }
      
      // Clear client-side storage
      try { localStorage.clear(); } catch(e) {}
      try { sessionStorage.clear(); } catch(e) {}
      
      // Redirect to signin
      window.location.href = "/signin";
    }
    
    logout();
  }, []);

  return (
    <div className="min-h-screen bg-[#461D7C] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-16 h-16 border-4 border-[#FDD023] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white text-lg">Logging out...</p>
      </div>
    </div>
  );
}