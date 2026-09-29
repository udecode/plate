// Splits two final HTML dumps into top-level blocks (data-editor-path without a comma)
// and reports how many differ, grouped by the first tag/class of the block.
import { readdirSync, readFileSync } from 'node:fs';
const [dir, composition, cellIndex = '0'] = process.argv.slice(2);
const files = readdirSync(dir).filter((f) => f.endsWith('.html') && f.startsWith(`${composition}-`)).sort((a, b) => +a.split('-')[2].split('.')[0] - +b.split('-')[2].split('.')[0]);
// Each cell saved 4 baseline + 4 candidate streams, in order.
const cell = files.slice(+cellIndex * 8, +cellIndex * 8 + 8);
const pick = (arm) => readFileSync(`${dir}/${cell.find((f) => f.includes(`-${arm}-`))}`, 'utf8');
const split = (html) => {
  const out = new Map();
  const re = /data-editor-path="(\d+)"/g;
  let m; const starts = [];
  while ((m = re.exec(html))) {
    const tagStart = html.lastIndexOf('<', m.index);
    if (!starts.some(([p]) => p === m[1])) starts.push([m[1], tagStart]);
  }
  starts.forEach(([p, s], i) => out.set(p, html.slice(s, i + 1 < starts.length ? starts[i + 1][1] : html.length)));
  return out;
};
const b = split(pick('baseline'));
const c = split(pick('candidate'));
const groups = {};
let differ = 0;
for (const [p, hb] of b) {
  const hc = c.get(p);
  if (hb === hc) continue;
  differ += 1;
  const kind = hb.includes('<pre') ? 'code block' : hb.includes('data-editor-ai-end') || hc?.includes('data-editor-ai-end') ? 'ai-end marker' : (hb.match(/^<(\w+)[^>]*class="([^" ]*)/)?.slice(1).join('.') ?? 'other');
  (groups[kind] ??= []).push(p);
  if (kind !== 'code block' && kind !== 'ai-end marker' && groups[kind].length === 1) {
    let i = 0; while (i < hb.length && hb[i] === hc?.[i]) i++;
    console.log(`sample diff ${kind} block ${p}:\n  BASE ${hb.slice(Math.max(0, i - 150), i + 150)}\n  CAND ${hc?.slice(Math.max(0, i - 150), i + 150)}`);
  }
}
console.log(files.length, 'files;', cell.length, 'in cell', cellIndex, '| blocks', b.size, c.size, 'differ', differ, JSON.stringify(Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.length]))));
