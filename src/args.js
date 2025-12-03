function printHelp() {
  console.log(`
    codemap - snapshot repo into a single text file.

    Usage:
      codemap [path] [-o output.txt] [-p preamble.txt]

    Options:
      path             Путь к каталогу (по умолчанию .)
      -o, --output     Файл вывода (по умолчанию output.txt, "-" = stdout)
      -p, --preamble   Файл-преамбула, содержимое вставляется в начало
      -h, --help       Показать эту справку
  `);
}

function parseArgs(argv) {
  let target = ".";
  let output = "output.txt";
  let preamble = null;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (!arg.startsWith("-") && target === ".") {
      target = arg;
      continue;
    }

    if (arg === "-o" || arg === "--output") {
      output = argv[++i];
    } else if (arg === "-p" || arg === "--preamble") {
      preamble = argv[++i];
    } else if (arg === "-h" || arg === "--help") {
      printHelp();
      return { showHelp: true };
    }
  }

  return { target, output, preamble, showHelp: false };
}

module.exports = {
  parseArgs,
  printHelp,
};
