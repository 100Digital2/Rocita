'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Mail, ChevronRight, Activity, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulación de autenticación (Mock Auth)
    setTimeout(() => {
      if (email === 'admin@rocita.ai' && password === 'rocita2026') {
        // Guardamos un token ficticio en localStorage para la demo
        localStorage.setItem('rocita_auth', 'true');
        router.push('/');
      } else {
        setError('Credenciales incorrectas. Prueba con admin@rocita.ai / rocita2026');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#E0F2FE] flex items-center justify-center p-6 font-sans overflow-hidden relative">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-400/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[480px] z-10"
      >
        {/* Logo y Encabezado */}
        <div className="text-center mb-10">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <motion.div 
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 3 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full h-full bg-sky-500 rounded-[2.2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-sky-500/40"
            >
              R
            </motion.div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-sky-500 rounded-full border-4 border-[#E0F2FE] animate-pulse z-20"></div>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">Bienvenido a <span className="font-extrabold tracking-tight text-slate-900">Ro</span><span className="font-extrabold tracking-tight text-sky-500">cita</span></h1>
          <p className="text-slate-500 font-bold tracking-tight">Gestión de Salud Eficiente</p>
        </div>

        {/* Tarjeta de Login */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-[3.5rem] p-12 shadow-2xl shadow-sky-900/10 relative overflow-hidden">
          {/* Badge de seguridad */}
          <div className="absolute top-8 right-8 flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
            <ShieldCheck size={14} className="text-green-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-green-700">Acceso Seguro</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">Correo Institucional</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@clinica.com"
                  className="w-full bg-slate-50/50 border-2 border-transparent focus:border-sky-500 focus:bg-white rounded-[2rem] py-5 pl-14 pr-6 outline-none transition-all font-bold text-slate-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50/50 border-2 border-transparent focus:border-sky-500 focus:bg-white rounded-[2rem] py-5 pl-14 pr-6 outline-none transition-all font-bold text-slate-800"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-600 leading-relaxed"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-500 text-white rounded-[2rem] py-5 font-black text-lg shadow-xl shadow-sky-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Ingresar al Panel <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Desarrollado por</p>
            <div className="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
              <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center text-[10px] text-white font-black">100</div>
              <span className="font-black tracking-tighter text-slate-900">100Digital</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400/60">
          <a href="#" className="hover:text-sky-500 transition-colors">Privacidad</a>
          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
          <a href="#" className="hover:text-sky-500 transition-colors">Soporte Técnico</a>
          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
          <span className="flex items-center gap-1.5"><Activity size={10} /> Sistema Online</span>
        </div>
      </motion.div>
    </div>
  );
}
