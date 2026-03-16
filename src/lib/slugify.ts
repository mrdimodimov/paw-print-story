/**
 * Generate an SEO-friendly slug from pet name and pet type.
 * Format: {pet-name}-{pet-type}
 * If a duplicate exists, append a short random id: {pet-name}-{pet-type}-{4hex}
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function generateMemorialSlug(petName: string, petType: string): string {
  const base = slugify(`${petName} ${petType}`);
  return base || "memorial";
}

export function generateMemorialSlugWithSuffix(petName: string, petType: string): string {
  const base = generateMemorialSlug(petName, petType);
  const suffix = Math.random().toString(16).slice(2, 6);
  return `${base}-${suffix}`;
}
