import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { createEditor } from '../../../../../../packages/platejs/src/core';
import {
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHeadingPlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
} from '../../../../../../packages/platejs/src/features/basic-nodes';
import {
  BaseLineHeightPlugin,
  BaseTextAlignPlugin,
} from '../../../../../../packages/platejs/src/features/basic-styles';
import { BaseCodeBlockPlugin } from '../../../../../../packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin';
import { BaseIndentPlugin } from '../../../../../../packages/platejs/src/features/indent';
import { BaseLinkPlugin } from '../../../../../../packages/platejs/src/features/link/lib/BaseLinkPlugin';
import { BaseListPlugin } from '../../../../../../packages/platejs/src/features/list';
import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '../../../../../../packages/platejs/src/features/table';
import { exportDocx } from '../../../../../../packages/platejs/src/docx/export/lib/exportDocx';
import { importDocx } from '../../../../../../packages/platejs/src/docx/import/lib/importDocx';
import {
  DEFAULT_DOCX_IMPORT_LIMITS,
  readBoundedDocxPackage,
} from '../../../../../../packages/platejs/src/docx/internal/docxPackage';
import { findDocxSourceViolations } from '../../../../../../packages/platejs/src/docx/internal/sourceEligibility';

const require = createRequire(
  new URL('../../../../../../packages/platejs/package.json', import.meta.url)
);
const JSZip = require('jszip');
const repoRoot = path.resolve(import.meta.dir, '../../../../../..');
const fixtures = path.join(
  repoRoot,
  'apps/www/src/__tests__/package-integration/docx'
);

// Provenance from byte comparison with pandoc's test/docx corpus
// (GPL-2.0-or-later); see REPORT.md. The remaining five were contributed by
// the repository owner in 2021-2022 without recorded origin.
const PANDOC_IDENTICAL = new Set([
  'alternate_document_path.docx',
  'char_styles.docx',
  'codeblock.docx',
  'dummy_item_after_list_item.docx',
  'dummy_item_after_paragraph.docx',
  'inline_code.docx',
  'inline_formatting.docx',
  'links.docx',
  'lists.docx',
  'lists_continuing.docx',
  'lists_restarting.docx',
  'lists_sublist_reset.docx',
  'numbered_header.docx',
  'tables.docx',
  'tabs.docx',
]);
const PANDOC_NAMED = new Set([
  'block_quotes.docx',
  'custom-style-reference.docx',
  'headers.docx',
]);

// Enough of the standard feature set for list, table and link documents to
// decode, so retention reflects real imports rather than an empty schema.
const plugins = [
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseCodeBlockPlugin,
  BaseCodePlugin,
  BaseHeadingPlugin,
  BaseIndentPlugin,
  BaseItalicPlugin,
  BaseLineHeightPlugin,
  BaseLinkPlugin,
  BaseListPlugin,
  BaseStrikethroughPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
  BaseTextAlignPlugin,
  BaseUnderlinePlugin,
];

const tierOf = (file: string) =>
  PANDOC_IDENTICAL.has(file)
    ? 'pandoc-identical'
    : PANDOC_NAMED.has(file)
      ? 'pandoc-named'
      : 'owner-contributed';

const application = async (bytes: Uint8Array) => {
  try {
    const zip = await JSZip.loadAsync(bytes);
    const app: string = (await zip.file('docProps/app.xml')?.async('string')) ?? '';

    return /<Application>([^<]*)<\/Application>/.exec(app)?.[1] ?? null;
  } catch {
    return null;
  }
};

const share = (rows: ReadonlyArray<{ eligible: boolean }>) => ({
  eligible: rows.filter((row) => row.eligible).length,
  total: rows.length,
});

