import { createFileRoute, Outlet } from '@tanstack/react-router';
import { SegmentProvider } from '../hooks/SegmentContext';
import { AppShell } from '../components/layout/AppShell';
import { useState, useEffect } from 'react';
import logo from '@/assets/logo.png';
import { ShieldCheck, Loader2 } from 'lucide-react';

// Estabilidade Total Solvix - Trigger Build
export const Route = createFileRoute('/app')({
  component: AppLayout,
});

function AppLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const authState = localStorage.getItem('google_authenticated');
    if (authState === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsAuthenticated(true);
      localStorage.setItem('google_authenticated', 'true');
    }, 1500);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-6 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "var(--gradient-radial)" }} />
        <div className="glass-card w-full max-w-md rounded-3xl border border-border/40 bg-card/20 p-8 text-center backdrop-blur-2xl shadow-[0_0_50px_rgba(99,102,241,0.15)]">
          <div className="flex flex-col items-center justify-center mb-8">
            <img src={logo} alt="Solvix" className="h-44 w-44 object-contain" />
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
              <p className="text-sm font-semibold text-foreground">Conectando ao Google...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground">Acesso Restrito</h2>
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-white px-5 py-3.5 text-sm font-semibold text-zinc-900 shadow-lg"
              >
                <span>Entrar com o Google</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <SegmentProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </SegmentProvider>
  );
}
export default AppLayout;
