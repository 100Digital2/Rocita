'use client';
import { useState } from 'react';
import { Upload, MessageSquare, CheckCircle2, LayoutDashboard, Settings, User } from 'lucide-react';

export default function Dashboard() {
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');

  const insertVariable = (variable: string) => {
    setMessage(prev => prev + ' ' + variable);
  };

  return (
    <div className='flex min-h-screen bg-zinc-50'>
      {/* Sidebar */}
      <aside className='w-64 bg-white border-r p-6 flex flex-col gap-8'>
        <div className='flex items-center gap-2 font-bold text-xl text-primary'>
          <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white'>R</div>
          Rocita Admin
        </div>
        
        <nav className='flex flex-col gap-2'>
          <a href='#' className='flex items-center gap-3 p-3 bg-accent text-primary rounded-xl font-medium'>
            <LayoutDashboard size={20} /> Dashboard
          </a>
          <a href='#' className='flex items-center gap-3 p-3 text-zinc-500 hover:bg-zinc-50 rounded-xl transition-all'>
            <User size={20} /> Pacientes
          </a>
          <a href='#' className='flex items-center gap-3 p-3 text-zinc-500 hover:bg-zinc-50 rounded-xl transition-all'>
            <Settings size={20} /> Configuración
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className='flex-1 p-10 overflow-y-auto'>
        <header className='mb-12'>
          <h1 className='text-3xl font-bold tracking-tight mb-2'>Configuración de Campaña</h1>
          <p className='text-zinc-500'>Sigue los pasos para programar tus recordatorios de citas.</p>
        </header>

        {/* Steps Progress */}
        <div className='flex items-center gap-4 mb-12'>
          {[1, 2, 3].map((s) => (
            <div key={s} className='flex items-center gap-4'>
              <div className={w-10 h-10 rounded-full flex items-center justify-center font-bold }>
                {step > s ? <CheckCircle2 size={20} /> : s}
              </div>
              {s < 3 && <div className={w-20 h-1 }></div>}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className='bg-white border rounded-3xl p-8 shadow-sm max-w-4xl'>
          {step === 1 && (
            <div className='flex flex-col items-center py-12'>
              <div className='w-20 h-20 bg-accent rounded-full flex items-center justify-center text-primary mb-6'>
                <Upload size={32} />
              </div>
              <h2 className='text-2xl font-bold mb-4'>Carga de Datos (Excel)</h2>
              <p className='text-zinc-500 text-center mb-8 max-w-md'>
                Arrastra tu archivo Excel con las pestañas de Pacientes, Profesionales y Citas.
              </p>
              <div className='w-full border-2 border-dashed border-zinc-200 rounded-2xl p-12 flex flex-col items-center hover:border-primary transition-all cursor-pointer bg-zinc-50'>
                <p className='font-medium text-zinc-600 mb-2 text-center'>Haz clic para subir o arrastra el archivo aquí</p>
                <p className='text-xs text-zinc-400'>Formato soportado: .xlsx, .csv</p>
              </div>
              <button 
                onClick={() => setStep(2)}
                className='mt-10 bg-primary text-white px-8 py-3 rounded-full font-bold hover:opacity-90 transition-all'
              >
                Continuar a personalización
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className='text-2xl font-bold mb-6 flex items-center gap-3'>
                <MessageSquare size={24} className='text-primary' /> Personalización del Mensaje
              </h2>
              <div className='mb-6'>
                <p className='text-sm font-bold mb-3'>Variables disponibles (haz clic para insertar):</p>
                <div className='flex flex-wrap gap-2'>
                  {['{nombre_paciente}', '{nombre_doctor}', '{fecha_cita}', '{lugar}'].map(v => (
                    <button 
                      key={v}
                      onClick={() => insertVariable(v)}
                      className='px-3 py-1.5 bg-accent text-primary rounded-lg text-sm font-medium hover:bg-primary/10 transition-all'
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder='Hola {nombre_paciente}, te recordamos tu cita con {nombre_doctor} el día {fecha_cita}...'
                className='w-full h-48 p-4 border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-sans leading-relaxed'
              />
              <div className='flex justify-between mt-8'>
                <button onClick={() => setStep(1)} className='text-zinc-500 font-bold'>Atrás</button>
                <button 
                  onClick={() => setStep(3)}
                  className='bg-primary text-white px-8 py-3 rounded-full font-bold hover:opacity-90 transition-all'
                >
                  Confirmar y enviar
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className='flex flex-col items-center py-12 text-center'>
              <div className='w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6'>
                <CheckCircle2 size={40} />
              </div>
              <h2 className='text-2xl font-bold mb-4'>¡Todo listo!</h2>
              <p className='text-zinc-500 max-w-sm mb-8 leading-relaxed'>
                Rocita está procesando los datos y enviará las notificaciones en breve.
              </p>
              <button 
                onClick={() => setStep(1)}
                className='border px-8 py-3 rounded-full font-bold hover:bg-zinc-50 transition-all'
              >
                Volver al inicio
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

