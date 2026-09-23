import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';

const root = resolve(import.meta.dir, '../../..');
const artifactPath = resolve(
  root,
  'tmp/plite-schema-construction-contract.json'
);

describe('schema-backed sparse edit benchmark authority', () => {
  it(
    'installs a real compiled schema before measuring locality',
    {
      // The child enforces the benchmark budgets. This outer process timeout only
      // needs enough headroom to avoid killing valid work on a shared CI host.
      timeout: 180_000,
    },
    () => {
      const result = spawnSync(
        process.execPath,
        [
          '--preload',
          './config/plite-source-aliases.ts',
          'benchmarks/editor/benchmarks/plite-schema-construction-benchmark.ts',
          '--iterations=20',
          '--output=tmp/plite-schema-construction-contract.json',
        ],
        {
          cwd: root,
          encoding: 'utf-8',
          env: {
            ...process.env,
            PLITE_SCHEMA_CONSTRUCTION_STRICT: '1',
          },
        }
      );

      assert.equal(
        result.status,
        0,
        `${result.stderr}\n${result.stdout}`.trim()
      );
      assert.match(
        result.stdout,
        /METRIC plite_schema_construction_compiled_schema_active=1/u
      );

      const artifact = JSON.parse(readFileSync(artifactPath, 'utf-8')) as {
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
        prefixRows: Array<{
          blocks: number;
          boundaryIdentityPreserved: boolean;
          contractBytes: number;
          bodyMaximumChangedSpan: number;
          maximumChangedSpan: number;
          plainPropertyEdit: {
            p50Ms: number;
            p95Ms: number;
            samplesMs: number[];
          };
          pairedPropertyDelta: { samplesMs: number[] };
          prefixLength: number;
          prefixPropertyEdit: {
            p50Ms: number;
            p95Ms: number;
            samplesMs: number[];
          };
          prefixPropertyMaximumChangedSpan: number;
          propertyP95OverheadBudgetMs: number;
          propertyP95OverheadMs: number;
          propertyP95WithinBudget: boolean;
        }>;
        prefixPropertyP95WithinBudget: boolean;
        propertyOnlyDiagnostic: boolean;
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
      assert.equal(artifact.propertyOnlyDiagnostic, false);
      assert.equal(artifact.prefixPropertyP95WithinBudget, true);
      assert.equal(
        artifact.immutablePublicationDiagnostic.rows.every(
          ({ maximumChangedSpan }) => maximumChangedSpan < 64
        ),
        true
      );
      assert.deepEqual(
        artifact.prefixRows.map(({ blocks, prefixLength }) => [
          prefixLength,
          blocks,
        ]),
        [1, 2].flatMap((prefixLength) =>
          [100, 1000, 10_000, 50_000].map((blocks) => [prefixLength, blocks])
        )
      );
      assert.equal(
        artifact.prefixRows.every(
          (row) =>
            row.boundaryIdentityPreserved &&
            row.contractBytes > 0 &&
            row.maximumChangedSpan < 64 &&
            row.prefixPropertyMaximumChangedSpan < 64 &&
            row.bodyMaximumChangedSpan < 64 &&
            row.plainPropertyEdit.samplesMs.length === 20 &&
            row.prefixPropertyEdit.samplesMs.length === 20 &&
            row.pairedPropertyDelta.samplesMs.length === 20 &&
            row.plainPropertyEdit.p50Ms <= row.plainPropertyEdit.p95Ms &&
            row.prefixPropertyEdit.p50Ms <= row.prefixPropertyEdit.p95Ms &&
            row.propertyP95WithinBudget &&
            row.propertyP95OverheadMs <= row.propertyP95OverheadBudgetMs
        ),
        true
      );
    }
  );
});
