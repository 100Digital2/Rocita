'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  User,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  Search,
  Filter,
  Check,
  X,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  Cloud,
  Share2,
  Printer,
  Undo2,
  Redo2,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Paintbrush
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

interface Appointment {
  id: string; // E.g., "pat-1" or backend id
  dbId?: number; // Numeric ID from backend
  name: string;
  age: number;
  documentType: string;
  documentNumber: string;
  gender: string;
  phone: string;
  email: string;
  status: 'Confirmado' | 'Pendiente' | 'Cancelado';
  specialty: string;
  doctor: string; // Can be doctor's name or "Por asignar"
  doctorEmail?: string;
  doctorPhone?: string;
  nextAppointment: string;
}

interface PatientProfile {
  id: number;
  name: string;
  documentType: string;
  documentNumber: string;
  gender: string;
  phone: string;
  email: string;
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  phone: string;
  email: string;
}

interface Toast {
  show: boolean;
  message: string;
  type: 'success' | 'warning' | 'info';
}

export default function CitasPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientProfiles, setPatientProfiles] = useState<PatientProfile[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selection state (Google Sheet cell/row highlight)
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Confirmado' | 'Pendiente' | 'Cancelado'>('Todos');
  const [doctorFilter, setDoctorFilter] = useState<string>('Todos');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Toast notification
  const [toast, setToast] = useState<Toast>({ show: false, message: '', type: 'success' });

  // API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Form states (Create Appointment)
  const [selectedProfileId, setSelectedProfileId] = useState<string>('new');
  const [patName, setPatName] = useState('');
  const [patDocType, setPatDocType] = useState('CC');
  const [patDocNum, setPatDocNum] = useState('');
  const [patAge, setPatAge] = useState<number>(30);
  const [patGender, setPatGender] = useState('M');
  const [patPhone, setPatPhone] = useState('');
  const [patEmail, setPatEmail] = useState('');
  const [appSpecialty, setAppSpecialty] = useState('Consulta General');
  const [appDoctorId, setAppDoctorId] = useState<string>('unassigned');
  const [appDate, setAppDate] = useState('');
  const [appStatus, setAppStatus] = useState<'Confirmado' | 'Pendiente' | 'Cancelado'>('Pendiente');
  const [isSaving, setIsSaving] = useState(false);

  // Form states (Edit Appointment)
  const [editSpecialty, setEditSpecialty] = useState('');
  const [editDoctorId, setEditDoctorId] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editStatus, setEditStatus] = useState<'Confirmado' | 'Pendiente' | 'Cancelado'>('Pendiente');
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // Check auth
  useEffect(() => {
    const auth = localStorage.getItem('rocita_auth');
    if (!auth) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Load all data
  const loadData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('rocita_token');

    let loadedAppointments: Appointment[] = [];
    let loadedProfiles: PatientProfile[] = [];
    let loadedDoctors: Doctor[] = [];

    // 1. Fetch Doctors
    try {
      const res = await fetch(`${apiUrl}/doctors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        loadedDoctors = await res.json();
        if (!loadedDoctors || loadedDoctors.length === 0) {
          throw new Error('Lista de médicos vacía en la base de datos');
        }
        setDoctors(loadedDoctors);
      } else {
        throw new Error(`Error en API: ${res.status}`);
      }
    } catch (err) {
      console.warn('Backend offline o error al obtener médicos, cargando locales.', err);
      const offlineDoctors = localStorage.getItem('rocita_doctors');
      if (offlineDoctors) {
        loadedDoctors = JSON.parse(offlineDoctors);
      }
      
      if (!loadedDoctors || loadedDoctors.length === 0) {
        loadedDoctors = [
          { id: 1, name: 'Dra. Carolina Gómez', specialty: 'Cardiología', email: 'carolina.gomez@rocita.ai', phone: '+57 300 123 4567' },
          { id: 2, name: 'Dr. Alejandro Restrepo', specialty: 'Dermatología', email: 'alejandro.restrepo@rocita.ai', phone: '+57 301 987 6543' },
          { id: 3, name: 'Dr. Manuel Cabrera', specialty: 'Oftalmología', email: 'manuel.cabrera@rocita.ai', phone: '+57 312 456 7890' },
          { id: 4, name: 'Dra. Sandra Ortiz', specialty: 'Pediatría', email: 'sandra.ortiz@rocita.ai', phone: '+57 320 654 3210' },
          { id: 5, name: 'Dra. Diana Salazar', specialty: 'Ginecología', email: 'diana.salazar@rocita.ai', phone: '+57 301 222 3333' }
        ];
        localStorage.setItem('rocita_doctors', JSON.stringify(loadedDoctors));
      }
      setDoctors(loadedDoctors);
    }

    // 2. Fetch Patient Profiles
    try {
      const res = await fetch(`${apiUrl}/patients-profiles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        loadedProfiles = await res.json();
        setPatientProfiles(loadedProfiles);
      } else {
        throw new Error(`Error en API: ${res.status}`);
      }
    } catch (err) {
      console.warn('Backend offline o error al obtener perfiles, cargando locales.', err);
      const offlineProfiles = localStorage.getItem('rocita_patient_profiles');
      if (offlineProfiles) {
        loadedProfiles = JSON.parse(offlineProfiles);
        setPatientProfiles(loadedProfiles);
      }
    }

    // 3. Fetch Appointments
    try {
      const res = await fetch(`${apiUrl}/patients`);
      if (res.ok) {
        const data = await res.json();
        loadedAppointments = data.map((p: any) => ({
          id: `pat-${p.id}`,
          dbId: p.id,
          name: p.name,
          age: p.age || 30,
          documentType: p.documentType || 'CC',
          documentNumber: p.documentNumber || '',
          gender: p.gender || 'M',
          phone: p.phone || '',
          email: p.email || '',
          status: p.status || 'Pendiente',
          specialty: p.specialty || 'Consulta General',
          doctor: p.doctor || 'Por asignar',
          doctorEmail: p.doctorEmail || '',
          doctorPhone: p.doctorPhone || '',
          nextAppointment: p.nextAppointment || ''
        }));
        setAppointments(loadedAppointments);
        if (loadedAppointments.length > 0 && !selectedRowId) {
          setSelectedRowId(loadedAppointments[0].id);
        }
      } else {
        throw new Error(`Error en API: ${res.status}`);
      }
    } catch (err) {
      console.warn('Backend offline o error al obtener citas, usando demo.', err);
      const offlineApps = localStorage.getItem('rocita_appointments');
      if (offlineApps) {
        loadedAppointments = JSON.parse(offlineApps);
        setAppointments(loadedAppointments);
      } else {
        const defaultApps: Appointment[] = [
          {
            id: 'pat-1',
            dbId: 1,
            name: 'Carlos Humberto Pérez',
            age: 45,
            documentType: 'CC',
            documentNumber: '123456',
            gender: 'M',
            phone: '+57 310 123 4567',
            email: 'carlos.perez@email.com',
            status: 'Confirmado',
            specialty: 'Cardiología',
            doctor: 'Dra. Carolina Gómez',
            doctorEmail: 'carolina.gomez@rocita.ai',
            doctorPhone: '+57 300 123 4567',
            nextAppointment: '2026-06-25T10:30'
          },
          {
            id: 'pat-2',
            dbId: 2,
            name: 'Laura Ruiz',
            age: 29,
            documentType: 'CC',
            documentNumber: '987654',
            gender: 'F',
            phone: '+57 315 987 6543',
            email: 'laura.ruiz@email.com',
            status: 'Cancelado',
            specialty: 'Dermatología',
            doctor: 'Dr. Alejandro Restrepo',
            doctorEmail: 'alejandro.restrepo@rocita.ai',
            doctorPhone: '+57 301 987 6543',
            nextAppointment: '2026-06-09T16:00'
          },
          {
            id: 'pat-3',
            dbId: 3,
            name: 'Mateo Sánchez',
            age: 19,
            documentType: 'TI',
            documentNumber: '456789',
            gender: 'M',
            phone: '+57 312 456 7890',
            email: 'mateo.sanchez@email.com',
            status: 'Pendiente',
            specialty: 'Oftalmología',
            doctor: 'Por asignar',
            doctorEmail: '',
            doctorPhone: '',
            nextAppointment: '2026-06-10T14:00'
          },
          {
            id: 'pat-4',
            dbId: 4,
            name: 'Martha Lucía Gómez',
            age: 38,
            documentType: 'CC',
            documentNumber: '654321',
            gender: 'F',
            phone: '+57 320 654 3210',
            email: 'martha.gomez@email.com',
            status: 'Confirmado',
            specialty: 'Pediatría',
            doctor: 'Dra. Sandra Ortiz',
            doctorEmail: 'sandra.ortiz@rocita.ai',
            doctorPhone: '+57 320 654 3210',
            nextAppointment: '2026-06-10T09:00'
          },
          {
            id: 'pat-5',
            dbId: 5,
            name: 'Sofía Vergara',
            age: 52,
            documentType: 'CC',
            documentNumber: '222333',
            gender: 'F',
            phone: '+57 301 222 3333',
            email: 'sofia.vergara@email.com',
            status: 'Pendiente',
            specialty: 'Ginecología',
            doctor: 'Por asignar',
            doctorEmail: '',
            doctorPhone: '',
            nextAppointment: '2026-06-12T11:00'
          }
        ];
        setAppointments(defaultApps);
        localStorage.setItem('rocita_appointments', JSON.stringify(defaultApps));
        if (!selectedRowId) {
          setSelectedRowId('pat-1');
        }
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Autofill patient fields when selecting an existing profile
  useEffect(() => {
    if (selectedProfileId !== 'new') {
      const profile = patientProfiles.find(p => p.id.toString() === selectedProfileId);
      if (profile) {
        setPatName(profile.name);
        setPatDocType(profile.documentType);
        setPatDocNum(profile.documentNumber);
        setPatGender(profile.gender);
        setPatPhone(profile.phone);
        setPatEmail(profile.email);
      }
    } else {
      setPatName('');
      setPatDocNum('');
      setPatPhone('');
      setPatEmail('');
    }
  }, [selectedProfileId, patientProfiles]);

  const showToastNotification = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Helper to get doctor info
  const getDoctorDetails = (idOrName: string) => {
    if (idOrName === 'unassigned') return { name: 'Por asignar', email: '', phone: '' };
    const doc = doctors.find(d => d.id.toString() === idOrName);
    if (doc) {
      return { name: doc.name, email: doc.email, phone: doc.phone };
    }
    return { name: idOrName, email: '', phone: '' };
  };

  // Create Appointment Handler
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patName || !patDocNum || !patPhone || !appDate) {
      showToastNotification('Por favor, completa los campos obligatorios.', 'warning');
      return;
    }

    setIsSaving(true);
    const { name: docName, email: docEmail, phone: docPhone } = getDoctorDetails(appDoctorId);

    const payload = {
      name: patName,
      age: Number(patAge) || 30,
      documentType: patDocType,
      documentNumber: patDocNum,
      gender: patGender,
      phone: patPhone,
      email: patEmail,
      status: appStatus,
      specialty: appSpecialty,
      doctor: docName,
      doctorEmail: docEmail,
      doctorPhone: docPhone,
      nextAppointment: appDate
    };

    try {
      const res = await fetch(`${apiUrl}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToastNotification('Cita programada con éxito.', 'success');
        loadData();
        setShowCreateModal(false);
        resetCreateForm();
      } else {
        throw new Error('Error al programar cita en el servidor');
      }
    } catch (err) {
      console.warn('Backend offline, guardando cita localmente...', err);
      const newApp: Appointment = {
        id: `pat-local-${Date.now()}`,
        dbId: Date.now(),
        ...payload
      };
      const updated = [...appointments, newApp];
      setAppointments(updated);
      localStorage.setItem('rocita_appointments', JSON.stringify(updated));
      showToastNotification('Cita programada localmente.', 'success');
      setShowCreateModal(false);
      resetCreateForm();
    } finally {
      setIsSaving(false);
    }
  };

  const resetCreateForm = () => {
    setSelectedProfileId('new');
    setPatName('');
    setPatDocNum('');
    setPatAge(30);
    setPatPhone('');
    setPatEmail('');
    setAppSpecialty('Consulta General');
    setAppDoctorId('unassigned');
    setAppDate('');
    setAppStatus('Pendiente');
  };

  // Open Edit Modal and load current data
  const handleOpenEditModal = (app: Appointment) => {
    setSelectedAppointment(app);
    setEditSpecialty(app.specialty);
    setEditDate(app.nextAppointment || '');
    setEditStatus(app.status);
    setEditName(app.name);
    setEditPhone(app.phone);
    setEditEmail(app.email);

    // Map doctor name back to ID
    const foundDoc = doctors.find(d => d.name === app.doctor);
    setEditDoctorId(foundDoc ? foundDoc.id.toString() : 'unassigned');
    setShowEditModal(true);
  };

  // Edit Appointment Handler
  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    setIsSaving(true);
    const { name: docName, email: docEmail, phone: docPhone } = getDoctorDetails(editDoctorId);

    const payload = {
      name: editName,
      phone: editPhone,
      email: editEmail,
      status: editStatus,
      specialty: editSpecialty,
      doctor: docName,
      doctorEmail: docEmail,
      doctorPhone: docPhone,
      nextAppointment: editDate
    };

    try {
      const res = await fetch(`${apiUrl}/patients/${selectedAppointment.dbId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToastNotification('Cita actualizada con éxito.', 'success');
        loadData();
        setShowEditModal(false);
      } else {
        throw new Error('Error al actualizar cita en el servidor');
      }
    } catch (err) {
      console.warn('Backend offline, actualizando cita localmente...', err);
      const updated = appointments.map(app => {
        if (app.id === selectedAppointment.id) {
          return {
            ...app,
            ...payload
          };
        }
        return app;
      });
      setAppointments(updated);
      localStorage.setItem('rocita_appointments', JSON.stringify(updated));
      showToastNotification('Cita actualizada localmente.', 'success');
      setShowEditModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel Cita directly
  const handleCancelAppointment = async (app: Appointment) => {
    if (!window.confirm(`¿Estás seguro de que deseas cancelar la cita de ${app.name}?`)) return;

    try {
      const res = await fetch(`${apiUrl}/patients/${app.dbId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelado' })
      });

      if (res.ok) {
        showToastNotification('Cita cancelada con éxito.', 'info');
        loadData();
      } else {
        throw new Error('Error al cancelar la cita');
      }
    } catch (err) {
      console.warn('Backend offline, cancelando cita localmente...', err);
      const updated = appointments.map(a => {
        if (a.id === app.id) {
          return { ...a, status: 'Cancelado' as const };
        }
        return a;
      });
      setAppointments(updated);
      localStorage.setItem('rocita_appointments', JSON.stringify(updated));
      showToastNotification('Cita marcada como Cancelada.', 'info');
    }
  };

  // Delete Cita completely
  const handleDeleteAppointment = async (app: Appointment) => {
    if (!window.confirm(`¿Deseas ELIMINAR permanentemente la cita de ${app.name}?`)) return;

    try {
      const res = await fetch(`${apiUrl}/patients/${app.dbId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        showToastNotification('Registro de cita eliminado.', 'info');
        loadData();
      } else {
        throw new Error('Error al eliminar cita');
      }
    } catch (err) {
      console.warn('Backend offline, eliminando cita localmente...', err);
      const updated = appointments.filter(a => a.id !== app.id);
      setAppointments(updated);
      localStorage.setItem('rocita_appointments', JSON.stringify(updated));
      showToastNotification('Cita eliminada de la memoria local.', 'info');
    }
  };

  // Filters logic
  const filteredAppointments = appointments.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.documentNumber.includes(searchQuery) ||
                          app.phone.includes(searchQuery) ||
                          app.specialty.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'Todos' || app.status === statusFilter;

    let matchesDoctor = true;
    if (doctorFilter !== 'Todos') {
      if (doctorFilter === 'unassigned') {
        matchesDoctor = app.doctor === 'Por asignar' || !app.doctor || app.doctor === '';
      } else {
        matchesDoctor = app.doctor === doctorFilter;
      }
    }

    return matchesSearch && matchesStatus && matchesDoctor;
  });

  // Selected appointment details for the Formula Bar
  const selectedAppDetails = appointments.find(a => a.id === selectedRowId);
  const selectedRowIndex = filteredAppointments.findIndex(a => a.id === selectedRowId) + 1;

  const getFormulaText = () => {
    if (!selectedAppDetails) return '';
    return `=CITA(Paciente: "${selectedAppDetails.name}", Médico: "${selectedAppDetails.doctor || 'Por asignar'}", Especialidad: "${selectedAppDetails.specialty}", Fecha: "${selectedAppDetails.nextAppointment || 'Próximamente'}", Estado: "${selectedAppDetails.status}")`;
  };

  const formatDateTime = (isoString: string) => {
    if (!isoString) return 'Sin fecha';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;

      const dayNum = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;

      return `${dayNum}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    } catch (e) {
      return isoString;
    }
  };

  if (!isAuthenticated) return null;

  return (
    <DashboardLayout
      activeTab="citas"
      title="Gestión de Citas"
      subtitle="Agenda Médica de la IPS"
      noPadding
    >
      <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full overflow-hidden">
        {/* Toast alert */}
        <AnimatePresence>
          {toast.show && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
            >
              <div className={`px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-black border text-white ${
                toast.type === 'success' ? 'bg-emerald-500 border-emerald-400' : toast.type === 'warning' ? 'bg-amber-500 border-amber-400' : 'bg-sky-500 border-sky-400'
              }`}>
                <CheckCircle2 size={18} />
                {toast.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🟩 GOOGLE SHEETS HEADER BAR */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-800 tracking-tight">Control_Citas_IPS_Rocita.xlsx</span>
                <span className="px-2 py-0.5 text-[10px] font-black bg-slate-100 text-slate-500 rounded flex items-center gap-1">
                  <Cloud size={10} /> Guardado en Nube
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-400 font-bold mt-0.5 select-none">
                <span className="hover:bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer transition-colors text-slate-700">Archivo</span>
                <span className="hover:bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer transition-colors text-slate-700">Editar</span>
                <span className="hover:bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer transition-colors text-slate-700">Ver</span>
                <span className="hover:bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer transition-colors text-slate-700">Insertar</span>
                <span className="hover:bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer transition-colors text-slate-700">Formato</span>
                <span className="hover:bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer transition-colors text-slate-700">Datos</span>
                <span className="hover:bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer transition-colors text-slate-700">Herramientas</span>
                <span className="hover:bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer transition-colors text-slate-700">Ayuda</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors border border-slate-200"
              title="Refrescar Hoja"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={() => {
                resetCreateForm();
                setShowCreateModal(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus size={14} /> Fila de Cita
            </button>
            <button className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-black shadow-sm flex items-center gap-1.5">
              <Share2 size={14} /> Compartir
            </button>
          </div>
        </div>

        {/* 🟩 GOOGLE SHEETS TOOLBAR */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex items-center gap-2 overflow-x-auto select-none shrink-0 scrollbar-none">
          <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition-colors"><Undo2 size={14} /></button>
          <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition-colors"><Redo2 size={14} /></button>
          <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition-colors"><Printer size={14} /></button>
          <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition-colors"><Paintbrush size={14} /></button>
          <div className="h-5 w-px bg-slate-300 mx-1"></div>
          
          <select className="bg-transparent hover:bg-slate-200 px-2 py-1 text-xs font-bold text-slate-600 rounded cursor-pointer outline-none">
            <option>Arial</option>
            <option>Calibri</option>
            <option>Outfit</option>
          </select>
          <div className="h-5 w-px bg-slate-300 mx-1"></div>

          <button className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition-colors"><Bold size={14} /></button>
          <button className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition-colors"><Italic size={14} /></button>
          <div className="h-5 w-px bg-slate-300 mx-1"></div>

          <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition-colors"><AlignLeft size={14} /></button>
          <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition-colors"><AlignCenter size={14} /></button>
          <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition-colors"><AlignRight size={14} /></button>
          
          <div className="h-5 w-px bg-slate-300 mx-1"></div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-white border border-slate-200 rounded px-3 py-1 text-[11px] font-bold text-slate-600 outline-none focus:border-emerald-500"
            >
              <option value="Todos">Ver Todos Estados</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Cancelado">Cancelado</option>
            </select>

            {/* Doctor filter dropdown */}
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded px-3 py-1 text-[11px] font-bold text-slate-600 outline-none focus:border-emerald-500 max-w-44"
            >
              <option value="Todos">Ver Todos Médicos</option>
              <option value="unassigned">⚠️ Por Asignar</option>
              {doctors.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
              <input
                type="text"
                placeholder="Filtrar por paciente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-200 rounded py-1 pl-8 pr-3 text-[11px] outline-none focus:border-emerald-500 w-44"
              />
            </div>
          </div>
        </div>

        {/* 🟩 FORMULA BAR */}
        <div className="bg-white border-b border-slate-200 px-6 py-1.5 flex items-center gap-2 select-none shrink-0 font-mono text-xs">
          <div className="bg-slate-50 border border-slate-200 text-center text-slate-600 px-2 py-0.5 rounded min-w-12 select-none font-bold text-[11px]">
            {selectedRowId ? `A${selectedRowIndex}` : 'A1'}
          </div>
          <div className="h-4 w-px bg-slate-300 mx-1"></div>
          <span className="text-slate-400 italic font-black text-sm select-none">fx</span>
          <input
            type="text"
            readOnly
            value={getFormulaText()}
            className="flex-1 bg-transparent border-0 outline-none text-slate-700 font-bold select-all overflow-ellipsis"
            placeholder="Selecciona una celda de cita para visualizar fórmula..."
          />
        </div>

        {/* 🟩 SPREADSHEET GRID VIEW */}
        <div className="flex-1 overflow-auto bg-slate-100">
          <table className="w-full border-collapse bg-white font-sans text-xs border border-slate-300">
            <thead>
              {/* Row index label row (A, B, C...) */}
              <tr className="bg-slate-50 text-slate-600 text-center select-none sticky top-0 z-20">
                <th className="bg-slate-100 border border-slate-300 w-10 py-1 font-mono text-[10px]"></th>
                <th className="border border-slate-300 font-mono font-semibold text-[10px] w-52">A</th>
                <th className="border border-slate-300 font-mono font-semibold text-[10px] w-28">B</th>
                <th className="border border-slate-300 font-mono font-semibold text-[10px] w-36">C</th>
                <th className="border border-slate-300 font-mono font-semibold text-[10px] w-48">D</th>
                <th className="border border-slate-300 font-mono font-semibold text-[10px] w-60">E</th>
                <th className="border border-slate-300 font-mono font-semibold text-[10px] w-56">F</th>
                <th className="border border-slate-300 font-mono font-semibold text-[10px] w-28">G</th>
                <th className="border border-slate-300 font-mono font-semibold text-[10px] w-32">H</th>
              </tr>

              {/* Column labels (Actual column headers) */}
              <tr className="bg-slate-50 text-slate-700 text-left font-black select-none sticky top-[21px] z-20 border-b border-slate-300">
                <th className="bg-slate-100 border border-slate-300 text-center font-mono text-[10px] py-1 text-slate-400">1</th>
                <th className="border border-slate-300 px-3 py-1.5 bg-slate-50/80">Nombre Paciente</th>
                <th className="border border-slate-300 px-3 py-1.5 bg-slate-50/80">Documento</th>
                <th className="border border-slate-300 px-3 py-1.5 bg-slate-50/80">Teléfono</th>
                <th className="border border-slate-300 px-3 py-1.5 bg-slate-50/80">Especialidad</th>
                <th className="border border-slate-300 px-3 py-1.5 bg-slate-50/80">Médico Asignado</th>
                <th className="border border-slate-300 px-3 py-1.5 bg-slate-50/80">Fecha de Cita</th>
                <th className="border border-slate-300 px-3 py-1.5 bg-slate-50/80 text-center">Estado</th>
                <th className="border border-slate-300 px-3 py-1.5 bg-slate-50/80 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="bg-slate-100 border border-slate-300 text-center font-mono text-[10px] text-slate-400">2</td>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-bold border border-slate-300">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw size={20} className="animate-spin text-emerald-600" />
                      <p>Cargando celdas del backend...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAppointments.length > 0 ? (
                filteredAppointments.map((app, index) => {
                  const rowIndex = index + 2; // Rows start at 2 since row 1 is the headers
                  const isSelected = selectedRowId === app.id;
                  const isUnassigned = app.doctor === 'Por asignar' || !app.doctor || app.doctor === '';

                  return (
                    <tr
                      key={app.id}
                      onClick={() => setSelectedRowId(app.id)}
                      onDoubleClick={() => handleOpenEditModal(app)}
                      className={`hover:bg-slate-50/60 transition-colors select-none font-medium cursor-pointer ${
                        isSelected ? 'bg-emerald-50/40 ring-1 ring-emerald-500/30' : ''
                      }`}
                    >
                      {/* Row Index Label */}
                      <td className={`border border-slate-200 text-center font-mono text-[10px] select-none ${
                        isSelected ? 'bg-emerald-100/50 text-emerald-700 font-black' : 'bg-slate-50 text-slate-400'
                      }`}>
                        {rowIndex}
                      </td>

                      {/* A: Paciente Name */}
                      <td className={`border border-slate-200 px-3 py-1 text-slate-800 ${isSelected ? 'border-2 border-emerald-500' : ''}`}>
                        <div className="flex items-center gap-1">
                          <span className="font-extrabold text-slate-900">{app.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold">({app.age} años)</span>
                        </div>
                      </td>

                      {/* B: Document */}
                      <td className={`border border-slate-200 px-3 py-1 text-slate-500 font-mono ${isSelected ? 'border-y-2 border-emerald-500' : ''}`}>
                        {app.documentType} {app.documentNumber}
                      </td>

                      {/* C: Phone */}
                      <td className={`border border-slate-200 px-3 py-1 text-slate-600 ${isSelected ? 'border-y-2 border-emerald-500' : ''}`}>
                        {app.phone}
                      </td>

                      {/* D: Specialty */}
                      <td className={`border border-slate-200 px-3 py-1 text-slate-700 ${isSelected ? 'border-y-2 border-emerald-500' : ''}`}>
                        <span className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold">
                          {app.specialty}
                        </span>
                      </td>

                      {/* E: Doctor */}
                      <td className={`border border-slate-200 px-3 py-1 ${isSelected ? 'border-y-2 border-emerald-500' : ''}`}>
                        {isUnassigned ? (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-extrabold text-[10px]">
                            <AlertTriangle size={11} className="text-rose-500 animate-pulse" />
                            Por asignar en centro
                          </span>
                        ) : (
                          <span className="text-slate-800 font-semibold">{app.doctor}</span>
                        )}
                      </td>

                      {/* F: Date */}
                      <td className={`border border-slate-200 px-3 py-1 text-slate-700 ${isSelected ? 'border-y-2 border-emerald-500' : ''}`}>
                        {formatDateTime(app.nextAppointment)}
                      </td>

                      {/* G: Status */}
                      <td className={`border border-slate-200 px-3 py-1 text-center ${isSelected ? 'border-y-2 border-emerald-500' : ''}`}>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                          app.status === 'Confirmado'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : app.status === 'Pendiente'
                            ? 'bg-amber-50 text-amber-600 border-amber-100'
                            : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {app.status}
                        </span>
                      </td>

                      {/* H: Actions */}
                      <td className={`border border-slate-200 px-3 py-0.5 text-right ${isSelected ? 'border-2 border-l-0 border-emerald-500' : ''}`}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenEditModal(app); }}
                            className="p-1 hover:bg-slate-100 text-slate-500 hover:text-sky-600 rounded transition-colors"
                            title="Editar Cita"
                          >
                            <Edit2 size={12} />
                          </button>
                          {app.status !== 'Cancelado' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCancelAppointment(app); }}
                              className="p-1 hover:bg-slate-100 text-slate-500 hover:text-amber-600 rounded transition-colors"
                              title="Cancelar Cita"
                            >
                              <XCircle size={12} />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteAppointment(app); }}
                            className="p-1 hover:bg-slate-100 text-slate-500 hover:text-red-600 rounded transition-colors"
                            title="Eliminar Fila"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="bg-slate-100 border border-slate-300 text-center font-mono text-[10px] text-slate-400">2</td>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-bold border border-slate-300">
                    <div className="flex flex-col items-center gap-3">
                      <Calendar size={36} className="text-slate-200" />
                      <p>No se encontraron registros de citas.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🟩 SHEET STATUS BAR FOOTER */}
        <div className="bg-slate-100 border-t border-slate-200 px-4 md:px-6 py-1.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 font-bold shrink-0 select-none">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1">
            <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase">Hoja 1</span>
            <span>Filas cargadas: <span className="text-slate-700">{filteredAppointments.length}</span></span>
            <span>Confirmadas: <span className="text-emerald-600">{appointments.filter(a => a.status === 'Confirmado').length}</span></span>
            <span>Pendientes: <span className="text-amber-600">{appointments.filter(a => a.status === 'Pendiente').length}</span></span>
            <span className="text-rose-500">Sin Médico: {appointments.filter(a => a.doctor === 'Por asignar' || !a.doctor || a.doctor === '').length}</span>
          </div>
          <div className="text-slate-400">
            <span>Google Sheets IPS Connector v1.0.0</span>
          </div>
        </div>
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow">
                    <Plus size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-950 font-sans">Agendar Cita en Hoja</h3>
                    <p className="text-xs text-slate-400 font-bold">Añadir nueva fila de cita médica</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateAppointment} className="flex-1 overflow-y-auto p-8 space-y-6">
                
                {/* Profile selection */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 block">Perfil del Paciente</label>
                  <select
                    value={selectedProfileId}
                    onChange={(e) => setSelectedProfileId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                  >
                    <option value="new">🆕 Registrar nuevo paciente para la cita</option>
                    {patientProfiles.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.documentType} {p.documentNumber})</option>
                    ))}
                  </select>
                </div>

                {/* Patient data fields */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100/50 space-y-4">
                  <h4 className="text-xs font-black text-slate-700 flex items-center gap-2">
                    <User size={14} className="text-emerald-600" /> Información del Paciente
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 block">Nombre Completo *</label>
                      <input
                        type="text"
                        value={patName}
                        onChange={(e) => setPatName(e.target.value)}
                        disabled={selectedProfileId !== 'new'}
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:bg-slate-100 disabled:text-slate-500"
                        placeholder="Ej. Juan Pérez"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 block">Tipo *</label>
                        <select
                          value={patDocType}
                          onChange={(e) => setPatDocType(e.target.value)}
                          disabled={selectedProfileId !== 'new'}
                          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:bg-slate-100 disabled:text-slate-500"
                        >
                          <option value="CC">CC</option>
                          <option value="TI">TI</option>
                          <option value="CE">CE</option>
                          <option value="RC">RC</option>
                        </select>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 block">Número Documento *</label>
                        <input
                          type="text"
                          value={patDocNum}
                          onChange={(e) => setPatDocNum(e.target.value)}
                          disabled={selectedProfileId !== 'new'}
                          required
                          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:bg-slate-100 disabled:text-slate-500"
                          placeholder="Ej. 10123456"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 block">Edad</label>
                        <input
                          type="number"
                          value={patAge}
                          onChange={(e) => setPatAge(Number(e.target.value))}
                          disabled={selectedProfileId !== 'new'}
                          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:bg-slate-100 disabled:text-slate-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 block">Género</label>
                        <select
                          value={patGender}
                          onChange={(e) => setPatGender(e.target.value)}
                          disabled={selectedProfileId !== 'new'}
                          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:bg-slate-100 disabled:text-slate-500"
                        >
                          <option value="M">Masculino</option>
                          <option value="F">Femenino</option>
                          <option value="O">Otro</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 block">Celular / Teléfono *</label>
                      <input
                        type="text"
                        value={patPhone}
                        onChange={(e) => setPatPhone(e.target.value)}
                        disabled={selectedProfileId !== 'new'}
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:bg-slate-100 disabled:text-slate-500"
                        placeholder="Ej. +57 310 123 4567"
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 block">Correo Electrónico</label>
                      <input
                        type="email"
                        value={patEmail}
                        onChange={(e) => setPatEmail(e.target.value)}
                        disabled={selectedProfileId !== 'new'}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:bg-slate-100 disabled:text-slate-500"
                        placeholder="paciente@correo.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Appointment fields */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-700 flex items-center gap-2">
                    <Calendar size={14} className="text-emerald-600" /> Detalles de la Cita
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 block">Especialidad *</label>
                      <select
                        value={appSpecialty}
                        onChange={(e) => setAppSpecialty(e.target.value)}
                        disabled={appDoctorId !== 'unassigned'}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                      >
                        <option value="Consulta General">Consulta General</option>
                        <option value="Cardiología">Cardiología</option>
                        <option value="Dermatología">Dermatología</option>
                        <option value="Pediatría">Pediatría</option>
                        <option value="Oftalmología">Oftalmología</option>
                        <option value="Ginecología">Ginecología</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 block">Profesional Asignado *</label>
                      <select
                        value={appDoctorId}
                        onChange={(e) => {
                          const docId = e.target.value;
                          setAppDoctorId(docId);
                          if (docId !== 'unassigned') {
                            const doc = doctors.find(d => d.id.toString() === docId);
                            if (doc) {
                              setAppSpecialty(doc.specialty);
                            }
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                      >
                        <option value="unassigned">⚠️ Por asignar (En el centro médico)</option>
                        {doctors.map(d => (
                          <option key={d.id} value={d.id.toString()}>{d.name} ({d.specialty})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 block">Fecha y Hora de la Cita *</label>
                      <input
                        type="datetime-local"
                        value={appDate}
                        onChange={(e) => setAppDate(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 block">Estado Inicial *</label>
                      <select
                        value={appStatus}
                        onChange={(e) => setAppStatus(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Confirmado">Confirmado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs rounded-full transition-all"
                  >
                    Descartar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-full shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
                  >
                    {isSaving ? 'Agendando...' : 'Añadir Fila'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {showEditModal && selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow">
                    <Edit2 size={16} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-950 font-sans">Modificar Fila de Cita</h3>
                    <p className="text-xs text-slate-400 font-bold">Edita las celdas seleccionadas</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateAppointment} className="flex-1 overflow-y-auto p-8 space-y-6">
                
                {/* Contact update */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100/50 space-y-4">
                  <h4 className="text-xs font-black text-slate-700 flex items-center gap-2">
                    <User size={14} className="text-emerald-600" /> Datos del Paciente
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 block">Nombre del Paciente</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 block">Celular / Teléfono</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 block">Correo Electrónico</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Appointment updates */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-700 flex items-center gap-2">
                    <Calendar size={14} className="text-emerald-600" /> Detalles de la Cita
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 block">Especialidad</label>
                      <select
                        value={editSpecialty}
                        onChange={(e) => setEditSpecialty(e.target.value)}
                        disabled={editDoctorId !== 'unassigned'}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                      >
                        <option value="Consulta General">Consulta General</option>
                        <option value="Cardiología">Cardiología</option>
                        <option value="Dermatología">Dermatología</option>
                        <option value="Pediatría">Pediatría</option>
                        <option value="Oftalmología">Oftalmología</option>
                        <option value="Ginecología">Ginecología</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 block">Médico Asignado</label>
                      <select
                        value={editDoctorId}
                        onChange={(e) => {
                          const docId = e.target.value;
                          setEditDoctorId(docId);
                          if (docId !== 'unassigned') {
                            const doc = doctors.find(d => d.id.toString() === docId);
                            if (doc) {
                              setEditSpecialty(doc.specialty);
                            }
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                      >
                        <option value="unassigned">⚠️ Por asignar (En el centro médico)</option>
                        {doctors.map(d => (
                          <option key={d.id} value={d.id.toString()}>{d.name} ({d.specialty})</option>
                        ))}
                      </select>
                      {editDoctorId === 'unassigned' && (
                        <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                          <AlertTriangle size={12} /> Cita sin médico (se asignará físicamente en IPS)
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 block">Fecha y Hora</label>
                      <input
                        type="datetime-local"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 block">Estado de la Cita</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Confirmado">Confirmado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs rounded-full transition-all"
                  >
                    Descartar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-full shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
