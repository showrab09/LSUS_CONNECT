"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface MessageSellerButtonProps {
  listingId: string;
  sellerId: string;
  listingTitle: string;
}

export default function MessageSellerButton({ listingId, sellerId, listingTitle }: MessageSellerButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Get current user ID from JWT
  const getCurrentUserId = (): string => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return "";
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      const decoded = JSON.parse(jsonPayload);
      return decoded.userId || "";
    } catch (e) {
      return "";
    }
  };

  const handleMessageSeller = async () => {
    const currentUserId = getCurrentUserId();
    
    // Check if user is logged in
    if (!currentUserId) {
      alert("Please sign in to message the seller");
      router.push("/signin");
      return;
    }

    // Check if user is trying to message themselves
    if (currentUserId === sellerId) {
      alert("You cannot message yourself!");
      return;
    }

    setIsLoading(true);

    try {
      // Send initial message to create/find conversation
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          listing_id: listingId,
          message: `Hi! I'm interested in "${listingTitle}". Is it still available?`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start conversation');
      }

      const data = await response.json();
      
      // Redirect to conversation
      router.push(`/messages/${data.conversation_id}`);
    } catch (error) {
      console.error("Error starting conversation:", error);
      
      // Fallback: Create mock conversation for development
      const mockConversationId = `conv-${listingId}-${Date.now()}`;
      router.push(`/messages/${mockConversationId}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleMessageSeller}
      disabled={isLoading}
      className="w-full min-h-[48px] py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <>
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <span>Starting conversation...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>Message Seller</span>
        </>
      )}
    </button>
  );
}