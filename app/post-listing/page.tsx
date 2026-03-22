"use client";

import AppLayout from "@/components/AppLayout";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UserDropdown from "@/components/UserDropdown";
import HousingListingForm from "@/components/HousingListingForm";

/**
 * LSUS Connect - Post Listing Page
 * Dynamically switches between standard and housing forms
 */

type PriceType = "PAID" | "FREE" | "SWAP";

export default function PostListingPage() {
  const router = useRouter();
  
  // Standard listing fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [priceType, setPriceType] = useState<PriceType>("PAID");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<string[]>([]);
  
  // Housing-specific fields
  const [housingData, setHousingData] = useState({
    listing_type: "",
    monthly_rent: "",
    location_type: "",
    move_in_date: "",
    lease_length: "",
    bedrooms: "",
    bathrooms: "",
    utilities_included: false,
    pets_allowed: false,
    pet_details: "",
    gender_preference: "No preference",
    smoking_allowed: false,
    quiet_hours: false,
  });

  // UI states
  const [isDragging, setIsDragging] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const categories = ["Electronics", "Furniture", "Books", "Clothing", "Housing", "Home", "Other"];
  const conditions = ["New", "Like New", "Good", "Fair", "For Parts"];

  // Check if housing category is selected
  const isHousingCategory = category === "Housing";

  // Format price as currency
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setPrice(value);
  };

  const formatCurrencyDisplay = (value: string) => {
    if (!value) return '';
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    return `$${num.toFixed(2)}`;
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle image upload with base64 conversion
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Limit to 5 images total
    if (images.length + files.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    setIsUploadingImages(true);
    try {
      const base64Images = await Promise.all(
        Array.from(files).map(file => fileToBase64(file))
      );
      setImages([...images, ...base64Images]);
    } catch (error) {
      console.error("Error converting images:", error);
      setError("Failed to upload images. Please try again.");
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    // Limit to 5 images total
    if (images.length + files.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    setIsUploadingImages(true);
    try {
      const base64Images = await Promise.all(
        Array.from(files).map(file => fileToBase64(file))
      );
      setImages([...images, ...base64Images]);
    } catch (error) {
      console.error("Error converting images:", error);
      setError("Failed to upload images. Please try again.");
    } finally {
      setIsUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Handle housing form field changes
  const handleHousingFieldChange = (field: string, value: any) => {
    if (field === "title") {
      setTitle(value);
    } else if (field === "description") {
      setDescription(value);
    } else if (field === "location") {
      setLocation(value);
    } else {
      setHousingData({ ...housingData, [field]: value });
    }
  };

  const handlePublish = async () => {
    console.log("=== PUBLISH CLICKED ===");
    
    // Standard validation
    if (!title.trim()) {
      setError("Title is required");
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

    // Category-specific validation
    if (isHousingCategory) {
      if (!housingData.listing_type) {
        setError("Listing type is required");
        return;
      }
      if (!housingData.monthly_rent) {
        setError("Monthly rent is required");
        return;
      }
      if (!housingData.location_type) {
        setError("Location type is required");
        return;
      }
      if (!housingData.move_in_date) {
        setError("Move-in date is required");
        return;
      }
      if (!housingData.lease_length) {
        setError("Lease length is required");
        return;
      }
      if (!housingData.bedrooms) {
        setError("Number of bedrooms is required");
        return;
      }
      if (!housingData.bathrooms) {
        setError("Number of bathrooms is required");
        return;
      }
    } else {
      // Standard listing validation
      if (priceType === "PAID" && !price) {
        setError("Price is required for paid items");
        return;
      }
      if (!condition) {
        setError("Condition is required");
        return;
      }
    }

    setError("");
    setIsSubmitting(true);

    try {
      // Prepare listing data
      const listingData: any = {
        title: title.trim(),
        description: description.trim(),
        category: category,
        location: location.trim(),
        images: images,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        status: "ACTIVE"
      };

      // Add category-specific fields
      if (isHousingCategory) {
        // Housing listing
        listingData.price = parseFloat(housingData.monthly_rent);
        listingData.price_type = "PAID";
        listingData.listing_type = housingData.listing_type;
        listingData.monthly_rent = parseFloat(housingData.monthly_rent);
        listingData.location_type = housingData.location_type;
        listingData.move_in_date = housingData.move_in_date;
        listingData.lease_length = housingData.lease_length;
        listingData.bedrooms = parseInt(housingData.bedrooms);
        listingData.bathrooms = parseFloat(housingData.bathrooms);
        listingData.utilities_included = housingData.utilities_included;
        listingData.pets_allowed = housingData.pets_allowed;
        listingData.pet_details = housingData.pet_details || null;
        listingData.gender_preference = housingData.gender_preference;
        listingData.smoking_allowed = housingData.smoking_allowed;
        listingData.quiet_hours = housingData.quiet_hours;
      } else {
        // Standard listing
        listingData.price = priceType === "PAID" ? parseFloat(price) : 0;
        listingData.price_type = priceType;
        listingData.condition = condition;
      }

      console.log("Sending data:", {
        ...listingData,
        images: `[${images.length} images]`
      });

      // Call API
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(listingData),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        router.push('/home');
      } else {
        setError(data.error || "Failed to create listing");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error creating listing:", error);
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    console.log("Draft saving not implemented yet");
    router.push("/user-profile");
  };

  return (
    <AppLayout>

      {/* Main Content - Responsive Grid */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Form Section */}
          <div className="space-y-3">
            <h1 className="text-white text-xl font-bold mb-3">
              {isHousingCategory ? "Post Housing Listing" : "Create New Listing"}
            </h1>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl p-4">
                {error}
              </div>
            )}

            {/* Category Selection (Always shown first) */}
            <div>
              <label className="block text-[#F5A623] font-semibold mb-1 text-sm">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-4 rounded-xl bg-[#2A0F5A] border border-white/10 text-white text-sm focus:outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Conditional Form Rendering */}
            {isHousingCategory ? (
              // Housing Form
              <HousingListingForm
                formData={{
                  title,
                  description,
                  location,
                  images,
                  ...housingData,
                }}
                onChange={handleHousingFieldChange}
                onImageUpload={handleImageUpload}
                onRemoveImage={removeImage}
                images={images}
              />
            ) : (
              // Standard Listing Form
              <>
                {/* Title */}
                <div>
                  <label className="block text-[#F5A623] font-semibold mb-1 text-sm">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What are you selling?"
                    className="w-full h-10 px-4 rounded-xl bg-[#2A0F5A] border border-white/10 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
                  />
                </div>

                {/* Price Type */}
                <div>
                  <label className="block text-[#F5A623] font-semibold mb-1 text-sm">Price *</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(["PAID", "FREE", "SWAP"] as PriceType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setPriceType(type)}
                        className={`px-4 py-2 text-sm rounded-xl font-semibold transition-colors ${
                          priceType === type
                            ? "bg-[#F5A623] text-black"
                            : "bg-[#2A0F5A] text-white border border-white/10 hover:border-[#F5A623]"
                        }`}
                      >
                        {type === "PAID" ? "For Sale" : type === "FREE" ? "Free" : "Trade/Swap"}
                      </button>
                    ))}
                  </div>
                  {priceType === "PAID" && (
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-sm">$</span>
                      <input
                        type="text"
                        value={price}
                        onChange={handlePriceChange}
                        placeholder="0.00"
                        className="w-full h-10 pl-8 pr-4 rounded-xl bg-[#2A0F5A] border border-white/10 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
                      />
                      {price && (
                        <div className="mt-1 text-xs text-[#C4B0E0]">
                          Preview: <span className="text-[#F5A623] font-semibold">{formatCurrencyDisplay(price)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-[#F5A623] font-semibold mb-1 text-sm">Condition *</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full h-10 px-4 rounded-xl bg-[#2A0F5A] border border-white/10 text-white text-sm focus:outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
                  >
                    <option value="">Select condition</option>
                    {conditions.map((cond) => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[#F5A623] font-semibold mb-1 text-sm">Description *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your item..."
                    rows={4}
                    className="w-full px-4 py-2 rounded-xl bg-[#2A0F5A] border border-white/10 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20 resize-none"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-[#F5A623] font-semibold mb-1 text-sm">Location *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., On Campus, Near Student Union"
                    className="w-full h-10 px-4 rounded-xl bg-[#2A0F5A] border border-white/10 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-[#F5A623] font-semibold mb-1 text-sm">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., laptop, gaming, barely used"
                    className="w-full h-10 px-4 rounded-xl bg-[#2A0F5A] border border-white/10 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-[#F5A623] font-semibold mb-1 text-sm">Images</label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                      isDragging ? "border-[#FDD023] bg-[#F5A623]/10" : "border-white/10 bg-[#2A0F5A]"
                    }`}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={isUploadingImages}
                    />
                    <label htmlFor="image-upload" className={`cursor-pointer ${isUploadingImages ? 'opacity-50' : ''}`}>
                      <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#F5A623]/20 flex items-center justify-center">
                        {isUploadingImages ? (
                          <div className="w-6 h-6 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-6 h-6 text-[#F5A623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        )}
                      </div>
                      <p className="text-white font-semibold text-sm mb-1">
                        {isUploadingImages ? "Uploading..." : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-[#8B72BE] text-xs">PNG, JPG up to 10MB (Max 5 images)</p>
                    </label>
                  </div>

                  {/* Image Previews */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-[#2A0F5A] border border-white/10">
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
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="flex-1 h-11 px-6 bg-[#2A0F5A] text-white font-semibold text-sm rounded-xl border border-white/10 hover:border-[#F5A623] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={isSubmitting || isUploadingImages}
              className="flex-1 h-11 px-6 bg-[#F5A623] text-black font-bold text-sm rounded-xl hover:bg-[#FFD166] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Publishing..." : isUploadingImages ? "Processing Images..." : "Publish Listing"}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}