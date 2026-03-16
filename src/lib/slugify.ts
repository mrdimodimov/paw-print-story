/**
 * Generate an SEO-friendly slug.
 * - lowercase, trim, spaces → "-", remove non-alphanumeric except "-"
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

/**
 * Generate memorial slug: pet name only (e.g. "bella")
 */
export function generateMemorialSlug(petName: string): string {
  return slugify(petName) || "memorial";
}

/**
 * Fallback: pet name + pet type (e.g. "bella-golden-retriever")
 */
export function generateMemorialSlugWithType(petName: string, petType: string): string {
  return slugify(`${petName} ${petType}`) || "memorial";
}

/**
 * Final fallback: pet name + pet type + short hex (e.g. "bella-golden-retriever-4f82")
 */
export function generateMemorialSlugWithSuffix(petName: string, petType: string): string {
  const base = generateMemorialSlugWithType(petName, petType);
  const suffix = Math.random().toString(16).slice(2, 6);
  return `${base}-${suffix}`;
}
