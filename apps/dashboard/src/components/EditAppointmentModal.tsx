'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { X, Edit2, Calendar, User, AlertTriangle } from 'lucide-react';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  phone: string;
  email: string;
}

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

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isSaving: boolean;
  appointment: Appointment | null;
  doctors: Doctor[];
}

const editSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  phone: z.string().min(7, 'El celular es obligatorio'),
  email: z.string().email('Correo electrónico no válido').or(z.string().length(0)),
  specialty: z.string().min(2, 'La especialidad es obligatoria'),
  doctorId: z.string(),
  nextAppointment: z.string().min(10, 'La fecha y hora son obligatorias'),
  status: z.enum(['Confirmado', 'Pendiente', 'Cancelado'])
});

type EditFormValues = z.infer<typeof editSchema>;

export default function EditAppointmentModal({
  isOpen,
  onClose,
  onSubmit,
  isSaving,
  appointment,
  doctors
}: EditAppointmentModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      specialty: '',
      doctorId: 'unassigned',
      nextAppointment: '',
      status: 'Pendiente'
    }
  });

  const selectedDoctorId = watch('doctorId');

  // Prepopulate form when appointment is loaded
  useEffect(() => {
    if (appointment) {
      setValue('name', appointment.name);
      setValue('phone', appointment.phone);
      setValue('email', appointment.email || '');
      setValue('specialty', appointment.specialty);
      setValue('nextAppointment', appointment.nextAppointment || '');
      setValue('status', appointment.status);

      const foundDoc = doctors.find(d => d.name === appointment.doctor);
      setValue('doctorId', foundDoc ? foundDoc.id.toString() : 'unassigned');
    }
  }, [appointment, doctors, setValue]);

  // Sync specialty when doctor changes
  useEffect(() => {
    if (selectedDoctorId !== 'unassigned') {
      const doc = doctors.find(d => d.id.toString() === selectedDoctorId);
      if (doc) {
        setValue('specialty', doc.specialty);
      }
    }
  }, [selectedDoctorId, doctors, setValue]);

  const handleFormSubmit = async (values: EditFormValues) => {
    await onSubmit(values);
    reset();
  };

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
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
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Patient Info Card */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100/50 space-y-4">
            <h4 className="text-xs font-black text-slate-700 flex items-center gap-2">
              <User size={14} className="text-emerald-600" /> Datos del Paciente
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 block">Nombre del Paciente</label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                {errors.name && <span className="text-[10px] text-rose-500 font-bold">{errors.name.message}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 block">Celular / Teléfono</label>
                <input
                  type="text"
                  {...register('phone')}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                {errors.phone && <span className="text-[10px] text-rose-500 font-bold">{errors.phone.message}</span>}
              </div>

              <div className="col-span-1 md:col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 block">Correo Electrónico</label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                {errors.email && <span className="text-[10px] text-rose-500 font-bold">{errors.email.message}</span>}
              </div>
            </div>
          </div>

          {/* Appointment details */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-700 flex items-center gap-2">
              <Calendar size={14} className="text-emerald-600" /> Detalles de la Cita
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 block">Especialidad</label>
                <select
                  {...register('specialty')}
                  disabled={selectedDoctorId !== 'unassigned'}
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
                  {...register('doctorId')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                >
                  <option value="unassigned">⚠️ Por asignar (En el centro médico)</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id.toString()}>
                      {d.name} ({d.specialty})
                    </option>
                  ))}
                </select>
                {selectedDoctorId === 'unassigned' && (
                  <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                    <AlertTriangle size={12} /> Cita sin médico (se asignará físicamente en IPS)
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 block">Fecha y Hora</label>
                <input
                  type="datetime-local"
                  {...register('nextAppointment')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                {errors.nextAppointment && <span className="text-[10px] text-rose-500 font-bold">{errors.nextAppointment.message}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 block">Estado de la Cita</label>
                <select
                  {...register('status')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Confirmado">Confirmado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-100 pt-6 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
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
  );
}
