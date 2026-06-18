'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { X, Plus, User } from 'lucide-react';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isSaving: boolean;
}

const patientSchema = z.object({
  name: z.string().min(2, 'El nombre completo es obligatorio (mínimo 2 letras)'),
  documentType: z.string(),
  documentNumber: z.string().min(4, 'El documento es obligatorio (mínimo 4 dígitos)'),
  gender: z.string(),
  phone: z.string().min(7, 'El celular es obligatorio (mínimo 7 dígitos)'),
  email: z.string().email('Correo electrónico no válido')
});

type PatientFormValues = z.infer<typeof patientSchema>;

export default function PatientFormModal({
  isOpen,
  onClose,
  onSubmit,
  isSaving
}: PatientFormModalProps) {
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      documentType: 'CC',
      documentNumber: '',
      gender: 'M',
      phone: '',
      email: ''
    }
  });

  const handleFormSubmit = async (values: PatientFormValues) => {
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
        className="bg-white rounded-[2rem] w-full max-w-xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow">
              <Plus size={20} />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-950 font-sans">Registrar Paciente</h3>
              <p className="text-xs text-slate-400 font-bold">Añadir nuevo perfil de paciente</p>
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
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100/50 space-y-4">
            <h4 className="text-xs font-black text-slate-700 flex items-center gap-2">
              <User size={14} className="text-sky-500" /> Información General
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 block">Nombre Completo *</label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  placeholder="Ej. Juan Pérez"
                />
                {errors.name && <span className="text-[10px] text-rose-500 font-bold">{errors.name.message}</span>}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 block">Tipo *</label>
                  <select
                    {...register('documentType')}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-2 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 transition-all"
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
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                    placeholder="Ej. 10123456"
                  />
                  {errors.documentNumber && <span className="text-[10px] text-rose-500 font-bold">{errors.documentNumber.message}</span>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 block">Género</label>
                <select
                  {...register('gender')}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 block">Celular / Teléfono *</label>
                <input
                  type="text"
                  {...register('phone')}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  placeholder="Ej. +57 310 123 4567"
                />
                {errors.phone && <span className="text-[10px] text-rose-500 font-bold">{errors.phone.message}</span>}
              </div>

              <div className="col-span-1 md:col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 block">Correo Electrónico *</label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  placeholder="paciente@correo.com"
                />
                {errors.email && <span className="text-[10px] text-rose-500 font-bold">{errors.email.message}</span>}
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
              className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-full shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2"
            >
              {isSaving ? 'Guardando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
