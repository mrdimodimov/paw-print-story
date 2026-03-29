import jsPDF from "jspdf";
import { BRAND } from "./brand";
import logoIconUrl from "@/assets/logo-icon.png";

/**
 * Normalize text for safe PDF rendering and export.
 * - Strips emojis and unsupported Unicode symbols
 * - Converts smart/curly quotes to straight quotes
 * - Converts en/em dashes to hyphens
 * - Normalizes other special punctuation
 */
export function normalizeTributeText(text: string): string {
  return text
    // Remove emojis and miscellaneous symbols (broad Unicode ranges)
    .replace(/[\u{1F600}-\u{1F64F}]/gu, "")   // emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, "")   // misc symbols & pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, "")   // transport & map
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, "")   // supplemental symbols
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, "")   // chess symbols
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, "")   // symbols extended-A
    .replace(/[\u{2600}-\u{26FF}]/gu, "")      // misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, "")      // dingbats
    .replace(/[\u{FE00}-\u{FE0F}]/gu, "")      // variation selectors
    .replace(/[\u{200D}]/gu, "")               // zero-width joiner
    // Smart quotes → straight quotes
    .replace(/[\u2018\u2019\u201A]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    // Dashes → hyphen
    .replace(/[\u2013\u2014]/g, "-")
    // Ellipsis → three dots
    .replace(/\u2026/g, "...")
    // Non-breaking space → regular space
    .replace(/\u00A0/g, " ")
    // Trim leftover whitespace from emoji removal
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Internal alias for backward compat within this file
const sanitizeForPDF = normalizeTributeText;

/**
 * Ensure tribute text always has proper paragraph breaks.
 * If the text already contains double-newlines, split on those.
 * Otherwise, split into sentences and group every 2–3 into paragraphs.
 */
export function ensureParagraphs(text: string): string[] {
  // Normalize whitespace first
  let cleaned = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  // If already has paragraph breaks, use them
  if (/\n\s*\n/.test(cleaned)) {
    return cleaned
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }

  // Otherwise, split into sentences and group 2–3 per paragraph
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length <= 3) return [sentences.join(" ")];

  const paragraphs: string[] = [];
  const groupSize = sentences.length <= 6 ? 2 : 3;
  for (let i = 0; i < sentences.length; i += groupSize) {
    paragraphs.push(sentences.slice(i, i + groupSize).join(" "));
  }
  return paragraphs;
}

