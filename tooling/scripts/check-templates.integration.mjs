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

function updateTemplate(failInstall = false) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'template-update-'));
  try {
    mkdirSync(path.join(root, 'bin'));
    mkdirSync(path.join(root, 'templates/plate-template/src'), {
      recursive: true,
    });
    for (const [name, version] of Object.entries({
      '@biomejs/biome': '2.5.0',
      '@typescript-eslint/parser': '8.56.1',
      eslint: '10.2.1',
      'eslint-plugin-react-hooks': '7.1.1',
      typescript: '6.0.2',
      ultracite: '7.8.3',
    })) {
      const directory = path.join(root, 'node_modules', name);
      mkdirSync(directory, { recursive: true });
      writeFileSync(
        path.join(directory, 'package.json'),
        JSON.stringify({ name, version })
      );
    }
    writeFileSync(
      path.join(root, 'bin/bun'),
      `#!/usr/bin/env bash
printf '%s\\n' "$*" >> "$TEMPLATE_TEST_LOG"
if [[ "$1" == add && "$TEMPLATE_TEST_FAIL" == true ]]; then exit 23; fi
`,
      { mode: 0o755 }
    );
    writeFileSync(path.join(root, 'bin/pnpm'), '#!/bin/sh\nexit 0\n', {
      mode: 0o755,
    });
    const log = path.join(root, 'calls.log');
    const result = spawnSync(
      'bash',
      [new URL('./update-template.sh', import.meta.url).pathname, 'basic'],
      {
        cwd: root,
        env: {
          ...process.env,
          PATH: `${root}/bin:${process.env.PATH}`,
          TEMPLATE_TEST_LOG: log,
          TEMPLATE_TEST_FAIL: String(failInstall),
          TEMPLATE_SKIP_VERIFY: 'false',
          TEMPLATE_REGISTRY_URL: '',
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

test('installs repository toolchain after dependency updates and before lint', () => {
  const result = updateTemplate();
  assert.equal(result.status, 0);
  assert.deepEqual(result.calls, [
    'update --latest',
    'add --dev --exact @biomejs/biome@2.5.0 @typescript-eslint/parser@8.56.1 eslint@10.2.1 eslint-plugin-react-hooks@7.1.1 typescript@6.0.2 ultracite@7.8.3',
    'lint:fix',
    'typecheck',
  ]);
});

test('stops before lint if installing the repository toolchain fails', () => {
  const result = updateTemplate(true);
  assert.equal(result.status, 23);
  assert.deepEqual(result.calls, [
    'update --latest',
    'add --dev --exact @biomejs/biome@2.5.0 @typescript-eslint/parser@8.56.1 eslint@10.2.1 eslint-plugin-react-hooks@7.1.1 typescript@6.0.2 ultracite@7.8.3',
  ]);
});
