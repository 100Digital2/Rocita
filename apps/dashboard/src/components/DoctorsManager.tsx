'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Plus,
  Trash2,
  CheckCircle2,
  Activity
} from 'lucide-react';

interface Toast {
  show: boolean;
  message: string;
  type: 'success' | 'info' | 'warning';
}

export default function DoctorsManager() {
  const { isAuthenticated } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newDoctorSpecialty, setNewDoctorSpecialty] = useState('');
  const [newDoctorEmail, setNewDoctorEmail] = useState('');
  const [newDoctorPhone, setNewDoctorPhone] = useState('');
  const [isSavingDoctor, setIsSavingDoctor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Toast notifications
  const [toast, setToast] = useState<Toast>({ show: false, message: '', type: 'success' });

  // API URL de la Demo
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const showToastNotification = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Fetch doctors from backend (with offline local storage fallback)
  const fetchDoctors = async () => {
    const token = localStorage.getItem('rocita_token');
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/doctors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (!data || data.length === 0) {
          throw new Error('Lista de médicos vacía en la base de datos');
        }
        setDoctors(data);
      } else {
        throw new Error('No se pudieron obtener los médicos del backend');
      }
    } catch (err) {
      console.warn('Backend offline o error al obtener médicos, cargando de localStorage...', err);
      const offlineDoctors = localStorage.getItem('rocita_doctors');
      let loadedDoctors = [];
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDoctors();
    }
  }, [isAuthenticated]);

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctorName || !newDoctorSpecialty || !newDoctorEmail || !newDoctorPhone) {
      showToastNotification('Todos los campos del médico son requeridos.', 'warning');
      return;
    }

    setIsSavingDoctor(true);
    const token = localStorage.getItem('rocita_token');

    const doctorPayload = {
      name: newDoctorName,
      specialty: newDoctorSpecialty,
      email: newDoctorEmail,
      phone: newDoctorPhone,
    };

    try {
      const res = await fetch(`${apiUrl}/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(doctorPayload),
      });

      if (res.ok) {
        showToastNotification('Médico registrado exitosamente.', 'success');
        fetchDoctors();
        // Reset form
        setNewDoctorName('');
        setNewDoctorSpecialty('');
        setNewDoctorEmail('');
        setNewDoctorPhone('');
      } else {
        throw new Error('Error al registrar médico');
      }
    } catch (err) {
      console.warn('Backend offline, registrando médico en modo demo (local)...', err);
      const newLocalDoctor = {
        id: Date.now(),
        ...doctorPayload,
      };
      const updatedDoctors = [...doctors, newLocalDoctor];
      setDoctors(updatedDoctors);
      localStorage.setItem('rocita_doctors', JSON.stringify(updatedDoctors));
      showToastNotification('Médico registrado localmente (Modo Demo).', 'success');

      // Reset form
      setNewDoctorName('');
      setNewDoctorSpecialty('');
      setNewDoctorEmail('');
      setNewDoctorPhone('');
    } finally {
      setIsSavingDoctor(false);
    }
  };

  const handleDeleteDoctor = async (id: number) => {
    const token = localStorage.getItem('rocita_token');

    try {
      const res = await fetch(`${apiUrl}/doctors/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        showToastNotification('Médico eliminado exitosamente.', 'success');
        fetchDoctors();
      } else {
        throw new Error('Error al eliminar médico');
      }
    } catch (err) {
      console.warn('Backend offline, eliminando médico de forma local...', err);
      const updatedDoctors = doctors.filter(doc => doc.id !== id);
      setDoctors(updatedDoctors);
      localStorage.setItem('rocita_doctors', JSON.stringify(updatedDoctors));
      showToastNotification('Médico eliminado localmente (Modo Demo).', 'success');
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
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

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Formulario de registro (2/5) */}
        <form onSubmit={handleAddDoctor} className="xl:col-span-2 space-y-4 bg-white p-6 md:p-8 rounded-[2rem] border border-blue-100/50 shadow-sm">
          <div className="mb-4">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Registrar Especialista</h4>
            <p className="text-[11px] font-bold text-slate-400 mt-1 leading-relaxed">Completa los campos para dar de alta al médico.</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 block ml-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={newDoctorName}
              onChange={(e) => setNewDoctorName(e.target.value)}
              placeholder="Dr. David Jaramillo"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 transition-all text-slate-800"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 block ml-1">Especialidad</label>
            <input
              type="text"
              required
              value={newDoctorSpecialty}
              onChange={(e) => setNewDoctorSpecialty(e.target.value)}
              placeholder="Cardiología / Pediatría"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 transition-all text-slate-800"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 block ml-1">Correo Electrónico</label>
            <input
              type="email"
              required
              value={newDoctorEmail}
              onChange={(e) => setNewDoctorEmail(e.target.value)}
              placeholder="david.jaramillo@clinica.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 transition-all text-slate-800"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 block ml-1">Teléfono Móvil</label>
            <input
              type="text"
              required
              value={newDoctorPhone}
              onChange={(e) => setNewDoctorPhone(e.target.value)}
              placeholder="+57 312 345 6789"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 transition-all text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingDoctor}
            className="w-full mt-2 py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-75"
          >
            {isSavingDoctor ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Plus size={14} /> Registrar Especialista
              </>
            )}
          </button>
        </form>

        {/* Listado de Médicos (3/5) */}
        <div className="xl:col-span-3 bg-white p-6 md:p-8 rounded-[2rem] border border-blue-100/50 shadow-sm flex flex-col min-h-[460px]">
          <div className="mb-6 flex justify-between items-center shrink-0">
            <div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Profesionales Activos</h4>
              <p className="text-[11px] font-bold text-slate-400 mt-1">Directorio de médicos registrados en el sistema.</p>
            </div>
            <span className="px-3 py-1.5 bg-sky-50 text-sky-600 rounded-full text-xs font-black">
              {doctors.length} Médicos
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                <Activity size={24} className="animate-spin text-sky-500" />
                <span className="text-xs font-bold">Cargando directorio...</span>
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                <p className="text-xs text-slate-400 font-bold">No hay médicos registrados.</p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Usa el formulario lateral para agregar tu primer especialista.</p>
              </div>
            ) : (
              doctors.map((doctor) => (
                <div 
                  key={doctor.id} 
                  className="bg-white border border-slate-100 hover:border-blue-100/80 hover:bg-sky-50/5 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4 group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-black text-sm shrink-0 font-bold">
                      {doctor.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-extrabold text-xs text-slate-800 truncate">{doctor.name}</h5>
                      <p className="text-[10px] font-black text-sky-500 uppercase tracking-wider mt-0.5">{doctor.specialty}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[9px] font-bold text-slate-400">
                        <span className="truncate">{doctor.email}</span>
                        <span>•</span>
                        <span>{doctor.phone}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteDoctor(doctor.id)}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90 shrink-0"
                    title="Eliminar médico"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
