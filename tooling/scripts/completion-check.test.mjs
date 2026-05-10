import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(
  new URL('./completion-check.mjs', import.meta.url)
);

function runCompletionCheck({ args = [], cwd, env = {} }) {
  return new Promise((resolve) => {
    execFile(
      process.execPath,
      [scriptPath, ...args],
      {
        cwd,
        env: {
          ...process.env,
          ...env,
        },
      },
      (error, stdout, stderr) => {
        resolve({
          code: error?.code ?? 0,
          stderr,
          stdout,
        });
      }
    );
  });
}

async function withTempWorkspace(callback) {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'completion-check-'));

  try {
    await mkdir(path.join(cwd, '.tmp'), { recursive: true });

    return await callback(cwd);
  } finally {
    await rm(cwd, { force: true, recursive: true });
  }
}

test('prefers a matching CODEX_THREAD_ID state over the shared fallback', async () => {
  await withTempWorkspace(async (cwd) => {
    await writeFile(
      path.join(cwd, '.tmp/completion-check.md'),
      'status: pending\n'
    );
    await mkdir(path.join(cwd, '.tmp/session-a'), { recursive: true });
    await writeFile(
      path.join(cwd, '.tmp/session-a/completion-check.md'),
      'status: done\n'
    );

    const result = await runCompletionCheck({
      cwd,
      env: {
        CODEX_THREAD_ID: 'session-a',
      },
    });

    assert.equal(result.code, 0);
    assert.match(result.stdout, /\.tmp\/session-a\/completion-check\.md/);
  });
});

test('supports legacy scoped state files by id', async () => {
  await withTempWorkspace(async (cwd) => {
    await writeFile(
      path.join(cwd, '.tmp/completion-check.md'),
      'status: pending\n'
    );
    await mkdir(path.join(cwd, '.tmp/completion-checks'), { recursive: true });
    await writeFile(
      path.join(cwd, '.tmp/completion-checks/session-a.md'),
      'status: done\n'
    );

    const result = await runCompletionCheck({
      cwd,
      env: {
        CODEX_THREAD_ID: 'session-a',
      },
    });

    assert.equal(result.code, 0);
    assert.match(result.stdout, /\.tmp\/completion-checks\/session-a\.md/);
  });
});

test('skips when the implicit session has no state file', async () => {
  await withTempWorkspace(async (cwd) => {
    await writeFile(
      path.join(cwd, '.tmp/completion-check.md'),
      'status: pending\n'
    );

    const result = await runCompletionCheck({
      cwd,
      env: {
        CODEX_THREAD_ID: 'missing-session',
      },
    });

    assert.equal(result.code, 0);
    assert.match(result.stdout, /no state for session: missing-session/);
    assert.match(result.stdout, /\.tmp\/missing-session\/completion-check\.md/);
  });
});

test('uses the shared state when hook env has no session id', async () => {
  await withTempWorkspace(async (cwd) => {
    await writeFile(
      path.join(cwd, '.tmp/completion-check.md'),
      'status: done\n'
    );
    await mkdir(path.join(cwd, '.tmp/other-session'), { recursive: true });
    await writeFile(
      path.join(cwd, '.tmp/other-session/completion-check.md'),
      'status: pending\n'
    );

    const result = await runCompletionCheck({
      cwd,
      env: {
        CODEX_SESSION_ID: '',
        CODEX_THREAD_ID: '',
      },
    });

    assert.equal(result.code, 0);
    assert.match(result.stdout, /\.tmp\/completion-check\.md/);
  });
});

test('skips a pending shared state when scoped states exist and no session id is available', async () => {
  await withTempWorkspace(async (cwd) => {
    await writeFile(
      path.join(cwd, '.tmp/completion-check.md'),
      'status: pending\n'
    );
    await mkdir(path.join(cwd, '.tmp/other-session'), { recursive: true });
    await writeFile(
      path.join(cwd, '.tmp/other-session/completion-check.md'),
      'status: pending\n'
    );

    const result = await runCompletionCheck({
      cwd,
      env: {
        CODEX_SESSION_ID: '',
        CODEX_THREAD_ID: '',
      },
    });

    assert.equal(result.code, 0);
    assert.match(result.stdout, /scoped states exist/);
    assert.match(result.stdout, /\.tmp\/completion-check\.md/);
  });
});

test('requires an explicit id to have its own state file', async () => {
  await withTempWorkspace(async (cwd) => {
    await writeFile(
      path.join(cwd, '.tmp/completion-check.md'),
      'status: done\n'
    );

    const result = await runCompletionCheck({
      args: ['--id', 'missing-session'],
      cwd,
    });

    assert.equal(result.code, 1);
    assert.match(result.stderr, /\.tmp\/missing-session\/completion-check\.md/);
  });
});

test('prints the continuation prompt file when pending', async () => {
  await withTempWorkspace(async (cwd) => {
    await writeFile(
      path.join(cwd, '.tmp/completion-check.md'),
      'status: pending\ncontinue_file: .tmp/session-a/continue.md\n'
    );

    const result = await runCompletionCheck({
      cwd,
      env: {
        CODEX_SESSION_ID: '',
        CODEX_THREAD_ID: '',
      },
    });

    assert.equal(result.code, 1);
    assert.match(result.stderr, /continue: \.tmp\/session-a\/continue\.md/);
    assert.match(result.stderr, /not complete: .*\.tmp\/completion-check\.md/);
  });
});
