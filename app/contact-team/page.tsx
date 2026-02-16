"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * LSUS Connect - Contact Page
 * Brand Compliant with LSUS Brand Guidelines (January 2026)
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
  {
    name: "Wei Chen",
    role: "Database Admin",
    avatar: "/api/placeholder/60/60",
  },
];

export default function ContactPage() {
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

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitMessage({
        type: "error",
        text: "Please fill in all required fields.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      // await fetch('/api/contact', {
      //   method: 'POST',
      //   body: JSON.stringify(formData)
      // })

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubmitMessage({
        type: "success",
        text: "Message sent successfully! We'll respond within 24 hours.",
      });

      // Clear form
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

  return (
    <div className="min-h-screen bg-[#461D7C]">
      {/* Header */}
      <header className="bg-[#461D7C] border-b border-[#5a2d8c] py-4">
        <div className="max-w-[1400px] mx-auto px-6">
          <Link href="/" className="text-3xl font-bold text-white inline-block">
            <span className="text-[#FDD023]">LSUS</span> CONNECT
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h2 className="text-white text-4xl font-bold mb-3">
            Contact the LSUS Connect Team
          </h2>
          <p className="text-gray-300 text-lg">
            Questions, feedback, or report an issue — send us a message below.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-[1fr,400px] gap-8">
          {/* Left Side - Contact Form */}
          <div className="bg-[#3a1364] rounded-lg p-8 border border-[#5a2d8c]">
            <h3 className="text-[#FDD023] text-xl font-bold mb-6">
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
                  className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
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
                  className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
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
                  className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
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
                  className="w-full px-4 py-3 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>

              {/* Success/Error Message */}
              {submitMessage && (
                <div
                  className={`p-3 rounded-lg text-sm text-center ${
                    submitMessage.type === "success"
                      ? "bg-[#FDD023]/20 text-[#FDD023] border border-[#FDD023]/30"
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
            <div className="bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c]">
              <h3 className="text-[#FDD023] text-xl font-bold mb-6">Our Team</h3>

              <div className="space-y-4">
                {teamMembers.map((member, index) => (
                  <div key={index} className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-gray-600 flex-shrink-0 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-[#461D7C] to-[#5a2d8c]"></div>
                    </div>
                    {/* Info */}
                    <div>
                      <p className="text-white font-semibold text-base">
                        {member.name}
                      </p>
                      <p className="text-gray-400 text-sm">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Email */}
              <div className="mt-6 pt-6 border-t border-[#5a2d8c]">
                <p className="text-gray-300 text-sm">
                  Email:{" "}
                  <a
                    href="mailto:support@lsusconnect.edu"
                    className="text-[#FDD023] hover:text-[#FFE34A] transition-colors"
                  >
                    support@lsusconnect.edu
                  </a>
                </p>
              </div>
            </div>

            {/* Follow & Contact */}
            <div className="bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c]">
              <h3 className="text-[#FDD023] text-xl font-bold mb-4">
                Follow & Contact
              </h3>

              <div className="space-y-3 text-sm text-gray-300">
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
    </div>
  );
}
