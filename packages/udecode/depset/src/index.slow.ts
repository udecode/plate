import { afterEach, describe, expect, it } from 'bun:test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directories: string[] = [];

afterEach(() => {
  for (const directory of directories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('depset version queries', () => {
  it.each([
    { packageName: 'package name', specifier: 'package name' },
    { packageName: '@example/package', specifier: '@example' },
    { packageName: 'example-package', specifier: 'example-*', target: '1.2' },
    {
      packageName: '@example/package',
      specifier: '@example/package',
      target: '1.2.3-beta.1',
    },
    { packageName: '--help', specifier: '*' },
  ])('keeps the query for $packageName intact', ({
    packageName,
    specifier,
    target,
  }) => {
    const directory = mkdtempSync(path.join(tmpdir(), 'depset-query-'));
    directories.push(directory);
    writeFileSync(
      path.join(directory, 'package.json'),
      JSON.stringify({ dependencies: { [packageName]: '1.0.0' } })
    );
    writeFileSync(
      path.join(directory, 'npm'),
      `#!/usr/bin/env node
const fs = require('node:fs');
fs.writeFileSync(process.env.DEPSET_TEST_ARGS, JSON.stringify(process.argv.slice(2)));
process.stdout.write(JSON.stringify('1.0.0'));
`,
      { mode: 0o755 }
    );
    writeFileSync(path.join(directory, 'npm.cmd'), '@node "%~dp0npm" %*\r\n');

    const result = spawnSync(
      process.env.DEPSET_TEST_RUNTIME || process.execPath,
      [
        process.env.DEPSET_TEST_ENTRY ||
          fileURLToPath(new URL('./index.ts', import.meta.url)),
        specifier,
        ...(target ? [target] : ['--latest']),
        '--yes',
        '--silent',
        '--cwd',
        directory,
      ],
      {
        encoding: 'utf8',
        env: {
          ...process.env,
          DEPSET_TEST_ARGS: path.join(directory, 'args.json'),
          PATH: `${directory}${path.delimiter}${process.env.PATH}`,
        },
        timeout: 10_000,
      }
    );

    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    const args = JSON.parse(
      readFileSync(path.join(directory, 'args.json'), 'utf8')
    );
    expect(args).toEqual([
      'view',
      '--json',
      '--',
      target ? `${packageName}@<=${target}` : packageName,
      'version',
    ]);
  });
});
