// generate-manifest.js (ESM) — maps folder names to canonical sections
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectsRoot = path.join(__dirname, "public", "projects");
const outFile = path.join(__dirname, "public", "manifest.json");

function readJSONSafe(p) {
  try {
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    console.warn(`Warning: failed to parse JSON at ${p}`, e.message);
    return null;
  }
}

function writeJSON(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), "utf8");
}

if (!fs.existsSync(projectsRoot)) {
  fs.mkdirSync(projectsRoot, { recursive: true });
  writeJSON(outFile, []);
  console.log("Created projects root and empty manifest.json");
  process.exit(0);
}

const existing = readJSONSafe(outFile) || [];
const existingMap = new Map(existing.map((e) => [e.id, e]));

// list section folders
const sections = fs
  .readdirSync(projectsRoot, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

// helper: map folder name to canonical section label
function mapSectionLabel(folderName) {
  const s = folderName.toLowerCase();
  if (s.includes("static")) return "Static";
  if (s.includes("responsive")) return "Responsive";
  if (s.includes("dynamic")) return "Dynamic";
  if (s.includes("react")) return "React";
  // fallback: Capitalize first word (split on - or _)
  const first = folderName.split(/[-_]/)[0] || folderName;
  return first.charAt(0).toUpperCase() + first.slice(1);
}

// try to find an image file inside a project folder (assets, assests, root)
function findFirstImage(projectPath) {
  const candidates = [
    "thumb.png", "thumb.jpg", "thumb.jpeg", "thumb.webp",
    "cover.png", "cover.jpg", "cover.jpeg", "cover.webp",
  ];

  for (const c of candidates) {
    const p = path.join(projectPath, c);
    if (fs.existsSync(p)) return `/${path.relative(path.join(__dirname, "public"), p).replace(/\\\\/g, "/")}`;
  }

  const assetDirs = ["assets", "assests"];
  for (const d of assetDirs) {
    const dir = path.join(projectPath, d);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir, { withFileTypes: true }).filter(f => f.isFile());
    for (const f of files) {
      const ext = path.extname(f.name).toLowerCase();
      if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
        const full = path.join(dir, f.name);
        return `/${path.relative(path.join(__dirname, "public"), full).replace(/\\\\/g, "/")}`;
      }
    }
  }

  const items = fs.readdirSync(projectPath, { withFileTypes: true }).filter(f => f.isFile());
  for (const it of items) {
    const ext = path.extname(it.name).toLowerCase();
    if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
      const full = path.join(projectPath, it.name);
      return `/${path.relative(path.join(__dirname, "public"), full).replace(/\\\\/g, "/")}`;
    }
  }

  return null;
}

const newManifest = [];

for (const sectionName of sections) {
  const sectionPath = path.join(projectsRoot, sectionName);
  const sectionLabel = mapSectionLabel(sectionName);

  const projectFolders = fs
    .readdirSync(sectionPath, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const projectFolder of projectFolders) {
    const projectPath = path.join(sectionPath, projectFolder);
    const metaPath = path.join(projectPath, "meta.json");
    const meta = readJSONSafe(metaPath) || {};

    const generatedId = `${sectionLabel.toLowerCase()}-${projectFolder}`.replace(/\s+/g, "-").toLowerCase();
    const existingEntry = existingMap.get(generatedId) || null;

    const existingByFolder = existing.find(e => e.folder && e.folder.replace(/\/+$/,'') === `/projects/${sectionName}/${projectFolder}`);

    const id = meta.id || (existingEntry ? existingEntry.id : (existingByFolder ? existingByFolder.id : generatedId));

    const defaultTitle = meta.title || projectFolder.replace(/[-_]/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    const defaultDescription = meta.description || "";

    const detectedThumb = meta.thumb ||
      (existingEntry && existingEntry.thumb) ||
      (existingByFolder && existingByFolder.thumb) ||
      findFirstImage(projectPath) ||
      "/default-thumb.png";

    const generated = {
      id,
      title: defaultTitle,
      section: meta.section || sectionLabel,
      description: defaultDescription,
      folder: `/projects/${sectionName}/${projectFolder}`,
      thumb: detectedThumb
    };

    const merged = {
      ...generated,
      ...(existingByFolder || existingEntry || {}),
      ...meta
    };

    merged.id = id;
    merged.folder = merged.folder || `/projects/${sectionName}/${projectFolder}`;
    merged.title = merged.title || defaultTitle;
    merged.section = merged.section || sectionLabel;

    newManifest.push(merged);
  }
}

// preserve manual-only entries that do not map to folders
const existingIds = new Set(newManifest.map(e => e.id));
for (const e of existing) {
  if (!existingIds.has(e.id)) {
    newManifest.push(e);
  }
}

writeJSON(outFile, newManifest);
console.log(`manifest.json written with ${newManifest.length} project(s).`);
