'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Phone, Mail, Menu, X, UserCircle, ChevronRight } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className='fixed top-0 z-50 w-full border-b border-white/20 bg-white/40 backdrop-blur-xl px-4 md:px-6 py-3 md:py-4'>
      <div className='max-w-7xl mx-auto flex items-center justify-between'>
        {/* Logo */}
        <div className='flex items-center gap-2 group cursor-pointer'>
          <div className='relative'>
            <div className='w-8 h-8 md:w-10 md:h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-lg md:text-xl shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform'>
              R
            </div>
            <div className='absolute -top-1 -right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-sky-500 rounded-full border-2 border-white animate-pulse'></div>
          </div>
          <span className='text-xl md:text-2xl font-black tracking-tighter'>
            <span className="font-extrabold tracking-tight text-slate-900">Ro</span><span className="font-extrabold tracking-tight text-sky-500">cita</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className='hidden lg:flex items-center gap-10 text-sm font-bold text-zinc-600'>
          <a href='#servicios' className='hover:text-primary transition-colors'>Servicios</a>
          <a href='#beneficios' className='hover:text-primary transition-colors'>Beneficios</a>
          <a href='#integraciones' className='hover:text-primary transition-colors'>Integraciones</a>
          <div className='flex items-center gap-6 border-l border-zinc-200 pl-10'>
             <div className='flex items-center gap-2 hover:text-primary transition-colors cursor-help group'>   
              <MessageSquare size={18} className='group-hover:scale-110 transition-transform' />
              <span>WhatsApp</span>
            </div>
            <div className='flex items-center gap-2 hover:text-primary transition-colors cursor-help group'>    
              <Phone size={18} className='group-hover:scale-110 transition-transform' />
              <span>SMS</span>
            </div>
            <div className='flex items-center gap-2 hover:text-primary transition-colors cursor-help group'>    
              <Mail size={18} className='group-hover:scale-110 transition-transform' />
              <span>Correo</span>
            </div>
          </div>
        </nav>

        {/* Action Buttons */}
        <div className='flex items-center gap-2 md:gap-4'>
          {/* Desktop "Ingresar al Portal" */}
          <a
            href="http://localhost:3001/login"
            className='hidden md:flex items-center gap-2 px-5 py-2.5 border-2 border-sky-500/30 hover:border-sky-500 bg-sky-500/5 hover:bg-sky-500 text-sky-600 hover:text-white font-black rounded-xl transition-all shadow-sm hover:shadow-lg hover:shadow-sky-500/10 active:scale-95 group text-sm'
          >
            <UserCircle size={18} className='text-sky-500 group-hover:text-white group-hover:scale-110 transition-all' />
            <span>Ingresar al Portal</span>
          </a>

          {/* Desktop "Agendar Demo" */}
          <button className='hidden sm:block bg-zinc-900 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-md active:scale-95 text-sm md:text-base'>
            Agendar Demo
          </button>

          {/* Hamburger Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className='lg:hidden p-2 text-zinc-600 hover:bg-slate-100 rounded-xl transition-all outline-none focus:ring-2 focus:ring-sky-500/20'
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className='lg:hidden absolute top-[100%] left-0 w-full bg-white/95 backdrop-blur-2xl border-b border-zinc-200/50 overflow-hidden shadow-2xl z-40'
          >
            <div className='flex flex-col p-6 gap-6 max-h-[85vh] overflow-y-auto'>
              <nav className='flex flex-col gap-2 text-base font-bold text-zinc-700'>
                <a 
                  href='#servicios' 
                  onClick={() => setIsMenuOpen(false)}
                  className='flex items-center justify-between p-3.5 rounded-2xl hover:bg-sky-50 hover:text-sky-600 transition-all'
                >
                  <span>Servicios</span>
                  <ChevronRight size={16} className='opacity-40' />
                </a>
                <a 
                  href='#beneficios' 
                  onClick={() => setIsMenuOpen(false)}
                  className='flex items-center justify-between p-3.5 rounded-2xl hover:bg-sky-50 hover:text-sky-600 transition-all'
                >
                  <span>Beneficios</span>
                  <ChevronRight size={16} className='opacity-40' />
                </a>
                <a 
                  href='#integraciones' 
                  onClick={() => setIsMenuOpen(false)}
                  className='flex items-center justify-between p-3.5 rounded-2xl hover:bg-sky-50 hover:text-sky-600 transition-all'
                >
                  <span>Integraciones</span>
                  <ChevronRight size={16} className='opacity-40' />
                </a>
              </nav>

              {/* Channels block inside drawer */}
              <div className='border-t border-zinc-100 pt-6'>
                <p className='text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 px-3'>Canales de Recordatorio</p>
                <div className='grid grid-cols-3 gap-3 text-xs font-bold text-zinc-500'>
                  <div className='flex flex-col items-center gap-2 p-3 bg-zinc-50 rounded-2xl'>
                    <MessageSquare size={20} className='text-emerald-500' />
                    <span>WhatsApp</span>
                  </div>
                  <div className='flex flex-col items-center gap-2 p-3 bg-zinc-50 rounded-2xl'>
                    <Phone size={20} className='text-sky-500' />
                    <span>SMS</span>
                  </div>
                  <div className='flex flex-col items-center gap-2 p-3 bg-zinc-50 rounded-2xl'>
                    <Mail size={20} className='text-rose-500' />
                    <span>Correo</span>
                  </div>
                </div>
              </div>

              {/* Mobile CTA Buttons */}
              <div className='flex flex-col gap-3 mt-2 border-t border-zinc-100 pt-6'>
                <a
                  href="http://localhost:3001/login"
                  onClick={() => setIsMenuOpen(false)}
                  className='flex items-center justify-center gap-2 px-5 py-4 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-2xl transition-all shadow-md active:scale-95 text-center text-base'
                >
                  <UserCircle size={20} />
                  <span>Ingresar al Portal</span>
                </a>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className='bg-zinc-900 text-white px-5 py-4 rounded-2xl font-black hover:bg-zinc-800 transition-all shadow-md active:scale-95 text-base'
                >
                  Agendar Demo
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
