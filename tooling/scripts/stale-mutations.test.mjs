import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { hookOutput, staleMutations } from './stale-mutations.mjs';

const repository = () => {
  const root = mkdtempSync(path.join(tmpdir(), 'stale-mutations-'));
  const write = (file, text) => {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), `${text}\n`);
  };
  const git = (...args) => {
    const result = spawnSync('git', args, { cwd: root, encoding: 'utf-8' });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  const commit = () => {
    git('add', '-A');
    git('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-m', 'c');
    return git('rev-parse', 'HEAD');
  };
  const spec = (name, commitSha) =>
    write(
      `docs/plans/artifacts/run/${name}`,
      JSON.stringify({
        commit: commitSha,
        mutations: [{ file: 'src/guard.ts' }],
      })
    );
  git('init', '-q');
  return {
    commit,
    root,
    spec,
    write,
    remove: () => rmSync(root, { force: true, recursive: true }),
  };
};

test('lists a mutated file whose bytes changed after its only mutation run', (t) => {
  const repo = repository();
  t.after(repo.remove);
  repo.write('src/guard.ts', 'export const caretPath = 1;');
  const before = repo.commit();
  repo.write('src/guard.ts', 'export const lastChildChain = 1;');
  const after = repo.commit();
  repo.spec('mutate.json', before);

  assert.deepEqual(
    staleMutations({
      cwd: repo.root,
      dir: path.join(repo.root, 'docs/plans/artifacts/run'),
      head: after,
    }),
    [
      {
        file: 'src/guard.ts',
        specs: [
          { commit: before, spec: 'docs/plans/artifacts/run/mutate.json' },
        ],
      },
    ]
  );
});

test('passes a file once any spec ran on the frozen bytes, older specs beside it', (t) => {
  const repo = repository();
  t.after(repo.remove);
  repo.write('src/guard.ts', 'export const caretPath = 1;');
  const before = repo.commit();
  repo.write('src/guard.ts', 'export const lastChildChain = 1;');
  const after = repo.commit();
  repo.spec('mutate.json', before);
  repo.spec('mutate-2.json', after);

  assert.deepEqual(
    staleMutations({
      cwd: repo.root,
      dir: path.join(repo.root, 'docs/plans/artifacts/run'),
      head: after,
    }),
    []
  );
});

test('refuses a head that names no commit instead of reporting every file', (t) => {
  const repo = repository();
  t.after(repo.remove);
  repo.write('src/guard.ts', 'export const caretPath = 1;');
  repo.spec('mutate.json', repo.commit());

  assert.throws(
    () =>
      staleMutations({
        cwd: repo.root,
        dir: path.join(repo.root, 'docs/plans/artifacts/run'),
        head: 'deadbeef',
      }),
    /deadbeef names no commit/
  );
});

test('the hook reads a run directory passed as a shell variable assigned in the same command', (t) => {
  const repo = repository();
  t.after(repo.remove);
  repo.write('src/guard.ts', 'export const caretPath = 1;');
  const before = repo.commit();
  repo.write('src/guard.ts', 'export const lastChildChain = 1;');
  const after = repo.commit();
  repo.spec('mutate.json', before);

  const output = hookOutput({
    cwd: repo.root,
    tool_input: {
      command:
        'R=docs/plans/artifacts/run && node .agents/pstack/freeze.mjs --dir $R src/guard.ts',
    },
    tool_response: { stdout: `${after}\n` },
  });

  assert.match(
    output?.hookSpecificOutput.additionalContext ?? '',
    /src\/guard\.ts: no mutation spec ran on these bytes/
  );
});

test('the hook names a run directory it cannot resolve instead of staying silent', (t) => {
  const repo = repository();
  t.after(repo.remove);
  repo.write('src/guard.ts', 'export const caretPath = 1;');
  const head = repo.commit();

  const output = hookOutput({
    cwd: repo.root,
    tool_input: {
      command: 'node .agents/pstack/freeze.mjs --dir $RUN src/guard.ts',
    },
    tool_response: { stdout: `${head}\n` },
  });

  assert.match(
    output?.hookSpecificOutput.additionalContext ?? '',
    /could not resolve the run directory \$RUN/
  );
});
