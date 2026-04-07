import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "./NotificationBell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

const AppHeader = () => {
  const { profile, isAdmin, signOut } = useAuth();

  return (
    <header className="h-16 border-b border-border flex items-center px-4 lg:px-6 justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold tracking-tight">♠️ Dealer Seat</h1>
        {isAdmin && <Badge className="bg-primary text-primary-foreground text-[10px]">Admin</Badge>}
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell />
        <Avatar className="w-8 h-8">
          <AvatarImage src={profile?.avatar_url ?? undefined} />
          <AvatarFallback className="bg-secondary text-xs">
            {profile?.display_name?.charAt(0) ?? "?"}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm hidden sm:block">{profile?.display_name}</span>
        <Button variant="ghost" size="icon" onClick={signOut}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};

export default AppHeader;
