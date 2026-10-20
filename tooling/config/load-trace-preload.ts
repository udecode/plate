import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const traceDir = process.env.TEST_LOAD_TRACE_DIR;

if (traceDir) {
  const trace = path.join(traceDir, `${process.pid}-${randomUUID()}`);
  const dump = () =>
    fs.writeFileSync(
      `${trace}.json`,
      JSON.stringify(Object.keys(createRequire(import.meta.url).cache))
    );

  fs.writeFileSync(`${trace}.start`, '');
  // `bun test` emits `exit` only when a test calls `process.exit`, so a test
  // process also dumps after its last file.
  process.on('exit', dump);

  try {
    const { afterAll } = await import('bun:test');

    afterAll(dump);
  } catch {
    // Outside `bun test`, `afterAll` throws and `exit` dumps.
  }
}
