const fs = require("fs");
const path = require("path");
const { loadIgnoreForDir } = require("./ignore");
const { buildSecretDenylist, isSecretPath } = require("./secrets");

/**
 * Рекурсивный обход дерева с поддержкой вложенных ignore-файлов.
 * @param {string} root - Абсолютный путь к корню сканирования
 * @param {string|null} outputFileAbs - Абсолютный путь к файлу вывода (чтобы исключить его)
 * @param {object} [options]
 * @param {boolean} [options.allowSecrets=false]
 * @param {object} [options.secretDenylist]
 * @param {string[]} [options.secretDenylist.basenames]
 * @param {string[]} [options.secretDenylist.extensions]
 */
function walk(root, outputFileAbs, options = {}) {
  const files = [];
  const allowSecrets = options.allowSecrets === true;
  const secretDenylist = buildSecretDenylist(options.secretDenylist);
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

  function shouldIgnore(absPath, isDirectory, ignoreStack) {
    let ignored = false;

    for (const { dir, ig } of ignoreStack) {
      let relPath = path.relative(dir, absPath);
      relPath = relPath.split(path.sep).join("/");
      if (isDirectory && !relPath.endsWith("/")) {
        relPath += "/";
      }

      const result = ig.test(relPath);
      if (result.ignored) {
        ignored = true;
      } else if (result.unignored) {
        ignored = false;
      }
    }

    return ignored;
  }

  const dirStack = [{ dir: root, ignoreStack: initialStack }];
  while (dirStack.length > 0) {
    const { dir: currentAbsDir, ignoreStack } = dirStack.pop();

    let entries;
    try {
      entries = fs.readdirSync(currentAbsDir, { withFileTypes: true });
    } catch (e) {
      console.warn(
        `codemap: warning reading dir ${currentAbsDir}: ${e.message}`,
      );
      continue;
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

      const isDirectory = entry.isDirectory();
      const isFile = entry.isFile();

      // --- Проверка 2.5: Секреты по denylist ---
      if (isFile && !allowSecrets && isSecretPath(absPath, secretDenylist)) {
        continue;
      }

      // --- Проверка 3: Проход по стеку игноров ---
      if (shouldIgnore(absPath, isDirectory, nextStack)) {
        continue;
      }

      if (isDirectory) {
        dirStack.push({ dir: absPath, ignoreStack: nextStack });
      } else if (isFile) {
        // Для результата нам нужен путь относительно корня запуска
        const relFromRoot = path
          .relative(root, absPath)
          .split(path.sep)
          .join("/");
        files.push({ relPath: relFromRoot, absPath });
      }
    }
  }

  return files;
}

module.exports = {
  walk,
};
