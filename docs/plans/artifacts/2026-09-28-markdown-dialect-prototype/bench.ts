// PROTOTYPE — pre-acceptance scale probe for the Markdown dialect design plan.
// Run: bun --preload ./config/plite-source-aliases.ts docs/plans/artifacts/2026-09-28-markdown-dialect-prototype/bench.ts
//
// Budgets are frozen here before the first run:
//   B1 legacy cohorts: candidate Plate parse median <= 1.10x current MDX kit.
//   B2 angle-bracket prose and streaming: candidate <= 1.25x plain CommonMark Plate parse.
//   B3 mdast only: candidate <= 1.5x plain CommonMark; per-KB cost normal -> stress grows <= 1.5x.
//   B4 grammar scaling: doubling nested/inline tag count grows time <= 2.5x.
// Noise rule: 7 runs (3 for stress); compare medians; a ratio within 10% of its
// bound is inconclusive rather than pass/fail.

import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

import remarkEmoji from '../../../../packages/platejs/node_modules/remark-emoji/index.js';
import remarkGfm from '../../../../packages/platejs/node_modules/remark-gfm/index.js';
import remarkMath from '../../../../packages/platejs/node_modules/remark-math/index.js';
import remarkParse from '../../../../packages/platejs/node_modules/remark-parse/index.js';
import { unified } from '../../../../packages/platejs/node_modules/unified/index.js';

import { createTestEditor } from '../../../../packages/platejs/src/markdown/lib/__tests__/createTestEditor';
import { remarkMention } from '../../../../packages/platejs/src/markdown/lib/plugins/remarkMention';
import { type PlateTagRegistry, remarkPlateTags, trimIncompleteTagTail } from './plateTags';

const TAGS: PlateTagRegistry = Object.fromEntries(
  [
    ['audio', 'block'], ['block', 'block'], ['callout', 'block'], ['codeDrawing', 'block'],
    ['column', 'block'], ['columnGroup', 'block'], ['date', 'inline'], ['del', 'inline'],
    ['details', 'block'], ['figure', 'block'], ['file', 'block'], ['img', 'block'],
    ['kbd', 'inline'], ['mark', 'inline'], ['mediaEmbed', 'block'], ['span', 'inline'],
    ['sub', 'inline'], ['summary', 'block'], ['sup', 'inline'], ['toc', 'block'],
    ['u', 'inline'], ['video', 'block'],
  ].map(([name, kind]) => [name, { kind: kind as 'block' | 'inline', ...(name === 'img' ? { void: true } : {}) }])
);

const editor = createTestEditor();
const md = editor.api.markdown;
const CAND = [remarkMath, remarkGfm, [remarkPlateTags, { tags: TAGS }], remarkEmoji, remarkMention] as any[];
const PLAIN = [remarkMath, remarkGfm, remarkEmoji, remarkMention] as any[];

const current = (s: string) => md.parse(s, { lossPolicy: 'allow' });
const candidate = (s: string) => md.parse(s, { lossPolicy: 'allow', remarkPlugins: CAND, withoutMdx: true });
const plain = (s: string) => md.parse(s, { lossPolicy: 'allow', remarkPlugins: PLAIN, withoutMdx: true });
const mdastPlain = unified().use(remarkParse).use([remarkMath, remarkGfm]);
const mdastCand = unified().use(remarkParse).use([remarkMath, remarkGfm]).use(remarkPlateTags, { tags: TAGS });

const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const measure = (fn: () => unknown, runs: number) => {
  fn();
  const times: number[] = [];
  for (let i = 0; i < runs; i++) {
    const t = performance.now();
    fn();
    times.push(performance.now() - t);
  }
  return { max: Math.max(...times), median: median(times), min: Math.min(...times) };
};
const fmt = (m: { median: number; min: number; max: number }) =>
  `${m.median.toFixed(1)} ms [${m.min.toFixed(1)}–${m.max.toFixed(1)}]`;
