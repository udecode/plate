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
  const publish = (names, exports, signatures = {}) => {
    write(
      'apps/www/src/generated/api-reference-manifest.json',
      JSON.stringify({
        packages: {
          platejs: {
            symbols: Object.fromEntries(
              names.map((name) => [
                `platejs:${name}`,
                { name, signature: signatures[name] },
              ])
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

test('a teaching file that still names a member cut from a public type fails, unless the API or package source still uses it', () => {
  const { git, publish, root, write } = repository();
  const buzz = 'type BuzzOptions = {\n  classPrefix?: string;\n};';
  try {
    publish(
      ['FizzHighlighter', 'BuzzOptions'],
      { '.': './index.js' },
      {
        BuzzOptions: buzz,
        FizzHighlighter:
          'type FizzHighlighter = {\n  highlight(value: string): Root;\n  highlightAuto(value: string): Root;\n  classPrefix?: string;\n  lineNumbers?: boolean;\n  scrollOffset?: number;\n};',
      }
    );
    write(
      'docs/research/sources/fizz.md',
      'The reader calls `highlightAuto(text)` for `auto`.'
    );
    write(
      'docs/plans/topics/fizz.md',
      '| `highlightAuto` | Cut because it ran every grammar. |'
    );
    write(
      'content/docs/migration/v2.mdx',
      'Remove `highlightAuto` and pick a language.'
    );
    write('.agents/rules/fizz/fixtures/pr.json', '{ "highlightAuto": false }');
    write('content/docs/fizz.mdx', 'Pass a `classPrefix` to name the classes.');
    write('content/docs/lines.mdx', 'Set `lineNumbers` to number the lines.');
    write('packages/fizz/src/lines.ts', 'export const lineNumbers = true;');
    write('content/docs/toc.mdx', 'Pass `scrollOffset` to the copied element.');
    write(
      'apps/www/src/registry/components/editor/toc.tsx',
      'export function Toc({ scrollOffset }) {}'
    );
    git('add', '-A');
    git('commit', '-q', '-m', 'base');

    publish(
      ['FizzHighlighter', 'BuzzOptions'],
      { '.': './index.js' },
      {
        BuzzOptions: buzz,
        FizzHighlighter:
          'type FizzHighlighter = {\n  highlight(value: string): Root;\n};',
      }
    );

    assert.deepEqual(findRemovedApiTeaching({ base: 'HEAD', cwd: root }), {
      hits: [
        'docs/research/sources/fizz.md:1:The reader calls `highlightAuto(text)` for `auto`.',
      ],
      names: ['highlightAuto'],
      specifiers: [],
    });
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