async function loadImageAsDataURL(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

interface LoadedImage {
  dataUrl: string;
  width: number;
  height: number;
}

async function loadImageWithDimensions(url: string): Promise<LoadedImage | null> {
  const dataUrl = await loadImageAsDataURL(url);
  if (!dataUrl) return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ dataUrl, width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

async function loadImages(urls: string[]): Promise<LoadedImage[]> {
  const results = await Promise.all(urls.map(loadImageWithDimensions));
  return results.filter((r): r is LoadedImage => r !== null);
}

/**
 * Fit an image proportionally inside a max box, never stretching.
 */
function fitImage(imgW: number, imgH: number, maxW: number, maxH: number) {
  const ratio = Math.min(maxW / imgW, maxH / imgH, 1);
  return { w: imgW * ratio, h: imgH * ratio };
}

export async function downloadTributePDF(
  petName: string,
  years: string,
  story: string,
  photoUrls: string[] = [],
  tier: string = "story"
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 28;
  const maxWidth = pageWidth - margin * 2;

  const images = await loadImages(photoUrls);
  const safeName = sanitizeForPDF(petName);
  const safeYears = years ? sanitizeForPDF(years) : "";
  const headerLabel = safeYears ? `${safeName} · ${safeYears}` : safeName;

  // --- Helper: draw warm background on current page ---
  const drawPageBackground = () => {
    doc.setFillColor(240, 235, 228);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
  };

  // --- Helper: draw story page header ---
  const drawStoryPageHeader = () => {
    doc.setFont("times", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(158, 148, 135);
    doc.text(headerLabel, pageWidth / 2, 22, { align: "center" });
    // Subtle divider below header
    doc.setDrawColor(195, 185, 170);
    doc.setLineWidth(0.2);
    doc.line(margin + 20, 26, pageWidth - margin - 20, 26);
  };

  // --- Helper: draw footer on a page ---
  const drawFooter = (pageNum: number, total: number) => {
    const ph = doc.internal.pageSize.getHeight();
    doc.setDrawColor(180, 168, 148);
    doc.setLineWidth(0.25);
    doc.line(margin, ph - 22, pageWidth - margin, ph - 22);

    doc.setFont("times", "italic");
    doc.setFontSize(7);
    doc.setTextColor(158, 148, 135);
    doc.text("Written with love using VellumPet", pageWidth / 2, ph - 16, { align: "center" });

    if (tier === "story") {
      doc.text("vellumpet.com", pageWidth / 2, ph - 12, { align: "center" });
    }
  };

  // ============================================================
  // PAGE 1: COVER PAGE
  // ============================================================
  drawPageBackground();

  // --- Double decorative border ---
  doc.setDrawColor(168, 155, 135);
  doc.setLineWidth(0.7);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);
  doc.setLineWidth(0.2);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // Vertically center content: image + name + years + quote
  const hasPhoto = images.length >= 1;
  const photoSize = 70;
  const coverContentHeight =
    (hasPhoto ? photoSize + 16 : 0) + 14 + (safeYears ? 10 : 0) + 30;
  let coverY = Math.max(50, (pageHeight - coverContentHeight) / 2 - 10);

  // --- "In Loving Memory" pre-title ---
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(148, 135, 118);
  doc.text("In Loving Memory", pageWidth / 2, coverY, { align: "center" });
  coverY += 16;

  // --- Large centered pet photo ---
  if (hasPhoto) {
    const { w, h } = fitImage(images[0].width, images[0].height, photoSize, photoSize);
    const imgX = (pageWidth - w) / 2;
    doc.addImage(images[0].dataUrl, "JPEG", imgX, coverY, w, h);
    coverY += h + 16;
  }

  // --- Pet name (large serif) ---
  doc.setFont("times", "bold");
  doc.setFontSize(36);
  doc.setTextColor(61, 48, 40);
  doc.text(safeName, pageWidth / 2, coverY, { align: "center" });
  coverY += 14;

  // --- Years ---
  if (safeYears) {
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.setTextColor(120, 105, 88);
    doc.text(safeYears, pageWidth / 2, coverY, { align: "center" });
    coverY += 10;
  }

  // --- Ornamental divider ---
  coverY += 6;
  const divInset = 50;
  doc.setDrawColor(180, 168, 148);
  doc.setLineWidth(0.35);
  doc.line(divInset, coverY, pageWidth - divInset, coverY);
  coverY += 14;

  // --- Quote ---
  doc.setFont("times", "italic");
  doc.setFontSize(10);
  doc.setTextColor(135, 122, 105);
  doc.text(
    "A life remembered in the quiet moments that meant everything.",
    pageWidth / 2,
    coverY,
    { align: "center" }
  );

  // Cover page footer
  drawFooter(1, 1);

  // ============================================================
  // PAGE 2+: STORY PAGES
  // ============================================================
  doc.addPage();
  drawPageBackground();
  drawStoryPageHeader();

  let yPos = 36;

  // --- Story body: paragraph-aware rendering ---
  doc.setFont("times", "normal");
  doc.setFontSize(11.5);
  doc.setTextColor(74, 63, 53);

  const sanitizedStory = sanitizeForPDF(story);
  const paragraphs = ensureParagraphs(sanitizedStory);
  const lineHeight = 8.0; // ~1.7x at 11.5pt for improved readability
  const paragraphGap = 9;
  const footerZone = pageHeight - 32;

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    const lines = doc.splitTextToSize(trimmed, maxWidth);
    for (const line of lines) {
      if (yPos > footerZone) {
        doc.addPage();
        drawPageBackground();
        drawStoryPageHeader();
        yPos = 36;
        doc.setFont("times", "normal");
        doc.setFontSize(11.5);
        doc.setTextColor(74, 63, 53);
      }
      doc.text(line, margin, yPos);
      yPos += lineHeight;
    }
    yPos += paragraphGap;
  }

  // --- Apply footer to all pages ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(i, totalPages);
  }

  const filename = `${sanitizeFilename(petName)}-tribute-vellumpet.pdf`;
  doc.save(filename);
}

/**
 * Draw a faint paw-print watermark centered on the page.
 * Uses simple circles to form a stylized paw shape at very low opacity.
 */
/**
 * Draw a faint paw-print watermark in the bottom-right corner.
 */
