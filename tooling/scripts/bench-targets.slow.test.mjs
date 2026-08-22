import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { runBenchmarkTarget } from './bench-targets.mjs';

const processIsAlive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (error?.code === 'ESRCH') return false;
    throw error;
  }
};

const waitUntil = async (predicate, timeoutMs = 1000) => {
  const startedAt = performance.now();

  while (performance.now() - startedAt < timeoutMs) {
    if (predicate()) return true;
    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });
  }

  return false;
};

const fixtureCommand = (filePath) =>
  `${JSON.stringify(process.execPath)} ${JSON.stringify(filePath)}`;

const fixtureTarget = ({ benchmark, correctness }) => ({
  id: 'runner-fixture',
  question: 'runner-fixture question',
  owner: 'plite',
  family: 'test',
  kind: 'current',
  cwd: '.',
  command: fixtureCommand(benchmark),
  metrics: {
    primary: 'runner-fixture_metric',
    direction: 'lower',
    printsMetric: true,
  },
  correctness: { command: fixtureCommand(correctness) },
  artifacts: [{ path: 'artifact.json', required: true }],
  timeouts: { benchmarkMs: 150, correctnessMs: 5000 },
});

test(
  'times out a benchmark with exit 124 and leaves no subprocess behind',
  {
    skip: process.platform === 'win32',
  },
  async (t) => {
    const workspace = fs.mkdtempSync(
      path.join(os.tmpdir(), 'plite-benchmark-target-')
    );
    t.after(() => {
      fs.rmSync(workspace, { force: true, recursive: true });
    });

    const script = (name, source) => {
      const filePath = path.join(workspace, name);
      fs.writeFileSync(filePath, source);
      return filePath;
    };
    const pidFile = path.join(workspace, 'grandchild.pid');
    const correctness = script('correctness.mjs', 'process.exit(0);');
    const benchmark = script(
      'benchmark.mjs',
      `import { spawn } from 'node:child_process'; import fs from 'node:fs'; const child = spawn(process.execPath, ['-e', "process.on('SIGTERM', () => {}); setInterval(() => {}, 1000);"], { stdio: 'ignore' }); fs.writeFileSync(${JSON.stringify(pidFile)}, String(child.pid)); setInterval(() => {}, 1000);`
    );

    await assert.rejects(
      () =>
        runBenchmarkTarget(fixtureTarget({ benchmark, correctness }), {
          repoRoot: workspace,
          writeOutput: false,
        }),
      (error) => {
        assert.match(error.message, /benchmark failed: exit=124/u);
        assert.equal(error.exitCode, 124);
        return true;
      }
    );

    const grandchildPid = Number(fs.readFileSync(pidFile, 'utf-8'));

    assert.equal(await waitUntil(() => !processIsAlive(grandchildPid)), true);
  }
);
