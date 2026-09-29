// Lane S4: AI preview identity and timing with the S5 hint (plan S5, A1).
// Holds the transport and cadence constant: 64-character chunks every 10 ms,
// published as the first chunk at once and then the latest draft every 32 ms,
// with one strict final. Each draft goes through `AIChatPlugin.setPreview`
// (parse plus store publication) and then into a separate preview editor the
// way `AIChatEditor` publishes it.
//   candidate: current AIChatPlugin (continued parse, store copies carried) and
//              splice publication from the first changed block;
//   baseline:  AIChatPlugin before S5 (full partial parse every time) and
//              `value.replace` publication.
// The baseline arm runs only when the pre-S5 plugin sits next to the current
// one. Recreate it from the repository root with
//   git show a7750ad388:packages/platejs/src/ai/react/AIChatPlugin.ts > packages/platejs/src/ai/react/zz-AIChatPlugin.baseline.ts
// then run
//   bun test docs/research/probes/2026-09-28-conversion-boundary/lanes/s4/ai-flow-benchmark.test.ts
// and delete the copy.
import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import { arch, cpus, platform } from 'node:os';
import path from 'node:path';

import { createEditor, type Descendant } from 'platejs';

import { BaseEditorKit } from '../../../../../../apps/www/src/registry/components/editor/plugins-static';
import { AIChatPlugin } from '../../../../../../packages/platejs/src/ai/react/AIChatPlugin';

const CHUNK = 64;
const ARRIVAL_MS = 10;
const CADENCE_MS = 32;
const BASELINE = path.resolve(
  import.meta.dir,
  '../../../../../../packages/platejs/src/ai/react/zz-AIChatPlugin.baseline.ts'
);

// Fixture generators from ../../amendment/stream-reuse.ts (S0 transcripts).
const answerUnit = (i: number) =>
  `## Step ${i}\n\nUse a \`Map<string, number>\` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/${i}>.\n\n- keep **order**\n- avoid _churn_\n\n\`\`\`ts\nconst m = new Map<string, number>();\n\`\`\`\n`;
const cjkUnit = (i: number) =>
  `## 第 ${i} 步\n\n使用 \`Map<string, number>\` 来做 {key: value} 查找，当 x<y 时依然成立。参见 <https://example.com/${i}>。\n\n- 保持**顺序**\n- 避免_抖动_ 🚀\n\n| 键 | 值 |\n| - | - |\n| a | ${i} |\n\n\`\`\`ts\nconst m = new Map<string, number>();\n\`\`\`\n`;
const makeSource = (kind: 'cjk' | 'rich', size: number) =>
  Array.from({ length: 2000 }, (_, i) =>
    kind === 'rich' ? answerUnit(i) : cjkUnit(i)
  )
    .join('\n')
    .slice(0, size);

const hash = (value: string) =>
  createHash('sha256').update(value).digest('hex');

// Draft lengths the adapter publishes: the first chunk, then the latest
// arrived prefix every 32 ms until the last chunk arrives.
const draftLengths = (length: number) => {
  const chunks = Math.ceil(length / CHUNK);
  const last = (chunks - 1) * ARRIVAL_MS;
  const lengths = [Math.min(length, CHUNK)];

  for (let at = CADENCE_MS; at <= last; at += CADENCE_MS) {
    lengths.push(Math.min(length, (Math.floor(at / ARRIVAL_MS) + 1) * CHUNK));
  }

  return lengths;
};

const summary = (samples: readonly number[]) => {
  const sorted = [...samples].sort((a, b) => a - b);
  const pick = (q: number) =>
    sorted.length ? sorted[Math.max(0, Math.ceil(sorted.length * q) - 1)] : 0;

  return {
    p50: pick(0.5),
    p95: pick(0.95),
    sum: samples.reduce((a, b) => a + b, 0),
  };
};

