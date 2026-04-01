function printHelp() {
  console.log(`
    codemap - snapshot repo into a single text file.

    Usage:
      codemap [path] [-o output.txt] [-p preamble.txt] [--allow-secrets] [-v]

    Options:
      path             Путь к каталогу (по умолчанию .)
      -o, --output     Файл вывода (по умолчанию output.txt, "-" = stdout)
      -p, --preamble   Файл-преамбула, содержимое вставляется в начало
      --allow-secrets  Отключить встроенный denylist секретов (.env, id_rsa, *.pem и др.)
      -v, --version    Показать текущую версию
      -h, --help       Показать эту справку
  `);
}

class ArgsError extends Error {
  constructor(message) {
    super(message);
    this.name = "ArgsError";
  }
}

function readOptionValue(argv, index, optionName) {
  const nextValue = argv[index + 1];

  if (nextValue === undefined) {
    throw new ArgsError(`missing value for ${optionName}`);
  }

  if (nextValue.startsWith("-") && nextValue !== "-") {
    throw new ArgsError(`missing value for ${optionName}`);
  }

  return nextValue;
}

function parseArgs(argv) {
  let target = ".";
  let output = "output.txt";
  let preamble = null;
  let allowSecrets = false;
  let showVersion = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (!arg.startsWith("-") && target === ".") {
      target = arg;
      continue;
    }

    if (arg === "-o" || arg === "--output") {
      output = readOptionValue(argv, i, arg);
      i += 1;
    } else if (arg === "-p" || arg === "--preamble") {
      preamble = readOptionValue(argv, i, arg);
      i += 1;
    } else if (arg === "--allow-secrets") {
      allowSecrets = true;
    } else if (arg === "-v" || arg === "--version") {
      showVersion = true;
    } else if (arg === "-h" || arg === "--help") {
      return { showHelp: true };
    } else if (arg.startsWith("-")) {
      throw new ArgsError(`unknown option: ${arg}`);
    }
  }

  return {
    target,
    output,
    preamble,
    allowSecrets,
    showHelp: false,
    showVersion,
  };
}

module.exports = {
  ArgsError,
  parseArgs,
  printHelp,
};
