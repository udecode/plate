import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  PieceTreeBase,
  StringBuffer,
  createLineStartsFast,
} from '../../../../../vscode/src/vs/editor/common/model/pieceTreeTextBuffer/pieceTreeBase.ts';

const root = resolve(import.meta.dirname, '../../../..');
const sourcePath = resolve(
  root,
  '../vscode/src/vs/editor/common/model/pieceTreeTextBuffer/pieceTreeBase.ts'
);
const sourceSha256 = createHash('sha256')
  .update(readFileSync(sourcePath))
  .digest('hex');
const makeTree = (text: string) =>
  new PieceTreeBase(
    [new StringBuffer(text, createLineStartsFast(text))],
    '\n',
    false
  );
const quantile = (values: number[], q: number) =>
  [...values].sort((a, b) => a - b)[
    Math.max(0, Math.ceil(values.length * q) - 1)
  ];
const summarize = (values: number[]) => ({
  samples: values.length,
  p50: quantile(values, 0.5),
  p75: quantile(values, 0.75),
  p95: quantile(values, 0.95),
  max: Math.max(...values),
});
const cases: unknown[] = [];

for (const lines of [100, 1000, 10000]) {
  const initial = Array.from(
    { length: lines },
    (_, index) => `line ${index} ${'source text '.repeat(6)}`
  ).join('\n');
  for (const pattern of ['adjacent', 'scattered'] as const) {
    for (const materializeEveryEdit of [false, true]) {
      const timings = { string: [] as number[], pieceTree: [] as number[] };
      const preparation = { string: [] as number[], pieceTree: [] as number[] };
      for (let sample = -3; sample < 31; sample++) {
        const surfaces =
          sample % 2 === 0
            ? (['string', 'pieceTree'] as const)
            : (['pieceTree', 'string'] as const);
        let expected = '';
        const outputs = new Map<string, string>();
        for (const surface of surfaces) {
          const startSetup = performance.now();
          let text = initial;
          const tree = surface === 'pieceTree' ? makeTree(initial) : null;
          const setupMs = performance.now() - startSetup;
          const start = performance.now();
          let checksum = 0;
          for (let operation = 0; operation < 200; operation++) {
            const offset =
              pattern === 'adjacent'
                ? Math.floor(initial.length / 2)
                : (operation * 7919) % (initial.length - 4);
            const inserted =
              operation % 11 === 0 ? '\r\n' : operation % 7 === 0 ? '😀' : 'a';
            if (tree) {
              tree.insert(offset, inserted, false);
              tree.delete(offset, inserted.length);
              if (materializeEveryEdit) {
                const value = tree.getLinesRawContent();
                checksum += value.charCodeAt(operation % value.length);
              }
            } else {
              text = text.slice(0, offset) + inserted + text.slice(offset);
              text =
                text.slice(0, offset) + text.slice(offset + inserted.length);
              if (materializeEveryEdit)
                checksum += text.charCodeAt(operation % text.length);
            }
          }
          const elapsed = performance.now() - start;
          const final = tree ? tree.getLinesRawContent() : text;
          outputs.set(surface, final);
          assert.equal(final, initial);
          assert.ok(Number.isFinite(checksum));
          expected = initial;
          if (sample >= 0) {
            timings[surface].push(elapsed);
            preparation[surface].push(setupMs);
          }
        }
        assert.equal(outputs.get('string'), expected);
        assert.equal(outputs.get('pieceTree'), expected);
      }
      cases.push({
        lines,
        utf16Units: initial.length,
        pattern,
        materializeEveryEdit,
        operation:
          '200 insert/delete pairs, with complete text materialization after every pair in the read-heavy cohort',
        timingsMs: Object.fromEntries(
          Object.entries(timings).map(([key, values]) => [
            key,
            summarize(values),
          ])
        ),
        preparationMs: Object.fromEntries(
          Object.entries(preparation).map(([key, values]) => [
            key,
            summarize(values),
          ])
        ),
        rawTimingsMs: timings,
        correctness:
          'All final strings equal the input. This paired edit probe checks UTF-16 and CRLF round trips; it does not establish native grapheme navigation.',
      });
    }
  }
}

const oracle = 'a\r\n😀e\u0301\nאבג\rfinal';
const tree = makeTree(oracle);
for (let offset = 0; offset <= oracle.length; offset++) {
  const position = tree.getPositionAt(offset);
  assert.equal(tree.getOffsetAt(position.lineNumber, position.column), offset);
}
assert.equal(tree.getLinesRawContent(), oracle);
const result = {
  capturedAt: new Date().toISOString(),
  sourcePath,
  sourceSha256,
  samples: 31,
  warmups: 3,
  policy:
    'Disposable mechanism probe, not a Plate implementation or editor performance rank. The adjacent/scattered edit pair and whole-string consumer contract are identical. Setup is separate. No p99 is reported. DOM, syntax parsing, selection, history, collaboration and native input are outside this probe.',
  cases,
  positionRoundTrip: {
    utf16Units: oracle.length,
    offsets: oracle.length + 1,
    pass: true,
  },
};
writeFileSync(
  resolve(
    root,
    'docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2/piece-tree-probe.json'
  ),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(
  JSON.stringify(
    cases.map((entry: any) => ({
      lines: entry.lines,
      pattern: entry.pattern,
      materializeEveryEdit: entry.materializeEveryEdit,
      stringP95: entry.timingsMs.string.p95,
      pieceTreeP95: entry.timingsMs.pieceTree.p95,
    }))
  )
);
process.exit(0);
