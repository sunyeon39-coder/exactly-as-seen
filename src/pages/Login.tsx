import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Login = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center felt-texture">
        <div className="animate-pulse text-muted-foreground font-display text-lg">♠️</div>
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleGoogleLogin = async () => {
    await lovable.auth.signInWithOAuth("google");
  };

  return (
    <div className="flex min-h-screen items-center justify-center felt-texture relative">
      {/* Decorative poker suits */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <span className="absolute top-[10%] left-[8%] text-6xl opacity-[0.04] rotate-[-15deg]">♠</span>
        <span className="absolute top-[20%] right-[12%] text-5xl opacity-[0.04] rotate-[20deg]">♥</span>
        <span className="absolute bottom-[15%] left-[15%] text-7xl opacity-[0.04] rotate-[10deg]">♦</span>
        <span className="absolute bottom-[25%] right-[8%] text-6xl opacity-[0.04] rotate-[-25deg]">♣</span>
      </div>

      <div className="w-full max-w-sm mx-4 space-y-10 text-center relative z-10">
        {/* Logo */}
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 glow-green mb-2">
            <span className="text-4xl">♠️</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight font-display">
            Dealer Seat
          </h1>
          <p className="text-muted-foreground text-sm">포커 좌석 & 대기 관리 시스템</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-8 space-y-6 card-shine">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold font-display">로그인</h2>
            <p className="text-xs text-muted-foreground">Google 계정으로 시작하세요</p>
          </div>
          <Button
            onClick={handleGoogleLogin}
            size="lg"
            className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium h-12 text-sm"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google로 로그인
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground/60">
          딜러 전용 관리 시스템
        </p>
      </div>
    </div>
  );
};

export default Login;
