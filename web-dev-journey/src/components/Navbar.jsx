import React from "react";

export default function Navbar(){
  return (
    <nav className="sticky top-0 z-40 backdrop-blur bg-black/30 border-b border-white/6">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#7c5cff] flex items-center justify-center font-bold">W</div>
          <span className="font-semibold">Web Dev Journey</span>
        </div>
        <div className="hidden sm:flex gap-6 text-sm text-white/80">
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </div>
      </div>
    </nav>
  );
}
