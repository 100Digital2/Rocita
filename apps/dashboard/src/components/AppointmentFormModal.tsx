'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { X, Plus, Calendar, User, AlertTriangle } from 'lucide-react';

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

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isSaving: boolean;
  doctors: Doctor[];
  patientProfiles: PatientProfile[];
}

const appointmentSchema = z.object({
  profileId: z.string(),
  name: z.string().min(2, 'El nombre completo es obligatorio (mínimo 2 letras)'),
  documentType: z.string(),
  documentNumber: z.string().min(4, 'El documento es obligatorio (mínimo 4 dígitos)'),
  age: z.number().min(1, 'La edad debe ser mayor a 0'),
  gender: z.string(),
  phone: z.string().min(7, 'El celular es obligatorio (mínimo 7 dígitos)'),
  email: z.string().email('Correo electrónico no válido').or(z.string().length(0)),
  specialty: z.string(),
  doctorId: z.string(),
  nextAppointment: z.string().min(10, 'La fecha y hora son obligatorias')
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export default function AppointmentFormModal({
  isOpen,
  onClose,
  onSubmit,
  isSaving,
  doctors,
  patientProfiles
}: AppointmentFormModalProps) {
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      profileId: 'new',
      name: '',
      documentType: 'CC',
      documentNumber: '',
      age: 30,
      gender: 'M',
      phone: '',
      email: '',
      specialty: 'Consulta General',
      doctorId: 'unassigned',
      nextAppointment: ''
    }
  });

  const selectedProfileId = watch('profileId');
  const selectedDoctorId = watch('doctorId');

  // Sync profile data when selecting existing patient profile
  useEffect(() => {
    if (selectedProfileId !== 'new') {
      const profile = patientProfiles.find(p => p.id.toString() === selectedProfileId);
      if (profile) {
        setValue('name', profile.name);
        setValue('documentType', profile.documentType);
        setValue('documentNumber', profile.documentNumber);
        setValue('gender', profile.gender);
        setValue('phone', profile.phone);
        setValue('email', profile.email || '');
      }
    } else {
      setValue('name', '');
      setValue('documentNumber', '');
      setValue('phone', '');
      setValue('email', '');
      setValue('age', 30);
      setValue('gender', 'M');
    }
  }, [selectedProfileId, patientProfiles, setValue]);

  // Sync doctor specialty automatically
  useEffect(() => {
    if (selectedDoctorId !== 'unassigned') {
      const doc = doctors.find(d => d.id.toString() === selectedDoctorId);
      if (doc) {
        setValue('specialty', doc.specialty);
      }
    }
  }, [selectedDoctorId, doctors, setValue]);

  const handleFormSubmit = async (values: AppointmentFormValues) => {
    await onSubmit(values);
    reset();
  };

  if (!isOpen) return null;

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
              <Plus size={20} />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-950 font-sans">Agendar Cita en Hoja</h3>
              <p className="text-xs text-slate-400 font-bold">Añadir nueva fila de cita médica</p>
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
          {/* Profile selection */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 block">Perfil del Paciente</label>
            <select
              {...register('profileId')}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
            >
              <option value="new">🆕 Registrar nuevo paciente para la cita</option>
              {patientProfiles.map(p => (
                <option key={p.id} value={p.id.toString()}>
                  {p.name} ({p.documentType} {p.documentNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Patient Details Card */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100/50 space-y-4">
            <h4 className="text-xs font-black text-slate-700 flex items-center gap-2">
              <User size={14} className="text-emerald-600" /> Información del Paciente
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 block">Nombre Completo *</label>
                <input
                  type="text"
                  {...register('name')}
                  disabled={selectedProfileId !== 'new'}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:bg-slate-100 disabled:text-slate-500"
                  placeholder="Ej. Juan Pérez"
                />
                {errors.name && <span className="text-[10px] text-rose-500 font-bold">{errors.name.message}</span>}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 block">Tipo *</label>
                  <select
                    {...register('documentType')}
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
                    {...register('documentNumber')}
                    disabled={selectedProfileId !== 'new'}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder="Ej. 10123456"
                  />
                  {errors.documentNumber && <span className="text-[10px] text-rose-500 font-bold">{errors.documentNumber.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 block">Edad *</label>
                  <input
                    type="number"
                    {...register('age', { valueAsNumber: true })}
                    disabled={selectedProfileId !== 'new'}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:bg-slate-100 disabled:text-slate-500"
                  />
                  {errors.age && <span className="text-[10px] text-rose-500 font-bold">{errors.age.message}</span>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 block">Género</label>
                  <select
                    {...register('gender')}
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
                  {...register('phone')}
                  disabled={selectedProfileId !== 'new'}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:bg-slate-100 disabled:text-slate-500"
                  placeholder="Ej. +57 310 123 4567"
                />
                {errors.phone && <span className="text-[10px] text-rose-500 font-bold">{errors.phone.message}</span>}
              </div>

              <div className="col-span-1 md:col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 block">Correo Electrónico</label>
                <input
                  type="email"
                  {...register('email')}
                  disabled={selectedProfileId !== 'new'}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:bg-slate-100 disabled:text-slate-500"
                  placeholder="paciente@correo.com"
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
                <label className="text-[10px] font-black uppercase text-slate-400 block">Especialidad *</label>
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
                <label className="text-[10px] font-black uppercase text-slate-400 block">Profesional Asignado *</label>
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
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 block">Fecha y Hora de la Cita *</label>
                <input
                  type="datetime-local"
                  {...register('nextAppointment')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                {errors.nextAppointment && <span className="text-[10px] text-rose-500 font-bold">{errors.nextAppointment.message}</span>}
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
              {isSaving ? 'Agendando...' : 'Añadir Fila'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
