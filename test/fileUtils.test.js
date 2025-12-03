const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { readTextFileOrNull, extToLang } = require("../src/fileUtils");

test("extToLang: maps known extensions correctly", () => {
  assert.equal(extToLang("index.js"), "javascript");
  assert.equal(extToLang("file.ts"), "ts");
  assert.equal(extToLang("Comp.vue"), "vue");
  assert.equal(extToLang("script.php"), "php");
  assert.equal(extToLang("style.scss"), "css");
  assert.equal(extToLang("config.yaml"), "yaml");
  assert.equal(extToLang("README.md"), "md");
  assert.equal(extToLang("data.json"), "json");
  assert.equal(extToLang("plain"), "");
});

test("extToLang: falls back to ext name", () => {
  assert.equal(extToLang("main.go"), "go");
  assert.equal(extToLang("schema.sql"), "sql");
});

test("readTextFileOrNull: reads UTF-8 text with Russian characters", (t) => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "codemap-test-"));
  const filePath = path.join(tmpDir, "text.txt");
  const content = "Привет, мир!\nЭто тестовый файл.\n";

  fs.writeFileSync(filePath, content, "utf8");

  const read = readTextFileOrNull(filePath);
  assert.equal(read, content);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test("readTextFileOrNull: returns null for binary-like data", (t) => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "codemap-test-"));
  const filePath = path.join(tmpDir, "bin.dat");

  const buf = Buffer.from([0, 1, 2, 3, 4, 5]);
  fs.writeFileSync(filePath, buf);

  const read = readTextFileOrNull(filePath);
  assert.equal(read, null);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});
