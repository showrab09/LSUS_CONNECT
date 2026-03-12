"use client";

import { useState } from "react";

interface HousingListingFormProps {
  formData: {
    title: string;
    description: string;
    location: string;
    images: string[];
    listing_type: string;
    monthly_rent: string;
    location_type: string;
    move_in_date: string;
    lease_length: string;
    bedrooms: string;
    bathrooms: string;
    utilities_included: boolean;
    pets_allowed: boolean;
    pet_details: string;
    gender_preference: string;
    smoking_allowed: boolean;
    quiet_hours: boolean;
  };
  onChange: (field: string, value: any) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  images: string[];
}

export default function HousingListingForm({
  formData,
  onChange,
  onImageUpload,
  onRemoveImage,
  images,
}: HousingListingFormProps) {
  return (
    <div className="space-y-6">
      {/* Listing Type */}
      <div>
        <label className="block text-white text-sm font-semibold mb-2">
          Listing Type <span className="text-red-400">*</span>
        </label>
        <select
          value={formData.listing_type}
          onChange={(e) => onChange("listing_type", e.target.value)}
          required
          className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
        >
          <option value="">Select listing type</option>
          <option value="Looking for roommate">Looking for a roommate</option>
          <option value="Have a room available">Have a room available</option>
          <option value="Sublet">Sublet</option>
          <option value="Short term stay">Short term stay</option>
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="block text-white text-sm font-semibold mb-2">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="e.g., 2BR apartment near LSUS - looking for roommate"
          required
          maxLength={100}
          className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-500 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
        />
        <p className="text-gray-400 text-xs mt-1">
          {formData.title.length}/100 characters
        </p>
      </div>

      {/* Monthly Rent */}
      <div>
        <label className="block text-white text-sm font-semibold mb-2">
          Monthly Rent <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
            $
          </span>
          <input
            type="number"
            value={formData.monthly_rent}
            onChange={(e) => onChange("monthly_rent", e.target.value)}
            placeholder="500"
            required
            min="0"
            step="1"
            className="w-full h-12 pl-8 pr-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-500 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
          />
        </div>
        <p className="text-gray-400 text-xs mt-1">Per month</p>
      </div>

      {/* Location Type */}
      <div>
        <label className="block text-white text-sm font-semibold mb-2">
          Location Type <span className="text-red-400">*</span>
        </label>
        <select
          value={formData.location_type}
          onChange={(e) => onChange("location_type", e.target.value)}
          required
          className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
        >
          <option value="">Select location type</option>
          <option value="On campus">On campus</option>
          <option value="Off campus">Off campus</option>
        </select>
      </div>

      {/* Address/Neighborhood */}
      <div>
        <label className="block text-white text-sm font-semibold mb-2">
          Address or Neighborhood <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => onChange("location", e.target.value)}
          placeholder="e.g., University Park Apartments or Youree Drive area"
          required
          className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-500 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
        />
      </div>

      {/* Move-in Date */}
      <div>
        <label className="block text-white text-sm font-semibold mb-2">
          Move-in Date <span className="text-red-400">*</span>
        </label>
        <input
          type="date"
          value={formData.move_in_date}
          onChange={(e) => onChange("move_in_date", e.target.value)}
          required
          className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
        />
      </div>

      {/* Lease Length */}
      <div>
        <label className="block text-white text-sm font-semibold mb-2">
          Lease Length <span className="text-red-400">*</span>
        </label>
        <select
          value={formData.lease_length}
          onChange={(e) => onChange("lease_length", e.target.value)}
          required
          className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
        >
          <option value="">Select lease length</option>
          <option value="Month to month">Month to month</option>
          <option value="3 months">3 months</option>
          <option value="6 months">6 months</option>
          <option value="12 months">12 months</option>
        </select>
      </div>

      {/* Bedrooms & Bathrooms */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white text-sm font-semibold mb-2">
            Bedrooms <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            value={formData.bedrooms}
            onChange={(e) => onChange("bedrooms", e.target.value)}
            placeholder="2"
            required
            min="1"
            max="10"
            className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-500 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
          />
        </div>

        <div>
          <label className="block text-white text-sm font-semibold mb-2">
            Bathrooms <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            value={formData.bathrooms}
            onChange={(e) => onChange("bathrooms", e.target.value)}
            placeholder="1.5"
            required
            min="1"
            max="10"
            step="0.5"
            className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-500 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
          />
        </div>
      </div>

      {/* Utilities Included Toggle */}
      <div className="bg-[#2a0d44] border border-[#5a2d8c] rounded-lg p-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-white font-semibold">Utilities Included</p>
            <p className="text-gray-400 text-sm">Water, electricity, internet, etc.</p>
          </div>
          <input
            type="checkbox"
            checked={formData.utilities_included}
            onChange={(e) => onChange("utilities_included", e.target.checked)}
            className="w-12 h-6 rounded-full appearance-none bg-[#461D7C] checked:bg-[#FDD023] relative cursor-pointer transition-colors before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-6"
          />
        </label>
      </div>

      {/* Pets Allowed Toggle */}
      <div className="bg-[#2a0d44] border border-[#5a2d8c] rounded-lg p-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-white font-semibold">Pets Allowed</p>
            <p className="text-gray-400 text-sm">Are pets allowed in this space?</p>
          </div>
          <input
            type="checkbox"
            checked={formData.pets_allowed}
            onChange={(e) => onChange("pets_allowed", e.target.checked)}
            className="w-12 h-6 rounded-full appearance-none bg-[#461D7C] checked:bg-[#FDD023] relative cursor-pointer transition-colors before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-6"
          />
        </label>
      </div>

      {/* Pet Details (only if pets allowed) */}
      {formData.pets_allowed && (
        <div>
          <label className="block text-white text-sm font-semibold mb-2">
            Pet Details
          </label>
          <input
            type="text"
            value={formData.pet_details}
            onChange={(e) => onChange("pet_details", e.target.value)}
            placeholder="e.g., Dogs ok, no cats. Max 2 pets."
            className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-500 focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
          />
        </div>
      )}

      {/* Gender Preference */}
      <div>
        <label className="block text-white text-sm font-semibold mb-2">
          Gender Preference
        </label>
        <select
          value={formData.gender_preference}
          onChange={(e) => onChange("gender_preference", e.target.value)}
          className="w-full h-12 px-4 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
        >
          <option value="No preference">No preference</option>
          <option value="Male only">Male only</option>
          <option value="Female only">Female only</option>
        </select>
      </div>

      {/* Smoking Allowed Toggle */}
      <div className="bg-[#2a0d44] border border-[#5a2d8c] rounded-lg p-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-white font-semibold">Smoking Allowed</p>
            <p className="text-gray-400 text-sm">Is smoking permitted?</p>
          </div>
          <input
            type="checkbox"
            checked={formData.smoking_allowed}
            onChange={(e) => onChange("smoking_allowed", e.target.checked)}
            className="w-12 h-6 rounded-full appearance-none bg-[#461D7C] checked:bg-[#FDD023] relative cursor-pointer transition-colors before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-6"
          />
        </label>
      </div>

      {/* Quiet Hours Toggle */}
      <div className="bg-[#2a0d44] border border-[#5a2d8c] rounded-lg p-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-white font-semibold">Quiet Hours</p>
            <p className="text-gray-400 text-sm">Are quiet hours enforced?</p>
          </div>
          <input
            type="checkbox"
            checked={formData.quiet_hours}
            onChange={(e) => onChange("quiet_hours", e.target.checked)}
            className="w-12 h-6 rounded-full appearance-none bg-[#461D7C] checked:bg-[#FDD023] relative cursor-pointer transition-colors before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-6"
          />
        </label>
      </div>

      {/* Description */}
      <div>
        <label className="block text-white text-sm font-semibold mb-2">
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Describe the space, amenities, neighborhood, parking, etc."
          required
          rows={6}
          maxLength={1000}
          className="w-full px-4 py-3 rounded-lg bg-[#2a0d44] border border-[#5a2d8c] text-white placeholder-gray-500 resize-none focus:outline-none focus:border-[#FDD023] focus:ring-2 focus:ring-[#FDD023]/20"
        />
        <p className="text-gray-400 text-xs mt-1">
          {formData.description.length}/1000 characters
        </p>
      </div>

      {/* Images Upload */}
      <div>
        <label className="block text-white text-sm font-semibold mb-2">
          Photos (Optional but recommended)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onImageUpload}
          className="hidden"
          id="housing-image-upload"
        />
        <label
          htmlFor="housing-image-upload"
          className="flex items-center justify-center w-full h-32 border-2 border-dashed border-[#5a2d8c] rounded-lg cursor-pointer hover:border-[#FDD023] transition-colors bg-[#2a0d44]"
        >
          <div className="text-center">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <p className="text-gray-400 text-sm">Click to upload photos</p>
            <p className="text-gray-500 text-xs">Up to 5 images</p>
          </div>
        </label>

        {/* Image Preview */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}