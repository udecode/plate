import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, it } from 'node:test';

import { compileEditorSchemaContributions } from '../../../packages/plitejs/src/internal/index';
import {
  measureCohortsRoundRobin,
  validateAndWriteStrictBenchmarkArtifact,
} from './plite-schema-architecture-benchmark-authority';
import {
  createSchemaArchitectureCorpus,
  SCHEMA_ARCHITECTURE_CORPUS,
  schemaGroupName,
} from './plite-schema-architecture-corpus';
import {
  createSchemaTypecheckFixture,
  parseTypeScriptExtendedDiagnostics,
} from './plite-schema-typecheck-budget.mjs';

const root = resolve(import.meta.dir, '../../..');
const benchmarkPath = resolve(
  root,
  'benchmarks/editor/benchmarks/plite-schema-architecture-benchmark.ts'
);
const benchmarkAuthorityPath = resolve(
  root,
  'benchmarks/editor/benchmarks/plite-schema-architecture-benchmark-authority.ts'
);
const registryPath = resolve(root, 'benchmarks/targets/slate-v2.json');

describe('compiled schema architecture benchmark authority', () => {
  it('builds the exact declared synthetic corpus through the current compiler', () => {
    const definition = createSchemaArchitectureCorpus();
    const compiled = compileEditorSchemaContributions([
      {
        contribution: definition.schema,
        extensionName: definition.name,
      },
    ]);
    const properties = [...compiled.properties.byId.values()];

    assert.equal(
      compiled.elements.byType.size,
      SCHEMA_ARCHITECTURE_CORPUS.elementTypes
    );
    assert.equal(
      properties.filter(({ key }) => typeof key === 'string').length,
      SCHEMA_ARCHITECTURE_CORPUS.exactElementProperties +
        SCHEMA_ARCHITECTURE_CORPUS.exactTextProperties
    );
    assert.equal(
      properties.filter(({ key }) => typeof key !== 'string').length,
      SCHEMA_ARCHITECTURE_CORPUS.prefixElementProperties +
        SCHEMA_ARCHITECTURE_CORPUS.prefixTextProperties
    );
    assert.equal(
      Array.from(
        { length: SCHEMA_ARCHITECTURE_CORPUS.declaredGroups },
        (_value, index) => schemaGroupName(index)
      ).filter((name) => compiled.elements.groups.has(name)).length,
      SCHEMA_ARCHITECTURE_CORPUS.declaredGroups
    );
    assert.equal(compiled.roots.size + 1, SCHEMA_ARCHITECTURE_CORPUS.roots);
  });

  it('keeps one registered metric owner with explicit non-comparability', () => {
    const registry = JSON.parse(readFileSync(registryPath, 'utf-8')) as {
      targets: Array<{
        artifacts: Array<{ path: string; required: boolean }>;
        command: string;
        correctness: { command: string };
        id: string;
        metrics: { primary: string };
        thresholds: { promotion: string };
      }>;
    };
    const targets = registry.targets.filter(
      ({ id }) => id === 'plite-schema-architecture'
    );
    const source = readFileSync(benchmarkPath, 'utf-8');
    const authoritySource = readFileSync(benchmarkAuthorityPath, 'utf-8');

    assert.equal(targets.length, 1);
    assert.match(
      targets[0].command,
      /plite-schema-architecture-benchmark\.ts/u
    );
    assert.equal(
      targets[0].metrics.primary,
      'plite_schema_architecture_compile_p95_ms'
    );
    assert.deepEqual(targets[0].artifacts, [
      {
        path: 'tmp/plite-schema-architecture-benchmark.json',
        required: true,
      },
    ]);
    assert.match(source, /No legacy equivalent; current baseline only\./u);
    assert.match(source, /no ratio is reported\./u);
    assert.match(
      source,
      /METRIC plite_schema_architecture_equivalent_reconfigure_compile_count=/u
    );
    assert.match(
      source,
      /METRIC plite_schema_architecture_retained_representation_bytes_proxy=/u
    );
    assert.match(
      source,
      /METRIC plite_schema_architecture_wrapper_query_p50_ns=/u
    );
    assert.match(
      source,
      /METRIC plite_schema_architecture_wrapper_baseline_ratio=/u
    );
    assert.match(
      source,
      /METRIC plite_schema_architecture_wrapper_plan_searches_after_first=/u
    );
    assert.match(
      source,
      /METRIC plite_schema_architecture_full_validation_cold_p50_ms=/u
    );
    assert.match(
      source,
      /METRIC plite_schema_architecture_full_validation_repeated_frozen_p50_ms=/u
    );
    assert.match(source, /frozenValue/u);
    assert.doesNotMatch(source, /trustedFrozenValue/u);
    assert.match(
      source,
      /METRIC plite_schema_architecture_incremental_validation_property_visits=/u
    );
    assert.match(
      source,
      /METRIC plite_schema_architecture_incremental_validation_named_root_property_visits=/u
    );
    assert.match(
      source,
      /METRIC plite_schema_architecture_schema_invalidation_cold_index_large_p50_ms=/u
    );
    assert.match(
      source,
      /METRIC plite_schema_architecture_schema_invalidation_document_width_ratio=/u
    );
    assert.match(
      source,
      /METRIC plite_schema_architecture_schema_invalidation_changed_type_ratio=/u
    );
    assert.match(
      source,
      /METRIC plite_schema_architecture_schema_invalidation_property_affected_runtime_ids=/u
    );
    assert.match(
      targets[0].thresholds.promotion,
      /schema_invalidation_document_width_ratio<=1\.5/u
    );
    assert.match(
      targets[0].thresholds.promotion,
      /schema_invalidation_changed_type_ratio<=2/u
    );
    assert.match(
      targets[0].thresholds.promotion,
      /schema_invalidation_property_affected_runtime_ids=64/u
    );
    assert.match(source, /getSchemaInvalidatedRuntimeIds/u);
    assert.match(source, /INVALIDATION_AFFECTED_RUNTIME_IDS = 64/u);
    assert.match(source, /INVALIDATION_LARGE_DOCUMENT_BLOCKS = 50_000/u);
    assert.match(source, /invalidation-samples', 10/u);
    assert.match(source, /INVALIDATION_WARMUP_ITERATIONS = 250/u);
    assert.match(
      source,
      /const invalidationMeasurements = measureCohortsRoundRobin/u
    );
    assert.match(
      source,
      /const migrationMeasurements = measureCohortsRoundRobin/u
    );
    assert.match(source, /order: ROUND_ROBIN_SAMPLING_ORDER/u);
    assert.match(source, /'rotating-round-robin'/u);
    assert.match(
      authoritySource,
      /\(sampleIndex \+ orderIndex\) % cohorts\.length/u
    );
    assert.match(source, /startupSamplesMs/u);
    assert.match(source, /strictValidation/u);
    assert.match(source, /schema-validation-incremental-hit/u);
    assert.match(source, /schema-validation-full-document-boundary/u);
    assert.match(
      targets[0].correctness.command,
      /incremental-schema-validation\.test\.ts/u
    );
    assert.match(targets[0].command, /--expose-gc/u);
    assert.match(targets[0].command, /PLITE_SCHEMA_TYPECHECK_BUDGET=1/u);
    assert.match(
      source,
      /METRIC plite_schema_architecture_retained_heap_baseline_ratio=/u
    );
    assert.match(source, /retainedHeapWorstCaseBytesPerEditor/u);
    assert.doesNotMatch(source, /retainedHeapDeterministic/u);
    assert.doesNotMatch(source, /retainedSchemaHeapBaselineRatio/u);
    assert.match(source, /CONTRIBUTION_COHORTS = \[1, 100, 1000\]/u);
    assert.match(source, /PLATE_DESCRIPTOR_COHORTS = \[100, 1000\]/u);
    assert.match(source, /CONSTRUCTION_PROPERTY_COHORTS = \[100, 1000\]/u);
    assert.match(source, /schemaConstructionAuthority/u);
    assert.match(source, /MIGRATION_DOCUMENT_COHORTS = \[1000, 10_000\]/u);
    assert.match(
      source,
      /PROJECTED_CLIPBOARD_DOCUMENT_COHORTS = \[1000, 50_000\]/u
    );
    assert.match(
      source,
      /METRIC plite_schema_architecture_contribution_1000_compile_p95_ms=/u
    );
    assert.match(
      source,
      /METRIC plite_schema_architecture_contribution_1000_previous_revision_cache_p95_ms=/u
    );
    assert.match(
      source,
      /METRIC plite_schema_architecture_plate_descriptor_1000_resolution_p50_ns=/u
    );
    assert.match(
      source,
      /METRIC plite_schema_architecture_construction_1000_default_property_ids=/u
    );
    assert.match(
      source,
      /METRIC plite_schema_architecture_large_document_migration_10000_p95_ms=/u
    );
    assert.match(
      source,
      /METRIC plite_schema_architecture_projected_clipboard_width_ratio=/u
    );
    assert.match(
      source,
      /METRIC plite_schema_architecture_projected_clipboard_open_start=/u
    );
    assert.match(
      source,
      /METRIC plite_schema_architecture_typecheck_1000_instantiations=/u
    );
    assert.match(
      source,
      /METRIC plite_schema_architecture_construction_1000_property_ids=/u
    );
    assert.match(
      source,
      /METRIC plite_schema_architecture_large_document_migration_10000_configuration_commit_count=/u
    );
    assert.match(
      source,
      /METRIC plite_schema_architecture_typecheck_check_time_ratio=/u
    );
    assert.match(
      targets[0].correctness.command,
      /compilePlateModel\.spec\.ts/u
    );
    assert.match(
      targets[0].correctness.command,
      /projected-clipboard-contract\.test\.ts/u
    );
    assert.match(
      targets[0].thresholds.promotion,
      /contribution_1000_compile_p95_ms<100/u
    );
    assert.match(
      targets[0].thresholds.promotion,
      /contribution_1000_previous_revision_cache_p95_ms<50/u
    );
    assert.match(
      targets[0].thresholds.promotion,
      /projected_clipboard_width_ratio<=1\.5/u
    );
    assert.match(
      targets[0].thresholds.promotion,
      /projected_clipboard_open_start=1/u
    );
    assert.match(
      targets[0].thresholds.promotion,
      /projected_clipboard_open_end=1/u
    );
    assert.match(
      targets[0].thresholds.promotion,
      /typecheck_1000_instantiations<5000000/u
    );
    assert.match(
      targets[0].thresholds.promotion,
      /large_document_migration_10000_configuration_commit_count=10/u
    );
    assert.match(
      targets[0].thresholds.promotion,
      /large_document_migration_10000_migration_call_count=10/u
    );
    assert.match(
      targets[0].thresholds.promotion,
      /typecheck_check_time_ratio<=2/u
    );
  });

  it('keeps the 1,000-plugin type budget behind an explicit widening boundary', () => {
    const exact = createSchemaTypecheckFixture(100);
    const widened = createSchemaTypecheckFixture(1000);
    const diagnostics = parseTypeScriptExtendedDiagnostics(`
Types:             724,162
Instantiations:  4,320,080
Memory used:       960,000K
Check time:          1.45s
Total time:          1.50s
`);

    assert.doesNotMatch(exact, /readonly AnyBasePlugin\[\] = \[/u);
    assert.match(widened, /readonly AnyBasePlugin\[\] = \[/u);
    assert.equal(
      (widened.match(/const Plugin\d+ = defineBasePlugin/g) ?? []).length,
      1000
    );
    assert.deepEqual(diagnostics, {
      checkMs: 1450,
      instantiations: 4_320_080,
      memoryBytes: 983_040_000,
      totalMs: 1500,
      types: 724_162,
    });
  });

  it('rotates cohort order after warming every cohort and collects between samples', () => {
    const events: string[] = [];
    let measured = 0;
    const measurements = measureCohortsRoundRobin(
      ['small', 'large'],
      3,
      (cohort) => events.push(`warm:${cohort}`),
      (cohort) => {
        events.push(`measure:${cohort}`);

        return (measured += 1);
      },
      () => events.push('gc')
    );

    assert.deepEqual(measurements.order, [
      [0, 1],
      [1, 0],
      [0, 1],
    ]);
    assert.deepEqual(measurements.samples, [
      [1, 4, 5],
      [2, 3, 6],
    ]);
    assert.deepEqual(events, [
      'warm:small',
      'gc',
      'warm:large',
      'gc',
      'gc',
      'measure:small',
      'gc',
      'measure:large',
      'gc',
      'measure:large',
      'gc',
      'measure:small',
      'gc',
      'measure:small',
      'gc',
      'measure:large',
    ]);
  });

  it('leaves raw measurements marked unpassed when strict validation fails', () => {
    const directory = mkdtempSync(
      join(tmpdir(), 'plite-schema-benchmark-authority-')
    );
    const outputPath = join(directory, 'result.json');
    const result: {
      environment: { runtime: string };
      plateDescriptors: {
        rows: Array<{
          startupMs: { p50: number; p95: number };
          startupSamplesMs: number[];
        }>;
      };
      strictValidation: { status: 'measured' | 'passed' };
    } = {
      environment: { runtime: 'contract' },
      plateDescriptors: {
        rows: [
          {
            startupMs: { p50: 2, p95: 3 },
            startupSamplesMs: [1, 2, 3],
          },
        ],
      },
      strictValidation: { status: 'measured' },
    };

    try {
      assert.throws(
        () =>
          validateAndWriteStrictBenchmarkArtifact({
            outputPath,
            result,
            validate: () => {
              throw new Error('budget failure');
            },
          }),
        /budget failure/u
      );

      assert.deepEqual(JSON.parse(readFileSync(outputPath, 'utf-8')), result);
      assert.equal(result.strictValidation.status, 'measured');
    } finally {
      rmSync(directory, { force: true, recursive: true });
    }
  });

  it('rewrites a successful strict artifact as passed', () => {
    const directory = mkdtempSync(
      join(tmpdir(), 'plite-schema-benchmark-authority-')
    );
    const outputPath = join(directory, 'result.json');
    const result: {
      strictValidation: { status: 'measured' | 'passed' };
    } = { strictValidation: { status: 'measured' } };

    try {
      validateAndWriteStrictBenchmarkArtifact({
        outputPath,
        result,
        validate: () => undefined,
      });

      assert.equal(
        JSON.parse(readFileSync(outputPath, 'utf-8')).strictValidation.status,
        'passed'
      );
    } finally {
      rmSync(directory, { force: true, recursive: true });
    }
  });
});
