/**
 * Utility to create a cropped image blob from canvas.
 */

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type AspectRatioOption = "1:1" | "4:5" | "16:9";

export const ASPECT_RATIOS: { label: string; value: AspectRatioOption; ratio: number }[] = [
  { label: "Square (1:1)", value: "1:1", ratio: 1 },
  { label: "Portrait (4:5)", value: "4:5", ratio: 4 / 5 },
  { label: "Landscape (16:9)", value: "16:9", ratio: 16 / 9 },
];

/**
 * Suggest an aspect ratio based on image natural dimensions.
 */
export function suggestAspectRatio(width: number, height: number): AspectRatioOption {
  const ratio = width / height;
  if (ratio > 1.4) return "16:9";
  if (ratio < 0.9) return "4:5";
  return "1:1";
}

/**
 * Create a cropped image File from a source URL and pixel crop area.
 */
export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: CropArea,
  outputType = "image/jpeg",
  quality = 0.92,
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Canvas is empty"));
        const ext = outputType === "image/png" ? "png" : "jpg";
        resolve(new File([blob], `cropped.${ext}`, { type: outputType }));
      },
      outputType,
      quality,
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
