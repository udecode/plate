// Continued `parseSlice` on the current tree: every 64-character prefix of a
// stream parses with the previous result (candidate) and without it
// (baseline), then the strict final does the same. Run from the repository
// root:
//   bun --preload ./config/plite-source-aliases.ts \
//     docs/research/probes/2026-09-28-conversion-boundary/lanes/formats/continued-parse-current.ts
import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { createTestEditor } from '../../../../../../packages/platejs/src/markdown/lib/__tests__/createTestEditor';

const answerUnit = (index: number) =>
  `## Step ${index}\n\nUse a \`Map<string, number>\` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/${index}>.\n\n- keep **order**\n- avoid _churn_\n\n\`\`\`ts\nconst m = new Map<string, number>();\n\`\`\`\n`;
const cjkUnit = (index: number) =>
  `## 第 ${index} 步\n\n使用 \`Map<string, number>\` 查找，当 x<y 时依然成立。🚀\n\n| 键 | 值 |\n| - | - |\n| a | ${index} |\n`;
const build = (unit: (index: number) => string, size: number) => {
  let source = '';

  for (let index = 0; source.length < size; index++) {
    source += `${unit(index)}\n`;
  }

  return source.slice(0, size);
};
const definitions = 'Intro with a note[^1].\n\n[^1]: The note.\n\n';
const fixtures = {
  'rich-10000': build(answerUnit, 10_000),
  'cjk-10000': build(cjkUnit, 10_000),
  'rich-50000': build(answerUnit, 50_000),
  'definitions-10000': definitions + build(answerUnit, 10_000),
  'definitions-50000': definitions + build(answerUnit, 50_000),
};
const editor = createTestEditor();
const { markdown } = editor.api;
const partial = { lossPolicy: 'allow', partial: true } as const;
type Result = ReturnType<typeof markdown.parseSlice>;

const stream = (source: string, continued: boolean) => {
  let previous: Result | undefined;
  let reused = 0;
  let published = 0;
  const started = performance.now();

  for (let end = 64; end < source.length + 64; end += 64) {
    const prefix = source.slice(0, Math.min(end, source.length));
    const result = markdown.parseSlice(prefix, {
      ...partial,
      ...(continued ? { previous } : {}),
    });

    if (continued && previous?.ok && result.ok) {
      const before = previous.slice.content;
      const after = result.slice.content;
      let index = 0;

      while (index < after.length && before[index] === after[index]) index++;
      reused += index;
      published += after.length;
    }
    previous = result.ok ? result : undefined;
  }
  const previews = performance.now() - started;
  const finalStarted = performance.now();
  const final = markdown.parseSlice(
    source,
    continued && previous ? { previous } : {}
  );
  const finalMs = performance.now() - finalStarted;

  return { final, finalMs, previews, published, reused };
};

const rows = Object.entries(fixtures).map(([name, source]) => {
  const runs = name.endsWith('10000') ? 3 : 1;
  const baseline: ReturnType<typeof stream>[] = [];
  const candidate: ReturnType<typeof stream>[] = [];

  for (let run = 0; run < runs; run++) {
    baseline.push(stream(source, false));
    candidate.push(stream(source, true));
  }
  const best = (list: ReturnType<typeof stream>[], key: 'finalMs' | 'previews') =>
    Math.min(...list.map((item) => item[key]));
  const last = candidate.at(-1)!;

  return {
    bytes: new TextEncoder().encode(source).byteLength,
    chunks: Math.ceil(source.length / 64),
    fixture: name,
    finalEqualsFresh: Bun.deepEquals(last.final, markdown.parseSlice(source)),
    finalMs: { baseline: best(baseline, 'finalMs'), candidate: best(candidate, 'finalMs') },
    previewMs: { baseline: best(baseline, 'previews'), candidate: best(candidate, 'previews') },
    reusedLeadingBlocks: `${last.reused}/${last.published}`,
    runs,
  };
});

for (const row of rows) {
  console.log(
    row.fixture.padEnd(18),
    `previews ${row.previewMs.baseline.toFixed(0)} -> ${row.previewMs.candidate.toFixed(0)} ms`,
    `final ${row.finalMs.baseline.toFixed(1)} -> ${row.finalMs.candidate.toFixed(1)} ms`,
    `reused ${row.reusedLeadingBlocks}`,
    `final equals fresh ${row.finalEqualsFresh}`
  );
}
writeFileSync(
  path.join(import.meta.dir, 'continued-parse-current.json'),
  `${JSON.stringify({ createdAt: new Date().toISOString(), rows }, null, 2)}\n`
);
