'use client';

import { MessageSquare, ShieldCheck, CheckCheck } from 'lucide-react';

interface BotSandboxProps {
  message: string;
}

export default function BotSandbox({ message }: BotSandboxProps) {
  return (
    <div className="w-full lg:w-[440px] border-t lg:border-t-0 bg-white p-6 md:p-12 overflow-y-auto flex flex-col justify-start gap-6">
      <div>
        <h3 className="text-sm font-black text-slate-950 flex items-center gap-2 font-sans">
          <MessageSquare size={16} className="text-emerald-500" /> Sandbox de la IA en Tiempo Real
        </h3>
        <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider font-sans">Simulador de WhatsApp Business</p>
      </div>

      {/* Simulated WhatsApp Phone Chassis */}
      <div className="border border-slate-100 rounded-[2.5rem] bg-slate-955 p-6 flex flex-col gap-4 shadow-xl relative overflow-hidden min-h-[440px] max-w-sm mx-auto w-full">
        {/* Phone Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-505 flex items-center justify-center font-black text-sm">
              R
            </div>
            <div>
              <h4 className="font-extrabold text-[11px] text-white flex items-center gap-1 font-sans">
                Rocita 
                <span className="inline-flex items-center justify-center bg-sky-500 text-white rounded-full p-0.5 text-[7px]">
                  ✓
                </span>
              </h4>
              <span className="text-[8px] font-bold text-emerald-500 font-sans">En línea • Asistente IA</span>
            </div>
          </div>
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800/50 font-sans">
            Demo
          </span>
        </div>

        {/* Chat Body */}
        <div className="flex-1 flex flex-col justify-end gap-3 py-4 min-h-[300px]">
          {/* HIPAA Encryption Alert */}
          <div className="bg-amber-50/5/30 rounded-xl p-2.5 border border-amber-500/5 flex items-start gap-1.5 text-[8px] font-semibold text-amber-500 leading-normal max-w-[90%] mx-auto mb-2 text-center font-sans">
            <ShieldCheck size={11} className="text-amber-500 shrink-0 mt-0.5" />
            <p>Mensaje estructurado bajo la política oficial de plantillas autorizadas por Meta para Salud Eficiente.</p>
          </div>

          {/* Simulated Message Bubble */}
          <div className="flex flex-col max-w-[92%] self-start">
            <div className="bg-slate-800 text-slate-100 p-4 rounded-[1.5rem] rounded-tl-none text-[11px] leading-relaxed shadow-md font-medium font-sans">
              <p className="whitespace-pre-wrap">{message}</p>
            </div>
            
            <div className="flex items-center gap-1 mt-1 text-[8px] font-bold text-slate-500 self-start pl-1 font-sans">
              <span>Hoy 10:30 AM</span>
              <CheckCheck size={10} className="text-sky-500" />
            </div>
          </div>
        </div>

        {/* Chat Input simulation */}
        <div className="mt-auto border-t border-slate-900 pt-3 flex items-center justify-between shrink-0 text-slate-600 text-[10px] font-bold px-2 font-sans">
          <span>Respuesta del Paciente...</span>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800 font-mono text-[8px] text-slate-400">1</span>
            <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800 font-mono text-[8px] text-slate-400">2</span>
          </div>
        </div>
      </div>

      {/* Preview notice */}
      <div className="text-[10px] text-slate-400 font-bold text-center max-w-sm mx-auto leading-normal bg-slate-50/50 p-4 rounded-2xl border border-slate-100 font-sans">
        💡 Cambia la pestaña de **Plantillas** o el **Tono** en la pestaña de IA para ver cómo la IA adapta la conversación de forma instantánea.
      </div>
    </div>
  );
}
