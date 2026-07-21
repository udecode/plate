import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';

import { compileEditorSchemaContributions } from '../../../packages/plite/src/internal/index';
import {
  createSchemaArchitectureCorpus,
  SCHEMA_ARCHITECTURE_CORPUS,
  schemaGroupName,
} from './plite-schema-architecture-corpus';

const root = resolve(import.meta.dir, '../../..');
const benchmarkPath = resolve(
  root,
  'benchmarks/editor/benchmarks/plite-schema-architecture-benchmark.ts'
);
const registryPath = resolve(root, 'benchmarks/targets/slate-v2.json');

describe('compiled schema architecture benchmark authority', () => {
  it('builds the exact declared synthetic corpus through the current compiler', () => {
    const definition = createSchemaArchitectureCorpus();
    const compiled = compileEditorSchemaContributions([
      {
        contribution: definition.schema,
        extensionName: definition.name,
        order: 0,
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
    const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as {
      targets: Array<{
        artifacts: Array<{ path: string; required: boolean }>;
        command: string;
        correctness: { command: string };
        id: string;
        metrics: { primary: string };
      }>;
    };
    const targets = registry.targets.filter(
      ({ id }) => id === 'plite-schema-architecture'
    );
    const source = readFileSync(benchmarkPath, 'utf8');

    assert.equal(targets.length, 1);
    assert.match(
      targets[0]!.command,
      /plite-schema-architecture-benchmark\.ts/u
    );
    assert.equal(
      targets[0]!.metrics.primary,
      'plite_schema_architecture_compile_p95_ms'
    );
    assert.deepEqual(targets[0]!.artifacts, [
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
    assert.match(source, /schema-validation-incremental-hit/u);
    assert.match(source, /schema-validation-full-fallback/u);
    assert.match(
      targets[0]!.correctness.command,
      /incremental-schema-validation\.test\.ts/u
    );
    assert.match(targets[0]!.command, /--expose-gc/u);
    assert.match(
      source,
      /METRIC plite_schema_architecture_retained_heap_baseline_ratio=/u
    );
    assert.match(source, /retainedHeapWorstCaseBytesPerEditor/u);
    assert.doesNotMatch(source, /retainedHeapDeterministic/u);
    assert.doesNotMatch(source, /retainedSchemaHeapBaselineRatio/u);
  });
});
