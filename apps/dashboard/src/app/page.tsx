'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import {
  Upload,
  MessageSquare,
  CheckCircle2,
  LayoutDashboard,
  Settings,
  User,
  FileSpreadsheet,
  Send,
  Bell,
  Search,
  ChevronRight,
  Users,
  Calendar,
  LogOut,
  AlertCircle,
  BarChart3
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [counts, setCounts] = useState({ pacientes: 0, profesionales: 0, citas: 0 });
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);

  // Verificación de autenticación para la demo
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

  const insertVariable = (variable: string) => {
    setMessage(prev => prev + ' ' + variable);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setError('');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetNames = workbook.SheetNames;

      // Validación de pestañas requeridas
      const requiredSheets = ['Pacientes', 'Profesionales', 'Citas'];
      const missingSheets = requiredSheets.filter(s => !sheetNames.includes(s));

      if (missingSheets.length > 0) {
        throw new Error(`Faltan las siguientes pestañas: ${missingSheets.join(', ')}`);
      }

      // Conteo de registros (restando encabezado)
      const newCounts = {
        pacientes: XLSX.utils.sheet_to_json(workbook.Sheets['Pacientes']).length,
        profesionales: XLSX.utils.sheet_to_json(workbook.Sheets['Profesionales']).length,
        citas: XLSX.utils.sheet_to_json(workbook.Sheets['Citas']).length,
      };

      setCounts(newCounts);
      
      // Simular un poco de delay para el efecto visual de "procesando"
      setTimeout(() => {
        setIsUploading(false);
        setStep(2);
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Error al procesar el archivo');
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  
  const handleSend = () => {
    setIsSending(true);
    setSendProgress(0);
    
    const interval = setInterval(() => {
      setSendProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsSending(false);
            setStep(3);
          }, 1000);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  if (!isAuthenticated) return null;

  return (
    <div className='flex min-h-screen bg-[#E0F2FE] font-sans text-slate-900 overflow-hidden'>
      {/* Sidebar */}
      <aside className='w-72 bg-white border-r border-blue-100 p-8 flex flex-col gap-10 shadow-sm z-10'>
        <div className='flex items-center gap-3 font-black text-2xl tracking-tighter text-sky-500'>
          <div className='w-10 h-10 bg-sky-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-500/30 rotate-3'>
            R
          </div>    
          Rocita
        </div>

        <nav className='flex flex-col gap-2'>
          <p className='text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 px-4'>Principal</p>
          <a href='/' className='flex items-center justify-between group gap-3 p-4 bg-sky-500 text-white rounded-[1.5rem] font-bold shadow-xl shadow-sky-500/20 transition-all'>    
            <div className='flex items-center gap-3'>
              <LayoutDashboard size={20} /> Campañas
            </div>
            <ChevronRight size={16} className='opacity-50' />
          </a>
          <a href='/reportes' className='flex items-center gap-3 p-4 text-slate-500 hover:bg-sky-50 hover:text-sky-600 rounded-[1.5rem] font-bold transition-all group'>
            <BarChart3 size={20} className='group-hover:scale-110 transition-transform' /> Reportes
          </a>
          <a href='#' className='flex items-center gap-3 p-4 text-slate-500 hover:bg-sky-50 hover:text-sky-600 rounded-[1.5rem] font-bold transition-all group'>
            <User size={20} className='group-hover:scale-110 transition-transform' /> Pacientes
          </a>
          <a href='#' className='flex items-center gap-3 p-4 text-slate-500 hover:bg-sky-50 hover:text-sky-600 rounded-[1.5rem] font-bold transition-all group'>
            <Bell size={20} className='group-hover:scale-110 transition-transform' /> Notificaciones
          </a>
          
          <p className='text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-6 mb-2 px-4'>Sistema</p>
          <a href='#' className='flex items-center gap-3 p-4 text-slate-500 hover:bg-sky-50 hover:text-sky-600 rounded-[1.5rem] font-bold transition-all group'>
            <Settings size={20} className='group-hover:scale-110 transition-transform' /> Configuración
          </a>
          
          <button 
            onClick={handleLogout}
            className='flex items-center gap-3 p-4 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-[1.5rem] font-bold transition-all group mt-2'
          >
            <LogOut size={20} className='group-hover:scale-110 transition-transform' /> Cerrar Sesión
          </button>
        </nav>

        <div className='mt-auto bg-sky-50 rounded-[2rem] p-6 relative overflow-hidden group'>
          <div className='absolute -right-4 -top-4 w-20 h-20 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-all'></div>
          <p className='text-xs font-bold text-sky-600 mb-1'>Plan Pro</p>
          <p className='text-xs text-sky-800/60 leading-relaxed font-medium'>Tu institución está operando al 100% de eficiencia.</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className='flex-1 flex flex-col h-screen overflow-hidden'>
        {/* Navbar */}
        <header className='h-24 border-b border-blue-100 bg-white/50 backdrop-blur-md px-12 flex items-center justify-between shrink-0'>
          <div>
            <h1 className='text-2xl font-black tracking-tight'>Panel de Control</h1>
            <p className='text-xs font-bold text-slate-400 uppercase tracking-widest'>Salud Eficiente</p>
          </div>
          
          <div className='flex items-center gap-6'>
            <div className='relative hidden md:block'>
              <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
              <input 
                type="text" 
                placeholder="Buscar paciente..." 
                className='bg-white border border-blue-100 rounded-full py-2.5 pl-12 pr-6 text-sm focus:ring-2 focus:ring-sky-500 outline-none w-64 transition-all'
              />
            </div>
            <div className='w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-white shadow-sm flex items-center justify-center font-bold text-slate-600'>
              JJ
            </div>
          </div>
        </header>

        <div className='flex-1 overflow-y-auto p-12'>
          {/* Steps Progress */}
          <div className='flex items-center justify-center gap-4 mb-16'>
            {[1, 2, 3].map((s) => (
              <div key={s} className='flex items-center gap-4'>
                <motion.div 
                  initial={false}
                  animate={{ 
                    backgroundColor: step >= s ? '#0ea5e9' : '#fff',
                    color: step >= s ? '#fff' : '#94a3b8',
                    scale: step === s ? 1.1 : 1
                  }}
                  className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center font-black shadow-lg shadow-sky-500/10 border ${step >= s ? 'border-sky-500' : 'border-slate-200'}`}
                >
                  {step > s ? <CheckCircle2 size={24} /> : s}
                </motion.div>
                {s < 3 && (
                  <div className='w-24 h-1 bg-slate-200 rounded-full overflow-hidden'>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: step > s ? '100%' : '0%' }}
                      className='h-full bg-sky-500'
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode='wait'>
            <motion.div 
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className='max-w-5xl mx-auto'
            >
              {step === 1 && (
                <div className='bg-white border border-blue-100 rounded-[3.5rem] p-16 shadow-2xl shadow-sky-900/5 relative overflow-hidden'>
                  <div className='absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full -mr-32 -mt-32 blur-3xl'></div>
                  
                  <div className='relative z-10'>
                    <div className='flex items-start justify-between mb-12'>
                      <div>
                        <h2 className='text-4xl font-black tracking-tight mb-4 text-slate-900'>Carga de Datos</h2>
                        <p className='text-slate-500 text-lg max-w-md font-medium'>
                          Sube tu archivo Excel para iniciar la campaña de recordatorios.
                        </p>
                      </div>
                      <div className='w-20 h-20 bg-sky-50 rounded-[2rem] flex items-center justify-center text-sky-500'>
                        <FileSpreadsheet size={32} />
                      </div>
                    </div>

                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept=".xlsx, .csv" 
                      className="hidden" 
                    />

                    <div 
                      onClick={triggerFileUpload}
                      className={`group w-full border-4 border-dashed rounded-[3rem] p-20 flex flex-col items-center justify-center transition-all cursor-pointer ${isUploading ? 'border-sky-500 bg-sky-50' : 'border-sky-50 hover:border-sky-500 hover:bg-sky-50/50 bg-slate-50/50'}`}
                    >
                      {isUploading ? (
                        <div className='flex flex-col items-center'>
                          <div className='w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-6'></div>
                          <p className='text-xl font-black text-sky-600'>Validando registros...</p>
                        </div>
                      ) : (
                        <>
                          <div className='w-24 h-24 bg-white shadow-xl rounded-[2.5rem] flex items-center justify-center text-sky-500 mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500'>
                            <Upload size={40} />
                          </div>
                          <p className='text-2xl font-black text-slate-800 mb-3 text-center'>Haz clic para subir tu Excel</p>
                          <p className='font-bold text-slate-400 text-center mb-8'>Rocita validará: Pacientes, Profesionales y Citas.</p>
                          <div className='flex gap-4'>
                            <span className='px-4 py-2 bg-white border border-blue-100 rounded-xl text-xs font-bold text-sky-600 shadow-sm'>.xlsx</span>
                            <span className='px-4 py-2 bg-white border border-blue-100 rounded-xl text-xs font-bold text-sky-600 shadow-sm'>.csv</span>
                          </div>
                        </>
                      )}
                    </div>

                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='mt-8 p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-4 text-red-600'
                      >
                        <AlertCircle size={24} />
                        <p className='font-bold text-sm'>{error}</p>
                      </motion.div>
                    )}

                    <div className='mt-12 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center gap-6'>
                      <div className='w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm'>
                        <Bell size={20} />
                      </div>
                      <p className='text-sm font-medium text-slate-500'>
                        <strong className='text-slate-800'>Tip de Eficiencia:</strong> El archivo debe contener exactamente 3 pestañas con los nombres indicados.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                  <div className='lg:col-span-2 bg-white border border-blue-100 rounded-[3.5rem] p-12 shadow-2xl shadow-sky-900/5'>
                    <h2 className='text-3xl font-black tracking-tight mb-8 flex items-center gap-4 text-slate-900'>
                      <div className='w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center text-white'>
                        <MessageSquare size={24} />
                      </div>
                      Cuerpo del Mensaje
                    </h2>
                    
                    <div className='mb-8'>
                      <p className='text-xs font-black uppercase tracking-widest text-slate-400 mb-4'>Variables de Salud</p>
                      <div className='flex flex-wrap gap-3'>
                        {[
                          { id: '{nombre_paciente}', label: 'Paciente', icon: <User size={14} /> },
                          { id: '{nombre_doctor}', label: 'Doctor', icon: <Users size={14} /> },
                          { id: '{fecha_cita}', label: 'Fecha/Hora', icon: <Calendar size={14} /> },
                          { id: '{lugar}', label: 'Ubicación', icon: <Settings size={14} /> }
                        ].map(v => (
                          <button
                            key={v.id}
                            onClick={() => insertVariable(v.id)}
                            className='flex items-center gap-2 px-5 py-3 bg-sky-50 text-sky-600 rounded-[1.25rem] text-sm font-black hover:bg-sky-500 hover:text-white transition-all shadow-sm'
                          >
                            {v.icon} {v.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className='relative'>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder='Redacta tu mensaje de recordatorio aquí...'
                        className='w-full h-80 p-8 bg-slate-50 border-2 border-transparent focus:border-sky-500 focus:bg-white rounded-[2.5rem] outline-none transition-all font-sans text-lg text-slate-800 leading-relaxed shadow-inner'
                      />
                      <div className='absolute bottom-6 right-6 px-4 py-2 bg-white/80 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 shadow-sm'>
                        {message.length} caracteres
                      </div>
                    </div>

                    <div className='flex items-center justify-between mt-10'>
                      <button onClick={() => setStep(1)} className='px-8 py-4 text-slate-400 font-black hover:text-slate-800 transition-all'>
                        Atrás
                      </button>
                      <button
                        onClick={handleSend}
                        className='bg-sky-500 text-white px-12 py-4 rounded-[1.5rem] font-black text-lg hover:scale-105 transition-all shadow-xl shadow-sky-500/30 flex items-center gap-3'
                      >
                        Programar Envío <Send size={20} />
                      </button>
                    </div>
                  </div>

                  <div className='space-y-8'>
                    <div className='bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group'>
                      <div className='absolute -right-10 -top-10 w-40 h-40 bg-sky-500/20 rounded-full blur-3xl'></div>
                      <h3 className='text-xl font-black mb-6 relative z-10'>Vista Previa</h3>
                      <div className='bg-slate-800 rounded-[2.5rem] p-6 relative z-10 border border-slate-700/50'>
                        <div className='flex items-center gap-3 mb-4'>
                          <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-[10px]'>
                            R
                          </div>
                          <div>
                            <p className='text-[10px] font-black'>Rocita Asistente</p>
                            <p className='text-[8px] text-slate-500'>En línea</p>
                          </div>
                        </div>
                        <div className='bg-slate-900 rounded-2xl rounded-tl-none p-4 text-[10px] leading-relaxed border border-slate-700/30 text-slate-300'>
                          {message || 'Comienza a escribir para ver la previsualización...'}
                        </div>
                      </div>
                    </div>

                    <div className='bg-white border border-blue-100 rounded-[3.5rem] p-10 shadow-lg shadow-sky-900/5'>
                      <h3 className='font-black text-lg mb-4 text-slate-900'>Resumen de Datos</h3>
                      <div className='space-y-4'>
                        <div className='flex items-center justify-between p-4 bg-slate-50 rounded-2xl'>
                          <p className='text-xs font-bold text-slate-500'>Pacientes</p>
                          <p className='font-black text-sky-600'>{counts.pacientes}</p>
                        </div>
                        <div className='flex items-center justify-between p-4 bg-slate-50 rounded-2xl'>
                          <p className='text-xs font-bold text-slate-500'>Profesionales</p>
                          <p className='font-black text-sky-600'>{counts.profesionales}</p>
                        </div>
                        <div className='flex items-center justify-between p-4 bg-sky-50 rounded-2xl border border-sky-200'>
                          <p className='text-xs font-bold text-sky-700'>Citas Hoy</p>
                          <p className='font-black text-sky-600'>{counts.citas}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              
              {(step === 3 || isSending) && (
                <div className='flex flex-col items-center py-20 text-center max-w-2xl mx-auto'>
                  {isSending ? (
                    <>
                      <div className='w-40 h-40 bg-white shadow-2xl shadow-sky-500/20 text-sky-500 rounded-[3.5rem] flex items-center justify-center mb-12 border-4 border-sky-50 relative overflow-hidden'>
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${sendProgress}%` }}
                          className='absolute bottom-0 left-0 right-0 bg-sky-500/10 w-full'
                        />
                        <Send size={80} className='relative z-10 animate-bounce' />
                      </div>
                      <h2 className='text-5xl font-black tracking-tight mb-6 text-slate-900'>Enviando...</h2>
                      <div className='w-full bg-slate-200 h-4 rounded-full mb-4 overflow-hidden shadow-inner'>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${sendProgress}%` }}
                          className='h-full bg-sky-500 shadow-lg shadow-sky-500/50'
                        />
                      </div>
                      <p className='text-slate-500 text-xl font-medium'>Procesando {Math.round((sendProgress/100) * counts.citas)} de {counts.citas} recordatorios</p>
                    </>
                  ) : (
                    <>
                      <div className='w-40 h-40 bg-white shadow-2xl shadow-green-500/20 text-green-500 rounded-[3.5rem] flex items-center justify-center mb-12 border-4 border-green-50 transition-transform hover:scale-110'>      
                        <CheckCircle2 size={80} />
                      </div>
                      <h2 className='text-5xl font-black tracking-tight mb-6 text-slate-900'>¡Campaña Lanzada!</h2>
                      <p className='text-slate-500 text-xl font-medium leading-relaxed mb-12'>
                        Rocita está procesando los recordatorios para {counts.citas} citas confirmadas.
                      </p>
                      <div className='flex gap-4'>
                        <button
                          onClick={() => { setStep(1); setSendProgress(0); }}
                          className='bg-slate-900 text-white px-10 py-4 rounded-[1.5rem] font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20'
                        >
                          Nueva Campaña
                        </button>
                        <button
                          onClick={() => router.push('/reportes')}
                          className='bg-white border border-slate-200 px-10 py-4 rounded-[1.5rem] font-black hover:bg-slate-50 transition-all text-slate-900'
                        >
                          Ver Reportes
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
