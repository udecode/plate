import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { sweep, termPattern } from './teaching-sweep.mjs';

test('a name matches its paraphrases with at most one word between its words', () => {
  const matches = (name, line) => new RegExp(termPattern(name), 'i').test(line);

  for (const line of [
    'fizzBuzz: true,',
    'the optional fizz DOM buzz adapter.',
    'Dropped files become uploads when the plugin accepts fizz buzzes.',
    'set fizz-buzz',
  ]) {
    assert.ok(matches('fizzBuzz', line), line);
  }
  for (const line of ['fizz drag and buzz', 'buzz fizz']) {
    assert.ok(!matches('fizzBuzz', line), line);
  }
  assert.ok(matches('XYZQuuxPlugin', 'the XYZ quux plugin'), 'acronym XYZQuux');
  assert.ok(matches('getXYZNode', 'get the XYZ node'), 'acronym getXYZNode');
  assert.throws(() => termPattern('原生 拖放'), /not an ASCII API name/);
});

test('the sweep groups hits by lifecycle and lists every Chinese twin of an English docs hit', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'teaching-sweep-'));
  const write = (file, text) => {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), `${text}\n`);
  };
  const git = (...args) => {
    const result = spawnSync('git', args, { cwd: root, encoding: 'utf-8' });
    assert.equal(result.status, 0, result.stderr);
  };
  const plan = (name, header) =>
    write(`docs/plans/${name}.md`, `${header}\n\nSet \`fizzBuzz: true\`.`);

  try {
    write('content/docs/media.mdx', 'the optional fizz DOM buzz adapter.');
    write('content/docs/media.cn.mdx', '`fizzBuzz` 为 `true` 时放置文件。');
    write('content/docs/other.mdx', 'accepts fizz buzzes');
    write('content/docs/other.cn.mdx', '接受原生拖放');
    write('content/docs/colon:name.mdx', 'fizzBuzz');
    write('content/docs/colon:name.cn.mdx', '原生');
    write('content/docs/new\nline.mdx', 'fizzBuzz');
    plan('2026-01-01-done', 'Status: executed');
    plan('2026-01-02-open', 'Status: building');
    plan(
      '2026-01-03-phased',
      '---\nstatus: active\n---\n\n# Phased\n\n## Phase 1\n\nStatus: executed'
    );
    plan('2026-01-04-unlabeled', '# Unlabeled');
    plan('2026-01-05-superseded', 'Status: superseded by 2026-01-01-done');
    plan(
      '2026-01-06-reopened',
      '---\nstatus: superseded\n---\n\n## Addendum\n\nStatus: active'
    );
    write('docs/plans/2026-01-02-open.decisions.tsv', 'fizzBuzz');
    write('.changeset/upload.md', '- Remove `fizzBuzz`');
    write(
      'apps/www/src/registry/changelog/entries/a.mdx',
      'The kit enables `fizzBuzz`.'
    );
    write('apps/www/public/r/upload.json', '"fizzBuzz: true"');
    git('init', '-q');
    git('add', '.');
    git(
      '-c',
      'user.name=t',
      '-c',
      'user.email=t@t',
      'commit',
      '-q',
      '-m',
      'fixture'
    );
    write('content/docs/untracked.mdx', 'fizzBuzz');

    const pathsOf = (lines) =>
      lines.map((line) => line.replace(/:\d+: .*$/s, ''));
    const committedLive = [
      'content/docs/colon:name.mdx',
      'content/docs/media.cn.mdx',
      'content/docs/media.mdx',
      'content/docs/new\nline.mdx',
      'content/docs/other.mdx',
      'docs/plans/2026-01-02-open.md',
      'docs/plans/2026-01-03-phased.md',
      'docs/plans/2026-01-04-unlabeled.md',
      'docs/plans/2026-01-06-reopened.md',
    ];
    for (const [rev, cwd, live] of [
      ['HEAD', root, committedLive],
      [
        undefined,
        path.join(root, 'docs'),
        [...committedLive, 'content/docs/untracked.mdx'],
      ],
    ]) {
      const { groups, twins } = sweep({ cwd, rev, terms: ['fizzBuzz'] });
      const groupOf = (file) =>
        Object.keys(groups).find((name) =>
          pathsOf(groups[name]).includes(file)
        );

      for (const [file, group, message] of [
        ['docs/plans/2026-01-02-open.md', 'live', 'open plan stays live'],
        ['docs/plans/2026-01-03-phased.md', 'live', 'phased plan stays live'],
        [
          'docs/plans/2026-01-04-unlabeled.md',
          'live',
          'unlabeled plan stays live',
        ],
        [
          'docs/plans/2026-01-06-reopened.md',
          'live',
          'reopened plan stays live',
        ],
        [
          'docs/plans/2026-01-05-superseded.md',
          'history',
          'superseded plan is history',
        ],
        [
          'apps/www/src/registry/changelog/entries/a.mdx',
          'release notes',
          'registry changelog is release notes',
        ],
        ['content/docs/colon:name.mdx', 'live', 'colon path survives'],
        ['content/docs/new\nline.mdx', 'live', 'newline path survives'],
      ]) {
        assert.equal(groupOf(file), group, message);
      }
      assert.ok(
        twins.includes('content/docs/other.cn.mdx'),
        'twin without hits is listed'
      );

      assert.deepEqual(pathsOf(groups.live).sort(), live.sort());
      assert.deepEqual(pathsOf(groups['release notes']).sort(), [
        '.changeset/upload.md',
        'apps/www/src/registry/changelog/entries/a.mdx',
      ]);
      assert.deepEqual(pathsOf(groups.history).sort(), [
        'docs/plans/2026-01-01-done.md',
        'docs/plans/2026-01-02-open.decisions.tsv',
        'docs/plans/2026-01-05-superseded.md',
      ]);
      assert.deepEqual(pathsOf(groups.generated), [
        'apps/www/public/r/upload.json',
      ]);
      assert.deepEqual(twins, [
        'content/docs/colon:name.cn.mdx',
        'content/docs/media.cn.mdx',
        'content/docs/other.cn.mdx',
      ]);
    }

    const configKeys = [
      'GIT_CONFIG_COUNT',
      'GIT_CONFIG_KEY_0',
      'GIT_CONFIG_VALUE_0',
    ];
    const saved = configKeys.map((key) => process.env[key]);
    try {
      for (const [key, value] of [
        ['grep.column', 'true'],
        ['color.ui', 'always'],
      ]) {
        Object.assign(process.env, {
          GIT_CONFIG_COUNT: '1',
          GIT_CONFIG_KEY_0: key,
          GIT_CONFIG_VALUE_0: value,
        });
        const { groups } = sweep({ cwd: root, terms: ['fizzBuzz'] });
        assert.ok(
          groups.live.includes(
            'content/docs/media.mdx:1: the optional fizz DOM buzz adapter.'
          ),
          `${key} changed the record fields`
        );
      }
    } finally {
      configKeys.forEach((key, index) => {
        if (saved[index] === undefined) delete process.env[key];
        else process.env[key] = saved[index];
      });
    }
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});
