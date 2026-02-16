const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { walk } = require("../src/walk");

test("walk: blocks secret files by default (.env, id_rsa, *.pem)", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "codemap-secrets-"));

  fs.writeFileSync(path.join(tmpDir, ".env"), "DB_PASSWORD=secret", "utf8");
  fs.writeFileSync(path.join(tmpDir, "id_rsa"), "PRIVATE KEY", "utf8");
  fs.writeFileSync(path.join(tmpDir, "cert.pem"), "-----BEGIN CERTIFICATE-----", "utf8");
  fs.writeFileSync(path.join(tmpDir, "safe.js"), "console.log('ok')", "utf8");

  const files = walk(tmpDir, null);
  const relPaths = files.map((f) => f.relPath).sort();

  assert.deepEqual(relPaths, ["safe.js"]);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test("walk: --allow-secrets behavior via option includes secret files", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "codemap-secrets-"));

  fs.writeFileSync(path.join(tmpDir, ".env"), "TOKEN=abc", "utf8");
  fs.writeFileSync(path.join(tmpDir, "id_rsa"), "PRIVATE KEY", "utf8");
  fs.writeFileSync(path.join(tmpDir, "bundle.pem"), "pem content", "utf8");
  fs.writeFileSync(path.join(tmpDir, "safe.js"), "console.log('ok')", "utf8");

  const files = walk(tmpDir, null, { allowSecrets: true });
  const relPaths = files.map((f) => f.relPath).sort();

  assert.deepEqual(relPaths, [".env", "bundle.pem", "id_rsa", "safe.js"]);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test("walk: denylist can be extended with custom basenames/extensions", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "codemap-secrets-"));

  fs.writeFileSync(path.join(tmpDir, "safe.js"), "console.log('ok')", "utf8");
  fs.writeFileSync(path.join(tmpDir, "local.secret"), "shh", "utf8");
  fs.writeFileSync(path.join(tmpDir, "tls.crt"), "crt", "utf8");

  const files = walk(tmpDir, null, {
    secretDenylist: {
      basenames: ["local.secret"],
      extensions: [".crt"],
    },
  });
  const relPaths = files.map((f) => f.relPath).sort();

  assert.deepEqual(relPaths, ["safe.js"]);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});
