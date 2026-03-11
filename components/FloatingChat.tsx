"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * LSUS Connect - Floating Chat Widget
 * Facebook-style chat that stays on screen
 */

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  created_at: string;
}

interface Conversation {
  id: string;
  listing: {
    id: string;
    title: string;
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

interface ChatWindow {
  conversation: Conversation;
  messages: Message[];
  isMinimized: boolean;
}

export default function FloatingChat() {
  const router = useRouter();
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatWindows, setChatWindows] = useState<ChatWindow[]>([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [newMessage, setNewMessage] = useState<{ [key: string]: string }>({});
  const inboxRef = useRef<HTMLDivElement>(null);
  const messagesEndRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Get current user ID
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

  const currentUserId = getCurrentUserId();

  // Fetch conversations every 10 seconds
  useEffect(() => {
    if (!currentUserId) return;

    fetchConversations();
    const interval = setInterval(fetchConversations, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [currentUserId]);

  // Fetch messages for open chat windows every 5 seconds
  useEffect(() => {
    if (chatWindows.length === 0) return;

    chatWindows.forEach(chat => fetchMessages(chat.conversation.id));
    const interval = setInterval(() => {
      chatWindows.forEach(chat => fetchMessages(chat.conversation.id));
    }, 5000);
    return () => clearInterval(interval);
  }, [chatWindows.length]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatWindows.forEach(chat => {
      const ref = messagesEndRefs.current[chat.conversation.id];
      if (ref) {
        ref.scrollIntoView({ behavior: "smooth" });
      }
    });
  }, [chatWindows]);

  // Close inbox when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inboxRef.current && !inboxRef.current.contains(event.target as Node)) {
        setIsInboxOpen(false);
      }
    }
    if (isInboxOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isInboxOpen]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages/conversations', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
        
        // Calculate total unread
        const total = (data.conversations || []).reduce(
          (sum: number, conv: Conversation) => sum + conv.unread_count, 
          0
        );
        setUnreadTotal(total);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update chat window with new messages
        setChatWindows(prev => 
          prev.map(chat => 
            chat.conversation.id === conversationId
              ? { ...chat, messages: data.messages || [] }
              : chat
          )
        );

        // Mark as read
        await fetch(`/api/messages/conversations/${conversationId}/read`, {
          method: 'PATCH',
          credentials: 'include',
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const openChat = (conversation: Conversation) => {
    // Check if already open
    if (chatWindows.find(w => w.conversation.id === conversation.id)) {
      // Unminimize if minimized
      setChatWindows(prev => 
        prev.map(w => 
          w.conversation.id === conversation.id 
            ? { ...w, isMinimized: false }
            : w
        )
      );
      return;
    }

    // Max 3 chat windows
    if (chatWindows.length >= 3) {
      alert("Maximum 3 chats open at once. Please close one first.");
      return;
    }

    // Open new chat window
    const newWindow: ChatWindow = {
      conversation,
      messages: [],
      isMinimized: false,
    };
    setChatWindows(prev => [...prev, newWindow]);
    fetchMessages(conversation.id);
    setIsInboxOpen(false);
  };

  const closeChat = (conversationId: string) => {
    setChatWindows(prev => prev.filter(w => w.conversation.id !== conversationId));
  };

  const toggleMinimize = (conversationId: string) => {
    setChatWindows(prev => 
      prev.map(w => 
        w.conversation.id === conversationId 
          ? { ...w, isMinimized: !w.isMinimized }
          : w
      )
    );
  };

  const sendMessage = async (conversationId: string) => {
    const message = newMessage[conversationId]?.trim();
    if (!message) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          conversation_id: conversationId,
          message,
        }),
      });

      if (response.ok) {
        setNewMessage(prev => ({ ...prev, [conversationId]: "" }));
        fetchMessages(conversationId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
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

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (!currentUserId) return null;

  return (
    <>
      {/* Chat Icon Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsInboxOpen(!isInboxOpen)}
          className="w-16 h-16 bg-[#FDD023] rounded-full flex items-center justify-center shadow-lg hover:bg-[#FFE34A] transition-all hover:scale-110 relative"
        >
          <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {unreadTotal > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadTotal > 9 ? '9+' : unreadTotal}
            </span>
          )}
        </button>
      </div>

      {/* Mini Inbox Popup */}
      {isInboxOpen && (
        <div
          ref={inboxRef}
          className="fixed bottom-24 right-6 w-80 bg-[#3a1364] border border-[#5a2d8c] rounded-lg shadow-2xl z-50 max-h-96 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-[#5a2d8c] flex items-center justify-between">
            <h3 className="text-white font-bold">Messages</h3>
            <button
              onClick={() => router.push('/messages')}
              className="text-[#FDD023] text-xs hover:underline"
            >
              See All
            </button>
          </div>

          {/* Conversations List */}
          <div className="overflow-y-auto flex-1">
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-400 text-sm">No messages yet</p>
              </div>
            ) : (
              <div>
                {conversations.slice(0, 5).map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => openChat(conv)}
                    className="w-full p-3 hover:bg-[#461D7C] transition-colors border-b border-[#5a2d8c] text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#FDD023] flex items-center justify-center flex-shrink-0">
                        {conv.other_user.profile_picture ? (
                          <img
                            src={conv.other_user.profile_picture}
                            alt={conv.other_user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-black font-bold text-xs">
                            {getInitials(conv.other_user.name)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">
                          {conv.other_user.name}
                        </p>
                        <p className="text-gray-400 text-xs truncate">
                          {conv.last_message}
                        </p>
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Chat Windows */}
      <div className="fixed bottom-6 right-24 flex gap-3 z-40">
        {chatWindows.map((chat, index) => (
          <div
            key={chat.conversation.id}
            className="w-80 bg-[#3a1364] border border-[#5a2d8c] rounded-lg shadow-2xl flex flex-col"
            style={{ marginRight: `${index * 20}px` }}
          >
            {/* Chat Header */}
            <div className="p-3 bg-[#461D7C] border-b border-[#5a2d8c] flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#FDD023] flex items-center justify-center flex-shrink-0">
                  <span className="text-black font-bold text-xs">
                    {getInitials(chat.conversation.other_user.name)}
                  </span>
                </div>
                <span className="text-white font-semibold text-sm truncate">
                  {chat.conversation.other_user.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleMinimize(chat.conversation.id)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <button
                  onClick={() => closeChat(chat.conversation.id)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Chat Body */}
            {!chat.isMinimized && (
              <>
                {/* Messages */}
                <div className="h-80 overflow-y-auto p-3 space-y-2 bg-[#2a0d44]">
                  {chat.messages.map((msg) => {
                    const isCurrentUser = msg.sender_id === currentUserId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%]`}>
                          <div
                            className={`rounded-lg p-2 text-sm ${
                              isCurrentUser
                                ? 'bg-[#FDD023] text-black'
                                : 'bg-[#3a1364] text-white'
                            }`}
                          >
                            {msg.message}
                          </div>
                          <p className="text-gray-500 text-xs mt-1">
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={(el) => { messagesEndRefs.current[chat.conversation.id] = el; }} />
                </div>

                {/* Message Input */}
                <div className="p-3 border-t border-[#5a2d8c]">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage(chat.conversation.id);
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={newMessage[chat.conversation.id] || ""}
                      onChange={(e) =>
                        setNewMessage(prev => ({
                          ...prev,
                          [chat.conversation.id]: e.target.value
                        }))
                      }
                      placeholder="Type a message..."
                      className="flex-1 h-9 px-3 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#FDD023]"
                    />
                    <button
                      type="submit"
                      className="px-3 h-9 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors text-sm"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
}