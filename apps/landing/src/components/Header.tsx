import { MessageSquare, Phone, Mail, Menu, UserCircle } from 'lucide-react';

export default function Header() {
  return (
    <header className='fixed top-0 z-50 w-full border-b border-white/20 bg-white/40 backdrop-blur-xl px-4 md:px-6 py-3 md:py-4'>
      <div className='max-w-7xl mx-auto flex items-center justify-between'>
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

        <div className='flex items-center gap-2 md:gap-4'>
          <a
            href="http://localhost:3001/login"
            className='hidden md:flex items-center gap-2 text-zinc-600 font-bold hover:text-primary transition-all px-4 py-2 rounded-lg'
          >
            <UserCircle size={20} />
            Ingresar
          </a>
          <button className='bg-zinc-900 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-md active:scale-95 text-sm md:text-base'>
            Agendar Demo
          </button>
          <button className='lg:hidden p-2 text-zinc-600'>
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
