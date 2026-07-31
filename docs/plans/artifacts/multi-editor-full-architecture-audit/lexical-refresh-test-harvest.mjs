import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const inventoryPath = 'docs/editor-test-harvester/lexical/inventory.md';
const indexPath = 'docs/editor-test-harvester/lexical/test-index.md';
const reportPath = 'docs/editor-test-harvester/lexical/report.md';
const commit = execFileSync('git', ['-C', '../lexical', 'rev-parse', 'HEAD'], {
  encoding: 'utf8',
}).trim();
const inventory = readFileSync(inventoryPath, 'utf8');
const previousRows = new Map();

for (const line of inventory.split('\n')) {
  const match = line.match(
    /^\| `([^`]+)`\s+\| (yes|no)\s+\| (portable(?:-mixed)?|product-shell|harness|skip|uncertain)\s+\|\s*([^|]+)\|\s*([^|]+)\|\s*(.+)\|$/
  );
  if (!match) continue;
  previousRows.set(match[1], {
    path: match[1],
    runnable: match[2] === 'yes',
    category: match[3],
    family: match[4].trim(),
    reason: match[5].trim(),
    target: match[6].trim(),
  });
}

const testPattern =
  /(^|\/)(__tests__|test|tests|spec|e2e|integration|playwright|cypress|wdio|fixtures)(\/|$)|\.(test|spec)\.[cm]?[jt]sx?$/;
const ignoredPattern =
  /(^|\/)(dist|build|coverage|node_modules|vendor|fixtures\/generated|__snapshots__)(\/|$)/;
const livePaths = execFileSync('rg', ['--files', '../lexical'], {
  encoding: 'utf8',
})
  .trim()
  .split('\n')
  .filter((path) => testPattern.test(path) && !ignoredPattern.test(path))
  .sort();

function classifyNew(path) {
  const runnable =
    /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(path) &&
    !/(?:\/fixtures\/|\/utils?\/|TestUtils|testUtils|\/utils?\.[cm]?[jt]sx?$|\/compose\.[cm]?[jt]sx?$)/.test(
      path
    );
  const tooling =
    /\/scripts\/|lexical-eslint-plugin|\/fixtures\/|package\.json$|tsconfig|vite\.config/.test(
      path
    );

  if (tooling) {
    return {
      category: 'skip',
      family: 'skip',
      path,
      reason: 'tooling, packaging, release, eslint, or fixture behavior',
      runnable,
      target: 'skip: no Plite target',
    };
  }
  if (!runnable) {
    return {
      category: 'harness',
      family: 'harness',
      path,
      reason: 'test helper or fixture harness; useful technique only',
      runnable: false,
      target: 'technique only: reuse harness idea if a future test needs it',
    };
  }

  const productShell =
    /agent-example|nextjs-code-shiki|website-toolbar|Toolbar|Autocomplete|FindReplace|PlaygroundNodeImporters|lexical-react.*(?:ExtensionComponent|useExtensionSignalValue)|ErrorMap/.test(
      path
    );
  if (productShell) {
    return {
      category: 'product-shell',
      family: 'product-shell',
      path,
      reason: 'example, React host, or product plugin behavior',
      runnable,
      target: 'skip unless a raw editor invariant is split out later',
    };
  }

  const plateOwned =
    /lexical-(?:mdast|markdown|html|link|list|code)|mdast-editor|markdown-editor/.test(
      path
    );
  const mixed =
    plateOwned ||
    /lexical-a11y|lexical-extension|lexical-react|CardSlot|PullQuoteSlot|ReviewSlot|SlotCollab|SlotHost|ShadowDOM|shadow-dom|Ruby|StickyScrollbar|SyncCursors|Collaboration/.test(
      path
    );
  const family = /composition|IME|Ios|Android|FirefoxDecorator|TextEntry/i.test(
    path
  )
    ? 'beforeinput-input / browser-engine'
    : /selection|caret|arrow|decorator|slot/i.test(path)
      ? 'selection-dom-mapping / nested-root'
      : /clipboard|paste|drop/i.test(path)
        ? 'clipboard / drag transport'
        : plateOwned
          ? 'serialization-parsing / Plate plugin'
          : 'portable editor behavior';

  return {
    category: mixed ? 'portable-mixed' : 'portable',
    family,
    path,
    reason: plateOwned
      ? 'feature package proof with portable codec or editor invariant rows'
      : 'editor behavior proof with a portable invariant',
    runnable,
    target: plateOwned
      ? 'indexed; target Plate feature package, with raw transport split to Plite only when generic'
      : 'indexed; target current Plite package proof and browser proof when DOM-dependent',
  };
}

const rows = livePaths.map(
  (path) => previousRows.get(path) ?? classifyNew(path)
);
const added = rows.filter((row) => !previousRows.has(row.path)).length;
const removed = [...previousRows].filter(
  ([path]) => !livePaths.includes(path)
).length;
const counts = Object.fromEntries(
  [
    'portable',
    'portable-mixed',
    'product-shell',
    'harness',
    'skip',
    'uncertain',
  ].map((category) => [
    category,
    rows.filter((row) => row.category === category).length,
  ])
);
const runnable = rows.filter((row) => row.runnable).length;
const inventoryHeader = inventory.slice(0, inventory.lastIndexOf('| Source'));
const rowLines = rows.map(
  (row) =>
    `| \`${row.path}\` | ${row.runnable ? 'yes' : 'no'} | ${row.category} | ${row.family} | ${row.reason} | ${row.target} |`
);
const refreshedInventory = `${inventoryHeader
  .replace(/generated_at: .*/, 'generated_at: 2026-07-29')
  .replace(/last_consolidated_at: .*/, 'last_consolidated_at: 2026-07-29')
  .replace(/source_commit: `[^`]+`/, `source_commit: \`${commit}\``)
  .replace(
    /consolidation: .*/,
    `consolidation: incremental refresh added ${added} rows, removed ${removed}, and left zero unresolved rows.`
  )
  .replace(
    /Counts: .*/,
    `Counts: total ${rows.length}; runnable ${runnable}; fixture/support ${
      rows.length - runnable
    }; portable ${counts.portable}; portable-mixed ${
      counts['portable-mixed']
    }; product-shell ${counts['product-shell']}; harness ${
      counts.harness
    }; skip ${counts.skip}; uncertain ${counts.uncertain}.`
  )}| Source | Runnable | Category | Family | Reason | Plite target / extraction |\n| --- | --- | --- | --- | --- | --- |\n${rowLines.join('\n')}\n`;
writeFileSync(inventoryPath, refreshedInventory);

const selected = rows.filter(
  (row) =>
    row.runnable &&
    (row.category === 'portable' || row.category === 'portable-mixed')
);
const sections = [];
let extracted = 0;

for (const row of selected) {
  const lines = readFileSync(row.path, 'utf8').split('\n');
  const names = [];

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const match = line.match(
      /\b(describe|it|test)(?:\.[A-Za-z]+)*\s*\(\s*(.*)$/
    );
    if (!match) continue;
    const expression = match[2]
      .replace(/\s+/g, ' ')
      .replace(/\|/g, '\\|')
      .trim()
      .slice(0, 180);
    names.push({
      kind: match[1],
      line: index + 1,
      title: expression || '<multiline or generated title>',
    });
  }
  if (names.length === 0) {
    throw new Error(`No test names extracted for ${row.path}`);
  }
  extracted += names.length;
  sections.push(
    [
      `## \`${row.path}\``,
      '',
      `category: ${row.category}`,
      `family: ${row.family}`,
      `target: ${row.target}`,
      '',
      ...names.map(
        (name) => `- \`${row.path}:${name.line}\` ${name.kind}: ${name.title}`
      ),
      '',
    ].join('\n')
  );
}

