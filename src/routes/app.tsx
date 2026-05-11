import { createFileRoute, Outlet } from '@tanstack/react-router';
import { SegmentProvider } from '../hooks/SegmentContext';
import { AppShell } from '../components/layout/AppShell';
import { useState, useEffect } from 'react';
import logo from '@/assets/logo.png';
import { ShieldCheck, LogIn, Loader2 } from 'lucide-react';

export const Route = createFileRoute('/app')({
  component: AppLayout,
});

function AppLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const authState = localStorage.getItem('google_authenticated');
    if (authState === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Simulate real Google OAuth handshake latency
    setTimeout(() => {
      setIsLoading(false);
      setIsAuthenticated(true);
      localStorage.setItem('google_authenticated', 'true');
    }, 1500);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-6 overflow-hidden">
        {/* Ambient glow backgrounds */}
        <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "var(--gradient-radial)" }} />
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-[128px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-[128px] animate-pulse"></div>

        <div className="glass-card w-full max-w-md rounded-3xl border border-border/40 bg-card/20 p-8 text-center backdrop-blur-2xl shadow-[0_0_50px_rgba(99,102,241,0.15)] transition-all duration-500">
          
          {/* Logo & Platform Name */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <img 
              src={logo} 
              alt="Solvix" 
              className="h-20 w-20 object-contain drop-shadow-[0_0_20px_rgba(99,102,241,0.3)]" 
            />
            <div>
              <span className="font-outfit text-4xl font-black tracking-[0.2em] bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
                crIAr
              </span>
              <p className="text-xs uppercase tracking-widest text-muted-foreground/60 mt-1 font-semibold">
                AI Solutions Studio
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Conectando ao Google...</p>
                <p className="text-xs text-muted-foreground">Autenticando consultor master e carregando workspace</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Área de Acesso Restrita</h2>
                <p className="text-xs text-muted-foreground px-4">
                  Seja bem-vindo ao portal unificado de clientes. Efetue login com sua conta corporativa para continuar.
                </p>
              </div>

              {/* Google OAuth Button */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-white px-5 py-3.5 text-sm font-semibold text-zinc-900 shadow-lg hover:bg-zinc-50 hover:scale-[1.01] transition-all cursor-pointer"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.63 0 3.1.56 4.25 1.66l3.18-3.18C17.5 1.83 14.96 1 12 1 7.35 1 3.4 3.65 1.44 7.5l3.83 2.97C6.18 7.22 8.87 5.04 12 5.04z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.39-4.88 3.39-8.54z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.27 14.77a7.22 7.22 0 0 1 0-4.54L1.44 7.26a11.96 11.96 0 0 0 0 9.48l3.83-2.97z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-3.96 1.09-3.13 0-5.82-2.18-6.73-5.12L1.78 16.2c1.96 3.85 5.91 6.8 10.22 6.8z"
                  />
                </svg>
                <span>Entrar com o Google</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/60 pt-4 border-t border-border/40">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                <span>Autenticação unificada criptografada via SSL</span>
              </div>
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