test('repository DOCX fixture eligibility', async () => {
  const rows = [];

  for (const file of readdirSync(fixtures).filter((name) => name.endsWith('.docx')).sort()) {
    const bytes = new Uint8Array(readFileSync(path.join(fixtures, file)));
    const violations = findDocxSourceViolations(
      await readBoundedDocxPackage(new Blob([bytes]), DEFAULT_DOCX_IMPORT_LIMITS)
    );
    const imported = await importDocx(new Blob([bytes]), {
      lossPolicy: 'allow',
      plugins,
      retainSource: true,
    });
    let exactReuse: boolean | null = null;

    if (imported.ok && imported.source) {
      const exported = await exportDocx(
        createEditor({ initialValue: imported.document, plugins }),
        { projection: 'review', source: imported.source }
      );

      exactReuse =
        exported.ok &&
        Buffer.compare(
          Buffer.from(await exported.blob.arrayBuffer()),
          Buffer.from(bytes)
        ) === 0;
      imported.source.dispose();
    }

    rows.push({
      application: await application(bytes),
      eligible: violations.length === 0,
      exactReuse,
      file,
      importOk: imported.ok,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      sourceRetained: imported.ok ? imported.source !== null : false,
      sourceUnavailable: imported.ok
        ? (imported.diagnostics.find(
            (diagnostic) =>
              diagnostic.code === 'source-unavailable' &&
              diagnostic.reason === 'ineligible'
          )?.message ?? null)
        : null,
      tier: tierOf(file),
      violations,
    });
  }

  const summary = {
    all: share(rows),
    byTier: Object.fromEntries(
      ['pandoc-identical', 'pandoc-named', 'owner-contributed'].map((tier) => [
        tier,
        share(rows.filter((row) => row.tier === tier)),
      ])
    ),
    exactReuse: {
      bytesIdentical: rows.filter((row) => row.exactReuse === true).length,
      retained: rows.filter((row) => row.sourceRetained).length,
    },
  };

  writeFileSync(
    path.join(import.meta.dir, 'results.json'),
    `${JSON.stringify({ rows, summary }, null, 2)}\n`
  );

  // Receipts only: the product owner's own suites assert the behavior.
  expect(rows.every((row) => row.eligible === row.sourceRetained || !row.importOk)).toBe(true);
  expect(summary.exactReuse.bytesIdentical).toBe(summary.exactReuse.retained);
}, 600_000);

// Supplementary, not the gate basis: already-cloned sibling repositories.
const SIBLING_CORPORA = [
  'pandoc',
  'mammoth.js',
  'docx',
  'docxjs',
  'python-docx',
  'docx-editor',
  'eigenpal-docx-editor',
  'docx-redline-js',
  'docx-cli',
];

const walk = (directory: string): string[] =>
  readdirSync(directory).flatMap((name) => {
    const full = path.join(directory, name);

    if (name === 'node_modules' || name === '.git') return [];

    return statSync(full).isDirectory()
      ? walk(full)
      : name.endsWith('.docx')
        ? [full]
        : [];
  });

test('supplementary sibling-corpus eligibility', async () => {
  const siblings = path.resolve(repoRoot, '..');
  const corpora = [];

  for (const name of SIBLING_CORPORA) {
    const root = path.join(siblings, name);

    if (!existsSync(root)) continue;
    const blockers = new Map<string, number>();
    const row = { eligible: 0, name, total: 0, unreadable: 0, word: 0, wordEligible: 0 };

    for (const file of walk(root)) {
      const bytes = new Uint8Array(readFileSync(file));
      const isWord = /^Microsoft/.test((await application(bytes)) ?? '');

      row.total += 1;
      if (isWord) row.word += 1;
      let violations;

      try {
        violations = findDocxSourceViolations(
          await readBoundedDocxPackage(new Blob([bytes]), DEFAULT_DOCX_IMPORT_LIMITS)
        );
      } catch {
        row.unreadable += 1;
        continue;
      }
      if (violations.length === 0) {
        row.eligible += 1;
        if (isWord) row.wordEligible += 1;
        continue;
      }
      const [first] = violations;
      const key = `${first.feature}:${first.detail ?? ''}`;

      blockers.set(key, (blockers.get(key) ?? 0) + 1);
    }
    corpora.push({
      ...row,
      firstBlockers: [...blockers].sort((a, b) => b[1] - a[1]).slice(0, 6),
    });
  }

  writeFileSync(
    path.join(import.meta.dir, 'supplementary.json'),
    `${JSON.stringify({ corpora }, null, 2)}\n`
  );
}, 600_000);
