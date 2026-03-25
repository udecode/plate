import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const distEntry = pathToFileURL(
  resolve(currentDir, '../../dist/index.js')
).href;

describe('@platejs/csv ESM entrypoint', () => {
  it('loads in Node native ESM', () => {
    expect(() =>
      execFileSync(
        'node',
        [
          '--input-type=module',
          '--eval',
          `await import(${JSON.stringify(distEntry)});`,
        ],
        { stdio: 'pipe' }
      )
    ).not.toThrow();
  });
});
