'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  LayoutDashboard,
  BarChart3,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Check,
  Trash2,
  X,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  Menu
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

interface Message {
  sender: 'paciente' | 'rocita';
  text: string;
  time: string;
}

interface NotificationItem {
  id: string;
  type: 'confirmacion' | 'cancelacion' | 'fallo' | 'sistema';
  patientName?: string;
  doctorName?: string;
  specialty?: string;
  text: string;
  time: string;
  unread: boolean;
  chatHistory?: Message[];
}

export default function NotificacionesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filter, setFilter] = useState<'todas' | 'confirmacion' | 'cancelacion' | 'fallo'>('todas');
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  // Datos mock enriquecidos de notificaciones con historiales de chat para el WOW factor
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      type: 'confirmacion',
      patientName: 'Carlos Humberto Pérez',
      doctorName: 'Dra. Carolina Gómez',
      specialty: 'Cardiología',
      text: 'Carlos Humberto Pérez ha confirmado su cita para el Lunes 25 de Mayo a las 10:30 AM.',
      time: 'Hace 5 mins',
      unread: true,
      chatHistory: [
        { sender: 'rocita', text: 'Hola Carlos. Te escribe Rocita, asistente virtual de Salud Eficiente. Queremos recordarte tu cita programada con la Dra. Carolina Gómez (Cardiología) el Lunes 25 de Mayo a las 10:30 AM en el Consultorio 402. ¿Confirmas tu asistencia? responde 1 para SÍ, o 2 para NO.', time: '09:00 AM' },
        { sender: 'paciente', text: 'Hola! Sí claro, allá estaré. Muchas gracias por avisar.', time: '09:02 AM' },
        { sender: 'rocita', text: '¡Excelente! Hemos confirmado tu asistencia de manera automática en el sistema. Que tengas un feliz día.', time: '09:02 AM' }
      ]
    },
    {
      id: 'notif-2',
      type: 'cancelacion',
      patientName: 'Laura Ruiz',
      doctorName: 'Dr. Alejandro Restrepo',
      specialty: 'Dermatología',
      text: 'Laura Ruiz ha cancelado su cita de Dermatología debido a motivos de fuerza mayor.',
      time: 'Hace 24 mins',
      unread: true,
      chatHistory: [
        { sender: 'rocita', text: 'Hola Laura. Te escribe Rocita. Queremos recordarte tu cita programada con el Dr. Alejandro Restrepo (Dermatología) hoy a las 4:00 PM. ¿Confirmas tu asistencia? responde 1 para SÍ, o 2 para NO.', time: '08:30 AM' },
        { sender: 'paciente', text: '2', time: '08:42 AM' },
        { sender: 'rocita', text: 'Entendido, Laura. Has indicado que NO asistirás. ¿Deseas que te contactemos para reprogramar tu cita?', time: '08:42 AM' },
        { sender: 'paciente', text: 'Sí por favor, se me cruzó un viaje de trabajo y no alcanzo a llegar hoy. Gracias.', time: '08:43 AM' },
        { sender: 'rocita', text: 'Perfecto. Hemos liberado tu espacio en el consultorio y un asesor de Servicio al Cliente te escribirá para reasignar tu cita. ¡Buen viaje!', time: '08:44 AM' }
      ]
    },
    {
      id: 'notif-3',
      type: 'fallo',
      patientName: 'Mateo Sánchez',
      text: 'Recordatorio fallido: El número de paciente (+57 312 456 7890) no cuenta con una cuenta de WhatsApp activa.',
      time: 'Hace 1 hora',
      unread: true,
      chatHistory: [] // Sin chat porque falló el envío
    },
    {
      id: 'notif-4',
      type: 'sistema',
      text: 'La campaña oficial "Recordatorios Lunes" se ha ejecutado con éxito. Se enviaron 120 recordatorios y la tasa de confirmación actual es del 92%.',
      time: 'Hace 2 horas',
      unread: false,
      chatHistory: []
    },
    {
      id: 'notif-5',
      type: 'confirmacion',
      patientName: 'Martha Lucía Gómez',
      doctorName: 'Dra. Sandra Ortiz',
      specialty: 'Pediatría',
      text: 'Martha Lucía Gómez ha confirmado la cita de pediatría de su hijo para mañana a las 9:00 AM.',
      time: 'Hace 3 horas',
      unread: false,
      chatHistory: [
        { sender: 'rocita', text: 'Hola Martha. Te escribe Rocita. Recordamos la cita de Pediatría programada para mañana a las 9:00 AM con la Dra. Sandra Ortiz. ¿Confirmas la asistencia? responde 1 para SÍ, o 2 para NO.', time: '07:05 AM' },
        { sender: 'paciente', text: '1', time: '07:15 AM' },
        { sender: 'rocita', text: '¡Cita Confirmada con éxito! Gracias por tu puntualidad. Recuerda llegar 15 minutos antes.', time: '07:16 AM' }
      ]
    }
  ]);

  // Proteger la ruta de demo
  useEffect(() => {
    const auth = localStorage.getItem('rocita_auth');
    if (!auth) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('rocita_auth');
    router.push('/login');
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (selectedNotification?.id === id) {
      setShowDrawer(false);
      setSelectedNotification(null);
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    markAsRead(notif.id);
    if (notif.chatHistory && notif.chatHistory.length > 0) {
      setSelectedNotification(notif);
      setShowDrawer(true);
    }
  };

  // Filtrado de las notificaciones
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'todas') return true;
    return n.type === filter;
  });

  // Conteo de elementos no leídos globales
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <DashboardLayout
      activeTab="notificaciones"
      title="Centro de Alertas"
      subtitle="Monitoreo Omnicanal"
      headerExtra={
        <div className="flex items-center gap-6">
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar alerta..." 
              className="bg-white border border-blue-100 rounded-full py-2.5 pl-12 pr-6 text-sm focus:ring-2 focus:ring-sky-500 outline-none w-64 transition-all"
            />
          </div>
        </div>
      }
    >
        {/* Content Area */}
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
            
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Category Filters */}
              <div className="flex items-center flex-wrap gap-2">
                {[
                  { id: 'todas', label: 'Todas', count: notifications.length },
                  { id: 'confirmacion', label: 'Confirmaciones', count: notifications.filter(n => n.type === 'confirmacion').length },
                  { id: 'cancelacion', label: 'Cancelaciones', count: notifications.filter(n => n.type === 'cancelacion').length },
                  { id: 'fallo', label: 'Alertas Fallidas', count: notifications.filter(n => n.type === 'fallo').length }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setFilter(item.id as any)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all active:scale-95 duration-200 ${
                      filter === item.id 
                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' 
                        : 'bg-white hover:bg-slate-50 text-slate-500 border border-blue-100 shadow-sm'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] ${
                      filter === item.id 
                        ? 'bg-white/20 text-white' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Master Actions */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-6 py-2.5 bg-white hover:bg-slate-50 border border-blue-100 text-sky-600 font-bold text-xs rounded-full shadow-sm flex items-center gap-2 active:scale-95 transition-all self-start sm:self-auto"
                >
                  <Check size={14} /> Marcar todas como leídas
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notif) => {
                    // Configuración visual según el tipo de alerta
                    let badgeStyles = 'bg-sky-50 text-sky-500 border-sky-100';
                    let IconComponent = Info;
                    if (notif.type === 'confirmacion') {
                      badgeStyles = 'bg-emerald-50 text-emerald-600 border-emerald-100';
                      IconComponent = CheckCircle2;
                    } else if (notif.type === 'cancelacion') {
                      badgeStyles = 'bg-red-50 text-red-600 border-red-100';
                      IconComponent = XCircle;
                    } else if (notif.type === 'fallo') {
                      badgeStyles = 'bg-amber-50 text-amber-600 border-amber-100';
                      IconComponent = AlertTriangle;
                    }

                    return (
                      <motion.div
                        key={notif.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        onClick={() => handleNotificationClick(notif)}
                        className={`group border rounded-[2rem] p-6 md:p-8 flex items-start gap-6 cursor-pointer shadow-sm transition-all duration-300 relative overflow-hidden ${
                          notif.unread 
                            ? 'bg-white border-blue-100 hover:border-sky-300 hover:shadow-md' 
                            : 'bg-white/60 border-slate-100 opacity-80 hover:opacity-100'
                        }`}
                      >
                        {/* Glow indicator on hover for unread */}
                        {notif.unread && (
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-sky-500" />
                        )}

                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${badgeStyles} shadow-sm group-hover:scale-105 transition-transform`}>
                          <IconComponent size={22} />
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              {notif.patientName ? (
                                <h3 className="font-extrabold text-sm md:text-base text-slate-800">{notif.patientName}</h3>
                              ) : (
                                <h3 className="font-extrabold text-sm md:text-base text-slate-800 uppercase tracking-wider text-xs text-sky-600">Alerta de Sistema</h3>
                              )}
                              {notif.unread && (
                                <span className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-pulse shrink-0" />
                              )}
                            </div>
                            <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed max-w-2xl">{notif.text}</p>
                            {notif.chatHistory && notif.chatHistory.length > 0 && (
                              <p className="text-[10px] text-sky-500 font-extrabold flex items-center gap-1 pt-1 group-hover:underline">
                                💬 Ver historial de conversación <ChevronRight size={10} />
                              </p>
                            )}
                          </div>

                          <div className="flex items-center md:flex-col items-end gap-3 md:gap-1.5 self-start md:self-auto shrink-0">
                            <span className="text-[10px] font-bold text-slate-400">{notif.time}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notif.id);
                              }}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors active:scale-90"
                              title="Eliminar notificación"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white border border-blue-50 rounded-[3rem] p-16 text-center text-slate-400 shadow-sm"
                  >
                    <div className="w-16 h-16 bg-sky-50 text-sky-400 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                      <Bell size={24} />
                    </div>
                    <p className="font-extrabold text-slate-800 text-lg mb-2">No se encontraron alertas</p>
                    <p className="text-sm font-medium">No hay notificaciones disponibles para la categoría seleccionada.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

      {/* WhatsApp Simulated Drawer (Slide-out Panel) */}
      <AnimatePresence>
        {showDrawer && selectedNotification && (
          <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Slide-out Panel Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-md bg-[#efeae2] h-full shadow-2xl flex flex-col z-10 border-l border-slate-200"
            >
              {/* WhatsApp Header */}
              <div className="bg-[#075e54] text-white p-4 flex items-center justify-between shrink-0 shadow-md">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowDrawer(false)}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors text-white"
                  >
                    <X size={20} />
                  </button>
                  <div className="w-10 h-10 bg-slate-200 rounded-full border border-white/20 flex items-center justify-center text-slate-700 font-extrabold text-sm relative">
                    {selectedNotification.patientName ? selectedNotification.patientName.charAt(0) : 'P'}
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight">{selectedNotification.patientName}</h3>
                    <p className="text-[10px] text-white/80 font-medium">En línea (Simulación Rocita)</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-white/90">
                  <Phone size={16} className="cursor-pointer hover:text-white" />
                  <Video size={16} className="cursor-pointer hover:text-white" />
                  <MoreVertical size={16} className="cursor-pointer hover:text-white" />
                </div>
              </div>

              {/* Chat Conversation Scroll Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar flex flex-col justify-end">
                <div className="bg-white/80 backdrop-blur text-slate-500 border border-slate-100 rounded-xl py-2 px-4 text-[10px] font-bold text-center self-center shadow-sm max-w-xs leading-relaxed">
                  🔒 Los mensajes enviados por Rocita están encriptados y gestionados por IA.
                </div>

                {selectedNotification.chatHistory && selectedNotification.chatHistory.map((chat, idx) => {
                  const isPatient = chat.sender === 'paciente';
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col max-w-[80%] ${
                        isPatient ? 'self-end items-end' : 'self-start items-start'
                      }`}
                    >
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm relative ${
                          isPatient 
                            ? 'bg-[#d9fdd3] text-slate-800 rounded-tr-none border border-[#c1ebd0]' 
                            : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                        }`}
                      >
                        <p className="font-medium whitespace-pre-wrap">{chat.text}</p>
                        
                        <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400 font-semibold">
                          <span>{chat.time}</span>
                          {!isPatient && (
                            <CheckCheck size={12} className="text-sky-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Fake WhatsApp Message Composer Input */}
              <div className="bg-[#f0f2f5] p-3 border-t border-slate-200 flex items-center gap-3 shrink-0">
                <input
                  type="text"
                  placeholder="Escribe un mensaje en la simulación..."
                  disabled
                  className="flex-1 bg-white border border-slate-200 rounded-full py-2.5 px-5 text-xs outline-none text-slate-400 italic"
                />
                <button
                  disabled
                  className="w-10 h-10 bg-[#00a884] text-white rounded-full flex items-center justify-center shadow-md opacity-60 cursor-not-allowed"
                >
                  <svg className="w-4.5 h-4.5 rotate-45 transform translate-x-px -translate-y-px" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
