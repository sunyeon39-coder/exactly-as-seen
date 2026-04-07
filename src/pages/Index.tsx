import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import EventManager from "@/components/EventManager";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <EventManager />
    </div>
  );
};

export default Index;
