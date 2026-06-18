'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Search,
  Phone,
  Mail,
  Calendar,
  Eye,
  Plus
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ChatDrawer from '../../components/ChatDrawer';
import PatientFormModal from '../../components/PatientFormModal';
import { usePatients } from '../../hooks/usePatients';

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

export default function PacientesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Confirmado' | 'Pendiente' | 'Cancelado'>('Todos');
  const [selectedPatient, setSelectedPatient] = useState<Appointment | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSavingPatient, setIsSavingPatient] = useState(false);

  // Custom hook for patient data fetching and sockets sync
  const { patients, createPatient } = usePatients();

  // Auth Protection Check
  useEffect(() => {
    const auth = localStorage.getItem('rocita_auth');
    if (!auth) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Format patients to match Appointment type expected by ChatDrawer
  const formattedPatients: Appointment[] = patients.map(p => {
    const dbIdStr = p.id.split('-')[1];
    const dbId = dbIdStr ? parseInt(dbIdStr, 10) : undefined;
    
    return {
      id: p.id,
      dbId,
      name: p.name,
      age: p.age || 30,
      documentType: p.documentType || 'CC',
      documentNumber: p.documentNumber || '',
      gender: p.gender || 'M',
      phone: p.phone || '',
      email: p.email || '',
      status: p.status || 'Pendiente',
      specialty: p.specialty || 'Sin asignar',
      doctor: p.doctor || 'Sin asignar',
      doctorEmail: p.doctorEmail || '',
      doctorPhone: p.doctorPhone || '',
      nextAppointment: p.nextAppointment || 'Sin citas programadas'
    };
  });

  // Action: Register new patient using hook mutation
  const handleRegisterPatient = async (values: {
    name: string;
    documentType: string;
    documentNumber: string;
    gender: string;
    phone: string;
    email: string;
  }) => {
    setIsSavingPatient(true);
    try {
      await createPatient(values);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error al registrar paciente:', err);
    } finally {
      setIsSavingPatient(false);
    }
  };

  // Open Drawer and Select Patient
  const handleOpenDrawer = (patient: Appointment) => {
    setSelectedPatient(patient);
    setShowDrawer(true);
  };

  // Close Drawer
  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setSelectedPatient(null);
  };

  // Filtering Logic
  const filteredPatients = formattedPatients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patient.phone.includes(searchQuery) ||
                          patient.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patient.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'Todos' || patient.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalCount = formattedPatients.length;
  const confirmedCount = formattedPatients.filter(p => p.status === 'Confirmado').length;
  const pendingCount = formattedPatients.filter(p => p.status === 'Pendiente').length;
  const nonCancelledCount = totalCount - formattedPatients.filter(p => p.status === 'Cancelado').length;
  const attendanceRate = nonCancelledCount > 0 
    ? ((confirmedCount / nonCancelledCount) * 100).toFixed(1)
    : '0.0';

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
              className="bg-white border border-blue-100 rounded-full py-2.5 pl-12 pr-6 text-sm focus:ring-2 focus:ring-sky-500 outline-none w-72 transition-all shadow-sm font-sans"
            />
          </div>
        </div>
      }
    >
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

      {/* Patient Detail slide-over Drawer (WhatsApp Chat) */}
      <ChatDrawer
        isOpen={showDrawer}
        onClose={handleCloseDrawer}
        patient={selectedPatient}
        appointments={formattedPatients}
      />

      {/* Modal para registrar un nuevo paciente */}
      <PatientFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleRegisterPatient}
        isSaving={isSavingPatient}
      />
    </DashboardLayout>
  );
}
