import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { compileEditorSchemaContributions } from '../../../packages/plitejs/src/internal/index';
import { measureCohortsRoundRobin } from './plite-schema-architecture-benchmark-authority';
import {
  createSchemaArchitectureCorpus,
  SCHEMA_ARCHITECTURE_CORPUS,
  schemaGroupName,
} from './plite-schema-architecture-corpus';
import {
  createSchemaTypecheckFixture,
  parseTypeScriptExtendedDiagnostics,
} from './plite-schema-typecheck-budget.mjs';

describe('compiled schema architecture benchmark authority', () => {
  it('builds the exact declared synthetic corpus through the current compiler', () => {
    const definition = createSchemaArchitectureCorpus();
    const compiled = compileEditorSchemaContributions([
      {
        contribution: definition.schema,
        pluginName: definition.name,
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

    assert.doesNotMatch(exact, /readonly BasePluginInput\[\] = \[/u);
    assert.match(widened, /readonly BasePluginInput\[\] = \[/u);
    assert.equal(
      (widened.match(/const Plugin\d+ = definePlugin/g) ?? []).length,
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
});
