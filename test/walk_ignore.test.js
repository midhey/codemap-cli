const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { loadIgnore } = require("../src/ignore");
const { walk } = require("../src/walk");

test("walk respects .codemapignore patterns", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "codemap-test-"));

  // Структура:
  // tmpDir/
  //   .codemapignore  -> logs/ и секретный файл
  //   a.txt
  //   logs/
  //     log.txt
  //   secret.txt
  //   src/
  //     index.js
  //
  fs.writeFileSync(
    path.join(tmpDir, ".codemapignore"),
    ["logs/", "secret.txt"].join("\n"),
    "utf8",
  );

  fs.writeFileSync(path.join(tmpDir, "a.txt"), "hello", "utf8");
  fs.mkdirSync(path.join(tmpDir, "logs"));
  fs.writeFileSync(path.join(tmpDir, "logs", "log.txt"), "log", "utf8");
  fs.writeFileSync(path.join(tmpDir, "secret.txt"), "shhh", "utf8");

  fs.mkdirSync(path.join(tmpDir, "src"));
  fs.writeFileSync(
    path.join(tmpDir, "src", "index.js"),
    "console.log(1);",
    "utf8",
  );

  const ig = loadIgnore(tmpDir);
  const files = walk(tmpDir, ig);

  const relPaths = files.map((f) => f.relPath).sort();

  assert.deepEqual(relPaths, ["a.txt", "src/index.js"]);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});
