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
 * Extract a short title (max 6 words) from a full title string.
 */
function shortTitle(title: string, maxWords = 6): string {
  return title.split(/\s+/).slice(0, maxWords).join(" ");
}

/**
 * Parse years_of_life to extract birth and death years.
 * Accepts formats like "2012-2026", "2012 - 2026", "2012–2026"
 */
function parseYears(yearsOfLife: string): { birth: string; death: string } | null {
  const match = yearsOfLife.match(/(\d{4})\s*[-–—]\s*(\d{4})/);
  if (match) return { birth: match[1], death: match[2] };
  return null;
}

/**
 * Generate a personal, emotional memorial slug.
 *
 * Priority:
 * 1. {pet-name}-{birth}-{death}     e.g. bella-2012-2026
 * 2. {pet-name}-{short-title}       e.g. bella-the-dog-that-loved-sunsets
 * 3. {pet-name}                     e.g. bella
 */
export function generateMemorialSlug(
  petName: string,
  options?: { yearsOfLife?: string; title?: string }
): string {
  const name = slugify(petName);
  if (!name) return "memorial";

  // Priority 1: name + birth-death years
  if (options?.yearsOfLife) {
    const years = parseYears(options.yearsOfLife);
    if (years) {
      return `${name}-${years.birth}-${years.death}`;
    }
  }

  // Priority 2: name + short title
  if (options?.title) {
    const titleSlug = slugify(shortTitle(options.title));
    if (titleSlug && titleSlug !== name) {
      return `${name}-${titleSlug}`;
    }
  }

  // Priority 3: name only
  return name;
}

/**
 * Fallback: pet name + pet type (e.g. "bella-golden-retriever")
 */
export function generateMemorialSlugWithType(petName: string, petType: string): string {
  return slugify(`${petName} ${petType}`) || "memorial";
}

/**
 * Final fallback: append short hex suffix (e.g. "bella-2012-2026-4f82")
 */
export function generateMemorialSlugWithSuffix(baseSlug: string): string {
  const suffix = Math.random().toString(16).slice(2, 6);
  return `${baseSlug}-${suffix}`;
}
