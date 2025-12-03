const fs = require("fs");
const path = require("path");

/**
 * Примитивная проверка на бинарность:
 * если встречаем нулевой байт — считаем файл бинарным.
 * Иначе читаем как UTF-8 (русские символы ок).
 */
function readTextFileOrNull(absPath) {
  const buf = fs.readFileSync(absPath);
  const len = Math.min(buf.length, 8000);

  for (let i = 0; i < len; i++) {
    const byte = buf[i];
    if (byte === 0) {
      return null;
    }
  }

  return buf.toString("utf8");
}

/**
 * Определяем язык для code fence по расширению.
 */
function extToLang(relPath) {
  const ext = path.extname(relPath).slice(1).toLowerCase();
  if (!ext) return "";

  switch (ext) {
    case "js":
    case "cjs":
    case "mjs":
      return "javascript";
    case "ts":
      return "ts";
    case "vue":
      return "vue";
    case "php":
      return "php";
    case "py":
      return "python";
    case "md":
      return "md";
    case "json":
      return "json";
    case "yml":
    case "yaml":
      return "yaml";
    case "html":
    case "htm":
      return "html";
    case "css":
    case "scss":
    case "sass":
      return "css";
    default:
      return ext;
  }
}

module.exports = {
  readTextFileOrNull,
  extToLang,
};
