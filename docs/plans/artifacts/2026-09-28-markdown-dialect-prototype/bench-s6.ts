// S6 production-path benchmark: run once in the origin/next worktree (baseline)
// and once in the adopted checkout (candidate) with the same inputs.
//   ROOT=<repo root> MODE=baseline|candidate OUT=<json path> bun --preload <root>/config/plite-source-aliases.ts bench-s6.ts
// Budgets frozen before the first run (compare.ts applies them):
//   legacy parse <= 1.10x baseline; prose and streaming <= 1.25x baseline plain
//   CommonMark (withoutMdx); serialize <= 1.10x baseline; 10% band is inconclusive.

import { readFileSync, writeFileSync } from 'node:fs';

const root = process.env.ROOT;
const mode = process.env.MODE;
const out = process.env.OUT;

if (!root || !out || (mode !== 'baseline' && mode !== 'candidate')) {
  throw new Error('Set ROOT, MODE=baseline|candidate and OUT.');
}

const { createTestEditor } = await import(
  `${root}/packages/platejs/src/markdown/lib/__tests__/createTestEditor`
);
const editor = createTestEditor();
const md = editor.api.markdown;
const corpusPath = `${out}.corpus.json`;

const LEGACY_SOURCES = [
  '<callout icon="💡">\n  Tip with **bold** and <u>underline</u>.\n</callout>',
  '<details>\n  <summary>Title *x*</summary>\n\n  Body paragraph.\n\n  - item\n</details>',
  '<columnGroup>\n  <column width="50%">\n    Left **bold**\n  </column>\n  <column width="50%">\n    <callout icon="🔥">\n      Deep\n    </callout>\n  </column>\n</columnGroup>',
  'Text with <kbd>Ctrl</kbd>, <sup>2</sup>, <sub>i</sub>, <mark>hi</mark>, <del>x</del>.',
  'Colors <span style="color: red;">red</span>, <span style="background-color: yellow;">bg</span>.',
  '<toc />',
  '- one\n  - nested <u>u</u>\n- two <kbd>k</kbd>',
  '> quote with <kbd>k</kbd> and <u>u</u>',
  '| a | b |\n| - | - |\n| <u>x</u> | <kbd>y</kbd> |',
  'Footnote[^1].\n\n[^1]: Note with <u>u</u>.',
  '```js\nconst a = <div/>;\n```',
  '$$\nx^2\n$$\n\nInline $a<b$ math.',
  '# Heading\n\nPlain paragraph with [a link](https://example.com) and `code`.\n\n1. one\n2. two',
];

// The baseline MDX writer produces the legacy corpus both runs parse.
if (mode === 'baseline') {
  const unit = LEGACY_SOURCES.map((source) => {
    const parsed = md.parse(source, { lossPolicy: 'allow' });

    if (!parsed.ok) throw new Error(`seed rejected: ${source}`);

    return md.serialize({ document: parsed.document, lossPolicy: 'allow' })
      .data as string;
  }).join('\n\n');

  writeFileSync(corpusPath, JSON.stringify({ unit }));
}
const { unit } = JSON.parse(
  readFileSync(corpusPath.replace(/candidate/, 'baseline'), 'utf8')
) as { unit: string };

const legacy = {
  large: Array.from({ length: 100 }, () => unit).join('\n\n'),
  normal: Array.from({ length: 5 }, () => unit).join('\n\n'),
  stress: Array.from({ length: 400 }, () => unit).join('\n\n'),
};
const answerUnit = (i: number) =>
  `## Step ${i}\n\nUse a \`Map<string, number>\` for {key: value} lookups. See [docs](https://example.com/${i}).\n\n- keep **order**\n- avoid _churn_\n\n\`\`\`ts\nconst m = new Map<string, number>();\n\`\`\`\n`;
const prose = Array.from({ length: 200 }, (_, i) => answerUnit(i)).join('\n');
const stream = prose.slice(0, 10_000);
const prefixes = Array.from({ length: Math.ceil(stream.length / 64) }, (_, i) =>
  stream.slice(0, (i + 1) * 64)
);

// Baseline "plain" skips MDX so prose stays parseable; the candidate grammar
// is total, so its ordinary parse is the comparison.
const plainOptions =
  mode === 'baseline'
    ? { lossPolicy: 'allow', withoutMdx: true }
    : { lossPolicy: 'allow' };
const streamOptions =
  mode === 'baseline'
    ? { lossPolicy: 'allow', withoutMdx: true }
    : { lossPolicy: 'allow', partial: true };

const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const measure = (fn: () => unknown, runs: number) => {
  for (let i = 0; i < 2; i += 1) fn();
  const times: number[] = [];

  for (let i = 0; i < runs; i += 1) {
    const start = performance.now();

    fn();
    times.push(performance.now() - start);
  }

  return { max: Math.max(...times), median: median(times), min: Math.min(...times) };
};

const legacyDocument = md.parse(legacy.large, { lossPolicy: 'allow' });

if (!legacyDocument.ok) throw new Error('legacy corpus failed to parse');

const results = {
  mode,
  parse: Object.fromEntries(
    Object.entries(legacy).map(([name, source]) => [
      name,
      measure(() => md.parse(source, { lossPolicy: 'allow' }), name === 'stress' ? 5 : 9),
    ])
  ),
  prose: measure(() => md.parse(prose, plainOptions), 9),
  serialize: measure(
    () => md.serialize({ document: legacyDocument.document, lossPolicy: 'allow' }),
    9
  ),
  streaming: measure(
    () => prefixes.forEach((prefix) => md.parse(prefix, streamOptions)),
    3
  ),
  guard: {
    legacyDocument: JSON.stringify(
      (md.parse(legacy.normal, { lossPolicy: 'allow' }) as { document?: unknown })
        .document
    ),
  },
};

writeFileSync(out, JSON.stringify(results, null, 2));
console.log(`${mode}: written ${out}`);
