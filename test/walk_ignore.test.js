const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { walk } = require("../src/walk");

test("walk respects nested .gitignore", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "codemap-nested-"));

  // Структура:
  // /root
  //   .gitignore  (ignores "node_modules")
  //   main.js
  //   /subdir
  //     .gitignore (ignores "temp.js")
  //     keep.js
  //     temp.js

  fs.writeFileSync(path.join(tmpDir, ".gitignore"), "node_modules", "utf8");
  fs.writeFileSync(path.join(tmpDir, "main.js"), "...", "utf8");

  fs.mkdirSync(path.join(tmpDir, "subdir"));
  fs.writeFileSync(
    path.join(tmpDir, "subdir", ".gitignore"),
    "temp.js",
    "utf8",
  );
  fs.writeFileSync(path.join(tmpDir, "subdir", "keep.js"), "...", "utf8");
  fs.writeFileSync(path.join(tmpDir, "subdir", "temp.js"), "...", "utf8");

  const outPath = path.join(tmpDir, "output.txt");
  fs.writeFileSync(outPath, "OLD CONTENT", "utf8");

  const files = walk(tmpDir, outPath);
  const relPaths = files.map((f) => f.relPath).sort();

  assert.deepEqual(relPaths, ["main.js", "subdir/keep.js"]);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test("walk respects nested negation rules (!pattern) from child .gitignore", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "codemap-negation-"));

  fs.writeFileSync(path.join(tmpDir, ".gitignore"), "subdir/*\n", "utf8");
  fs.mkdirSync(path.join(tmpDir, "subdir"));
  fs.writeFileSync(path.join(tmpDir, "subdir", ".gitignore"), "!keep.js\n", "utf8");
  fs.writeFileSync(path.join(tmpDir, "subdir", "keep.js"), "ok", "utf8");
  fs.writeFileSync(path.join(tmpDir, "subdir", "drop.js"), "no", "utf8");

  const files = walk(tmpDir, null);
  const relPaths = files.map((f) => f.relPath).sort();

  assert.deepEqual(relPaths, ["subdir/keep.js"]);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test("walk handles deep directory trees without recursive overflow", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "codemap-deep-"));

  let current = tmpDir;
  const depth = 220;
  for (let i = 0; i < depth; i++) {
    current = path.join(current, "d");
    fs.mkdirSync(current);
  }
  fs.writeFileSync(path.join(current, "leaf.js"), "console.log('leaf')\n", "utf8");

  const files = walk(tmpDir, null);
  const relPaths = files.map((f) => f.relPath);

  assert.equal(relPaths.length, 1);
  assert.ok(relPaths[0].endsWith("/leaf.js"));

  fs.rmSync(tmpDir, { recursive: true, force: true });
});