const run = (
  arm: 'baseline' | 'candidate',
  plugin: typeof AIChatPlugin,
  source: string
) => {
  const editor = createEditor({
    plugins: [...BaseEditorKit, plugin],
    initialValue: [{ children: [{ text: 'Intro' }], type: 'paragraph' }],
    selection: {
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 5, path: [0, 0] },
      kind: 'text',
    },
    userId: 'bench',
  });
  const preview = createEditor({ plugins: BaseEditorKit });
  const ai = editor.plugin(plugin);
  const setPreviewMs: number[] = [];
  const renderMs: number[] = [];
  const steps: string[] = [];
  let published: readonly Descendant[] = [];
  let reused = 0;
  let possible = 0;

  ai.api.submit('go', { mode: 'insert' });
  const requestId = ai.store.get('_requestId');
  const publish = (content: string, final: boolean) => {
    const t0 = performance.now();
    ai.api.setPreview(content, { final, requestId });
    const t1 = performance.now();
    const nodes = ai.store.get('previewValue');

    let start = 0;

    while (
      arm === 'candidate' &&
      start < nodes.length &&
      published[start] === nodes[start]
    ) {
      start += 1;
    }
    if (start === 0) {
      preview.update({ history: 'skip' }).value.replace({ children: nodes });
    } else {
      preview.update({ history: 'skip' }, (tx) => {
        tx.nodes.replaceChildren(nodes.slice(start), { at: [], index: start });
      });
    }
    const t2 = performance.now();

    possible += Math.max(0, Math.min(published.length, nodes.length) - 1);
    reused += nodes.filter((node, index) => node === published[index]).length;
    published = nodes;
    steps.push(hash(JSON.stringify(nodes)));

    return { render: t2 - t1, setPreview: t1 - t0 };
  };

  for (const length of draftLengths(source.length)) {
    const times = publish(source.slice(0, length), false);

    setPreviewMs.push(times.setPreview);
    renderMs.push(times.render);
  }
  const final = publish(source, true);

  return {
    arm,
    final,
    finalValue: hash(JSON.stringify(preview.read.children())),
    previews: setPreviewMs.length,
    renderMs: summary(renderMs),
    reused,
    reusedPossible: possible,
    setPreviewMs: summary(setPreviewMs),
    stepsHash: hash(steps.join()),
    workMs:
      setPreviewMs.reduce((a, b) => a + b, 0) +
      renderMs.reduce((a, b) => a + b, 0) +
      final.setPreview +
      final.render,
  };
};

test(
  'AI preview identity and timing',
  async () => {
    const baseline = existsSync(BASELINE)
      ? ((await import(BASELINE)) as { AIChatPlugin: typeof AIChatPlugin })
          .AIChatPlugin
      : null;
    const packets: unknown[] = [];

    for (const kind of ['rich', 'cjk'] as const) {
      for (const size of [10_000, 50_000]) {
        const source = makeSource(kind, size);
        const pairs = size === 10_000 ? 3 : 2;
        const arms = (order: number) => {
          const list = [['candidate', AIChatPlugin]] as [
            'baseline' | 'candidate',
            typeof AIChatPlugin,
          ][];

          if (baseline) {
            list[order % 2 === 0 ? 'unshift' : 'push'](['baseline', baseline]);
          }

          return list;
        };

        for (const [arm, plugin] of arms(0)) run(arm, plugin, source);
        for (let pair = 0; pair < pairs; pair += 1) {
          const results = Object.fromEntries(
            arms(pair).map(([arm, plugin]) => [arm, run(arm, plugin, source)])
          );

          if (results.baseline) {
            expect(results.candidate.stepsHash).toBe(results.baseline.stepsHash);
            expect(results.candidate.finalValue).toBe(
              results.baseline.finalValue
            );
          }
          packets.push({ kind, pair, size, sourceHash: hash(source), ...results });
          const c = results.candidate;
          const b = results.baseline;
          console.log(
            `${kind} ${size} pair ${pair}: previews ${c.previews}, reused ${c.reused}/${c.reusedPossible}, work ${b ? `${b.workMs.toFixed(0)} -> ` : ''}${c.workMs.toFixed(0)} ms, setPreview ${b ? `${b.setPreviewMs.sum.toFixed(0)} -> ` : ''}${c.setPreviewMs.sum.toFixed(0)} ms (p95 ${b ? `${b.setPreviewMs.p95.toFixed(1)} -> ` : ''}${c.setPreviewMs.p95.toFixed(1)}), render ${b ? `${b.renderMs.sum.toFixed(0)} -> ` : ''}${c.renderMs.sum.toFixed(0)} ms (p95 ${b ? `${b.renderMs.p95.toFixed(1)} -> ` : ''}${c.renderMs.p95.toFixed(1)}), final ${b ? `${(b.final.setPreview + b.final.render).toFixed(0)} -> ` : ''}${(c.final.setPreview + c.final.render).toFixed(0)} ms`
          );
        }
      }
    }
    writeFileSync(
      path.join(import.meta.dir, 'ai-flow-benchmark.json'),
      `${JSON.stringify(
        {
          baseline: baseline ? 'a7750ad388 AIChatPlugin + value.replace' : null,
          environment: {
            arch: arch(),
            bun: Bun.version,
            cpu: cpus()[0]?.model,
            platform: platform(),
          },
          packets,
          sampling: {
            arrivalMs: ARRIVAL_MS,
            cadenceMs: CADENCE_MS,
            chunkCharacters: CHUNK,
            note: 'Headless, shared host. One unrecorded warmup per arm, then alternating pairs: three at 10 KB, two at 50 KB. setPreview covers the parse and the store publication; render is the preview editor publication.',
          },
        },
        null,
        2
      )}\n`
    );
  },
  1_800_000
);
