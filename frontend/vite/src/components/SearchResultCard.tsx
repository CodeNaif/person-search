interface SearchResultCardProps {
  imageUrl: string;
  title: string;
  score: number;
  index: number;
}

export const SearchResultCard = ({ imageUrl, title, score, index }: SearchResultCardProps) => {
  return (
    <div 
      className="group relative overflow-hidden bg-card pixel-box transition-all duration-200 hover:scale-[1.02] animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          style={{ imageRendering: 'auto' }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
        <h3 className="font-display text-xs text-foreground truncate pixel-text-shadow">{title}</h3>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-2 bg-secondary pixel-box overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${score * 100}%` }}
            />
          </div>
          <span className="text-sm font-display text-primary">
            {(score * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      {/* Always visible score badge */}
      <div className="absolute top-2 right-2 px-2 py-1 bg-background/90 text-xs font-display text-primary pixel-box">
        {(score * 100).toFixed(0)}%
      </div>
    </div>
  );
};
