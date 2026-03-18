/**
 * lib/validate.ts
 *
 * Reusable input validation and sanitization for all API routes.
 * Protects against XSS, oversized inputs, and malformed data.
 */

// ── Sanitization ─────────────────────────────────────────────────────────────

/** Strip HTML tags and dangerous characters to prevent XSS */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")           // strip HTML tags
    .replace(/javascript:/gi, "")       // strip javascript: protocol
    .replace(/on\w+\s*=/gi, "")        // strip event handlers like onclick=
    .trim();
}

/** Sanitize but preserve line breaks for multi-line content */
export function sanitizeMultiline(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim();
}

// ── Validators ───────────────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

export function isValidPassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) return { valid: false, error: "Password must be at least 8 characters." };
  if (password.length > 128) return { valid: false, error: "Password must be under 128 characters." };
  return { valid: true };
}

export function isValidName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length < 2) return { valid: false, error: "Name must be at least 2 characters." };
  if (name.trim().length > 100) return { valid: false, error: "Name must be under 100 characters." };
  return { valid: true };
}

export function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// ── Length limits ─────────────────────────────────────────────────────────────

export const LIMITS = {
  title: 150,
  description: 5000,
  postContent: 1000,
  comment: 500,
  location: 200,
  bio: 500,
  message: 2000,
  tag: 50,
  maxTags: 10,
  maxImages: 10,
  maxImageSizeBytes: 2 * 1024 * 1024, // 2MB per image as base64
};

export function validateLength(
  value: string,
  field: string,
  max: number,
  min = 1
): { valid: boolean; error?: string } {
  if (!value || value.trim().length < min) {
    return { valid: false, error: `${field} is required.` };
  }
  if (value.trim().length > max) {
    return { valid: false, error: `${field} must be under ${max} characters.` };
  }
  return { valid: true };
}

// ── Image validation ──────────────────────────────────────────────────────────

/** Validate base64 image array — check count and size */
export function validateImages(images: any[]): { valid: boolean; error?: string } {
  if (!Array.isArray(images)) return { valid: false, error: "Images must be an array." };
  if (images.length > LIMITS.maxImages) {
    return { valid: false, error: `Maximum ${LIMITS.maxImages} images allowed.` };
  }
  for (const img of images) {
    if (typeof img !== "string") return { valid: false, error: "Invalid image format." };
    // Check it's a valid base64 data URL or a valid URL
    if (!img.startsWith("data:image/") && !isValidUrl(img)) {
      return { valid: false, error: "Invalid image format." };
    }
    // Check base64 size (base64 string length * 0.75 ≈ actual bytes)
    if (img.startsWith("data:image/")) {
      const base64Data = img.split(",")[1] || "";
      const approximateBytes = base64Data.length * 0.75;
      if (approximateBytes > LIMITS.maxImageSizeBytes) {
        return { valid: false, error: "Each image must be under 2MB." };
      }
    }
  }
  return { valid: true };
}

// ── Price validation ──────────────────────────────────────────────────────────

export function validatePrice(price: any): { valid: boolean; error?: string } {
  if (price === undefined || price === null) return { valid: true }; // optional
  const num = parseFloat(price);
  if (isNaN(num)) return { valid: false, error: "Price must be a number." };
  if (num < 0) return { valid: false, error: "Price cannot be negative." };
  if (num > 1000000) return { valid: false, error: "Price cannot exceed $1,000,000." };
  return { valid: true };
}

// ── UUID validation ───────────────────────────────────────────────────────────

export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// ── Combined validators for common objects ────────────────────────────────────

export function validateSignup(body: any): { valid: boolean; error?: string } {
  const { email, password, fullName } = body;

  if (!email) return { valid: false, error: "Email is required." };
  if (!isValidEmail(email)) return { valid: false, error: "Please enter a valid email address." };

  if (!fullName) return { valid: false, error: "Full name is required." };
  const nameCheck = isValidName(fullName);
  if (!nameCheck.valid) return nameCheck;

  if (!password) return { valid: false, error: "Password is required." };
  const passCheck = isValidPassword(password);
  if (!passCheck.valid) return passCheck;

  return { valid: true };
}

export function validateListing(body: any): { valid: boolean; error?: string } {
  const { title, description, category, images, price } = body;

  const titleCheck = validateLength(title, "Title", LIMITS.title);
  if (!titleCheck.valid) return titleCheck;

  const descCheck = validateLength(description, "Description", LIMITS.description);
  if (!descCheck.valid) return descCheck;

  if (!category) return { valid: false, error: "Category is required." };

  const priceCheck = validatePrice(price);
  if (!priceCheck.valid) return priceCheck;

  if (images) {
    const imgCheck = validateImages(images);
    if (!imgCheck.valid) return imgCheck;
  }

  return { valid: true };
}

export function validatePost(body: any): { valid: boolean; error?: string } {
  const { content, images } = body;

  const contentCheck = validateLength(content, "Post content", LIMITS.postContent);
  if (!contentCheck.valid) return contentCheck;

  if (images) {
    const imgCheck = validateImages(images);
    if (!imgCheck.valid) return imgCheck;
  }

  return { valid: true };
}

export function validateComment(body: any): { valid: boolean; error?: string } {
  const { content } = body;
  return validateLength(content, "Comment", LIMITS.comment);
}

export function validateMessage(body: any): { valid: boolean; error?: string } {
  const { message } = body;
  if (!message) return { valid: true }; // message is optional when starting a conversation
  return validateLength(message, "Message", LIMITS.message);
}
