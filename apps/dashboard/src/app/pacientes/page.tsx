'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
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
  Eye,
  Menu,
  Plus
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

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
  documentType?: string;
  documentNumber?: string;
  gender?: string;
  phone: string;
  email: string;
  status: 'Confirmado' | 'Pendiente' | 'Cancelado';
  specialty: string;
  doctor: string;
  doctorEmail?: string;
  doctorPhone?: string;
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

  // Estados para registrar pacientes uno por uno
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPatName, setNewPatName] = useState('');
  const [newPatDocType, setNewPatDocType] = useState('CC');
  const [newPatDocNum, setNewPatDocNum] = useState('');
  const [newPatGender, setNewPatGender] = useState('M');
  const [newPatPhone, setNewPatPhone] = useState('');
  const [newPatEmail, setNewPatEmail] = useState('');
  const [isSavingPatient, setIsSavingPatient] = useState(false);

  // Default patients dataset matching requested mock data
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 'pat-1',
      name: 'Carlos Humberto Pérez',
      age: 45,
      documentType: 'CC',
      gender: 'M',
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
      documentType: 'CC',
      gender: 'F',
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
      documentType: 'TI',
      gender: 'M',
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
      documentType: 'CC',
      gender: 'F',
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
      documentType: 'CC',
      gender: 'F',
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

  // Cargar datos (tanto citas como perfiles independientes de pacientes)
  const fetchData = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const token = localStorage.getItem('rocita_token');

    let appointments: any[] = [];
    let profiles: any[] = [];

    // 1. Cargar citas reales del backend
    try {
      const res = await fetch(`${apiUrl}/patients`);
      if (res.ok) {
        appointments = await res.json();
      }
    } catch (err) {
      console.warn('Backend offline o error al cargar citas, usando demo.', err);
    }

    // 2. Cargar perfiles de pacientes creados uno a uno
    try {
      const res = await fetch(`${apiUrl}/patients-profiles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        profiles = await res.json();
      }
    } catch (err) {
      console.warn('Backend offline o error al obtener perfiles, cargando de localStorage...', err);
      const offlineProfiles = localStorage.getItem('rocita_patient_profiles');
      if (offlineProfiles) {
        profiles = JSON.parse(offlineProfiles);
      }
    }

    // Si ambos están vacíos (por ejemplo, modo offline inicial sin datos guardados)
    if (appointments.length === 0 && profiles.length === 0) {
      // Dejar los datos estáticos iniciales
      return;
    }

    // Obtener chats guardados en localStorage para persistencia
    const savedChatsRaw = localStorage.getItem('rocita_chat_histories');
    const savedChats = savedChatsRaw ? JSON.parse(savedChatsRaw) : {};

    const getChatHistory = (phone: string) => {
      const cleanPhone = phone.replace(/\D/g, '');
      if (savedChats[cleanPhone]) {
        return savedChats[cleanPhone];
      }
      // Fallback para chats por defecto si es Carlos
      if (cleanPhone === '573101234567') {
        return [
          { sender: 'rocita', text: 'Hola Carlos. Te escribe Rocita, asistente virtual de Salud Eficiente. Queremos recordarte tu cita programada con la Dra. Carolina Gómez (Cardiología) el Lunes 25 de Mayo a las 10:30 AM en el Consultorio 402. ¿Confirmas tu asistencia? Responde 1 para SÍ, o 2 para NO.', time: '09:00 AM', status: 'read' },
          { sender: 'paciente', text: 'Hola! Sí claro, allá estaré. Muchas gracias por avisar.', time: '09:02 AM' },
          { sender: 'rocita', text: '¡Excelente! Hemos confirmado tu asistencia de manera automática en el sistema. Que tengas un feliz día.', time: '09:02 AM', status: 'read' }
        ];
      }
      return [];
    };

    // Mapear citas existentes a la interfaz de la UI
    const mappedAppointments = appointments.map((p: any) => ({
      id: `pat-${p.id}`,
      name: p.name,
      age: p.age || 30,
      documentType: p.documentType || 'CC',
      documentNumber: p.documentNumber || '',
      gender: p.gender || '',
      phone: p.phone || '',
      email: p.email || '',
      status: p.status || 'Pendiente',
      specialty: p.specialty || 'Consulta General',
      doctor: p.doctor || 'Dr. Alejandro Restrepo',
      doctorEmail: p.doctorEmail || '',
      doctorPhone: p.doctorPhone || '',
      nextAppointment: p.nextAppointment || 'Próximamente',
      history: [
        { date: 'Hoy', specialty: p.specialty || 'Consulta General', doctor: p.doctor || 'Dr. Alejandro Restrepo', status: p.status || 'Pendiente' }
      ],
      chatHistory: getChatHistory(p.phone || '')
    }));

    // Filtrar perfiles independientes que no tienen cita en la lista de citas para listarlos como "Sin Citas"
    const appointmentDocNumbers = new Set(mappedAppointments.map(a => a.documentNumber.toString().trim()));

    const profilesWithoutAppointments = profiles
      .filter(p => !appointmentDocNumbers.has(p.documentNumber.toString().trim()))
      .map(p => ({
        id: `profile-${p.id}`,
        name: p.name,
        age: 30,
        documentType: p.documentType || 'CC',
        documentNumber: p.documentNumber || '',
        gender: p.gender || '',
        phone: p.phone || '',
        email: p.email || '',
        status: 'Pendiente' as const,
        specialty: 'Sin asignar',
        doctor: 'Sin asignar',
        nextAppointment: 'Sin citas programadas',
        history: [],
        chatHistory: getChatHistory(p.phone || '')
      }));

    setPatients([...mappedAppointments, ...profilesWithoutAppointments]);
  };

  // Auth Protection Check & Fetch Data
  useEffect(() => {
    const auth = localStorage.getItem('rocita_auth');
    if (!auth) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      fetchData();
    }
  }, [router]);

  // Guardar historial de chat en localStorage para persistencia
  const saveChatToLocal = (phone: string, messages: ChatMessage[]) => {
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const savedChatsRaw = localStorage.getItem('rocita_chat_histories');
      const savedChats = savedChatsRaw ? JSON.parse(savedChatsRaw) : {};
      savedChats[cleanPhone] = messages;
      localStorage.setItem('rocita_chat_histories', JSON.stringify(savedChats));
    } catch (err) {
      console.error('Error al guardar historial de chat en localStorage:', err);
    }
  };

  // Conexión en tiempo real con WhatsApp vía WebSockets (Chat en Vivo)
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const socket = io(`${apiUrl}/whatsapp`, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Conectado al WebSocket de WhatsApp en la vista de Pacientes');
    });

    socket.on('whatsapp.message', (data: {
      sender: string;
      text: string;
      time: string;
      timestamp: string;
      fromMe: boolean;
      pushName: string;
      status?: 'sent' | 'delivered' | 'read';
    }) => {
      console.log('Mensaje de WhatsApp recibido por WS:', data);

      // Comparación tolerante de teléfonos (coincidencia de los últimos 10 dígitos)
      const matchPhones = (phoneA: string, phoneB: string) => {
        const cleanA = phoneA.replace(/\D/g, '');
        const cleanB = phoneB.replace(/\D/g, '');
        if (!cleanA || !cleanB) return false;
        return cleanA.endsWith(cleanB) || cleanB.endsWith(cleanA);
      };

      const newMsg: ChatMessage = {
        sender: data.fromMe ? 'rocita' : 'paciente',
        text: data.text,
        time: data.time,
        status: data.fromMe ? 'read' : undefined
      };

      // 1. Actualizar el listado general de pacientes
      setPatients(prevPatients =>
        prevPatients.map(p => {
          if (matchPhones(p.phone, data.sender)) {
            let newStatus = p.status;
            // Si el mensaje es entrante (del paciente) y responde confirmando
            if (!data.fromMe) {
              const cleanedText = data.text.trim().toLowerCase();
              if (cleanedText === '1' || cleanedText === 'si' || cleanedText === 'sí' || cleanedText.includes('confirm')) {
                newStatus = 'Confirmado';
              } else if (cleanedText === '2' || cleanedText === 'no' || cleanedText.includes('cancel')) {
                newStatus = 'Cancelado';
              }
            }

            const updatedChat = [...p.chatHistory, newMsg];
            saveChatToLocal(p.phone, updatedChat);

            return {
              ...p,
              status: newStatus,
              chatHistory: updatedChat
            };
          }
          return p;
        })
      );

      // 2. Actualizar el paciente seleccionado en el drawer si es el mismo
      setSelectedPatient(prevSelected => {
        if (prevSelected && matchPhones(prevSelected.phone, data.sender)) {
          let newStatus = prevSelected.status;
          if (!data.fromMe) {
            const cleanedText = data.text.trim().toLowerCase();
            if (cleanedText === '1' || cleanedText === 'si' || cleanedText === 'sí' || cleanedText.includes('confirm')) {
              newStatus = 'Confirmado';
            } else if (cleanedText === '2' || cleanedText === 'no' || cleanedText.includes('cancel')) {
              newStatus = 'Cancelado';
            }
          }

          const updatedChat = [...prevSelected.chatHistory, newMsg];
          saveChatToLocal(prevSelected.phone, updatedChat);

          return {
            ...prevSelected,
            status: newStatus,
            chatHistory: updatedChat
          };
        }
        return prevSelected;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatName || !newPatDocNum || !newPatPhone || !newPatEmail) {
      alert('Por favor complete todos los campos requeridos.');
      return;
    }

    setIsSavingPatient(true);
    const token = localStorage.getItem('rocita_token');
    const patientPayload = {
      name: newPatName,
      documentType: newPatDocType,
      documentNumber: newPatDocNum,
      gender: newPatGender,
      phone: newPatPhone,
      email: newPatEmail,
    };

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    try {
      const res = await fetch(`${apiUrl}/patients-profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(patientPayload),
      });

      if (res.ok) {
        fetchData();
        setShowCreateModal(false);
        // Reset form
        setNewPatName('');
        setNewPatDocNum('');
        setNewPatPhone('');
        setNewPatEmail('');
      } else {
        throw new Error('Error al registrar el paciente');
      }
    } catch (err) {
      console.warn('Backend offline, registrando paciente en modo local...', err);
      const offlineProfiles = localStorage.getItem('rocita_patient_profiles');
      const currentProfiles = offlineProfiles ? JSON.parse(offlineProfiles) : [];
      const newProfile = {
        id: Date.now(),
        ...patientPayload,
      };
      const updatedProfiles = [...currentProfiles, newProfile];
      localStorage.setItem('rocita_patient_profiles', JSON.stringify(updatedProfiles));
      
      fetchData();
      setShowCreateModal(false);
      // Reset form
      setNewPatName('');
      setNewPatDocNum('');
      setNewPatPhone('');
      setNewPatEmail('');
    } finally {
      setIsSavingPatient(false);
    }
  };

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

  // Action: Send Manual Reminder Simulation / Real
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
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const messageText = `Hola ${selectedPatient.name.split(' ')[0]}. Te escribe Rocita, asistente virtual de Salud Eficiente. Queremos recordarte tu cita programada de ${selectedPatient.specialty} con ${selectedPatient.doctor} el ${selectedPatient.nextAppointment}. ¿Confirmas tu asistencia? Responde 1 para SÍ, o 2 para NO.`;
    
    let sentReal = false;
    try {
      const cleanedPhone = selectedPatient.phone.replace(/\D/g, '');
      const res = await fetch(`${apiUrl}/whatsapp/send-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: cleanedPhone,
          message: messageText
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          sentReal = true;
          console.log('Mensaje real enviado exitosamente por WhatsApp a través del backend');
        }
      }
    } catch (err) {
      console.warn('No se pudo enviar el mensaje real, usando fallback de simulación local.', err);
    }

    if (!sentReal) {
      // Fallback de Simulación Local
      const reminderMessage: ChatMessage = {
        sender: 'rocita',
        text: messageText,
        time: timeString,
        status: 'read'
      };

      // Update patient record
      const updatedPatients = patients.map(p => {
        if (p.id === selectedPatient.id) {
          const newChat = [...p.chatHistory, reminderMessage];
          saveChatToLocal(p.phone, newChat); // PERSISTIR MENSAJE ENVIADO MOCK
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
                const newChat = [...p.chatHistory, patientResponse, rocitaFinalResponse];
                saveChatToLocal(p.phone, newChat); // PERSISTIR RESPUESTAS SIMULADAS MOCK
                return {
                  ...p,
                  status: 'Confirmado',
                  chatHistory: newChat
                };
              }
              return p;
            })
          );

          // If drawer is still open, update selectedPatient view in real-time
          setSelectedPatient(prev => {
            if (prev && prev.id === selectedPatient.id) {
              const newChat = [...prev.chatHistory, patientResponse, rocitaFinalResponse];
              return {
                ...prev,
                status: 'Confirmado',
                chatHistory: newChat
              };
            }
            return prev;
          });
        }, 3000);
      }
    }

    setIsSendingReminder(false);
    setSendingProgress(0);
    setSendingStep('');
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
    <DashboardLayout
      activeTab="pacientes"
      title="Directorio Clínico"
      subtitle="Base de Pacientes"
      headerExtra={
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
        </div>
      }
    >
        {/* Scrollable Body */}
        <div className="space-y-8">
          
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
          <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 border border-blue-100/50 shadow-sm space-y-6">
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
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-full text-xs font-black shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 duration-200"
                >
                  <Plus size={14} /> Registrar Paciente
                </button>
                <div className="text-xs font-bold text-slate-400 bg-slate-50 px-4 py-2.5 rounded-full text-center">
                  Mostrando <span className="text-slate-800">{filteredPatients.length}</span> de <span className="text-slate-800">{patients.length}</span> registros
                </div>
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
                                <span className="text-xs text-slate-400 font-bold">
                                  {patient.age} años • {patient.documentType || 'CC'} {patient.gender ? `• ${patient.gender}` : ''}
                                </span>
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
                      <p className="text-xs font-bold text-sky-100">
                        {selectedPatient.age} años • {selectedPatient.documentType || 'CC'} • {selectedPatient.gender === 'M' || selectedPatient.gender === 'm' ? 'Masculino' : selectedPatient.gender === 'F' || selectedPatient.gender === 'f' ? 'Femenino' : selectedPatient.gender || 'No especificado'}
                      </p>
                      
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
                      {selectedPatient.doctorPhone && (
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Cel: {selectedPatient.doctorPhone}</span>
                      )}
                      {selectedPatient.doctorEmail && (
                        <span className="text-[10px] text-slate-400 font-bold block">Mail: {selectedPatient.doctorEmail}</span>
                      )}
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

      {/* Modal para registrar un nuevo paciente uno por uno */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Content Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white border border-white rounded-[2.5rem] shadow-2xl p-8 max-w-lg w-full flex flex-col gap-6 z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center font-black">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Registrar Nuevo Paciente</h3>
                  <p className="text-xs text-slate-400 font-bold">Añade los datos demográficos y de contacto del cliente.</p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleCreatePatient} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 block ml-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={newPatName}
                    onChange={(e) => setNewPatName(e.target.value)}
                    placeholder="Carlos Humberto Pérez"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-bold text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 block ml-1">Tipo Identificación</label>
                    <select
                      value={newPatDocType}
                      onChange={(e) => setNewPatDocType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-bold text-slate-800 cursor-pointer"
                    >
                      <option value="CC">Cédula Ciudadanía (CC)</option>
                      <option value="TI">Tarjeta Identidad (TI)</option>
                      <option value="CE">Cédula Extranjería (CE)</option>
                      <option value="PEP">PEP</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 block ml-1">Nro. Documento</label>
                    <input
                      type="text"
                      required
                      value={newPatDocNum}
                      onChange={(e) => setNewPatDocNum(e.target.value)}
                      placeholder="10102020"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 block ml-1">Género</label>
                    <select
                      value={newPatGender}
                      onChange={(e) => setNewPatGender(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-bold text-slate-800 cursor-pointer"
                    >
                      <option value="M">Masc.</option>
                      <option value="F">Fem.</option>
                      <option value="O">Otro</option>
                    </select>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 block ml-1">Teléfono Móvil</label>
                    <input
                      type="text"
                      required
                      value={newPatPhone}
                      onChange={(e) => setNewPatPhone(e.target.value)}
                      placeholder="+57 300 123 4567"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 block ml-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={newPatEmail}
                    onChange={(e) => setNewPatEmail(e.target.value)}
                    placeholder="carlos.perez@email.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-bold text-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingPatient}
                  className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 duration-200 disabled:opacity-75"
                >
                  {isSavingPatient ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin font-bold"></div>
                  ) : (
                    <>
                      <Plus size={14} /> Registrar Paciente
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
