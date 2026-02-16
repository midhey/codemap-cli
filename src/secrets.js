const path = require("path");

const DEFAULT_SECRET_BASENAMES = [
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
  ".env.test",
  "id_rsa",
  "id_dsa",
  "id_ecdsa",
  "id_ed25519",
];

const DEFAULT_SECRET_EXTENSIONS = [".pem", ".key", ".p12", ".pfx"];

function toLowerSet(values) {
  const out = new Set();
  for (const value of values || []) {
    if (typeof value === "string" && value.trim() !== "") {
      out.add(value.toLowerCase());
    }
  }
  return out;
}

function buildSecretDenylist(extra = {}) {
  const basenameSet = toLowerSet(DEFAULT_SECRET_BASENAMES);
  const extensionSet = toLowerSet(DEFAULT_SECRET_EXTENSIONS);

  for (const name of extra.basenames || []) {
    basenameSet.add(name.toLowerCase());
  }

  for (let ext of extra.extensions || []) {
    ext = ext.toLowerCase();
    if (!ext.startsWith(".")) ext = `.${ext}`;
    extensionSet.add(ext);
  }

  return {
    basenames: basenameSet,
    extensions: extensionSet,
  };
}

function isSecretPath(filePath, denylist) {
  const basename = path.basename(filePath).toLowerCase();
  if (denylist.basenames.has(basename)) {
    return true;
  }

  const ext = path.extname(basename).toLowerCase();
  if (ext && denylist.extensions.has(ext)) {
    return true;
  }

  return false;
}

module.exports = {
  DEFAULT_SECRET_BASENAMES,
  DEFAULT_SECRET_EXTENSIONS,
  buildSecretDenylist,
  isSecretPath,
};
