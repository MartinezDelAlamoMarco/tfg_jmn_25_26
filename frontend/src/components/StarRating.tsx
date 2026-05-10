import { useState } from "react";
import { Star } from "lucide-react";

type Props = {
  value: number;
  size?: number;
  editable?: boolean;
  onChange?: (val: number) => void;
};

export default function StarRating({ value, size = 18, editable = false, onChange }: Props) {
  const [hover, setHover] = useState<number | null>(null);

  const displayActive = (i: number) => {
    if (hover !== null) return i <= hover;
    return i <= value;
  };

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((i) => {
        const isActive = displayActive(i);
        return editable ? (
          <button
            key={i}
            type="button"
            onClick={() => onChange && onChange(i === value ? 0 : i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className="p-1 transition-transform active:scale-90"
            aria-label={`${i} estrellas`}
          >
            <Star 
              size={size} 
              className={isActive ? "text-yellow-400" : "text-zinc-600"} 
              fill={isActive ? "currentColor" : "none"} // <--- ESTO RELLENA LA ESTRELLA
            />
          </button>
        ) : (
          <Star 
            key={i} 
            size={size} 
            className={isActive ? "text-yellow-400" : "text-zinc-600"} 
            fill={isActive ? "currentColor" : "none"} // <--- ESTO RELLENA LA ESTRELLA
          />
        );
      })}
    </div>
  );
}