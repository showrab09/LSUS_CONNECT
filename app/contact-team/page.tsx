"use client";

import AppLayout from "@/components/AppLayout";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * LSUS Connect - Contact Page (FULLY RESPONSIVE)
 * Mobile: Stacked layout, form first
 * Tablet/Desktop: Two-column layout
 */

const teamMembers = [
  {
    name: "Robert Lovelace",
    role: "Operations Head",
    avatar: "/api/placeholder/60/60",
  },
  {
    name: "Showrab Bin Habib",
    role: "Project Manager",
    avatar: "/api/placeholder/60/60",
  },
  {
    name: "Abid Talukder",
    role: "Lead Developer",
    avatar: "/api/placeholder/60/60",
  },
];

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitMessage({
        type: "error",
        text: "Please fill in all required fields.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubmitMessage({
        type: "success",
        text: "Message sent successfully! We'll respond within 24 hours.",
      });

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setSubmitMessage({
        type: "error",
        text: "Failed to send message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "token=; path=/; max-age=0";
    router.push("/signin");
  };

  return (
    <AppLayout>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page Title */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-white text-3xl sm:text-4xl font-bold mb-3">
            Contact the LSUS Connect Team
          </h2>
          <p className="text-[#C4B0E0] text-base sm:text-lg">
            Questions, feedback, or report an issue — send us a message below.
          </p>
        </div>

        {/* Two Column Layout - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6 lg:gap-8">
          {/* Left Side - Contact Form */}
          <div className="rounded-2xl bg-[#351470] p-6 sm:p-8 border border-white/10">
            <h3 className="text-[#F5A623] text-xl font-bold mb-6">
              Send us a message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Your name */}
              <div>
                <label htmlFor="name" className="sr-only">
                  Your name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full h-12 sm:h-14 px-4 rounded-lg bg-[#2A0F5A] border border-white/10 text-white text-base placeholder-gray-400 focus:outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
                />
              </div>

              {/* Email address */}
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full h-12 sm:h-14 px-4 rounded-lg bg-[#2A0F5A] border border-white/10 text-white text-base placeholder-gray-400 focus:outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
                />
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="sr-only">
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full h-12 sm:h-14 px-4 rounded-lg bg-[#2A0F5A] border border-white/10 text-white text-base placeholder-gray-400 focus:outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="sr-only">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg bg-[#2A0F5A] border border-white/10 text-white text-base placeholder-gray-400 focus:outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20 resize-none"
                />
              </div>

              {/* Submit Button - Touch friendly */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[48px] py-3 bg-[#F5A623] text-black font-bold rounded-lg hover:bg-[#FFD166] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>

              {/* Success/Error Message */}
              {submitMessage && (
                <div
                  className={`p-3 sm:p-4 rounded-lg text-sm text-center ${
                    submitMessage.type === "success"
                      ? "bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {submitMessage.text}
                </div>
              )}
            </form>
          </div>

          {/* Right Side - Team Info */}
          <div className="space-y-6">
            {/* Our Team */}
            <div className="rounded-2xl bg-[#351470] p-6 border border-white/10">
              <h3 className="text-[#F5A623] text-xl font-bold mb-6">Our Team</h3>

              <div className="space-y-4">
                {teamMembers.map((member, index) => (
                  <div key={index} className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-600 flex-shrink-0 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-[#2E1065] to-[#351470]"></div>
                    </div>
                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-semibold text-base truncate">
                        {member.name}
                      </p>
                      <p className="text-[#8B72BE] text-sm">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Email */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-[#C4B0E0] text-sm">
                  Email:{" "}
                  <a
                    href="mailto:support@lsusconnect.edu"
                    className="text-[#F5A623] hover:text-[#FFE34A] transition-colors break-all"
                  >
                    support@lsusconnect.edu
                  </a>
                </p>
              </div>
            </div>

            {/* Follow & Contact */}
            <div className="rounded-2xl bg-[#351470] p-6 border border-white/10">
              <h3 className="text-[#F5A623] text-xl font-bold mb-4">
                Follow & Contact
              </h3>

              <div className="space-y-3 text-sm text-[#C4B0E0]">
                <p>
                  <span className="text-white font-semibold">LinkedIn</span> •{" "}
                  <span className="text-white font-semibold">Instagram</span> •{" "}
                  <span className="text-white font-semibold">Email</span>
                </p>
                <p className="text-xs">We typically respond within 24 hours.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
