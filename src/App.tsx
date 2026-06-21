import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Lenis from 'lenis';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Admin } from './pages/Admin';
import { AppShell } from './pages/AppShell';
import { useAuthStore } from './store/authStore';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { session, profile, initialized } = useAuthStore();
  
  if (!initialized) return <div className="p-8 text-center text-white">Loading...</div>;
  if (!session) return <Navigate to="/login" replace />;
  
  if (adminOnly && profile?.role !== 'god_admin' && profile?.role !== 'admin') {
    return <Navigate to="/app" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  const initialize = useAuthStore(state => state.initialize);

  useEffect(() => {
    initialize();

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });
    
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    
    requestAnimationFrame(raf);
    
    return () => {
      lenis.destroy();
    };
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/app/*" 
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
