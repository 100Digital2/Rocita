'use client';

import { motion } from 'framer-motion';
import {
  Sliders,
  Check,
  Info,
  Globe,
  CheckCheck,
  MessageSquare,
  Phone,
  FileText,
  Building,
  Mail,
  ShieldCheck
} from 'lucide-react';

interface ConfigProps {
  clinicName: string;
  setClinicName: (val: string) => void;
  clinicNit: string;
  setClinicNit: (val: string) => void;
  clinicEmail: string;
  setClinicEmail: (val: string) => void;
  clinicPhone: string;
  setClinicPhone: (val: string) => void;
  aiTone: 'empatico' | 'formal' | 'persuasivo';
  setAiTone: (val: 'empatico' | 'formal' | 'persuasivo') => void;
  advanceHours: number;
  setAdvanceHours: (val: number) => void;
  sendHourStart: string;
  setSendHourStart: (val: string) => void;
  sendHourEnd: string;
  setSendHourEnd: (val: string) => void;
  maxAttempts: string;
  setMaxAttempts: (val: string) => void;
  whatsappApiKey: string;
  setWhatsappApiKey: (val: string) => void;
  showApiKey: boolean;
  setShowApiKey: (val: boolean) => void;
  smsFallback: boolean;
  setSmsFallback: (val: boolean) => void;
  voiceFallback: boolean;
  setVoiceFallback: (val: boolean) => void;
  isApiConnecting: boolean;
  apiConnectionStatus: 'connected' | 'error' | 'none';
  whatsappStatus: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';
  qrCode: string | null;
  templateCategory: 'confirmacion' | 'reprogramacion' | 'cancelacion';
  setTemplateCategory: (val: 'confirmacion' | 'reprogramacion' | 'cancelacion') => void;
  templateText: string;
  setTemplateText: (val: string) => void;
  connectWhatsapp: () => Promise<any>;
  disconnectWhatsapp: () => Promise<any>;
  testConnection: () => Promise<any>;
}

interface ConfigTabsContentProps {
  activeTab: 'ia' | 'canales' | 'plantillas' | 'perfil';
  config: ConfigProps;
}

