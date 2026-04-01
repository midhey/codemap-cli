const test = require("node:test");
const assert = require("node:assert/strict");
const { ArgsError, parseArgs } = require("../src/args");

test("parseArgs: default values when no args", () => {
  const res = parseArgs([]);
  assert.equal(res.target, ".");
  assert.equal(res.output, "output.txt");
  assert.equal(res.preamble, null);
  assert.equal(res.allowSecrets, false);
  assert.equal(res.showHelp, false);
  assert.equal(res.showVersion, false);
});

test("parseArgs: positional path sets target", () => {
  const res = parseArgs(["./frontend"]);
  assert.equal(res.target, "./frontend");
});

test("parseArgs: -o and -p options", () => {
  const res = parseArgs([".", "-o", "foo.txt", "--preamble", "pre.txt"]);
  assert.equal(res.target, ".");
  assert.equal(res.output, "foo.txt");
  assert.equal(res.preamble, "pre.txt");
});

test("parseArgs: --help flag", () => {
  const res = parseArgs(["--help"]);
  assert.equal(res.showHelp, true);
});

test("parseArgs: --help does not print output", () => {
  const originalLog = console.log;
  let calls = 0;
  console.log = () => {
    calls += 1;
  };

  try {
    parseArgs(["--help"]);
  } finally {
    console.log = originalLog;
  }

  assert.equal(calls, 0);
});

test("parseArgs: --allow-secrets enables secrets inclusion", () => {
  const res = parseArgs([".", "--allow-secrets"]);
  assert.equal(res.allowSecrets, true);
});

test("parseArgs: --version flag", () => {
  const res = parseArgs(["--version"]);
  assert.equal(res.showVersion, true);
});

test("parseArgs: -v flag", () => {
  const res = parseArgs(["-v"]);
  assert.equal(res.showVersion, true);
});

test("parseArgs: missing value for -o throws ArgsError", () => {
  assert.throws(
    () => parseArgs([".", "-o"]),
    (error) => {
      assert.ok(error instanceof ArgsError);
      assert.equal(error.message, "missing value for -o");
      return true;
    },
  );
});

test("parseArgs: missing value for --preamble when next token is a flag", () => {
  assert.throws(
    () => parseArgs([".", "--preamble", "--version"]),
    (error) => {
      assert.ok(error instanceof ArgsError);
      assert.equal(error.message, "missing value for --preamble");
      return true;
    },
  );
});

test("parseArgs: unknown flags are rejected", () => {
  assert.throws(
    () => parseArgs(["--unknown-flag"]),
    (error) => {
      assert.ok(error instanceof ArgsError);
      assert.equal(error.message, "unknown option: --unknown-flag");
      return true;
    },
  );
});
