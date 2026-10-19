// Copy into a checkout (the source aliases resolve only inside one), then from its root:
//   bun --expose-gc --preload ./config/plite-source-aliases.ts <copied path> <blocks> [--mutable] [--wrong-guard]
// --mutable passes a plain caller object instead of the document editor.read.value() returns.
import { createEditor, createEditorView } from 'plitejs';

const blocks = Number(process.argv[2] ?? 10_000);
const mutable = process.argv.includes('--mutable');
// Control: --wrong-guard expects text the view never shows, which the guard must refuse.
const expected = process.argv.includes('--wrong-guard') ? 'z' : mutable ? 'b' : 'a';
const make = (n: number, tag: string) =>
  Array.from({ length: n }, (_, i) => ({ type: 'paragraph', children: [{ text: `${tag}${i}` }] }));
const gc = () => (globalThis as { gc?: () => void }).gc?.();
const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

const editor = createEditor({ initialValue: { children: make(blocks, 'a') } });
const document = mutable ? { children: make(blocks, 'b') } : editor.read.value();

createEditorView(editor, { document });

const samples: number[] = [];
for (let i = 0; i < 23; i++) {
  gc();
  const t = performance.now();
  const view = createEditorView(editor, { document });
  const elapsed = performance.now() - t;
  const last = view.read.children()[blocks - 1] as { children: { text: string }[] };

  if (view.read.children().length !== blocks || last.children[0].text !== `${expected}${blocks - 1}`) {
    throw new Error(`view did not read the document round ${i}`);
  }
  if (i >= 3) samples.push(elapsed);
}
console.log(JSON.stringify({ blocks, mutable, view: median(samples) }));
