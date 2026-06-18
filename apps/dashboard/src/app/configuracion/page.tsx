'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  Save,
  Sliders,
  Globe,
  FileText,
  Building
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ConfigTabsContent from '../../components/ConfigTabsContent';
import BotSandbox from '../../components/BotSandbox';
import { useBotConfig } from '../../hooks/useBotConfig';

export default function ConfiguracionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'ia' | 'canales' | 'plantillas' | 'perfil'>('ia');

  // Load configuration hook
  const config = useBotConfig();

  // Auth Protection Check
  useEffect(() => {
    const auth = localStorage.getItem('rocita_auth');
    if (!auth) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) return null;

  return (
    <DashboardLayout
      activeTab="configuracion"
      title="Configuración del Portal"
      subtitle="Parametrización General"
      noPadding
      headerExtra={
        <div className="flex items-center gap-6">
          <button
            onClick={() => config.saveSettings()}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-full shadow-lg shadow-emerald-500/25 hover:shadow-emerald-600/30 transition-all flex items-center gap-2 active:scale-95 duration-200 font-sans"
          >
            <Save size={14} />
            Guardar Cambios
          </button>
        </div>
      }
    >
      {/* Workspace Panels (Grid: Left controls, Right WhatsApp simulator) */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left panel: Config controls */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 border-r border-blue-50 bg-slate-50/30">
          
          {/* Tabs selector */}
          <div className="flex items-center gap-2 p-1.5 bg-white border border-blue-100 rounded-3xl shadow-sm overflow-x-auto scrollbar-none flex-nowrap md:flex-wrap">
            <button
              onClick={() => setActiveTab('ia')}
              className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 ${
                activeTab === 'ia' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Sliders size={14} />
              Motor IA
            </button>
            <button
              onClick={() => setActiveTab('canales')}
              className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 ${
                activeTab === 'canales' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Globe size={14} />
              Canales
            </button>
            <button
              onClick={() => setActiveTab('plantillas')}
              className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 ${
                activeTab === 'plantillas' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <FileText size={14} />
              Plantillas
            </button>
            <button
              onClick={() => setActiveTab('perfil')}
              className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 ${
                activeTab === 'perfil' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Building size={14} />
              Clínica
            </button>
          </div>

          {/* Configuration Form content */}
          <ConfigTabsContent activeTab={activeTab} config={config} />

          {/* Guardar Cambios Footer inside box for mobile */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-end shrink-0 md:hidden">
            <button
              onClick={() => config.saveSettings()}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 duration-200 font-sans"
            >
              <Save size={14} />
              Guardar Cambios
            </button>
          </div>
        </div>

        {/* Right panel: Live WhatsApp Sandbox Simulator */}
        <BotSandbox message={config.renderedSandboxMessage} />

      </div>
    </DashboardLayout>
  );
}
