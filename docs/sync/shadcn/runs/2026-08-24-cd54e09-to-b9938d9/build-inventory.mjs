import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const runDir = dirname(fileURLToPath(import.meta.url));
const rows = readFileSync(join(runDir, 'upstream-name-status.tsv'), 'utf8')
  .trim()
  .split('\n')
  .filter(Boolean)
  .map((line) => {
    const columns = line.split('\t');
    const status = columns[0];
    const currentPath = columns.at(-1);
    const displayPath =
      columns.length === 3 ? `${columns[1]} -> ${columns[2]}` : currentPath;

    const changeType = status.startsWith('R') ? 'R' : status;

    return { changeType, currentPath, displayPath, status };
  });

function result(subsystem, owner, decision, evidence) {
  return { decision, evidence, owner, subsystem };
}

function classify(path) {
  if (path.startsWith('apps/v4/public/r/')) {
    return result(
      'generated-registry-output',
      'apps/www source registry and CI-owned generated output',
      'no-op',
      'Upstream generated payload is not copied; Plate regenerates from authored registry source.'
    );
  }

  if (path.startsWith('apps/v4/public/schema')) {
    return result(
      'generated-registry-output',
      'apps/www/scripts/check-registry-source.mts',
      'no-op',
      'Generated schema output is represented by source validation, not a copied public artifact.'
    );
  }

  if (path.startsWith('apps/v4/public/')) {
    return result(
      'upstream-assets',
      'Plate brand and product assets',
      'exclude-upstream',
      'The asset belongs to shadcn product content and has no Plate product owner.'
    );
  }

  if (
    path.startsWith('apps/v4/styles/') ||
    path.startsWith('apps/v4/registry/styles/')
  ) {
    return result(
      'theme-style',
      'Plate registry style contract',
      'exclude-upstream',
      'Settled policy excludes upstream theme and style-variant source; the range mostly removes legacy tracked variants.'
    );
  }

  if (path.startsWith('apps/v4/registry/__components__/')) {
    return result(
      'generated-registry-index',
      'apps/www/scripts/registry-index.mts',
      'no-op',
      'Generated per-style component maps are build output; only their sharding pattern is considered at the builder owner.'
    );
  }

  if (path.startsWith('apps/v4/registry/bases/')) {
    return result(
      'base-registry-source',
      'apps/www/src/registry/bases and apps/www/src/components/ui',
      'smart-merge',
      'Use as source reference for Plate three-base registry behavior; do not copy unrelated primitive, block, or example files wholesale.'
    );
  }

  if (path.startsWith('apps/v4/examples/')) {
    return result(
      'upstream-examples',
      'Plate editor examples and registry examples',
      'exclude-upstream',
      'These demonstrate shadcn primitives and products, not Plate editor behavior.'
    );
  }

  if (
    path === 'apps/v4/registry/new-york-v4/ui/calendar.tsx' ||
    path === 'apps/v4/registry/calendar.test.ts'
  ) {
    return result(
      'ui-calendar',
      'apps/www/src/components/ui/calendar.tsx',
      'smart-merge',
      'The month-grid fix maps to Plate Calendar but requires its React DayPicker v8-to-v9 contract decision.'
    );
  }

  if (path.startsWith('apps/v4/registry/new-york-v4/')) {
    return result(
      'upstream-registry-content',
      'apps/www/src/registry and apps/www/src/components/ui',
      'exclude-upstream',
      'The item is shadcn component, block, or example content without a current Plate editor job.'
    );
  }

  if (
    path === 'apps/v4/package.json' ||
    path === 'apps/v4/registry/bases.ts' ||
    path === 'apps/v4/registry/config.ts' ||
    path === 'apps/v4/registry/config.test.ts' ||
    path === 'apps/v4/scripts/build-registry.mts'
  ) {
    return result(
      'registry-contract',
      'apps/www/package.json and apps/www registry builders',
      'smart-merge',
      'Audit the shadcn 4.19 preset, base, schema, and build contract against Plate source validation before upgrading.'
    );
  }

  if (
    path === 'apps/v4/registry/__index__.tsx' ||
    path === 'apps/v4/registry/__blocks__.json' ||
    path === 'apps/v4/registry/README.md'
  ) {
    return result(
      'generated-registry-index',
      'apps/www/scripts/registry-index.mts',
      'no-op',
      'Upstream generated index or internal build documentation is not copied into Plate.'
    );
  }

  if (
    path === 'apps/v4/registry/_legacy-styles.ts' ||
    path.startsWith('apps/v4/registry/icons/') ||
    path === 'apps/v4/scripts/build-icons.ts'
  ) {
    return result(
      'create-style-infrastructure',
      'Plate registry and icon policy',
      'exclude-upstream',
      'Multi-style and multi-icon create infrastructure is outside the retained Plate product.'
    );
  }

  if (path === 'apps/v4/registry/directory.json') {
    return result(
      'registry-directory',
      'apps/www/src/lib/plate-registry-config.ts',
      'plate-fork',
      'Plate keeps only its own @plate directory entry; upstream community directory data is shadcn-owned.'
    );
  }

  if (path.startsWith('apps/v4/registry/')) {
    return result(
      'registry-build',
      'apps/www/src/registry and apps/www/scripts',
      'plate-fork',
      'Plate owns its registry content and selectively audits upstream build behavior.'
    );
  }

  if (path.startsWith('apps/v4/content/docs/')) {
    return result(
      'docs-content',
      'content/docs and Plate docs metadata',
      'plate-fork',
      'Plate keeps product, API, CN, registry, and release content; upstream prose remains reference-only.'
    );
  }

  if (
    path.includes('/(create)/') ||
    path.includes('/create/') ||
    path.includes('/(typeset)/') ||
    path.includes('/charts/') ||
    path.includes('/examples/tasks/') ||
    path.includes('/examples/dashboard/') ||
    path.includes('/(root)/cards/') ||
    path === 'apps/v4/app/typeset.css/route.ts' ||
    path === 'apps/v4/app/legacy-themes.css'
  ) {
    return result(
      'upstream-product',
      'Plate retained product surface',
      'exclude-upstream',
      'Settled policy rejects create, v0, typeset, chart, theme, and shadcn home/demo product surfaces.'
    );
  }

  if (path.includes('apps/v4/app/(view)/')) {
    return result(
      'preview-route',
      'apps/www/src/app/(app)/(preview)',
      'plate-fork',
      'Plate keeps its editor/block preview renderer and does not adopt shadcn base/style product routing wholesale.'
    );
  }

  if (
    path.includes('/app/(app)/docs/') ||
    path.includes('/app/(app)/llm/') ||
    path === 'apps/v4/app/globals.css' ||
    path === 'apps/v4/app/layout.tsx'
  ) {
    return result(
      'docs-engine',
      'apps/www docs routes, Fumadocs source, and app shell',
      'smart-merge',
      'Retained docs-engine behavior should be compared while preserving Plate locale, product, and lazy-source owners.'
    );
  }

  if (path.startsWith('apps/v4/app/')) {
    return result(
      'app-surface',
      'Plate app routes',
      'plate-fork',
      'Plate route composition is product-owned; upstream changes are reference-only unless named by a retained engine slice.'
    );
  }

  if (
    [
      'apps/v4/components/component-preview-tabs.tsx',
      'apps/v4/components/component-preview.tsx',
      'apps/v4/components/component-source.tsx',
      'apps/v4/components/components-list.tsx',
      'apps/v4/components/docs-sidebar.tsx',
      'apps/v4/components/docs-toc.tsx',
    ].includes(path)
  ) {
    return result(
      'docs-shell',
      'apps/www/src/components docs and registry preview owners',
      'smart-merge',
      'Compare retained docs and preview behavior, especially sidebar scroll restoration, without replacing Plate locale/filter behavior.'
    );
  }

  if (path.startsWith('apps/v4/components/')) {
    return result(
      'product-component',
      'Plate app components',
      'exclude-upstream',
      'The change is tied to shadcn product, create/style, or non-editor component content.'
    );
  }

  if (
    [
      'apps/v4/lib/docs-sidebar-scroll.ts',
      'apps/v4/lib/docs.ts',
      'apps/v4/lib/format-code.ts',
      'apps/v4/lib/llm.ts',
      'apps/v4/lib/page-tree.ts',
      'apps/v4/lib/registry.ts',
      'apps/v4/lib/source.ts',
    ].includes(path)
  ) {
    return result(
      'docs-engine',
      'apps/www/src/lib docs, registry, and source adapters',
      'smart-merge',
      'Compare retained Fumadocs, registry, LLM, and sidebar behavior against Plate-owned adapters.'
    );
  }

  if (path.startsWith('apps/v4/lib/') || path.startsWith('apps/v4/hooks/')) {
    return result(
      'upstream-product-library',
      'Plate app libraries',
      'exclude-upstream',
      'The helper supports shadcn AI, create, animation, or product telemetry rather than a retained Plate owner.'
    );
  }

  if (
    [
      'apps/v4/mdx-components.tsx',
      'apps/v4/next.config.mjs',
      'apps/v4/source.config.ts',
    ].includes(path)
  ) {
    return result(
      'docs-engine',
      'apps/www Fumadocs and Next configuration',
      'smart-merge',
      'Audit Fumadocs and route configuration changes against Plate source and locale requirements.'
    );
  }

  if (path === 'apps/v4/.gitignore') {
    return result(
      'generated-output-policy',
      'Plate CI-owned registry output policy',
      'no-op',
      'Upstream stopped tracking generated style output; Plate already treats generated registry output as owner-controlled.'
    );
  }

  return result(
    'workspace-config',
    'Plate workspace configuration',
    'plate-fork',
    'Plate workspace tooling and formatting configuration remains repository-owned.'
  );
}

