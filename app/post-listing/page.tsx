"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UserDropdown from "@/components/UserDropdown";

/**
 * LSUS Connect - Post Listing Page (RESPONSIVE + PROFILE DROPDOWN)
 * Mobile: Stacked form fields, simplified layout
 * Tablet: Balanced form layout
 * Desktop: Form + Preview sidebar
 */

type ListingType = "regular" | "featured";
type PriceType = "paid" | "free" | "swap";

export default function PostListingPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [priceType, setPriceType] = useState<PriceType>("paid");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");
  const [listingType, setListingType] = useState<ListingType>("regular");
  const [images, setImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const categories = ["Electronics", "Furniture", "Books", "Clothing", "Housing", "Home", "Other"];
  const conditions = ["New", "Like New", "Good", "Fair", "For Parts"];

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

  const handleSaveDraft = () => {
    console.log("Saving draft...");
    router.push("/user-profile");
  };

  const handlePublish = () => {
    console.log("Publishing listing...");
    router.push("/marketplace");
  };

  return (
    <div className="min-h-screen bg-[#461D7C]">
      {/* Header - Responsive */}
      <header className="bg-[#3a1364] border-b border-[#5a2d8c] sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/marketplace" className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-[#FDD023]">LSUS</span>
              <span>CONNECT</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-4 text-white text-sm">
              <Link href="/marketplace" className="hover:text-[#FDD023] transition-colors">Marketplace</Link>
              <UserDropdown />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white hover:text-[#FDD023] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Mobile Profile Dropdown */}
            <div className="md:hidden">
              <UserDropdown />
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-[#5a2d8c] pt-4">
              <nav className="flex flex-col gap-3">
                <Link href="/marketplace" className="text-white hover:text-[#FDD023] transition-colors py-2 px-3 rounded hover:bg-[#461D7C]">Marketplace</Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Responsive Grid */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6 lg:gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <h1 className="text-white text-2xl sm:text-3xl font-bold">Create New Listing</h1>

            {/* Title */}
            <div>
              <label className="block text-[#FDD023] font-semibold mb-2 text-sm sm:text-base">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What are you selling?"
                className="w-full h-12 sm:h-14 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white text-base placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[#FDD023] font-semibold mb-2 text-sm sm:text-base">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-12 sm:h-14 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white text-base focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Price Type - Mobile Optimized */}
            <div>
              <label className="block text-[#FDD023] font-semibold mb-2 text-sm sm:text-base">Price</label>
              <div className="flex flex-wrap gap-3 mb-3">
                {(["paid", "free", "swap"] as PriceType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setPriceType(type)}
                    className={`px-4 sm:px-6 py-3 rounded-lg font-semibold transition-colors min-h-[44px] ${
                      priceType === type
                        ? "bg-[#FDD023] text-black"
                        : "bg-[#2a0d44] text-white border border-[#5a2d8c] hover:border-[#FDD023]"
                    }`}
                  >
                    {type === "paid" ? "Paid" : type === "free" ? "Free" : "Swap"}
                  </button>
                ))}
              </div>
              {priceType === "paid" && (
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price"
                  className="w-full h-12 sm:h-14 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white text-base placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
                />
              )}
            </div>

            {/* Condition */}
            <div>
              <label className="block text-[#FDD023] font-semibold mb-2 text-sm sm:text-base">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full h-12 sm:h-14 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white text-base focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
              >
                <option value="">Select condition</option>
                {conditions.map((cond) => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[#FDD023] font-semibold mb-2 text-sm sm:text-base">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your item..."
                rows={6}
                className="w-full px-4 py-3 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white text-base placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20 resize-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-[#FDD023] font-semibold mb-2 text-sm sm:text-base">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., On Campus, Near Student Union"
                className="w-full h-12 sm:h-14 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white text-base placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-[#FDD023] font-semibold mb-2 text-sm sm:text-base">Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., laptop, gaming, barely used"
                className="w-full h-12 sm:h-14 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white text-base placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
              />
            </div>

            {/* Image Upload - Touch Optimized */}
            <div>
              <label className="block text-[#FDD023] font-semibold mb-2 text-sm sm:text-base">Images</label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors ${
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
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FDD023]/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#FDD023]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-white font-semibold mb-1">Click to upload or drag and drop</p>
                  <p className="text-gray-400 text-sm">PNG, JPG up to 10MB</p>
                </label>
              </div>

              {/* Image Previews - Responsive Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-[#2a0d44] border border-[#5a2d8c]">
                      <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800"></div>
                      <button
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
          </div>

          {/* Preview Sidebar - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:block">
            <div className="bg-[#3a1364] rounded-lg p-6 border border-[#5a2d8c] sticky top-24">
              <h3 className="text-white font-bold text-lg mb-4">Preview</h3>
              <div className="bg-[#2a0d44] rounded-lg p-4 border border-[#5a2d8c]">
                <div className="aspect-video bg-gray-700 rounded-lg mb-3"></div>
                <h4 className="text-white font-bold mb-2">{title || "Your listing title"}</h4>
                <p className="text-[#FDD023] font-bold text-xl mb-2">
                  {priceType === "paid" ? `$${price || "0"}` : priceType === "free" ? "Free" : "Swap"}
                </p>
                <p className="text-gray-300 text-sm line-clamp-3">{description || "Your description here..."}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Mobile Optimized */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSaveDraft}
            className="flex-1 min-h-[48px] px-6 py-3 bg-[#2a0d44] text-white font-semibold rounded-lg border border-[#5a2d8c] hover:border-[#FDD023] transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={handlePublish}
            className="flex-1 min-h-[48px] px-6 py-3 bg-[#FDD023] text-black font-bold rounded-lg hover:bg-[#FFE34A] transition-colors"
          >
            Publish Listing
          </button>
        </div>
      </div>
    </div>
  );
}
