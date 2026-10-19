// Property check: local DocumentIndex.slice equals slicing the whole-document token encoding.
// Run from the repository root:
//   bun --preload ./config/plite-source-aliases.ts docs/research/probes/2026-09-28-conversion-boundary/lanes/p1/slice-property.ts
import { DocumentIndex } from '../../../../../../packages/plitejs/src/core/change/document-index';
import { encodeNodes } from '../../../../../../packages/plitejs/src/core/change/tokens';

let seed = 42;
const random = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};
const int = (n: number) => Math.floor(random() * n);
const text = () => ({ text: 'abcdefgh'.slice(0, int(6)), ...(random() < 0.3 ? { bold: true } : {}) });
const node = (depth: number): any =>
  depth === 0 || random() < 0.3
    ? text()
    : { type: random() < 0.5 ? 'p' : 'list', ...(random() < 0.2 ? { indent: int(3) } : {}), children: Array.from({ length: 1 + int(3) }, () => node(depth - 1)) };

let checks = 0;
for (let doc = 0; doc < 300; doc += 1) {
  const value = Object.freeze(Array.from({ length: 1 + int(6) }, () => node(3)).filter((n) => 'children' in n));
  if (value.length === 0) continue;
  const document = DocumentIndex.fromValue(JSON.parse(JSON.stringify(value)));
  const reference = encodeNodes(document.value).slice;
  for (let range = 0; range < 40; range += 1) {
    const a = int(document.length + 1);
    const b = int(document.length + 1);
    const from = Math.min(a, b);
    const to = Math.max(a, b);
    // A fresh index so the slice cannot reuse a materialized token cache.
    const fresh = DocumentIndex.fromValue(JSON.parse(JSON.stringify(document.value)));
    const expected = JSON.stringify(reference.slice(from, to).toJSON());
    const actual = JSON.stringify(fresh.slice(from, to).toJSON());
    if (expected !== actual) {
      console.error('MISMATCH', { from, to, expected, actual, value: JSON.stringify(document.value) });
      process.exit(1);
    }
    checks += 1;
  }
}
console.log(`slice property: ${checks} ranges matched`);
