import React from "react";
import { motion } from "framer-motion";

export default function ProjectCard({ project, onOpen }){
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="glass rounded-2xl p-3 cursor-pointer" onClick={onOpen}>
      <div className="w-full h-44 rounded-lg overflow-hidden mb-3 bg-white/5 flex items-center justify-center">
        {/* fallback if no thumb */}
        <img src={project.thumb || "/default-thumb.png"} alt={project.title} className="w-full h-full object-cover" />
      </div>
      <h3 className="text-lg font-semibold">{project.title}</h3>
      <p className="text-sm text-white/80 mt-1">{project.description}</p>
      <div className="mt-3 text-xs text-white/70">{project.section}</div>
    </motion.div>
  );
}
