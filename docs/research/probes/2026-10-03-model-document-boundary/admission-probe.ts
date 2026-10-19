// Copy into a checkout (the source aliases resolve only inside one), then from its root:
//   bun --expose-gc --preload ./config/plite-source-aliases.ts <copied path> <blocks> [--skip-replace]
// Pair runs of a baseline checkout and a candidate one; admission-probe-candidate.patch is the stand-in candidate at fe0e9599a6.
import { createEditor } from 'plitejs';

const blocks = Number(process.argv[2] ?? 100);
// Control: --skip-replace leaves the editor unreplaced, which the guard must refuse.
const skipReplace = process.argv.includes('--skip-replace');
const make = (n: number, tag: string) =>
  Array.from({ length: n }, (_, i) => ({ type: 'paragraph', children: [{ text: `${tag}${i}` }] }));
const gc = () => (globalThis as { gc?: () => void }).gc?.();
const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const time = (fn: () => void) => {
  gc();
  const t = performance.now();
  fn();
  return performance.now() - t;
};

const construct: number[] = [];
const replace: number[] = [];
for (let i = 0; i < 23; i++) {
  const initialValue = { children: make(blocks, 'a') };
  let editor!: ReturnType<typeof createEditor>;
  const c = time(() => { editor = createEditor({ initialValue }); });
  if ((editor.read.value().children[blocks - 1] as { children: { text: string }[] }).children[0].text !== `a${blocks - 1}`) {
    throw new Error('construction did not load');
  }
  const next = { children: make(blocks, `b${i}`) };
  const r = time(() => {
    if (!skipReplace) editor.update.value.replace(next);
  });
  const text = (at: number) => (editor.read.value().children[at] as { children: { text: string }[] }).children[0].text;
  if (editor.read.value().children.length !== blocks || text(0) !== `b${i}0` || text(blocks - 1) !== `b${i}${blocks - 1}`) {
    throw new Error(`replace did not load round ${i}`);
  }
  if (i >= 3) { construct.push(c); replace.push(r); }
}
console.log(JSON.stringify({ blocks, construct: median(construct), replace: median(replace) }));
