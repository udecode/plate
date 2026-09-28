// PROTOTYPE — B4 follow-up: is inline-tag superlinearity the tag grammar or the shared tokenizer?
import remarkParse from '../../../../packages/platejs/node_modules/remark-parse/index.js';
import remarkGfm from '../../../../packages/platejs/node_modules/remark-gfm/index.js';
import remarkMath from '../../../../packages/platejs/node_modules/remark-math/index.js';
import { unified } from '../../../../packages/platejs/node_modules/unified/index.js';
import { remarkPlateTags } from './plateTags';
const TAGS: any = { u: { kind: 'inline' } };
const plain = unified().use(remarkParse).use([remarkMath, remarkGfm]);
const cand = unified().use(remarkParse).use([remarkMath, remarkGfm]).use(remarkPlateTags, { tags: TAGS });
const med = (fn: () => void) => { for (let i = 0; i < 3; i++) fn(); const t: number[] = []; for (let i = 0; i < 9; i++) { const s = performance.now(); fn(); t.push(performance.now() - s); } return t.sort((a, b) => a - b)[4]; };
const build = (n: number) => Array.from({ length: n }, (_, i) => `<u>w${i}</u>`).join(' ');
const rows = [500, 1000, 2000, 4000].map((n) => { const s = build(n); return [n, med(() => plain.parse(s)), med(() => cand.runSync(cand.parse(s)))]; });
for (const [n, p, c] of rows) console.log(`${n}: plain+gfm+math ${p.toFixed(1)} ms, candidate ${c.toFixed(1)} ms`);
console.log('growth per doubling (candidate):', rows.slice(1).map((r, i) => (r[2] / rows[i][2]).toFixed(2)).join(', '), '| plain:', rows.slice(1).map((r, i) => (r[1] / rows[i][1]).toFixed(2)).join(', '));
