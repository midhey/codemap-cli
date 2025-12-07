const fs = require("fs");
const path = require("path");
const { loadIgnoreForDir } = require("./ignore");

/**
 * Рекурсивный обход дерева с поддержкой вложенных ignore-файлов.
 * @param {string} root - Абсолютный путь к корню сканирования
 * @param {string|null} outputFileAbs - Абсолютный путь к файлу вывода (чтобы исключить его)
 */
function walk(root, outputFileAbs) {
  const files = [];
  const ALWAYS_IGNORED_NAMES = new Set([
    ".git",
    ".hg",
    ".svn",
    "node_modules",
    ".gitignore",
    ".codemapignore",
    ".gptignore",
    ".dockerignore",
  ]);

  const baseIg = require("ignore")().add([
    ".git/",
    ".hg/",
    ".svn/",
    "node_modules/",
  ]);

  const initialStack = [{ dir: root, ig: baseIg }];

  function walkDir(currentAbsDir, ignoreStack) {
    let entries;
    try {
      entries = fs.readdirSync(currentAbsDir, { withFileTypes: true });
    } catch (e) {
      console.warn(
        `codemap: warning reading dir ${currentAbsDir}: ${e.message}`,
      );
      return;
    }

    // 1. Проверяем, есть ли новые правила игнорирования в текущей папке
    const localIg = loadIgnoreForDir(currentAbsDir);
    const nextStack = localIg
      ? [...ignoreStack, { dir: currentAbsDir, ig: localIg }]
      : ignoreStack;

    for (const entry of entries) {
      const name = entry.name;
      const absPath = path.join(currentAbsDir, name);

      // --- Проверка 1: Самоисключение output файла ---
      if (outputFileAbs && absPath === outputFileAbs) {
        continue;
      }

      // --- Проверка 2: Системные папки/файлы (быстрая проверка) ---
      if (ALWAYS_IGNORED_NAMES.has(name)) {
        continue;
      }

      // --- Проверка 3: Проход по стеку игноров ---
      // Файл должен пройти проверку ВСЕХ уровней в стеке.
      // Если какой-то уровень говорит "ignore", значит пропускаем.
      let isIgnored = false;
      for (const { dir, ig } of nextStack) {
        let relPath = path.relative(dir, absPath);
        relPath = relPath.split(path.sep).join("/");

        if (entry.isDirectory() && !relPath.endsWith("/")) {
          relPath += "/";
        }

        if (ig.ignores(relPath)) {
          isIgnored = true;
          break;
        }
      }

      if (isIgnored) continue;

      // --- Рекурсия или добавление ---
      if (entry.isDirectory()) {
        walkDir(absPath, nextStack);
      } else if (entry.isFile()) {
        // Для результата нам нужен путь относительно корня запуска
        const relFromRoot = path
          .relative(root, absPath)
          .split(path.sep)
          .join("/");
        files.push({ relPath: relFromRoot, absPath });
      }
    }
  }

  walkDir(root, initialStack);
  return files;
}

module.exports = {
  walk,
};
