import { readdirSync, readFileSync, existsSync } from 'node:fs';

const [dir, engine = 'chromium'] = process.argv.slice(2);
for (const ex of readdirSync(dir).sort()) {
  const file = `${dir}/${ex}/differential-${engine}.json`;
  if (!existsSync(file)) continue;
  const r = JSON.parse(readFileSync(file, 'utf8'));
  const fail = `${r.ref.failed ? `REF-FAIL(${r.ref.failed}) ` : ''}${r.test.failed ? `TEST-FAIL(${r.test.failed}) ` : ''}`;
  const diffs = r.diffs.filter((d) => d.fields.length).map((d) => `${d.step}:${d.fields.join('+')}`);
  console.log(`${ex.padEnd(20)} ${fail}${diffs.join(' | ') || 'no diff'}  errors ref=${r.ref.errors.length} test=${r.test.errors.length}`);
}
