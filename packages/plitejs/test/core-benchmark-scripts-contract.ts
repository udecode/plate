import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { summarize } from '../../../benchmarks/slate-v2/donor/shared/stats.mjs';

const coreCurrentDir = fileURLToPath(
  new URL('../../../benchmarks/slate-v2/donor/core/current/', import.meta.url)
);
const benchmarkTargetsPath = fileURLToPath(
  new URL('../../../benchmarks/targets/slate-v2.json', import.meta.url)
);

const readBenchmarkTargetCommands = () => {
  const targetRegistry = JSON.parse(
    readFileSync(benchmarkTargetsPath, 'utf-8')
  ) as {
    targets: Array<{ command: string }>;
  };

  return targetRegistry.targets.map((target) => target.command);
};

describe('core benchmark scripts contract', () => {
  it('returns finite zero summaries for empty shared benchmark samples', () => {
    assert.deepEqual(summarize([]), {
      max: 0,
      mean: 0,
      median: 0,
      min: 0,
      p50: 0,
      p75: 0,
      p95: 0,
      p99: 0,
      samples: [],
    });
  });

  it('exposes every current core benchmark through the benchmark target registry', () => {
    const coreBenchmarkFiles = readdirSync(coreCurrentDir)
      .filter((file) => file.endsWith('.mjs'))
      .sort();
    const benchmarkTargetCommands = readBenchmarkTargetCommands();

    const missingFiles = coreBenchmarkFiles.filter((file) => {
      const expectedCommand = `benchmarks/slate-v2/donor/core/current/${file}`;

      return !benchmarkTargetCommands.some((command) =>
        command.includes(expectedCommand)
      );
    });
    const commandsWithoutSourceAliases = benchmarkTargetCommands.filter(
      (command) =>
        command.includes('benchmarks/slate-v2/donor/core/current/') &&
        !command.includes('--preload ./config/plite-source-aliases.ts')
    );

    assert.deepEqual(missingFiles, []);
    assert.deepEqual(commandsWithoutSourceAliases, []);
  });
});
