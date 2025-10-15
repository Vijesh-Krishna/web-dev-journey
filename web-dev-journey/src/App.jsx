// src/App.jsx
import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Roadmap from "./components/Roadmap";
import ProjectsGrid from "./components/ProjectsGrid";

function normalizeSection(raw) {
  if (!raw) return "Uncategorized";
  const s = String(raw).toLowerCase();

  if (s.includes("static")) return "Static";
  if (s.includes("responsive")) return "Responsive";
  if (s.includes("dynamic")) return "Dynamic";
  if (s.includes("react")) return "React";

  // common variants
  if (s.includes("static-websites") || s.includes("static_websites")) return "Static";
  if (s.includes("responsive-websites") || s.includes("responsive_websites")) return "Responsive";
  if (s.includes("dynamic-websites") || s.includes("dynamic_websites")) return "Dynamic";

  // fallback: take the first token and capitalize
  const first = String(raw).split(/[-_\/\s]/)[0] || raw;
  return first.charAt(0).toUpperCase() + first.slice(1);
}

export default function App() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    async function loadManifest() {
      try {
        const res = await fetch("/manifest.json");
        const data = await res.json();

        // normalize section values (helps when folder names vary)
        const normalized = (data || []).map((p) => {
          const rawSection = p.section || (p.folder ? p.folder.split("/")[2] : "");
          const section = normalizeSection(rawSection);
          return {
            ...p,
            section,
          };
        });

        setProjects(normalized);
      } catch (e) {
        console.warn("manifest.json not found or invalid. Projects will be empty.", e);
        setProjects([]);
      }
    }

    loadManifest();
  }, []);

  const sections = ["All", "Static", "Responsive", "Dynamic"];
  const filtered = projects.filter((p) =>
    filter === "All" ? true : String(p.section || "").toLowerCase() === String(filter).toLowerCase()
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 md:px-6 pb-16">
        <Hero onCTAClick={() => (window.location.hash = "#projects")} />
        <Roadmap />
        <section id="projects" className="mt-10">
          <div className="flex gap-3 flex-wrap mb-4">
            {sections.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-full text-sm ${filter === s ? "bg-[#7c5cff] text-white" : "bg-white/5 text-white/80"}`}
              >
                {s}
              </button>
            ))}
          </div>

          <ProjectsGrid projects={filtered} />
        </section>
        <footer className="mt-16 text-center text-white/70 pb-8">
          Built with ❤️ • React • Tailwind • Framer Motion • Vite
        </footer>
      </main>
    </div>
  );
}
