import { useState, useCallback, useEffect } from "react";
import Cropper, { type Area } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, Crop } from "lucide-react";
import {
  ASPECT_RATIOS,
  suggestAspectRatio,
  getCroppedImageBlob,
  type AspectRatioOption,
  type CropArea,
} from "@/lib/crop-utils";

interface ImageCropModalProps {
  open: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
}

export default function ImageCropModal({
  open,
  imageSrc,
  onClose,
  onCropComplete,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [aspect, setAspect] = useState<AspectRatioOption>("1:1");
  const [saving, setSaving] = useState(false);

  // Auto-suggest aspect ratio when image loads
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.onload = () => {
      setAspect(suggestAspectRatio(img.naturalWidth, img.naturalHeight));
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setSaving(false);
    }
  }, [open]);

  const onCropDone = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setSaving(true);
    try {
      const file = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      onCropComplete(file);
    } catch {
      // fallback: just close
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const currentRatio = ASPECT_RATIOS.find((a) => a.value === aspect)?.ratio ?? 1;

  if (!imageSrc) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg gap-4 p-0 sm:rounded-2xl">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2 font-display">
            <Crop className="h-5 w-5 text-primary" />
            Frame Your Photo
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Adjust your photo to make sure your pet is perfectly framed.
          </DialogDescription>
        </DialogHeader>

        {/* Crop area */}
        <div className="relative mx-4 h-[320px] overflow-hidden rounded-xl bg-muted sm:h-[360px]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={currentRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropDone}
            cropShape={aspect === "1:1" ? "round" : "rect"}
            showGrid={false}
            style={{
              containerStyle: { borderRadius: "0.75rem" },
            }}
          />
        </div>

        {/* Controls */}
        <div className="space-y-4 px-6">
          {/* Aspect ratio picker */}
          <div className="flex items-center gap-2">
            {ASPECT_RATIOS.map((ar) => (
              <button
                key={ar.value}
                type="button"
                onClick={() => setAspect(ar.value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  aspect === ar.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50"
                }`}
              >
                {ar.label}
              </button>
            ))}
          </div>

          {/* Zoom slider */}
          <div className="flex items-center gap-3">
            <ZoomOut className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.05}
              onValueChange={([v]) => setZoom(v)}
              className="flex-1"
            />
            <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>
        </div>

        <DialogFooter className="gap-2 px-6 pb-6">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !croppedAreaPixels}>
            {saving ? "Saving…" : "Use This Photo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
