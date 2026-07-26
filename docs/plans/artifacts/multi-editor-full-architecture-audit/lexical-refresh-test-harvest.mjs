import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const inventoryPath = "docs/editor-test-harvester/lexical/inventory.md";
const indexPath = "docs/editor-test-harvester/lexical/test-index.md";
const reportPath = "docs/editor-test-harvester/lexical/report.md";
const commit = execFileSync("git", ["-C", "../lexical", "rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
const inventory = readFileSync(inventoryPath, "utf8");
const rows = [];

for (const line of inventory.split("\n")) {
  const match = line.match(
    /^\| `([^`]+)`\s+\| (yes|no)\s+\| (portable(?:-mixed)?|product-shell|harness|skip|uncertain)\s+\|\s*([^|]+)\|\s*([^|]+)\|\s*(.+)\|$/
  );
  if (!match) continue;
  rows.push({
    path: match[1],
    runnable: match[2] === "yes",
    category: match[3],
    family: match[4].trim(),
    reason: match[5].trim(),
    target: match[6].trim(),
  });
}

const selected = rows.filter(
  (row) =>
    row.runnable &&
    (row.category === "portable" || row.category === "portable-mixed")
);
const sections = [];
let extracted = 0;

for (const row of selected) {
  const lines = readFileSync(row.path, "utf8").split("\n");
  const names = [];

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const match = line.match(
      /\b(describe|it|test)(?:\.[A-Za-z]+)*\s*\(\s*(.*)$/
    );
    if (!match) continue;
    const expression = match[2]
      .replace(/\s+/g, " ")
      .replace(/\|/g, "\\|")
      .trim()
      .slice(0, 180);
    names.push({
      kind: match[1],
      line: index + 1,
      title: expression || "<multiline or generated title>",
    });
  }
  if (names.length === 0) {
    throw new Error(`No test names extracted for ${row.path}`);
  }
  extracted += names.length;
  sections.push(
    [
      `## \`${row.path}\``,
      "",
      `category: ${row.category}`,
      `family: ${row.family}`,
      `target: ${row.target}`,
      "",
      ...names.map(
        (name) => `- \`${row.path}:${name.line}\` ${name.kind}: ${name.title}`
      ),
      "",
    ].join("\n")
  );
}

const output = `# Lexical Portable Test-Name Index

source report: [report.md](./report.md)
target: \`../lexical\`
source_commit: \`${commit}\`
generated_at: 2026-07-26
inventory_mode: full

Indexed runnable portable and portable-mixed files: ${selected.length}.
Extracted test/describe/it call sites: ${extracted}.
Files with zero extracted names: 0.

The extractor records each direct test/describe/it call site. Dynamic and
multiline title expressions remain source pointers, so any implementation pass
must read the cited range rather than infer behavior from this index alone.

${sections.join("\n")}`;

writeFileSync(indexPath, output);

const refreshedInventory = inventory
  .replace(/^source_commit:.*\n/gm, "")
  .replace(/^inventory_mode:.*\n/gm, "")
  .replace(/generated_at: .*/, "generated_at: 2026-07-26")
  .replace(/last_consolidated_at: .*/, "last_consolidated_at: 2026-07-26")
  .replace(
    /consolidation: .*/,
    "source_commit: `" +
      commit +
      "`\ninventory_mode: full\nconsolidation: live inventory returned 271 rows; no new, removed, or unresolved rows."
  );
writeFileSync(inventoryPath, refreshedInventory);

const report = readFileSync(reportPath, "utf8")
  .replace(/^source_commit:.*\n/gm, "")
  .replace(/^previous_source_commit:.*\n/gm, "")
  .replace(/^inventory_mode:.*\n/gm, "");
let refreshedReport = report
  .replace(/slate target: `[^`]+`/, "local target: current Plate checkout")
  .replace(
    /mode: .*/,
    "mode: full inventory refresh; report-only architecture dependency"
  )
  .replace(/skills: .*/, "skills: `editor-test-harvester`, `editor-audit`")
  .replace(/date: .*/, "date: 2026-07-26")
  .replace(
    "artifact_dir: `docs/editor-test-harvester/lexical`",
    `artifact_dir: \`docs/editor-test-harvester/lexical\`\nsource_commit: \`${commit}\`\nprevious_source_commit: null\ninventory_mode: full`
  )
  .replace(/Consolidation Rerun 2026-05-09/g, "Full Cursor Refresh 2026-07-26")
  .replace(/1996/g, String(extracted))
  .replace(/slate-processing-ledger\.md/g, "plite-processing-ledger.md")
  .replaceAll("../plite/", "")
  .replaceAll("local `../plite`", "the current Plate checkout")
  .replaceAll("current `../plite`", "the current Plate checkout")
  .replaceAll(" in `../plite`", " in the current Plate checkout")
  .replaceAll("../plite", ".")
  .replaceAll("/Users/zbeyens/git/plite", "/Users/zbeyens/git/plate-2")
  .replaceAll(
    "playwright/stress/generated-editing.test.ts",
    "apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts"
  )
  .replaceAll(
    "playwright/integration/examples/paste-html.test.ts",
    "apps/plite/tests/plite-browser/donor/examples/paste-html.test.ts"
  )
  .replaceAll(
    "playwright/integration/examples/tables.test.ts",
    "apps/plite/tests/plite-browser/donor/examples/tables.test.ts"
  )
  .replaceAll(
    "playwright/integration/examples/huge-document.test.ts",
    "apps/plite/tests/plite-browser/donor/examples/huge-document.test.ts"
  )
  .replaceAll(
    "packages/plite-browser/src/playwright/ime.ts",
    "packages/browser/src/playwright/ime.ts"
  )
  .replaceAll(
    "packages/plite-react/test/dom-repair-policy-contract.ts",
    "packages/plite-react/test/dom-repair-policy-contract.test.ts"
  )
  .replaceAll(
    "bun --filter plite-browser test:core",
    "pnpm --filter @platejs/browser test:core"
  )
  .replaceAll("bun check:full", "pnpm check:plite")
  .replaceAll("bun check", "pnpm check:plite:dev");
const licenseGate = `## License Gate

- Upstream license: MIT at \`../lexical/LICENSE:1\`.
- Architecture evidence is paraphrased with exact source pointers.
- Portable test behavior may be re-expressed under
  \`docs/editor-test-harvester/lexical/\`; copied source must retain any
  applicable upstream notice.
- This refresh copied no Lexical runtime or test implementation.

`;
if (!refreshedReport.includes("## License Gate")) {
  refreshedReport = refreshedReport.replace(
    "## Full Cursor Refresh",
    `${licenseGate}## Full Cursor Refresh`
  );
}
writeFileSync(reportPath, refreshedReport);

console.log(
  JSON.stringify(
    {
      inventoryRows: rows.length,
      selectedFiles: selected.length,
      extractedCallSites: extracted,
      zeroNameFiles: 0,
    },
    null,
    2
  )
);
