const test = require("node:test");
const assert = require("node:assert/strict");
const { formatSnapshot } = require("../src/formatter");

test("formatSnapshot: includes header, preamble and file blocks", () => {
  const preambleText = "Это преамбула";
  const root = "/path/to/repo";
  const files = [
    {
      relPath: "src/index.js",
      lang: "javascript",
      content: 'console.log("hello");\n',
    },
  ];

  const output = formatSnapshot({ root, files, preambleText });

  assert.ok(output.includes("Это преамбула"));
  assert.ok(output.includes("# codemap snapshot of /path/to/repo"));
  assert.ok(output.includes("# file: src/index.js"));
  assert.ok(output.includes("```javascript"));
  assert.ok(output.includes('console.log("hello");'));
  assert.ok(output.includes("```"));
});
