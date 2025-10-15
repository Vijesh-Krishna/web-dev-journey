import React from "react";

/**
 * CodeViewer shows:
 * - index.html (raw)
 * - style.css (raw)
 * - any JS files discovered (jsFiles: [{name, src, content}])
 *
 * Props:
 *  - code: { html, css, jsFiles }
 *  - dark: boolean
 */
export default function CodeViewer({ code = { html: "", css: "", jsFiles: [] }, dark = false }) {
  const preClass = dark ? "bg-[#021226] text-white" : "bg-white text-black";

  return (
    <div className="space-y-4 text-sm">
      <div>
        <div className="font-medium mb-1 text-white">index.html</div>
        <pre className={`${preClass} p-3 rounded overflow-auto max-h-40 text-xs`}><code>{code.html || "<!-- no html -->"}</code></pre>
      </div>

      <div>
        <div className="font-medium mb-1 text-white">style.css</div>
        <pre className={`${preClass} p-3 rounded overflow-auto max-h-40 text-xs`}><code>{code.css || "/* no css */"}</code></pre>
      </div>

      {Array.isArray(code.jsFiles) && code.jsFiles.length > 0 && (
        <div>
          <div className="font-medium mb-1 text-white">JS Files</div>
          <div className="space-y-3">
            {code.jsFiles.map((f, i) => (
              <div key={i}>
                <div className="text-xs text-white/80 mb-1">{f.name} — <span className="text-white/60 text-[11px]">{f.src}</span></div>
                <pre className={`${preClass} p-3 rounded overflow-auto max-h-40 text-xs`}><code>{f.content}</code></pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
