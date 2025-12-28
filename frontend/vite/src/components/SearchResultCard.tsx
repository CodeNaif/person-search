import { useState } from "react";

import type { SearchResultMetadata } from "./SearchResults";

interface SearchResultCardProps {
  imageUrl: string;
  title: string;
  score: number;
  index: number;
  metadata?: SearchResultMetadata;
}

export const SearchResultCard = ({
  imageUrl,
  title,
  score,
  index,
  metadata,
}: SearchResultCardProps) => {
  const personId = metadata?.person_id;
  const clothesId = metadata?.clothes_id;
  const locationId = metadata?.location_id;
  const frameId = metadata?.frame_id;
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);

  return (
    <div
      className="group relative overflow-hidden bg-card pixel-box transition-all duration-200 hover:scale-[1.02] animate-slide-up flex flex-col"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="h-72 w-full overflow-hidden bg-secondary/40 flex items-center justify-center">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          style={{ imageRendering: "auto" }}
        />
      </div>

      <div className="absolute top-2 right-2 px-2 py-1 bg-background/90 text-xs font-display text-primary pixel-box">
        {(score * 100).toFixed(0)}%
      </div>

      <div className="mt-auto px-3 py-2 bg-background/90 text-xs text-white flex flex-col gap-1">
        <button
          type="button"
          onClick={() => setIsMetadataOpen((open) => !open)}
          className="flex items-center gap-2 text-left hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-expanded={isMetadataOpen}
        >
          <span className="text-primary">{isMetadataOpen ? "v" : ">"}</span>
          <span className="font-display tracking-widest">METADATA</span>
        </button>
        {isMetadataOpen ? (
          <div className="mt-1 space-y-1">
            {personId !== undefined && <div>Person: {personId}</div>}
            {clothesId !== undefined && <div>Clothes: {clothesId}</div>}
            {locationId !== undefined && <div>Location: {locationId}</div>}
            {frameId !== undefined && <div>Frame: {frameId}</div>}
          </div>
        ) : null}
      </div>
    </div>
  );
};
