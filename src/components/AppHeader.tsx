import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "./NotificationBell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

const AppHeader = () => {
  const { profile, isAdmin, signOut } = useAuth();

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center px-4 lg:px-6 justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">♠️</span>
          <h1 className="text-lg font-bold tracking-tight font-display">Dealer Seat</h1>
        </div>
        {isAdmin && (
          <Badge className="bg-accent text-accent-foreground text-[10px] font-semibold border-0">
            ADMIN
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <NotificationBell />
        <div className="flex items-center gap-2 ml-1 pl-2 border-l border-border">
          <Avatar className="w-7 h-7 ring-1 ring-border">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-secondary text-[10px] font-semibold">
              {profile?.display_name?.charAt(0)?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">
            {profile?.display_name}
          </span>
          <Button variant="ghost" size="icon" onClick={signOut} className="w-8 h-8 text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
