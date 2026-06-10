'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Upload,
  BarChart3,
  Calendar,
  User,
  Stethoscope,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: 'campanas' | 'reportes' | 'citas' | 'pacientes' | 'medicos' | 'notificaciones' | 'configuracion';
  title: string;
  subtitle: string;
  headerExtra?: React.ReactNode;
  noPadding?: boolean;
}

export default function DashboardLayout({
  children,
  activeTab,
  title,
  subtitle,
  headerExtra,
  noPadding
}: DashboardLayoutProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('rocita_auth');
    if (!auth) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('rocita_auth');
    router.push('/login');
  };

  if (!isAuthenticated) return null;

  const sidebarContent = (isMobile = false) => (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 font-black text-2xl tracking-tighter text-slate-900 group cursor-pointer">
          <div className="relative">
            <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-sky-500/20 group-hover:rotate-6 transition-transform">
              R
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-sky-500 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <span>
            <span className="font-extrabold tracking-tight text-slate-900">Ro</span>
            <span className="font-extrabold tracking-tight text-sky-500">cita</span>
          </span>
        </div>
        {isMobile && (
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 px-4">Principal</p>
        <a
          href="/citas"
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
          className={`flex items-center justify-between group gap-3 p-4 rounded-[1.5rem] font-bold transition-all ${
            activeTab === 'citas'
              ? 'bg-sky-500 text-white shadow-xl shadow-sky-500/20'
              : 'text-slate-500 hover:bg-sky-50 hover:text-sky-600'
          }`}
        >
          <div className="flex items-center gap-3">
            <Calendar size={20} /> Citas
          </div>
          {activeTab === 'citas' && <ChevronRight size={16} className="opacity-50" />}
        </a>
        <a
          href="/pacientes"
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
          className={`flex items-center justify-between group gap-3 p-4 rounded-[1.5rem] font-bold transition-all ${
            activeTab === 'pacientes'
              ? 'bg-sky-500 text-white shadow-xl shadow-sky-500/20'
              : 'text-slate-500 hover:bg-sky-50 hover:text-sky-600'
          }`}
        >
          <div className="flex items-center gap-3">
            <User size={20} /> Pacientes
          </div>
          {activeTab === 'pacientes' && <ChevronRight size={16} className="opacity-50" />}
        </a>
        <a
          href="/medicos"
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
          className={`flex items-center justify-between group gap-3 p-4 rounded-[1.5rem] font-bold transition-all ${
            activeTab === 'medicos'
              ? 'bg-sky-500 text-white shadow-xl shadow-sky-500/20'
              : 'text-slate-500 hover:bg-sky-50 hover:text-sky-600'
          }`}
        >
          <div className="flex items-center gap-3">
            <Stethoscope size={20} /> Médicos
          </div>
          {activeTab === 'medicos' && <ChevronRight size={16} className="opacity-50" />}
        </a>
        <a
          href="/reportes"
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
          className={`flex items-center justify-between group gap-3 p-4 rounded-[1.5rem] font-bold transition-all ${
            activeTab === 'reportes'
              ? 'bg-sky-500 text-white shadow-xl shadow-sky-500/20'
              : 'text-slate-500 hover:bg-sky-50 hover:text-sky-600'
          }`}
        >
          <div className="flex items-center gap-3">
            <BarChart3 size={20} /> Reportes
          </div>
          {activeTab === 'reportes' && <ChevronRight size={16} className="opacity-50" />}
        </a>
        <a
          href="/"
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
          className={`flex items-center justify-between group gap-3 p-4 rounded-[1.5rem] font-bold transition-all ${
            activeTab === 'campanas'
              ? 'bg-sky-500 text-white shadow-xl shadow-sky-500/20'
              : 'text-slate-500 hover:bg-sky-50 hover:text-sky-600'
          }`}
        >
          <div className="flex items-center gap-3">
            <Upload size={20} /> Cargar Datos
          </div>
          {activeTab === 'campanas' && <ChevronRight size={16} className="opacity-50" />}
        </a>
        <a
          href="/notificaciones"
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
          className={`flex items-center justify-between group gap-3 p-4 rounded-[1.5rem] font-bold transition-all ${
            activeTab === 'notificaciones'
              ? 'bg-sky-500 text-white shadow-xl shadow-sky-500/20'
              : 'text-slate-500 hover:bg-sky-50 hover:text-sky-600'
          }`}
        >
          <div className="flex items-center gap-3">
            <Bell size={20} /> Notificaciones
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 text-[10px] font-black rounded-full shadow-md ${
                activeTab === 'notificaciones' ? 'bg-white text-sky-600' : 'bg-sky-500 text-white'
              }`}
            >
              3
            </span>
            {activeTab === 'notificaciones' && <ChevronRight size={16} className="opacity-50" />}
          </div>
        </a>

        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-6 mb-2 px-4">Sistema</p>
        <a
          href="/configuracion"
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
          className={`flex items-center justify-between group gap-3 p-4 rounded-[1.5rem] font-bold transition-all ${
            activeTab === 'configuracion'
              ? 'bg-sky-500 text-white shadow-xl shadow-sky-500/20'
              : 'text-slate-500 hover:bg-sky-50 hover:text-sky-600'
          }`}
        >
          <div className="flex items-center gap-3">
            <Settings size={20} /> Configuración
          </div>
          {activeTab === 'configuracion' && <ChevronRight size={16} className="opacity-50" />}
        </a>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-4 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-[1.5rem] font-bold transition-all group mt-2 text-left"
        >
          <LogOut size={20} className="group-hover:scale-110 transition-transform" /> Cerrar Sesión
        </button>
      </nav>

      <div className="mt-auto bg-sky-50 rounded-[2rem] p-6 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-all"></div>
        <p className="text-xs font-bold text-sky-600 mb-1">Plan Pro</p>
        <p className="text-xs text-sky-800/60 leading-relaxed font-medium">Tu institución está operando al 100% de eficiencia.</p>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#E0F2FE] font-sans text-slate-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-blue-100 p-8 flex-col gap-10 shadow-sm z-10 shrink-0">
        {sidebarContent(false)}
      </aside>

      {/* Mobile Drawer Navigation overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Mobile Sidebar Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 bottom-0 left-0 w-80 bg-white p-8 flex flex-col gap-10 shadow-2xl h-full overflow-y-auto"
            >
              {sidebarContent(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-24 border-b border-blue-100 bg-white/50 backdrop-blur-md px-4 md:px-12 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            {/* Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-sky-50 rounded-xl text-slate-700 transition-all active:scale-95"
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-lg md:text-2xl font-black tracking-tight leading-tight">{title}</h1>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {headerExtra}
            <div 
              onClick={() => router.push('/configuracion')}
              className="hidden md:flex flex-col items-end text-right cursor-pointer group/clinic select-none"
              title="Ir a Configuración Clínica"
            >
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/clinic:text-sky-500 transition-colors">Institución</span>
              <span className="text-sm font-black text-slate-800 tracking-tight group-hover/clinic:text-sky-500 transition-colors">
                {user?.clinicName || 'Clínica Principal'}
              </span>
            </div>
            <button
              onClick={() => router.push('/configuracion')}
              className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-white shadow-sm flex items-center justify-center font-bold text-slate-600 text-sm md:text-base shrink-0 cursor-pointer hover:scale-105 active:scale-95 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              title="Ir a Configuración Clínica"
            >
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'JJ'}
            </button>
          </div>
        </header>

        {/* Page Inner Content Container */}
        <div className={`flex-1 ${noPadding ? 'overflow-hidden flex flex-col' : 'overflow-y-auto p-4 md:p-12'}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
