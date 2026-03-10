"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import UserDropdown from "@/components/UserDropdown";

/**
 * LSUS Connect - Chat/Conversation Page
 * Shows messages between buyer and seller for a specific listing
 */

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  listing: {
    id: string;
    title: string;
    price: number;
    price_type: string;
    images: string[];
  };
  buyer: {
    id: string;
    name: string;
  };
  seller: {
    id: string;
    name: string;
  };
}

// Decode JWT to get current user ID
function getCurrentUserId(): string {
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
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    setCurrentUserId(getCurrentUserId());
    fetchConversation();
  }, [conversationId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversation = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/messages/conversations/${conversationId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversation');
      }

      const data = await response.json();
      setConversation(data.conversation);
      setMessages(data.messages || []);
      setError("");

      // Mark messages as read
      markAsRead();
    } catch (err) {
      console.error("Error fetching conversation:", err);
      // Mock data for development
      setConversation({
        id: conversationId,
        listing: {
          id: "listing-1",
          title: "iPhone 13 Pro - Like New",
          price: 800,
          price_type: "PAID",
          images: ["https://via.placeholder.com/150"],
        },
        buyer: {
          id: "buyer-1",
          name: "Jane Buyer",
        },
        seller: {
          id: "seller-1",
          name: "John Seller",
        },
      });
      setMessages([
        {
          id: "1",
          sender_id: "buyer-1",
          sender_name: "Jane Buyer",
          message: "Hi! Is this still available?",
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
        {
          id: "2",
          sender_id: "seller-1",
          sender_name: "John Seller",
          message: "Yes, it's still available! Would you like to meet up?",
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
          id: "3",
          sender_id: "buyer-1",
          sender_name: "Jane Buyer",
          message: "Great! How about tomorrow at 3pm at the Student Union?",
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
      ]);
      setError("");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await fetch(`/api/messages/conversations/${conversationId}/read`, {
        method: 'PATCH',
        credentials: 'include',
      });
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          conversation_id: conversationId,
          message: newMessage.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Add new message to list
      const sentMessage: Message = {
        id: data.message.id,
        sender_id: currentUserId,
        sender_name: "You",
        message: newMessage.trim(),
        is_read: false,
        created_at: new Date().toISOString(),
      };
      
      setMessages([...messages, sentMessage]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      // Mock: Add message anyway for development
      const mockMessage: Message = {
        id: `msg-${Date.now()}`,
        sender_id: currentUserId,
        sender_name: "You",
        message: newMessage.trim(),
        is_read: false,
        created_at: new Date().toISOString(),
      };
      setMessages([...messages, mockMessage]);
      setNewMessage("");
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatPrice = () => {
    if (!conversation) return "";
    if (conversation.listing.price_type === "FREE") return "Free";
    if (conversation.listing.price_type === "SWAP") return "Trade/Swap";
    return `$${conversation.listing.price.toFixed(2)}`;
  };

  const getOtherUser = () => {
    if (!conversation) return null;
    // If current user is buyer, show seller; if seller, show buyer
    return currentUserId === conversation.buyer.id ? conversation.seller : conversation.buyer;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#461D7C] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[#FDD023] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white text-lg">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-[#461D7C] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Conversation not found</p>
          <Link href="/messages" className="text-[#FDD023] hover:underline">
            Back to Messages
          </Link>
        </div>
      </div>
    );
  }

  const otherUser = getOtherUser();

  return (
    <div className="min-h-screen bg-[#461D7C] flex flex-col">
      {/* Header */}
      <header className="bg-[#3a1364] border-b border-[#5a2d8c] sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/messages"
                className="text-white hover:text-[#FDD023] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-white text-lg font-bold">{otherUser?.name}</h1>
                <p className="text-gray-400 text-xs">Re: {conversation.listing.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-[1200px] w-full mx-auto">
        {/* Listing Info Card */}
        <div className="bg-[#3a1364] border-b border-[#5a2d8c] p-4 mx-4 mt-4 rounded-lg">
          <Link href={`/product-detail?id=${conversation.listing.id}`} className="flex gap-4 hover:opacity-80 transition-opacity">
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
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold mb-1 truncate">{conversation.listing.title}</h3>
              <p className="text-[#FDD023] font-bold text-lg">{formatPrice()}</p>
              <p className="text-gray-400 text-xs">Click to view listing</p>
            </div>
          </Link>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => {
            const isCurrentUser = message.sender_id === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                  {!isCurrentUser && (
                    <p className="text-gray-400 text-xs mb-1">{message.sender_name}</p>
                  )}
                  <div
                    className={`rounded-lg p-3 ${
                      isCurrentUser
                        ? 'bg-[#FDD023] text-black'
                        : 'bg-[#3a1364] text-white border border-[#5a2d8c]'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-[#3a1364] border-t border-[#5a2d8c] p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={isSending}
              className="flex-1 h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="px-6 h-12 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}