// Amendment probe: why does a tail-only splice still cost O(document) per update?
// Builds the 50 KB rich preview, then profiles repeated one-block tail splices.
// Run from the repository root:
//   bun --cpu-prof --cpu-prof-dir=docs/research/probes/2026-09-28-conversion-boundary/amendment --cpu-prof-name=splice.cpuprofile --preload ./config/plite-source-aliases.ts docs/research/probes/2026-09-28-conversion-boundary/amendment/splice-profile.ts

import { createTestEditor } from '../../../../../packages/platejs/src/markdown/lib/__tests__/createTestEditor';

const answerUnit = (i: number) =>
  `## Step ${i}\n\nUse a \`Map<string, number>\` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/${i}>.\n\n- keep **order**\n- avoid _churn_\n\n\`\`\`ts\nconst m = new Map<string, number>();\n\`\`\`\n`;
const source = Array.from({ length: 2000 }, (_, i) => answerUnit(i)).join('\n').slice(0, 50_000);
const editor = createTestEditor() as any;
const parsed = editor.api.markdown.parseSlice(source, { lossPolicy: 'allow', partial: true });
const nodes = parsed.slice.content;
const target = createTestEditor() as any;

target.update({ history: 'skip' }).value.replace({ children: nodes });
const last = nodes.length - 1;
const samples: number[] = [];

for (let round = 0; round < 60; round += 1) {
  const replacement = { children: [{ text: `tail ${round}` }], type: 'paragraph' };
  const start = performance.now();

  target.update({ history: 'skip' }, (tx: any) => {
    tx.nodes.remove({ at: [last] });
    tx.nodes.insert(replacement, { at: [last] });
  });
  samples.push(performance.now() - start);
}
samples.sort((a, b) => a - b);
console.log(`top-level nodes ${nodes.length}; tail splice median ${samples[30].toFixed(1)} ms, p90 ${samples[54].toFixed(1)} ms`);
