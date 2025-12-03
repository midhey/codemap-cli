const fs = require("fs");
const path = require("path");
const { parseArgs, printHelp } = require("./args");
const { loadIgnore } = require("./ignore");
const { walk } = require("./walk");
const { readTextFileOrNull, extToLang } = require("./fileUtils");
const { formatSnapshot } = require("./formatter");

function run() {
  const args = parseArgs(process.argv.slice(2));

  if (args.showHelp) {
    printHelp();
    return;
  }

  const root = path.resolve(process.cwd(), args.target);

  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    console.error(`codemap: path is not a directory: ${root}`);
    process.exit(1);
  }

  const ig = loadIgnore(root);
  const fileEntries = walk(root, ig).sort((a, b) =>
    a.relPath.localeCompare(b.relPath),
  );

  let preambleText = null;
  if (args.preamble) {
    const preamblePath = path.resolve(process.cwd(), args.preamble);
    if (fs.existsSync(preamblePath)) {
      preambleText = fs.readFileSync(preamblePath, "utf8");
    } else {
      console.error(`codemap: preamble file not found: ${preamblePath}`);
    }
  }

  const filesWithContent = fileEntries
    .map(({ relPath, absPath }) => {
      const content = readTextFileOrNull(absPath);
      if (content === null) {
        return null;
      }
      const lang = extToLang(relPath);
      return { relPath, lang, content };
    })
    .filter(Boolean);

  const outputText = formatSnapshot({
    root,
    files: filesWithContent,
    preambleText,
  });

  if (args.output === "-") {
    process.stdout.write(outputText);
  } else {
    const outPath = path.resolve(process.cwd(), args.output);
    fs.writeFileSync(outPath, outputText, "utf8");
    console.error(
      `codemap: wrote ${filesWithContent.length} text files to ${outPath}`,
    );
  }
}

module.exports = {
  run,
};
