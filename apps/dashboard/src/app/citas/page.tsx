'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertTriangle,
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
  Paintbrush,
  MessageSquare
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ChatDrawer from '../../components/ChatDrawer';
import AppointmentFormModal from '../../components/AppointmentFormModal';
import EditAppointmentModal from '../../components/EditAppointmentModal';
import { useAppointments } from '../../hooks/useAppointments';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  dbId?: number;
  name: string;
  age: number;
  documentType: string;
  documentNumber: string;
  gender: string;
  phone: string;
  email: string;
  status: 'Confirmado' | 'Pendiente' | 'Cancelado';
  specialty: string;
  doctor: string;
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

export default function CitasPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Data Custom Hooks and Queries
  const { appointments, isLoading, refetch, createAppointment, updateAppointment, deleteAppointment } = useAppointments();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('rocita_token') : null;

  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ['doctors'],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/doctors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Offline');
      const data = await res.json();
      localStorage.setItem('rocita_doctors', JSON.stringify(data));
      return data;
    },
    initialData: () => {
      if (typeof window === 'undefined') return [];
      const cached = localStorage.getItem('rocita_doctors');
      return cached ? JSON.parse(cached) : [
        { id: 1, name: 'Dra. Carolina Gómez', specialty: 'Cardiología', email: 'carolina.gomez@rocita.ai', phone: '+57 300 123 4567' },
        { id: 2, name: 'Dr. Alejandro Restrepo', specialty: 'Dermatología', email: 'alejandro.restrepo@rocita.ai', phone: '+57 301 987 6543' },
        { id: 3, name: 'Dr. Manuel Cabrera', specialty: 'Oftalmología', email: 'manuel.cabrera@rocita.ai', phone: '+57 312 456 7890' },
        { id: 4, name: 'Dra. Sandra Ortiz', specialty: 'Pediatría', email: 'sandra.ortiz@rocita.ai', phone: '+57 320 654 3210' },
        { id: 5, name: 'Dra. Diana Salazar', specialty: 'Ginecología', email: 'diana.salazar@rocita.ai', phone: '+57 301 222 3333' }
      ];
    }
  });

  const { data: patientProfiles = [] } = useQuery<PatientProfile[]>({
    queryKey: ['patientProfiles'],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/patients-profiles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Offline');
      const data = await res.json();
      localStorage.setItem('rocita_patient_profiles', JSON.stringify(data));
      return data;
    },
    initialData: () => {
      if (typeof window === 'undefined') return [];
      const cached = localStorage.getItem('rocita_patient_profiles');
      return cached ? JSON.parse(cached) : [];
    }
  });

  // State
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [selectedChatPatient, setSelectedChatPatient] = useState<Appointment | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Confirmado' | 'Pendiente' | 'Cancelado'>('Todos');
  const [doctorFilter, setDoctorFilter] = useState<string>('Todos');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('rocita_auth');
    if (!auth) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  useEffect(() => {
    if (appointments.length > 0 && !selectedRowId) {
      setSelectedRowId(appointments[0].id);
    }
  }, [appointments, selectedRowId]);

  // Form submit creation
  const handleCreateSubmit = async (values: any) => {
    setIsSaving(true);
    const foundDoc = doctors.find(d => d.id.toString() === values.doctorId);
    const docName = foundDoc ? foundDoc.name : 'Por asignar';
    const docEmail = foundDoc ? foundDoc.email : '';
    const docPhone = foundDoc ? foundDoc.phone : '';

    const payload = {
      name: values.name,
      age: values.age,
      documentType: values.documentType,
      documentNumber: values.documentNumber,
      gender: values.gender,
      phone: values.phone,
      email: values.email,
      status: 'Pendiente' as const,
      specialty: values.specialty,
      doctor: docName,
      doctorEmail: docEmail,
      doctorPhone: docPhone,
      nextAppointment: values.nextAppointment
    };

    try {
      await createAppointment(payload);
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Form submit updates
  const handleUpdateSubmit = async (values: any) => {
    if (!selectedAppointment?.dbId) return;
    setIsSaving(true);

    const foundDoc = doctors.find(d => d.id.toString() === values.doctorId);
    const docName = foundDoc ? foundDoc.name : 'Por asignar';
    const docEmail = foundDoc ? foundDoc.email : '';
    const docPhone = foundDoc ? foundDoc.phone : '';

    const payload = {
      name: values.name,
      phone: values.phone,
      email: values.email,
      status: values.status,
      specialty: values.specialty,
      doctor: docName,
      doctorEmail: docEmail,
      doctorPhone: docPhone,
      nextAppointment: values.nextAppointment
    };

    try {
      await updateAppointment({ dbId: selectedAppointment.dbId, payload });
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelAppointment = async (app: Appointment) => {
    if (!app.dbId || !window.confirm(`¿Estás seguro de que deseas cancelar la cita de ${app.name}?`)) return;
    await updateAppointment({ dbId: app.dbId, payload: { status: 'Cancelado' } });
  };

  const handleDeleteAppointment = async (app: Appointment) => {
    if (!app.dbId || !window.confirm(`¿Deseas ELIMINAR permanentemente la cita de ${app.name}?`)) return;
    await deleteAppointment(app.dbId);
  };

  const handleOpenChatDrawer = (app: Appointment) => {
    setSelectedChatPatient(app);
    setShowChatDrawer(true);
  };

  const handleOpenEditModal = (app: Appointment) => {
    setSelectedAppointment(app);
    setShowEditModal(true);
  };

  // Filter logic
  const filteredAppointments = appointments.filter(app => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    <DashboardLayout activeTab="citas" title="Gestión de Citas" subtitle="Agenda Médica de la IPS" noPadding>
      <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full overflow-hidden">
        {/* GOOGLE SHEETS HEADER BAR */}
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
                {['Archivo', 'Editar', 'Ver', 'Insertar', 'Formato', 'Datos', 'Herramientas', 'Ayuda'].map(item => (
                  <span key={item} className="hover:bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer transition-colors text-slate-700">{item}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => refetch()} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors border border-slate-200" title="Refrescar Hoja">
              <RefreshCw size={15} />
            </button>
            <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black shadow-sm flex items-center gap-1.5">
              <Plus size={14} /> Fila de Cita
            </button>
            <button className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-black shadow-sm flex items-center gap-1.5">
              <Share2 size={14} /> Compartir
            </button>
          </div>
        </div>

        {/* GOOGLE SHEETS TOOLBAR */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex items-center gap-2 overflow-x-auto select-none shrink-0 scrollbar-none">
          <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500"><Undo2 size={14} /></button>
          <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500"><Redo2 size={14} /></button>
          <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500"><Printer size={14} /></button>
          <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500"><Paintbrush size={14} /></button>
          <div className="h-5 w-px bg-slate-300 mx-1"></div>
          <select className="bg-transparent hover:bg-slate-200 px-2 py-1 text-xs font-bold text-slate-600 rounded cursor-pointer outline-none">
            <option>Arial</option>
            <option>Calibri</option>
            <option>Outfit</option>
          </select>
          <div className="h-5 w-px bg-slate-300 mx-1"></div>
          <button className="p-1.5 hover:bg-slate-200 rounded text-slate-700"><Bold size={14} /></button>
          <button className="p-1.5 hover:bg-slate-200 rounded text-slate-700"><Italic size={14} /></button>
          <div className="h-5 w-px bg-slate-300 mx-1"></div>
          <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500"><AlignLeft size={14} /></button>
          <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500"><AlignCenter size={14} /></button>
          <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500"><AlignRight size={14} /></button>
          <div className="h-5 w-px bg-slate-300 mx-1"></div>

          {/* Filters */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="bg-white border border-slate-200 rounded px-3 py-1 text-[11px] font-bold text-slate-600 outline-none">
              <option value="Todos">Ver Todos Estados</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Cancelado">Cancelado</option>
            </select>
            <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} className="bg-white border border-slate-200 rounded px-3 py-1 text-[11px] font-bold text-slate-600 outline-none max-w-44">
              <option value="Todos">Ver Todos Médicos</option>
              <option value="unassigned">⚠️ Por Asignar</option>
              {doctors.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
            <div className="relative">
              <input type="text" placeholder="Filtrar por paciente..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-white border border-slate-200 rounded py-1 pl-8 pr-3 text-[11px] outline-none w-44" />
            </div>
          </div>
        </div>

        {/* FORMULA BAR */}
        <div className="bg-white border-b border-slate-200 px-6 py-1.5 flex items-center gap-2 select-none shrink-0 font-mono text-xs">
          <div className="bg-slate-50 border border-slate-200 text-center text-slate-600 px-2 py-0.5 rounded min-w-12 font-bold text-[11px]">
            {selectedRowId ? `A${selectedRowIndex}` : 'A1'}
          </div>
          <div className="h-4 w-px bg-slate-300 mx-1"></div>
          <span className="text-slate-400 italic font-black text-sm">fx</span>
          <input type="text" readOnly value={getFormulaText()} className="flex-1 bg-transparent border-0 outline-none text-slate-700 font-bold select-all overflow-ellipsis" placeholder="Selecciona una celda..." />
        </div>

        {/* SPREADSHEET GRID VIEW */}
        <div className="flex-1 overflow-auto bg-slate-100">
          <table className="w-full border-collapse bg-white font-sans text-xs border border-slate-300">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-center select-none sticky top-0 z-20">
                <th className="bg-slate-100 border border-slate-300 w-10 py-1"></th>
                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(l => (
                  <th key={l} className="border border-slate-300 font-mono font-semibold text-[10px]">{l}</th>
                ))}
              </tr>
              <tr className="bg-slate-50 text-slate-700 text-left font-black sticky top-[21px] z-20 border-b border-slate-300">
                <th className="bg-slate-100 border border-slate-300 text-center font-mono text-[10px] py-1 text-slate-400">1</th>
                <th className="border border-slate-300 px-3 py-1.5">Nombre Paciente</th>
                <th className="border border-slate-300 px-3 py-1.5">Documento</th>
                <th className="border border-slate-300 px-3 py-1.5">Teléfono</th>
                <th className="border border-slate-300 px-3 py-1.5">Especialidad</th>
                <th className="border border-slate-300 px-3 py-1.5">Médico Asignado</th>
                <th className="border border-slate-300 px-3 py-1.5">Fecha de Cita</th>
                <th className="border border-slate-300 px-3 py-1.5 text-center">Estado</th>
                <th className="border border-slate-300 px-3 py-1.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="bg-slate-100 border border-slate-300 text-center font-mono text-[10px] text-slate-400">2</td>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-bold border border-slate-300">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw size={20} className="animate-spin text-emerald-600" />
                      <p>Cargando celdas del backend...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAppointments.length > 0 ? (
                filteredAppointments.map((app, index) => {
                  const isSelected = selectedRowId === app.id;
                  const isUnassigned = app.doctor === 'Por asignar' || !app.doctor;
                  return (
                    <tr key={app.id} onClick={() => setSelectedRowId(app.id)} onDoubleClick={() => handleOpenEditModal(app)} className={`hover:bg-slate-50/60 font-medium cursor-pointer ${isSelected ? 'bg-emerald-50/40' : ''}`}>
                      <td className={`border border-slate-200 text-center font-mono text-[10px] ${isSelected ? 'bg-emerald-100/50 text-emerald-700 font-black' : 'bg-slate-50 text-slate-400'}`}>{index + 2}</td>
                      <td className={`border border-slate-200 px-3 py-1 text-slate-800 ${isSelected ? 'border-2 border-emerald-500' : ''}`}>
                        <div className="flex items-center gap-1">
                          <span className="font-extrabold text-slate-900">{app.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold">({app.age} años)</span>
                        </div>
                      </td>
                      <td className="border border-slate-200 px-3 py-1 text-slate-500 font-mono">{app.documentType} {app.documentNumber}</td>
                      <td className="border border-slate-200 px-3 py-1 text-slate-600">{app.phone}</td>
                      <td className="border border-slate-200 px-3 py-1 text-slate-700">
                        <span className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold">{app.specialty}</span>
                      </td>
                      <td className="border border-slate-200 px-3 py-1">
                        {isUnassigned ? (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-extrabold text-[10px]">
                            <AlertTriangle size={11} className="text-rose-500 animate-pulse" /> Por asignar en centro
                          </span>
                        ) : (
                          <span className="text-slate-800 font-semibold">{app.doctor}</span>
                        )}
                      </td>
                      <td className="border border-slate-200 px-3 py-1 text-slate-700">{formatDateTime(app.nextAppointment)}</td>
                      <td className="border border-slate-200 px-3 py-1 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                          app.status === 'Confirmado' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : app.status === 'Pendiente' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-red-50 text-red-600 border-red-100'
                        }`}>{app.status}</span>
                      </td>
                      <td className="border border-slate-200 px-3 py-0.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={(e) => { e.stopPropagation(); handleOpenChatDrawer(app); }} className="p-1 text-slate-500 hover:text-emerald-600" title="Ver Chat"><MessageSquare size={12} className="text-emerald-500" /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleOpenEditModal(app); }} className="p-1 text-slate-500 hover:text-sky-600" title="Editar"><Edit2 size={12} /></button>
                          {app.status !== 'Cancelado' && (
                            <button onClick={(e) => { e.stopPropagation(); handleCancelAppointment(app); }} className="p-1 text-slate-500 hover:text-amber-600" title="Cancelar"><XCircle size={12} /></button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteAppointment(app); }} className="p-1 text-slate-500 hover:text-red-600" title="Eliminar"><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="bg-slate-100 border border-slate-300 text-center font-mono text-[10px] text-slate-400">2</td>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">Sin registros.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* STATUS BAR FOOTER */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-1.5 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 font-bold shrink-0">
          <div className="flex gap-x-4">
            <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase">Hoja 1</span>
            <span>Cargadas: <span className="text-slate-700">{filteredAppointments.length}</span></span>
            <span>Confirmadas: <span className="text-emerald-600">{appointments.filter(a => a.status === 'Confirmado').length}</span></span>
            <span>Pendientes: <span className="text-amber-600">{appointments.filter(a => a.status === 'Pendiente').length}</span></span>
          </div>
          <div>Google Sheets IPS Connector v1.0.0</div>
        </div>
      </div>

      {/* MODAL & DRAWER COMPONENT PORTALS */}
      <ChatDrawer isOpen={showChatDrawer} onClose={() => setShowChatDrawer(false)} patient={selectedChatPatient} appointments={appointments} />
      
      <AppointmentFormModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmit={handleCreateSubmit} isSaving={isSaving} doctors={doctors} patientProfiles={patientProfiles} />
      
      <EditAppointmentModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} onSubmit={handleUpdateSubmit} isSaving={isSaving} appointment={selectedAppointment} doctors={doctors} />
    </DashboardLayout>
  );
}
