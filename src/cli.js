const fs = require("fs");
const path = require("path");
const { parseArgs, printHelp } = require("./args");
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

  let outPathAbs = null;
  if (args.output !== "-") {
    outPathAbs = path.resolve(process.cwd(), args.output);
  }

  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    console.error(`codemap: path is not a directory: ${root}`);
    process.exit(1);
  }

  console.log(`codemap: scanning ${root}...`);

  const fileEntries = walk(root, outPathAbs).sort((a, b) =>
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
      try {
        const content = readTextFileOrNull(absPath);
        if (content === null) return null;
        const lang = extToLang(relPath);
        return { relPath, lang, content };
      } catch (err) {
        console.warn(
          `codemap: skipping file ${relPath} due to error: ${err.message}`,
        );
        return null;
      }
    })
    .filter(Boolean);

  const outputText = formatSnapshot({
    root,
    files: filesWithContent,
    preambleText,
  });

  const totalChars = outputText.length;
  const estTokens = Math.ceil(totalChars / 4);

  if (args.output === "-") {
    process.stdout.write(outputText);
  } else {
    fs.writeFileSync(outPathAbs, outputText, "utf8");
    console.log(`codemap: success!`);
    console.log(`  Files:  ${filesWithContent.length}`);
    console.log(`  Size:   ${(totalChars / 1024).toFixed(1)} KB`);
    console.log(`  Tokens: ~${estTokens.toLocaleString()} (estimate)`);
    console.log(`  Output: ${outPathAbs}`);
  }
}

module.exports = {
  run,
};
