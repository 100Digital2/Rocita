'use client';
import { ArrowRight, Sparkles, ShieldCheck, Zap, MousePointer2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section id="servicios" className="relative pt-44 pb-32 px-6 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] bg-rocita-red/5 blur-[100px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-zinc-200 text-zinc-600 text-xs font-bold mb-8 shadow-sm uppercase tracking-widest"
          >
            <span className="w-2 h-2 bg-rocita-red rounded-full animate-pulse"></span>
            Operativa en 100Digital
          </motion.div>

          {/* SHOWROOM DE ESTILOS RO-CITA */}
          <div className="mb-16 p-10 bg-white/50 backdrop-blur-xl rounded-[3rem] border border-blue-100 shadow-2xl shadow-sky-900/5 max-w-4xl mx-auto w-full">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-500 mb-10">Laboratorio de Identidad Visual</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
              {/* Opción 1: El Contraste de Pesos */}
              <div className="flex flex-col items-center gap-4 group cursor-pointer">
                <div className="text-5xl transition-transform group-hover:scale-110 duration-500">
                  <span className="font-black tracking-tighter text-slate-900">Ro</span>
                  <span className="font-light tracking-wide text-slate-900">cita</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tech + Humano</span>
              </div>

              {/* Opción 2: El Salto de Color (Recomendada) */}
              <div className="flex flex-col items-center gap-4 group cursor-pointer p-6 bg-sky-50 rounded-[2rem] border border-sky-100">
                <div className="text-5xl transition-transform group-hover:scale-110 duration-500">
                  <span className="font-extrabold tracking-tight text-slate-900">Ro</span>
                  <span className="font-extrabold tracking-tight text-sky-500">cita</span>
                </div>
                <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">SaaS Moderno</span>
              </div>

              {/* Opción 3: Fusión de Tipografías */}
              <div className="flex flex-col items-center gap-4 group cursor-pointer">
                <div className="text-5xl transition-transform group-hover:scale-110 duration-500">
                  <span className="font-mono font-bold tracking-tighter text-sky-600">Ro</span>
                  <span className="font-sans font-medium text-sky-600">cita</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Código + Salud</span>
              </div>
            </div>
            <p className="mt-8 text-sm font-medium text-slate-400 italic">"Ro" de Robotismo, "cita" de Cercanía</p>
          </div>

          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl md:text-[7.5rem] font-black tracking-tighter mb-10 max-w-6xl leading-[0.85] text-zinc-900"
          >
            Soy Roc<span className="text-rocita-red">i</span>ta,<br /> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">aseguro tus citas.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-zinc-500 mb-14 max-w-2xl leading-relaxed"
          >
            La IA que transforma la inasistencia en rentabilidad. Notificaciones inteligentes, recordatorios oportunos y confirmación automática.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6 relative"
          >
            <button className="relative overflow-hidden bg-primary text-primary-foreground px-10 py-5 rounded-2xl text-xl font-bold hover:shadow-[0_0_40px_rgba(14,165,233,0.3)] transition-all flex items-center gap-3 group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
              Agenda una demo 
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-white border-2 border-zinc-100 px-10 py-5 rounded-2xl text-xl font-bold hover:bg-zinc-50 transition-all text-zinc-700 flex items-center gap-2">
              Cómo funciona <MousePointer2 size={18} className="text-rocita-red" />
            </button>
          </motion.div>
        </div>

        {/* 3 Step Storytelling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
           {[
             { step: '01', title: 'Carga Masiva', desc: 'Sube tu Excel o conecta tu HIS en segundos.', color: 'text-primary' },
             { step: '02', title: 'Flujo IA', desc: 'Rocita procesa y personaliza cada mensaje.', color: 'text-rocita-red' },
             { step: '03', title: 'Agenda Llena', desc: 'Confirmaciones en tiempo real para tu equipo.', color: 'text-emerald-500' }
           ].map((item, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.2 }}
               className="p-10 rounded-[3rem] bg-white border border-zinc-100 shadow-sm hover:shadow-xl transition-all group"
             >
                <div className={`${item.color} text-5xl font-black mb-6 opacity-20 group-hover:opacity-100 transition-opacity`}>{item.step}</div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">{item.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{item.desc}</p>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
}
