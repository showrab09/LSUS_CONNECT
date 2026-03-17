"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UserDropdown from "@/components/UserDropdown";

/**
 * LSUS Connect - Report Lost/Found Item Page
 */

type ItemType = "LOST" | "FOUND";

export default function ReportLostFoundPage() {
  const router = useRouter();
  const [itemType, setItemType] = useState<ItemType>("LOST");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [dateOccurred, setDateOccurred] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    "Electronics",
    "Keys",
    "Wallet/Purse",
    "Phone",
    "ID/Cards",
    "Clothing",
    "Books",
    "Jewelry",
    "Bags/Backpacks",
    "Other"
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages([...images, ...newImages]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    console.log("=== SUBMIT CLICKED ===");
    
    // Validation
    if (!title.trim()) {
      setError("Item name is required");
      return;
    }
    if (!category) {
      setError("Category is required");
      return;
    }
    if (!description.trim()) {
      setError("Description is required");
      return;
    }
    if (!location.trim()) {
      setError("Location is required");
      return;
    }
    if (!dateOccurred) {
      setError("Date is required");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const itemData = {
        type: itemType,
        title: title.trim(),
        description: description.trim(),
        category: category,
        location: location.trim(),
        date_occurred: dateOccurred,
        contact_info: contactInfo.trim() || null,
        images: images,
        status: "ACTIVE"
      };

      console.log("Sending data:", itemData);

      // Try to post to lost-found endpoint
      const response = await fetch('/api/lost-found', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(itemData),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        console.log("SUCCESS! Redirecting to lost & found...");
        router.push('/lost-found');
      } else {
        setError(data.error || "Failed to report item");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error reporting item:", error);
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#461D7C]">
      {/* Header */}
      <header className="bg-[#3a1364] border-b border-[#5a2d8c] sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/home" className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-[#FDD023]">LSUS</span>
              <span>CONNECT</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/lost-found" className="text-white hover:text-[#FDD023] transition-colors text-sm">
                Lost & Found
              </Link>
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-3">
          <h1 className="text-white text-xl font-bold mb-3">Report Lost or Found Item</h1>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg p-4">
              {error}
            </div>
          )}

          {/* Item Type Selector */}
          <div>
            <label className="block text-[#FDD023] font-semibold mb-2 text-sm">Item Type *</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setItemType("LOST")}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                  itemType === "LOST"
                    ? "bg-red-500 text-white"
                    : "bg-[#2a0d44] text-white border border-[#5a2d8c] hover:border-red-500"
                }`}
              >
                I Lost Something
              </button>
              <button
                type="button"
                onClick={() => setItemType("FOUND")}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                  itemType === "FOUND"
                    ? "bg-green-500 text-white"
                    : "bg-[#2a0d44] text-white border border-[#5a2d8c] hover:border-green-500"
                }`}
              >
                I Found Something
              </button>
            </div>
          </div>

          {/* Item Name */}
          <div>
            <label className="block text-[#FDD023] font-semibold mb-1 text-sm">
              Item Name *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Black wallet, iPhone 13, Blue backpack"
              className="w-full h-10 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[#FDD023] font-semibold mb-1 text-sm">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white text-sm focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[#FDD023] font-semibold mb-1 text-sm">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the item in detail (color, brand, distinctive features, etc.)"
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20 resize-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-[#FDD023] font-semibold mb-1 text-sm">
              Location {itemType === "LOST" ? "Last Seen" : "Found"} *
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Library 2nd floor, Student Union cafeteria"
              className="w-full h-10 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-[#FDD023] font-semibold mb-1 text-sm">
              Date {itemType === "LOST" ? "Lost" : "Found"} *
            </label>
            <input
              type="date"
              value={dateOccurred}
              onChange={(e) => setDateOccurred(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full h-10 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white text-sm focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
            />
          </div>

          {/* Contact Info */}
          <div>
            <label className="block text-[#FDD023] font-semibold mb-1 text-sm">
              Contact Information (Optional)
            </label>
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="Phone or email (your account email will be used by default)"
              className="w-full h-10 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
            />
            <p className="text-gray-400 text-xs mt-1">
              Leave blank to use your account email for contact
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-[#FDD023] font-semibold mb-1 text-sm">
              Photos (Optional but recommended)
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                isDragging ? "border-[#FDD023] bg-[#FDD023]/10" : "border-[#5a2d8c] bg-[#2a0d44]"
              }`}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#FDD023]/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#FDD023]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-white font-semibold text-sm mb-1">Click to upload or drag and drop</p>
                <p className="text-gray-400 text-xs">PNG, JPG up to 10MB</p>
              </label>
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-[#2a0d44] border border-[#5a2d8c]">
                    <img 
                      src={img} 
                      alt={`Upload ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3">
            <Link
              href="/lost-found"
              className="flex-1 h-11 px-6 bg-[#2a0d44] text-white font-semibold text-sm rounded-lg border border-[#5a2d8c] hover:border-[#FDD023] transition-colors flex items-center justify-center"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 h-11 px-6 bg-[#FDD023] text-black font-bold text-sm rounded-lg hover:bg-[#FFE34A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
