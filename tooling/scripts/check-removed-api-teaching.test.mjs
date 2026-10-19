import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { findRemovedApiTeaching } from './check-removed-api-teaching.mjs';

const repository = () => {
  const root = mkdtempSync(path.join(tmpdir(), 'removed-api-teaching-'));
  const write = (file, text) => {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), `${text}\n`);
  };
  const git = (...args) => {
    const result = spawnSync('git', args, { cwd: root, encoding: 'utf-8' });
    assert.equal(result.status, 0, result.stderr);
  };
  const publish = (names, exports) => {
    write(
      'apps/www/src/generated/api-reference-manifest.json',
      JSON.stringify({
        packages: {
          platejs: {
            symbols: Object.fromEntries(
              names.map((name) => [`platejs:${name}`, { name }])
            ),
          },
        },
      })
    );
    write(
      'packages/platejs/package.json',
      JSON.stringify({ exports, name: 'platejs' })
    );
  };
  git('init', '-q');
  git('config', 'user.email', 'test@example.com');
  git('config', 'user.name', 'test');
  return { git, publish, root, write };
};

test('a teaching file that still names a removed export or entrypoint fails until it is rewritten', () => {
  const { git, publish, root, write } = repository();
  try {
    publish(['FizzPlugin', 'BuzzPlugin'], {
      '.': './index.js',
      './buzz': './buzz.js',
      './buzz/react': './buzz-react.js',
      './fizz': './fizz.js',
      './fizz/react': './fizz-react.js',
    });
    write(
      'content/docs/fizz.mdx',
      "import { FizzPlugin } from 'platejs/fizz';"
    );
    write(
      'docs/plans/topics/fizz.md',
      "import { X } from 'platejs/fizz/react';"
    );
    write(
      'content/docs/buzz.mdx',
      "import { BuzzPlugin } from 'platejs/buzz/react';"
    );
    write(
      'docs/plans/2026-01-01-fizz.md',
      'Cut `FizzPlugin` from `platejs/fizz`.'
    );
    write(
      'content/docs/v1.mdx',
      'Remove `@platejs/fizz` and `platejs/fizz-extra`.'
    );
    git('add', '-A');
    git('commit', '-q', '-m', 'base');

    publish(['BuzzPlugin'], {
      '.': './index.js',
      './buzz/react': './buzz-react.js',
    });
    write('content/docs/prose.mdx', 'A fizz plugin draws the menu.');

    assert.deepEqual(findRemovedApiTeaching({ base: 'HEAD', cwd: root }), {
      hits: [
        "content/docs/fizz.mdx:1:import { FizzPlugin } from 'platejs/fizz';",
        "docs/plans/topics/fizz.md:1:import { X } from 'platejs/fizz/react';",
      ],
      names: ['FizzPlugin'],
      specifiers: ['platejs/buzz', 'platejs/fizz', 'platejs/fizz/react'],
    });

    write('content/docs/fizz.mdx', "import { BuzzPlugin } from 'platejs';");
    write('docs/plans/topics/fizz.md', 'The copied fizz file owns it.');
    assert.deepEqual(
      findRemovedApiTeaching({ base: 'HEAD', cwd: root }).hits,
      []
    );
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test('a base commit that does not resolve fails instead of passing', () => {
  const { git, publish, root } = repository();
  try {
    publish(['FizzPlugin'], { '.': './index.js' });
    git('add', '-A');
    git('commit', '-q', '-m', 'base');
    assert.throws(
      () => findRemovedApiTeaching({ base: 'missing-base', cwd: root }),
      /cannot resolve the base commit missing-base/
    );
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});
