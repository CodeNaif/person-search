import { useState, useRef, useCallback, useEffect } from "react";

interface ResultCountSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const ResultCountSlider = ({ 
  value, 
  onChange, 
  min = 1, 
  max = 10000 
}: ResultCountSliderProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateValue = useCallback((clientX: number) => {
    if (!trackRef.current) return value;
    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(min + percent * (max - min));
  }, [min, max, value]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      onChange(calculateValue(e.clientX));
    }
  }, [isDragging, calculateValue, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    onChange(calculateValue(e.clientX));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    onChange(calculateValue(e.touches[0].clientX));
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      onChange(calculateValue(e.touches[0].clientX));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const percent = ((value - min) / (max - min)) * 100;
  const clampValue = (nextValue: number) =>
    Math.min(max, Math.max(min, nextValue));

  return (
    <div className="w-full max-w-md p-4 pixel-input rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <label className="font-display text-xs text-foreground pixel-text-shadow">
          RESULTS
        </label>
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (!Number.isNaN(next)) {
              onChange(clampValue(next));
            }
          }}
          onBlur={(event) => {
            const next = Number(event.target.value);
            if (!Number.isNaN(next)) {
              onChange(clampValue(next));
            }
          }}
          className="w-32 bg-transparent text-right font-display text-xl text-[hsl(var(--pixel-yellow))] pixel-text-shadow focus-visible:outline-none tabular-nums"
          aria-label="Results count"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-10 h-10 pixel-btn pixel-btn-orange text-foreground font-display text-lg flex items-center justify-center"
        >
          -
        </button>
        <div 
          ref={trackRef}
          className="flex-1 h-6 pixel-slider-track relative cursor-pointer select-none touch-pan-x"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="absolute inset-y-1 left-1 pixel-slider-fill transition-none"
            style={{ width: `calc(${percent}% - 8px)` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-6 h-8 pixel-slider-thumb"
            style={{ left: `calc(${percent}% - 12px)` }}
          />
        </div>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-10 h-10 pixel-btn pixel-btn-green text-foreground font-display text-lg flex items-center justify-center"
        >
          +
        </button>
      </div>
      <div className="flex justify-between mt-2 text-xs text-muted-foreground font-display">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};
