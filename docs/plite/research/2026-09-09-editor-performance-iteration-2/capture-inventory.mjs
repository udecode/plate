import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const [root, output, ...paths] = process.argv.slice(2);
if (!root || !output || paths.length === 0)
  throw new Error('Expected repository root, output JSON, and source paths');

const files = execFileSync('rg', ['--files', ...paths], {
  cwd: root,
  encoding: 'utf8',
})
  .trim()
  .split('\n')
  .filter(Boolean)
  .sort();
const inventory = files.map((path) => {
  const bytes = readFileSync(resolve(root, path));
  return {
    path,
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    testSource:
      /(?:^|\/)(?:test|tests|__tests__)\/|\.(?:test|spec|slow)\.[^.]+$/.test(
        path
      ),
    disposition: 'inventoried; semantic review recorded separately',
  };
});
writeFileSync(
  output,
  JSON.stringify({ root: resolve(root), paths, files: inventory }, null, 2) +
    '\n'
);
console.log(
  JSON.stringify({
    output,
    files: inventory.length,
    testFiles: inventory.filter((file) => file.testSource).length,
  })
);
