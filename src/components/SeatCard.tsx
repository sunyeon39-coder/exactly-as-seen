import { cn } from "@/lib/utils";

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
        "flex flex-col items-center justify-center rounded-xl border-2 p-3 min-w-[90px] min-h-[80px] transition-all duration-200",
        isEmpty
          ? "bg-seat-empty border-seat-border hover:border-muted-foreground"
          : "bg-seat-empty border-primary/40",
        isSelected && "border-ring ring-2 ring-ring/30 animate-pulse-glow"
      )}
    >
      <span className={cn(
        "text-xs font-medium",
        isEmpty ? "text-muted-foreground" : "text-primary"
      )}>
        {label}
      </span>
      <span className={cn(
        "text-sm font-semibold mt-1 truncate max-w-[80px]",
        isEmpty ? "text-muted-foreground" : "text-foreground"
      )}>
        {isEmpty ? "비어있음" : occupantName}
      </span>
    </button>
  );
};

export default SeatCard;
