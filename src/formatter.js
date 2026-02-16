const os = require("os");

/**
 * Собираем финальный текст из файлов и (опционально) преамбулы.
 */
function makeSafeFence(content) {
  const matches = content.match(/`+/g) || [];
  let longestRun = 0;

  for (const m of matches) {
    if (m.length > longestRun) longestRun = m.length;
  }

  return "`".repeat(Math.max(3, longestRun + 1));
}

function formatSnapshot({ root, files, preambleText }) {
  const parts = [];

  if (preambleText) {
    parts.push(preambleText.trimEnd(), "\n\n");
  }

  parts.push(`# codemap snapshot of ${root}\n`, `# files: ${files.length}\n\n`);

  for (const file of files) {
    const { relPath, lang, content } = file;

    if (!content) {
      continue;
    }

    const fence = makeSafeFence(content);
    let block = `# file: ${relPath}\n${fence}${lang}\n`;
    block += content.replace(/\r\n/g, "\n");
    if (!block.endsWith("\n")) {
      block += "\n";
    }
    block += `${fence}\n\n`;

    parts.push(block);
  }

  return parts.join("");
}

module.exports = {
  formatSnapshot,
};
