import { writeFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';

import { createTestEditor } from './createBaselineEditor';
import { AIChatPlugin } from './LegacyAIChatPlugin';

// Disposable rejection probe, not a replacement streaming implementation.
// Give full-source parsing its best case: omit draft reconciliation and rendering.
// Both lanes receive the same last 128 characters of the same source.
const rows: unknown[] = [];
for (const bytes of [1024, 10240, 102400]) {
  for (const shape of ['paragraphs', 'single-paragraph']) {
    const unit = shape === 'paragraphs' ? 'Some **bold** text.\n\n' : 'Some plain text. ';
    const source = unit.repeat(Math.ceil(bytes / unit.length)).slice(0, bytes).trimEnd();
    const prefix = source.slice(0, -128);
    const chunk = source.slice(-128);
    const current: number[] = [];
    const raw: number[] = [];
    let currentEqual = true;
    let rawEqual = true;
    for (let run = 0; run < 14; run++) {
      const { editor } = createTestEditor({ children: [{ type: 'paragraph', children: [{ text: '' }] }] });
      const ai = editor.plugin(AIChatPlugin);
      ai.update.insertChunk(prefix);
      const { editor: oracle } = createTestEditor(editor.api.markdown.deserialize(source));
      let currentDuration = 0;
      let rawDuration = 0;
      const measureCurrent = () => {
        const start = performance.now();
        ai.update.insertChunk(chunk);
        currentDuration = performance.now() - start;
      };
      const measureRaw = () => {
        const start = performance.now();
        const value = editor.api.markdown.deserialize(prefix + chunk);
        rawDuration = performance.now() - start;
        const { editor: candidate } = createTestEditor(value);
        rawEqual &&= isDeepStrictEqual(candidate.read.children(), oracle.read.children());
      };
      if (run % 2 === 0) { measureCurrent(); measureRaw(); }
      else { measureRaw(); measureCurrent(); }
      currentEqual &&= isDeepStrictEqual(editor.read.children(), oracle.read.children());
      if (run === 0 || run >= 4) {
        current.push(currentDuration);
        raw.push(rawDuration);
      }
    }
    const summarize = ([cold, ...warm]: number[]) => ({ cold, warm, p95: warm.toSorted((a, b) => a - b)[9] });
    const row = { bytes: source.length, shape, chunk: chunk.length, current: summarize(current), rawParseOnly: summarize(raw), currentEqual, rawEqual };
    rows.push(row);
    console.log(JSON.stringify(row));
    writeFileSync('docs/plans/artifacts/ai-streaming/raw-source-probe.json', JSON.stringify({
      base: 'f03d2b8c23',
      scope: 'Last-chunk source-first parser rejection probe; candidate omits document reconciliation and rendering. This is not an acceptance benchmark.',
      samples: 10, warmups: 3, previewBudget: 16, rows,
    }, null, 2) + '\n');
  }
}
