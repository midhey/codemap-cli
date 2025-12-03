const fs = require("fs");
const path = require("path");

/**
 * Рекурсивный обход дерева.
 * Возвращает массив файлов { relPath, absPath }.
 */
function walk(root, ig) {
  const files = [];

  const ALWAYS_IGNORED_NAMES = new Set([
    ".gitignore",
    ".codemapignore",
    ".gptignore",
    ".dockerignore",
  ]);

  function walkDir(relDir) {
    const absDir = path.join(root, relDir);
    let entries;
    try {
      entries = fs.readdirSync(absDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const name = entry.name;

      if (ALWAYS_IGNORED_NAMES.has(name)) {
        continue;
      }

      const relPath = relDir ? path.join(relDir, name) : name;
      const relPathPosix = relPath.split(path.sep).join("/");

      if (ig.ignores(relPathPosix)) {
        continue;
      }

      const absPath = path.join(root, relPath);

      if (entry.isDirectory()) {
        walkDir(relPath);
      } else if (entry.isFile()) {
        files.push({ relPath: relPathPosix, absPath });
      }
    }
  }

  walkDir("");
  return files;
}

module.exports = {
  walk,
};
