const os = require("os");

/**
 * Собираем финальный текст из файлов и (опционально) преамбулы.
 */
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

    let block = `# file: ${relPath}\n\`\`\`${lang}\n`;
    block += content.replace(/\r\n/g, "\n");
    if (!block.endsWith("\n")) {
      block += "\n";
    }
    block += "```\n\n";

    parts.push(block);
  }

  return parts.join("");
}

module.exports = {
  formatSnapshot,
};
