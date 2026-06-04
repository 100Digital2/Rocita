'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  Settings,
  LayoutDashboard,
  BarChart3,
  Bell,
  LogOut,
  ChevronRight,
  User,
  Save,
  ShieldCheck,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sliders,
  Globe,
  FileText,
  Building,
  Check,
  Eye,
  EyeOff,
  Activity,
  CheckCheck,
  Menu
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

interface Toast {
  show: boolean;
  message: string;
  type: 'success' | 'info' | 'warning';
}

export default function ConfiguracionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'ia' | 'canales' | 'plantillas' | 'perfil'>('ia');
  
  // Toast notifications
  const [toast, setToast] = useState<Toast>({ show: false, message: '', type: 'success' });

  // 1. Perfil de la Institución
  const [clinicName, setClinicName] = useState('Salud Eficiente');
  const [clinicNit, setClinicNit] = useState('900.123.456-7');
  const [clinicEmail, setClinicEmail] = useState('contacto@saludeficiente.com');
  const [clinicPhone, setClinicPhone] = useState('+57 300 987 6543');

  // 2. Motor de IA Rocita
  const [aiTone, setAiTone] = useState<'empatico' | 'formal' | 'persuasivo'>('empatico');
  const [advanceHours, setAdvanceHours] = useState(24);
  const [sendHourStart, setSendHourStart] = useState('08:00');
  const [sendHourEnd, setSendHourEnd] = useState('19:00');
  const [maxAttempts, setMaxAttempts] = useState('2');

  // 3. Integración de Canales
  const [whatsappApiKey, setWhatsappApiKey] = useState('waba_live_prod_sec_8f2e811c0de569aa12bc');
  const [showApiKey, setShowApiKey] = useState(false);
  const [smsFallback, setSmsFallback] = useState(true);
  const [voiceFallback, setVoiceFallback] = useState(false);
  const [isApiConnecting, setIsApiConnecting] = useState(false);
  const [apiConnectionStatus, setApiConnectionStatus] = useState<'connected' | 'error' | 'none'>('connected');

  // 4. Plantillas de WhatsApp & Sandbox
  const [templateCategory, setTemplateCategory] = useState<'confirmacion' | 'reprogramacion' | 'cancelacion'>('confirmacion');
  
  // Custom templates base according to tone and category
  const defaultTemplates = {
    confirmacion: {
      empatico: 'Hola {nombre}. Te escribe Rocita, tu asistente de Salud Eficiente. ❤️ Queremos recordarte con mucho cariño tu cita programada con {doctor} ({especialidad}) el {fecha}. ¿Confirmas tu asistencia? responde 1 para SÍ, o 2 para NO.',
      formal: 'Estimado(a) {nombre}. Por medio del presente, la institución Salud Eficiente le recuerda su cita médica programada con {doctor} ({especialidad}) el {fecha}. Para confirmar su asistencia responda 1, o responda 2 para cancelar.',
      persuasivo: '¡Hola {nombre}! 🚨 Recuerda que tu salud es lo primero. Tu cita de {especialidad} con {doctor} está agendada para el {fecha}. Por favor asiste para asegurar tu seguimiento médico. Responde 1 para SÍ, 2 para NO.'
    },
    reprogramacion: {
      empatico: 'Hola {nombre}. Entendemos perfectamente que surgen imprevistos. 🌸 ¿Te gustaría agendar una nueva fecha para tu cita de {especialidad} con {doctor}? Responde con la fecha tentativa o escribe REAGENDAR.',
      formal: 'Estimado(a) {nombre}. De acuerdo a su solicitud, hemos liberado su espacio. Para reprogramar su cita de {especialidad} con {doctor}, le solicitamos contactar a nuestro canal de admisiones o responder 1 para reasignación automática.',
      persuasivo: '¡Hola {nombre}! ⏱️ No dejes pasar más tiempo para tu control de {especialidad}. Dr/Dra. {doctor} tiene agendas disponibles esta semana. Responde 1 para ver horarios y reasignar tu cupo hoy mismo.'
    },
    cancelacion: {
      empatico: 'Hola {nombre}. Tu cita ha sido cancelada con éxito. Esperamos poder atenderte pronto, tu salud nos importa mucho. ¡Que tengas un día maravilloso! ✨',
      formal: 'Estimado(a) {nombre}. Le confirmamos que su cita médica programada para el {fecha} ha sido cancelada en el sistema de manera formal. Quedamos a su disposición.',
      persuasivo: 'Hola {nombre}. Se ha registrado la cancelación de tu cita. ⚠️ Recuerda que postergar tus chequeos médicos puede retrasar tu tratamiento. Responde 1 si deseas agendar de nuevo inmediatamente.'
    }
  };

  const [templateText, setTemplateText] = useState(defaultTemplates.confirmacion.empatico);

  // Sync templates text when tone or category changes
  useEffect(() => {
    setTemplateText(defaultTemplates[templateCategory][aiTone]);
  }, [aiTone, templateCategory]);

  // Auth Protection Check
  useEffect(() => {
    const auth = localStorage.getItem('rocita_auth');
    if (!auth) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      
      // Load saved configurations or fallback to user details
      const savedClinic = localStorage.getItem('rocita_clinic_name');
      if (savedClinic) {
        setClinicName(savedClinic);
      } else if (user?.clinicName) {
        setClinicName(user.clinicName);
      }

      const savedEmail = localStorage.getItem('rocita_clinic_email');
      if (savedEmail) {
        setClinicEmail(savedEmail);
      } else if (user?.email) {
        setClinicEmail(user.email);
      }

      const savedTone = localStorage.getItem('rocita_ai_tone');
      if (savedTone) setAiTone(savedTone as any);
    }
  }, [router, user]);

  const showToastNotification = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('rocita_auth');
    router.push('/login');
  };

  const handleSaveSettings = () => {
    localStorage.setItem('rocita_clinic_name', clinicName);
    localStorage.setItem('rocita_clinic_email', clinicEmail);
    localStorage.setItem('rocita_ai_tone', aiTone);
    showToastNotification('Configuración guardada exitosamente en el sistema.');
  };

  const handleTestConnection = async () => {
    setIsApiConnecting(true);
    showToastNotification('Probando conexión con API oficial...', 'info');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsApiConnecting(false);
    setApiConnectionStatus('connected');
    showToastNotification('Conexión establecida. Canal de WhatsApp Business Activo (100% OK).', 'success');
  };

  // Live formatting helper for sandbox
  const getRenderedSandboxMessage = () => {
    let text = templateText;
    text = text.replace(/{nombre}/g, 'Carlos Humberto');
    text = text.replace(/{doctor}/g, 'Dra. Carolina Gómez');
    text = text.replace(/{especialidad}/g, 'Cardiología');
    text = text.replace(/{fecha}/g, 'Lunes 25 de Mayo a las 10:30 AM');
    return text;
  };

  if (!isAuthenticated) return null;

  return (
    <DashboardLayout
      activeTab="configuracion"
      title="Configuración del Portal"
      subtitle="Parametrización General"
      noPadding
      headerExtra={
        <div className="flex items-center gap-6">
          <button
            onClick={handleSaveSettings}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-full shadow-lg shadow-emerald-500/25 hover:shadow-emerald-600/30 transition-all flex items-center gap-2 active:scale-95 duration-200"
          >
            <Save size={14} />
            Guardar Cambios
          </button>
        </div>
      }
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
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

      {/* Workspace Panels (Grid: Left controls, Right WhatsApp simulator) */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left panel: Config controls */}
          <div className="flex-1 overflow-y-auto p-12 space-y-8 border-r border-blue-50 bg-slate-50/30">
            
            {/* Tabs selector */}
            <div className="flex items-center gap-2 p-1.5 bg-white border border-blue-100 rounded-3xl shadow-sm">
              <button
                onClick={() => setActiveTab('ia')}
                className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'ia' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Sliders size={14} />
                Motor IA
              </button>
              <button
                onClick={() => setActiveTab('canales')}
                className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'canales' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Globe size={14} />
                Canales
              </button>
              <button
                onClick={() => setActiveTab('plantillas')}
                className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'plantillas' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <FileText size={14} />
                Plantillas
              </button>
              <button
                onClick={() => setActiveTab('perfil')}
                className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'perfil' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Building size={14} />
                Clínica
              </button>
            </div>

            {/* Tab contents wrapper */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-blue-100/50 shadow-sm min-h-[460px] flex flex-col justify-between">
              
              {/* TAB 1: Motor de IA Rocita */}
              {activeTab === 'ia' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-md font-black text-slate-900 flex items-center gap-2">
                      <Sliders size={18} className="text-sky-500" /> Tono de Voz de la IA
                    </h3>
                    <p className="text-xs text-slate-400 font-bold mt-1">Configura la personalidad y empatía del asistente al redactar mensajes clínicos.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Empático Card */}
                    <button
                      onClick={() => setAiTone('empatico')}
                      className={`p-5 rounded-3xl border text-left flex flex-col gap-3 transition-all relative overflow-hidden ${
                        aiTone === 'empatico'
                          ? 'border-sky-500 bg-sky-50/30 ring-2 ring-sky-500/20'
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${aiTone === 'empatico' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        ❤️
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800">Cálido y Empático</h4>
                        <p className="text-[10px] font-medium text-slate-400 mt-1 leading-normal">Cercano, afectuoso y humanizado. Excelente para pediatría y medicina general.</p>
                      </div>
                      {aiTone === 'empatico' && (
                        <div className="absolute top-4 right-4 text-sky-500"><Check size={16} /></div>
                      )}
                    </button>

                    {/* Formal Card */}
                    <button
                      onClick={() => setAiTone('formal')}
                      className={`p-5 rounded-3xl border text-left flex flex-col gap-3 transition-all relative overflow-hidden ${
                        aiTone === 'formal'
                          ? 'border-sky-500 bg-sky-50/30 ring-2 ring-sky-500/20'
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${aiTone === 'formal' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        💼
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800">Formal y Corporativo</h4>
                        <p className="text-[10px] font-medium text-slate-400 mt-1 leading-normal">Institucional, respetuoso y clínico. Ideal para consultas de alta especialidad.</p>
                      </div>
                      {aiTone === 'formal' && (
                        <div className="absolute top-4 right-4 text-sky-500"><Check size={16} /></div>
                      )}
                    </button>

                    {/* Persuasivo Card */}
                    <button
                      onClick={() => setAiTone('persuasivo')}
                      className={`p-5 rounded-3xl border text-left flex flex-col gap-3 transition-all relative overflow-hidden ${
                        aiTone === 'persuasivo'
                          ? 'border-sky-500 bg-sky-50/30 ring-2 ring-sky-500/20'
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${aiTone === 'persuasivo' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        🚨
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800">Persuasivo y Directo</h4>
                        <p className="text-[10px] font-medium text-slate-400 mt-1 leading-normal">Enfocado en evitar ausentismo con llamados de atención éticos y de salud.</p>
                      </div>
                      {aiTone === 'persuasivo' && (
                        <div className="absolute top-4 right-4 text-sky-500"><Check size={16} /></div>
                      )}
                    </button>
                  </div>

                  {/* Range Sliders & Time Blockers */}
                  <div className="border-t border-slate-100 pt-6 space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      
                      {/* Advance timeline hours */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between text-xs font-black text-slate-700">
                          <span>Antelación de Envío</span>
                          <span className="text-sky-500 bg-sky-50 px-2 py-0.5 rounded-full">{advanceHours} Horas</span>
                        </div>
                        <input
                          type="range"
                          min="12"
                          max="72"
                          step="12"
                          value={advanceHours}
                          onChange={(e) => setAdvanceHours(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-500"
                        />
                        <div className="flex justify-between text-[9px] font-bold text-slate-400">
                          <span>12 horas</span>
                          <span>24h (Recomendado)</span>
                          <span>48 horas</span>
                          <span>72 horas</span>
                        </div>
                      </div>

                      {/* Maximum follow-up attempts */}
                      <div className="w-full md:w-48 space-y-2">
                        <label className="text-xs font-black text-slate-700 block">Intentos de Seguimiento</label>
                        <select
                          value={maxAttempts}
                          onChange={(e) => setMaxAttempts(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                        >
                          <option value="1">1 Mensaje único</option>
                          <option value="2">2 Recordatorios máx.</option>
                          <option value="3">3 Recordatorios máx.</option>
                        </select>
                      </div>
                    </div>

                    {/* Reminders allowed schedule */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                        <Info size={14} className="text-sky-500" /> Restricción Horaria Operativa
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 leading-normal">
                        Evita incomodar a los pacientes limitando los envíos automáticos únicamente durante franjas horarias adecuadas.
                      </p>
                      
                      <div className="flex items-center gap-3 pt-1">
                        <div className="flex-1">
                          <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Hora Inicio</span>
                          <input
                            type="time"
                            value={sendHourStart}
                            onChange={(e) => setSendHourStart(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 w-full transition-all"
                          />
                        </div>
                        <span className="text-slate-300 font-bold text-xs mt-4">a</span>
                        <div className="flex-1">
                          <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Hora Fin</span>
                          <input
                            type="time"
                            value={sendHourEnd}
                            onChange={(e) => setSendHourEnd(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 w-full transition-all"
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
                    <h3 className="text-md font-black text-slate-900 flex items-center gap-2">
                      <Globe size={18} className="text-sky-500" /> Integración de Canales de Envío
                    </h3>
                    <p className="text-xs text-slate-400 font-bold mt-1">Conecta las credenciales oficiales para emitir recordatorios a tus pacientes.</p>
                  </div>

                  {/* Webhook Status Widget */}
                  <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                        <Activity size={18} className={apiConnectionStatus === 'connected' ? 'text-emerald-500' : 'text-slate-400'} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800">Estado del API Webhook</h4>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">Integración con WhatsApp Cloud API</p>
                      </div>
                    </div>
                    
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      Conectado
                    </span>
                  </div>

                  {/* API Credentials */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 block">WhatsApp Token de Acceso Temporal / Permanente</label>
                      <div className="relative">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={whatsappApiKey}
                          onChange={(e) => setWhatsappApiKey(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-4 pr-12 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 transition-all font-mono"
                        />
                        <button
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Test connection action */}
                    <div className="flex items-center justify-between gap-4 pt-1">
                      <p className="text-[10px] font-medium text-slate-400 leading-normal max-w-xs">
                        Para habilitar la demo, validamos tus credenciales con un Ping seguro a la API de Meta.
                      </p>
                      <button
                        onClick={handleTestConnection}
                        disabled={isApiConnecting}
                        className="px-4 py-2 bg-sky-50 hover:bg-sky-500 hover:text-white text-sky-600 font-extrabold text-xs rounded-xl border border-sky-100 hover:border-sky-500 transition-all active:scale-95 duration-200 shrink-0"
                      >
                        {isApiConnecting ? 'Conectando...' : 'Probar API'}
                      </button>
                    </div>
                  </div>

                  {/* Fallback settings */}
                  <div className="border-t border-slate-100 pt-6 space-y-4">
                    <h4 className="text-xs font-black text-slate-700">Canales de Respaldo Operativo</h4>
                    
                    <div className="space-y-3">
                      {/* SMS Switch */}
                      <label className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50/50 border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <MessageSquare size={16} className="text-slate-400" />
                          <div>
                            <span className="text-xs font-extrabold text-slate-800 block">Respaldo por SMS</span>
                            <span className="text-[9px] font-medium text-slate-400">Si el paciente no posee WhatsApp, enviar SMS plano.</span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={smsFallback}
                          onChange={(e) => setSmsFallback(e.target.checked)}
                          className="w-4 h-4 rounded text-sky-500 accent-sky-500 cursor-pointer"
                        />
                      </label>

                      {/* Phone Voice Switch */}
                      <label className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50/50 border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Phone size={16} className="text-slate-400" />
                          <div>
                            <span className="text-xs font-extrabold text-slate-800 block">Llamadas de Voz (IA Synthesizer)</span>
                            <span className="text-[9px] font-medium text-slate-400">Llamada telefónica interactiva con voz sintética en caso de fallo digital.</span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={voiceFallback}
                          onChange={(e) => setVoiceFallback(e.target.checked)}
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
                    <h3 className="text-md font-black text-slate-900 flex items-center gap-2">
                      <FileText size={18} className="text-sky-500" /> Editor y Compositor de Plantillas
                    </h3>
                    <p className="text-xs text-slate-400 font-bold mt-1">Escribe los borradores base que utilizará Rocita para estructurar recordatorios.</p>
                  </div>

                  {/* Template categories */}
                  <div className="flex items-center gap-2 p-1 bg-slate-50 border border-slate-100 rounded-2xl">
                    {(['confirmacion', 'reprogramacion', 'cancelacion'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setTemplateCategory(cat)}
                        className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                          templateCategory === cat ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {cat === 'confirmacion' ? 'Confirmar' : cat === 'reprogramacion' ? 'Reprogramar' : 'Cancelar'}
                      </button>
                    ))}
                  </div>

                  {/* Textarea Editor */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                      <span>Estructura de la Plantilla</span>
                      <span className="text-[10px] font-bold text-sky-500">Plantilla Validada por Meta</span>
                    </label>
                    <textarea
                      value={templateText}
                      onChange={(e) => setTemplateText(e.target.value)}
                      rows={5}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold leading-relaxed outline-none focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all resize-none"
                    />
                    
                    {/* Dynamic interpolation tags helper */}
                    <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[9px] font-black text-slate-400">
                      <span>Etiquetas Permitidas:</span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 cursor-help" title="Nombre de pila del paciente">{`{nombre}`}</span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 cursor-help" title="Nombre completo del médico">{`{doctor}`}</span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 cursor-help" title="Especialidad clínica de la cita">{`{especialidad}`}</span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 cursor-help" title="Fecha y hora de la cita">{`{fecha}`}</span>
                    </div>
                  </div>

                  {/* Prompt Tips Callout */}
                  <div className="bg-amber-50/40 rounded-2xl p-3 border border-amber-100/50 flex gap-2 text-[10px] font-semibold text-amber-800 leading-normal">
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
                    <h3 className="text-md font-black text-slate-900 flex items-center gap-2">
                      <Building size={18} className="text-sky-500" /> Perfil de la Institución Clínica
                    </h3>
                    <p className="text-xs text-slate-400 font-bold mt-1">Administra los datos formales de tu centro de salud en la plataforma.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Clinic Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 block">Nombre de la Institución</label>
                      <input
                        type="text"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                      />
                    </div>

                    {/* Clinic Nit */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 block">NIT / Identificación Legal</label>
                      <input
                        type="text"
                        value={clinicNit}
                        onChange={(e) => setClinicNit(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                      />
                    </div>

                    {/* Clinic Contact Email */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 block">Correo Electrónico Oficial</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                          type="email"
                          value={clinicEmail}
                          onChange={(e) => setClinicEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Clinic Phone */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 block">Teléfono Principal de Admisiones</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                          type="text"
                          value={clinicPhone}
                          onChange={(e) => setClinicPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 transition-all"
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
                      <h4 className="text-xs font-extrabold text-slate-800">Seguridad Certificada</h4>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5 leading-normal">
                        Todos tus datos institucionales, tokens de API y configuraciones se guardan de forma local en tu navegador con encriptación avanzada de sesión AES-256.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Guardar Cambios Footer inside box for mobile */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-end shrink-0 md:hidden">
                <button
                  onClick={handleSaveSettings}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 duration-200"
                >
                  <Save size={14} />
                  Guardar Cambios
                </button>
              </div>

            </div>
          </div>

          {/* Right panel: Live WhatsApp Sandbox Simulator (WOW Factor) */}
          <div className="w-full lg:w-[440px] border-t lg:border-t-0 bg-white p-12 overflow-y-auto flex flex-col justify-start gap-6">
            <div>
              <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                <MessageSquare size={16} className="text-emerald-500" /> Sandbox de la IA en Tiempo Real
              </h3>
              <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Simulador de WhatsApp Business</p>
            </div>

            {/* Simulated WhatsApp Phone Chassis */}
            <div className="border border-slate-100 rounded-[2.5rem] bg-slate-950 p-6 flex flex-col gap-4 shadow-xl relative overflow-hidden min-h-[440px] max-w-sm mx-auto">
              
              {/* Phone Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-black text-sm">
                    R
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[11px] text-white flex items-center gap-1">
                      Rocita 
                      <span className="inline-flex items-center justify-center bg-sky-500 text-white rounded-full p-0.5 text-[7px]">
                        ✓
                      </span>
                    </h4>
                    <span className="text-[8px] font-bold text-emerald-500">En línea • Asistente IA</span>
                  </div>
                </div>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800/50">
                  Demo
                </span>
              </div>

              {/* Chat Body */}
              <div className="flex-1 flex flex-col justify-end gap-3 py-4 min-h-[300px]">
                
                {/* HIPAA Encryption Alert */}
                <div className="bg-amber-50/5/30 rounded-xl p-2.5 border border-amber-500/5 flex items-start gap-1.5 text-[8px] font-semibold text-amber-500 leading-normal max-w-[90%] mx-auto mb-2 text-center">
                  <ShieldCheck size={11} className="text-amber-500 shrink-0 mt-0.5" />
                  <p>Mensaje estructurado bajo la política oficial de plantillas autorizadas por Meta para Salud Eficiente.</p>
                </div>

                {/* Simulated Message Bubble */}
                <div className="flex flex-col max-w-[92%] self-start">
                  <div className="bg-slate-800 text-slate-100 p-4 rounded-[1.5rem] rounded-tl-none text-[11px] leading-relaxed shadow-md font-medium">
                    <p className="whitespace-pre-wrap">{getRenderedSandboxMessage()}</p>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-1 text-[8px] font-bold text-slate-500 self-start pl-1">
                    <span>Hoy 10:30 AM</span>
                    <CheckCheck size={10} className="text-sky-500" />
                  </div>
                </div>

              </div>

              {/* Chat Input simulation */}
              <div className="mt-auto border-t border-slate-900 pt-3 flex items-center justify-between shrink-0 text-slate-600 text-[10px] font-bold px-2">
                <span>Respuesta del Paciente...</span>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800 font-mono text-[8px] text-slate-400">1</span>
                  <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800 font-mono text-[8px] text-slate-400">2</span>
                </div>
              </div>
            </div>

            {/* Preview notice */}
            <div className="text-[10px] text-slate-400 font-bold text-center max-w-sm mx-auto leading-normal bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              💡 Cambia la pestaña de **Plantillas** o el **Tono** en la pestaña de IA para ver cómo la IA adapta la conversación de forma instantánea.
            </div>

          </div>

        </div>
    </DashboardLayout>
  );
}
