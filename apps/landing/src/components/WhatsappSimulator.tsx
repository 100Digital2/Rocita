'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Check, User } from 'lucide-react';
import { useState, useEffect } from 'react';

const MESSAGES = [
  { id: 1, sender: 'rocita', text: '¡Hola Julián! 🩺 Soy Ro-cita. Te recordamos tu cita odontológica mañana a las 10:00 AM. ¿Confirmas tu asistencia?', delay: 1000 },
  { id: 2, sender: 'user', text: '¡Hola! Sí, confirmo mi asistencia. Muchas gracias.', delay: 3000 },
  { id: 3, sender: 'rocita', text: '¡Excelente! ✅ Tu cita ha sido confirmada. Nos vemos mañana.', delay: 4500 }
];

export default function WhatsappSimulator() {
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setVisibleMessages([]);
    const timeouts = MESSAGES.map((msg, index) => {
      return setTimeout(() => {
        setVisibleMessages(prev => [...prev, msg]);
      }, msg.delay);
    });

    const resetTimeout = setTimeout(() => {
      setKey(prev => prev + 1);
    }, 10000);

    return () => {
      timeouts.forEach(t => clearTimeout(t));
      clearTimeout(resetTimeout);
    };
  }, [key]);

  return (
    <div className="relative w-full max-w-[320px] aspect-[9/18] bg-zinc-900 rounded-[3rem] p-3 border-[6px] border-zinc-800 shadow-2xl overflow-hidden group">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-20"></div>
      
      <div className="relative h-full w-full bg-[#E5DDD5] rounded-[2.2rem] overflow-hidden flex flex-col">
        <div className="bg-sky-500 p-4 pt-8 flex items-center gap-3 text-white">
          <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center">
            <User size={18} className="text-sky-600" />
          </div>
          <div>
            <p className="text-xs font-bold leading-none">Ro-cita Assistant</p>
            <p className="text-[10px] opacity-80">en línea</p>
          </div>
        </div>

        <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
          <AnimatePresence>
            {visibleMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`max-w-[85%] p-3 rounded-2xl text-[11px] leading-tight shadow-sm relative ${
                  msg.sender === 'rocita' 
                    ? 'bg-white self-start rounded-tl-none' 
                    : 'bg-[#DCF8C6] self-end rounded-tr-none'
                }`}
              >
                {msg.text}
                <div className={`absolute top-0 ${msg.sender === 'rocita' ? '-left-2 border-r-white' : '-right-2 border-l-[#DCF8C6]'} border-8 border-transparent`}></div>
                <p className="text-[8px] text-zinc-400 text-right mt-1">
                    {new Date().getHours()}:{new Date().getMinutes()} 
                    {msg.sender === 'user' && <Check size={8} className="inline ml-1 text-sky-500" />}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="p-3 bg-zinc-100 flex items-center gap-2">
            <div className="flex-1 bg-white h-8 rounded-full"></div>
            <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white">
                <MessageSquare size={14} />
            </div>
        </div>
      </div>
    </div>
  );
}
