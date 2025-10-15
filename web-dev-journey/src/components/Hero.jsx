import React from "react";
import { motion } from "framer-motion";

export default function Hero({ onCTAClick }){
  return (
    <section className="mt-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
          My <span className="text-[#7c5cff]">Web Dev Journey</span>
        </h1>
        <p className="mt-4 text-white/85 max-w-2xl">
          A curated gallery that subtly guides through the learning path — from static pages to responsive layouts and interactive web apps.
        </p>

        <div className="mt-6 flex gap-3">
          <button onClick={onCTAClick} className="px-5 py-3 rounded-full bg-[#7c5cff] font-medium shadow-lg hover:scale-[1.02] transition-transform">
            Explore Projects
          </button>
          <a className="px-5 py-3 rounded-full bg-white/5 text-white/90" href="#roadmap">Roadmap</a>
        </div>
      </motion.div>
    </section>
  );
}
