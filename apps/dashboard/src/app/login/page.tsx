'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ChevronRight, Activity, ShieldCheck, Eye, EyeOff, Sparkles, User, Building, HeartPulse } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [role, setRole] = useState('doctor');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Petición real al backend de NestJS
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Usamos la función de login global del contexto
        login(data.access_token, data.user);
        return;
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Credenciales incorrectas en el servidor.');
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('NestJS Backend desconectado. Activando Fallback Inteligente de la Demo...', err);
      
      // Fallback de Respaldo (Si el backend no está levantado durante la presentación)
      setTimeout(() => {
        if (email === 'admin@rocita.ai' && password === 'rocita2026') {
          login('demo-jwt-token-offline-mode', { email, name: 'Administrador Rocita (Local)', role: 'admin' });
        } else {
          setError('Credenciales incorrectas. Prueba con admin@rocita.ai / rocita2026');
          setIsLoading(false);
        }
      }, 1000);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Petición real al backend de NestJS
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, clinicName, role }),
      });

      if (response.ok) {
        setSuccessMessage('¡Cuenta creada con éxito! Iniciando sesión...');
        
        // Autologin
        setTimeout(async () => {
          try {
            const loginRes = await fetch(`${apiUrl}/auth/login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, password }),
            });
            if (loginRes.ok) {
              const loginData = await loginRes.json();
              login(loginData.access_token, loginData.user);
            } else {
              setIsRegister(false);
              setIsLoading(false);
            }
          } catch (loginErr) {
            login('demo-jwt-token-offline-mode', { email, name, role });
          }
        }, 1500);
        return;
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Error al registrar la cuenta en el servidor.');
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('NestJS Backend desconectado. Activando Fallback Inteligente de la Demo...', err);
      
      // Fallback de Respaldo Offline
      setTimeout(() => {
        setSuccessMessage('¡Cuenta registrada exitosamente (Modo Demo Offline)!');
        setTimeout(() => {
          login('demo-jwt-token-offline-mode', { email, name, role });
        }, 1500);
      }, 1000);
    }
  };

  // WOW Factor UX: Relleno rápido para la demo de 100Digital
  const handleDemoFill = () => {
    setEmail('admin@rocita.ai');
    setPassword('rocita2026');
    setIsRegister(false);
  };

  return (
    <div className="min-h-screen bg-[#F0F9FF] flex items-center justify-center p-6 font-sans overflow-hidden relative">
      {/* 🔹 Patrón de cuadrícula ultra premium */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40"></div>

      {/* 🔹 Orbes decorativos animados con gradiente clínico */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-sky-300/20 to-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-bl from-indigo-300/10 to-emerald-300/15 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[520px] z-10"
      >
        {/* Logo y Encabezado */}
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto mb-5">
            {/* Efecto latido clínico / pulso de fondo */}
            <div className="absolute inset-0 bg-sky-500/25 rounded-[2.2rem] blur-lg animate-ping" style={{ animationDuration: '3s' }}></div>
            <motion.div 
              initial={{ scale: 0.8, rotate: -15 }}
              animate={{ scale: 1, rotate: 3 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
              className="relative w-full h-full bg-gradient-to-br from-sky-400 to-blue-600 rounded-[2.2rem] flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-sky-500/30"
            >
              R
            </motion.div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-[#F0F9FF] animate-pulse z-20"></div>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">
            {isRegister ? 'Únete a ' : 'Bienvenido a '}<span className="font-extrabold tracking-tight text-slate-900">Ro</span><span className="font-extrabold tracking-tight text-sky-500">cita</span>
          </h1>
          <p className="text-slate-500 font-bold tracking-tight flex items-center justify-center gap-1.5 text-sm">
            <Sparkles size={14} className="text-sky-500" /> Inteligencia en Gestión Médica
          </p>
        </div>

        {/* Tarjeta de Login (Glassmorphism Premium) */}
        <div className="bg-white/95 backdrop-blur-3xl border-2 border-white rounded-[3.5rem] p-10 shadow-[0_25px_60px_-15px_rgba(14,165,233,0.15)] relative overflow-hidden transition-all duration-500">
          {/* Filo de luz superior */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent"></div>

          {/* Badge de seguridad superior */}
          <div className="absolute top-8 right-8 flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700">Acceso Seguro</span>
          </div>

          <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4.5 relative z-10 mt-4">
            
            {/* Campos de Registro */}
            <AnimatePresence initial={false} mode="popLayout">
              {isRegister && (
                <motion.div
                  key="register-fields"
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="space-y-4.5 overflow-hidden"
                >
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Nombre Completo</label>
                    <div className="relative group">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. Alejandro Ruiz"
                        className="w-full bg-slate-50/70 border-2 border-slate-100/50 focus:border-sky-400 focus:bg-white rounded-[2rem] py-4 pl-14 pr-6 outline-none transition-all font-bold text-slate-800 focus:ring-4 focus:ring-sky-500/5"
                        required={isRegister}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Nombre de la Clínica / Consultorio</label>
                    <div className="relative group">
                      <Building className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                      <input 
                        type="text" 
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        placeholder="Clínica del Rosario / Consultorio Principal"
                        className="w-full bg-slate-50/70 border-2 border-slate-100/50 focus:border-sky-400 focus:bg-white rounded-[2rem] py-4 pl-14 pr-6 outline-none transition-all font-bold text-slate-800 focus:ring-4 focus:ring-sky-500/5"
                        required={isRegister}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Rol Clínico</label>
                    <div className="relative group">
                      <HeartPulse className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors z-10" size={18} />
                      <select 
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full bg-slate-50/70 border-2 border-slate-100/50 focus:border-sky-400 focus:bg-white rounded-[2rem] py-4 pl-14 pr-8 outline-none transition-all font-bold text-slate-800 focus:ring-4 focus:ring-sky-500/5 appearance-none cursor-pointer relative"
                        required={isRegister}
                      >
                        <option value="doctor">Médico / Especialista</option>
                        <option value="assistant">Asistente Clínico</option>
                        <option value="admin">Administrador del Centro</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronRight className="rotate-90" size={16} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Correo Institucional</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@clinica.com"
                  className="w-full bg-slate-50/70 border-2 border-slate-100/50 focus:border-sky-400 focus:bg-white rounded-[2rem] py-4 pl-14 pr-6 outline-none transition-all font-bold text-slate-800 focus:ring-4 focus:ring-sky-500/5"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50/70 border-2 border-slate-100/50 focus:border-sky-400 focus:bg-white rounded-[2rem] py-4 pl-14 pr-14 outline-none transition-all font-bold text-slate-800 focus:ring-4 focus:ring-sky-500/5"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirmar Contraseña en Registro */}
            <AnimatePresence initial={false}>
              {isRegister && (
                <motion.div
                  key="confirm-password"
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Confirmar Contraseña</label>
                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50/70 border-2 border-slate-100/50 focus:border-sky-400 focus:bg-white rounded-[2rem] py-4 pl-14 pr-14 outline-none transition-all font-bold text-slate-800 focus:ring-4 focus:ring-sky-500/5"
                      required={isRegister}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-600 leading-relaxed shadow-sm"
              >
                {error}
              </motion.div>
            )}

            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs font-bold text-emerald-600 leading-relaxed shadow-sm flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                {successMessage}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative overflow-hidden bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-[2rem] py-4.5 font-black text-base shadow-xl shadow-sky-500/20 hover:shadow-sky-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group disabled:opacity-85"
            >
              {/* Efecto Shimmer (Brillo Animado en Hover) */}
              <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.2s_ease-in-out_infinite]"></div>

              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isRegister ? 'Registrar y Comenzar' : 'Ingresar al Panel'} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Enlace para conmutar Login <-> Registro */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setSuccessMessage('');
              }}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors focus:outline-none"
            >
              {isRegister ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes una cuenta médica? Regístrate'}
            </button>
          </div>

          {/* 🌟 Caja de Acceso Rápido Demo (WOW Factor de UX) */}
          <div className="mt-6 p-4 bg-sky-50/50 border border-sky-100/50 rounded-3xl flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-sky-700">Acceso Rápido Demo</p>
              <p className="text-[10px] text-slate-500 font-bold mt-0.5">Autocompleta los datos institucionales</p>
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              className="px-4 py-2 bg-white hover:bg-sky-500 hover:text-white border border-sky-200 hover:border-sky-500 rounded-2xl text-xs font-black text-sky-600 shadow-sm active:scale-95 transition-all"
            >
              Usar Demo
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desarrollado por</p>
            <div className="flex items-center gap-2 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
              <div className="w-5 h-5 bg-slate-900 rounded-md flex items-center justify-center text-[9px] text-white font-black">100</div>
              <span className="font-black text-sm tracking-tighter text-slate-900">100Digital</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center gap-6 text-[9px] font-black uppercase tracking-widest text-slate-400/60">
          <a href="#" className="hover:text-sky-500 transition-colors">Privacidad</a>
          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
          <a href="#" className="hover:text-sky-500 transition-colors">Soporte Técnico</a>
          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
          <span className="flex items-center gap-1.5"><Activity size={10} className="text-emerald-500" /> Sistema Online</span>
        </div>
      </motion.div>

      {/* Brillo reflectante para botón de envío */}
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(250%);
          }
        }
      `}</style>
    </div>
  );
}
