const fs = require("fs");
const path = require("path");
const ignore = require("ignore");

const IGNORE_FILES = [
  ".gptignore",
  ".codemapignore",
  ".gitignore",
  ".dockerignore",
];

/**
 * Создает экземпляр ignore для конкретной директории, если там есть файлы правил.
 * Возвращает ignore instance или null.
 */
function loadIgnoreForDir(absDir) {
  const ig = ignore();
  let hasRules = false;

  for (const fname of IGNORE_FILES) {
    const full = path.join(absDir, fname);
    if (fs.existsSync(full)) {
      try {
        const text = fs.readFileSync(full, "utf8");
        ig.add(text);
        hasRules = true;
      } catch (e) {
        console.warn(
          `codemap: warning reading ignore file ${full}: ${e.message}`,
        );
      }
    }
  }

  return hasRules ? ig : null;
}

module.exports = {
  loadIgnoreForDir,
};
