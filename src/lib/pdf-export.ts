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
  const margin = 38; // generous inner margins for breathing room
  const maxWidth = Math.min(pageWidth - margin * 2, 140);

  const images = await loadImages(photoUrls);
  const safeName = sanitizeForPDF(petName);
  const safeYears = years ? sanitizeForPDF(years) : "";
  const headerLabel = safeYears ? `${safeName} · ${safeYears}` : safeName;

  // --- Helper: soft warm background (no borders, no frames) ---
  const drawPageBackground = () => {
    doc.setFillColor(252, 250, 246); // very light warm tone
    doc.rect(0, 0, pageWidth, pageHeight, "F");
  };

  // --- Helper: subtle story page header ---
  const drawStoryPageHeader = () => {
    doc.setFont("times", "italic");
    doc.setFontSize(8);
    doc.setTextColor(178, 168, 155);
    doc.text(headerLabel, pageWidth / 2, 24, { align: "center" });
  };

  // --- Helper: minimal footer ---
  const drawFooter = (pageNum: number, total: number) => {
    const ph = doc.internal.pageSize.getHeight();
    doc.setFont("times", "italic");
    doc.setFontSize(7);
    doc.setTextColor(168, 158, 145);
    doc.text("Written with love using VellumPet", pageWidth / 2, ph - 16, { align: "center" });
    if (tier === "story") {
      doc.text("vellumpet.com", pageWidth / 2, ph - 12, { align: "center" });
    }
  };

  // ============================================================
  // PAGE 1: COVER PAGE (clean, spacious, no border)
  // ============================================================
  drawPageBackground();

  // Vertically center content
  const hasPhoto = images.length >= 1;
  const photoSize = 70;
  const coverContentHeight =
    (hasPhoto ? photoSize + 16 : 0) + 18 + (safeYears ? 12 : 0) + 30;
  let coverY = Math.max(55, (pageHeight - coverContentHeight) / 2 - 10);

  // --- Pet name (dominant, large serif, strong contrast) ---
  doc.setFont("times", "bold");
  doc.setFontSize(42);
  doc.setTextColor(32, 24, 18);
  doc.text(safeName, pageWidth / 2, coverY, { align: "center" });
  coverY += 18;

  // --- Years ---
  if (safeYears) {
    doc.setFont("times", "italic");
    doc.setFontSize(14);
    doc.setTextColor(110, 95, 78);
    doc.text(safeYears, pageWidth / 2, coverY, { align: "center" });
    coverY += 20;
  } else {
    coverY += 10;
  }

  // --- Large centered pet photo ---
  if (hasPhoto) {
    const { w, h } = fitImage(images[0].width, images[0].height, photoSize, photoSize);
    const imgX = (pageWidth - w) / 2;
    doc.addImage(images[0].dataUrl, "JPEG", imgX, coverY, w, h);
    coverY += h + 28;
  }

  // --- Quote (subtle, soft) ---
  doc.setFont("times", "italic");
  doc.setFontSize(10);
  doc.setTextColor(148, 135, 118);
  doc.text(
    "A life remembered in the quiet moments that meant everything.",
    pageWidth / 2,
    coverY,
    { align: "center" }
  );

  drawFooter(1, 1);

  // ============================================================
  // PAGE 2+: STORY PAGES (immersive, no borders)
  // ============================================================
  doc.addPage();
  drawPageBackground();
  drawStoryPageHeader();

  const storyTopMargin = 42;
  const textX = (pageWidth - maxWidth) / 2;
  let yPos = storyTopMargin;

  // --- Story body ---
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.setTextColor(52, 44, 36);

  const sanitizedStory = sanitizeForPDF(story);
  const paragraphs = ensureParagraphs(sanitizedStory);
  const lineHeight = 7.4; // ~1.7 line-height at 11pt
  const paragraphGap = 11;
  const footerZone = pageHeight - 36;

  // Pre-calculate paragraph blocks
  const paraBlocks: { lines: string[]; height: number }[] = [];
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    const lines = doc.splitTextToSize(trimmed, maxWidth) as string[];
    const height = lines.length * lineHeight;
    paraBlocks.push({ lines, height });
  }

  const availablePerPage = footerZone - storyTopMargin;

  // Simulate to find orphan last page
  let simY = 0;
  let lastBreakContent = 0;
  for (let p = 0; p < paraBlocks.length; p++) {
    const blockH = paraBlocks[p].height + (p < paraBlocks.length - 1 ? paragraphGap : 0);
    if (simY + paraBlocks[p].height > availablePerPage) {
      lastBreakContent = simY;
      simY = 0;
    }
    simY += blockH;
  }
  const lastPageContent = simY;

  const effectiveFooterZone =
    lastPageContent > 0 && lastPageContent <= 4 * lineHeight && lastBreakContent > 0
      ? footerZone + lastPageContent + paragraphGap
      : footerZone;

  // Render paragraphs
  for (let p = 0; p < paraBlocks.length; p++) {
    const block = paraBlocks[p];

    if (
      yPos > storyTopMargin &&
      yPos + block.height > effectiveFooterZone &&
      block.height <= availablePerPage
    ) {
      doc.addPage();
      drawPageBackground();
      drawStoryPageHeader();
      yPos = storyTopMargin;
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.setTextColor(52, 44, 36);
    }

    for (let l = 0; l < block.lines.length; l++) {
      if (yPos > effectiveFooterZone) {
        doc.addPage();
        drawPageBackground();
        drawStoryPageHeader();
        yPos = storyTopMargin;
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        doc.setTextColor(52, 44, 36);
      }
      doc.text(block.lines[l], textX, yPos);
      yPos += lineHeight;
    }

    if (p < paraBlocks.length - 1) {
      yPos += paragraphGap;
    }
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

  // --- Pure white outer background ---
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // --- Soft inner frame container ---
  const frameMarginX = 22;
  const frameMarginY = 20;
  const frameW = pageWidth - frameMarginX * 2;
  const frameH = pageHeight - frameMarginY * 2;

  // Slightly off-white inner background
  doc.setFillColor(250, 250, 248);
  doc.rect(frameMarginX, frameMarginY, frameW, frameH, "F");

  // Very subtle border
  doc.setDrawColor(215, 210, 200);
  doc.setLineWidth(0.35);
  doc.rect(frameMarginX, frameMarginY, frameW, frameH);

  // --- Layout ---
  const photoSize = 88;
  const hasPhoto = images.length >= 1;
  const nameSize = 36;
  const yearsSize = 13;
  const quoteSize = 11;
  const quoteMaxWidth = pageWidth - 70;

  // Calculate content height for vertical centering
  const contentHeight =
    (hasPhoto ? photoSize + 24 : 0) +
    nameSize * 0.35 + 16 +
    (safeYears ? yearsSize * 0.35 + 14 : 0) +
    quoteSize * 0.35 * 3;

  let y = Math.max(45, (pageHeight - contentHeight) / 2 - 10);

  // --- Photo (slightly larger, natural placement) ---
  if (hasPhoto) {
    const { w, h } = fitImage(images[0].width, images[0].height, photoSize, photoSize);
    const imgX = (pageWidth - w) / 2;
    doc.addImage(images[0].dataUrl, "JPEG", imgX, y, w, h);
    y += h + 24;
  }

  // --- Pet name ---
  doc.setFont("times", "bold");
  doc.setFontSize(nameSize);
  doc.setTextColor(42, 32, 25);
  doc.text(safeName, pageWidth / 2, y, { align: "center" });
  y += 16;

  // --- Years ---
  if (safeYears) {
    doc.setFont("times", "italic");
    doc.setFontSize(yearsSize);
    doc.setTextColor(130, 115, 98);
    doc.text(safeYears, pageWidth / 2, y, { align: "center" });
    y += 18;
  } else {
    y += 8;
  }

  // --- Short emotional excerpt (max 2 lines) ---
  const quote = extractBestExcerpt(story, 160);
  doc.setFont("times", "italic");
  doc.setFontSize(quoteSize);
  doc.setTextColor(100, 88, 72);
  const quoteLines = doc.splitTextToSize(quote, quoteMaxWidth);
  const displayLines = quoteLines.slice(0, 2);
  const quoteLineHeight = 7.5;
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
