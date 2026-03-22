import jsPDF from "jspdf";
import { BRAND } from "./brand";

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

  // --- Helper: draw warm background on current page ---
  const drawPageBackground = () => {
    doc.setFillColor(250, 247, 242);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
  };

  drawPageBackground();

  let yPos = 40;

  // --- Photos (centered row above title, proportionally scaled) ---
  if (images.length === 1) {
    const maxBox = 42;
    const { w, h } = fitImage(images[0].width, images[0].height, maxBox, maxBox);
    const xOffset = (pageWidth - w) / 2;
    doc.addImage(images[0].dataUrl, "JPEG", xOffset, yPos, w, h);
    yPos += h + 14;
  } else if (images.length >= 2) {
    const maxBox = 36;
    const shown = images.slice(0, 3);
    const totalWidth = shown.length * maxBox + (shown.length - 1) * 6;
    let x = (pageWidth - totalWidth) / 2;
    for (const img of shown) {
      const { w, h } = fitImage(img.width, img.height, maxBox, maxBox);
      const yOffset = yPos + (maxBox - h) / 2;
      doc.addImage(img.dataUrl, "JPEG", x + (maxBox - w) / 2, yOffset, w, h);
      x += maxBox + 6;
    }
    yPos += maxBox + 14;
  }

  // --- Title: Pet name (centered, large) ---
  doc.setFont("times", "bold");
  doc.setFontSize(32);
  doc.setTextColor(55, 42, 28);
  doc.text(sanitizeForPDF(petName), pageWidth / 2, yPos, { align: "center" });
  yPos += 11;

  // --- Years ---
  if (years) {
    doc.setFont("times", "italic");
    doc.setFontSize(12);
    doc.setTextColor(130, 110, 85);
    doc.text(sanitizeForPDF(years), pageWidth / 2, yPos, { align: "center" });
    yPos += 9;
  }

  // --- Subline ---
  doc.setFont("times", "italic");
  doc.setFontSize(9);
  doc.setTextColor(160, 145, 125);
  doc.text("A life remembered in the quiet moments that meant everything.", pageWidth / 2, yPos, { align: "center" });
  yPos += 8;

  // --- Divider under header ---
  const divInset = 30;
  doc.setDrawColor(190, 170, 130);
  doc.setLineWidth(0.35);
  doc.line(margin + divInset, yPos + 2, pageWidth - margin - divInset, yPos + 2);
  yPos += 16;

  // --- Story body: paragraph-aware rendering ---
  doc.setFont("times", "normal");
  doc.setFontSize(11.5);
  doc.setTextColor(50, 45, 38);

  const sanitizedStory = sanitizeForPDF(story);
  const paragraphs = ensureParagraphs(sanitizedStory);
  const lineHeight = 7.6; // ~1.75x at 11.5pt
  const paragraphGap = 8;
  const footerZone = pageHeight - 32;

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    const lines = doc.splitTextToSize(trimmed, maxWidth);
    for (const line of lines) {
      if (yPos > footerZone) {
        doc.addPage();
        drawPageBackground();
        yPos = 34;
        doc.setFont("times", "normal");
        doc.setFontSize(11.5);
        doc.setTextColor(50, 45, 38);
      }
      doc.text(line, margin, yPos);
      yPos += lineHeight;
    }
    yPos += paragraphGap;
  }

  // --- Footer on every page ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const ph = doc.internal.pageSize.getHeight();

    // Divider above footer
    doc.setDrawColor(190, 170, 130);
    doc.setLineWidth(0.25);
    doc.line(margin, ph - 22, pageWidth - margin, ph - 22);

    // Branding
    doc.setFontSize(7);
    doc.setTextColor(170, 165, 155);
    doc.text("Written with love using VellumPet", pageWidth / 2, ph - 16, { align: "center" });

    if (tier === "story") {
      doc.text("vellumpet.com", pageWidth / 2, ph - 12, { align: "center" });
    }
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
function drawPawWatermark(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const cx = pageWidth - 35;
  const cy = pageHeight - 40;

  // ~10% opacity via light gray on warm background
  doc.setFillColor(225, 218, 205);
  doc.setDrawColor(225, 218, 205);

  // Main pad
  doc.circle(cx, cy + 10, 11, "F");

  // Toe pads
  const toes = [
    { dx: -9, dy: -5, r: 5.5 },
    { dx: -3, dy: -12, r: 5 },
    { dx: 3, dy: -12, r: 5 },
    { dx: 9, dy: -5, r: 5.5 },
  ];
  for (const t of toes) {
    doc.circle(cx + t.dx, cy + t.dy, t.r, "F");
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
  const margin = 28;
  const maxWidth = pageWidth - margin * 2;

  const images = await loadImages(photoUrls);

  // Warm paper background
  doc.setFillColor(250, 247, 242);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Decorative border
  doc.setDrawColor(180, 160, 120);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  doc.setLineWidth(0.25);
  doc.rect(13, 13, pageWidth - 26, pageHeight - 26);

  // Paw watermark in bottom-right corner
  drawPawWatermark(doc);

  // Header section
  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.setTextColor(160, 140, 110);
  doc.text("In Loving Memory", pageWidth / 2, 38, { align: "center" });

  doc.setFont("times", "bold");
  doc.setFontSize(32);
  doc.setTextColor(55, 42, 28);
  doc.text(sanitizeForPDF(petName), pageWidth / 2, 55, { align: "center" });

  let headerEndY = 61;

  if (years) {
    doc.setFont("times", "italic");
    doc.setFontSize(12);
    doc.setTextColor(130, 110, 85);
    doc.text(sanitizeForPDF(years), pageWidth / 2, 67, { align: "center" });
    headerEndY = 73;
  }

  // Header divider
  const divInset = 35;
  doc.setDrawColor(190, 170, 130);
  doc.setLineWidth(0.35);
  doc.line(margin + divInset, headerEndY + 4, pageWidth - margin - divInset, headerEndY + 4);

  // Featured photo(s) — proportionally scaled
  let storyStartY = headerEndY + 12;
  if (images.length === 1) {
    const maxBox = 42;
    const { w, h } = fitImage(images[0].width, images[0].height, maxBox, maxBox);
    doc.addImage(images[0].dataUrl, "JPEG", (pageWidth - w) / 2, storyStartY, w, h);
    storyStartY += h + 10;
  } else if (images.length >= 2) {
    const maxBox = 36;
    const shown = images.slice(0, 3);
    const totalWidth = shown.length * maxBox + (shown.length - 1) * 6;
    let x = (pageWidth - totalWidth) / 2;
    for (const img of shown) {
      const { w, h } = fitImage(img.width, img.height, maxBox, maxBox);
      const yOffset = storyStartY + (maxBox - h) / 2; // vertically center within row
      doc.addImage(img.dataUrl, "JPEG", x + (maxBox - w) / 2, yOffset, w, h);
      x += maxBox + 6;
    }
    storyStartY += maxBox + 10;
  } else {
    storyStartY += 4;
  }

  // Story text — paragraph-aware rendering
  doc.setFont("times", "normal");
  doc.setFontSize(11.5);
  doc.setTextColor(50, 45, 38);
  const sanitizedStory = sanitizeForPDF(story);
  const paragraphs = ensureParagraphs(sanitizedStory);
  let y = storyStartY;
  const lineHeight = 7.6; // ~1.75x at 11.5pt
  const paragraphGap = 8;
  const footerZone = 248;

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    const lines = doc.splitTextToSize(trimmed, maxWidth);
    for (const line of lines) {
      if (y > footerZone) {
        // New page with warm background
        doc.addPage();
        doc.setFillColor(250, 247, 242);
        doc.rect(0, 0, pageWidth, pageHeight, "F");
        doc.setDrawColor(180, 160, 120);
        doc.setLineWidth(0.8);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
        doc.setLineWidth(0.25);
        doc.rect(13, 13, pageWidth - 26, pageHeight - 26);
        drawPawWatermark(doc);
        y = 28;
        doc.setFont("times", "normal");
        doc.setFontSize(11.5);
        doc.setTextColor(50, 45, 38);
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }
    y += paragraphGap;
  }

  // Footer divider + branding on every page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Footer divider
    doc.setDrawColor(190, 170, 130);
    doc.setLineWidth(0.35);
    doc.line(margin + divInset, pageHeight - 24, pageWidth - margin - divInset, pageHeight - 24);

    // Footer text
    doc.setFontSize(7);
    doc.setTextColor(170, 165, 155);
    doc.text("Written with love using VellumPet", pageWidth / 2, pageHeight - 18, { align: "center" });

    if (tier === "story") {
      doc.text("vellumpet.com", pageWidth / 2, pageHeight - 14, { align: "center" });
    }
  }

  const filename = `${sanitizeFilename(petName)}-memorial-vellumpet.pdf`;
  doc.save(filename);
}
