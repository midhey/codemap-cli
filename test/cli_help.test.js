const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const { spawnSync } = require("node:child_process");
const packageJson = require("../package.json");

test("cli: --help prints usage once", () => {
  const binPath = path.join(__dirname, "..", "bin", "codemap.js");
  const res = spawnSync(process.execPath, [binPath, "--help"], {
    encoding: "utf8",
  });

  assert.equal(res.status, 0);
  assert.equal(res.stderr, "");

  const usageMatches = res.stdout.match(/Usage:/g) || [];
  assert.equal(usageMatches.length, 1);
});

test("cli: --version prints version without scanning", () => {
  const binPath = path.join(__dirname, "..", "bin", "codemap.js");
  const res = spawnSync(process.execPath, [binPath, "--version"], {
    encoding: "utf8",
  });

  assert.equal(res.status, 0);
  assert.equal(res.stderr, "");
  assert.equal(res.stdout.trim(), packageJson.version);
  assert.equal(res.stdout.includes("scanning"), false);
});
