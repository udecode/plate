// Amendment probe for D2 of docs/plans/2026-09-28-conversion-boundary-adoption.md.
// Question: can Markdown export establish property preservation by decoding its own
// output, instead of trusting read-tracking (today) or author `preserve(...)` claims
// (proposed)? For each fixture element: serialize, parse back, and compare every
// content-role property. Then compare that ground truth with today's
// `markdown-property-omitted` reports, and measure the verification cost.
// Run from the repository root:
//   bun --preload ./config/plite-source-aliases.ts docs/research/probes/2026-09-28-conversion-boundary/amendment/roundtrip-verify.ts

import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { createTestEditor } from '../../../../../packages/platejs/src/markdown/lib/__tests__/createTestEditor';
import { testValue } from '../../../../../packages/platejs/src/markdown/lib/__tests__/testValue';

const out = import.meta.dir;
const editor = createTestEditor() as any;
const md = editor.api.markdown;

const propertyRole = (type: string, key: string) =>
  editor.read((state: any) => {
    const property = state.schema.property({ key, placement: 'element', type });

    return property
      ? { default: property.value?.default, role: property.role as string }
      : null;
  });

type Fixture = Readonly<{ label: string; node: any; inline: boolean }>;

const variants: Fixture[] = [
  { inline: false, label: 'heading level 3', node: { children: [{ text: 'H' }], level: 3, type: 'heading' } },
  { inline: false, label: 'codeBlock lang', node: { children: [{ text: 'const a = 1;' }], lang: 'ts', type: 'codeBlock' } },
  { inline: false, label: 'image with width/title', node: { alt: 'A', children: [{ text: '' }], title: 'T', type: 'image', url: '/a.png', width: 320 } },
  { inline: false, label: 'callout variant/background', node: { backgroundColor: 'red', children: [{ text: 'x' }], icon: '🔥', type: 'callout', variant: 'info' } },
  { inline: false, label: 'video width', node: { children: [{ text: 'cap' }], type: 'video', url: '/v.mp4', width: '50%' } },
  { inline: true, label: 'link target', node: { children: [{ text: 'x' }], target: '_blank', type: 'link', url: 'https://example.com' } },
  { inline: false, label: 'list numbered start 3', node: { children: [{ text: 'item' }], indent: 1, listStart: 3, listType: 'decimal', type: 'paragraph' } },
  { inline: false, label: 'todo checked', node: { checked: true, children: [{ text: 'done' }], indent: 1, listType: 'todo', type: 'paragraph' } },
];

const fixtures: Fixture[] = [
  ...testValue.flatMap((node: any, index: number): Fixture[] => [
    { inline: false, label: `testValue[${index}] ${node.type}`, node },
    ...(node.children ?? [])
      .filter((child: any) => typeof child.type === 'string')
      .map((child: any, childIndex: number): Fixture => ({
        inline: true,
        label: `testValue[${index}].${childIndex} ${child.type}`,
        node: child,
      })),
  ]),
  ...variants,
];

const documentFor = ({ inline, node }: Fixture) => ({
  children: inline
    ? [{ children: [{ text: '' }, node, { text: '' }], type: 'paragraph' }]
    : [node],
});

const findDecoded = (nodes: readonly any[], type: string): any => {
  for (const node of nodes) {
    if (node.type === type) return node;
    const nested = node.children ? findDecoded(node.children, type) : undefined;

    if (nested) return nested;
  }

  return undefined;
};

const valid = (document: any) =>
  editor.read((state: any) => {
    try {
      state.schema.assertDocument(document);

      return true;
    } catch {
      return false;
    }
  });

const rows: any[] = [];

for (const fixture of fixtures) {
  const document = documentFor(fixture);

  if (!valid(document)) {
    rows.push({ label: fixture.label, skipped: 'schema-invalid in the package test editor' });
    continue;
  }
  const serialized = md.serialize({ document, lossPolicy: 'allow' });

  if (!serialized.ok) {
    rows.push({ label: fixture.label, skipped: serialized.diagnostics.map((d: any) => d.code) });
    continue;
  }
  const reported = new Set(
    serialized.diagnostics
      .filter((d: any) => d.code === 'markdown-property-omitted')
      .map((d: any) => d.key)
  );
  const parsed = md.parse(serialized.data, { lossPolicy: 'allow' });
  const decoded = parsed.ok ? findDecoded(parsed.document.children, fixture.node.type) : undefined;
  const lost: string[] = [];
  const preserved: string[] = [];

  for (const [key, value] of Object.entries(fixture.node)) {
    if (key === 'children' || key === 'type' || value === undefined) continue;
    const property = propertyRole(fixture.node.type, key);

    if (!property || property.role !== 'content') continue;
    const decodedValue = decoded?.[key] ?? property.default;

    (JSON.stringify(decodedValue) === JSON.stringify(value) ? preserved : lost).push(key);
  }
  rows.push({
    falseNegatives: lost.filter((key) => !reported.has(key)),
    falsePositives: [...reported].filter((key) => preserved.includes(key as string)),
    label: fixture.label,
    lost,
    markdown: serialized.data.slice(0, 160),
    preserved,
    reported: [...reported],
  });
}

// Cost: serialize alone vs serialize + parse (a text round trip over the whole
// document is the upper bound; decoding only custom-encoded fragments is cheaper).
const corpus = { children: Array.from({ length: 40 }, () => testValue).flat() };
const validCorpus = valid(corpus);
const time = (run: () => unknown, rounds = 7) => {
  run();
  const samples: number[] = [];

  for (let round = 0; round < rounds; round += 1) {
    const start = performance.now();

    run();
    samples.push(performance.now() - start);
  }

  return samples.sort((a, b) => a - b)[rounds >> 1];
};
const serializeMs = validCorpus
  ? time(() => md.serialize({ document: corpus, lossPolicy: 'allow' }))
  : null;
const roundTripMs = validCorpus
  ? time(() => {
      const result = md.serialize({ document: corpus, lossPolicy: 'allow' });

      md.parse(result.data, { lossPolicy: 'allow' });
    })
  : null;

const summary = {
  checked: rows.filter((row) => !row.skipped).length,
  falseNegativeFixtures: rows.filter((row) => row.falseNegatives?.length).map((row) => ({ label: row.label, keys: row.falseNegatives })),
  falsePositiveFixtures: rows.filter((row) => row.falsePositives?.length).map((row) => ({ label: row.label, keys: row.falsePositives })),
  lostByRoundTrip: rows.filter((row) => row.lost?.length).map((row) => ({ label: row.label, keys: row.lost })),
  skipped: rows.filter((row) => row.skipped).length,
};

writeFileSync(
  path.join(out, 'roundtrip-verify.json'),
  `${JSON.stringify({ cost: { corpusNodes: corpus.children.length, roundTripMs, serializeMs, validCorpus }, rows, summary }, null, 2)}\n`
);
console.log(JSON.stringify({ cost: { roundTripMs, serializeMs, validCorpus }, summary }, null, 2));
