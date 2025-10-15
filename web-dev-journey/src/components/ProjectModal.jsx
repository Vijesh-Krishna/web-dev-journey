// src/components/ProjectModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import CodeViewer from "./CodeViewer";

/**
 * ProjectModal
 * - Desktop: two-column layout (preview | details/code)
 * - Mobile (<md): preview occupies full area; Details and Code open as overlays
 * - View Code only fetches index.html/style.css/local .js files (no external CDN scripts)
 * - Hides "Open Full" for Static projects
 */
export default function ProjectModal({ project, onClose }) {
  const [showCode, setShowCode] = useState(false);
  const [loadingCode, setLoadingCode] = useState(false);
  const [codePayload, setCodePayload] = useState({ html: "", css: "", jsFiles: [] });
  const [showDetails, setShowDetails] = useState(false); // mobile-only details overlay
  const modalRef = useRef(null);

  // lock background scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // escape to close
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!project) return null;

  const previewUrl = project.live || `${project.folder}/index.html`;

  // permissive sandbox & allow so embedded players inside project work
  const sandboxAttr = project.sandbox || "allow-scripts allow-same-origin allow-popups";
  const allowAttr =
    project.allow ||
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";

  // load HTML/CSS + only local .js files
  async function loadCode() {
    if (loadingCode || showCode) return;
    setLoadingCode(true);
    try {
      const htmlResp = await fetch(`${project.folder}/index.html`);
      const htmlText = htmlResp.ok ? await htmlResp.text() : "";

      const cssResp = await fetch(`${project.folder}/style.css`);
      const cssText = cssResp.ok ? await cssResp.text() : "";

      const scriptFiles = [];
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, "text/html");
        const scripts = Array.from(doc.querySelectorAll("script[src]"));
        for (const s of scripts) {
          const src = s.getAttribute("src");
          if (src && !/^https?:\/\//i.test(src) && src.toLowerCase().endsWith(".js")) {
            const normalized = src.replace(/^\.\//, "").replace(/^\//, "");
            const srcResolved = `${project.folder}/${normalized}`;
            scriptFiles.push({ name: normalized, src: srcResolved });
          }
        }
      } catch (err) {
        console.warn("Could not parse HTML for scripts", err);
      }

      const jsFiles = [];
      for (const f of scriptFiles) {
        try {
          const r = await fetch(f.src);
          const txt = r.ok ? await r.text() : `/* failed to load ${f.src} */`;
          jsFiles.push({ name: f.name, src: f.src, content: txt });
        } catch (err) {
          jsFiles.push({ name: f.name, src: f.src, content: `/* error loading ${f.src} */` });
        }
      }

      setCodePayload({ html: htmlText, css: cssText, jsFiles });
      setShowCode(true);
    } catch (err) {
      console.error("Error loading code:", err);
    } finally {
      setLoadingCode(false);
    }
  }

  // Hide "Open Full" for static projects only (case-insensitive)
  const isStatic = String(project.section || "").toLowerCase() === "static";

  // Details content (extracted so it can be used on desktop and in mobile overlay)
  const DetailsContent = (    
    <div className="space-y-3">
      <h3 className="font-semibold text-white">Project Details</h3>
      <p className="text-sm text-white/80">{project.description || "No description available."}</p>

      {project.details && project.details.length > 0 && (
        <ul className="mt-2 list-disc pl-6 text-sm text-white/80">
          {project.details.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      )}

      <div className="mt-4 text-xs text-white/60">
        <div>
          <strong>Folder:</strong> <span className="italic">{project.folder}</span>
        </div>
        {project.date && (
          <div>
            <strong>Date:</strong> <span>{project.date}</span>
          </div>
        )}
        {project.tech && (
          <div>
            <strong>Tech:</strong> <span>{project.tech.join(", ")}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.14 }}
        className="relative w-[95%] md:w-4/5 max-h-[92vh] rounded-2xl overflow-hidden shadow-2xl bg-[#07102a]"
        role="dialog"
        aria-modal="true"
        aria-label={`${project.title} preview`}
      >
        {/* header */}
        <div className="flex items-center justify-between gap-4 p-3 bg-[#061029]">
          <div className="flex items-center gap-3">
            <img
              src={project.thumb || project.cover || "/default-thumb.png"}
              alt=""
              className="w-12 h-8 object-cover rounded-md border border-white/5"
            />
            <div>
              <div className="font-semibold text-white">{project.title}</div>
              <div className="text-xs text-white/70">{project.description}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Open Full is hidden for Static */}
            {!isStatic && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded bg-[#7c5cff] text-white text-sm hidden md:inline-flex"
              >
                Open Full
              </a>
            )}

            {/* On mobile show Details button (md:hidden). On desktop details are visible in right pane */}
            <button
              onClick={() => {
                // mobile: open details overlay; desktop: do nothing (details visible)
                setShowDetails(true);
              }}
              className="px-3 py-1 rounded bg-white/5 text-white text-sm border border-white/10 md:hidden"
            >
              Details
            </button>

            <button
              onClick={() => {
                if (!showCode) loadCode();
                else setShowCode(false);
              }}
              className="px-3 py-1 rounded bg-white/5 text-white text-sm border border-white/10"
            >
              {showCode ? "Code" : loadingCode ? "Loading..." : "Code"}
            </button>

            <button onClick={onClose} className="px-3 py-1 rounded bg-red-600 text-white text-sm">
              Close
            </button>
          </div>
        </div>

        {/* body */}
        <div className="flex flex-col md:flex-row h-[72vh]">
          {/* preview (left) - full width on small screens */}
          <div className="w-full md:w-1/2 h-[55vh] md:h-auto bg-white border-r" style={{ position: "relative" }}>
            <iframe
              title={`${project.title} preview`}
              src={previewUrl}
              sandbox={sandboxAttr}
              allow={allowAttr}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full border-0"
              style={{ pointerEvents: "auto" }}
            />
          </div>

          {/* details / code (right) - visible only on md+ */}
          <div className="hidden md:block md:w-1/2 h-[55vh] md:h-auto overflow-auto p-4 bg-[#07102a] text-white">
            {!showCode ? (
              DetailsContent
            ) : (
              <div>
                <h3 className="font-semibold mb-2">Source Code</h3>
                <CodeViewer code={{ html: codePayload.html, css: codePayload.css, jsFiles: codePayload.jsFiles }} dark />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Mobile/tablet overlays: Details (sheet) */}
      {showDetails && (
        <div className="fixed inset-0 z-60 flex items-end md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowDetails(false)} />
          <motion.div
            initial={{ y: "50%" }}
            animate={{ y: 0 }}
            exit={{ y: "50%" }}
            className="relative w-full max-h-[80vh] bg-[#07102a] p-4 rounded-t-2xl overflow-auto border-t border-white/10"
          >
            <div className="flex items-center justify-end mb-3">
              <button onClick={() => setShowDetails(false)} className="px-3 py-1 rounded bg-white/5 text-white text-sm">Close</button>
            </div>
            {DetailsContent}
          </motion.div>
        </div>
      )}

      {/* Mobile/tablet overlays: Code viewer (sheet) */}
      {showCode && (
        // on md+ the code is already visible in the right pane and we do not render this overlay (hide via md:block)
        <div className="fixed inset-0 z-60 flex items-end md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCode(false)} />
          <motion.div
            initial={{ y: "50%" }}
            animate={{ y: 0 }}
            exit={{ y: "50%" }}
            className="relative w-full max-h-[80vh] bg-[#07102a] p-4 rounded-t-2xl overflow-auto border-t border-white/10"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Source Code</h3>
              <button onClick={() => setShowCode(false)} className="px-3 py-1 rounded bg-white/5 text-white text-sm">Close</button>
            </div>

            <CodeViewer code={{ html: codePayload.html, css: codePayload.css, jsFiles: codePayload.jsFiles }} dark />
          </motion.div>
        </div>
      )}
    </div>
  );
}