const verdict = (ratio: number, bound: number) =>
  Math.abs(ratio - bound) / bound <= 0.1 ? 'INCONCLUSIVE' : ratio <= bound ? 'PASS' : 'FAIL';
const same = (a: any, b: any) => JSON.stringify(a.ok ? a.document : a) === JSON.stringify(b.ok ? b.document : b);

// Cohort sources.
// Seed: the schema-valid legacy sources from gates.ts, written by the current MDX writer.
const LEGACY_SOURCES = [
  '<callout icon="💡">\n  Tip with **bold** and <u>underline</u>.\n</callout>',
  '<details>\n  <summary>Title *x*</summary>\n\n  Body paragraph.\n\n  - item\n</details>',
  '<columnGroup>\n  <column width="50%">\n    Left **bold**\n  </column>\n  <column width="50%">\n    <callout icon="🔥">\n      Deep\n    </callout>\n  </column>\n</columnGroup>',
  'Text with <kbd>Ctrl</kbd>, <sup>2</sup>, <sub>i</sub>, <mark>hi</mark>, <del>x</del>.',
  'Colors <span style="color: red;">red</span>, <span style="background-color: yellow;">bg</span>, <span style="font-size: 20px;">big</span>.',
  '<toc />',
  '- one\n  - nested <u>u</u>\n- two <kbd>k</kbd>',
  '> quote with <kbd>k</kbd> and <u>u</u>',
  '| a | b |\n| - | - |\n| <u>x</u> | <kbd>y</kbd> |',
  'Footnote[^1].\n\n[^1]: Note with <u>u</u>.',
  '```js\nconst a = <div/>;\n```',
  '$$\nx^2\n$$\n\nInline $a<b$ math.',
  '# Heading\n\nPlain paragraph with [a link](https://example.com) and `code`.\n\n1. one\n2. two',
];
const legacyUnit = LEGACY_SOURCES.map((source) => {
  const parsed = md.parse(source, { lossPolicy: 'allow' });
  if (!parsed.ok) throw new Error(`seed rejected: ${source}`);
  return (md.serialize({ document: parsed.document, lossPolicy: 'allow' }) as any).data as string;
}).join('\n\n');
const cohorts = {
  normal: Array.from({ length: 5 }, () => legacyUnit).join('\n\n'),
  large: Array.from({ length: 100 }, () => legacyUnit).join('\n\n'),
  stress: Array.from({ length: 400 }, () => legacyUnit).join('\n\n'),
};
const answerUnit = (i: number) =>
  `## Step ${i}\n\nUse a \`Map<string, number>\` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/${i}>.\n\n- keep **order**\n- avoid _churn_\n\n\`\`\`ts\nconst m = new Map<string, number>();\n\`\`\`\n`;
const prose = Array.from({ length: 200 }, (_, i) => answerUnit(i)).join('\n');

const rows: string[] = [];
const results: Record<string, string> = {};

// B1 + correctness on legacy cohorts.
const perKb: number[] = [];
for (const [name, source] of Object.entries(cohorts)) {
  const runs = name === 'stress' ? 3 : 7;
  const cur = measure(() => current(source), runs);
  const cand = measure(() => candidate(source), runs);
  const guard = same(current(source), candidate(source));
  const ratio = cand.median / cur.median;
  perKb.push(cand.median / (source.length / 1024));
  results[`B1 ${name}`] = `${verdict(ratio, 1.1)} ratio ${ratio.toFixed(2)}`;
  rows.push(`${name.padEnd(7)} ${(source.length / 1024).toFixed(0).padStart(4)} KB  current ${fmt(cur)}  candidate ${fmt(cand)}  ratio ${ratio.toFixed(2)}  guard ${guard ? 'identical' : 'DIFF'}`);
}
const growth = perKb[2] / perKb[0];
results['B3 per-KB growth normal→stress'] = `${verdict(growth, 1.5)} ${growth.toFixed(2)}x`;

