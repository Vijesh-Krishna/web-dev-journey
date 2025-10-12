const fs = require("fs");
const path = require("path");

const projectsDir = path.join(__dirname, "public", "projects");
const outFile = path.join(__dirname, "public", "manifest.json");

// Ensure public/projects exists (create if missing)
if (!fs.existsSync(projectsDir)) {
  fs.mkdirSync(projectsDir, { recursive: true });
}

// Read project folders
const folders = fs.readdirSync(projectsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

// Helper to read meta.json if present
function readMeta(projectPath) {
  const metaPath = path.join(projectPath, "meta.json");
  if (fs.existsSync(metaPath)) {
    try {
      const raw = fs.readFileSync(metaPath, "utf8");
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`Warning: invalid JSON in ${metaPath} — using defaults`);
    }
  }
  const id = path.basename(projectPath);
  return {
    id,
    title: id.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    section: "Uncategorized",
    description: ""
  };
}

const manifest = folders.map(folder => {
  const projectPath = path.join(projectsDir, folder);
  const meta = readMeta(projectPath);
  const thumbPath = path.join(projectPath, "thumb.png");
  const thumb = fs.existsSync(thumbPath) ? `/projects/${folder}/thumb.png` : "/default-thumb.png";

  return {
    id: meta.id || folder,
    title: meta.title || folder,
    section: meta.section || "Uncategorized",
    description: meta.description || "",
    folder: `/projects/${folder}`,
    thumb
  };
});

// Write manifest.json
fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2), "utf8");
console.log(`manifest.json written with ${manifest.length} project(s).`);
