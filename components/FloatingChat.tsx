"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function FloatingChat() {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [openChats, setOpenChats] = useState<string[]>([]);
  const [messages, setMessages] = useState<{ [key: string]: any[] }>({});
  const [newMessage, setNewMessage] = useState<{ [key: string]: string }>({});
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Only render on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get current user ID
  useEffect(() => {
    if (!isMounted) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      const decoded = JSON.parse(jsonPayload);
      setCurrentUserId(decoded.userId || "");
    } catch (e) {
      console.error("Error decoding token:", e);
    }
  }, [isMounted]);

  // Fetch conversations
  useEffect(() => {
    if (!currentUserId || !isMounted) return;
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [currentUserId, isMounted]);

  // Fetch unread count
  useEffect(() => {
    if (!currentUserId || !isMounted) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [currentUserId, isMounted]);

  // Fetch messages for open chats
  useEffect(() => {
    if (openChats.length === 0 || !isMounted) return;
    openChats.forEach(chatId => fetchMessages(chatId));
    const interval = setInterval(() => {
      openChats.forEach(chatId => fetchMessages(chatId));
    }, 5000);
    return () => clearInterval(interval);
  }, [openChats, isMounted]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages/conversations', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/messages/unread-count', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => ({
          ...prev,
          [conversationId]: data.messages || [],
        }));
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const openChat = (conversationId: string) => {
    if (openChats.length >= 3) return;
    if (!openChats.includes(conversationId)) {
      setOpenChats([...openChats, conversationId]);
      fetchMessages(conversationId);
      markAsRead(conversationId);
    }
    setIsOpen(false);
  };

  const closeChat = (conversationId: string) => {
    setOpenChats(openChats.filter(id => id !== conversationId));
    const newMessages = { ...messages };
    delete newMessages[conversationId];
    setMessages(newMessages);
  };

  const markAsRead = async (conversationId: string) => {
    try {
      await fetch(`/api/messages/conversations/${conversationId}/read`, {
        method: 'PATCH',
        credentials: 'include',
      });
      fetchUnreadCount();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const sendMessage = async (conversationId: string) => {
    const text = newMessage[conversationId]?.trim();
    if (!text) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          conversation_id: conversationId,
          content: text,
        }),
      });

      if (response.ok) {
        setNewMessage(prev => ({ ...prev, [conversationId]: '' }));
        fetchMessages(conversationId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const scrollToBottom = (conversationId: string) => {
    messagesEndRefs.current[conversationId]?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    openChats.forEach(chatId => scrollToBottom(chatId));
  }, [messages]);

  const getOtherUser = (conversation: any) => {
    return conversation.buyer_id === currentUserId
      ? conversation.seller
      : conversation.buyer;
  };

  // Don't render anything until client-side
  if (!isMounted || !currentUserId) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Icon */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 bg-[#FDD023] rounded-full shadow-lg hover:bg-[#FFE34A] transition-all flex items-center justify-center"
        >
          <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Mini Inbox Popup */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 w-80 bg-[#3a1364] rounded-lg shadow-xl border border-[#5a2d8c] overflow-hidden">
            {/* Header */}
            <div className="bg-[#2a0d44] p-4 border-b border-[#5a2d8c] flex items-center justify-between">
              <h3 className="text-white font-bold">Messages</h3>
              <Link
                href="/messages"
                className="text-[#FDD023] text-sm hover:underline"
                onClick={() => setIsOpen(false)}
              >
                View All
              </Link>
            </div>

            {/* Conversations List */}
            <div className="max-h-96 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <p>No messages yet</p>
                </div>
              ) : (
                conversations.slice(0, 5).map(conv => {
                  const otherUser = getOtherUser(conv);
                  const initials = otherUser?.full_name
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || '??';

                  return (
                    <button
                      key={conv.id}
                      onClick={() => openChat(conv.id)}
                      className="w-full p-4 hover:bg-[#461D7C] transition-colors border-b border-[#5a2d8c] text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FDD023] flex items-center justify-center flex-shrink-0">
                          {otherUser?.profile_picture ? (
                            <img
                              src={otherUser.profile_picture}
                              alt={otherUser.full_name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-black font-bold text-sm">{initials}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate">
                            {otherUser?.full_name || 'Unknown User'}
                          </p>
                          <p className="text-gray-400 text-xs truncate">
                            {conv.listing?.title || 'No listing'}
                          </p>
                        </div>
                        {conv.unread_count > 0 && (
                          <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Chat Windows */}
      {openChats.map((chatId, index) => {
        const conversation = conversations.find(c => c.id === chatId);
        if (!conversation) return null;

        const otherUser = getOtherUser(conversation);
        const chatMessages = messages[chatId] || [];
        const initials = otherUser?.full_name
          ?.split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || '??';

        return (
          <div
            key={chatId}
            className="fixed bottom-6 z-40 w-80 bg-[#3a1364] rounded-lg shadow-xl border border-[#5a2d8c] overflow-hidden"
            style={{ right: `${24 + (index * 336)}px` }}
          >
            {/* Chat Header */}
            <div className="bg-[#2a0d44] p-3 border-b border-[#5a2d8c] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FDD023] flex items-center justify-center">
                  {otherUser?.profile_picture ? (
                    <img
                      src={otherUser.profile_picture}
                      alt={otherUser.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-black font-bold text-xs">{initials}</span>
                  )}
                </div>
                <span className="text-white font-semibold text-sm truncate max-w-[180px]">
                  {otherUser?.full_name || 'Unknown User'}
                </span>
              </div>
              <button
                onClick={() => closeChat(chatId)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 bg-[#461D7C] space-y-3">
              {chatMessages.map((msg: any) => {
                const isOwn = msg.sender_id === currentUserId;
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] px-3 py-2 rounded-lg ${
                        isOwn
                          ? 'bg-[#FDD023] text-black'
                          : 'bg-[#3a1364] text-white'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={(el) => { messagesEndRefs.current[chatId] = el; }} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-[#5a2d8c] bg-[#2a0d44]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage[chatId] || ''}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, [chatId]: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage(chatId)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 rounded-lg bg-[#461D7C] border border-[#5a2d8c] text-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#FDD023]"
                />
                <button
                  onClick={() => sendMessage(chatId)}
                  className="px-4 py-2 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}