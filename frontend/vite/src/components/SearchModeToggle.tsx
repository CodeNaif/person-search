import { Type, Image } from "lucide-react";
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
          "flex items-center gap-2 px-5 py-3 pixel-btn text-xs transition-all duration-200",
          mode === "text"
            ? "pixel-btn-cyan text-foreground"
            : "pixel-btn-gray text-muted-foreground"
        )}
      >
        <Type className="w-4 h-4" />
        <span>TEXT</span>
      </button>
      <button
        onClick={() => onModeChange("image")}
        className={cn(
          "flex items-center gap-2 px-5 py-3 pixel-btn text-xs transition-all duration-200",
          mode === "image"
            ? "pixel-btn-purple text-foreground"
            : "pixel-btn-gray text-muted-foreground"
        )}
      >
        <Image className="w-4 h-4" />
        <span>IMAGE</span>
      </button>
    </div>
  );
};
