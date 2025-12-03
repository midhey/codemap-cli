const test = require("node:test");
const assert = require("node:assert/strict");
const { parseArgs } = require("../src/args");

test("parseArgs: default values when no args", () => {
  const res = parseArgs([]);
  assert.equal(res.target, ".");
  assert.equal(res.output, "output.txt");
  assert.equal(res.preamble, null);
  assert.equal(res.showHelp, false);
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
