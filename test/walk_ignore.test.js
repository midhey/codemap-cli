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
