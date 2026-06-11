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
  BarChart3,
  MessageCircle,
  PhoneCall,
  Sparkles,
  Zap,
  CheckCheck,
  Activity
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';


const joinExcelSheets = (workbook: XLSX.WorkBook, dbPatients: any[], dbDoctors: any[]): any[] => {
  const rawAppointments = XLSX.utils.sheet_to_json(workbook.Sheets['Citas']) as any[];
  
  // Si existen las pestañas opcionales de Pacientes y Profesionales en el Excel, las cargamos
  const excelPatients = workbook.Sheets['Pacientes'] ? XLSX.utils.sheet_to_json(workbook.Sheets['Pacientes']) as any[] : [];
  const excelProfessionals = workbook.Sheets['Profesionales'] ? XLSX.utils.sheet_to_json(workbook.Sheets['Profesionales']) as any[] : [];

  return rawAppointments.map((apt) => {
    // Identificar el documento del paciente en la cita
    const patDoc = (apt.Documento ?? apt.documento ?? apt['Documento Paciente'] ?? apt['documento_paciente'] ?? apt.Identificacion ?? apt.identificacion ?? apt['Identificacion Paciente'] ?? apt['identificacion_paciente'] ?? apt.Cedula ?? apt.cedula ?? apt['Cedula Paciente'] ?? apt['Cédula Paciente'] ?? apt.id_paciente ?? apt.paciente_id ?? apt.PacienteId ?? apt.Paciente ?? apt.paciente ?? '').toString().trim().toLowerCase();
    
    // 1. Buscar información del paciente en: (1) Excel opcional, (2) Base de datos precargada
    let patInfo = excelPatients.find(p => {
      const pDoc = (p.Documento ?? p.documento ?? p.Identificacion ?? p.identificacion ?? p.Cedula ?? p.cedula ?? p.id ?? p.Id ?? '').toString().trim().toLowerCase();
      return pDoc === patDoc;
    });

    if (!patInfo) {
      // Buscar en base de datos precargada
      patInfo = dbPatients.find(p => p.documentNumber.toString().trim().toLowerCase() === patDoc);
    }

    // 2. Buscar información del médico en: (1) Excel opcional, (2) Base de datos precargada
    const docName = (apt.Doctor ?? apt.doctor ?? apt.Médico ?? apt.medico ?? apt.id_profesional ?? apt.profesional_id ?? '').toString().trim().toLowerCase();
    let profInfo = excelProfessionals.find(p => {
      const pName = (p.Nombre ?? p.nombre ?? p.name ?? '').toString().trim().toLowerCase();
      const pId = (p.id ?? p.Id ?? '').toString().trim().toLowerCase();
      return pName === docName || pId === docName;
    });

    if (!profInfo) {
      // Buscar en base de datos de profesionales precargados
      profInfo = dbDoctors.find(p => {
        const pName = p.name.toString().trim().toLowerCase();
        const pId = p.id.toString().trim().toLowerCase();
        return pName === docName || pId === docName;
      });
    }

    // Rellenar fecha de la cita
    const dateStr = `${apt.fecha || apt.Fecha || apt['Fecha Cita'] || apt.fecha_cita || ''} ${apt.hora || apt.Hora || ''}`.trim();

    return {
      name: patInfo ? (patInfo.nombre ?? patInfo.Nombre ?? patInfo.name) : (apt.nombre ?? apt.Nombre ?? apt.name ?? `Paciente (${patDoc})`),
      phone: patInfo ? (patInfo.telefono ?? patInfo.Telefono ?? patInfo.phone) : (apt.telefono ?? apt.Telefono ?? apt.phone ?? ''),
      email: patInfo ? (patInfo.email ?? patInfo.Email ?? patInfo.correo ?? patInfo.Correo) : (apt.email ?? apt.Email ?? apt.correo ?? apt.Correo ?? ''),
      documentType: patInfo ? (patInfo.documentType ?? patInfo.tipo_documento ?? patInfo.tipoDocumento ?? patInfo['Tipo Documento'] ?? 'CC') : 'CC',
      documentNumber: patDoc || (patInfo ? patInfo.documentNumber : ''),
      gender: patInfo ? (patInfo.gender ?? patInfo.sexo ?? patInfo.Sexo ?? patInfo.genero ?? patInfo.Género ?? '') : '',
      status: apt.estado ?? apt.Estado ?? 'Pendiente',
      doctor: profInfo ? profInfo.name : (apt.Doctor ?? apt.doctor ?? apt.Médico ?? apt.medico ?? 'Sin asignar'),
      doctorEmail: profInfo ? profInfo.email : (apt['Correo Doctor'] ?? apt['Correo Profesional'] ?? ''),
      doctorPhone: profInfo ? profInfo.phone : (apt['Celular Doctor'] ?? apt['Celular Profesional'] ?? apt['Telefono Doctor'] ?? ''),
      specialty: profInfo ? profInfo.specialty : (apt.Especialidad ?? apt.especialidad ?? 'Consulta General'),
      nextAppointment: dateStr || 'Próximamente'
    };
  });
};

