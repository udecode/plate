import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, it } from 'node:test';

const root = resolve(import.meta.dir, '../../..');
const artifactPath = resolve(
  root,
  'tmp/plite-schema-construction-contract.json'
);

describe('schema-backed sparse edit benchmark authority', () => {
  it('installs a real compiled schema before measuring locality', {
    // The child enforces the benchmark budgets. This outer process timeout only
    // needs enough headroom to avoid killing valid work on a shared CI host.
    timeout: 20_000,
  }, () => {
    const result = spawnSync(
      process.execPath,
      [
        '--preload',
        './config/plite-source-aliases.ts',
        'benchmarks/editor/benchmarks/plite-schema-construction-benchmark.ts',
        '--iterations=1',
        '--output=tmp/plite-schema-construction-contract.json',
      ],
      {
        cwd: root,
        encoding: 'utf8',
        env: {
          ...process.env,
          PLITE_SCHEMA_CONSTRUCTION_STRICT: '1',
        },
      }
    );

    assert.equal(result.status, 0, `${result.stderr}\n${result.stdout}`.trim());
    assert.match(
      result.stdout,
      /METRIC plite_schema_construction_compiled_schema_active=1/u
    );

    const artifact = JSON.parse(readFileSync(artifactPath, 'utf8')) as {
      compiledSchema: {
        active: boolean;
        elementTypes: number;
        id: string;
        properties: number;
      };
      immutablePublicationDiagnostic: {
        label: string;
        rows: Array<{ maximumChangedSpan: number }>;
      };
    };

    assert.deepEqual(artifact.compiledSchema, {
      active: true,
      elementTypes: 2,
      id: 'schema-construction-benchmark',
      properties: 1,
    });
    assert.equal(
      artifact.immutablePublicationDiagnostic.label,
      'immutable-publication diagnostic'
    );
    assert.equal(artifact.immutablePublicationDiagnostic.rows.length, 4);
    assert.equal(
      artifact.immutablePublicationDiagnostic.rows.every(
        ({ maximumChangedSpan }) => maximumChangedSpan < 64
      ),
      true
    );
  });
});
