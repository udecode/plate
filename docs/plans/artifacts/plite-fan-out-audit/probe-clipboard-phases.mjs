import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createEditor } from '../../../../packages/plitejs/src/index.ts';
import { dom } from '../../../../packages/plitejs/src/dom/index.ts';
import { EDITOR_TO_WINDOW } from '../../../../packages/plitejs/src/dom/internal/index.ts';
import {
  writeDOMFragmentData,
  writeDOMSelectionData,
} from '../../../../packages/plitejs/src/dom/plugin/dom-clipboard-runtime.ts';

const blocks = 10000;
const value = Array.from({ length: blocks }, (_, index) => ({
  type: 'paragraph',
  children: [{ text: `${index} this is a test demo. Plite clipboard benchmark line.` }],
}));
const setup = () => {
const editor = createEditor({
  initialValue: value,
  initialSelection: {
    kind: 'text',
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [blocks - 1, 0], offset: value.at(-1).children[0].text.length },
  },
  extensions: [dom()],
});
EDITOR_TO_WINDOW.set(editor, {
  atob: (value) => Buffer.from(value, 'base64').toString('binary'),
  btoa: (value) => Buffer.from(value).toString('base64'),
});
return editor;
};
const createData = () => {
  const store = new Map();
  return { getData: (key) => store.get(key) ?? '', setData: (key, value) => store.set(key, value) };
};
const rows = [];
for (const [name, run] of [
  ['slice', (editor) => editor.read.slice.export()],
  ['write-fragment', (_editor, slice) => writeDOMFragmentData(createData(), { slice, html: ({ text }) => `<span>${text}</span>` })],
  ['copy', (editor) => writeDOMSelectionData(editor, createData())],
]) {
  const samples = [];
  const durations = new Map();
  for (let index = 0; index < Number(process.env.CLIPBOARD_PHASE_SAMPLES ?? 10); index += 1) {
    const editor = setup();
    const slice = name === 'write-fragment' ? editor.read.slice.export() : null;
    if (slice) assert.equal(slice.content.length, blocks);
    globalThis.gc?.();
    if (process.env.CLIPBOARD_PHASE_PROFILE) {
      globalThis.__PLITE_REACT_RENDER_PROFILER__ = {
        record(event) {
          if (event.duration !== undefined) durations.set(event.id, (durations.get(event.id) ?? 0) + event.duration);
        },
      };
    }
    const start = performance.now();
    run(editor, slice);
    samples.push(performance.now() - start);
    globalThis.__PLITE_REACT_RENDER_PROFILER__ = undefined;
  }
  samples.sort((a, b) => a - b);
  const row = { name, p50: samples[Math.floor(samples.length / 2)], max: samples.at(-1), durations: [...durations.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15) };
  rows.push(row);
  process.stdout.write(`${JSON.stringify(row)}\n`);
}