async function drawLogoWatermark(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  try {
    const imgData = await loadImageAsDataURL(logoIconUrl);
    if (imgData) {
      const size = 28;
      const x = pageWidth - size - 10;
      const y = pageHeight - size - 10;
      doc.saveGraphicsState();
      // @ts-ignore - jsPDF supports GState for opacity
      doc.setGState(new (jsPDF as any).GState({ opacity: 0.12 }));
      doc.addImage(imgData, "PNG", x, y, size, size);
      doc.restoreGraphicsState();
    }
  } catch {
    // Silently skip watermark if image fails to load
  }
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Extract the most emotionally resonant excerpt from a story.
 * Picks the strongest single paragraph (by length sweet-spot and sentiment cues),
 * then trims to a target character count at a sentence boundary.
 */
function extractBestExcerpt(story: string, maxChars = 320): string {
  const paragraphs = ensureParagraphs(sanitizeForPDF(story));
  if (paragraphs.length === 0) return "";

  // Score paragraphs: prefer mid-length ones with emotional words
  const emotionalCues = /\b(love|heart|miss|remember|always|forever|warmth|gentle|joy|comfort|home|safe|peace)\b/gi;
  const scored = paragraphs.map((p, i) => {
    const len = p.length;
    // Sweet spot: 100–400 chars
    const lengthScore = len >= 100 && len <= 400 ? 2 : len > 400 ? 1 : 0;
    const emotionScore = (p.match(emotionalCues) || []).length;
    // Slight preference for earlier paragraphs (not first which is often intro)
    const positionScore = i === 0 ? 0.5 : i <= 2 ? 1 : 0.5;
    return { text: p, score: lengthScore + emotionScore + positionScore };
  });

  scored.sort((a, b) => b.score - a.score);
  let best = scored[0].text;

  // Trim at sentence boundary if too long
  if (best.length > maxChars) {
    const sentences = best.split(/(?<=[.!?])\s+/);
    let trimmed = "";
    for (const s of sentences) {
      if ((trimmed + " " + s).trim().length > maxChars) break;
      trimmed = (trimmed + " " + s).trim();
    }
    best = trimmed || sentences[0];
  }

  return best;
}

export async function downloadMemorialPDF(
  petName: string,
  years: string,
  story: string,
  photoUrls: string[] = [],
  tier: string = "story"
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const images = await loadImages(photoUrls);
  const safeName = sanitizeForPDF(petName);
  const safeYears = years ? sanitizeForPDF(years) : "";

  // --- Warm paper background ---
  doc.setFillColor(245, 241, 235);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // --- Elegant thin border with generous inset ---
  const borderInset = 18;
  doc.setDrawColor(195, 185, 170);
  doc.setLineWidth(0.5);
  doc.rect(borderInset, borderInset, pageWidth - borderInset * 2, pageHeight - borderInset * 2);

  // --- Layout: vertically center all content ---
  const photoSize = 82; // large rounded square
  const hasPhoto = images.length >= 1;
  const photoRadius = 6;

  // Calculate total content height for vertical centering
  const nameSize = 34;
  const yearsSize = 13;
  const quoteSize = 11;
  const contentHeight =
    (hasPhoto ? photoSize + 28 : 0) + // photo + gap
    nameSize * 0.35 + 12 + // name height + gap
    (safeYears ? yearsSize * 0.35 + 8 : 0) + // years + gap
    6 + // divider + gaps
    quoteSize * 0.35 * 3; // quote (up to 2 lines)

  let y = Math.max(40, (pageHeight - contentHeight) / 2 - 15);

  // --- Large centered photo (rounded square) ---
  if (hasPhoto) {
    const { w, h } = fitImage(images[0].width, images[0].height, photoSize, photoSize);
    const imgX = (pageWidth - w) / 2;

    // Draw rounded rectangle clip for the image
    doc.addImage(images[0].dataUrl, "JPEG", imgX, y, w, h);

    // Draw rounded border on top of image
    doc.setDrawColor(210, 200, 185);
    doc.setLineWidth(0.6);
    doc.roundedRect(imgX, y, w, h, r, r, "S");

    y += h + 28;
  }

  // --- Pet name (large serif, centered) ---
  doc.setFont("times", "bold");
  doc.setFontSize(nameSize);
  doc.setTextColor(51, 40, 33);
  doc.text(safeName, pageWidth / 2, y, { align: "center" });
  y += 14;

  // --- Years (lighter, smaller) ---
  if (safeYears) {
    doc.setFont("times", "italic");
    doc.setFontSize(yearsSize);
    doc.setTextColor(140, 125, 108);
    doc.text(safeYears, pageWidth / 2, y, { align: "center" });
    y += 14;
  }

  // --- Subtle ornamental divider ---
  const divWidth = 50;
  doc.setDrawColor(195, 185, 170);
  doc.setLineWidth(0.3);
  doc.line(pageWidth / 2 - divWidth / 2, y, pageWidth / 2 + divWidth / 2, y);
  y += 20;

  // --- Short emotional quote (max 2 lines, italic) ---
  const quote = extractBestExcerpt(story, 160);
  const quoteMaxWidth = pageWidth - 70;
  doc.setFont("times", "italic");
  doc.setFontSize(quoteSize);
  doc.setTextColor(100, 88, 72);
  const quoteLines = doc.splitTextToSize(quote, quoteMaxWidth);
  // Limit to 2 lines max
  const displayLines = quoteLines.slice(0, 2);
  const quoteLineHeight = 7;
  for (let i = 0; i < displayLines.length; i++) {
    doc.text(displayLines[i], pageWidth / 2, y + i * quoteLineHeight, { align: "center" });
  }

  // --- Minimal footer ---
  doc.setFont("times", "normal");
  doc.setFontSize(7);
  doc.setTextColor(175, 165, 150);
  doc.text("vellumpet.com", pageWidth / 2, pageHeight - 24, { align: "center" });

  const filename = `${sanitizeFilename(petName)}-memorial-vellumpet.pdf`;
  doc.save(filename);
}