const classified = rows.map((row) => ({ ...row, ...classify(row.currentPath) }));
const countBy = (key) =>
  Object.fromEntries(
    [...new Set(classified.map((row) => row[key]))]
      .sort()
      .map((value) => [
        value,
        classified.filter((row) => row[key] === value).length,
      ])
  );
const countByPair = (firstKey, secondKey) =>
  Object.fromEntries(
    [...new Set(classified.map((row) => row[firstKey]))]
      .sort()
      .map((firstValue) => [
        firstValue,
        Object.fromEntries(
          [...new Set(classified.map((row) => row[secondKey]))]
            .sort()
            .map((secondValue) => [
              secondValue,
              classified.filter(
                (row) =>
                  row[firstKey] === firstValue &&
                  row[secondKey] === secondValue
              ).length,
            ])
            .filter(([, count]) => count > 0)
        ),
      ])
  );

const summary = {
  rows: classified.length,
  changeTypeCounts: countBy('changeType'),
  statusCounts: countBy('status'),
  subsystemCounts: countBy('subsystem'),
  decisionCounts: countBy('decision'),
  changeTypeDecisionCounts: countByPair('changeType', 'decision'),
  changeTypeSubsystemCounts: countByPair('changeType', 'subsystem'),
};

const markdown = [
  '# Shadcn Sync Inventory',
  '',
  `Range: \`cd54e0927f3853a777f700a0bbf34507cf697b9c..b9938d94635fca7a4560449713b0b1ba87d77bc6\``,
  '',
  `Rows: ${classified.length}. This table accounts for every row in \`upstream-name-status.tsv\`.`,
  '',
  '## Counts',
  '',
  '```json',
  JSON.stringify(summary, null, 2),
  '```',
  '',
  '## Complete classification',
  '',
  '| Status | Upstream path | Subsystem | Plate owner | Decision | Evidence |',
  '| --- | --- | --- | --- | --- | --- |',
  ...classified.map(
    (row) =>
      `| ${row.status} | \`${row.displayPath}\` | \`${row.subsystem}\` | ${row.owner} | \`${row.decision}\` | ${row.evidence} |`
  ),
  '',
].join('\n');

writeFileSync(join(runDir, 'inventory.md'), markdown);
writeFileSync(
  join(runDir, 'classification-summary.json'),
  `${JSON.stringify(summary, null, 2)}\n`
);
