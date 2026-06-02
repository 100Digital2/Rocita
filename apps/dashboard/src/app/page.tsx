'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
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


const joinExcelSheets = (workbook: XLSX.WorkBook): any[] => {
  const rawPatients = XLSX.utils.sheet_to_json(workbook.Sheets['Pacientes']) as any[];
  const rawProfessionals = XLSX.utils.sheet_to_json(workbook.Sheets['Profesionales']) as any[];
  const rawAppointments = XLSX.utils.sheet_to_json(workbook.Sheets['Citas']) as any[];

  // Determine if it's the Demo style (keys like 'id', 'nombre', 'telefono')
  // or the 50-patient style (keys like 'Nombre', 'Cedula', 'Telefono')
  const hasIdKey = rawPatients.length > 0 && ('id' in rawPatients[0] || 'Id' in rawPatients[0]);

  if (hasIdKey) {
    return rawPatients.map((pat) => {
      const patId = pat.id ?? pat.Id;
      const apt = rawAppointments.find(
        (a) => Number(a.id_paciente ?? a.PacienteId ?? a.paciente_id) === Number(patId)
      );
      const profId = apt ? (apt.id_profesional ?? apt.ProfesionalId ?? apt.profesional_id) : null;
      const prof = profId ? rawProfessionals.find(
        (p) => Number(p.id ?? p.Id) === Number(profId)
      ) : null;

      const dateStr = apt ? `${apt.fecha || apt.Fecha || ''} ${apt.hora || apt.Hora || ''}`.trim() : '';

      return {
        name: pat.nombre ?? pat.Nombre ?? pat.name ?? 'Paciente Desconocido',
        phone: pat.telefono ?? pat.Telefono ?? pat.phone ?? '',
        email: pat.email ?? pat.Email ?? pat.correo ?? pat.Correo ?? '',
        status: apt ? (apt.estado ?? apt.Estado ?? 'Pendiente') : 'Pendiente',
        doctor: prof ? (prof.nombre ?? prof.Nombre) : 'Sin asignar',
        specialty: prof ? (prof.especialidad ?? prof.Especialidad) : 'Consulta General',
        nextAppointment: dateStr || 'Próximamente'
      };
    });
  } else {
    return rawPatients.map((pat) => {
      // Find appointment by matching Patient name (ignoring casing and extra spaces)
      const patName = (pat.Nombre ?? pat.nombre ?? pat.name ?? '').toString().trim().toLowerCase();
      const apt = rawAppointments.find(
        (a) => (a.Paciente ?? a.paciente ?? '').toString().trim().toLowerCase() === patName
      );
      
      const docName = apt ? (apt.Doctor ?? apt.doctor ?? apt.Médico ?? apt.medico) : null;
      const prof = docName ? rawProfessionals.find(
        (p) => (p.Nombre ?? p.nombre ?? '').toString().trim().toLowerCase() === docName.toString().trim().toLowerCase()
      ) : null;

      return {
        name: pat.Nombre ?? pat.nombre ?? pat.name ?? 'Paciente Desconocido',
        phone: pat.Telefono ?? pat.telefono ?? pat.phone ?? '',
        email: pat.Correo ?? pat.correo ?? pat.email ?? pat.Email ?? '',
        status: apt ? (apt.estado ?? apt.Estado ?? 'Pendiente') : 'Pendiente',
        doctor: docName ?? 'Sin asignar',
        specialty: prof ? (prof.Especialidad ?? prof.especialidad) : 'Consulta General',
        nextAppointment: apt ? (apt['Fecha Cita'] ?? apt.fecha_cita ?? apt.Fecha ?? '') : 'Próximamente'
      };
    });
  }
};

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [counts, setCounts] = useState({ pacientes: 0, profesionales: 0, citas: 0 });
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const [fullPatientsList, setFullPatientsList] = useState<any[]>([]);

  // Estados de la Etapa 1: Previsualización de Datos de Excel y Pestañas
  const [previewData, setPreviewData] = useState<{
    pacientes: any[];
    profesionales: any[];
    citas: any[];
  } | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<'pacientes' | 'profesionales' | 'citas'>('pacientes');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

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
      const parsedPatients = XLSX.utils.sheet_to_json(workbook.Sheets['Pacientes']) as any[];
      const newCounts = {
        pacientes: parsedPatients.length,
        profesionales: XLSX.utils.sheet_to_json(workbook.Sheets['Profesionales']).length,
        citas: XLSX.utils.sheet_to_json(workbook.Sheets['Citas']).length,
      };

      // Extracción de datos muestra (Etapa 1)
      const samples = {
        pacientes: parsedPatients.slice(0, 3),
        profesionales: XLSX.utils.sheet_to_json(workbook.Sheets['Profesionales']).slice(0, 3) as any[],
        citas: XLSX.utils.sheet_to_json(workbook.Sheets['Citas']).slice(0, 3) as any[],
      };

      const joined = joinExcelSheets(workbook);
      setFullPatientsList(joined);
      setCounts(newCounts);
      setPreviewData(samples);
      
      // Simular un poco de delay para el efecto visual de "procesando"
      setTimeout(() => {
        setIsUploading(false);
        setShowPreviewModal(true);
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

  const getDynamicPreview = (text: string) => {
    if (!text) return '';
    return text
      .replace(/{nombre_paciente}/g, 'Carlos Humberto Pérez')
      .replace(/{nombre_doctor}/g, 'Dra. Carolina Gómez')
      .replace(/{fecha_cita}/g, 'Lunes 25 de Mayo a las 10:30 AM')
      .replace(/{lugar}/g, 'Consultorio 402 (Torre Médica Central)');
  };

  if (!isAuthenticated) return null;

  return (
    <div className='flex min-h-screen bg-[#E0F2FE] font-sans text-slate-900 overflow-hidden'>
      {/* Sidebar */}
      <aside className='w-72 bg-white border-r border-blue-100 p-8 flex flex-col gap-10 shadow-sm z-10'>
        <div className='flex items-center gap-3 font-black text-2xl tracking-tighter text-slate-900 group cursor-pointer'>
          <div className='relative'>
            <div className='w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-sky-500/20 group-hover:rotate-6 transition-transform'>
              R
            </div>
            <div className='absolute -top-0.5 -right-0.5 w-3 h-3 bg-sky-500 rounded-full border-2 border-white animate-pulse'></div>
          </div>
          <span>
            <span className="font-extrabold tracking-tight text-slate-900">Ro</span><span className="font-extrabold tracking-tight text-sky-500">cita</span>
          </span>
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
          <a href='/pacientes' className='flex items-center gap-3 p-4 text-slate-500 hover:bg-sky-50 hover:text-sky-600 rounded-[1.5rem] font-bold transition-all group'>
            <User size={20} className='group-hover:scale-110 transition-transform' /> Pacientes
          </a>
          <a href='/notificaciones' className='flex items-center justify-between p-4 text-slate-500 hover:bg-sky-50 hover:text-sky-600 rounded-[1.5rem] font-bold transition-all group'>
            <div className='flex items-center gap-3'>
              <Bell size={20} className='group-hover:scale-110 transition-transform' /> Notificaciones
            </div>
            <span className='px-2 py-0.5 bg-sky-500 text-white text-[10px] font-black rounded-full shadow-md shadow-sky-500/10 group-hover:scale-110 transition-all'>3</span>
          </a>
          
          <p className='text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-6 mb-2 px-4'>Sistema</p>
          <a href='/configuracion' className='flex items-center gap-3 p-4 text-slate-500 hover:bg-sky-50 hover:text-sky-600 rounded-[1.5rem] font-bold transition-all group'>
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
            <p className='text-xs font-bold text-slate-400 uppercase tracking-widest'>{user?.clinicName || 'Salud Eficiente'}</p>
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
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'JJ'}
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
                            className='flex items-center gap-2 px-5 py-3 bg-sky-50 text-sky-600 rounded-[1.25rem] text-sm font-black hover:bg-sky-500 hover:text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-sm'
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
                        className='w-full h-80 p-8 bg-slate-50 border-2 border-transparent focus:border-sky-500 focus:bg-white rounded-[2.5rem] outline-none transition-all duration-300 focus:ring-4 focus:ring-sky-500/20 font-sans text-lg text-slate-800 leading-relaxed shadow-inner'
                      />
                      <div className='absolute bottom-6 right-6 px-4 py-2 bg-white/80 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 shadow-sm'>
                        {message.length} caracteres
                      </div>
                    </div>

                    <div className='flex items-center justify-between mt-10'>
                      <button onClick={() => setStep(1)} className='px-8 py-4 text-slate-400 font-black hover:text-slate-800 hover:scale-105 active:scale-95 transition-all duration-200'>
                        Atrás
                      </button>
                      <button
                        onClick={handleSend}
                        className='bg-sky-500 text-white px-12 py-4 rounded-[1.5rem] font-black text-lg hover:scale-105 active:scale-95 hover:shadow-sky-500/40 transition-all duration-200 shadow-xl shadow-sky-500/30 flex items-center gap-3'
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
                        <div className='bg-slate-900 rounded-2xl rounded-tl-none p-4 text-xs leading-relaxed border border-slate-700/30 text-slate-300 shadow-md font-sans max-w-full overflow-hidden break-words'>
                          {message ? (
                            <div className='whitespace-pre-wrap'>{getDynamicPreview(message)}</div>
                          ) : (
                            <div className='text-slate-500 italic'>
                              Hola <span className='text-sky-400 font-bold'>Carlos</span>, tu recordatorio aparecerá aquí redactado en tiempo real reemplazando tus variables dinámicamente...
                            </div>
                          )}
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

      {/* Modal de Previsualización de Datos Excel (Etapa 1) */}
      <AnimatePresence>
        {showPreviewModal && previewData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowPreviewModal(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Content Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative bg-white/90 backdrop-blur-2xl border border-white rounded-[2.5rem] md:rounded-[3rem] shadow-2xl p-6 md:p-10 max-w-4xl w-full flex flex-col gap-6 max-h-[85vh] overflow-hidden z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">¡Validación Exitosa!</h3>
                  <p className="text-xs md:text-sm font-semibold text-slate-500 mt-1">
                    Hemos verificado tu archivo Excel. A continuación, tienes una muestra de los registros detectados en cada pestaña.
                  </p>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex items-center border-b border-slate-100 pb-2 gap-2">
                {[
                  { id: 'pacientes', label: 'Pacientes', count: counts.pacientes, icon: <User size={16} /> },
                  { id: 'profesionales', label: 'Profesionales', count: counts.profesionales, icon: <Users size={16} /> },
                  { id: 'citas', label: 'Citas', count: counts.citas, icon: <Calendar size={16} /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePreviewTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all ${
                      activePreviewTab === tab.id
                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      activePreviewTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Tab Data Table */}
              <div className="flex-1 overflow-auto rounded-2xl border border-blue-50 bg-slate-50/50 p-2 custom-scrollbar">
                {previewData[activePreviewTab] && previewData[activePreviewTab].length > 0 ? (
                  <table className="w-full text-left text-xs md:text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-blue-100">
                        {Object.keys(previewData[activePreviewTab][0]).map((header) => (
                          <th key={header} className="p-3 font-black text-slate-400 uppercase tracking-widest text-[9px] md:text-[10px]">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData[activePreviewTab].map((row, index) => (
                        <tr key={index} className="border-b border-slate-100/50 last:border-0 hover:bg-white/40 transition-colors">
                          {Object.values(row).map((val: any, cellIndex) => (
                            <td key={cellIndex} className="p-3 text-slate-700 font-medium">
                              {val !== undefined && val !== null ? String(val) : '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <p className="font-bold text-sm">No se encontraron registros de muestra en esta pestaña.</p>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="px-6 py-3 border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-all text-xs md:text-sm active:scale-95"
                >
                  Volver a Cargar
                </button>
                <button
                  onClick={async () => {
                    setShowPreviewModal(false);
                    // Intentamos persistir en base de datos real NestJS + SQLite
                    try {
                      const response = await fetch(`${apiUrl}/patients/bulk`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(fullPatientsList),
                      });
                      if (response.ok) {
                        const data = await response.json();
                        console.log('Pacientes guardados con éxito en SQLite:', data);
                      } else {
                        console.error('Error al guardar pacientes en el backend');
                      }
                    } catch (err) {
                      console.warn('Backend desconectado. Pacientes cargados en modo Demo local.', err);
                    }
                    setStep(2);
                  }}
                  className="px-8 py-3 bg-sky-500 text-white font-black hover:bg-sky-600 rounded-xl shadow-lg shadow-sky-500/20 transition-all text-xs md:text-sm flex items-center gap-2 active:scale-95 group"
                >
                  Confirmar y Continuar
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
