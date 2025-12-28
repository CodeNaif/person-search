import { useState, useCallback } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageSearchInputProps {
  onImageSelect: (file: File | null) => void;
  onSearch: () => void;
  selectedImage: File | null;
  isLoading?: boolean;
}

export const ImageSearchInput = ({ 
  onImageSelect, 
  onSearch, 
  selectedImage,
  isLoading 
}: ImageSearchInputProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (file.type.startsWith("image/")) {
      onImageSelect(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const clearImage = () => {
    onImageSelect(null);
    setPreview(null);
  };

  return (
    <div className="w-full max-w-2xl animate-slide-up">
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative flex flex-col items-center justify-center h-48 pixel-input rounded-lg transition-all duration-200 cursor-pointer",
            isDragging && "ring-4 ring-[hsl(var(--pixel-cyan))]"
          )}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Upload className="w-12 h-12 text-[hsl(var(--pixel-cyan))] mb-4" />
          <p className="text-foreground font-display text-xs text-center">DROP IMAGE HERE</p>
          <p className="text-muted-foreground text-sm mt-2">
            or click to upload
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="relative pixel-input overflow-hidden rounded-lg h-48 flex items-center justify-center bg-secondary/40">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain"
              style={{ imageRendering: "auto" }}
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 p-2 pixel-btn pixel-btn-orange"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={onSearch}
            disabled={isLoading}
            className="pixel-image-button pixel-image-button-search shrink-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"
            style={{ backgroundImage: "url(/images/search.png)" }}
            aria-label="Search by image"
          >
            <span className="sr-only">
              {isLoading ? "Searching by image" : "Search by image"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
