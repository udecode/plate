import remarkEmoji from '../../../../packages/platejs/node_modules/remark-emoji/index.js';
import remarkGfm from '../../../../packages/platejs/node_modules/remark-gfm/index.js';
import remarkMath from '../../../../packages/platejs/node_modules/remark-math/index.js';
// PROTOTYPE — writer round trips with hostile literals (review point 4).
import { createTestEditor } from '../../../../packages/platejs/src/markdown/lib/__tests__/createTestEditor';
import { remarkPlateTags } from './plateTags';
const TAGS: any = Object.fromEntries(['audio','block','callout','codeDrawing','column','columnGroup','details','figure','figcaption','file','img','mediaEmbed','summary','toc','video'].map((n) => [n, { kind: 'block', ...(n === 'img' ? { void: true } : {}) }]).concat(['date','del','kbd','mark','span','sub','sup','u'].map((n) => [n, { kind: 'inline' }])));
const e = createTestEditor();
const P = [remarkMath, remarkGfm, [remarkPlateTags, { tags: TAGS }], remarkEmoji] as any;
const ser = (children: any[]) => e.api.markdown.serialize({ document: { children } as any, lossPolicy: 'allow', remarkPlugins: P } as any);
const parse = (s: string) => e.api.markdown.parse(s, { lossPolicy: 'allow', remarkPlugins: P, withoutMdx: true } as any);
const p = (text: string, extra: any = {}) => ({ type: 'paragraph', children: [{ text, ...extra }] });
const cases: [string, any[]][] = [
  ['literal <callout> text', [p('see <callout>x</callout> and </callout> end')]],
  ['literal <del> and <u> text', [p('html <del>gone</del> <u>u</u> <img src=x>')]],
  ['literal tag at line start', [p('<callout>')]],
  ['inline code with tag', [p('<callout icon="x">', { code: true })]],
  ['code block with tags', [{ type: 'codeBlock', language: 'html', children: [{ text: '<callout>\n</callout>' }] }]],
  ['attr with quote/amp/lt', [{ type: 'callout', icon: 'a"b&c<d>\'e', children: [{ text: 'hi' }] }]],
  ['attr with newline', [{ type: 'callout', icon: 'line1\nline2', children: [{ text: 'hi' }] }]],
  ['attr numeric-looking string', [{ type: 'callout', icon: '123', children: [{ text: 'hi' }] }]],
  ['attr json-looking string', [{ type: 'callout', icon: '{"a":1}', children: [{ text: 'hi' }] }]],
  ['nested identical details', [{ type: 'details', children: [{ type: 'summary', children: [{ text: 'outer' }] }, { type: 'details', children: [{ type: 'summary', children: [{ text: 'inner' }] }, p('deep')] }] }]],
  ['text with braces and entities', [p('{x} &amp; &lt;b&gt; \\<callout>')]],
];
for (const [label, children] of cases) {
  let out: string; let back: any;
  try { const r: any = ser(children); out = r.ok ? r.data : `SERIALIZE FAIL ${JSON.stringify(r.diagnostics[0])}`; } catch (x) { out = `SERIALIZE THROW ${String(x).slice(0, 120)}`; }
  try { back = out.startsWith('SERIALIZE') ? null : parse(out); } catch (x) { back = { threw: String(x).slice(0, 120) }; }
  const norm = (v: any): any => Array.isArray(v) ? v.map(norm) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, norm(v[k])])) : v;
  const same = back?.ok && JSON.stringify(norm(back.document.children)) === JSON.stringify(norm(children));
  console.log(`\n## ${label}: ${same ? 'ROUND-TRIP OK' : 'DIFFERS'}\n  md: ${JSON.stringify(out)}\n  back: ${JSON.stringify(back?.ok ? back.document.children : back).slice(0, 300)}`);
}
