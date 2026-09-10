import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

test('DOM setup supports stream parsers captured by the first imported module', (t) => {
  const fixture = mkdtempSync(join(tmpdir(), 'plate-test-streams-'));
  t.after(() => rmSync(fixture, { force: true, recursive: true }));
  const file = join(fixture, 'streams.test.ts');
  writeFileSync(
    file,
    `import { expect, test } from 'bun:test';
import { ReadableStream as NativeReadableStream } from 'node:stream/web';

class ImportedParser extends TransformStream {
  constructor() {
    super({ transform(chunk, controller) { controller.enqueue(chunk); } });
  }
}

test('native response streams pass through import-time parsers', async () => {
  const source = new NativeReadableStream({
    start(controller) { controller.enqueue('streamed'); controller.close(); },
  });
  const reader = source.pipeThrough(new ImportedParser()).getReader();
  expect(await reader.read()).toEqual({ done: false, value: 'streamed' });
  expect(await reader.read()).toEqual({ done: true, value: undefined });
});
`
  );
  const result = spawnSync(
    'bun',
    [
      'test',
      '--preload',
      fileURLToPath(new URL('../config/bunTestSetup.ts', import.meta.url)),
      file,
    ],
    { cwd: fixture, encoding: 'utf-8', timeout: 15_000 }
  );
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
