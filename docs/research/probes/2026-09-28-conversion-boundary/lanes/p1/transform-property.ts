// Property check: separated edits transformed in a document converge (a·b' == b·a').
// Run from the repository root:
//   bun --preload ./config/plite-source-aliases.ts docs/research/probes/2026-09-28-conversion-boundary/lanes/p1/transform-property.ts
import { DocumentIndex } from '../../../../../../packages/plitejs/src/core/change/document-index';
import {
  RootChange,
  insertNodeChange,
  insertTextChange,
  mergeNodeChange,
  moveNodeChange,
  removeNodeChange,
  removeTextChange,
  setNodeChange,
  splitNodeChange,
} from '../../../../../../packages/plitejs/src/core/change/root-change';
import { jsonEqual } from '../../../../../../packages/plitejs/src/core/change/tokens';

let seed = 7;
const random = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};
const int = (n: number) => Math.floor(random() * n);
const paragraph = (text: string) => ({ type: 'p', children: [{ text }] });
const words = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'];

const randomChange = (document: DocumentIndex) => {
  const count = document.value.length;
  const index = int(count);
  const text = (document.value[index] as any).children[0].text as string;

  switch (int(8)) {
    case 0: return insertTextChange(document, [index, 0], int(text.length + 1), 'X');
    case 1: return text.length > 0 ? removeTextChange(document, [index, 0], 0, text.slice(0, 1 + int(text.length))) : null;
    case 2: return insertNodeChange(document, [int(count + 1)], paragraph(words[int(5)]) as any);
    case 3: return count > 1 ? removeNodeChange(document, [index]) : null;
    case 4: return setNodeChange(document, [index], { indent: 1 + int(3) });
    case 5: return text.length > 1 ? splitNodeChange(document, [index, 0], 1, {}) : null;
    case 6: return index > 0 && (document.value[index - 1] as any).children.length === 1 ? mergeNodeChange(document, [index]) : null;
    default: {
      const target = int(count);
      return count > 1 && target !== index ? moveNodeChange(document, [index], [target]) : null;
    }
  }
};

const separated = (a: RootChange, b: RootChange) => {
  const ranges: Array<[number, number]> = [];
  b.iterChangedRanges((from, to) => ranges.push([from, to]));
  let ok = true;
  a.iterChangedRanges((from, to) => {
    for (const [bFrom, bTo] of ranges) if (!(bTo < from || to < bFrom)) ok = false;
  });
  return ok;
};

let checked = 0;
for (let round = 0; round < 4000; round += 1) {
  const document = DocumentIndex.fromValue(Array.from({ length: 2 + int(6) }, () => paragraph(words[int(5)])) as any);
  let a: RootChange | null = null;
  let b: RootChange | null = null;
  try { a = randomChange(document); b = randomChange(document); } catch { continue; }
  if (!a || !b || a.empty || b.empty || !separated(a, b)) continue;
  const transformed = RootChange.transformInDocument(a, b, document);
  const afterA = a.apply(document);
  const afterB = b.apply(document);
  const left = transformed.b.apply(afterA).value;
  const right = transformed.a.apply(afterB).value;
  if (!jsonEqual(left, right)) {
    console.error('DIVERGED', JSON.stringify({ doc: document.value, a: a.toJSON(), b: b.toJSON(), left, right }));
    process.exit(1);
  }
  checked += 1;
}
console.log(`transform property: ${checked} separated pairs converged`);
