import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Fills one trial's arm prompts from its arm-base.md and arm-methods.md.
// usage: node trials-fill.mjs <trial dir> [ARM=<letter>] KEY=value ...; ARM fills only that arm, from its own snapshot's paths.
const [dir, ...pairs] = process.argv.slice(2);
const values = Object.fromEntries(pairs.map((pair) => pair.split(/=(.*)/s).slice(0, 2)));
const fill = (text) => text.replace(/\{\{([A-Z0-9]+)\}\}/g, (match, name) => values[name] ?? match);
const base = readFileSync(join(dir, 'arm-base.md'), 'utf8');
const lines = readFileSync(join(dir, 'arm-methods.md'), 'utf8')
  .split('\n')
  .filter((line) => /^[A-Z]: /.test(line) && (!values.ARM || line[0] === values.ARM));
for (const line of lines) {
  const arm = line[0];
  const prompt = fill(base.replace('{{METHOD}}', line.slice(3).trim()));
  if (prompt.includes('{{')) throw new Error(`arm ${arm} prompt still has a placeholder: ${prompt.match(/\{\{[A-Z0-9]+\}\}/)[0]}`);
  writeFileSync(join(dir, `arm-${arm}-prompt.md`), prompt);
  console.log(`${dir}/arm-${arm}-prompt.md ${prompt.length} chars`);
}
