const fs = require("fs");
const path = require("path");
const ignore = require("ignore");

function loadIgnore(root) {
  const ig = ignore();

  ig.add([".git/", ".hg/", ".svn/", "node_modules/"]);

  const ignoreFiles = [
    ".gptignore",
    ".codemapignore",
    ".gitignore",
    ".dockerignore",
  ];

  for (const fname of ignoreFiles) {
    const full = path.join(root, fname);
    if (fs.existsSync(full)) {
      const text = fs.readFileSync(full, "utf8");
      ig.add(text.split(/\r?\n/));
    }
  }

  return ig;
}

module.exports = {
  loadIgnore,
};
