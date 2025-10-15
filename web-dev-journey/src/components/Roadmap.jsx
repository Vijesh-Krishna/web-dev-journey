import React from "react";
import { motion } from "framer-motion";

export default function Roadmap(){
  const steps = [
    { id:1, title:"Structure", subtitle:"Static HTML & CSS", desc:"Learn layout and semantic structure." },
    { id:2, title:"Design", subtitle:"Responsive Layouts", desc:"Make sites adapt to all screens." },
    { id:3, title:"Interaction", subtitle:"Dynamic JS", desc:"Add behaviors and state to interfaces." }
  ];

  return (
    <section id="roadmap" className="mt-10">
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((s,i) => (
          <motion.div key={s.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.12 }} className="glass rounded-2xl p-6">
            <div className="text-sm text-[#7c5cff] font-semibold">{s.title}</div>
            <h3 className="text-xl font-bold mt-2">{s.subtitle}</h3>
            <p className="mt-3 text-white/80">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
