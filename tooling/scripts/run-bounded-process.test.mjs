import assert from 'node:assert/strict';
import test from 'node:test';

import { runBoundedProcess } from './run-bounded-process.mjs';

test('rejects an unbounded timeout', async () => {
  await assert.rejects(
    runBoundedProcess({
      args: [],
      command: process.execPath,
      timeoutMs: 0,
    }),
    /timeoutMs must be a positive number/
  );
});

test('reports exit 124 when a timed-out child handles SIGTERM cleanly', async () => {
  const result = await runBoundedProcess({
    args: [
      '-e',
      "process.on('SIGTERM', () => process.exit(0)); setInterval(() => {}, 1000);",
    ],
    command: process.execPath,
    gracePeriodMs: 100,
    stdio: 'ignore',
    timeoutMs: 50,
  });

  assert.equal(result.timedOut, true);
  assert.equal(result.status, 124);
});

test('falls back to the owned child when process-group signaling is denied', async () => {
  const { kill } = process;

  process.kill = (pid, signal) => {
    if (pid < 0) {
      const error = new Error('process group signal denied');

      error.code = 'EPERM';
      throw error;
    }

    return kill(pid, signal);
  };

  try {
    const result = await runBoundedProcess({
      args: ['-e', 'setInterval(() => {}, 1000);'],
      command: process.execPath,
      gracePeriodMs: 100,
      stdio: 'ignore',
      timeoutMs: 50,
    });

    assert.equal(result.timedOut, true);
    assert.equal(result.status, 124);
  } finally {
    process.kill = kill;
  }
});

test('reports an interrupted status when a child handles SIGINT cleanly', async () => {
  const result = await runBoundedProcess({
    args: [
      '-e',
      "process.on('SIGINT', () => process.exit(0)); setInterval(() => {}, 1000);",
    ],
    command: process.execPath,
    gracePeriodMs: 100,
    onProcessStart: () => {
      setTimeout(() => process.emit('SIGINT'), 50);
    },
    stdio: 'ignore',
    timeoutMs: 5000,
  });

  assert.equal(result.timedOut, false);
  assert.equal(result.status, 130);
});
