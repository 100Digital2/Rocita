'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Activity } from 'lucide-react';

interface User {
  email: string;
  name: string;
  role: string;
  clinicName?: string;
  nit?: string;
  address?: string;
  phone?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Validación y protección de rutas reactiva (Paso 3)
  useEffect(() => {
    const savedToken = localStorage.getItem('rocita_token');
    const savedUser = localStorage.getItem('rocita_user');
    const savedAuth = localStorage.getItem('rocita_auth');

    const isAuth = !!(savedToken && savedUser && savedAuth === 'true');

    if (isAuth) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      
      // Si ya está autenticado e intenta entrar a login, lo redirigimos al inicio
      if (pathname === '/login') {
        router.push('/');
      }
    } else {
      setIsAuthenticated(false);
      setToken(null);
      setUser(null);
      
      // Si no está autenticado e intenta ir a una ruta privada, lo mandamos al login
      if (pathname !== '/login') {
        router.push('/login');
      }
    }
    
    // Simular una carga ultra suave para la animación de inicio
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [pathname, router]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('rocita_token', newToken);
    localStorage.setItem('rocita_user', JSON.stringify(newUser));
    localStorage.setItem('rocita_auth', 'true');
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('rocita_token');
    localStorage.removeItem('rocita_user');
    localStorage.removeItem('rocita_auth');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, isLoading, login, logout }}>
      {isLoading ? (
        // 🔹 Pantalla de carga (Loader Premium) para evitar parpadeos visuales al redirigir
        <div className="min-h-screen bg-[#F0F9FF] flex flex-col items-center justify-center font-sans">
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-sky-500/25 rounded-[2.2rem] blur-lg animate-ping" style={{ animationDuration: '3s' }}></div>
            <div className="relative w-full h-full bg-gradient-to-br from-sky-400 to-blue-600 rounded-[2.2rem] flex items-center justify-center text-white text-4xl font-black shadow-xl">
              R
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-xs">
            <Activity size={14} className="text-sky-500 animate-pulse" /> Cargando Sistema...
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
