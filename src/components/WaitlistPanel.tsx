import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Clock, UserPlus } from "lucide-react";
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
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Clock className="w-5 h-5 text-waiting" />
        대기 관리
        <Badge variant="secondary" className="ml-auto">{activeWaitlist.length}명</Badge>
      </h3>

      {!isAdmin && !isInWaitlist && (
        <Button onClick={handleJoinWaitlist} className="w-full bg-waiting text-accent-foreground hover:bg-waiting/80">
          <UserPlus className="w-4 h-4 mr-2" />
          대기 등록
        </Button>
      )}

      {isInWaitlist && !isAdmin && (
        <p className="text-sm text-waiting text-center py-2">대기 중입니다...</p>
      )}

      <div className="space-y-2">
        {activeWaitlist.map((entry, idx) => (
          <div
            key={entry.id}
            className="flex items-center gap-3 rounded-lg border border-waiting/30 bg-card px-4 py-3"
          >
            <span className="text-sm font-bold text-waiting min-w-[24px]">{idx + 1}</span>
            <span className="text-sm font-medium flex-1 truncate">
              {entry.profiles?.display_name ?? "알 수 없음"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(entry.joined_at), { locale: ko, addSuffix: true })}
            </span>
            {isAdmin && (
              <div className="flex gap-1">
                {onAssignUser && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-primary hover:text-primary"
                    onClick={() => onAssignUser(entry.user_id, entry.profiles?.display_name ?? "알 수 없음")}
                  >
                    배치
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-destructive hover:text-destructive"
                  onClick={() => handleRemoveFromWaitlist(entry.id)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        ))}
        {activeWaitlist.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">대기자가 없습니다</p>
        )}
      </div>
    </div>
  );
};

export default WaitlistPanel;
