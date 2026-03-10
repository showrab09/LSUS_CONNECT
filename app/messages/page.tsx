"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UserDropdown from "@/components/UserDropdown";

/**
 * LSUS Connect - Messages/Inbox Page
 * Shows all conversations for the user
 */

interface Conversation {
  id: string;
  listing: {
    id: string;
    title: string;
    price: number;
    images: string[];
  };
  other_user: {
    id: string;
    name: string;
    profile_picture?: string;
  };
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/messages/conversations', {
        credentials: 'include',
      });

      if (!response.ok) {
     const errorData = await response.json();
    console.error('API Error:', errorData);
    throw new Error(errorData.error || 'Failed to fetch conversations');
    }   

      const data = await response.json();
      setConversations(data.conversations || []);
      setError("");
    } catch (err) {
      console.error("Error fetching conversations:", err);
      // Mock data for development
      setConversations([
        {
          id: "1",
          listing: {
            id: "listing-1",
            title: "iPhone 13 Pro - Like New",
            price: 800,
            images: ["https://via.placeholder.com/150"],
          },
          other_user: {
            id: "user-1",
            name: "John Seller",
            profile_picture: "",
          },
          last_message: "Yes, it's still available! When would you like to meet?",
          last_message_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
          unread_count: 2,
        },
        {
          id: "2",
          listing: {
            id: "listing-2",
            title: "MacBook Pro 2021",
            price: 1200,
            images: ["https://via.placeholder.com/150"],
          },
          other_user: {
            id: "user-2",
            name: "Sarah Buyer",
            profile_picture: "",
          },
          last_message: "Can you do $1000?",
          last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          unread_count: 0,
        },
      ]);
      setError("");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#461D7C]">
      {/* Header */}
      <header className="bg-[#3a1364] border-b border-[#5a2d8c] sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/marketplace" className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-[#FDD023]">LSUS</span>
              <span>CONNECT</span>
            </Link>

            <div className="flex items-center gap-4">
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-white text-3xl font-bold mb-2">Messages</h1>
          <p className="text-gray-300">Your conversations with buyers and sellers</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-[#FDD023] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white mt-4">Loading conversations...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg p-4 mb-6">
            {error}
            <button onClick={fetchConversations} className="ml-4 underline hover:text-red-200">
              Retry
            </button>
          </div>
        )}

        {/* Conversations List */}
        {!isLoading && !error && (
          <>
            {conversations.length === 0 ? (
              <div className="text-center py-16 bg-[#3a1364] rounded-lg border border-[#5a2d8c]">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#2a0d44] flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-white text-xl font-bold mb-2">No messages yet</h3>
                <p className="text-gray-300 mb-6">Start a conversation by messaging a seller!</p>
                <Link
                  href="/marketplace"
                  className="inline-block px-8 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
                >
                  Browse Marketplace
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map((conversation) => (
                  <Link
                    key={conversation.id}
                    href={`/messages/${conversation.id}`}
                    className="block bg-[#3a1364] rounded-lg p-4 border border-[#5a2d8c] hover:border-[#FDD023] transition-all"
                  >
                    <div className="flex gap-4">
                      {/* Listing Image */}
                      <div className="w-20 h-20 rounded-lg bg-[#2a0d44] overflow-hidden flex-shrink-0">
                        {conversation.listing.images?.[0] ? (
                          <img 
                            src={conversation.listing.images[0]} 
                            alt={conversation.listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Conversation Info */}
                      <div className="flex-1 min-w-0">
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Other User Avatar */}
                            {conversation.other_user.profile_picture ? (
                              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                <img 
                                  src={conversation.other_user.profile_picture} 
                                  alt={conversation.other_user.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#FDD023] flex items-center justify-center text-black text-xs font-bold flex-shrink-0">
                                {getInitials(conversation.other_user.name)}
                              </div>
                            )}
                            <h3 className="text-white font-semibold truncate">
                              {conversation.other_user.name}
                            </h3>
                          </div>
                          
                          {/* Time & Unread Badge */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-gray-400 text-xs">
                              {formatTimeAgo(conversation.last_message_at)}
                            </span>
                            {conversation.unread_count > 0 && (
                              <span className="bg-[#FDD023] text-black text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                                {conversation.unread_count}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Listing Title */}
                        <p className="text-gray-400 text-sm mb-1 truncate">
                          Re: {conversation.listing.title}
                        </p>

                        {/* Last Message */}
                        <p className={`text-sm truncate ${conversation.unread_count > 0 ? 'text-white font-semibold' : 'text-gray-300'}`}>
                          {conversation.last_message}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}