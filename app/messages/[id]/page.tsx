"use client";

import AppLayout from "@/components/AppLayout";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";

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
  buyer: { id: string; name: string };
  seller: { id: string; name: string };
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useCurrentUser();
  const currentUserId = currentUser.id;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchConversation(); }, [conversationId]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const fetchConversation = async () => {
    try {
      setIsLoading(true); setError("");
      const res = await fetch(`/api/messages/conversations/${conversationId}`, { credentials: "include" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to load"); }
      const data = await res.json();
      setConversation(data.conversation);
      setMessages(data.messages || []);
      fetch(`/api/messages/conversations/${conversationId}/read`, { method: "PATCH", credentials: "include" }).catch(() => {});
    } catch (err: any) {
      setError(err.message || "Failed to load conversation.");
    } finally { setIsLoading(false); }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);
    const text = newMessage.trim();
    setNewMessage("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ conversation_id: conversationId, message: text }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: data.message.id,
        sender_id: currentUserId,
        sender_name: "You",
        message: text,
        is_read: false,
        created_at: new Date().toISOString(),
      }]);
      inputRef.current?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to send.");
      setNewMessage(text);
    } finally { setIsSending(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this entire conversation? This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/messages?conversation_id=${conversationId}`, {
        method: "DELETE", credentials: "include",
      });
      if (res.ok) { router.push("/messages"); }
      else { const d = await res.json(); setError(d.error || "Failed to delete."); setIsDeleting(false); }
    } catch { setError("Failed to delete."); setIsDeleting(false); }
  };

  const formatTime = (ts: string) => {
    const date = new Date(ts);
    const isToday = date.toDateString() === new Date().toDateString();
    const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return isToday ? `Today at ${time}` : date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ` at ${time}`;
  };

  const formatPrice = () => {
    if (!conversation) return "";
    if (conversation.listing.price_type === "FREE") return "Free";
    if (conversation.listing.price_type === "SWAP") return "Trade/Swap";
    return `$${conversation.listing.price?.toFixed(2)}`;
  };

  const otherUser = conversation
    ? (currentUserId === conversation.buyer.id ? conversation.seller : conversation.buyer)
    : null;

  if (isLoading) return (
    <AppLayout>
      <div className="flex items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#F5A623] border-t-transparent" />
      </div>
    </AppLayout>
  );

  if (!conversation) return (
    <AppLayout>
      <div className="py-20 text-center">
        <p className="text-red-400 mb-4">{error || "Conversation not found"}</p>
        <Link href="/messages" className="text-[#F5A623] hover:underline">← Back to Messages</Link>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-80px)] max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/messages" className="rounded-full p-2 text-[#C4B0E0] hover:bg-white/5 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h2 className="text-white font-bold">{otherUser?.name || "Conversation"}</h2>
              <p className="text-xs text-[#8B72BE]">Re: {conversation.listing.title}</p>
            </div>
          </div>
          <button onClick={handleDelete} disabled={isDeleting}
            className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20 transition disabled:opacity-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>

        {/* Listing card */}
        <Link href={`/product-detail?id=${conversation.listing.id}`}
          className="mb-4 flex gap-3 rounded-2xl border border-white/10 bg-[#351470] p-3 hover:border-[#F5A623]/40 transition flex-shrink-0">
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[#2A0F5A]">
            {conversation.listing.images?.[0]
              ? <img src={conversation.listing.images[0]} alt={conversation.listing.title} className="h-full w-full object-cover" />
              : <div className="flex h-full w-full items-center justify-center text-2xl">📦</div>}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">{conversation.listing.title}</p>
            <p className="text-[#F5A623] font-bold">{formatPrice()}</p>
            <p className="text-xs text-[#8B72BE]">Tap to view listing →</p>
          </div>
        </Link>

        {/* Error */}
        {error && conversation && (
          <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300 flex-shrink-0">{error}</div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
          {messages.length === 0 && (
            <div className="py-12 text-center text-[#8B72BE] text-sm">No messages yet — say hello! 👋</div>
          )}
          {messages.map(msg => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[72%]">
                  {!isMe && <p className="mb-1 text-xs text-[#8B72BE]">{msg.sender_name}</p>}
                  <div className={`rounded-2xl px-4 py-2.5 ${isMe
                    ? "rounded-tr-sm bg-[#F5A623] text-[#1E0A42]"
                    : "rounded-tl-sm bg-[#2A0F5A] text-white border border-white/10"}`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                  </div>
                  <p className={`mt-1 text-[10px] text-[#8B72BE] ${isMe ? "text-right" : "text-left"}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="mt-4 flex gap-2 flex-shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={isSending}
            className="flex-1 h-12 rounded-2xl border border-white/10 bg-[#2A0F5A] px-4 text-sm text-white placeholder:text-[#8B72BE] outline-none focus:border-[#F5A623] disabled:opacity-50"
          />
          <button type="submit" disabled={!newMessage.trim() || isSending}
            className="h-12 w-12 flex-shrink-0 rounded-2xl bg-[#F5A623] text-[#1E0A42] hover:bg-[#FFD166] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center">
            {isSending
              ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1E0A42] border-t-transparent" />
              : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>}
          </button>
        </form>

      </div>
    </AppLayout>
  );
}
