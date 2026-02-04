"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * LSUS Connect - Post Listing Page
 * Brand Compliant with LSUS Brand Guidelines (January 2026)
 */

type ListingType = "regular" | "featured";
type PriceType = "paid" | "free" | "swap";

export default function PostListingPage() {
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

  const categories = [
    "Electronics",
    "Furniture",
    "Books",
    "Clothing",
    "Housing",
    "Home",
    "Other"
  ];

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

  const handleDragLeave = () => {
    setIsDragging(false);
  };

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
    // TODO: Save to backend as draft
    
    // Redirect to user profile
    window.location.href = "/user-profile";
  };

  const handlePublish = () => {
    console.log("Publishing listing...");
    // TODO: Publish to backend
    
    // Redirect to home page
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#461D7C]">
      {/* Header */}
      <header className="bg-[#3a1364] border-b border-[#5a2d8c]">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-[#FDD023]">LSUS</span>
              <span>CONNECT</span>
            </Link>

            {/* User Avatar */}
            <Link href="/user-profile" className="w-10 h-10 rounded-full bg-[#2a0d44] border-2 border-[#FDD023] overflow-hidden block">
              <div className="w-full h-full bg-gray-600"></div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-[1fr,400px] gap-8">
          {/* Left Side - Form */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-[#FDD023] font-semibold mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What are you selling?"
                className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[#FDD023] font-semibold mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-[#FDD023] font-semibold mb-2">Price</label>
              <div className="flex gap-4 mb-3">
                <button
                  onClick={() => setPriceType("paid")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    priceType === "paid"
                      ? "bg-[#FDD023] text-black"
                      : "bg-[#2a0d44] text-white border border-[#5a2d8c] hover:border-[#FDD023]"
                  }`}
                >
                  $ Price
                </button>
                <button
                  onClick={() => setPriceType("free")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    priceType === "free"
                      ? "bg-[#FDD023] text-black"
                      : "bg-[#2a0d44] text-white border border-[#5a2d8c] hover:border-[#FDD023]"
                  }`}
                >
                  Free
                </button>
                <button
                  onClick={() => setPriceType("swap")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    priceType === "swap"
                      ? "bg-[#FDD023] text-black"
                      : "bg-[#2a0d44] text-white border border-[#5a2d8c] hover:border-[#FDD023]"
                  }`}
                >
                  Swap
                </button>
              </div>
              {priceType === "paid" && (
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white">$</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-12 pl-8 pr-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-[#FDD023] font-semibold mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your item..."
                rows={8}
                className="w-full px-4 py-3 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20 resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-[#FDD023] font-semibold mb-2">Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Add tags separated by commas"
                className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
              />
            </div>

            {/* Condition & Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#FDD023] font-semibold mb-2">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
                >
                  <option value="">Select condition</option>
                  {conditions.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#FDD023] font-semibold mb-2">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State"
                  className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-400 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
                />
              </div>
            </div>
          </div>

          {/* Right Side - Photo Upload & Options */}
          <div className="space-y-6">
            {/* Photo Uploader */}
            <div>
              <label className="block text-[#FDD023] font-semibold mb-2">Photo uploader</label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? "border-[#FDD023] bg-[#2a0d44]"
                    : "border-[#5a2d8c] bg-[#3a1364]"
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-4">
                  <svg
                    className="w-16 h-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <div className="text-white">
                    <p className="mb-2">Drag & drop images here</p>
                    <p className="text-sm text-gray-400 mb-4">or</p>
                    <label className="px-6 py-2 bg-[#FDD023] text-black font-semibold rounded-lg cursor-pointer hover:bg-[#FFE34A] transition-colors inline-block">
                      Browse Files
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Preview Thumbnails */}
              {images.length > 0 && (
                <div className="mt-4">
                  <p className="text-white text-sm mb-3">Preview thumbnails</p>
                  <div className="grid grid-cols-4 gap-3">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border border-[#5a2d8c]"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Listing Type */}
            <div className="bg-[#3a1364] rounded-lg p-4 border border-[#5a2d8c]">
              <label className="block text-[#FDD023] font-semibold mb-3">Listing type</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setListingType("regular")}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                    listingType === "regular"
                      ? "bg-[#FDD023] text-black"
                      : "bg-[#2a0d44] text-white border border-[#5a2d8c]"
                  }`}
                >
                  Regular
                </button>
                <button
                  onClick={() => setListingType("featured")}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                    listingType === "featured"
                      ? "bg-[#FDD023] text-black"
                      : "bg-[#2a0d44] text-white border border-[#5a2d8c]"
                  }`}
                >
                  Featured
                </button>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-[#3a1364] rounded-lg p-4 border border-[#5a2d8c]">
              <h3 className="text-[#FDD023] font-semibold mb-3">Safety tips</h3>
              <ul className="text-white text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#FDD023] mt-1">•</span>
                  <span>Meet in a public place for exchanges</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FDD023] mt-1">•</span>
                  <span>Check the item before purchasing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FDD023] mt-1">•</span>
                  <span>Don't share personal information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FDD023] mt-1">•</span>
                  <span>Report suspicious activity</span>
                </li>
              </ul>
            </div>

            {/* Review Summary */}
            <div className="bg-[#3a1364] rounded-lg p-4 border border-[#5a2d8c]">
              <h3 className="text-[#FDD023] font-semibold mb-4">Review summary</h3>
              <div className="text-white text-sm space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 w-20">Title:</span>
                  <span className="flex-1">{title || "Not set"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 w-20">Category:</span>
                  <span className="flex-1">{category || "Not set"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 w-20">Price:</span>
                  <span className="flex-1">
                    {priceType === "free"
                      ? "Free"
                      : priceType === "swap"
                      ? "Swap"
                      : price
                      ? `$${price}`
                      : "Not set"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 w-20">Photos:</span>
                  <span className="flex-1">{images.length} uploaded</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Link
            href="/user-profile"
            className="px-8 py-3 bg-[#2a0d44] text-white font-semibold rounded-lg border-2 border-[#5a2d8c] hover:bg-[#3a1364] hover:border-[#FDD023] transition-colors inline-block"
          >
            Cancel
          </Link>
          <button
            onClick={handleSaveDraft}
            className="px-8 py-3 bg-[#2a0d44] text-white font-semibold rounded-lg border-2 border-[#FDD023] hover:bg-[#3a1364] transition-colors"
          >
            Save draft
          </button>
          <button
            onClick={handlePublish}
            className="px-8 py-3 bg-[#FDD023] text-black font-semibold rounded-lg hover:bg-[#FFE34A] transition-colors"
          >
            Publish listing
          </button>
        </div>
      </div>
    </div>
  );
}
