"use client"
import { motion } from "framer-motion"

export default function CTASection() {
    return (
        <section className="py-40 px-6">
            <div className="max-w-6xl mx-auto rounded-[4rem] bg-zinc-900 p-12 md:p-32 text-center text-white relative overflow-hidden shadow-3xl">
                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-rocita-red font-black tracking-widest uppercase text-sm mb-8">
                        Comienza hoy mismo
                    </motion.div>
                    <h2 className="text-5xl md:text-8xl font-black mb-12 leading-[0.9] tracking-tighter">
                        ¿Listo para <br />
                        <span className="text-primary">asegurar tu agenda?</span>
                    </h2>
                    <p className="text-zinc-400 text-xl md:text-2xl mb-16 max-w-2xl mx-auto leading-relaxed">
                        Únete a las instituciones que ya están transformando la experiencia de sus pacientes con <span className="font-extrabold tracking-tight text-white">Ro</span><span className="font-extrabold tracking-tight text-sky-500">cita</span>.
                    </p>
                    <button className="bg-white text-zinc-900 px-12 py-6 rounded-[2rem] text-2xl font-black hover:scale-105 transition-all shadow-xl hover:shadow-white/10">
                        Solicitar acceso prioritario
                    </button>
                </div>

                {/* Decorative Gradients */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sky-500/10 blur-[100px] rounded-full"></div>
            </div>
        </section>
    )
}
