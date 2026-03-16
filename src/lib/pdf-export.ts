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

async function loadImages(urls: string[]): Promise<string[]> {
  const results = await Promise.all(urls.map(loadImageAsDataURL));
  return results.filter((r): r is string => r !== null);
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
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let yPos = 20;

  const images = await loadImages(photoUrls);

  // Photo layout based on count
  if (images.length === 1) {
    // Single centered photo
    const imgSize = 50;
    doc.addImage(images[0], "JPEG", (pageWidth - imgSize) / 2, yPos, imgSize, imgSize);
    yPos += imgSize + 8;
  } else if (images.length >= 2 && images.length <= 3) {
    // Row of 2-3 photos
    const imgSize = 45;
    const totalWidth = images.length * imgSize + (images.length - 1) * 6;
    let x = (pageWidth - totalWidth) / 2;
    for (const img of images) {
      doc.addImage(img, "JPEG", x, yPos, imgSize, imgSize);
      x += imgSize + 6;
    }
    yPos += imgSize + 8;
  } else if (images.length >= 4) {
    // Gallery: 3 on top row, rest below
    const imgSize = 40;
    const topRow = images.slice(0, 3);
    const bottomRow = images.slice(3);

    let totalWidth = topRow.length * imgSize + (topRow.length - 1) * 5;
    let x = (pageWidth - totalWidth) / 2;
    for (const img of topRow) {
      doc.addImage(img, "JPEG", x, yPos, imgSize, imgSize);
      x += imgSize + 5;
    }
    yPos += imgSize + 5;

    if (bottomRow.length > 0) {
      totalWidth = bottomRow.length * imgSize + (bottomRow.length - 1) * 5;
      x = (pageWidth - totalWidth) / 2;
      for (const img of bottomRow) {
        doc.addImage(img, "JPEG", x, yPos, imgSize, imgSize);
        x += imgSize + 5;
      }
      yPos += imgSize + 5;
    }
    yPos += 3;
  }

  // Pet name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(50, 40, 30);
  doc.text(sanitizeForPDF(petName), pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  // Years of life
  if (years) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(12);
    doc.setTextColor(120, 100, 80);
    doc.text(sanitizeForPDF(years), pageWidth / 2, yPos, { align: "center" });
    yPos += 8;
  }

  // Divider
  doc.setDrawColor(180, 160, 120);
  doc.setLineWidth(0.5);
  doc.line(margin + 20, yPos, pageWidth - margin - 20, yPos);
  yPos += 10;

  // Tribute text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(40);
  const lines = doc.splitTextToSize(sanitizeForPDF(story), maxWidth);
  for (const line of lines) {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(line, margin, yPos);
    yPos += 6;
  }

  // Watermark on each page (basic tier only)
  if (tier === "story") {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      const ph = doc.internal.pageSize.getHeight();
      doc.setFontSize(7);
      doc.setTextColor(180, 180, 180);
      doc.text(`Created with ${BRAND.name}`, pageWidth - margin, ph - 14, { align: "right" });
      doc.text("vellumpet.com", pageWidth - margin, ph - 9, { align: "right" });
    }
  }

  doc.save(`${petName}-tribute.pdf`);
}

/**
 * Draw a faint paw-print watermark centered on the page.
 * Uses simple circles to form a stylized paw shape at very low opacity.
 */
function drawPawWatermark(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const cx = pageWidth / 2;
  const cy = pageHeight / 2 - 10;

  // Very faint fill — 4% opacity approximation via light gray
  doc.setFillColor(230, 225, 215);
  doc.setDrawColor(230, 225, 215);

  // Main pad (ellipse approximated with circle)
  doc.circle(cx, cy + 12, 14, "F");

  // Toe pads
  const toes = [
    { dx: -11, dy: -6, r: 6.5 },
    { dx: -4, dy: -14, r: 6 },
    { dx: 4, dy: -14, r: 6 },
    { dx: 11, dy: -6, r: 6.5 },
  ];
  for (const t of toes) {
    doc.circle(cx + t.dx, cy + t.dy, t.r, "F");
  }
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
  const margin = 25;
  const maxWidth = pageWidth - margin * 2;

  const images = await loadImages(photoUrls);

  // Decorative border
  doc.setDrawColor(180, 160, 120);
  doc.setLineWidth(1);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  doc.setLineWidth(0.3);
  doc.rect(13, 13, pageWidth - 26, pageHeight - 26);

  // Paw watermark behind text
  drawPawWatermark(doc);

  // Paw symbol at top
  doc.setFontSize(24);
  doc.setTextColor(180, 160, 120);
  doc.text("*", pageWidth / 2, 35, { align: "center" });

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(60, 45, 30);
  doc.text("In Loving Memory", pageWidth / 2, 50, { align: "center" });

  doc.setFontSize(20);
  doc.text(sanitizeForPDF(petName), pageWidth / 2, 62, { align: "center" });

  // Years
  if (years) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(12);
    doc.setTextColor(120, 100, 80);
    doc.text(sanitizeForPDF(years), pageWidth / 2, 72, { align: "center" });
  }

  // Divider after header
  doc.setDrawColor(180, 160, 120);
  doc.setLineWidth(0.4);
  const divInset = 30;
  const dividerY = years ? 78 : 70;
  doc.line(margin + divInset, dividerY, pageWidth - margin - divInset, dividerY);

  // Featured photo(s)
  let storyStartY = dividerY + 8;
  if (images.length === 1) {
    const imgSize = 40;
    doc.addImage(images[0], "JPEG", (pageWidth - imgSize) / 2, storyStartY, imgSize, imgSize);
    storyStartY += imgSize + 8;
  } else if (images.length >= 2) {
    const imgSize = 35;
    const shown = images.slice(0, 3);
    const totalWidth = shown.length * imgSize + (shown.length - 1) * 5;
    let x = (pageWidth - totalWidth) / 2;
    for (const img of shown) {
      doc.addImage(img, "JPEG", x, storyStartY, imgSize, imgSize);
      x += imgSize + 5;
    }
    storyStartY += imgSize + 8;
  } else {
    storyStartY += 4;
  }

  // Story text with improved typography
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(45, 40, 35);
  const sanitizedStory = sanitizeForPDF(story);
  const paragraphs = sanitizedStory.split(/\n\s*\n/);
  let y = storyStartY;
  const lineHeight = 6.2;
  const paragraphGap = 4;
  const maxY = 255;

  for (const para of paragraphs) {
    const lines = doc.splitTextToSize(para.trim(), maxWidth);
    for (const line of lines) {
      if (y > maxY) break;
      doc.text(line, margin, y);
      y += lineHeight;
    }
    if (y > maxY) break;
    y += paragraphGap;
  }

  // Bottom divider
  doc.setDrawColor(180, 160, 120);
  doc.setLineWidth(0.4);
  doc.line(margin + divInset, 265, pageWidth - margin - divInset, 265);

  // Footer branding
  doc.setFontSize(7);
  doc.setTextColor(170, 165, 155);
  doc.text(`Created with ${BRAND.name}`, pageWidth / 2, pageHeight - 16, { align: "center" });

  // Tier-specific watermark
  if (tier === "story") {
    doc.text("vellumpet.com", pageWidth / 2, pageHeight - 12, { align: "center" });
  }

  doc.save(`${petName}-memorial.pdf`);
}