// B2: angle-bracket prose and streaming vs plain CommonMark.
{
  const p = measure(() => plain(prose), 7);
  const c = measure(() => candidate(prose), 7);
  const cur = current(prose);
  const ratio = c.median / p.median;
  results['B2 prose'] = `${verdict(ratio, 1.25)} ratio ${ratio.toFixed(2)}`;
  rows.push(`prose   ${(prose.length / 1024).toFixed(0).padStart(4)} KB  plain ${fmt(p)}  candidate ${fmt(c)}  ratio ${ratio.toFixed(2)}  guard ${same(plain(prose), candidate(prose)) ? 'identical to plain' : 'DIFF'}; current kit ok=${cur.ok}`);
  const stream = prose.slice(0, 10_000);
  const prefixes = Array.from({ length: Math.ceil(stream.length / 64) }, (_, i) => stream.slice(0, (i + 1) * 64));
  const ps = measure(() => prefixes.forEach((x) => plain(x)), 3);
  const cs = measure(() => prefixes.forEach((x) => candidate(trimIncompleteTagTail(x, TAGS))), 3);
  const sratio = cs.median / ps.median;
  results['B2 streaming'] = `${verdict(sratio, 1.25)} ratio ${sratio.toFixed(2)}`;
  rows.push(`stream  ${prefixes.length} accumulated prefixes of 10 KB  plain ${fmt(ps)}  candidate+trim ${fmt(cs)}  ratio ${sratio.toFixed(2)}`);
}

// B3: mdast-only overhead.
for (const [name, source] of [['large', cohorts.large], ['prose', prose]] as const) {
  const p = measure(() => mdastPlain.parse(source), 7);
  const c = measure(() => mdastCand.runSync(mdastCand.parse(source)), 7);
  const ratio = c.median / p.median;
  results[`B3 mdast ${name}`] = `${verdict(ratio, 1.5)} ratio ${ratio.toFixed(2)}`;
  rows.push(`mdast ${name.padEnd(5)} plain ${fmt(p)}  candidate ${fmt(c)}  ratio ${ratio.toFixed(2)}`);
}

// B4: grammar scaling with nesting depth and inline tag count, plus deterministic node counts.
const countElements = (tree: any): number =>
  (tree.type?.startsWith('mdxJsx') ? 1 : 0) + (tree.children ?? []).reduce((n: number, c: any) => n + countElements(c), 0);
for (const [label, build] of [
  ['nested details', (n: number) => `${'<details>\n\n'.repeat(n)}x${'\n\n</details>'.repeat(n)}`],
  ['inline u', (n: number) => Array.from({ length: n }, (_, i) => `<u>w${i}</u>`).join(' ')],
] as const) {
  const small = build(500);
  const big = build(1000);
  const s = measure(() => mdastCand.runSync(mdastCand.parse(small)), 5);
  const b = measure(() => mdastCand.runSync(mdastCand.parse(big)), 5);
  const ratio = b.median / s.median;
  results[`B4 ${label}`] = `${verdict(ratio, 2.5)} x2 input → ${ratio.toFixed(2)}x time`;
  rows.push(`${label}: 500 → ${fmt(s)} (${countElements(mdastCand.runSync(mdastCand.parse(small)))} elements), 1000 → ${fmt(b)} (${countElements(mdastCand.runSync(mdastCand.parse(big)))} elements)`);
}

const sourceHash = createHash('sha256')
  .update(readFileSync(new URL('./plateTags.ts', import.meta.url)))
  .digest('hex')
  .slice(0, 12);
const head = execSync('git rev-parse --short HEAD').toString().trim();
console.log(`source: HEAD ${head} (dirty working tree), plateTags.ts sha256 ${sourceHash}, bun ${Bun.version}, ${process.platform}/${process.arch}`);
for (const row of rows) console.log(row);
console.log('');
for (const [k, v] of Object.entries(results)) console.log(`${k}: ${v}`);
