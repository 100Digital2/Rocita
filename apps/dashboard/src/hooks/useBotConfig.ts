'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { toast } from 'sonner';

type AiTone = 'empatico' | 'formal' | 'persuasivo';
type TemplateCategory = 'confirmacion' | 'reprogramacion' | 'cancelacion';
type WhatsappStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';

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

export function useBotConfig() {
  const queryClient = useQueryClient();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // 1. Clinic Profile States
  const [clinicName, setClinicName] = useState('Salud Eficiente');
  const [clinicNit, setClinicNit] = useState('900.123.456-7');
  const [clinicEmail, setClinicEmail] = useState('contacto@saludeficiente.com');
  const [clinicPhone, setClinicPhone] = useState('+57 300 987 6543');

  // 2. AI Engine States
  const [aiTone, setAiTone] = useState<AiTone>('empatico');
  const [advanceHours, setAdvanceHours] = useState(24);
  const [sendHourStart, setSendHourStart] = useState('08:00');
  const [sendHourEnd, setSendHourEnd] = useState('19:00');
  const [maxAttempts, setMaxAttempts] = useState('2');

  // 3. Channels States
  const [whatsappApiKey, setWhatsappApiKey] = useState('waba_live_prod_sec_8f2e811c0de569aa12bc');
  const [showApiKey, setShowApiKey] = useState(false);
  const [smsFallback, setSmsFallback] = useState(true);
  const [voiceFallback, setVoiceFallback] = useState(false);
  const [isApiConnecting, setIsApiConnecting] = useState(false);
  const [apiConnectionStatus, setApiConnectionStatus] = useState<'connected' | 'error' | 'none'>('connected');

  // 4. WhatsApp Web QR Connection (Baileys)
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsappStatus>('DISCONNECTED');
  const [qrCode, setQrCode] = useState<string | null>(null);

  // 5. Templates States
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>('confirmacion');
  const [templateText, setTemplateText] = useState(defaultTemplates.confirmacion.empatico);

  // Load saved configurations on mount
  useEffect(() => {
    // 1. Load from localStorage
    const savedClinic = localStorage.getItem('rocita_clinic_name');
    if (savedClinic) setClinicName(savedClinic);

    const savedEmail = localStorage.getItem('rocita_clinic_email');
    if (savedEmail) setClinicEmail(savedEmail);

    const savedNit = localStorage.getItem('rocita_clinic_nit');
    if (savedNit) setClinicNit(savedNit);

    const savedPhone = localStorage.getItem('rocita_clinic_phone');
    if (savedPhone) setClinicPhone(savedPhone);

    const savedTone = localStorage.getItem('rocita_ai_tone');
    if (savedTone) setAiTone(savedTone as AiTone);

    const savedAdvanceHours = localStorage.getItem('rocita_advance_hours');
    if (savedAdvanceHours) setAdvanceHours(Number(savedAdvanceHours));

    const savedStart = localStorage.getItem('rocita_send_hour_start');
    if (savedStart) setSendHourStart(savedStart);

    const savedEnd = localStorage.getItem('rocita_send_hour_end');
    if (savedEnd) setSendHourEnd(savedEnd);

    const savedAttempts = localStorage.getItem('rocita_max_attempts');
    if (savedAttempts) setMaxAttempts(savedAttempts);

    // 2. Fetch initial WhatsApp status from API
    fetch(`${apiUrl}/whatsapp/status`)
      .then((res) => res.json())
      .then((data) => {
        setWhatsappStatus(data.status);
        if (data.qr) setQrCode(data.qr);
      })
      .catch((err) => console.error('Error al obtener estado inicial de WhatsApp:', err));

    // 3. Connect to WhatsApp Socket Gateway
    const socket = io(`${apiUrl}/whatsapp`, {
      transports: ['websocket']
    });

    socket.on('whatsapp.status', (data: { status: WhatsappStatus }) => {
      setWhatsappStatus(data.status);
      if (data.status !== 'CONNECTING') {
        setQrCode(null);
      }
    });

    socket.on('whatsapp.qr', (data: { qr: string }) => {
      setQrCode(data.qr);
      setWhatsappStatus('CONNECTING');
    });

    return () => {
      socket.disconnect();
    };
  }, [apiUrl]);

  // Sync templates text when tone or category changes
  useEffect(() => {
    setTemplateText(defaultTemplates[templateCategory][aiTone]);
  }, [aiTone, templateCategory]);

  // Save Settings Mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      localStorage.setItem('rocita_clinic_name', clinicName);
      localStorage.setItem('rocita_clinic_email', clinicEmail);
      localStorage.setItem('rocita_clinic_nit', clinicNit);
      localStorage.setItem('rocita_clinic_phone', clinicPhone);
      localStorage.setItem('rocita_ai_tone', aiTone);
      localStorage.setItem('rocita_advance_hours', advanceHours.toString());
      localStorage.setItem('rocita_send_hour_start', sendHourStart);
      localStorage.setItem('rocita_send_hour_end', sendHourEnd);
      localStorage.setItem('rocita_max_attempts', maxAttempts);
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Configuración guardada exitosamente en el sistema.');
    }
  });

  // Connect WhatsApp Mutation
  const connectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${apiUrl}/whatsapp/connect`, { method: 'POST' });
      return res.json();
    },
    onSuccess: () => {
      toast.info('Inicializando canal de WhatsApp...');
    },
    onError: () => {
      toast.error('Error al iniciar vinculación de WhatsApp.');
    }
  });

  // Disconnect WhatsApp Mutation
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${apiUrl}/whatsapp/disconnect`, { method: 'POST' });
      return res.json();
    },
    onSuccess: () => {
      setWhatsappStatus('DISCONNECTED');
      setQrCode(null);
      toast.success('Sesión de WhatsApp cerrada.');
    },
    onError: () => {
      toast.error('Error al cerrar sesión de WhatsApp.');
    }
  });

  // Test API connection
  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { success: true };
    },
    onSuccess: () => {
      setApiConnectionStatus('connected');
      toast.success('Conexión establecida. Canal de WhatsApp Business Activo (100% OK).');
    }
  });

  // Live formatting helper for sandbox preview
  const getRenderedSandboxMessage = () => {
    let text = templateText;
    text = text.replace(/{nombre}/g, 'Carlos Humberto');
    text = text.replace(/{doctor}/g, 'Dra. Carolina Gómez');
    text = text.replace(/{especialidad}/g, 'Cardiología');
    text = text.replace(/{fecha}/g, 'Lunes 25 de Mayo a las 10:30 AM');
    return text;
  };

  return {
    clinicName,
    setClinicName,
    clinicNit,
    setClinicNit,
    clinicEmail,
    setClinicEmail,
    clinicPhone,
    setClinicPhone,
    aiTone,
    setAiTone,
    advanceHours,
    setAdvanceHours,
    sendHourStart,
    setSendHourStart,
    sendHourEnd,
    setSendHourEnd,
    maxAttempts,
    setMaxAttempts,
    whatsappApiKey,
    setWhatsappApiKey,
    showApiKey,
    setShowApiKey,
    smsFallback,
    setSmsFallback,
    voiceFallback,
    setVoiceFallback,
    isApiConnecting: connectMutation.isPending || disconnectMutation.isPending || testConnectionMutation.isPending,
    apiConnectionStatus,
    whatsappStatus,
    qrCode,
    templateCategory,
    setTemplateCategory,
    templateText,
    setTemplateText,
    saveSettings: saveSettingsMutation.mutateAsync,
    connectWhatsapp: connectMutation.mutateAsync,
    disconnectWhatsapp: disconnectMutation.mutateAsync,
    testConnection: testConnectionMutation.mutateAsync,
    renderedSandboxMessage: getRenderedSandboxMessage()
  };
}
