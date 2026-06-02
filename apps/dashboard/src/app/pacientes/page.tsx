'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  LayoutDashboard,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  Calendar,
  Send,
  ShieldCheck,
  MessageSquare,
  X,
  CheckCheck,
  RefreshCw,
  Eye
} from 'lucide-react';

interface AppointmentHistory {
  date: string;
  specialty: string;
  doctor: string;
  status: 'Asistió' | 'Confirmado' | 'Cancelado' | 'Pendiente';
}

interface ChatMessage {
  sender: 'paciente' | 'rocita';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  status: 'Confirmado' | 'Pendiente' | 'Cancelado';
  specialty: string;
  doctor: string;
  nextAppointment: string;
  history: AppointmentHistory[];
  chatHistory: ChatMessage[];
}

export default function PacientesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Confirmado' | 'Pendiente' | 'Cancelado'>('Todos');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  
  // State for simulated WhatsApp reminder sending
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [sendingStep, setSendingStep] = useState('');
  const [sendingProgress, setSendingProgress] = useState(0);

  // Default patients dataset matching requested mock data
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 'pat-1',
      name: 'Carlos Humberto Pérez',
      age: 45,
      phone: '+57 310 123 4567',
      email: 'carlos.perez@email.com',
      status: 'Confirmado',
      specialty: 'Cardiología',
      doctor: 'Dra. Carolina Gómez',
      nextAppointment: 'Lunes 25 de Mayo - 10:30 AM',
      history: [
        { date: '12 de Abr 2026', specialty: 'Consulta General', doctor: 'Dr. Alejandro Restrepo', status: 'Asistió' },
        { date: '25 de May 2026', specialty: 'Cardiología', doctor: 'Dra. Carolina Gómez', status: 'Confirmado' }
      ],
      chatHistory: [
        { sender: 'rocita', text: 'Hola Carlos. Te escribe Rocita, asistente virtual de Salud Eficiente. Queremos recordarte tu cita programada con la Dra. Carolina Gómez (Cardiología) el Lunes 25 de Mayo a las 10:30 AM en el Consultorio 402. ¿Confirmas tu asistencia? Responde 1 para SÍ, o 2 para NO.', time: '09:00 AM', status: 'read' },
        { sender: 'paciente', text: 'Hola! Sí claro, allá estaré. Muchas gracias por avisar.', time: '09:02 AM' },
        { sender: 'rocita', text: '¡Excelente! Hemos confirmado tu asistencia de manera automática en el sistema. Que tengas un feliz día.', time: '09:02 AM', status: 'read' }
      ]
    },
    {
      id: 'pat-2',
      name: 'Laura Ruiz',
      age: 29,
      phone: '+57 315 987 6543',
      email: 'laura.ruiz@email.com',
      status: 'Cancelado',
      specialty: 'Dermatología',
      doctor: 'Dr. Alejandro Restrepo',
      nextAppointment: 'Hoy - 4:00 PM',
      history: [
        { date: '10 de Mar 2026', specialty: 'Limpieza Facial', doctor: 'Dra. Sandra Ortiz', status: 'Asistió' },
        { date: '22 de May 2026', specialty: 'Dermatología', doctor: 'Dr. Alejandro Restrepo', status: 'Cancelado' }
      ],
      chatHistory: [
        { sender: 'rocita', text: 'Hola Laura. Te escribe Rocita. Queremos recordarte tu cita programada con el Dr. Alejandro Restrepo (Dermatología) hoy a las 4:00 PM. ¿Confirmas tu asistencia? Responde 1 para SÍ, o 2 para NO.', time: '08:30 AM', status: 'read' },
        { sender: 'paciente', text: '2', time: '08:42 AM' },
        { sender: 'rocita', text: 'Entendido, Laura. Has indicado que NO asistirás. ¿Deseas que te contactemos para reprogramar tu cita?', time: '08:42 AM', status: 'read' },
        { sender: 'paciente', text: 'Sí por favor, se me cruzó un viaje de trabajo y no alcanzo a llegar hoy. Gracias.', time: '08:43 AM' },
        { sender: 'rocita', text: 'Perfecto. Hemos liberado tu espacio en el consultorio y un asesor de Servicio al Cliente te escribirá para reasignar tu cita. ¡Buen viaje!', time: '08:44 AM', status: 'read' }
      ]
    },
    {
      id: 'pat-3',
      name: 'Mateo Sánchez',
      age: 19,
      phone: '+57 312 456 7890',
      email: 'mateo.sanchez@email.com',
      status: 'Pendiente',
      specialty: 'Oftalmología',
      doctor: 'Dr. Manuel Cabrera',
      nextAppointment: 'Mañana - 2:00 PM',
      history: [
        { date: '23 de May 2026', specialty: 'Oftalmología', doctor: 'Dr. Manuel Cabrera', status: 'Pendiente' }
      ],
      chatHistory: [] // Empty history to show "No messages yet, send a manual reminder"
    },
    {
      id: 'pat-4',
      name: 'Martha Lucía Gómez',
      age: 38,
      phone: '+57 320 654 3210',
      email: 'martha.gomez@email.com',
      status: 'Confirmado',
      specialty: 'Pediatría',
      doctor: 'Dra. Sandra Ortiz',
      nextAppointment: 'Mañana - 9:00 AM',
      history: [
        { date: '23 de May 2026', specialty: 'Pediatría', doctor: 'Dra. Sandra Ortiz', status: 'Confirmado' }
      ],
      chatHistory: [
        { sender: 'rocita', text: 'Hola Martha. Te escribe Rocita. Recordamos la cita de Pediatría programada para mañana a las 9:00 AM con la Dra. Sandra Ortiz. ¿Confirmas la asistencia? Responde 1 para SÍ, o 2 para NO.', time: '07:05 AM', status: 'read' },
        { sender: 'paciente', text: '1', time: '07:15 AM' },
        { sender: 'rocita', text: '¡Cita Confirmada con éxito! Gracias por tu puntualidad. Recuerda llegar 15 minutos antes.', time: '07:16 AM', status: 'read' }
      ]
    },
    {
      id: 'pat-5',
      name: 'Sofía Vergara',
      age: 52,
      phone: '+57 301 222 3333',
      email: 'sofia.vergara@email.com',
      status: 'Pendiente',
      specialty: 'Ginecología',
      doctor: 'Dra. Diana Salazar',
      nextAppointment: 'Viernes 29 de Mayo - 11:00 AM',
      history: [
        { date: '29 de May 2026', specialty: 'Control Ginecología', doctor: 'Dra. Diana Salazar', status: 'Pendiente' }
      ],
      chatHistory: [] // Empty history to allow sending reminder
    }
  ]);

  // Auth Protection Check & Fetch Patients from Backend
  useEffect(() => {
    const auth = localStorage.getItem('rocita_auth');
    if (!auth) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      
      // Intentar cargar pacientes de la base de datos real SQLite de NestJS
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      fetch(`${apiUrl}/patients`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Error al conectar');
        })
        .then((data) => {
          if (data && data.length > 0) {
            // Mapeamos los datos de la base de datos a la interfaz de la página
            const mappedPatients = data.map((p: any) => ({
              id: `pat-${p.id}`,
              name: p.name,
              age: p.age || 30,
              phone: p.phone || '',
              email: p.email || '',
              status: p.status || 'Pendiente',
              specialty: p.specialty || 'Consulta General',
              doctor: p.doctor || 'Dr. Alejandro Restrepo',
              nextAppointment: p.nextAppointment || 'Próximamente',
              history: [
                { date: 'Hoy', specialty: p.specialty || 'Consulta General', doctor: p.doctor || 'Dr. Alejandro Restrepo', status: p.status || 'Pendiente' }
              ],
              chatHistory: []
            }));
            setPatients(mappedPatients);
          }
        })
        .catch((err) => {
          console.warn('Backend desconectado o sin registros en SQLite. Usando pacientes estáticos de la demo.', err);
        });
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('rocita_auth');
    router.push('/login');
  };

  // Open Drawer and Select Patient
  const handleOpenDrawer = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDrawer(true);
  };

  // Close Drawer
  const handleCloseDrawer = () => {
    if (!isSendingReminder) {
      setShowDrawer(false);
      setSelectedPatient(null);
    }
  };

  // Action: Send Manual Reminder Simulation
  const handleSendReminder = async () => {
    if (!selectedPatient || isSendingReminder) return;

    setIsSendingReminder(true);
    setSendingProgress(5);
    setSendingStep('Iniciando canal de comunicación...');

    // Step-by-step progress simulation for premium UX
    const steps = [
      { progress: 20, text: 'Validando API de WhatsApp Business...' },
      { progress: 45, text: 'Estructurando plantilla omnicanal para ' + selectedPatient.name + '...' },
      { progress: 75, text: 'Transmitiendo payload encriptado de forma segura...' },
      { progress: 95, text: 'Confirmando entrega de mensaje...' },
      { progress: 100, text: '¡Recordatorio enviado con éxito!' }
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setSendingProgress(steps[i].progress);
      setSendingStep(steps[i].text);
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Get current time formatted
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + ' ' + (now.getHours() >= 12 ? 'PM' : 'AM');

    // Create the sent reminder message
    const reminderMessage: ChatMessage = {
      sender: 'rocita',
      text: `Hola ${selectedPatient.name.split(' ')[0]}. Te escribe Rocita, asistente virtual de Salud Eficiente. Queremos recordarte tu cita programada de ${selectedPatient.specialty} con ${selectedPatient.doctor} el ${selectedPatient.nextAppointment}. ¿Confirmas tu asistencia? Responde 1 para SÍ, o 2 para NO.`,
      time: timeString,
      status: 'read'
    };

    // Update patient record
    const updatedPatients = patients.map(p => {
      if (p.id === selectedPatient.id) {
        const newChat = [...p.chatHistory, reminderMessage];
        // If they were pending, let's simulate that sending it puts the status as "Pendiente" but with chat initialized.
        // Let's also simulate an auto-response after 3 seconds for patients Carlos, Martha or Mateo to make the dashboard alive!
        return {
          ...p,
          chatHistory: newChat
        };
      }
      return p;
    });

    setPatients(updatedPatients);
    
    // Update active patient in drawer
    setSelectedPatient(prev => prev ? { ...prev, chatHistory: [...prev.chatHistory, reminderMessage] } : null);

    setIsSendingReminder(false);
    setSendingProgress(0);
    setSendingStep('');

    // Dynamic auto-reply simulation for "Mateo Sánchez" or "Sofía Vergara" to demonstrate active AI processing
    if (selectedPatient.id === 'pat-3' || selectedPatient.id === 'pat-5') {
      setTimeout(() => {
        // Patient responds "1" (Yes)
        const patientResponse: ChatMessage = {
          sender: 'paciente',
          text: '1',
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + ' ' + (new Date().getHours() >= 12 ? 'PM' : 'AM')
        };

        const rocitaFinalResponse: ChatMessage = {
          sender: 'rocita',
          text: '¡Excelente! Hemos confirmado tu asistencia de manera automática en el sistema. Que tengas un feliz día.',
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + ' ' + (new Date().getHours() >= 12 ? 'PM' : 'AM'),
          status: 'read'
        };

        setPatients(prevPatients =>
          prevPatients.map(p => {
            if (p.id === selectedPatient.id) {
              return {
                ...p,
                status: 'Confirmado',
                chatHistory: [...p.chatHistory, patientResponse, rocitaFinalResponse]
              };
            }
            return p;
          })
        );

        // If drawer is still open, update selectedPatient view in real-time
        setSelectedPatient(prev => {
          if (prev && prev.id === selectedPatient.id) {
            return {
              ...prev,
              status: 'Confirmado',
              chatHistory: [...prev.chatHistory, patientResponse, rocitaFinalResponse]
            };
          }
          return prev;
        });
      }, 3000);
    }
  };

  // Filtering Logic
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patient.phone.includes(searchQuery) ||
                          patient.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patient.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'Todos' || patient.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalCount = patients.length;
  const confirmedCount = patients.filter(p => p.status === 'Confirmado').length;
  const pendingCount = patients.filter(p => p.status === 'Pendiente').length;
  const attendanceRate = ((confirmedCount / (totalCount - patients.filter(p => p.status === 'Cancelado').length)) * 100).toFixed(1);

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-[#E0F2FE] font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-blue-100 p-8 flex flex-col gap-10 shadow-sm z-10">
        <div className="flex items-center gap-3 font-black text-2xl tracking-tighter text-slate-900 group cursor-pointer">
          <div className="relative">
            <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-sky-500/20 group-hover:rotate-6 transition-transform">
              R
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-sky-500 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <span>
            <span className="font-extrabold tracking-tight text-slate-900">Ro</span><span className="font-extrabold tracking-tight text-sky-500">cita</span>
          </span>
        </div>

        <nav className="flex flex-col gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 px-4">Principal</p>
          <a href="/" className="flex items-center gap-3 p-4 text-slate-500 hover:bg-sky-50 hover:text-sky-600 rounded-[1.5rem] font-bold transition-all group">    
            <LayoutDashboard size={20} className="group-hover:scale-110 transition-transform" /> Campañas
          </a>
          <a href="/reportes" className="flex items-center gap-3 p-4 text-slate-500 hover:bg-sky-50 hover:text-sky-600 rounded-[1.5rem] font-bold transition-all group">
            <BarChart3 size={20} className="group-hover:scale-110 transition-transform" /> Reportes
          </a>
          <a href="/pacientes" className="flex items-center justify-between p-4 bg-sky-500 text-white rounded-[1.5rem] font-bold shadow-xl shadow-sky-500/20 transition-all group">
            <div className="flex items-center gap-3">
              <User size={20} /> Pacientes
            </div>
            <ChevronRight size={16} className="opacity-50" />
          </a>
          <a href="/notificaciones" className="flex items-center justify-between p-4 text-slate-500 hover:bg-sky-50 hover:text-sky-600 rounded-[1.5rem] font-bold transition-all group">
            <div className="flex items-center gap-3">
              <Bell size={20} className="group-hover:scale-110 transition-transform" /> Notificaciones
            </div>
            <span className="px-2 py-0.5 bg-sky-500 text-white text-[10px] font-black rounded-full shadow-md shadow-sky-500/10 group-hover:scale-110 transition-all">3</span>
          </a>
          
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-6 mb-2 px-4">Sistema</p>
          <a href="/configuracion" className="flex items-center gap-3 p-4 text-slate-500 hover:bg-sky-50 hover:text-sky-600 rounded-[1.5rem] font-bold transition-all group">
            <Settings size={20} className="group-hover:scale-110 transition-transform" /> Configuración
          </a>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 p-4 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-[1.5rem] font-bold transition-all group mt-2"
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform" /> Cerrar Sesión
          </button>
        </nav>

        <div className="mt-auto bg-sky-50 rounded-[2rem] p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-all"></div>
          <p className="text-xs font-bold text-sky-600 mb-1">Plan Pro</p>
          <p className="text-xs text-sky-800/60 leading-relaxed font-medium">Tu institución está operando al 100% de eficiencia.</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-24 border-b border-blue-100 bg-white/50 backdrop-blur-md px-12 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Directorio Clínico</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Base de Pacientes</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar paciente o especialidad..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-blue-100 rounded-full py-2.5 pl-12 pr-6 text-sm focus:ring-2 focus:ring-sky-500 outline-none w-72 transition-all shadow-sm"
              />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-white shadow-sm flex items-center justify-center font-bold text-slate-600">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'JJ'}
            </div>
          </div>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-12 space-y-8">
          
          {/* Clinical KPIs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Card 1: Total Patients */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-white rounded-[2rem] p-6 border border-blue-100/50 shadow-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-sky-500/5 to-transparent rounded-bl-[4rem]"></div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Pacientes</p>
              <h3 className="text-3xl font-black mt-2 text-slate-900">{totalCount}</h3>
              <p className="text-[10px] font-bold text-sky-500 mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping"></span> Activos en el Sistema
              </p>
            </motion.div>

            {/* Card 2: Attendance Rate */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-white rounded-[2rem] p-6 border border-blue-100/50 shadow-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-[4rem]"></div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Tasa de Asistencia</p>
              <h3 className="text-3xl font-black mt-2 text-emerald-600">{attendanceRate}%</h3>
              <p className="text-[10px] font-bold text-emerald-500 mt-2">
                Eficiencia Óptima de Citas
              </p>
            </motion.div>

            {/* Card 3: Confirmed Today */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-white rounded-[2rem] p-6 border border-blue-100/50 shadow-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-[4rem]"></div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Confirmados</p>
              <h3 className="text-3xl font-black mt-2 text-blue-600">{confirmedCount}</h3>
              <p className="text-[10px] font-bold text-blue-500 mt-2">
                Asistencia validada hoy/mañana
              </p>
            </motion.div>

            {/* Card 4: Pending Reminders */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-white rounded-[2rem] p-6 border border-blue-100/50 shadow-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-bl-[4rem]"></div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Pendientes</p>
              <h3 className="text-3xl font-black mt-2 text-amber-600">{pendingCount}</h3>
              <p className="text-[10px] font-bold text-amber-500 mt-2">
                Requieren recordatorio manual/auto
              </p>
            </motion.div>
          </div>

          {/* Search, Filter & Actions Section */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-blue-100/50 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="flex flex-wrap items-center gap-2">
                {(['Todos', 'Confirmado', 'Pendiente', 'Cancelado'] as const).map((status) => {
                  const isActive = statusFilter === status;
                  return (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-5 py-2.5 rounded-full text-xs font-black transition-all ${
                        isActive
                          ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                          : 'bg-slate-50 text-slate-500 hover:bg-sky-50 hover:text-sky-600'
                      }`}
                    >
                      {status === 'Todos' ? 'Todos los Pacientes' : status}
                    </button>
                  );
                })}
              </div>
              
              <div className="text-xs font-bold text-slate-400 bg-slate-50 px-4 py-2.5 rounded-full">
                Mostrando <span className="text-slate-800">{filteredPatients.length}</span> de <span className="text-slate-800">{patients.length}</span> registros
              </div>
            </div>

            {/* Patients List/Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                    <th className="py-4 px-6">Paciente</th>
                    <th className="py-4 px-6">Contacto</th>
                    <th className="py-4 px-6">Próxima Cita</th>
                    <th className="py-4 px-6">Estado</th>
                    <th className="py-4 px-6 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => {
                      const initials = patient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                      
                      let statusBadge = '';
                      if (patient.status === 'Confirmado') {
                        statusBadge = 'bg-emerald-50 text-emerald-600 border-emerald-100';
                      } else if (patient.status === 'Pendiente') {
                        statusBadge = 'bg-amber-50 text-amber-600 border-amber-100';
                      } else {
                        statusBadge = 'bg-red-50 text-red-600 border-red-100';
                      }

                      return (
                        <tr key={patient.id} className="group hover:bg-sky-50/20 transition-all">
                          {/* Patient profile */}
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-sky-100 to-sky-200 text-sky-700 font-bold flex items-center justify-center border border-white shadow-sm shrink-0">
                                {initials}
                              </div>
                              <div>
                                <h4 className="font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors">{patient.name}</h4>
                                <span className="text-xs text-slate-400 font-bold">{patient.age} años</span>
                              </div>
                            </div>
                          </td>

                          {/* Contact information */}
                          <td className="py-5 px-6">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                <Phone size={13} className="text-slate-400" />
                                {patient.phone}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                <Mail size={13} className="text-slate-400" />
                                {patient.email}
                              </div>
                            </div>
                          </td>

                          {/* Next Appointment */}
                          <td className="py-5 px-6">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                                <Calendar size={13} className="text-sky-500" />
                                {patient.nextAppointment}
                              </div>
                              <p className="text-[11px] font-bold text-slate-400 pl-4.5">
                                {patient.specialty} • <span className="text-slate-500">{patient.doctor}</span>
                              </p>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-5 px-6">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border ${statusBadge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                patient.status === 'Confirmado' ? 'bg-emerald-500' : patient.status === 'Pendiente' ? 'bg-amber-500' : 'bg-red-500'
                              }`} />
                              {patient.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-5 px-6 text-center">
                            <button
                              onClick={() => handleOpenDrawer(patient)}
                              className="px-4 py-2 bg-slate-50 hover:bg-sky-500 hover:text-white text-slate-600 font-extrabold text-xs rounded-xl border border-slate-100 hover:border-sky-500 transition-all inline-flex items-center gap-2 group/btn active:scale-95 duration-200"
                            >
                              <Eye size={14} className="group-hover/btn:scale-110 transition-transform" />
                              Ver Detalle
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-bold">
                        <div className="flex flex-col items-center gap-3">
                          <User size={40} className="text-slate-200" />
                          <p>No se encontraron pacientes para tu búsqueda o filtro.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Patient Detail slide-over Drawer (WOW Factor) */}
      <AnimatePresence>
        {showDrawer && selectedPatient && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDrawer}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm z-40"
            />

            {/* Slide-over Right Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-screen w-full max-w-lg bg-white shadow-2xl border-l border-blue-50 z-50 flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-950">Ficha del Paciente</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {selectedPatient.id}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseDrawer}
                  disabled={isSendingReminder}
                  className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                
                {/* Profile Card Summary */}
                <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl shadow-sky-500/15">
                  <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-x-10 translate-y-10 blur-xl"></div>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white text-sky-600 text-2xl font-black flex items-center justify-center shadow-lg">
                      {selectedPatient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xl font-black leading-tight">{selectedPatient.name}</h4>
                      <p className="text-xs font-bold text-sky-100">{selectedPatient.age} años • Paciente Registrado</p>
                      
                      <div className="pt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black text-white border border-white/10">
                          <Phone size={10} /> {selectedPatient.phone}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black text-white border border-white/10">
                          <Mail size={10} /> {selectedPatient.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment Status Info */}
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                  <h5 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Clock size={16} className="text-sky-500" /> Detalle de la Próxima Cita
                  </h5>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Especialidad</span>
                      <p className="text-xs font-black text-slate-800">{selectedPatient.specialty}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Médico Tratante</span>
                      <p className="text-xs font-black text-slate-800">{selectedPatient.doctor}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Fecha Programada</span>
                      <p className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <Calendar size={14} className="text-sky-500" />
                        {selectedPatient.nextAppointment}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simulated Encrypted WhatsApp Chat Logs */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <MessageSquare size={16} className="text-emerald-500" /> Chat de Recordatorio (WhatsApp)
                    </h5>
                    
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Canal Activo
                    </span>
                  </div>

                  {/* Encryption Notice */}
                  <div className="bg-amber-50/50 rounded-2xl p-3 border border-amber-100/50 flex items-start gap-2 text-[10px] font-semibold text-amber-800 leading-normal">
                    <ShieldCheck size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <p>Las comunicaciones y los recordatorios clínicos se envían utilizando la API oficial de WhatsApp Business. Todo el flujo de datos está encriptado y cumple con las regulaciones de protección de datos de salud.</p>
                  </div>

                  {/* Chat Bubbles Box */}
                  <div className="border border-slate-100 rounded-3xl bg-slate-950 p-6 min-h-[220px] flex flex-col gap-4 shadow-inner max-h-[300px] overflow-y-auto">
                    {selectedPatient.chatHistory && selectedPatient.chatHistory.length > 0 ? (
                      selectedPatient.chatHistory.map((msg, index) => {
                        const isRocita = msg.sender === 'rocita';
                        return (
                          <div
                            key={index}
                            className={`flex flex-col max-w-[85%] ${isRocita ? 'self-start' : 'self-end'}`}
                          >
                            <div
                              className={`p-4 rounded-[1.5rem] text-xs leading-relaxed ${
                                isRocita
                                  ? 'bg-slate-800 text-slate-100 rounded-tl-none font-medium'
                                  : 'bg-emerald-600 text-white rounded-tr-none font-bold'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                            <div className={`flex items-center gap-1 mt-1 text-[9px] font-bold text-slate-500 ${isRocita ? 'self-start pl-1' : 'self-end pr-1'}`}>
                              <span>{msg.time}</span>
                              {isRocita && (
                                <CheckCheck size={12} className="text-sky-500" />
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 py-8 gap-2">
                        <MessageSquare size={32} className="text-slate-800 animate-pulse" />
                        <p className="text-xs font-bold text-slate-400">Sin mensajes en el historial.</p>
                        <p className="text-[10px] text-slate-500">Envía un recordatorio manual para activar el flujo del asistente.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Appointment Attendance History */}
                <div className="space-y-4">
                  <h5 className="font-extrabold text-sm text-slate-900">Historial Clínico del Paciente</h5>
                  
                  <div className="border border-slate-100 rounded-3xl divide-y divide-slate-50 overflow-hidden bg-slate-50/30">
                    {selectedPatient.history.map((hist, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between text-xs">
                        <div className="space-y-1">
                          <p className="font-extrabold text-slate-800">{hist.specialty}</p>
                          <p className="text-[10px] font-bold text-slate-400">{hist.date} • {hist.doctor}</p>
                        </div>
                        
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          hist.status === 'Asistió' || hist.status === 'Confirmado'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : hist.status === 'Cancelado'
                            ? 'bg-red-50 text-red-600 border-red-100'
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {hist.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Drawer Footer Actions */}
              <div className="p-8 border-t border-slate-100 shrink-0 bg-slate-50/50">
                {isSendingReminder ? (
                  /* Premium Loading State with Circular Progress */
                  <div className="bg-sky-500 text-white rounded-[1.5rem] p-4 flex flex-col gap-3 shadow-xl shadow-sky-500/20">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="animate-spin text-white shrink-0" size={18} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black truncate">{sendingStep}</p>
                        <div className="w-full bg-sky-600 h-1.5 rounded-full mt-2 overflow-hidden">
                          <motion.div
                            animate={{ width: `${sendingProgress}%` }}
                            transition={{ duration: 0.3 }}
                            className="bg-white h-full"
                          />
                        </div>
                      </div>
                      <span className="text-xs font-black shrink-0">{sendingProgress}%</span>
                    </div>
                  </div>
                ) : (
                  /* Default Action Button */
                  <button
                    onClick={handleSendReminder}
                    className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-black text-sm rounded-[1.5rem] shadow-xl shadow-sky-500/25 hover:shadow-sky-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 duration-200 group/send"
                  >
                    <Send size={16} className="group-hover/send:translate-x-1 group-hover/send:-translate-y-0.5 transition-transform" />
                    Enviar Recordatorio Manual
                  </button>
                )}
                
                <p className="text-[10px] text-center text-slate-400 font-bold mt-3">
                  Rocita enviará automáticamente un recordatorio de WhatsApp.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
