import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import CTASection from '@/components/CTASection';

export default function Home() {
  return (
    <main className="min-h-screen bg-background selection:bg-sky-500/20">
      <Header />
      <Hero />
      <Features />
      <CTASection />
      
      {/* Footer Pro */}
      <footer className="py-32 border-t border-zinc-200 bg-white px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">R</div>
              <span className="text-3xl font-black tracking-tighter"><span className="font-extrabold tracking-tight text-slate-900">Ro</span><span className="font-extrabold tracking-tight text-sky-500">cita</span></span>
            </div>
            <p className="text-zinc-500 text-lg max-w-xs leading-relaxed">
              La inteligencia artificial al servicio de la salud. Optimizando la conexión entre pacientes e instituciones en 100Digital.
            </p>
          </div>
          <div>
            <h4 className="font-black mb-8 text-zinc-900 uppercase text-xs tracking-widest">Producto</h4>
            <ul className="space-y-4 text-zinc-600 font-medium">
              <li><a href="#" className="hover:text-sky-500 transition-colors">Funcionalidades</a></li>
              <li><a href="#" className="hover:text-sky-500 transition-colors">Integraciones</a></li>
              <li><a href="#" className="hover:text-sky-500 transition-colors">Documentación API</a></li>
              <li><a href="#" className="hover:text-sky-500 transition-colors">Seguridad</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black mb-8 text-zinc-900 uppercase text-xs tracking-widest">Legal</h4>
            <ul className="space-y-4 text-zinc-600 font-medium">
              <li><a href="#" className="hover:text-sky-500 transition-colors">Privacidad</a></li>
              <li><a href="#" className="hover:text-sky-500 transition-colors">Habeas Data</a></li>
              <li><a href="#" className="hover:text-sky-500 transition-colors">ANS</a></li>
              <li><a href="#" className="hover:text-sky-500 transition-colors">Términos</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-400 text-sm font-medium">
          <span>© 2026 100Digital. Todos los derechos reservados.</span>
          <div className="flex gap-8">
            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Sistemas OK</span>
            <span>Hecho con ❤️ en Colombia.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
