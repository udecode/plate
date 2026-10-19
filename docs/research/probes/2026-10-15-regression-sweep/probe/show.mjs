import { readFileSync } from 'node:fs';

const [file, ...names] = process.argv.slice(2);
const r = JSON.parse(readFileSync(file, 'utf8'));
const trim = (v) => (typeof v === 'string' ? v.slice(0, 80) : Array.isArray(v) ? v.map((b) => String(b).slice(0, 40)) : v);
for (const d of r.diffs) {
  if (!d.fields.length || (names.length && !names.includes(d.step))) continue;
  console.log(`# ${d.step}`);
  for (const f of d.fields) console.log(`  ${f}: ref=${JSON.stringify(trim(d.ref[f]))} test=${JSON.stringify(trim(d.test[f]))}`);
}