export default function ConfigTabsContent({ activeTab, config }: ConfigTabsContentProps) {
  return (
    <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-blue-100/50 shadow-sm min-h-[460px] flex flex-col justify-between">
      
      {/* TAB 1: Motor de IA Rocita */}
      {activeTab === 'ia' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h3 className="text-md font-black text-slate-900 flex items-center gap-2 font-sans">
              <Sliders size={18} className="text-sky-500" /> Tono de Voz de la IA
            </h3>
            <p className="text-xs text-slate-400 font-bold mt-1 font-sans">Configura la personalidad y empatía del asistente al redactar mensajes clínicos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Empático Card */}
            <button
              onClick={() => config.setAiTone('empatico')}
              className={`p-5 rounded-3xl border text-left flex flex-col gap-3 transition-all relative overflow-hidden ${
                config.aiTone === 'empatico'
                  ? 'border-sky-500 bg-sky-50/30 ring-2 ring-sky-500/20'
                  : 'border-slate-100 hover:border-slate-200 bg-white'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${config.aiTone === 'empatico' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                ❤️
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-800 font-sans">Cálido y Empático</h4>
                <p className="text-[10px] font-medium text-slate-400 mt-1 leading-normal font-sans">Cercano, afectuoso y humanizado. Excelente para pediatría y medicina general.</p>
              </div>
              {config.aiTone === 'empatico' && (
                <div className="absolute top-4 right-4 text-sky-500"><Check size={16} /></div>
              )}
            </button>

            {/* Formal Card */}
            <button
              onClick={() => config.setAiTone('formal')}
              className={`p-5 rounded-3xl border text-left flex flex-col gap-3 transition-all relative overflow-hidden ${
                config.aiTone === 'formal'
                  ? 'border-sky-500 bg-sky-50/30 ring-2 ring-sky-500/20'
                  : 'border-slate-100 hover:border-slate-200 bg-white'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${config.aiTone === 'formal' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                💼
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-800 font-sans">Formal y Corporativo</h4>
                <p className="text-[10px] font-medium text-slate-400 mt-1 leading-normal font-sans">Institucional, respetuoso y clínico. Ideal para consultas de alta especialidad.</p>
              </div>
              {config.aiTone === 'formal' && (
                <div className="absolute top-4 right-4 text-sky-500"><Check size={16} /></div>
              )}
            </button>

            {/* Persuasivo Card */}
            <button
              onClick={() => config.setAiTone('persuasivo')}
              className={`p-5 rounded-3xl border text-left flex flex-col gap-3 transition-all relative overflow-hidden ${
                config.aiTone === 'persuasivo'
                  ? 'border-sky-500 bg-sky-50/30 ring-2 ring-sky-500/20'
                  : 'border-slate-100 hover:border-slate-200 bg-white'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${config.aiTone === 'persuasivo' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                🚨
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-800 font-sans">Persuasivo y Directo</h4>
                <p className="text-[10px] font-medium text-slate-400 mt-1 leading-normal font-sans">Enfocado en evitar ausentismo con llamados de atención éticos y de salud.</p>
              </div>
              {config.aiTone === 'persuasivo' && (
                <div className="absolute top-4 right-4 text-sky-500"><Check size={16} /></div>
              )}
            </button>
          </div>

          {/* Range Sliders & Time Blockers */}
          <div className="border-t border-slate-100 pt-6 space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              
              {/* Advance timeline hours */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-slate-700 font-sans">
                  <span>Antelación de Envío</span>
                  <span className="text-sky-500 bg-sky-50 px-2 py-0.5 rounded-full font-sans">{config.advanceHours} Horas</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="72"
                  step="12"
                  value={config.advanceHours}
                  onChange={(e) => config.setAdvanceHours(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <div className="flex justify-between text-[9px] font-bold text-slate-400 font-sans">
                  <span>12 horas</span>
                  <span>24h (Recomendado)</span>
                  <span>48 horas</span>
                  <span>72 horas</span>
                </div>
              </div>

              {/* Maximum follow-up attempts */}
              <div className="w-full md:w-48 space-y-2">
                <label className="text-xs font-black text-slate-700 block font-sans">Intentos de Seguimiento</label>
                <select
                  value={config.maxAttempts}
                  onChange={(e) => config.setMaxAttempts(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-sky-500 outline-none transition-all font-sans cursor-pointer text-slate-800"
                >
                  <option value="1">1 Mensaje único</option>
                  <option value="2">2 Recordatorios máx.</option>
                  <option value="3">3 Recordatorios máx.</option>
                </select>
              </div>
            </div>

            {/* Reminders allowed schedule */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5 font-sans">
                <Info size={14} className="text-sky-500" /> Restricción Horaria Operativa
              </h4>
              <p className="text-[10px] font-bold text-slate-400 leading-normal font-sans">
                Evita incomodar a los pacientes limitando los envíos automáticos únicamente durante franjas horarias adecuadas.
              </p>
              
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1">
                  <span className="text-[9px] font-black uppercase text-slate-400 block mb-1 font-sans">Hora Inicio</span>
                  <input
                    type="time"
                    value={config.sendHourStart}
                    onChange={(e) => config.setSendHourStart(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 w-full transition-all text-slate-800 font-sans"
                  />
                </div>
                <span className="text-slate-300 font-bold text-xs mt-4 font-sans">a</span>
                <div className="flex-1">
                  <span className="text-[9px] font-black uppercase text-slate-400 block mb-1 font-sans">Hora Fin</span>
                  <input
                    type="time"
                    value={config.sendHourEnd}
                    onChange={(e) => config.setSendHourEnd(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 w-full transition-all text-slate-800 font-sans"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: Integración de Canales */}
      {activeTab === 'canales' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h3 className="text-md font-black text-slate-900 flex items-center gap-2 font-sans">
              <Globe size={18} className="text-sky-500" /> Integración de Canales de Envío
            </h3>
            <p className="text-xs text-slate-400 font-bold mt-1 font-sans">Sincroniza tu cuenta de WhatsApp para emitir recordatorios automatizados de citas.</p>
          </div>

          {/* WhatsApp Connection State Handler */}
          <div className="bg-slate-50 border border-blue-50/50 rounded-[2rem] p-6 md:p-8 space-y-6">
            {config.whatsappStatus === 'DISCONNECTED' && (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm flex items-center justify-center mx-auto text-slate-400">
                  <Globe size={28} />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-800 font-sans">WhatsApp Desconectado</h4>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 max-w-sm mx-auto leading-normal font-sans">
                    Para poder enviar recordatorios automáticos, debes vincular una cuenta escaneando el código QR desde tu celular.
                  </p>
                </div>
                <button
                  onClick={config.connectWhatsapp}
                  disabled={config.isApiConnecting}
                  className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-full shadow-lg shadow-sky-500/25 hover:shadow-sky-600/30 transition-all inline-flex items-center gap-2 active:scale-95 duration-200 font-sans"
                >
                  {config.isApiConnecting ? 'Generando...' : 'Vincular Cuenta (Generar QR)'}
                </button>
              </div>
            )}

            {config.whatsappStatus === 'CONNECTING' && (
              <div className="text-center space-y-4 flex flex-col items-center justify-center py-2">
                {config.qrCode ? (
                  <>
                    <div className="p-4 bg-white border border-blue-100 rounded-[2rem] shadow-md inline-block max-w-[200px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={config.qrCode} alt="Código QR de WhatsApp" className="w-full h-auto" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 font-sans">Escanea el código QR</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 max-w-xs mx-auto leading-normal font-sans">
                        Abre WhatsApp en tu teléfono ➔ Menú / Configuración ➔ Dispositivos vinculados ➔ Vincular un dispositivo.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="py-6 space-y-4">
                    <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin mx-auto"></div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 font-sans">Iniciando canal de WhatsApp...</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 max-w-xs mx-auto leading-normal font-sans">
                        Estamos estableciendo los WebSockets del backend. El código QR aparecerá en unos segundos.
                      </p>
                    </div>
                  </div>
                )}
                <button
                  onClick={config.disconnectWhatsapp}
                  disabled={config.isApiConnecting}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-[10px] rounded-xl transition-all font-sans"
                >
                  Cancelar Vinculación
                </button>
              </div>
            )}

            {config.whatsappStatus === 'CONNECTED' && (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-[1.5rem] shadow-sm flex items-center justify-center mx-auto text-emerald-500 relative">
                  <CheckCheck size={28} className="animate-pulse" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-emerald-600 flex items-center justify-center gap-1.5 font-sans">
                    WhatsApp Conectado Exitosamente
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 max-w-sm mx-auto leading-normal font-sans">
                    Tu cuenta está activa en el sistema. Rocita enviará los recordatorios programados en tiempo real.
                  </p>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 text-left max-w-xs mx-auto space-y-2 text-[10px] font-bold text-slate-600 font-sans font-sans">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Canal:</span>
                    <span>Embebido (Baileys)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estado:</span>
                    <span className="text-emerald-500 font-black">Activo (100% OK)</span>
                  </div>
                </div>
                <button
                  onClick={config.disconnectWhatsapp}
                  disabled={config.isApiConnecting}
                  className="px-5 py-2.5 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 border border-rose-100 hover:border-rose-500 font-black text-[10px] rounded-full transition-all active:scale-95 duration-200 font-sans"
                >
                  Desconectar Cuenta
                </button>
              </div>
            )}
          </div>

          {/* Fallback settings */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h4 className="text-xs font-black text-slate-700 font-sans">Canales de Respaldo Operativo</h4>
            
            <div className="space-y-3">
              {/* SMS Switch */}
              <label className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50/50 border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <MessageSquare size={16} className="text-slate-400" />
                  <div>
                    <span className="text-xs font-extrabold text-slate-800 block font-sans">Respaldo por SMS</span>
                    <span className="text-[9px] font-medium text-slate-400 font-sans">Si el paciente no posee WhatsApp, enviar SMS plano.</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.smsFallback}
                  onChange={(e) => config.setSmsFallback(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-500 accent-sky-500 cursor-pointer"
                />
              </label>

              {/* Phone Voice Switch */}
              <label className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50/50 border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-slate-400" />
                  <div>
                    <span className="text-xs font-extrabold text-slate-800 block font-sans">Llamadas de Voz (IA Synthesizer)</span>
                    <span className="text-[9px] font-medium text-slate-400 font-sans">Llamada telefónica interactiva con voz sintética en caso de fallo digital.</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.voiceFallback}
                  onChange={(e) => config.setVoiceFallback(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-500 accent-sky-500 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 3: Editor de Plantillas */}
      {activeTab === 'plantillas' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h3 className="text-md font-black text-slate-900 flex items-center gap-2 font-sans">
              <FileText size={18} className="text-sky-500" /> Editor y Compositor de Plantillas
            </h3>
            <p className="text-xs text-slate-400 font-bold mt-1 font-sans">Escribe los borradores base que utilizará Rocita para estructurar recordatorios.</p>
          </div>

          {/* Template categories */}
          <div className="flex items-center gap-2 p-1 bg-slate-50 border border-slate-100 rounded-2xl">
            {(['confirmacion', 'reprogramacion', 'cancelacion'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => config.setTemplateCategory(cat)}
                className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all font-sans ${
                  config.templateCategory === cat ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50 font-black' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {cat === 'confirmacion' ? 'Confirmar' : cat === 'reprogramacion' ? 'Reprogramar' : 'Cancelar'}
              </button>
            ))}
          </div>

          {/* Textarea Editor */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 flex items-center justify-between font-sans">
              <span>Estructura de la Plantilla</span>
              <span className="text-[10px] font-bold text-sky-500">Plantilla Validada por Meta</span>
            </label>
            <textarea
              value={config.templateText}
              onChange={(e) => config.setTemplateText(e.target.value)}
              rows={5}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold leading-relaxed outline-none focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all resize-none text-slate-800 font-sans"
            />
            
            {/* Dynamic interpolation tags helper */}
            <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[9px] font-black text-slate-400 font-sans">
              <span>Etiquetas Permitidas:</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 cursor-help" title="Nombre de pila del paciente">{`{nombre}`}</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 cursor-help" title="Nombre completo del médico">{`{doctor}`}</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 cursor-help" title="Especialidad clínica de la cita">{`{especialidad}`}</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 cursor-help" title="Fecha y hora de la cita">{`{fecha}`}</span>
            </div>
          </div>

          {/* Prompt Tips Callout */}
          <div className="bg-amber-50/40 rounded-2xl p-3 border border-amber-100/50 flex gap-2 text-[10px] font-semibold text-amber-800 leading-normal font-sans">
            <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <p>
              El motor inteligente de Rocita procesa estas estructuras base y aplica el **Tono de Voz de la IA** seleccionado de forma automática antes de emitir cada mensaje, logrando un balance perfecto entre consistencia clínica y personalización empática.
            </p>
          </div>
        </motion.div>
      )}

      {/* TAB 4: Perfil de la Clínica */}
      {activeTab === 'perfil' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h3 className="text-md font-black text-slate-900 flex items-center gap-2 font-sans">
              <Building size={18} className="text-sky-500" /> Perfil de la Institución Clínica
            </h3>
            <p className="text-xs text-slate-400 font-bold mt-1 font-sans">Administra los datos formales de tu centro de salud en la plataforma.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Clinic Name */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 block font-sans">Nombre de la Institución</label>
              <input
                type="text"
                value={config.clinicName}
                onChange={(e) => config.setClinicName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 transition-all text-slate-800 font-sans"
              />
            </div>

            {/* Clinic Nit */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 block font-sans">NIT / Identificación Legal</label>
              <input
                type="text"
                value={config.clinicNit}
                onChange={(e) => config.setClinicNit(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 transition-all text-slate-800 font-sans"
              />
            </div>

            {/* Clinic Contact Email */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 block font-sans">Correo Electrónico Oficial</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="email"
                  value={config.clinicEmail}
                  onChange={(e) => config.setClinicEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 transition-all text-slate-800 font-sans"
                />
              </div>
            </div>

            {/* Clinic Phone */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 block font-sans">Teléfono Principal de Admisiones</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  value={config.clinicPhone}
                  onChange={(e) => config.setClinicPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 transition-all text-slate-800 font-sans"
                />
              </div>
            </div>
          </div>

          {/* Encrypted storage security note */}
          <div className="border-t border-slate-100 pt-6 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center shrink-0">
              <ShieldCheck size={16} className="text-sky-500" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-800 font-sans">Seguridad Certificada</h4>
              <p className="text-[10px] font-medium text-slate-400 mt-0.5 leading-normal font-sans">
                Todos tus datos institucionales, tokens de API y configuraciones se guardan de forma local en tu navegador con encriptación avanzada de sesión AES-256.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
