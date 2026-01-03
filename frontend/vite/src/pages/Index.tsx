import { useState } from "react";
import { GTALogo } from "@/components/GTALogo";
import { SearchModeToggle } from "@/components/SearchModeToggle";
import { TextSearchInput } from "@/components/TextSearchInput";
import { ImageSearchInput } from "@/components/ImageSearchInput";
import { ResultCountSlider } from "@/components/ResultCountSlider";
import { SearchResults, type SearchResult } from "@/components/SearchResults";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Index = () => {
  const [searchMode, setSearchMode] = useState<"text" | "image">("text");
  const [textQuery, setTextQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [resultCount, setResultCount] = useState(8);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!API_BASE_URL) {
      toast.error("Missing API base URL. Set VITE_API_BASE_URL in .env.");
      return;
    }
    if (searchMode === "text" && !textQuery.trim()) {
      toast.error("Please enter a description before searching.");
      return;
    }

    if (searchMode === "image" && !selectedImage) {
      toast.error("Please select an image before searching.");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      let response: Response;

      if (searchMode === "text") {
        response = await fetch(`${API_BASE_URL}/search_text`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: textQuery,
            top_k: resultCount,
            dataset_names: null,
          }),
        });
      } else {
        const formData = new FormData();
        if (selectedImage) {
          formData.append("file", selectedImage);
        }

        response = await fetch(
          `${API_BASE_URL}/search_image?top_k=${resultCount}`,
          {
            method: "POST",
            body: formData,
          },
        );
      }

      if (!response.ok) {
        let description = `Request failed with status ${response.status}`;
        try {
          const errorBody = await response.json();
          if (errorBody?.detail) {
            description = errorBody.detail;
          }
        } catch {
          // ignore JSON parsing errors
        }

        toast.error("Search failed", { description });
        setResults([]);
        return;
      }

      const data = await response.json();
      const backendResults = Array.isArray(data.results) ? data.results : [];

      const mappedResults: SearchResult[] = backendResults.map((item: any) => {
        const payload = item.payload ?? {};
        const rawPath: unknown = payload.path;
        const metadataRaw: any = payload.metadata ?? {};
        const metadata: SearchResult["metadata"] =
          metadataRaw && typeof metadataRaw === "object"
            ? metadataRaw
            : undefined;

        let imageUrl = "";
        if (typeof rawPath === "string" && rawPath.length > 0) {
          const filename = rawPath.split(/[/\\]/).pop() ?? "";
          if (filename) {
            imageUrl = `${API_BASE_URL}/images/${encodeURIComponent(filename)}`;
          }
        }

        let title = "";
        if (metadata && typeof metadata === "object") {
          const personId = (metadata as any).person_id;
          const clothesId = (metadata as any).clothes_id;
          if (personId !== undefined && clothesId !== undefined) {
            title = `Person ${personId} (clothes ${clothesId})`;
          }
        }

        if (!title) {
          title = `Result ${item.id}`;
        }

        const scoreValue =
          typeof item.score === "number"
            ? item.score
            : Number(item.score) || 0;

        return {
          id: String(item.id),
          imageUrl,
          title,
          score: scoreValue,
          metadata,
        };
      });

      setResults(mappedResults);

      toast.success(`Found ${mappedResults.length} results`, {
        description:
          searchMode === "text"
            ? `Searched for: "${textQuery}"`
            : "Searched by uploaded image",
      });
    } catch (error) {
      console.error(error);
      toast.error("Search failed", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full-screen background image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/gta-background.png')`,
          imageRendering: "pixelated",
        }}
      />
      {/* Dark overlay for readability */}
      <div className="fixed inset-0 bg-background/70" />

      <main className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col items-center gap-10 md:gap-12">
          {/* Logo */}
          <GTALogo />

          {/* Search Controls */}
          <div className="flex flex-col items-center gap-6 w-full">
            <SearchModeToggle mode={searchMode} onModeChange={setSearchMode} />

            {searchMode === "text" ? (
              <TextSearchInput
                value={textQuery}
                onChange={setTextQuery}
                onSearch={handleSearch}
                isLoading={isLoading}
              />
            ) : (
              <ImageSearchInput
                selectedImage={selectedImage}
                onImageSelect={setSelectedImage}
                onSearch={handleSearch}
                isLoading={isLoading}
              />
            )}

            <ResultCountSlider
              value={resultCount}
              onChange={setResultCount}
              min={1}
              max={10000}
            />
          </div>

          {/* Results Section */}
          {(hasSearched || isLoading) && (
            <div className="w-full mt-8">
              <SearchResults results={results} isLoading={isLoading} />
            </div>
          )}

          {/* Empty state */}
          {!hasSearched && !isLoading && (
            <div className="text-center py-12 animate-fade-in">
              <p className="text-muted-foreground text-lg">
                Enter a description or upload an image to find similar faces
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {[
                  "bald guy with tattoos",
                  "woman in red dress",
                  "man with beard",
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => {
                      setSearchMode("text");
                      setTextQuery(example);
                    }}
                    className="px-4 py-2 bg-card/90 text-sm text-muted-foreground hover:text-foreground hover:bg-primary hover:text-primary-foreground transition-colors pixel-box font-display text-xs"
                  >
                    "{example}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-muted-foreground font-display text-xs pixel-text-shadow">
        <p>*** DEVELOPED BY CodeNaif ***</p>
      </footer>
    </div>
  );
};

export default Index;
