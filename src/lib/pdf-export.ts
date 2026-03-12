import jsPDF from "jspdf";
import { BRAND } from "./brand";

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

export async function downloadTributePDF(
  petName: string,
  years: string,
  story: string,
  photoUrl?: string
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let yPos = 20;

  // Pet photo
  if (photoUrl) {
    const imgData = await loadImageAsDataURL(photoUrl);
    if (imgData) {
      const imgSize = 50;
      doc.addImage(imgData, "JPEG", (pageWidth - imgSize) / 2, yPos, imgSize, imgSize);
      yPos += imgSize + 8;
    }
  }

  // Pet name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(50, 40, 30);
  doc.text(petName, pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  // Years of life
  if (years) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(12);
    doc.setTextColor(120, 100, 80);
    doc.text(years, pageWidth / 2, yPos, { align: "center" });
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
  const lines = doc.splitTextToSize(story, maxWidth);
  for (const line of lines) {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(line, margin, yPos);
    yPos += 6;
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Created with ${BRAND.name}`, pageWidth / 2, 285, { align: "center" });

  doc.save(`${petName}-tribute.pdf`);
}

export function downloadMemorialPDF(
  petName: string,
  years: string,
  story: string
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 25;
  const maxWidth = pageWidth - margin * 2;

  // Decorative border
  doc.setDrawColor(180, 160, 120);
  doc.setLineWidth(1);
  doc.rect(10, 10, pageWidth - 20, doc.internal.pageSize.getHeight() - 20);
  doc.setLineWidth(0.3);
  doc.rect(13, 13, pageWidth - 26, doc.internal.pageSize.getHeight() - 26);

  // Paw symbol
  doc.setFontSize(24);
  doc.text("🐾", pageWidth / 2, 35, { align: "center" });

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(60, 45, 30);
  doc.text(`In Loving Memory`, pageWidth / 2, 50, { align: "center" });

  doc.setFontSize(20);
  doc.text(petName, pageWidth / 2, 62, { align: "center" });

  // Years
  if (years) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(12);
    doc.setTextColor(120, 100, 80);
    doc.text(years, pageWidth / 2, 72, { align: "center" });
  }

  // Divider
  doc.setDrawColor(180, 160, 120);
  doc.setLineWidth(0.5);
  doc.line(margin + 20, 78, pageWidth - margin - 20, 78);

  // Story
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(50);
  const lines = doc.splitTextToSize(story, maxWidth);
  let y = 90;
  for (const line of lines) {
    if (y > 260) break; // Keep single page for memorial
    doc.text(line, margin, y);
    y += 5.5;
  }

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(120, 100, 80);
  doc.text("Forever in our hearts 🕊️", pageWidth / 2, 275, { align: "center" });

  doc.save(`${petName}-memorial.pdf`);
}
