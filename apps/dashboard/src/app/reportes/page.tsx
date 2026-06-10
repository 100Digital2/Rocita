'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar, 
  LayoutDashboard, 
  User, 
  Bell, 
  Settings, 
  LogOut,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

export default function ReportesPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  const kpis = [
    { 
      label: 'Tasa de Inasistencia', 
      value: '8.2%', 
      change: '-12.4%', 
      isPositive: true, 
      icon: <TrendingDown className="text-emerald-500" />,
      desc: 'Reducción vs mes anterior'
    },
    { 
      label: 'Ingresos Recuperados', 
      value: '$42.5M', 
      change: '+18.2%', 
      isPositive: true, 
      icon: <DollarSign className="text-sky-500" />,
      desc: 'COP por citas asistidas'
    },
    { 
      label: 'Confirmaciones Hoy', 
      value: '184', 
      change: '+5.4%', 
      isPositive: true, 
      icon: <Users className="text-purple-500" />,
      desc: 'Pacientes que asistirán'
    },
    { 
      label: 'Tiempo Ahorrado', 
      value: '120h', 
      change: '+15.0%', 
      isPositive: true, 
      icon: <Calendar className="text-amber-500" />,
      desc: 'Horas de llamadas manuales'
    }
  ];

  return (
    <DashboardLayout
      activeTab="reportes"
      title="Métricas de Impacto"
      subtitle="Visión Ejecutiva"
      headerExtra={
        <div className='flex items-center gap-4 bg-white p-2 rounded-2xl border border-blue-50'>
          <button className='px-4 py-2 bg-sky-500 text-white rounded-xl text-xs font-black shadow-lg shadow-sky-500/20 transition-all'>Mes Actual</button>
          <button className='px-4 py-2 text-slate-400 text-xs font-black hover:text-slate-600 transition-all'>Trimestre</button>
        </div>
      }
    >
        <div className='space-y-12'>
          {/* KPI Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'>
            {kpis.map((kpi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className='bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-blue-100 shadow-lg shadow-sky-900/5 group hover:scale-[1.02] transition-all'
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform'>
                    {kpi.icon}
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-black ${kpi.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {kpi.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {kpi.change}
                  </div>
                </div>
                <h3 className='text-xs font-bold text-slate-400 uppercase tracking-widest mb-1'>{kpi.label}</h3>
                <p className='text-3xl font-black text-slate-900 tracking-tight mb-2'>{kpi.value}</p>
                <p className='text-[10px] font-medium text-slate-400'>{kpi.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Chart Simulation */}
            <div className='lg:col-span-2 bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12 border border-blue-100 shadow-2xl shadow-sky-900/5 relative overflow-hidden'>
              <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-12'>
                <div>
                  <h3 className='text-xl md:text-2xl font-black tracking-tight'>Eficiencia de Confirmación</h3>
                  <p className='text-xs md:text-sm text-slate-400 font-medium'>Comparativa de los últimos 7 días</p>
                </div>
                <div className='flex items-center gap-4 text-[10px] md:text-xs font-black'>
                  <div className='flex items-center gap-1.5'>
                    <div className='w-2.5 h-2.5 bg-sky-500 rounded-full'></div>
                    Confirmadas
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <div className='w-2.5 h-2.5 bg-slate-200 rounded-full'></div>
                    Pendientes
                  </div>
                </div>
              </div>

              {/* Fake Bars */}
              <div className='flex items-end justify-between h-64 gap-2 md:gap-4 px-1 md:px-4'>
                {[
                  { d: 'Lun', h: 80, p: 20 },
                  { d: 'Mar', h: 65, p: 35 },
                  { d: 'Mie', h: 92, p: 8 },
                  { d: 'Jue', h: 70, p: 30 },
                  { d: 'Vie', h: 88, p: 12 },
                  { d: 'Sab', h: 95, p: 5 },
                  { d: 'Dom', h: 40, p: 60 }
                ].map((bar, i) => (
                  <div key={i} className='flex-1 flex flex-col items-center gap-3 md:gap-4'>
                    <div className='w-full max-w-[24px] sm:max-w-[40px] flex flex-col-reverse h-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50'>
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${bar.h}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className='bg-sky-500 w-full relative group'
                      >
                        <div className='absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10'>
                          {bar.h}%
                        </div>
                      </motion.div>
                    </div>
                    <span className='text-[8px] sm:text-[10px] font-black text-slate-400 uppercase'>{bar.d}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Side Info */}
            <div className='space-y-6 md:space-y-8'>
              <div className='bg-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 text-white shadow-2xl relative overflow-hidden'>
                <div className='absolute top-0 right-0 w-32 h-32 bg-sky-500/20 rounded-full blur-3xl'></div>
                <h3 className='text-lg md:text-xl font-black mb-4 md:mb-6 flex items-center gap-3'>
                  <Activity size={20} className='text-sky-500' /> Estado Operativo
                </h3>
                <div className='space-y-4 md:space-y-6'>
                  <div>
                    <div className='flex justify-between text-[11px] md:text-xs font-bold mb-2'>
                      <span>Mensajes Enviados Hoy</span>
                      <span className='text-sky-400'>2,142 / 5,000</span>
                    </div>
                    <div className='h-2 bg-slate-800 rounded-full overflow-hidden'>
                      <div className='h-full bg-sky-500 w-[42%]'></div>
                    </div>
                  </div>
                  <div>
                    <div className='flex justify-between text-[11px] md:text-xs font-bold mb-2'>
                      <span>Capacidad de Respuesta IA</span>
                      <span className='text-emerald-400'>98.4%</span>
                    </div>
                    <div className='h-2 bg-slate-800 rounded-full overflow-hidden'>
                      <div className='h-full bg-emerald-500 w-[98.4%]'></div>
                    </div>
                  </div>
                </div>
                <div className='mt-8 md:mt-10 p-4 bg-sky-500/10 border border-sky-500/20 rounded-2xl'>
                  <p className='text-[9px] md:text-[10px] font-medium leading-relaxed text-sky-100/70'>
                    Rocita está detectando un patrón de inasistencia en Pediatría los jueves. Recomendamos adelantar recordatorios 4h.
                  </p>
                </div>
              </div>

              <div className='bg-white border border-blue-100 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 shadow-lg shadow-sky-900/5'>
                <h3 className='font-black text-base md:text-lg mb-4 md:mb-6'>Recientes</h3>
                <div className='space-y-4 md:space-y-6'>
                  {[1, 2, 3].map(i => (
                    <div key={i} className='flex items-center gap-3 md:gap-4'>
                      <div className='w-9 h-9 md:w-10 md:h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0'>
                        <Users size={16} />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs font-black truncate'>Hospital Regional Norte</p>
                        <p className='text-[9px] md:text-[10px] text-slate-400'>Campaña completada · Hace 2h</p>
                      </div>
                      <ChevronRight size={14} className='text-slate-300 shrink-0' />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E0F2FE;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #BAE6FD;
        }
      `}</style>
    </DashboardLayout>
  );
}

// Icono temporal de Actividad que no estaba importado correctamente en el código anterior
function Activity({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
