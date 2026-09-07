import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

const templates = ['plate-template', 'plate-playground-template'];
const commands = [
  'install --no-frozen-lockfile',
  'lint',
  'typecheck',
  'run build',
];
const expected = templates.flatMap((template) =>
  commands.map((command) => `${template}:${command}`)
);

function verify(failAt = '') {
  const root = mkdtempSync(path.join(os.tmpdir(), 'template-check-'));
  try {
    mkdirSync(path.join(root, 'tooling/scripts'), { recursive: true });
    mkdirSync(path.join(root, 'bin'));
    for (const template of templates)
      mkdirSync(path.join(root, 'templates', template), { recursive: true });
    copyFileSync(
      new URL('./check-templates.sh', import.meta.url),
      path.join(root, 'tooling/scripts/check-templates.sh')
    );
    writeFileSync(
      path.join(root, 'bin/bun'),
      `#!/usr/bin/env bash
entry="$(basename "$PWD"):$*"
printf '%s\\n' "$entry" >> "$TEMPLATE_TEST_LOG"
if [[ "$entry" == "$TEMPLATE_TEST_FAIL" ]]; then exit 23; fi
`,
      { mode: 0o755 }
    );
    const log = path.join(root, 'calls.log');
    const result = spawnSync(
      'bash',
      [path.join(root, 'tooling/scripts/check-templates.sh')],
      {
        cwd: os.tmpdir(),
        env: {
          ...process.env,
          PATH: `${root}/bin:${process.env.PATH}`,
          TEMPLATE_TEST_LOG: log,
          TEMPLATE_TEST_FAIL: failAt,
        },
        encoding: 'utf8',
      }
    );
    return {
      status: result.status,
      calls: readFileSync(log, 'utf8').trim().split('\n'),
    };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('verifies both templates in order from any working directory', () => {
  const result = verify();
  assert.equal(result.status, 0);
  assert.deepEqual(result.calls, expected);
});

for (const [index, step] of expected.entries()) {
  test(`stops and propagates failure at ${step}`, () => {
    const result = verify(step);
    assert.equal(result.status, 23);
    assert.deepEqual(result.calls, expected.slice(0, index + 1));
  });
}
