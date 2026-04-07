import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Clock, UserPlus, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface WaitlistEntry {
  id: string;
  user_id: string;
  joined_at: string;
  status: string;
  profiles?: { display_name: string | null } | null;
}

interface WaitlistPanelProps {
  eventId: string;
  waitlist: WaitlistEntry[];
  isAdmin: boolean;
  onRefresh: () => void;
  onAssignUser?: (userId: string, userName: string) => void;
}

const WaitlistPanel = ({ eventId, waitlist, isAdmin, onRefresh, onAssignUser }: WaitlistPanelProps) => {
  const { user } = useAuth();
  const isInWaitlist = waitlist.some((w) => w.user_id === user?.id && w.status === "waiting");

  const handleJoinWaitlist = async () => {
    if (!user) return;
    const { error } = await supabase.from("waitlist").insert({
      event_id: eventId,
      user_id: user.id,
    });
    if (error) {
      if (error.code === "23505") toast.error("이미 대기 중입니다");
      else toast.error("대기 등록 실패");
    } else {
      toast.success("대기에 등록되었습니다");
      onRefresh();
    }
  };

  const handleRemoveFromWaitlist = async (waitlistId: string) => {
    const { error } = await supabase.from("waitlist").delete().eq("id", waitlistId);
    if (error) toast.error("삭제 실패");
    else onRefresh();
  };

  const activeWaitlist = waitlist.filter((w) => w.status === "waiting");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
          <Clock className="w-4 h-4 text-accent" />
        </div>
        <h3 className="text-base font-semibold font-display">대기 관리</h3>
        <Badge variant="secondary" className="ml-auto text-accent border-accent/20 bg-accent/10 font-bold">
          {activeWaitlist.length}
        </Badge>
      </div>

      {!isAdmin && !isInWaitlist && (
        <Button onClick={handleJoinWaitlist} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold h-11">
          <UserPlus className="w-4 h-4 mr-2" />
          대기 등록
        </Button>
      )}

      {isInWaitlist && !isAdmin && (
        <div className="flex items-center justify-center gap-2 py-3 rounded-lg bg-accent/5 border border-accent/20">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-sm font-medium text-accent">대기 중입니다</span>
        </div>
      )}

      <div className="space-y-2">
        {activeWaitlist.map((entry, idx) => (
          <div
            key={entry.id}
            className="group flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-3 py-2.5 transition-colors hover:bg-secondary/50"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-accent/10 text-accent text-xs font-bold">
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium truncate block">
                {entry.profiles?.display_name ?? "알 수 없음"}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {formatDistanceToNow(new Date(entry.joined_at), { locale: ko, addSuffix: true })}
              </span>
            </div>
            {isAdmin && (
              <div className="flex gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                {onAssignUser && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
                    onClick={() => onAssignUser(entry.user_id, entry.profiles?.display_name ?? "알 수 없음")}
                  >
                    배치
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemoveFromWaitlist(entry.id)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        ))}
        {activeWaitlist.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/60">
            <Clock className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">대기자가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitlistPanel;
