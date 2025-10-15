import React, { useState } from "react";
import ProjectCard from "./ProjectCard";
import ProjectModal from "./ProjectModal";
import { motion } from "framer-motion";

export default function ProjectsGrid({ projects }){
  const [open, setOpen] = useState(null);

  return (
    <>
      <motion.div layout className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 mt-4">
        {projects.length === 0 && (
          <div className="col-span-full text-center text-white/70 py-16">
            No projects yet — coming soon. Keep checking back!
          </div>
        )}

        {projects.map(p => (
          <motion.div key={p.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}>
            <ProjectCard project={p} onOpen={() => setOpen(p)} />
          </motion.div>
        ))}
      </motion.div>

      {open && <ProjectModal project={open} onClose={() => setOpen(null)} />}
    </>
  );
}
