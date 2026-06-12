'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Mail, Smartphone, Building2, Check, ArrowRight, Sparkles } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    clinic: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/100digital/demo';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envío de leads (puedes conectar esto a tu API más adelante)
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    setIsSubmitting(false);
    setStep(2); // Avanzar al agendador de Calendly
  };

  const handleReset = () => {
    setStep(1);
    setFormData({ name: '', email: '', whatsapp: '', clinic: '' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all z-20 outline-none"
            >
              <X size={20} />
            </button>

            {step === 1 ? (
              <div className="p-8 md:p-12 overflow-y-auto">
                <div className="mb-8 pr-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-600 text-xs font-bold mb-4 tracking-wide">
                    <Sparkles size={12} className="animate-pulse" />
                    AGENDAR ACCESO PRIORITARIO
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-3">
                    Asegura tu demo con <span className="text-primary">Rocita</span>
                  </h3>
                  <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                    Completa tus datos básicos para calificar tu centro de salud y abrir la agenda de videollamada personalizada.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Tu Nombre</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          required
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Ej. Dr. Carlos Pérez"
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all text-sm font-medium"
                        />
                      </div>
                    </div>

                    {/* IPS / Clínica */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Clínica / IPS</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          required
                          type="text"
                          name="clinic"
                          value={formData.clinic}
                          onChange={handleChange}
                          placeholder="Ej. Clínica del Norte"
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all text-sm font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Correo Institucional</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          required
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="carlos.perez@clinica.com"
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all text-sm font-medium"
                        />
                      </div>
                    </div>

                    {/* WhatsApp */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Número de WhatsApp</label>
                      <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          required
                          type="tel"
                          name="whatsapp"
                          value={formData.whatsapp}
                          onChange={handleChange}
                          placeholder="Ej. 3101234567"
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all text-sm font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 px-6 rounded-2xl text-base font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-98 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Ver Agenda de Demo</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-slate-400 leading-normal">
                    Al continuar, aceptas que un especialista técnico de Rocita te contacte por correo o WhatsApp para coordinar los detalles. Cumplimos con Habeas Data.
                  </p>
                </form>
              </div>
            ) : (
              <div className="p-8 md:p-12 flex flex-col items-center text-center justify-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
                  className="w-20 h-20 rounded-[2.5rem] bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/10"
                >
                  <Check size={40} className="stroke-[3]" />
                </motion.div>

                <div className="space-y-3 max-w-md">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    ¡Solicitud Recibida!
                  </h3>
                  <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                    Hola <span className="font-bold text-slate-800">{formData.name}</span>, hemos registrado tu interés para <span className="font-bold text-slate-800">{formData.clinic}</span>.
                  </p>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Un asesor técnico especializado se pondrá en contacto contigo a través de tu correo <span className="font-semibold text-slate-700">{formData.email}</span> o vía WhatsApp para coordinar tu demostración personalizada.
                  </p>
                </div>

                <div className="pt-4 w-full">
                  <button
                    onClick={onClose}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 px-6 rounded-2xl text-base font-bold transition-all active:scale-98"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
