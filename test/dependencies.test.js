const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

function hasVersionRange(version) {
  return /^[\^~<>*=]/.test(version);
}

test("dependencies are pinned in package.json (no ranges)", () => {
  const packageJsonPath = path.join(__dirname, "..", "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const deps = packageJson.dependencies || {};

  for (const [name, version] of Object.entries(deps)) {
    assert.equal(
      hasVersionRange(version),
      false,
      `Dependency "${name}" must be pinned, got "${version}"`,
    );
  }
});

test("package-lock root dependency matches pinned ignore version", () => {
  const packageLockPath = path.join(__dirname, "..", "package-lock.json");
  const packageLock = JSON.parse(fs.readFileSync(packageLockPath, "utf8"));
  const rootDeps = packageLock.packages?.[""]?.dependencies || {};

  assert.equal(rootDeps.ignore, "7.0.5");
});
