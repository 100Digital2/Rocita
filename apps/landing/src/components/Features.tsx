'use client';
import { motion } from 'framer-motion';
import { Calendar, Users, TrendingUp, Clock, FileSpreadsheet, Database, CheckCircle2 } from 'lucide-react';

const cards = [
  {
    title: 'Clínicas y Hospitales',
    desc: 'Optimización de flujo para instituciones de mediana y alta complejidad.',
    icon: <Calendar className='text-primary' />,
    delay: 0.1
  },
  {
    title: 'Redes de Salud',
    desc: 'Gestión centralizada para múltiples sedes con un solo tablero de control.',
    icon: <Users className='text-rocita-red' />,
    delay: 0.2
  },
  {
    title: 'Eficiencia Directiva',
    desc: 'Decisiones basadas en datos reales de ocupación y rentabilidad.',
    icon: <TrendingUp className='text-primary' />,
    delay: 0.3
  },
  {
    title: 'Menor Carga Operativa',
    desc: 'Libera a tu equipo de las llamadas manuales. Rocita lo hace por ellos.',
    icon: <Clock className='text-rocita-red' />,
    delay: 0.4
  }
];

export default function Features() {
  return (
    <section id='beneficios' className='py-40 px-6 bg-white'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex flex-col md:flex-row items-end justify-between mb-24 gap-8'>
          <div className='max-w-2xl'>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className='text-rocita-red font-black tracking-widest uppercase text-sm mb-4'
            >
              Beneficios Reales
            </motion.div>
            <h2 className='text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]'>
              Diseñado para una <br /><span className='text-primary'>salud eficiente.</span>
            </h2>
          </div>
          <p className='text-zinc-500 text-xl max-w-sm mb-2'>
            Rocita se adapta a la complejidad de tu institución, garantizando que cada espacio sea aprovechado.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: card.delay }}
              className='group p-10 rounded-[3rem] bg-zinc-50 border border-transparent hover:border-zinc-200 hover:bg-white hover:shadow-2xl transition-all overflow-hidden relative'
            >
              <div className='w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
                {card.icon}
              </div>
              <h3 className='text-2xl font-black mb-4 tracking-tight'>{card.title}</h3>
              <p className='text-zinc-500 leading-relaxed'>{card.desc}</p>
              
              <div className='absolute -bottom-2 -right-2 opacity-0 group-hover:opacity-5 transition-opacity'>
                 {card.icon}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Integraciones */}
        <div id='integraciones' className='mt-32 p-16 rounded-[4rem] bg-zinc-900 text-white relative overflow-hidden'>
          <div className='absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50'></div>
          
          <div className='relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center'>
            <div>
              <h3 className='text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tighter'>
                Flexibilidad técnica <br /><span className='text-primary'>sin fronteras.</span>
              </h3>
              <p className='text-zinc-400 text-xl mb-12 leading-relaxed'>
                Carga tus datos mediante Excel en segundos o conecta Rocita directamente a tu HIS/CRM vía API profesional.
              </p>
              
              <div className='space-y-6'>
                {[
                   { t: 'Carga masiva mediante Excel', desc: 'Protocolo de validación inteligente de 3 capas.' },
                   { t: 'Conexión mediante API directa', desc: 'Integración fluida con HIS/CRM empresariales.' }
                ].map((item, idx) => (
                  <div key={idx} className='flex gap-4'>
                    <div className='mt-1 text-rocita-red'><CheckCircle2 size={24} /></div>
                    <div>
                      <div className='font-bold text-xl'>{item.t}</div>
                      <div className='text-zinc-500'>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-md'>
               <div className='space-y-8'>
                  <div className='flex justify-between items-center border-b border-white/10 pb-4'>
                     <div className='text-zinc-400 font-mono text-sm uppercase tracking-widest'>Documentación</div>
                     <div className='px-3 py-1 bg-primary/20 text-primary text-[10px] font-bold rounded-full uppercase'>v2.5 Stable</div>
                  </div>
                  <div className='space-y-4'>
                     <div className='h-4 bg-white/10 rounded-full w-3/4'></div>
                     <div className='h-4 bg-white/5 rounded-full w-1/2'></div>
                     <div className='h-4 bg-white/10 rounded-full w-2/3'></div>
                  </div>
                  <div className='pt-8 flex gap-4'>
                     <div className='flex-1 p-4 rounded-2xl bg-white/5 border border-white/5 text-center'>
                        <div className='text-rocita-red font-black text-2xl mb-1'>API</div>
                        <div className='text-[10px] text-zinc-500 uppercase font-bold tracking-widest'>REST Framework</div>
                     </div>
                     <div className='flex-1 p-4 rounded-2xl bg-white/5 border border-white/5 text-center'>
                        <div className='text-primary font-black text-2xl mb-1'>Web</div>
                        <div className='text-[10px] text-zinc-500 uppercase font-bold tracking-widest'>Webhooks</div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