const getCardStyle = (step: number, statusText: string) => {
  if (step === 0) {
    return {
      border: 'border-slate-100',
      glow: 'shadow-slate-500/5',
      badgeBg: 'bg-slate-50 text-slate-500 border border-slate-100',
      dotColor: 'bg-slate-400',
      glowColor: 'bg-slate-400/20'
    };
  }
  if (step === 1) {
    return {
      border: 'border-emerald-500/30',
      glow: 'shadow-emerald-500/10 shadow-lg',
      badgeBg: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
      dotColor: 'bg-emerald-500 animate-pulse',
      glowColor: 'bg-emerald-500/20'
    };
  }
  if (step === 2) {
    return {
      border: 'border-amber-500/30',
      glow: 'shadow-amber-500/10 shadow-lg',
      badgeBg: 'bg-amber-50 text-amber-700 border border-amber-100',
      dotColor: 'bg-amber-500 animate-pulse',
      glowColor: 'bg-amber-500/20'
    };
  }
  if (step === 3) {
    return {
      border: 'border-emerald-500/50',
      glow: 'shadow-emerald-500/15 shadow-xl',
      badgeBg: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      dotColor: 'bg-emerald-500',
      glowColor: 'bg-emerald-500/20'
    };
  }
  if (step === 4) {
    return {
      border: 'border-sky-500/50',
      glow: 'shadow-sky-500/15 shadow-xl',
      badgeBg: 'bg-sky-100 text-sky-800 border border-sky-200',
      dotColor: 'bg-sky-500',
      glowColor: 'bg-sky-500/20'
    };
  }
  if (step === 5) {
    return {
      border: 'border-purple-500/50',
      glow: 'shadow-purple-500/15 shadow-xl',
      badgeBg: 'bg-purple-100 text-purple-800 border border-purple-200',
      dotColor: 'bg-purple-500',
      glowColor: 'bg-purple-500/20'
    };
  }
  return {
    border: 'border-slate-200',
    glow: 'shadow-slate-500/5',
    badgeBg: 'bg-slate-100 text-slate-500',
    dotColor: 'bg-slate-400',
    glowColor: 'bg-slate-400/20'
  };
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
  const [liveSendStatus, setLiveSendStatus] = useState<any[]>([]);

  // WhatsApp QR Status & Real Send Capabilities
  const [whatsappStatus, setWhatsappStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'>('DISCONNECTED');
  const sentPatientsRef = useRef<Record<number, boolean>>({});

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${apiUrl}/whatsapp/status`)
      .then(res => res.json())
      .then(data => setWhatsappStatus(data.status))
      .catch(err => console.error('Error al consultar estado de WhatsApp:', err));
  }, [isAuthenticated, apiUrl]);

  const sendRealWhatsappMessage = async (patient: any) => {
    if (!patient.phone) return;
    
    // Rellenar las variables en la plantilla o usar una por defecto si está vacía
    let template = message || 'Hola {nombre_paciente}. Te escribe Rocita, tu asistente de Salud Eficiente. Queremos recordarte tu cita programada con {nombre_doctor} ({especialidad}) el {fecha_cita}. ¿Confirmas tu asistencia?';
    
    const renderedMsg = template
      .replace(/{nombre_paciente}/g, patient.name)
      .replace(/{nombre_doctor}/g, patient.doctor || 'médico especialista')
      .replace(/{fecha_cita}/g, patient.nextAppointment || 'próximamente')
      .replace(/{lugar}/g, 'Consultorio Médico');

    try {
      await fetch(`${apiUrl}/whatsapp/send-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: patient.phone,
          message: renderedMsg,
        }),
      });
      console.log(`Mensaje real enviado por WhatsApp a ${patient.name} (${patient.phone})`);
    } catch (err) {
      console.error('Error al enviar mensaje real por WhatsApp:', err);
    }
  };

  // Base de datos de pacientes y médicos precargados
  const [dbPatients, setDbPatients] = useState<any[]>([]);
  const [dbDoctors, setDbDoctors] = useState<any[]>([]);

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

  // Cargar base de datos local para cruce inteligente en caliente
  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('rocita_token');

    // Cargar perfiles de pacientes
    fetch(`${apiUrl}/patients-profiles`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then(data => setDbPatients(data))
      .catch(() => {
        const local = localStorage.getItem('rocita_patient_profiles');
        if (local) setDbPatients(JSON.parse(local));
      });

    // Cargar médicos
    fetch(`${apiUrl}/doctors`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then(data => {
        if (!data || data.length === 0) {
          const local = localStorage.getItem('rocita_doctors');
          if (local) {
            const parsed = JSON.parse(local);
            if (parsed && parsed.length > 0) {
              setDbDoctors(parsed);
              return;
            }
          }
          const defaultDocs = [
            { id: 1, name: 'Dra. Carolina Gómez', specialty: 'Cardiología', email: 'carolina.gomez@rocita.ai', phone: '+57 300 123 4567' },
            { id: 2, name: 'Dr. Alejandro Restrepo', specialty: 'Dermatología', email: 'alejandro.restrepo@rocita.ai', phone: '+57 301 987 6543' },
            { id: 3, name: 'Dr. Manuel Cabrera', specialty: 'Oftalmología', email: 'manuel.cabrera@rocita.ai', phone: '+57 312 456 7890' },
            { id: 4, name: 'Dra. Sandra Ortiz', specialty: 'Pediatría', email: 'sandra.ortiz@rocita.ai', phone: '+57 320 654 3210' },
            { id: 5, name: 'Dra. Diana Salazar', specialty: 'Ginecología', email: 'diana.salazar@rocita.ai', phone: '+57 301 222 3333' }
          ];
          setDbDoctors(defaultDocs);
          localStorage.setItem('rocita_doctors', JSON.stringify(defaultDocs));
        } else {
          setDbDoctors(data);
        }
      })
      .catch(() => {
        const local = localStorage.getItem('rocita_doctors');
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed && parsed.length > 0) {
            setDbDoctors(parsed);
            return;
          }
        }
        const defaultDocs = [
          { id: 1, name: 'Dra. Carolina Gómez', specialty: 'Cardiología', email: 'carolina.gomez@rocita.ai', phone: '+57 300 123 4567' },
          { id: 2, name: 'Dr. Alejandro Restrepo', specialty: 'Dermatología', email: 'alejandro.restrepo@rocita.ai', phone: '+57 301 987 6543' },
          { id: 3, name: 'Dr. Manuel Cabrera', specialty: 'Oftalmología', email: 'manuel.cabrera@rocita.ai', phone: '+57 312 456 7890' },
          { id: 4, name: 'Dra. Sandra Ortiz', specialty: 'Pediatría', email: 'sandra.ortiz@rocita.ai', phone: '+57 320 654 3210' },
          { id: 5, name: 'Dra. Diana Salazar', specialty: 'Ginecología', email: 'diana.salazar@rocita.ai', phone: '+57 301 222 3333' }
        ];
        setDbDoctors(defaultDocs);
        localStorage.setItem('rocita_doctors', JSON.stringify(defaultDocs));
      });
  }, [isAuthenticated, apiUrl]);

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

      // Validación de pestañas requeridas: solo Citas es mandatoria
      const requiredSheets = ['Citas'];
      const missingSheets = requiredSheets.filter(s => !sheetNames.includes(s));

      if (missingSheets.length > 0) {
        throw new Error(`Falta la pestaña requerida: ${missingSheets.join(', ')}`);
      }

      const parsedAppointments = XLSX.utils.sheet_to_json(workbook.Sheets['Citas']) as any[];
      const parsedPatients = sheetNames.includes('Pacientes') 
        ? XLSX.utils.sheet_to_json(workbook.Sheets['Pacientes']) as any[] 
        : [];
      const parsedProfessionals = sheetNames.includes('Profesionales') 
        ? XLSX.utils.sheet_to_json(workbook.Sheets['Profesionales']) as any[] 
        : [];

      // Conteo de registros (restando encabezado)
      const newCounts = {
        pacientes: parsedPatients.length || dbPatients.length,
        profesionales: parsedProfessionals.length || dbDoctors.length,
        citas: parsedAppointments.length,
      };

      // Extracción de datos muestra (Etapa 1)
      const samples = {
        pacientes: parsedPatients.length > 0 ? parsedPatients.slice(0, 3) : dbPatients.slice(0, 3),
        profesionales: parsedProfessionals.length > 0 ? parsedProfessionals.slice(0, 3) : dbDoctors.slice(0, 3),
        citas: parsedAppointments.slice(0, 3),
      };

      const joined = joinExcelSheets(workbook, dbPatients, dbDoctors);
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
    sentPatientsRef.current = {};
    
    // Tomamos hasta 6 pacientes de la lista para mostrar en la consola en vivo. Si no hay, cargamos mock.
    const sourceList = fullPatientsList.length > 0 ? fullPatientsList : [
      { name: 'Carlos Humberto Pérez', phone: '300 123 4567', doctor: 'Dra. Carolina Gómez', specialty: 'Cardiología', documentType: 'CC' },
      { name: 'Laura Camila Ruiz', phone: '315 987 6543', doctor: 'Dr. Alejandro Marín', specialty: 'Pediatría', documentType: 'CC' },
      { name: 'Mateo Sebastián Sánchez', phone: '310 456 7890', doctor: 'Dra. Sandra Milena', specialty: 'Dermatología', documentType: 'TI' },
      { name: 'Martha Cecilia Gómez', phone: '301 765 4321', doctor: 'Dr. Francisco Javier', specialty: 'Ginecología', documentType: 'CC' },
      { name: 'Sofía Isabel Vergara', phone: '312 345 6789', doctor: 'Dr. Andrés Felipe', specialty: 'Ortopedia', documentType: 'CC' },
      { name: 'Diego Alejandro Torres', phone: '320 111 2222', doctor: 'Dra. Patricia Ortiz', specialty: 'Oftalmología', documentType: 'CC' }
    ];
    
    if (fullPatientsList.length === 0) {
      setCounts(prev => ({ ...prev, citas: sourceList.length }));
    }

    const consoleList = sourceList.slice(0, 6).map((pat) => ({
      ...pat,
      step: 0, // 0: En cola, 1: Enviando WhatsApp, 2: Fallback/Fallo, 3: WhatsApp OK, 4: SMS OK, 5: Voz OK
      statusText: 'En cola...',
      channel: 'none'
    }));
    setLiveSendStatus(consoleList);

    // Progreso del loader general
    const interval = setInterval(() => {
      setSendProgress(prev => {
        const nextProgress = prev + 4;
        
        // Actualizar el estado de la simulación de consola en base al progreso general
        setLiveSendStatus(currentList => 
          currentList.map((pat, idx) => {
            // Distribuir el inicio de envíos según el índice
            const triggerProgress = idx * 12;
            if (nextProgress < triggerProgress) {
              return { ...pat, step: 0, statusText: 'En cola...', channel: 'none' };
            }

            // Paciente 1: Envío directo por WhatsApp
            if (idx === 0) {
              if (nextProgress < triggerProgress + 15) {
                return { ...pat, step: 1, statusText: 'Enviando WhatsApp...', channel: 'whatsapp' };
              }
              if (whatsappStatus === 'CONNECTED' && !sentPatientsRef.current[idx]) {
                sentPatientsRef.current[idx] = true;
                sendRealWhatsappMessage(pat);
              }
              return { ...pat, step: 3, statusText: 'Enviado por WhatsApp ✓', channel: 'whatsapp' };
            }

            // Paciente 2: Falla WhatsApp, se envía por SMS de respaldo
            if (idx === 1) {
              if (nextProgress < triggerProgress + 10) {
                return { ...pat, step: 1, statusText: 'Enviando WhatsApp...', channel: 'whatsapp' };
              }
              if (nextProgress < triggerProgress + 25) {
                return { ...pat, step: 2, statusText: 'Fallo WhatsApp ➜ Iniciando SMS...', channel: 'whatsapp' };
              }
              return { ...pat, step: 4, statusText: 'Enviado por SMS (Respaldo) ✓', channel: 'sms' };
            }

            // Paciente 3: Envío directo por WhatsApp
            if (idx === 2) {
              if (nextProgress < triggerProgress + 15) {
                return { ...pat, step: 1, statusText: 'Enviando WhatsApp...', channel: 'whatsapp' };
              }
              if (whatsappStatus === 'CONNECTED' && !sentPatientsRef.current[idx]) {
                sentPatientsRef.current[idx] = true;
                sendRealWhatsappMessage(pat);
              }
              return { ...pat, step: 3, statusText: 'Enviado por WhatsApp ✓', channel: 'whatsapp' };
            }

            // Paciente 4: Falla WhatsApp y SMS, se hace llamada de voz sintética (IA Voice Synthesizer)
            if (idx === 3) {
              if (nextProgress < triggerProgress + 8) {
                return { ...pat, step: 1, statusText: 'Enviando WhatsApp...', channel: 'whatsapp' };
              }
              if (nextProgress < triggerProgress + 18) {
                return { ...pat, step: 2, statusText: 'Fallo WhatsApp ➜ Reintentando SMS...', channel: 'whatsapp' };
              }
              if (nextProgress < triggerProgress + 30) {
                return { ...pat, step: 2, statusText: 'Fallo SMS ➜ Conmutando a llamada de voz...', channel: 'sms' };
              }
              return { ...pat, step: 5, statusText: 'Confirmado por Voz (IA Call) ✓', channel: 'voice' };
            }

            // Paciente 5: Envío directo por WhatsApp
            if (idx === 4) {
              if (nextProgress < triggerProgress + 15) {
                return { ...pat, step: 1, statusText: 'Enviando WhatsApp...', channel: 'whatsapp' };
              }
              if (whatsappStatus === 'CONNECTED' && !sentPatientsRef.current[idx]) {
                sentPatientsRef.current[idx] = true;
                sendRealWhatsappMessage(pat);
              }
              return { ...pat, step: 3, statusText: 'Enviado por WhatsApp ✓', channel: 'whatsapp' };
            }

            // Paciente 6: Falla WhatsApp, se envía por SMS de respaldo
            if (idx === 5) {
              if (nextProgress < triggerProgress + 10) {
                return { ...pat, step: 1, statusText: 'Enviando WhatsApp...', channel: 'whatsapp' };
              }
              if (nextProgress < triggerProgress + 25) {
                return { ...pat, step: 2, statusText: 'Fallo WhatsApp ➜ Conmutando SMS...', channel: 'whatsapp' };
              }
              return { ...pat, step: 4, statusText: 'Enviado por SMS (Respaldo) ✓', channel: 'sms' };
            }

            return pat;
          })
        );

        if (nextProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsSending(false);
            setStep(3);
          }, 1500);
          return 100;
        }
        return nextProgress;
      });
    }, 200);
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
    <DashboardLayout
      activeTab="campanas"
      title="Panel de Control"
      subtitle={user?.clinicName || 'Salud Eficiente'}
      headerExtra={
        <div className='relative hidden md:block'>
          <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
          <input 
            type="text" 
            placeholder="Buscar paciente..." 
            className='bg-white border border-blue-100 rounded-full py-2.5 pl-12 pr-6 text-sm focus:ring-2 focus:ring-sky-500 outline-none w-64 transition-all'
          />
        </div>
      }
    >
          {/* Steps Progress */}
          <div className='flex items-center justify-center gap-2 md:gap-4 mb-8 md:mb-16'>
            {[1, 2, 3].map((s) => (
              <div key={s} className='flex items-center gap-2 md:gap-4'>
                <motion.div 
                  initial={false}
                  animate={{ 
                    backgroundColor: step >= s ? '#0ea5e9' : '#fff',
                    color: step >= s ? '#fff' : '#94a3b8',
                    scale: step === s ? 1.1 : 1
                  }}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-[1.25rem] flex items-center justify-center font-black shadow-lg shadow-sky-500/10 border text-sm md:text-base ${step >= s ? 'border-sky-500' : 'border-slate-200'}`}
                >
                  {step > s ? <CheckCircle2 size={20} className="md:w-6 md:h-6" /> : s}
                </motion.div>
                {s < 3 && (
                  <div className='w-12 sm:w-20 md:w-24 h-1 bg-slate-200 rounded-full overflow-hidden'>
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
                <div className='bg-white border border-blue-100 rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-16 shadow-2xl shadow-sky-900/5 relative overflow-hidden'>
                  <div className='absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full -mr-32 -mt-32 blur-3xl'></div>
                  
                  <div className='relative z-10'>
                    <div className='flex items-start justify-between mb-8 md:mb-12'>
                      <div>
                        <h2 className='text-2xl md:text-4xl font-black tracking-tight mb-2 md:mb-4 text-slate-900'>Carga de Datos</h2>
                        <p className='text-slate-500 text-sm md:text-lg max-w-md font-medium'>
                          Sube tu archivo Excel para iniciar la campaña de recordatorios.
                        </p>
                      </div>
                      <div className='w-14 h-14 md:w-20 md:h-20 bg-sky-50 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-sky-500 shrink-0'>
                        <FileSpreadsheet className="w-6 h-6 md:w-8 md:h-8" />
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
                      className={`group w-full border-4 border-dashed rounded-[2rem] md:rounded-[3rem] p-8 md:p-20 flex flex-col items-center justify-center transition-all cursor-pointer ${isUploading ? 'border-sky-500 bg-sky-50' : 'border-sky-50 hover:border-sky-500 hover:bg-sky-50/50 bg-slate-50/50'}`}
                    >
                      {isUploading ? (
                        <div className='flex flex-col items-center'>
                          <div className='w-12 h-12 md:w-16 md:h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4 md:mb-6'></div>
                          <p className='text-lg md:text-xl font-black text-sky-600'>Validando registros...</p>
                        </div>
                      ) : (
                        <>
                          <div className='w-16 h-16 md:w-24 md:h-24 bg-white shadow-xl rounded-2xl md:rounded-[2.5rem] flex items-center justify-center text-sky-500 mb-6 md:mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500'>
                            <Upload className="w-8 h-8 md:w-10 md:h-10" />
                          </div>
                          <p className='text-xl md:text-2xl font-black text-slate-800 mb-2 md:mb-3 text-center'>Haz clic para subir tu Excel</p>
                          <p className='font-bold text-xs md:text-sm text-slate-400 text-center mb-6 md:mb-8'>Rocita validará: Pacientes, Profesionales y Citas.</p>
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
                  <div className='lg:col-span-2 bg-white border border-blue-100 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12 shadow-2xl shadow-sky-900/5'>
                    <h2 className='text-2xl md:text-3xl font-black tracking-tight mb-6 md:mb-8 flex items-center gap-3 md:gap-4 text-slate-900'>
                      <div className='w-10 h-10 md:w-12 md:h-12 bg-sky-500 rounded-xl md:rounded-2xl flex items-center justify-center text-white'>
                        <MessageSquare size={20} className="md:w-6 md:h-6" />
                      </div>
                      Cuerpo del Mensaje
                    </h2>
                    
                    <div className='mb-6 md:mb-8'>
                      <p className='text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 md:mb-4'>Variables de Salud</p>
                      <div className='flex flex-wrap gap-2 md:gap-3'>
                        {[
                          { id: '{nombre_paciente}', label: 'Paciente', icon: <User size={14} /> },
                          { id: '{nombre_doctor}', label: 'Doctor', icon: <Users size={14} /> },
                          { id: '{fecha_cita}', label: 'Fecha/Hora', icon: <Calendar size={14} /> },
                          { id: '{lugar}', label: 'Ubicación', icon: <Settings size={14} /> }
                        ].map(v => (
                          <button
                            key={v.id}
                            onClick={() => insertVariable(v.id)}
                            className='flex items-center gap-1.5 md:gap-2 px-4 md:px-5 py-2 md:py-3 bg-sky-50 text-sky-600 rounded-[1rem] md:rounded-[1.25rem] text-xs md:text-sm font-black hover:bg-sky-500 hover:text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-sm'
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
                        className='w-full h-80 p-5 md:p-8 bg-slate-50 border-2 border-transparent focus:border-sky-500 focus:bg-white rounded-[1.5rem] md:rounded-[2.5rem] outline-none transition-all duration-300 focus:ring-4 focus:ring-sky-500/20 font-sans text-base md:text-lg text-slate-800 leading-relaxed shadow-inner'
                      />
                      <div className='absolute bottom-6 right-6 px-3 py-1.5 bg-white/80 backdrop-blur rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 shadow-sm'>
                        {message.length} caracteres
                      </div>
                    </div>
 
                    <div className='flex items-center justify-between mt-8 md:mt-10'>
                      <button onClick={() => setStep(1)} className='px-6 md:px-8 py-3 md:py-4 text-slate-400 font-black hover:text-slate-800 hover:scale-105 active:scale-95 transition-all duration-200 text-sm md:text-base'>
                        Atrás
                      </button>
                      <button
                        onClick={handleSend}
                        className='bg-sky-500 text-white px-8 md:px-12 py-3 md:py-4 rounded-[1.25rem] md:rounded-[1.5rem] font-black text-sm md:text-lg hover:scale-105 active:scale-95 hover:shadow-sky-500/40 transition-all duration-200 shadow-xl shadow-sky-500/30 flex items-center gap-2 md:gap-3'
                      >
                        Programar Envío <Send size={18} className="md:w-5 md:h-5" />
                      </button>
                    </div>
                  </div>
 
                  <div className='space-y-6 md:space-y-8'>
                    <div className='bg-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 text-white shadow-2xl relative overflow-hidden group'>
                      <div className='absolute -right-10 -top-10 w-40 h-40 bg-sky-500/20 rounded-full blur-3xl'></div>
                      <h3 className='text-lg md:text-xl font-black mb-4 md:mb-6 relative z-10'>Vista Previa</h3>
                      <div className='bg-slate-800 rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-6 relative z-10 border border-slate-700/50'>
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
 
                    <div className='bg-white border border-blue-100 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 shadow-lg shadow-sky-900/5'>
                      <h3 className='font-black text-base md:text-lg mb-4 text-slate-900'>Resumen de Datos</h3>
                      <div className='space-y-3 md:space-y-4'>
                        <div className='flex items-center justify-between p-3.5 md:p-4 bg-slate-50 rounded-2xl'>
                          <p className='text-xs font-bold text-slate-500'>Pacientes</p>
                          <p className='font-black text-sky-600 text-sm md:text-base'>{counts.pacientes}</p>
                        </div>
                        <div className='flex items-center justify-between p-3.5 md:p-4 bg-slate-50 rounded-2xl'>
                          <p className='text-xs font-bold text-slate-500'>Profesionales</p>
                          <p className='font-black text-sky-600 text-sm md:text-base'>{counts.profesionales}</p>
                        </div>
                        <div className='flex items-center justify-between p-3.5 md:p-4 bg-sky-50 rounded-2xl border border-sky-200'>
                          <p className='text-xs font-bold text-sky-700'>Citas Hoy</p>
                          <p className='font-black text-sky-600 text-sm md:text-base'>{counts.citas}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              
              {(step === 3 || isSending) && (
                <div className={`flex flex-col items-center py-6 text-center ${isSending ? 'max-w-6xl' : 'max-w-2xl'} mx-auto w-full`}>
                  {isSending ? (
                    <div className="w-full flex flex-col items-center gap-10">
                      {/* Overall Progress Header */}
                      <div className="w-full bg-white/60 backdrop-blur-xl border border-blue-50/80 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-sky-955/5 relative overflow-hidden text-left">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                          <div className="space-y-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-xs font-black uppercase tracking-wider">
                              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
                              Transmisión en Vivo
                            </span>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Consola de Envío Omnicanal</h2>
                            <p className="text-slate-500 text-sm md:text-base font-medium max-w-xl">
                              El motor de IA está despachando los recordatorios. Cuando un canal falla, el sistema conmuta automáticamente al siguiente recurso disponible.
                            </p>
                          </div>
                          <div className="flex items-center gap-4 shrink-0 bg-slate-50/80 border border-slate-100 rounded-3xl p-4">
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progreso Global</p>
                              <p className="text-2xl font-black text-slate-900">{sendProgress}%</p>
                            </div>
                            <div className="w-12 h-12 bg-sky-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/30">
                              <Sparkles size={20} className="animate-spin duration-3000" />
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar & Counter */}
                        <div className="mt-8 space-y-3 relative z-10">
                          <div className="w-full bg-slate-100 h-5 rounded-full overflow-hidden shadow-inner border border-slate-200/50 p-0.5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${sendProgress}%` }}
                              className="h-full bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-500 rounded-full shadow-md"
                            />
                          </div>
                          <div className="flex justify-between items-center text-xs md:text-sm text-slate-500 font-bold px-1">
                            <p>Procesando {Math.min(counts.citas, Math.round((sendProgress/100) * counts.citas))} de {counts.citas} recordatorios</p>
                            <p className="text-sky-600 font-black animate-pulse">Líneas de comunicación activas</p>
                          </div>
                        </div>
                      </div>

                      {/* Live Grid of Monitored Patients */}
                      <div className="w-full text-left space-y-4">
                        <div className="flex items-center justify-between px-2">
                          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <Activity className="text-emerald-500 animate-pulse" size={20} />
                            Monitoreo de Canales (Pacientes Muestra)
                          </h3>
                          <span className="text-xs font-bold text-slate-400">Actualización en tiempo real</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {liveSendStatus.map((pat, idx) => {
                            const styles = getCardStyle(pat.step, pat.statusText);
                            return (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                                className={`bg-white/70 backdrop-blur-xl border-2 ${styles.border} ${styles.glow} rounded-[2rem] p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] relative group overflow-hidden min-h-[260px]`}
                              >
                                {/* Glow Accent inside card */}
                                <div className={`absolute top-0 right-0 w-24 h-24 ${styles.glowColor} rounded-full -mr-8 -mt-8 blur-2xl transition-all duration-500 group-hover:scale-150`} />
                                
                                <div className="space-y-4 relative z-10">
                                  {/* Card Header: Patient & Contact */}
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-black text-slate-800 text-base leading-snug tracking-tight truncate max-w-[170px]">{pat.name}</h4>
                                      <p className="text-slate-400 text-xs font-mono tracking-wider">{pat.phone}</p>
                                    </div>
                                    <span className="text-[10px] font-black px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                                      {pat.documentType || 'CC'}
                                    </span>
                                  </div>

                                  {/* Doctor & Specialty Info */}
                                  <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                                      <User size={12} className="text-slate-400 shrink-0" />
                                      <span className="truncate">{pat.doctor}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-bold pl-5 uppercase tracking-wider">
                                      {pat.specialty || 'Consulta General'}
                                    </div>
                                  </div>

                                  {/* Omnichannel Flow Visualization */}
                                  <div className="py-2">
                                    <div className="flex items-center justify-between px-2 relative">
                                      {/* Connector Line 1 (WA to SMS) */}
                                      <div className="absolute top-1/2 left-[18%] right-[55%] h-0.5 -translate-y-1/2 z-0">
                                        <div className={`h-full w-full border-t-2 border-dashed transition-colors duration-300 ${
                                          pat.step >= 2 && pat.step !== 3 ? 'border-amber-400' : 'border-slate-200'
                                        }`} />
                                      </div>

                                      {/* Connector Line 2 (SMS to Voice) */}
                                      <div className="absolute top-1/2 left-[55%] right-[18%] h-0.5 -translate-y-1/2 z-0">
                                        <div className={`h-full w-full border-t-2 border-dashed transition-colors duration-300 ${
                                          pat.step === 5 || (pat.step === 2 && pat.statusText.includes('llamada')) ? 'border-amber-400' : 'border-slate-200'
                                        }`} />
                                      </div>

                                      {/* Node 1: WhatsApp */}
                                      <div className="flex flex-col items-center gap-1 z-10">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                          pat.step === 1
                                            ? 'bg-emerald-100 text-emerald-500 border-2 border-emerald-500 animate-pulse'
                                            : pat.step === 3
                                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                            : pat.step >= 2
                                            ? 'bg-rose-50 text-rose-500 border border-rose-200'
                                            : 'bg-slate-50 text-slate-300 border border-slate-100'
                                        }`}>
                                          <MessageCircle size={14} />
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">WhatsApp</span>
                                      </div>

                                      {/* Node 2: SMS */}
                                      <div className="flex flex-col items-center gap-1 z-10">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                          pat.step === 2 && pat.statusText.includes('SMS')
                                            ? 'bg-sky-100 text-sky-500 border-2 border-sky-500 animate-pulse'
                                            : pat.step === 4
                                            ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                                            : pat.step === 5
                                            ? 'bg-rose-50 text-rose-500 border border-rose-200'
                                            : 'bg-slate-50 text-slate-300 border border-slate-100'
                                        }`}>
                                          <MessageSquare size={14} />
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">SMS</span>
                                      </div>

                                      {/* Node 3: Voice Call */}
                                      <div className="flex flex-col items-center gap-1 z-10">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                          (pat.step === 2 && (pat.statusText.includes('llamada') || pat.statusText.includes('voz')))
                                            ? 'bg-purple-100 text-purple-500 border-2 border-purple-500 animate-pulse'
                                            : pat.step === 5
                                            ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                                            : 'bg-slate-50 text-slate-300 border border-slate-100'
                                        }`}>
                                          <PhoneCall size={14} />
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Llamada IA</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Status Badge */}
                                <div className="mt-4 pt-3 border-t border-slate-100/50 relative z-10">
                                  <div className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black ${styles.badgeBg}`}>
                                    <span className={`w-2 h-2 rounded-full ${styles.dotColor} shrink-0`} />
                                    <span className="truncate">{pat.statusText}</span>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
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
              <div className="flex items-center border-b border-slate-100 pb-2 gap-2 overflow-x-auto scrollbar-none flex-nowrap md:flex-wrap">
                {[
                  { id: 'pacientes', label: 'Pacientes', count: counts.pacientes, icon: <User size={16} /> },
                  { id: 'profesionales', label: 'Profesionales', count: counts.profesionales, icon: <Users size={16} /> },
                  { id: 'citas', label: 'Citas', count: counts.citas, icon: <Calendar size={16} /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePreviewTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all whitespace-nowrap shrink-0 ${
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
    </DashboardLayout>
  );
}
