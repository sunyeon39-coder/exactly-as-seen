import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface SeatCardProps {
  label: string;
  occupantName?: string | null;
  isEmpty: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

const SeatCard = ({ label, occupantName, isEmpty, isSelected, onClick }: SeatCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center justify-center rounded-xl border-2 p-3 min-w-[90px] min-h-[90px] transition-all duration-300 card-shine",
        isEmpty
          ? "bg-seat-empty border-seat-border hover:border-muted-foreground/50"
          : "bg-primary/10 border-primary/40 glow-green",
        isSelected && "border-primary ring-2 ring-primary/30 animate-pulse-glow cursor-pointer hover:bg-primary/5"
      )}
    >
      {/* Status dot */}
      <div className={cn(
        "absolute top-2 right-2 w-2 h-2 rounded-full",
        isEmpty ? "bg-muted-foreground/30" : "bg-primary animate-pulse"
      )} />

      <span className={cn(
        "text-[11px] font-semibold uppercase tracking-wider",
        isEmpty ? "text-muted-foreground/70" : "text-primary"
      )}>
        {label}
      </span>

      {isEmpty ? (
        <div className="mt-1.5 w-8 h-8 rounded-full border border-dashed border-muted-foreground/30 flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-muted-foreground/40" />
        </div>
      ) : (
        <span className="text-sm font-semibold mt-1.5 truncate max-w-[80px] text-foreground">
          {occupantName}
        </span>
      )}
    </button>
  );
};

export default SeatCard;
