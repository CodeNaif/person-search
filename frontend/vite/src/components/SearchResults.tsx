import { SearchResultCard } from "./SearchResultCard";

export interface SearchResultMetadata {
  person_id?: string | number;
  clothes_id?: string | number;
  location_id?: string | number;
  frame_id?: string | number;
  [key: string]: unknown;
}

export interface SearchResult {
  id: string;
  imageUrl: string;
  title: string;
  score: number;
  metadata?: SearchResultMetadata;
}

interface SearchResultsProps {
  results: SearchResult[];
  isLoading?: boolean;
}

export const SearchResults = ({ results, isLoading }: SearchResultsProps) => {
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-secondary animate-pulse gta-border"
            />
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <h2 className="font-display text-sm text-white mb-6 flex items-center gap-3 pixel-text-shadow">
        <span className="text-white">★ RESULTS ★</span>
        <span className="text-muted-foreground text-base">
          ({results.length} found)
        </span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {results.map((result, index) => (
          <SearchResultCard
            key={result.id}
            imageUrl={result.imageUrl}
            title={result.title}
            score={result.score}
            index={index}
            metadata={result.metadata}
          />
        ))}
      </div>
    </div>
  );
};

