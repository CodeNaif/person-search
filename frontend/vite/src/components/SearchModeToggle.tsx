import { cn } from "@/lib/utils";

interface SearchModeToggleProps {
  mode: "text" | "image";
  onModeChange: (mode: "text" | "image") => void;
}

export const SearchModeToggle = ({ mode, onModeChange }: SearchModeToggleProps) => {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onModeChange("text")}
        className={cn(
          "pixel-image-button pixel-image-button-toggle shrink-0 transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded",
          mode === "text"
            ? "scale-[1.03]"
            : "opacity-80 hover:opacity-100"
        )}
        style={{ backgroundImage: "url(/images/text.png)" }}
        aria-label="Text search mode"
      >
      </button>
      <button
        onClick={() => onModeChange("image")}
        className={cn(
          "pixel-image-button pixel-image-button-toggle shrink-0 transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded",
          mode === "image"
            ? "scale-[1.03]"
            : "opacity-80 hover:opacity-100"
        )}
        style={{ backgroundImage: "url(/images/image.png)" }}
        aria-label="Image search mode"
      >
      </button>
    </div>
  );
};
