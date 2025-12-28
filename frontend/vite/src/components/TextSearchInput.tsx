import { Search } from "lucide-react";
import searchButton from "../../images/search.png";

interface TextSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

export const TextSearchInput = ({ value, onChange, onSearch, isLoading }: TextSearchInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) {
      onSearch();
    }
  };

  return (
    <div className="w-full max-w-2xl animate-slide-up">
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        <div className="flex-1 flex items-center pixel-input">
          <Search className="w-5 h-5 text-muted-foreground ml-4" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe a person..."
            className="flex-1 h-14 px-3 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
          />
        </div>
        <button
          onClick={onSearch}
          disabled={!value.trim() || isLoading}
          className="pixel-image-button pixel-image-button-search shrink-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"
          style={{ backgroundImage: `url(${searchButton})` }}
          aria-label="Search"
        >
          <span className="sr-only">{isLoading ? "Searching" : "Search"}</span>
        </button>
      </div>
    </div>
  );
};
