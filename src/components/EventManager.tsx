import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SeatCard from "./SeatCard";
import WaitlistPanel from "./WaitlistPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Users, LayoutGrid } from "lucide-react";

interface Seat {
  id: string;
  seat_label: string;
  occupant_id: string | null;
  status: string;
  profiles?: { display_name: string | null } | null;
}

interface WaitlistEntry {
  id: string;
  user_id: string;
  joined_at: string;
  status: string;
  profiles?: { display_name: string | null } | null;
}

interface Event {
  id: string;
  name: string;
  status: string;
  max_seats: number;
}

const EventManager = () => {
  const { isAdmin, user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [newEventName, setNewEventName] = useState("");
  const [newEventSeats, setNewEventSeats] = useState("10");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assigningUser, setAssigningUser] = useState<{ userId: string; name: string } | null>(null);

  const fetchEvents = useCallback(async () => {
    const { data } = await supabase.from("events").select("*").eq("status", "active").order("created_at", { ascending: false });
    if (data) {
      setEvents(data);
      if (!selectedEventId && data.length > 0) setSelectedEventId(data[0].id);
    }
  }, [selectedEventId]);

  const fetchSeatsAndWaitlist = useCallback(async () => {
    if (!selectedEventId) return;

    const [seatsRes, waitlistRes] = await Promise.all([
      supabase.from("seats").select("*, profiles:occupant_id(display_name)").eq("event_id", selectedEventId).order("seat_label"),
      supabase.from("waitlist").select("*, profiles:user_id(display_name)").eq("event_id", selectedEventId).eq("status", "waiting").order("joined_at"),
    ]);

    if (seatsRes.data) setSeats(seatsRes.data as unknown as Seat[]);
    if (waitlistRes.data) setWaitlist(waitlistRes.data as unknown as WaitlistEntry[]);
  }, [selectedEventId]);

  useEffect(() => { fetchEvents(); }, []);
  useEffect(() => { fetchSeatsAndWaitlist(); }, [selectedEventId]);

  // Realtime subscriptions
  useEffect(() => {
    if (!selectedEventId) return;

    const channel = supabase
      .channel(`event-${selectedEventId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "seats", filter: `event_id=eq.${selectedEventId}` }, () => fetchSeatsAndWaitlist())
      .on("postgres_changes", { event: "*", schema: "public", table: "waitlist", filter: `event_id=eq.${selectedEventId}` }, () => fetchSeatsAndWaitlist())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedEventId, fetchSeatsAndWaitlist]);

  const createEvent = async () => {
    if (!newEventName.trim()) return;
    const seatCount = parseInt(newEventSeats) || 10;

    const { data: event, error } = await supabase
      .from("events")
      .insert({ name: newEventName, max_seats: seatCount, created_by: user!.id })
      .select()
      .single();

    if (error) { toast.error("이벤트 생성 실패"); return; }

    const seatLabels = Array.from({ length: seatCount }, (_, i) => ({
      event_id: event.id,
      seat_label: `${i + 1}번`,
    }));

    await supabase.from("seats").insert(seatLabels);
    setDialogOpen(false);
    setNewEventName("");
    setNewEventSeats("10");
    toast.success("이벤트가 생성되었습니다");
    fetchEvents();
    setSelectedEventId(event.id);
  };

  const handleAssignUser = (userId: string, userName: string) => {
    setAssigningUser({ userId, name: userName });
    toast.info(`${userName}을(를) 배치할 좌석을 선택하세요`);
  };

  const handleSeatClick = async (seat: Seat) => {
    if (!isAdmin) return;

    if (assigningUser && seat.status === "empty") {
      const { error: seatError } = await supabase
        .from("seats")
        .update({ occupant_id: assigningUser.userId, status: "occupied", assigned_at: new Date().toISOString() })
        .eq("id", seat.id);

      if (seatError) { toast.error("배치 실패"); return; }

      await supabase
        .from("waitlist")
        .update({ status: "assigned" })
        .eq("event_id", selectedEventId!)
        .eq("user_id", assigningUser.userId);

      const selectedEvent = events.find((e) => e.id === selectedEventId);
      await supabase.from("notifications").insert({
        user_id: assigningUser.userId,
        title: "좌석 배치 완료 🎉",
        message: `${selectedEvent?.name} / ${seat.seat_label}에 배치되었습니다`,
      });

      toast.success(`${assigningUser.name} → ${seat.seat_label} 배치 완료`);
      setAssigningUser(null);
      fetchSeatsAndWaitlist();
      return;
    }

    if (seat.status === "occupied") {
      await supabase
        .from("seats")
        .update({ occupant_id: null, status: "empty", assigned_at: null })
        .eq("id", seat.id);
      toast.success(`${seat.seat_label} 비움`);
      fetchSeatsAndWaitlist();
    }
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const occupiedCount = seats.filter(s => s.status === "occupied").length;

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 lg:p-6 min-h-[calc(100vh-64px)] felt-texture">
      {/* Seat Map */}
      <div className="flex-1 space-y-4">
        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={selectedEventId ?? ""} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-[200px] bg-card border-border">
              <SelectValue placeholder="이벤트 선택" />
            </SelectTrigger>
            <SelectContent>
              {events.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-1" />
                  새 이벤트
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display">새 이벤트 생성</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <Input placeholder="이벤트 이름 (예: 토너먼트 #1)" value={newEventName} onChange={(e) => setNewEventName(e.target.value)} />
                  <Input type="number" placeholder="좌석 수" value={newEventSeats} onChange={(e) => setNewEventSeats(e.target.value)} min="1" max="26" />
                  <Button onClick={createEvent} className="w-full bg-primary text-primary-foreground">생성</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {assigningUser && (
            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">
                  {assigningUser.name} 배치 중
                </span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setAssigningUser(null)} className="text-muted-foreground">
                취소
              </Button>
            </div>
          )}
        </div>

        {/* Stats bar */}
        {selectedEvent && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <LayoutGrid className="w-4 h-4" />
              <span>{seats.length}석</span>
            </div>
            <div className="flex items-center gap-1.5 text-primary">
              <Users className="w-4 h-4" />
              <span>{occupiedCount}명 착석</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span>{seats.length - occupiedCount}석 비어있음</span>
            </div>
          </div>
        )}

        {/* Seat Grid */}
        {selectedEvent && (
          <div className="rounded-2xl border border-border bg-card/30 backdrop-blur-sm p-6 min-h-[400px]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {seats.map((seat) => (
                <SeatCard
                  key={seat.id}
                  label={seat.seat_label}
                  occupantName={seat.profiles?.display_name}
                  isEmpty={seat.status === "empty"}
                  isSelected={assigningUser !== null && seat.status === "empty"}
                  onClick={() => handleSeatClick(seat)}
                />
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
            <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center">
              <span className="text-3xl opacity-50">♠️</span>
            </div>
            <p className="text-sm">
              {isAdmin ? "새 이벤트를 생성하세요" : "현재 진행 중인 이벤트가 없습니다"}
            </p>
          </div>
        )}
      </div>

      {/* Waitlist Panel */}
      {selectedEventId && (
        <div className="lg:w-[340px] shrink-0 rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4">
          <WaitlistPanel
            eventId={selectedEventId}
            waitlist={waitlist}
            isAdmin={isAdmin}
            onRefresh={fetchSeatsAndWaitlist}
            onAssignUser={isAdmin ? handleAssignUser : undefined}
          />
        </div>
      )}
    </div>
  );
};

export default EventManager;
