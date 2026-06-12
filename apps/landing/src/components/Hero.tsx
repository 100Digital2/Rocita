"use client"
import { ArrowRight, FileSpreadsheet, LayoutTemplate, Clock, BarChart3, UserCheck, Sparkles, ShieldCheck, Zap, MousePointer2, MessageSquare, Smartphone, Mail } from "lucide-react"
import { motion } from "framer-motion"
import WhatsappSimulator from "./WhatsappSimulator"

interface HeroProps {
  onOpenDemo: () => void;
}

export default function Hero({ onOpenDemo }: HeroProps) {
    return (
        <>
            <section id="servicios" className="relative pt-44 pb-32 px-6 overflow-hidden">
                {/* Background Decor & Grid */}
                <div className="absolute top-0 left-0 w-full h-full -z-10">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full"></div>
                    <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] bg-rocita-red/5 blur-[100px] rounded-full"></div>
                </div>

                <div className="max-w-7xl mx-auto">
                    {/* Main Hero Content */}
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24 mb-32">
                        {/* Left Column: Text Content */}
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1 order-2 lg:order-1">
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-red-100 text-sky-600 text-xs font-bold mb-6 tracking-wide">
                                <Sparkles size={14} className="animate-pulse" />
                                LA NUEVA ERA DE LA GESTIÓN MÉDICA
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                className="text-6xl md:text-7xl lg:text-[6.5rem] font-black tracking-tighter mb-8 leading-[0.9] text-zinc-900">
                                Soy <span className="text-slate-900">Ro</span>
                                <span className="text-sky-500">cita</span>,<br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                                    aseguro tus citas.
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-xl md:text-2xl text-zinc-500 mb-12 max-w-2xl leading-relaxed">
                                La IA que vela por tus pacientes, recordándoles las citas y asegurando que reciban la atención que necesitan.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="flex flex-col sm:flex-row gap-5">
                                <button 
                                    onClick={onOpenDemo}
                                    className="relative overflow-hidden bg-primary text-primary-foreground px-8 py-4 rounded-2xl text-lg font-bold hover:shadow-[0_20px_40px_-10px_rgba(14,165,233,0.5)] transition-all flex items-center justify-center gap-3 group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                                    Agenda una demo
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button className="bg-white border border-zinc-200 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-zinc-50 transition-all text-zinc-700 flex items-center justify-center gap-2">
                                    Cómo funciona <MousePointer2 size={18} className="text-rocita-red" />
                                </button>
                            </motion.div>
                        </div>

                        {/* Right Column: Visual Simulator */}
                        <div className="flex-1 relative order-1 lg:order-2">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="relative z-10">
                                <div className="absolute inset-0 bg-sky-400/20 blur-[120px] rounded-full -z-10 animate-pulse"></div>
                                <div className="relative transition-transform duration-500">
                                    <WhatsappSimulator />
                                </div>
                            </motion.div>

                            {/* Floating Trust Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1, duration: 0.5 }}
                                className="absolute -bottom-6 -right-6 lg:right-0 bg-white p-4 rounded-2xl shadow-2xl border border-zinc-100 flex items-center gap-3 z-20">
                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">
                                        Privacidad
                                    </p>
                                    <p className="text-xs font-black text-zinc-900">Seguridad 100%</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Timeline / 3 Step Storytelling */}
                    <div className="relative pt-20 border-t border-zinc-100">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-6 text-zinc-300 font-bold text-xs tracking-[0.3em] uppercase">
                            Proceso <span className="font-extrabold tracking-tight text-black">Ro</span><span className="font-extrabold tracking-tight text-sky-500">cita</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    step: "01",
                                    title: "Carga Masiva",
                                    desc: "Sube tu Excel o conecta tu HIS en segundos.",
                                    color: "text-primary",
                                    // Agregamos los estilos de hover específicos para este paso
                                    hoverBorder: "hover:border-blue-100",
                                    hoverShadow: "hover:shadow-blue-500/5",
                                },
                                {
                                    step: "02",
                                    title: "Flujo IA",
                                    desc: (
                                        <>
                                            <span className="font-extrabold tracking-tight text-black">Ro</span>
                                            <span className="font-extrabold tracking-tight text-sky-500">
                                                cita
                                            </span>{" "}
                                            procesa y personaliza cada mensaje.
                                        </>
                                    ),
                                    color: "text-rocita-red",
                                    hoverBorder: "hover:border-red-100",
                                    hoverShadow: "hover:shadow-rocita-red/5",
                                },
                                {
                                    step: "03",
                                    title: "Agenda Asegurada",
                                    desc: "Recordaciones en tiempo real a tus pacientes.",
                                    color: "text-emerald-500",
                                    hoverBorder: "hover:border-emerald-100",
                                    hoverShadow: "hover:shadow-emerald-500/5",
                                },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    // Reemplazamos las clases fijas por las propiedades dinámicas item.hoverBorder e item.hoverShadow
                                    className={`relative p-10 rounded-[2.5rem] bg-white border border-zinc-100 shadow-sm transition-all group overflow-hidden ${item.hoverBorder} ${item.hoverShadow} hover:shadow-xl`}>
                                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                        <Zap size={100} className={item.color} />
                                    </div>
                                    <div className={`${item.color} text-4xl font-black mb-6`}>{item.step}</div>
                                    <h3 className="text-2xl font-black mb-4 tracking-tight text-zinc-900">
                                        {item.title}
                                    </h3>
                                    <p className="text-zinc-500 leading-relaxed text-sm">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Sección de Omnicanalidad Inteligente */}
            
            
            {/* Sección de Timeline: El Camino al Éxito (Horizontal en Desktop) */}
            <section id="timeline" className="py-32 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col items-center text-center mb-24">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6">Tu Ruta hacia la Eficiencia</h2>
                        <p className="text-xl text-slate-500 max-w-2xl text-lg">Un proceso simple, potente y 100% automatizado.</p>
                    </div>

                    <div className="relative">
                        {/* Línea Conectora Horizontal (Solo Desktop) */}
                        <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-rocita-red/20 to-emerald-500/20 -translate-y-1/2 rounded-full"></div>

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative z-10">
                            {[
                                { 
                                    step: '01', 
                                    title: 'Carga tu Excel', 
                                    desc: (<>Sube tu base de datos de citas. <span className="font-extrabold tracking-tight text-black">Ro</span><span className="font-extrabold tracking-tight text-sky-500">cita</span> valida números y formatos automáticamente.</>), 
                                    icon: FileSpreadsheet, 
                                    color: 'text-primary', 
                                    bgColor: 'bg-blue-50' 
                                },
                                { 
                                    step: '02', 
                                    title: 'Diseña el Mensaje', 
                                    desc: (<>Personaliza la comunicación con etiquetas dinámicas usando el motor de IA de <span className="font-extrabold tracking-tight text-black">Ro</span><span className="font-extrabold tracking-tight text-sky-500">cita</span>.</>), 
                                    icon: LayoutTemplate, 
                                    color: 'text-rocita-red', 
                                    bgColor: 'bg-red-50' 
                                },
                                { 
                                    step: '03', 
                                    title: 'Fechas y Horas', 
                                    desc: 'Programa los envíos estratégicamente para maximizar la tasa de respuesta.', 
                                    icon: Clock, 
                                    color: 'text-amber-500', 
                                    bgColor: 'bg-amber-50' 
                                },
                                { 
                                    step: '04', 
                                    title: 'Recibe Informes', 
                                    desc: 'Monitorea en tiempo real el estado de cada envío y las confirmaciones.', 
                                    icon: BarChart3, 
                                    color: 'text-indigo-500', 
                                    bgColor: 'bg-indigo-50' 
                                },
                                { 
                                    step: '05', 
                                    title: 'Paciente en Sede', 
                                    desc: 'Reduce el ausentismo hasta en un 40% y optimiza tu sala de espera.', 
                                    icon: UserCheck, 
                                    color: 'text-emerald-500', 
                                    bgColor: 'bg-emerald-50' 
                                }
                            ].map((item, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex flex-col items-center text-center group"
                                >
                                    {/* Circle Icon */}
                                    <div className="w-20 h-20 rounded-[2.5rem] bg-white border-4 border-slate-50 shadow-xl flex items-center justify-center relative z-20 mb-8 transition-transform duration-500 group-hover:scale-110">
                                        <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full border-4 border-white shadow-md flex items-center justify-center font-black text-xs ${item.bgColor} ${item.color}`}>
                                            {item.step}
                                        </div>
                                        <item.icon size={32} className={item.color} />
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-6 rounded-[2rem] bg-white/40 backdrop-blur-sm border border-transparent group-hover:border-slate-100 group-hover:bg-white group-hover:shadow-xl transition-all duration-500">
                                        <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{item.title}</h3>
                                        <div className="text-slate-500 text-sm leading-relaxed">{item.desc}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Report Highlight Card */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="mt-32 p-12 rounded-[3.5rem] bg-slate-900 text-white relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                            <BarChart3 size={200} />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                            <div className="flex-1">
                                <h3 className="text-3xl md:text-4xl font-black mb-8 flex items-center gap-4 flex-wrap">
                                    Informes de Inteligencia que genera <span className="inline-flex"><span className="font-extrabold tracking-tight text-white">Ro</span><span className="font-extrabold tracking-tight text-sky-500">cita</span></span>:
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {[
                                        'Porcentaje de mensajes entregados',
                                        'Tasa de confirmación positiva',
                                        'Identificación de NITs sin contacto',
                                        'Reporte de ahorro operativo estimado'
                                    ].map((report, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                                <ShieldCheck size={14} />
                                            </div>
                                            <span className="text-slate-300 font-medium text-sm md:text-base">{report}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-2 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md">
                                <span className="text-6xl font-black text-emerald-400 leading-none">98%</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Precisión en <br/>Entregas</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section
                id="omnicanalidad"
                className="py-24 bg-gradient-to-b from-white via-sky-50/50 to-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col items-center text-center mb-16">
                        <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-4">
                            Omnicanalidad Inteligente
                        </h2>
                        <p className="text-slate-500 max-w-xl text-lg">
                            Llegamos a tus pacientes donde ellos están, asegurando la máxima tasa de respuesta.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="group relative p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl hover:shadow-green-500/10 transition-all duration-500 flex flex-col items-center text-center gap-4 overflow-hidden">
                            <div className="w-16 h-16 rounded-3xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform duration-500">
                                <MessageSquare size={32} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-xl font-bold text-slate-900">WhatsApp</span>
                                <span className="text-sm text-slate-500 leading-relaxed">
                                    Notificaciones instantáneas y bidireccionales para confirmar citas en segundos.
                                </span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="group relative p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl hover:shadow-rocita-red/10 transition-all duration-500 flex flex-col items-center text-center gap-4 overflow-hidden">
                            <div className="w-16 h-16 rounded-3xl bg-rocita-red/10 flex items-center justify-center text-rocita-red group-hover:scale-110 transition-transform duration-500">
                                <Smartphone size={32} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-xl font-bold text-slate-900">SMS</span>
                                <span className="text-sm text-slate-500 leading-relaxed">
                                    Recordatorios de respaldo directos al celular, sin necesidad de conexión a datos.
                                </span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="group relative p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col items-center text-center gap-4 overflow-hidden">
                            <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform duration-500">
                                <Mail size={32} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-xl font-bold text-slate-900">Correo</span>
                                <span className="text-sm text-slate-500 leading-relaxed">
                                    Confirmaciones formales y resúmenes de citas para el control del paciente.
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Sección de Beneficios Clave */}
            <section id="beneficios" className="py-24 px-6 relative overflow-hidden bg-slate-50/30">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col items-center text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6">
                            Beneficios de Impacto Real
                        </h2>
                        <p className="text-xl text-slate-500 max-w-2xl">
                            Resultados tangibles que potencian la eficiencia de tu centro médico.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-xl hover:shadow-primary/5 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                <Zap size={120} />
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                                <Zap size={28} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4">Reducción de Costos</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Automatización inteligente que libera recursos humanos y operativos, permitiendo que tu
                                equipo se enfoque en lo que realmente importa: la atención al paciente.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-xl hover:shadow-rocita-red/5 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                <ShieldCheck size={120} />
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-rocita-red/10 flex items-center justify-center text-rocita-red mb-6">
                                <ShieldCheck size={28} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4">Disminución de Ausentismo</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Mediante recordatorios inteligentes multicanal, logramos reducir drásticamente las citas
                                perdidas, optimizando tu agenda y maximizando tus ingresos.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>
        </>
    )
}