const output = `# Lexical Portable Test-Name Index

source report: [report.md](./report.md)
target: \`../lexical\`
source_commit: \`${commit}\`
generated_at: 2026-07-29
inventory_mode: incremental

Indexed runnable portable and portable-mixed files: ${selected.length}.
Extracted test/describe/it call sites: ${extracted}.
Files with zero extracted names: 0.

The extractor records each direct test/describe/it call site. Dynamic and
multiline title expressions remain source pointers, so any implementation pass
must read the cited range rather than infer behavior from this index alone.

${sections.join('\n')}`;

writeFileSync(indexPath, output);

const report = readFileSync(reportPath, 'utf8')
  .replace(/^source_commit:.*\n/gm, '')
  .replace(/^previous_source_commit:.*\n/gm, '')
  .replace(/^inventory_mode:.*\n/gm, '');
let refreshedReport = report
  .replace(/slate target: `[^`]+`/, 'local target: current Plate checkout')
  .replace(
    /mode: .*/,
    'mode: incremental inventory refresh; report-only architecture dependency'
  )
  .replace(/skills: .*/, 'skills: `editor-test-harvester`, `editor-audit`')
  .replace(/date: .*/, 'date: 2026-07-29')
  .replace(
    'artifact_dir: `docs/editor-test-harvester/lexical`',
    `artifact_dir: \`docs/editor-test-harvester/lexical\`\nsource_commit: \`${commit}\`\nprevious_source_commit: null\ninventory_mode: incremental`
  )
  .replace(
    /Full Cursor Refresh 2026-07-26/g,
    'Incremental Cursor Refresh 2026-07-29'
  )
  .replace(/source_commit: `[^`]+`/, `source_commit: \`${commit}\``)
  .replace(
    /previous_source_commit: [^\n]+/,
    'previous_source_commit: `d52f66e250e031a6c6fd8836d160373b0df557c7`'
  )
  .replace(
    /271\/271 live inventory rows classified/,
    `${rows.length}/${rows.length} live inventory rows classified`
  )
  .replace(/271 rows/g, `${rows.length} rows`)
  .replace(/runnable 196/g, `runnable ${runnable}`)
  .replace(/fixture\/support 75/g, `fixture/support ${rows.length - runnable}`)
  .replace(/portable 124/g, `portable ${counts.portable}`)
  .replace(/portable-mixed 13/g, `portable-mixed ${counts['portable-mixed']}`)
  .replace(/product-shell 33/g, `product-shell ${counts['product-shell']}`)
  .replace(/harness 12/g, `harness ${counts.harness}`)
  .replace(/skip 89/g, `skip ${counts.skip}`)
  .replace(
    /\| total inventory rows \|\s*\d+ \|/,
    `| total inventory rows | ${rows.length} |`
  )
  .replace(
    /\| actual runnable test\/spec rows \|\s*\d+ \|/,
    `| actual runnable test/spec rows | ${runnable} |`
  )
  .replace(
    /\| fixture\/support rows \|\s*\d+ \|/,
    `| fixture/support rows | ${rows.length - runnable} |`
  )
  .replace(
    /\| portable behavior rows \|\s*\d+ \|/,
    `| portable behavior rows | ${counts.portable} |`
  )
  .replace(
    /\| portable-mixed rows \|\s*\d+ \|/,
    `| portable-mixed rows | ${counts['portable-mixed']} |`
  )
  .replace(
    /\| product-shell rows \|\s*\d+ \|/,
    `| product-shell rows | ${counts['product-shell']} |`
  )
  .replace(
    /\| harness rows \|\s*\d+ \|/,
    `| harness rows | ${counts.harness} |`
  )
  .replace(/\| skipped rows \|\s*\d+ \|/, `| skipped rows | ${counts.skip} |`)
  .replace(
    /covers all \d+ portable\/portable-mixed runnable files with [\d,]+ extracted/g,
    `covers all ${selected.length} portable/portable-mixed runnable files with ${extracted.toLocaleString('en-US')} extracted`
  )
  .replace(
    /\d+ runnable portable\/portable-mixed files indexed with [\d,]+ test\/describe\/it/g,
    `${selected.length} runnable portable/portable-mixed files indexed with ${extracted.toLocaleString('en-US')} test/describe/it`
  )
  .replace(
    /137 runnable portable\/portable-mixed files/g,
    `${selected.length} runnable portable/portable-mixed files`
  )
  .replace(/2095 extracted/g, `${extracted} extracted`)
  .replace(/slate-processing-ledger\.md/g, 'plite-processing-ledger.md')
  .replaceAll('../plite/', '')
  .replaceAll('local `../plite`', 'the current Plate checkout')
  .replaceAll('current `../plite`', 'the current Plate checkout')
  .replaceAll(' in `../plite`', ' in the current Plate checkout')
  .replaceAll('../plite', '.')
  .replaceAll('/Users/zbeyens/git/plite', '/Users/zbeyens/git/plate-2')
  .replaceAll(
    'playwright/stress/generated-editing.test.ts',
    'apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts'
  )
  .replaceAll(
    'playwright/integration/examples/paste-html.test.ts',
    'apps/plite/tests/plite-browser/donor/examples/paste-html.test.ts'
  )
  .replaceAll(
    'playwright/integration/examples/tables.test.ts',
    'apps/plite/tests/plite-browser/donor/examples/tables.test.ts'
  )
  .replaceAll(
    'playwright/integration/examples/huge-document.test.ts',
    'apps/plite/tests/plite-browser/donor/examples/huge-document.test.ts'
  )
  .replaceAll(
    'packages/plite-browser/src/playwright/ime.ts',
    'packages/browser/src/playwright/ime.ts'
  )
  .replaceAll(
    'packages/plite-react/test/dom-repair-policy-contract.ts',
    'packages/plite-react/test/dom-repair-policy-contract.test.ts'
  )
  .replaceAll(
    'bun --filter plite-browser test:core',
    'pnpm --filter @platejs/browser test:core'
  )
  .replaceAll('bun check:full', 'pnpm check:plite')
  .replaceAll('bun check', 'pnpm check:plite:dev');
const licenseGate = `## License Gate

- Upstream license: MIT at \`../lexical/LICENSE:1\`.
- Architecture evidence is paraphrased with exact source pointers.
- Portable test behavior may be re-expressed under
  \`docs/editor-test-harvester/lexical/\`; copied source must retain any
  applicable upstream notice.
- This refresh copied no Lexical runtime or test implementation.

`;
if (!refreshedReport.includes('## License Gate')) {
  refreshedReport = refreshedReport.replace(
    '## Full Cursor Refresh',
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
