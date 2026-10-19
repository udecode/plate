// Lane authored cost probe: `value.replace` on the registry EditorKit editor
// with the same 300-table Markdown document, once ending in a paragraph (the
// trailing-block correction writes nothing) and once ending in a table (the
// correction inserts a paragraph after the replacement). Prints the median of
// five measured runs after three warmups, the authored projection derivation
// (`authored-restore`) and the largest core durations. Run from the repository
// root:
//   bun test docs/research/probes/2026-09-28-conversion-boundary/lanes/authored/replace-cost.probe.test.ts
import { test } from 'bun:test';

import { createEditor } from 'platejs';

import { EditorKit } from '../../../../../../apps/www/src/registry/components/editor/plugins';

const durations = new Map<string, { count: number; total: number }>();
(globalThis as Record<string, unknown>).__EDITOR_REACT_RENDER_PROFILER__ = {
  acceptsCoreDuration: () => true,
  record: ({ duration, id }: { duration: number; id: string }) => {
    const entry = durations.get(id) ?? { count: 0, total: 0 };
    entry.count += 1;
    entry.total += duration;
    durations.set(id, entry);
  },
};

const block = (index: number) =>
  `Paragraph ${index} with **bold** and _italic_ text that is long enough to matter.\n\n| a | b |\n| - | - |\n| ${index} | ${index + 1} |`;

test('value.replace cost with and without a trailing-block correction', () => {
  const markdown = Array.from({ length: 300 }, (_, index) => block(index)).join(
    '\n\n'
  );

  for (const [name, source] of [
    ['ends-in-paragraph', `${markdown}\n\ntrailing paragraph`],
    ['ends-in-table', markdown],
  ] as const) {
    const times: number[] = [];
    const measured = new Map<string, { count: number; total: number }>();

    for (let run = 0; run < 8; run++) {
      const editor = createEditor({
        plugins: EditorKit,
        initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
      });
      const result = editor.api.markdown.parse(source);

      if (!result.ok) throw new Error('Markdown parse failed.');
      durations.clear();
      const start = performance.now();
      editor.update.value.replace(result.document);
      times.push(performance.now() - start);
      if (run < 3) continue;
      for (const [id, entry] of durations) {
        const total = measured.get(id) ?? { count: 0, total: 0 };
        total.count += entry.count;
        total.total += entry.total;
        measured.set(id, total);
      }
    }

    const perRun = (id: string) => {
      const entry = measured.get(id);

      return entry
        ? {
            calls: entry.count / 5,
            ms: Number((entry.total / 5).toFixed(1)),
          }
        : null;
    };

    console.log(
      JSON.stringify({
        authoredRestore: perRun('authored-restore'),
        bytes: source.length,
        finalizeRepresentation: perRun('transaction-finalize-representation'),
        medianReplaceMs: Number(
          times
            .slice(3)
            .sort((left, right) => left - right)[2]
            .toFixed(1)
        ),
        name,
        representationWindowApply: perRun('representation-window-apply'),
        schemaValidationFull: perRun('schema-validation-full-document-boundary'),
        schemaValidationIncremental: perRun('schema-validation-incremental'),
        transactionCorrect: perRun('transaction-correct'),
      })
    );
  }
}, 600_000);
