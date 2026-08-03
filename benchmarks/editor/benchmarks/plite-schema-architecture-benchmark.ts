import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { resolve } from 'node:path';

import {
  createEditor,
  createEditorView,
  defineEditorSchema,
  defineExtensionSlot,
  property,
  schema,
  target,
  type EditorDocumentValue,
  type EditorSchemaExtension,
  type Point,
  type RootKey,
} from '../../../packages/plite/src/index';
import {
  compileEditorSchemaContributions,
  getEditorRuntimeElementEntries,
  getCompiledEditorSchema,
  MAIN_ROOT_KEY,
  resolveCompiledSchemaProperty,
  type CompiledEditorSchema,
  type EditorSchemaContributionRecord,
} from '../../../packages/plite/src/internal/index';
import { resolveCompiledSchemaWrapperPlan } from '../../../packages/plite/src/core/schema-compiler';
import {
  createSchemaContributionRegistry,
  mergeSchemaContributionRegistries,
  registerSchemaContribution,
} from '../../../packages/plite/src/core/schema-contribution-registry';
import {
  getDOMClipboardFormatKey,
  writeDOMHostFragmentData,
} from '../../../packages/plite-dom/src/internal/index';
import {
  createBaseEditor,
  defineBasePlugin,
} from '../../../packages/core/src/index';
import { getSchemaInvalidatedRuntimeIds } from '../../../packages/plite-react/src/editable/schema-runtime-invalidation';
import {
  decodeProjectedClipboardFragment,
  getProjectedViewSelectionFragment,
  writeProjectedViewSelectionClipboardData,
} from '../../../packages/plite-react/src/editable/projected-clipboard';
import type { ReactRuntimeEditor } from '../../../packages/plite-react/src/plugin/react-editor';
import { getEditorRuntimeOwner } from '../../../packages/plite-react/src/editable/runtime-editor-api';
import {
  createPliteProjectionGraph,
  type PliteProjectionOwner,
} from '../../../packages/plite-react/src/projection-graph';
import {
  createPliteViewSelection,
  writePliteViewSelection,
} from '../../../packages/plite-react/src/view-selection';
import {
  createSchemaArchitectureCorpus,
  createSchemaArchitectureValue,
  SCHEMA_ARCHITECTURE_CORPUS,
  schemaElementPrefix,
  schemaElementPropertyKey,
  schemaElementType,
  schemaGroupName,
  schemaTextPrefix,
} from './plite-schema-architecture-corpus';
import { runSchemaTypecheckBudget } from './plite-schema-typecheck-budget.mjs';
import { writeBenchmarkArtifact } from './benchmark-artifact';
import {
  measureCohortsRoundRobin,
  validateAndWriteStrictBenchmarkArtifact,
} from './plite-schema-architecture-benchmark-authority';

const LEGACY_BASELINE = Object.freeze({
  artifact:
    'docs/plans/artifacts/wordgard-plite-schema-architecture/baseline.md',
  equivalentReconfigurationP95Ms: 3.739,
  exactElementPropertyP50Ns: 2736,
  namespaceP50Ns: 3600,
  retainedSchemaHeapP50BytesPerEditor: 631_225,
  typeP50Ns: 2970,
  wrapperP50Ns: 9921,
});

const argument = (name: string, fallback: number) => {
  const value = process.argv.find((candidate) =>
    candidate.startsWith(`--${name}=`)
  );
  const parsed = value ? Number(value.slice(name.length + 3)) : fallback;

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`--${name} must be a positive integer.`);
  }

  return parsed;
};

const iterations = argument('iterations', 30);
const heapEditors = argument('heap-editors', 128);
const queryIterations = argument('query-iterations', 50_000);
const querySamples = argument('query-samples', 15);
const validationBlocks = argument('validation-blocks', 10_000);
const validationIterations = argument('validation-iterations', 10);
const invalidationIterations = argument('invalidation-iterations', 5000);
const invalidationSamples = argument('invalidation-samples', 10);
const architectureIterations = argument('architecture-iterations', 5);
const migrationIterations = argument('migration-iterations', 10);
const projectedClipboardIterations = argument(
  'projected-clipboard-iterations',
  1
);
const outputArgument = process.argv.find((candidate) =>
  candidate.startsWith('--output=')
);
const outputPath = outputArgument?.slice('--output='.length);
const strictValidationRequested =
  process.env.PLITE_SCHEMA_ARCHITECTURE_STRICT === '1';
const schemaTypecheckBudget =
  process.env.PLITE_SCHEMA_TYPECHECK_BUDGET === '1'
    ? runSchemaTypecheckBudget(resolve(import.meta.dir, '../../..'))
    : null;

if (schemaTypecheckBudget) globalThis.gc?.();

const percentile = (values: readonly number[], ratio: number) =>
  values[Math.min(values.length - 1, Math.ceil(values.length * ratio) - 1)]!;

const summarize = (samples: readonly number[]) => {
  const sorted = [...samples].sort((left, right) => left - right);

  return {
    p50: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    p99: percentile(sorted, 0.99),
  };
};

const ROUND_ROBIN_SAMPLING_ORDER = 'rotating-round-robin';

const definition = createSchemaArchitectureCorpus();
const contribution = (): EditorSchemaContributionRecord => ({
  contribution: definition.schema,
  extensionName: definition.name,
});
const compile = () => compileEditorSchemaContributions([contribution()]);

for (let index = 0; index < 3; index += 1) compile();

const compileSamples = Array.from({ length: iterations }, () => {
  const before = performance.now();
  const compiled = compile();
  const elapsed = performance.now() - before;

  assert.equal(
    compiled.elements.byType.size,
    SCHEMA_ARCHITECTURE_CORPUS.elementTypes
  );

  return elapsed;
});
const compileMs = summarize(compileSamples);
const compiled = compile();

const CONTRIBUTION_COHORTS = [1, 100, 1000] as const;
const createContributionRecords = (
  count: (typeof CONTRIBUTION_COHORTS)[number]
): EditorSchemaContributionRecord[] => {
  const types = Array.from(
    { length: count },
    (_value, index) => `contribution_${count}_${index}`
  );

  return types.map((type, index) => ({
    contribution:
      index === 0
        ? {
            elements: {
              [type]: { content: schema.content.text() },
            },
            id: `schema-contribution-benchmark-${count}`,
            root: schema.content.types(types, {
              default: { type },
              min: 1,
            }),
            unknown: 'reject',
            version: 1,
          }
        : {
            elements: {
              [type]: { content: schema.content.text() },
            },
          },
    extensionName: `schema-contribution-benchmark-${count}-${index}`,
  }));
};
const createContributionRegistry = (
  records: readonly EditorSchemaContributionRecord[]
) => {
  const registry = createSchemaContributionRegistry();

  for (const record of records) {
    registerSchemaContribution(
      registry,
      record.extensionName,
      record.contribution
    );
  }

  return registry;
};
const measureContributionCohort = (
  count: (typeof CONTRIBUTION_COHORTS)[number]
) => {
  const records = createContributionRecords(count);
  const directCompileMs = summarize(
    Array.from({ length: architectureIterations }, () => {
      const before = performance.now();
      const value = compileEditorSchemaContributions(records);

      assert.equal(value.elements.byType.size, count);

      return performance.now() - before;
    })
  );
  const configured = createContributionRegistry(records);
  const base = createSchemaContributionRegistry();
  const profilerEvents: string[] = [];
  const profilerOwner = globalThis as typeof globalThis & {
    __PLITE_REACT_RENDER_PROFILER__?: {
      record: (event: { id: string }) => void;
    };
  };
  const previousProfiler = profilerOwner.__PLITE_REACT_RENDER_PROFILER__;

  profilerOwner.__PLITE_REACT_RENDER_PROFILER__ = {
    record: ({ id }) => profilerEvents.push(id),
  };

  try {
    const first = mergeSchemaContributionRegistries(configured, base, 1);
    const coldMergeCompileCount = profilerEvents.filter(
      (id) => id === 'schema-compile'
    ).length;
    assert.equal(first.compiled?.elements.byType.size, count);

    profilerEvents.length = 0;
    const structuralCacheMs = summarize(
      Array.from({ length: architectureIterations }, (_value, index) => {
        const structurallyEqualConfigured = createContributionRegistry(
          createContributionRecords(count)
        );
        const structurallyEqualBase = createSchemaContributionRegistry();
        const before = performance.now();
        const cached = mergeSchemaContributionRegistries(
          structurallyEqualConfigured,
          structurallyEqualBase,
          index + 2
        );

        assert.equal(cached.compiled?.elements.byType.size, count);

        return performance.now() - before;
      })
    );
    const structuralCacheCompileCount = profilerEvents.filter(
      (id) => id === 'schema-compile'
    ).length;

    profilerEvents.length = 0;
    let previous = first;
    const previousRevisionCacheMs = summarize(
      Array.from({ length: architectureIterations }, (_value, index) => {
        const before = performance.now();

        previous = mergeSchemaContributionRegistries(
          configured,
          base,
          index + architectureIterations + 2,
          previous
        );

        return performance.now() - before;
      })
    );
    const previousRevisionCompileCount = profilerEvents.filter(
      (id) => id === 'schema-compile'
    ).length;

    return {
      coldMergeCompileCount,
      contributions: count,
      directCompileMs,
      elements: first.compiled?.elements.byType.size ?? 0,
      previousRevisionCacheMs,
      previousRevisionCompileCount,
      structuralCacheCompileCount,
      structuralCacheMs,
    };
  } finally {
    profilerOwner.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
  }
};
const contributionRows = CONTRIBUTION_COHORTS.map(measureContributionCohort);

const PLATE_DESCRIPTOR_COHORTS = [100, 1000] as const;
const createPlateDescriptorPlugins = (
  count: (typeof PLATE_DESCRIPTOR_COHORTS)[number],
  cohort: string
) =>
  Array.from({ length: count }, (_value, index) =>
    defineBasePlugin(`plateDescriptor${cohort}${count}${index}`, {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      type: `plate-descriptor-${cohort}-${count}-${index}`,
    })
  );
const measurePlateDescriptorStartup = (
  count: (typeof PLATE_DESCRIPTOR_COHORTS)[number],
  cohort: string
) => {
  const plugins = createPlateDescriptorPlugins(count, cohort);
  const schemaId = `plate-descriptor-benchmark-${cohort}-${count}`;
  const before = performance.now();
  const editor = createBaseEditor({
    plugins,
    schema: { id: schemaId, version: 1 },
  });
  const startupMs = performance.now() - before;

  assert.equal(
    editor.read.schema.element(plugins.at(-1)!)?.type,
    plugins.at(-1)!.type
  );

  return { editor, plugins, schemaId, startupMs };
};
const plateDescriptorSampleOrdinals = new Map<
  (typeof PLATE_DESCRIPTOR_COHORTS)[number],
  number
>();
const plateDescriptorMeasured = new Map<
  (typeof PLATE_DESCRIPTOR_COHORTS)[number],
  ReturnType<typeof measurePlateDescriptorStartup>
>();
const plateDescriptorStartupMeasurements = measureCohortsRoundRobin(
  PLATE_DESCRIPTOR_COHORTS,
  architectureIterations,
  (count) => {
    measurePlateDescriptorStartup(count, 'warmup');
  },
  (count) => {
    const sampleIndex = plateDescriptorSampleOrdinals.get(count) ?? 0;
    const measured = measurePlateDescriptorStartup(
      count,
      `cold-${sampleIndex}`
    );

    plateDescriptorSampleOrdinals.set(count, sampleIndex + 1);
    plateDescriptorMeasured.set(count, measured);

    return measured.startupMs;
  }
);
const measurePlateDescriptorCohort = (
  count: (typeof PLATE_DESCRIPTOR_COHORTS)[number],
  cohortIndex: number
) => {
  const measured = plateDescriptorMeasured.get(count)!;
  const startupSamplesMs =
    plateDescriptorStartupMeasurements.samples[cohortIndex]!;
  const cachedStartupSamplesMs = Array.from(
    { length: architectureIterations },
    () => {
      const before = performance.now();

      createBaseEditor({
        plugins: measured.plugins,
        schema: { id: measured.schemaId, version: 1 },
      });

      return performance.now() - before;
    }
  );
  let resolved = 0;
  const resolutionSamplesNs = Array.from(
    { length: architectureIterations },
    () => {
      const before = process.hrtime.bigint();

      for (const plugin of measured.plugins) {
        if (measured.editor.read.schema.element(plugin)?.type === plugin.type) {
          resolved += 1;
        }
      }

      return Number(process.hrtime.bigint() - before) / count;
    }
  );

  assert.equal(resolved, count * architectureIterations);

  return {
    cachedStartupMs: summarize(cachedStartupSamplesMs),
    cachedStartupSamplesMs,
    descriptors: count,
    resolved,
    resolutionNs: summarize(resolutionSamplesNs),
    resolutionSamplesNs,
    startupMs: summarize(startupSamplesMs),
    startupSamplesMs,
  };
};
const plateDescriptorRows = PLATE_DESCRIPTOR_COHORTS.map((count, index) =>
  measurePlateDescriptorCohort(count, index)
);
const plateDescriptorResolutionWidthRatio =
  plateDescriptorRows[1].resolutionNs.p50 /
  Math.max(plateDescriptorRows[0].resolutionNs.p50, 1);
const plateStartupPerDescriptorRatio =
  plateDescriptorRows[1].startupMs.p50 /
  PLATE_DESCRIPTOR_COHORTS[1] /
  (plateDescriptorRows[0].startupMs.p50 / PLATE_DESCRIPTOR_COHORTS[0]);

const CONSTRUCTION_PROPERTY_COHORTS = [100, 1000] as const;
const constructionIterations = argument('construction-iterations', 5000);
const measureConstructionPropertyCohort = (
  properties: (typeof CONSTRUCTION_PROPERTY_COHORTS)[number]
) => {
  const definition = defineEditorSchema(
    `schema:schema-construction-property-budget-${properties}`,
    {
      elements: {
        construction_target: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: {
            localDefault: property.number({ default: 1 }),
          },
        },
        construction_unrelated: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      id: `schema-construction-property-budget-${properties}`,
      properties: Array.from({ length: properties }, (_value, index) =>
        schema.elementProperty(
          `unrelatedDefault${index}`,
          property.number({ default: index }),
          { target: target.type('construction_unrelated') }
        )
      ),
      root: schema.content.types(
        ['construction_target', 'construction_unrelated'],
        { default: { type: 'construction_target' }, min: 1 }
      ),
      unknown: 'reject',
      version: 1,
    }
  );
  const editor = createEditor({ extensions: [definition] });
  const compiledElement = getCompiledEditorSchema(editor)?.elements.byType.get(
    'construction_target'
  );

  assert.ok(compiledElement);
  assert.equal(compiledElement.construction.defaultPropertyIds.size, 1);
  assert.equal(compiledElement.construction.propertyIds.size, 1);

  let creations = 0;
  const creationNs = summarize(
    Array.from({ length: architectureIterations }, () => {
      const before = process.hrtime.bigint();

      for (let index = 0; index < constructionIterations; index += 1) {
        const element = editor.read.schema.createAndFill('construction_target');

        if (element.localDefault === 1 && Object.keys(element).length === 3) {
          creations += 1;
        }
      }

      return Number(process.hrtime.bigint() - before) / constructionIterations;
    })
  );

  assert.equal(creations, constructionIterations * architectureIterations);

  return {
    constructionDefaultPropertyIds:
      compiledElement.construction.defaultPropertyIds.size,
    constructionPropertyIds: compiledElement.construction.propertyIds.size,
    creationNs,
    creations,
    globalProperties: properties,
  };
};
const constructionPropertyRows = CONSTRUCTION_PROPERTY_COHORTS.map(
  measureConstructionPropertyCohort
);
const constructionPropertyWidthRatio =
  constructionPropertyRows[1].creationNs.p50 /
  Math.max(constructionPropertyRows[0].creationNs.p50, 1);

const exactPropertyCount = [...compiled.properties.byId.values()].filter(
  ({ key }) => typeof key === 'string'
).length;
const prefixPropertyCount = [...compiled.properties.byId.values()].filter(
  ({ key }) => typeof key !== 'string'
).length;
const declaredGroupCount = Array.from(
  { length: SCHEMA_ARCHITECTURE_CORPUS.declaredGroups },
  (_value, index) => schemaGroupName(index)
).filter((name) => compiled.elements.groups.has(name)).length;

assert.equal(
  exactPropertyCount,
  SCHEMA_ARCHITECTURE_CORPUS.exactElementProperties +
    SCHEMA_ARCHITECTURE_CORPUS.exactTextProperties
);
assert.equal(
  prefixPropertyCount,
  SCHEMA_ARCHITECTURE_CORPUS.prefixElementProperties +
    SCHEMA_ARCHITECTURE_CORPUS.prefixTextProperties
);
assert.equal(declaredGroupCount, SCHEMA_ARCHITECTURE_CORPUS.declaredGroups);
assert.equal(compiled.roots.size + 1, SCHEMA_ARCHITECTURE_CORPUS.roots);

const measureQuery = (query: (index: number) => boolean) => {
  let matches = 0;

  for (let index = 0; index < 2000; index += 1) query(index);

  const samples = Array.from({ length: querySamples }, () => {
    const before = process.hrtime.bigint();

    for (let index = 0; index < queryIterations; index += 1) {
      if (query(index)) matches += 1;
    }

    return Number(process.hrtime.bigint() - before) / queryIterations;
  });

  assert.equal(matches, querySamples * queryIterations);

  return summarize(samples);
};

const typeQueryNs = measureQuery((index) => {
  const type = schemaElementType(
    index % SCHEMA_ARCHITECTURE_CORPUS.elementTypes
  );

  return compiled.elements.byType.get(type)?.type === type;
});
const groupQueryNs = measureQuery((index) => {
  const typeIndex = index % SCHEMA_ARCHITECTURE_CORPUS.elementTypes;

  return (
    compiled.elements.groups
      .get(schemaGroupName(typeIndex))
      ?.has(schemaElementType(typeIndex)) ?? false
  );
});
const exactPropertyQueryNs = measureQuery((index) => {
  const propertyIndex = index % SCHEMA_ARCHITECTURE_CORPUS.elementTypes;

  return Boolean(
    resolveCompiledSchemaProperty(
      compiled,
      'element',
      schemaElementPropertyKey(propertyIndex),
      { root: null, type: schemaElementType(propertyIndex) }
    )
  );
});
const prefixPropertyQueryNs = measureQuery((index) => {
  const propertyIndex =
    index % SCHEMA_ARCHITECTURE_CORPUS.prefixElementProperties;

  return Boolean(
    resolveCompiledSchemaProperty(
      compiled,
      'element',
      `${schemaElementPrefix(propertyIndex)}value`,
      { root: null, type: schemaElementType(propertyIndex) }
    )
  );
});
const textPrefixPropertyQueryNs = measureQuery((index) => {
  const propertyIndex = index % SCHEMA_ARCHITECTURE_CORPUS.prefixTextProperties;

  return Boolean(
    resolveCompiledSchemaProperty(
      compiled,
      'text',
      `${schemaTextPrefix(propertyIndex)}value`,
      { root: null, type: schemaElementType(propertyIndex) }
    )
  );
});
const allowedParentQueryNs = measureQuery((index) => {
  const parentIndex = index % (SCHEMA_ARCHITECTURE_CORPUS.elementTypes / 2);
  const childIndex = SCHEMA_ARCHITECTURE_CORPUS.elementTypes / 2 + parentIndex;

  return (
    compiled.elements.allowedParents
      .get(schemaElementType(childIndex))
      ?.has(`element:${schemaElementType(parentIndex)}`) ?? false
  );
});

const slot = defineExtensionSlot('schema-architecture-benchmark-slot');
const editor = createEditor({
  extensions: [slot.of(definition)] as const,
  initialValue: createSchemaArchitectureValue(),
});
const wrapperParent = {
  children: [],
  type: schemaElementType(0),
};
const wrapperChild = { text: 'wrapper-query' };
const wrapperPlan = editor.read.schema.findWrapping(
  wrapperParent,
  wrapperChild
);

assert.ok(wrapperPlan);
assert.ok(wrapperPlan.length > 0);

const wrapperQueryNs = measureQuery(
  () =>
    editor.read.schema.findWrapping(wrapperParent, wrapperChild) === wrapperPlan
);
const createUnknownWrapperDefinition = () =>
  defineEditorSchema('schema:schema-architecture-unknown-wrapper-benchmark', {
    elements: {
      paragraph: { content: schema.content.text() },
      wrapper: {
        content: schema.content.not(schema.content.text()),
      },
    },
    id: 'schema-architecture-unknown-wrapper-benchmark',
    root: schema.content.type('wrapper'),
    unknown: 'preserve',
    version: 1,
  });
const compileUnknownWrapperSchema = () =>
  compileEditorSchemaContributions([
    {
      contribution: createUnknownWrapperDefinition().schema,
      extensionName: 'schema-architecture-unknown-wrapper-benchmark',
    },
  ]);
const hostileWrapperTypes = Array.from(
  { length: 256 },
  (_value, index) => `hostile-wrapper-${index}`
);
const wrapperProfilerEvents: string[] = [];
const wrapperProfilerOwner = globalThis as typeof globalThis & {
  __PLITE_REACT_RENDER_PROFILER__?: {
    record: (event: { id: string }) => void;
  };
};
const previousWrapperProfiler =
  wrapperProfilerOwner.__PLITE_REACT_RENDER_PROFILER__;

wrapperProfilerOwner.__PLITE_REACT_RENDER_PROFILER__ = {
  record: ({ id }) => wrapperProfilerEvents.push(id),
};

const unknownWrapperSchema = compileUnknownWrapperSchema();

wrapperProfilerEvents.length = 0;
const firstUnknownWrapperPlan = resolveCompiledSchemaWrapperPlan(
  unknownWrapperSchema,
  'root',
  hostileWrapperTypes[0]!
);
const hostileWrapperPlans = hostileWrapperTypes.map((type) =>
  resolveCompiledSchemaWrapperPlan(unknownWrapperSchema, 'root', type)
);
const unknownWrapperWarmQueryNs = measureQuery(
  (index) =>
    resolveCompiledSchemaWrapperPlan(
      unknownWrapperSchema,
      'root',
      hostileWrapperTypes[index % hostileWrapperTypes.length]!
    ) === firstUnknownWrapperPlan
);
const wrapperPlanSearchCount = wrapperProfilerEvents.filter(
  (id) => id === 'schema-wrapper-plan-search'
).length;
const wrapperPlanSearchesAfterFirst = Math.max(0, wrapperPlanSearchCount - 1);

assert.deepEqual(firstUnknownWrapperPlan, ['wrapper']);
assert.equal(new Set(hostileWrapperPlans).size, 1);
assert.equal(wrapperPlanSearchCount, 1);

const unknownWrapperFirstQueryNs = summarize(
  Array.from({ length: querySamples }, (_value, index) => {
    const schemaValue = compileUnknownWrapperSchema();
    const before = process.hrtime.bigint();
    const plan = resolveCompiledSchemaWrapperPlan(
      schemaValue,
      'root',
      `first-hostile-wrapper-${index}`
    );
    const elapsed = Number(process.hrtime.bigint() - before);

    assert.deepEqual(plan, ['wrapper']);

    return elapsed;
  })
);

if (previousWrapperProfiler) {
  wrapperProfilerOwner.__PLITE_REACT_RENDER_PROFILER__ =
    previousWrapperProfiler;
} else {
  wrapperProfilerOwner.__PLITE_REACT_RENDER_PROFILER__ = undefined;
}

const validationLeaf = (index: number) => ({
  children: [{ text: `validation-${index}` }],
  type: schemaElementType(
    SCHEMA_ARCHITECTURE_CORPUS.elementTypes / 2 +
      (index % (SCHEMA_ARCHITECTURE_CORPUS.elementTypes / 2))
  ),
});
const nestedValidationBlock = (seed: number) => {
  let node: EditorDocumentValue['children'][number] = validationLeaf(seed);

  for (let depth = 3; depth >= 0; depth -= 1) {
    node = {
      children: [node],
      type: schemaElementType(depth),
    };
  }

  return node;
};
const createFullValidationValue = (): EditorDocumentValue => ({
  children: Array.from({ length: validationBlocks }, (_value, index) =>
    validationLeaf(index)
  ),
  roots: Object.fromEntries(
    Array.from(
      { length: SCHEMA_ARCHITECTURE_CORPUS.namedRoots },
      (_value, index) => [`aux_${index + 1}`, [nestedValidationBlock(index)]]
    )
  ),
});
const assertFullValidationCorpus = (value: EditorDocumentValue) => {
  assert.equal(value.children.length, validationBlocks);
  assert.equal(
    Object.keys(value.roots ?? {}).length,
    SCHEMA_ARCHITECTURE_CORPUS.namedRoots
  );
};
const coldFullValidationSamples = Array.from(
  { length: validationIterations },
  () => {
    const value = createFullValidationValue();
    const before = performance.now();

    editor.read.schema.validateDocument(value);
    const elapsed = performance.now() - before;

    assertFullValidationCorpus(value);

    return elapsed;
  }
);
const coldFullValidationMs = summarize(coldFullValidationSamples);
const repeatedFrozenValidationEditor = createEditor({
  extensions: [definition],
  initialValue: createFullValidationValue(),
});
const repeatedFrozenValidationValue =
  repeatedFrozenValidationEditor.read.value();

assertFullValidationCorpus(repeatedFrozenValidationValue);
assert.equal(Object.isFrozen(repeatedFrozenValidationValue.children), true);
editor.read.schema.validateDocument(repeatedFrozenValidationValue);

const repeatedFrozenFullValidationSamples = Array.from(
  { length: validationIterations },
  () => {
    const before = performance.now();

    editor.read.schema.validateDocument(repeatedFrozenValidationValue);

    return performance.now() - before;
  }
);
const repeatedFrozenFullValidationMs = summarize(
  repeatedFrozenFullValidationSamples
);

const MIGRATION_DOCUMENT_COHORTS = [1000, 10_000] as const;
const migrationSlot = defineExtensionSlot(
  'schema-architecture-large-document-migration-slot'
);
const createMigrationSchema = (
  blocks: (typeof MIGRATION_DOCUMENT_COHORTS)[number],
  version: number
) =>
  defineEditorSchema(
    `schema:schema-architecture-large-document-migration-${blocks}`,
    {
      elements: {
        migration_paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
          readOnly: version === 2,
        },
      },
      id: `schema-architecture-large-document-migration-${blocks}`,
      root: schema.content.type('migration_paragraph', {
        default: { type: 'migration_paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version,
    }
  );
const createMigrationValue = (blocks: number): EditorDocumentValue => ({
  children: Array.from({ length: blocks }, (_value, index) => ({
    children: [{ text: `migration-${index}` }],
    type: 'migration_paragraph',
  })),
});
const measureMigrationSample = (
  blocks: (typeof MIGRATION_DOCUMENT_COHORTS)[number]
) => {
  let commits = 0;
  let migrationCalls = 0;
  let configurationDirtyCommits = 0;
  const measured = createEditor({
    extensions: [migrationSlot.of(createMigrationSchema(blocks, 1))],
    initialValue: createMigrationValue(blocks),
  });

  measured.subscribeCommit((commit) => {
    commits += 1;
    if (commit.dirtyStateKeys.includes('$configuration')) {
      configurationDirtyCommits += 1;
    }
  });

  const before = performance.now();

  measured.update.extensions.reconfigure(
    migrationSlot,
    createMigrationSchema(blocks, 2),
    {
      migrate({ document, next }) {
        migrationCalls += 1;

        return next.fitDocument(document);
      },
    }
  );

  const elapsed = performance.now() - before;

  assert.equal(measured.read.children().length, blocks);
  assert.equal(measured.read.schema.identity()?.version, 2);
  assert.equal(commits, 1);
  assert.equal(configurationDirtyCommits, 1);
  assert.equal(migrationCalls, 1);

  return elapsed;
};
const migrationMeasurements = measureCohortsRoundRobin(
  MIGRATION_DOCUMENT_COHORTS,
  migrationIterations,
  (blocks) => {
    measureMigrationSample(blocks);
  },
  measureMigrationSample
);
const migrationRows = MIGRATION_DOCUMENT_COHORTS.map((blocks, index) => ({
  blocks,
  commits: migrationIterations,
  configurationDirtyCommits: migrationIterations,
  migrationCalls: migrationIterations,
  migrationMs: summarize(migrationMeasurements.samples[index]!),
  migrationSamplesMs: migrationMeasurements.samples[index]!,
}));
const migrationDocumentWidthRatio =
  migrationRows[1].migrationMs.p50 /
  Math.max(migrationRows[0].migrationMs.p50, 0.001);

type LocalityTrace = Readonly<{
  index: number;
  kind: 'element' | 'text';
  root: 'aux' | 'main';
}>;

const localityBlocks = 50_000;
const localityVisits = {
  auxElement: 0,
  auxText: 0,
  mainElement: 0,
  mainText: 0,
};
const localityDescriptor = property.json({
  validate: (value): value is LocalityTrace => {
    if (
      typeof value !== 'object' ||
      value === null ||
      !('index' in value) ||
      !('kind' in value) ||
      !('root' in value) ||
      typeof value.index !== 'number' ||
      (value.kind !== 'element' && value.kind !== 'text') ||
      (value.root !== 'aux' && value.root !== 'main')
    ) {
      return false;
    }

    localityVisits[
      `${value.root}${value.kind === 'element' ? 'Element' : 'Text'}`
    ] += 1;

    return Number.isInteger(value.index) && value.index >= 0;
  },
  validationVersion: 1,
});
const LocalitySchema = defineEditorSchema('schema:schema-validation-locality', {
  elements: {
    paragraph: {
      content: schema.content.text(),
      properties: { validationElementTrace: localityDescriptor },
    },
  },
  id: 'schema-validation-locality',
  properties: [
    schema.textProperty('validationTextTrace', localityDescriptor, {
      target: target.type('paragraph'),
    }),
  ],
  root: schema.content.type('paragraph', { min: 1 }),
  roots: {
    aux: schema.content.type('paragraph', { min: 1 }),
  },
  unknown: 'reject',
  version: 1,
});
const localityParagraph = (root: LocalityTrace['root'], index: number) => ({
  children: [
    {
      text: 'x',
      validationTextTrace: { index, kind: 'text' as const, root },
    },
  ],
  type: 'paragraph',
  validationElementTrace: { index, kind: 'element' as const, root },
});
const localityEditor = createEditor({
  extensions: [LocalitySchema],
  initialValue: {
    children: Array.from({ length: localityBlocks }, (_value, index) =>
      localityParagraph('main', index)
    ),
    roots: { aux: [localityParagraph('aux', 0)] },
  },
});
const localityProfilerEvents: string[] = [];
const localityProfilerOwner = globalThis as typeof globalThis & {
  __PLITE_REACT_RENDER_PROFILER__?: {
    record: (event: { id: string }) => void;
  };
};
const previousLocalityProfiler =
  localityProfilerOwner.__PLITE_REACT_RENDER_PROFILER__;

for (const key of Object.keys(
  localityVisits
) as (keyof typeof localityVisits)[])
  localityVisits[key] = 0;
localityProfilerOwner.__PLITE_REACT_RENDER_PROFILER__ = {
  record: ({ id }) => localityProfilerEvents.push(id),
};

try {
  localityEditor.update((tx) =>
    tx.text.insert('!', {
      at: { offset: 1, path: [Math.floor(localityBlocks / 2), 0] },
    })
  );
} finally {
  localityProfilerOwner.__PLITE_REACT_RENDER_PROFILER__ =
    previousLocalityProfiler;
}

const incrementalValidationHits = localityProfilerEvents.filter(
  (id) => id === 'schema-validation-incremental-hit'
).length;
const incrementalValidationFullDocumentScans = localityProfilerEvents.filter(
  (id) => id === 'schema-validation-full-document-boundary'
).length;
const incrementalValidationWindowDiscoveries = localityProfilerEvents.filter(
  (id) => id === 'schema-validation-window-discovery'
).length;
const incrementalValidationMainPropertyVisits =
  localityVisits.mainElement + localityVisits.mainText;
const incrementalValidationNamedRootPropertyVisits =
  localityVisits.auxElement + localityVisits.auxText;

const INVALIDATION_AFFECTED_RUNTIME_IDS = 64;
const INVALIDATION_SMALL_DOCUMENT_BLOCKS = 1000;
const INVALIDATION_LARGE_DOCUMENT_BLOCKS = 50_000;
const INVALIDATION_WARMUP_ITERATIONS = 250;
const INVALIDATION_DORMANT_TYPES = [
  'schema_delta_dormant_0',
  'schema_delta_dormant_1',
  'schema_delta_dormant_2',
  'schema_delta_dormant_3',
  'schema_delta_dormant_4',
  'schema_delta_dormant_5',
  'schema_delta_dormant_6',
  'schema_delta_dormant_7',
] as const;
const INVALIDATION_ALL_CHANGED_TYPES = [
  'schema_delta_affected',
  ...INVALIDATION_DORMANT_TYPES,
] as const;
const invalidationSlot = defineExtensionSlot(
  'schema-architecture-invalidation-slot'
);
const createInvalidationSchema = (
  version: number,
  readOnlyTypes: ReadonlySet<string>,
  propertySplit: 'drop' | 'preserve' = 'preserve'
) =>
  defineEditorSchema('schema:schema-architecture-invalidation', {
    elements: {
      schema_delta_affected: {
        content: schema.content.text(),
        readOnly: readOnlyTypes.has('schema_delta_affected'),
      },
      schema_delta_dormant_0: {
        content: schema.content.text(),
        readOnly: readOnlyTypes.has('schema_delta_dormant_0'),
      },
      schema_delta_dormant_1: {
        content: schema.content.text(),
        readOnly: readOnlyTypes.has('schema_delta_dormant_1'),
      },
      schema_delta_dormant_2: {
        content: schema.content.text(),
        readOnly: readOnlyTypes.has('schema_delta_dormant_2'),
      },
      schema_delta_dormant_3: {
        content: schema.content.text(),
        readOnly: readOnlyTypes.has('schema_delta_dormant_3'),
      },
      schema_delta_dormant_4: {
        content: schema.content.text(),
        readOnly: readOnlyTypes.has('schema_delta_dormant_4'),
      },
      schema_delta_dormant_5: {
        content: schema.content.text(),
        readOnly: readOnlyTypes.has('schema_delta_dormant_5'),
      },
      schema_delta_dormant_6: {
        content: schema.content.text(),
        readOnly: readOnlyTypes.has('schema_delta_dormant_6'),
      },
      schema_delta_dormant_7: {
        content: schema.content.text(),
        readOnly: readOnlyTypes.has('schema_delta_dormant_7'),
      },
      schema_delta_unrelated: { content: schema.content.text() },
    },
    id: 'schema-architecture-invalidation',
    properties: [
      schema.elementProperty('schema_delta_property', property.string(), {
        split: propertySplit,
        target: target.type('schema_delta_affected'),
      }),
    ],
    root: schema.content.any(
      [
        schema.content.type('schema_delta_affected'),
        schema.content.type('schema_delta_dormant_0'),
        schema.content.type('schema_delta_dormant_1'),
        schema.content.type('schema_delta_dormant_2'),
        schema.content.type('schema_delta_dormant_3'),
        schema.content.type('schema_delta_dormant_4'),
        schema.content.type('schema_delta_dormant_5'),
        schema.content.type('schema_delta_dormant_6'),
        schema.content.type('schema_delta_dormant_7'),
        schema.content.type('schema_delta_unrelated'),
      ],
      { default: { type: 'schema_delta_affected' }, min: 1 }
    ),
    unknown: 'reject',
    version,
  });
const createInvalidationValue = (blocks: number): EditorDocumentValue => ({
  children: Array.from({ length: blocks }, (_value, index) => ({
    children: [{ text: `schema-delta-${index}` }],
    type:
      index < INVALIDATION_AFFECTED_RUNTIME_IDS
        ? 'schema_delta_affected'
        : 'schema_delta_unrelated',
  })),
});
const createInvalidationEditor = (blocks: number) =>
  createEditor({
    extensions: [invalidationSlot.of(createInvalidationSchema(1, new Set()))],
    initialValue: createInvalidationValue(blocks),
  });
const measureColdInvalidationIndex = (blocks: number) =>
  summarize(
    Array.from({ length: invalidationSamples }, () => {
      const measured = createInvalidationEditor(blocks);
      const before = performance.now();
      const entries = getEditorRuntimeElementEntries(
        measured,
        ['schema_delta_affected'],
        MAIN_ROOT_KEY
      );
      const elapsed = performance.now() - before;

      assert.equal(entries.length, INVALIDATION_AFFECTED_RUNTIME_IDS);

      return elapsed;
    })
  );
const prepareInvalidation = (
  blocks: number,
  changedTypes: readonly string[]
) => {
  const measured = createInvalidationEditor(blocks);

  measured.update.extensions.reconfigure(
    invalidationSlot,
    createInvalidationSchema(2, new Set(changedTypes))
  );

  const commit = measured.read.lastCommit();
  const delta = measured.read.schema.delta();

  assert.ok(commit);
  assert.deepEqual(delta?.elementTypes, [...changedTypes].sort());
  assert.equal(
    getSchemaInvalidatedRuntimeIds(measured, commit).length,
    INVALIDATION_AFFECTED_RUNTIME_IDS
  );

  return { commit, editor: measured };
};
const measureSchemaInvalidationSample = (
  prepared: ReturnType<typeof prepareInvalidation>
) => {
  let matches = 0;
  const before = process.hrtime.bigint();

  for (let index = 0; index < invalidationIterations; index += 1) {
    if (
      getSchemaInvalidatedRuntimeIds(prepared.editor, prepared.commit)
        .length === INVALIDATION_AFFECTED_RUNTIME_IDS
    ) {
      matches += 1;
    }
  }

  assert.equal(matches, invalidationIterations);

  return Number(process.hrtime.bigint() - before) / invalidationIterations;
};
const coldInvalidationSmallMs = measureColdInvalidationIndex(
  INVALIDATION_SMALL_DOCUMENT_BLOCKS
);
const coldInvalidationLargeMs = measureColdInvalidationIndex(
  INVALIDATION_LARGE_DOCUMENT_BLOCKS
);
const oneTypeSmallInvalidation = prepareInvalidation(
  INVALIDATION_SMALL_DOCUMENT_BLOCKS,
  ['schema_delta_affected']
);
const oneTypeLargeInvalidation = prepareInvalidation(
  INVALIDATION_LARGE_DOCUMENT_BLOCKS,
  ['schema_delta_affected']
);
const manyTypeLargeInvalidation = prepareInvalidation(
  INVALIDATION_LARGE_DOCUMENT_BLOCKS,
  INVALIDATION_ALL_CHANGED_TYPES
);
const invalidationPrepared = [
  oneTypeSmallInvalidation,
  oneTypeLargeInvalidation,
  manyTypeLargeInvalidation,
] as const;
const invalidationMeasurements = measureCohortsRoundRobin(
  invalidationPrepared,
  invalidationSamples,
  (prepared) => {
    for (let index = 0; index < INVALIDATION_WARMUP_ITERATIONS; index++) {
      assert.equal(
        getSchemaInvalidatedRuntimeIds(prepared.editor, prepared.commit).length,
        INVALIDATION_AFFECTED_RUNTIME_IDS
      );
    }
  },
  measureSchemaInvalidationSample
);
const warmInvalidationSmallNs = summarize(invalidationMeasurements.samples[0]!);
const warmInvalidationLargeNs = summarize(invalidationMeasurements.samples[1]!);
const warmInvalidationManyTypesNs = summarize(
  invalidationMeasurements.samples[2]!
);
const invalidationDocumentWidthRatio =
  warmInvalidationLargeNs.p50 / warmInvalidationSmallNs.p50;
const invalidationChangedTypeRatio =
  warmInvalidationManyTypesNs.p50 / warmInvalidationLargeNs.p50;
const propertyInvalidationEditor = createInvalidationEditor(
  INVALIDATION_LARGE_DOCUMENT_BLOCKS
);

propertyInvalidationEditor.update.extensions.reconfigure(
  invalidationSlot,
  createInvalidationSchema(2, new Set(), 'drop')
);

const propertyInvalidationCommit = propertyInvalidationEditor.read.lastCommit();
const propertyInvalidationDelta =
  propertyInvalidationEditor.read.schema.delta();

assert.ok(propertyInvalidationCommit);
assert.deepEqual(propertyInvalidationDelta?.elementTypes, [
  'schema_delta_affected',
]);
assert.equal(propertyInvalidationDelta?.propertyIds.length, 1);
const propertyInvalidationRuntimeIds = getSchemaInvalidatedRuntimeIds(
  propertyInvalidationEditor,
  propertyInvalidationCommit
).length;

assert.equal(propertyInvalidationRuntimeIds, INVALIDATION_AFFECTED_RUNTIME_IDS);

const PROJECTED_CLIPBOARD_DOCUMENT_COHORTS = [1000, 50_000] as const;
const PROJECTED_CLIPBOARD_ROOT =
  'schema-architecture-projected-root' as RootKey;
const projectedClipboardSchema = defineEditorSchema(
  'schema:schema-architecture-projected-clipboard',
  {
    elements: {
      projected_card: {
        content: schema.content.open(),
        contentRoots: {
          body: schema.content.not(schema.content.text()),
        },
        void: 'editable-island',
      },
      projected_paragraph: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
    id: 'schema-architecture-projected-clipboard',
    root: schema.content.types(['projected_card', 'projected_paragraph'], {
      default: { type: 'projected_paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  }
);
const projectedParagraph = (text: string) => ({
  children: [{ text }],
  type: 'projected_paragraph',
});
const projectedCard = () => ({
  childRoots: { body: PROJECTED_CLIPBOARD_ROOT },
  children: [{ text: '' }],
  type: 'projected_card',
});
const projectedPoint = (
  root: RootKey | undefined,
  path: readonly number[],
  offset: number
): Point => ({
  ...(root ? { root } : {}),
  offset,
  path: [...path],
});
const projectedOwner = {
  childRoot: PROJECTED_CLIPBOARD_ROOT,
  ownerPath: [1],
  ownerRoot: 'main',
} satisfies PliteProjectionOwner;
const createProjectedClipboardEditor = (blocks: number) => {
  const owner = createEditor({
    extensions: [projectedClipboardSchema],
    initialValue: {
      children: [
        projectedParagraph('Before'),
        projectedCard(),
        ...Array.from({ length: blocks - 2 }, (_value, index) =>
          projectedParagraph(`Unrelated ${index}`)
        ),
      ],
      roots: {
        [PROJECTED_CLIPBOARD_ROOT]: [
          projectedParagraph('Inside'),
          projectedParagraph('More'),
        ],
      },
    },
  });
  const editor = createEditorView(owner) as unknown as ReactRuntimeEditor;
  const graph = createPliteProjectionGraph([
    { path: [0], root: 'main' },
    { owner: projectedOwner, path: [0], root: PROJECTED_CLIPBOARD_ROOT },
  ]);

  writePliteViewSelection(
    editor,
    createPliteViewSelection(graph, {
      anchor: {
        point: projectedPoint(undefined, [0, 0], 'Bef'.length),
      },
      focus: {
        owner: projectedOwner,
        point: projectedPoint(PROJECTED_CLIPBOARD_ROOT, [0, 0], 'In'.length),
      },
      kind: 'text',
    })
  );

  return editor;
};
const createProjectedClipboardData = () => {
  const values = new Map<string, string>();

  return {
    getData: (type: string) => values.get(type) ?? '',
    payloadBytes: () =>
      [...values.values()].reduce(
        (total, value) => total + Buffer.byteLength(value),
        0
      ),
    setData: (type: string, value: string) => {
      values.set(type, value);
    },
  };
};
const measureProjectedClipboardCohort = (
  blocks: (typeof PROJECTED_CLIPBOARD_DOCUMENT_COHORTS)[number]
) => {
  const measured = createProjectedClipboardEditor(blocks);
  const projectedData = createProjectedClipboardData();

  assert.equal(
    writeProjectedViewSelectionClipboardData(measured, projectedData),
    true
  );

  const slice = decodeProjectedClipboardFragment(measured, projectedData);
  const fragment = getProjectedViewSelectionFragment(measured);

  assert.ok(slice);
  assert.deepEqual(fragment, [
    projectedParagraph('ore'),
    projectedParagraph('In'),
  ]);
  assert.deepEqual(slice.content, fragment);
  assert.equal(slice.openStart, 1);
  assert.equal(slice.openEnd, 1);

  let fragmentReads = 0;
  const fragmentNs = summarize(
    Array.from({ length: architectureIterations }, () => {
      const before = process.hrtime.bigint();

      for (let index = 0; index < projectedClipboardIterations; index += 1) {
        if (getProjectedViewSelectionFragment(measured)?.length === 2) {
          fragmentReads += 1;
        }
      }

      return (
        Number(process.hrtime.bigint() - before) / projectedClipboardIterations
      );
    })
  );
  const canonical = getEditorRuntimeOwner(measured);
  let hostWrites = 0;
  const hostWriteNs = summarize(
    Array.from({ length: architectureIterations }, () => {
      const data = createProjectedClipboardData();
      const before = process.hrtime.bigint();

      for (let index = 0; index < projectedClipboardIterations; index += 1) {
        writeDOMHostFragmentData(canonical, data, {
          clipboardFormatKey: getDOMClipboardFormatKey(canonical),
          html: ({ text }) => `<span>${text}</span>`,
          slice,
        });
        hostWrites += 1;
      }

      return (
        Number(process.hrtime.bigint() - before) / projectedClipboardIterations
      );
    })
  );
  const payloadBytes = projectedData.payloadBytes();

  assert.equal(
    fragmentReads,
    projectedClipboardIterations * architectureIterations
  );
  assert.equal(
    hostWrites,
    projectedClipboardIterations * architectureIterations
  );
  assert.ok(payloadBytes > 0);

  return {
    blocks,
    fragmentNs,
    fragmentReads,
    hostWriteNs,
    hostWrites,
    openEnd: slice.openEnd,
    openStart: slice.openStart,
    payloadBytes,
    selectedNodes: fragment.length,
  };
};
const projectedClipboardRows = PROJECTED_CLIPBOARD_DOCUMENT_COHORTS.map(
  measureProjectedClipboardCohort
);
const projectedClipboardDocumentWidthRatio =
  projectedClipboardRows[1].fragmentNs.p50 /
  Math.max(projectedClipboardRows[0].fragmentNs.p50, 1);
const projectedClipboardHostWidthRatio =
  projectedClipboardRows[1].hostWriteNs.p50 /
  Math.max(projectedClipboardRows[0].hostWriteNs.p50, 1);

const profilerEvents: string[] = [];
const profilerOwner = globalThis as typeof globalThis & {
  __PLITE_REACT_RENDER_PROFILER__?: {
    record: (event: { id: string }) => void;
  };
};
const previousProfiler = profilerOwner.__PLITE_REACT_RENDER_PROFILER__;

profilerOwner.__PLITE_REACT_RENDER_PROFILER__ = {
  record: ({ id }) => profilerEvents.push(id),
};

const equivalentDefinition = createSchemaArchitectureCorpus();
const beforeReconfiguration = getCompiledEditorSchema(editor)!;
let equivalentReconfigurationCommitCount = 0;

editor.subscribeCommit(() => {
  equivalentReconfigurationCommitCount += 1;
});

profilerEvents.length = 0;
const reconfigurationSamples = Array.from(
  { length: iterations },
  (_, index) => {
    const before = performance.now();

    editor.update.extensions.reconfigure(
      slot,
      index % 2 === 0 ? equivalentDefinition : definition
    );

    return performance.now() - before;
  }
);
const afterReconfiguration = getCompiledEditorSchema(editor)!;
const equivalentReconfigurationMs = summarize(reconfigurationSamples);
const equivalentReconfigurationCompileCount = profilerEvents.filter(
  (id) => id === 'schema-compile'
).length;
const equivalentReconfigurationIdentityReused =
  beforeReconfiguration === afterReconfiguration;

if (previousProfiler)
  profilerOwner.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
else profilerOwner.__PLITE_REACT_RENDER_PROFILER__ = undefined;

const compiledRepresentation = (schemaValue: CompiledEditorSchema) => ({
  elements: [...schemaValue.elements.byType].map(([type, value]) => ({
    behavior: value.behavior,
    content: value.content
      ? {
          allowedElementTypes: [...value.content.allowedElementTypes],
          allowsText: value.content.allowsText,
          defaultPlan: value.content.defaultPlan,
          max: value.content.max,
          min: value.content.min,
        }
      : null,
    groups: [...value.groups],
    propertyIds: [...value.propertyIds],
    slice: value.slice,
    type,
  })),
  identity: schemaValue.identity,
  properties: [...schemaValue.properties.byId].map(([id, value]) => ({
    descriptor: value.descriptor,
    id,
    key: value.key,
    lifecycle: value.lifecycle,
    merge: value.merge,
    placement: value.placement,
    target: value.target,
  })),
  roots: [schemaValue.primaryRoot, ...schemaValue.roots.values()].map(
    (root) => ({
      allowedElementTypes: [...root.content.allowedElementTypes],
      allowsText: root.content.allowsText,
      defaultPlan: root.content.defaultPlan,
      max: root.content.max,
      min: root.content.min,
      name: root.name,
    })
  ),
  unknown: schemaValue.unknown,
  vocabulary: schemaValue.vocabulary,
});
const retainedRepresentationBytesProxy = Buffer.byteLength(
  JSON.stringify(compiledRepresentation(compiled))
);
const declarationBytesProxy = Buffer.byteLength(
  JSON.stringify(definition.schema)
);
const createMinimalSchema = () =>
  defineEditorSchema('schema:schema-architecture-minimal', {
    elements: {
      minimal_block: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
    id: 'schema-architecture-minimal',
    root: schema.content.type('minimal_block', {
      default: { type: 'minimal_block' },
      min: 1,
    }),
    roots: Object.fromEntries(
      Array.from(
        { length: SCHEMA_ARCHITECTURE_CORPUS.namedRoots },
        (_value, index) => [
          `aux_${index + 1}`,
          {
            content: schema.content.type('minimal_block', {
              default: { type: 'minimal_block' },
              min: 1,
            }),
          },
        ]
      )
    ),
    unknown: 'reject',
    version: 1,
  });
const createMinimalValue = (): EditorDocumentValue => {
  const child = () => ({
    children: [{ text: 'schema benchmark' }],
    type: 'minimal_block',
  });

  return {
    children: [child()],
    roots: Object.fromEntries(
      Array.from(
        { length: SCHEMA_ARCHITECTURE_CORPUS.namedRoots },
        (_value, index) => [`aux_${index + 1}`, [child()]]
      )
    ),
  };
};
const gc = globalThis.gc;
const forceGc = () => {
  if (!gc) return;

  gc();
  gc();
  gc();
};
const measureRetained = (
  extension: EditorSchemaExtension,
  probeType: string,
  value: () => EditorDocumentValue
) => {
  forceGc();
  const before = process.memoryUsage().heapUsed;
  const editors = Array.from({ length: heapEditors }, () => {
    const measured = createEditor({
      extensions: [extension],
      initialValue: value(),
    });

    assert.equal(
      getCompiledEditorSchema(measured)?.elements.byType.has(probeType),
      true
    );

    return measured;
  });

  forceGc();
  const retainedBytes = process.memoryUsage().heapUsed - before;

  assert.equal(editors.length, heapEditors);
  assert.ok(editors.at(-1));

  return retainedBytes;
};
const measureRetainedSchemaSample = () => {
  const minimalBytes = measureRetained(
    createMinimalSchema(),
    'minimal_block',
    createMinimalValue
  );

  forceGc();
  const corpusBytes = measureRetained(
    definition,
    schemaElementType(SCHEMA_ARCHITECTURE_CORPUS.elementTypes - 1),
    createSchemaArchitectureValue
  );

  forceGc();

  return (corpusBytes - minimalBytes) / heapEditors;
};
const gcAvailable = typeof gc === 'function';

if (gcAvailable) measureRetainedSchemaSample();

const retainedHeapSamples = gcAvailable
  ? Array.from({ length: 5 }, measureRetainedSchemaSample)
  : [];
const retainedHeapBytesPerEditor = gcAvailable
  ? summarize(retainedHeapSamples)
  : null;
const retainedHeapWorstCaseBytesPerEditor = retainedHeapBytesPerEditor
  ? Math.max(0, ...retainedHeapSamples)
  : null;
const ratios = {
  equivalentReconfiguration:
    equivalentReconfigurationMs.p95 /
    LEGACY_BASELINE.equivalentReconfigurationP95Ms,
  exactProperty:
    exactPropertyQueryNs.p50 / LEGACY_BASELINE.exactElementPropertyP50Ns,
  namespace: prefixPropertyQueryNs.p50 / LEGACY_BASELINE.namespaceP50Ns,
  retainedHeap:
    retainedHeapWorstCaseBytesPerEditor !== null
      ? retainedHeapWorstCaseBytesPerEditor /
        LEGACY_BASELINE.retainedSchemaHeapP50BytesPerEditor
      : null,
  retainedHeapP50: retainedHeapBytesPerEditor
    ? Math.max(0, retainedHeapBytesPerEditor.p50) /
      LEGACY_BASELINE.retainedSchemaHeapP50BytesPerEditor
    : null,
  type: typeQueryNs.p50 / LEGACY_BASELINE.typeP50Ns,
  wrapper: wrapperQueryNs.p50 / LEGACY_BASELINE.wrapperP50Ns,
};
const EXECUTION_BUDGETS = Object.freeze({
  constructionPropertyWidthRatioInclusive: 2,
  contribution1000CompileP95MsExclusive: 100,
  contribution1000PreviousRevisionCacheP95MsExclusive: 50,
  contribution1000StructuralCacheP95MsExclusive: 25,
  largeDocumentMigration10000P95MsExclusive: 2000,
  largeDocumentMigrationWidthRatioInclusive: 15,
  plateDescriptorResolutionWidthRatioInclusive: 2,
  plateStartup1000P95MsExclusive: 2500,
  plateStartupPerDescriptorRatioInclusive: 2.5,
  projectedClipboardHostWidthRatioInclusive: 2,
  projectedClipboardWidthRatioInclusive: 1.5,
  typecheck1000CheckMsExclusive: 5000,
  typecheck1000InstantiationsExclusive: 5_000_000,
  typecheck1000MemoryBytesExclusive: 1_342_177_280,
  typecheckCheckTimeRatioInclusive: 2,
  typecheckInstantiationRatioInclusive: 1.25,
});

const result = {
  baseline: {
    ...LEGACY_BASELINE,
    comparability: {
      allowedParent: 'No legacy equivalent; current baseline only.',
      compile:
        'Legacy measured full editor construction; current measures the pure compiler, so no ratio is reported.',
      fullValidation:
        'No legacy full-document validation metric exists. Cold detached and warm frozen 10k-block multi-root rows are current baselines only.',
      group:
        'Legacy measured targeted property resolution; current measures compiled group membership, so no ratio is reported.',
      retainedHeap:
        'Same forced-GC corpus-minus-minimal retained bytes per live editor, with the same 128-editor and five-sample default. The promotion ratio conservatively uses the worst current sample against the legacy p50 because shared compiled schemas can make the true per-editor delta smaller than GC noise.',
      retainedRepresentation:
        'The deterministic serialized compiled-representation byte proxy is supplemental and is never compared with heap units.',
      reconfiguration:
        'Same real editor slot reconfiguration path and equivalent corpus.',
      typeExactPropertyAndPrefix:
        'Same successful warm lookup question over the same corpus; current paths query the compiled artifact directly.',
      wrapper:
        'Same successful repeated wrapper lookup over the same schema corpus; the current public query returns one revision-compiled plan identity without BFS or factory probing.',
    },
  },
  benchmark: 'plite-schema-architecture',
  schemaConstructionAuthority: {
    authority:
      'Isolated createAndFill over one compiled target plan; editor transactions and immutable document publication are outside this timing.',
    iterations: constructionIterations,
    propertyWidthRatio: constructionPropertyWidthRatio,
    rows: constructionPropertyRows,
  },
  contributions: {
    iterations: architectureIterations,
    rows: contributionRows,
  },
  corpus: {
    ...SCHEMA_ARCHITECTURE_CORPUS,
    exactProperties:
      SCHEMA_ARCHITECTURE_CORPUS.exactElementProperties +
      SCHEMA_ARCHITECTURE_CORPUS.exactTextProperties,
    prefixProperties:
      SCHEMA_ARCHITECTURE_CORPUS.prefixElementProperties +
      SCHEMA_ARCHITECTURE_CORPUS.prefixTextProperties,
  },
  environment: {
    arch: process.arch,
    platform: process.platform,
    runtime: process.versions.bun ? 'bun' : 'node',
    runtimeVersion: process.versions.bun ?? process.version,
  },
  executionBudgets: EXECUTION_BUDGETS,
  generatedAt: new Date().toISOString(),
  largeDocumentMigration: {
    documentWidthRatio: migrationDocumentWidthRatio,
    iterations: migrationIterations,
    rows: migrationRows,
    sampling: {
      cohortOrder: migrationMeasurements.order.map((round) =>
        round.map((index) => MIGRATION_DOCUMENT_COHORTS[index]!)
      ),
      gcBeforeEachSample: typeof globalThis.gc === 'function',
      order: ROUND_ROBIN_SAMPLING_ORDER,
      samplesPerCohort: migrationIterations,
      warmupIterationsPerCohort: 1,
    },
  },
  plateDescriptors: {
    resolutionWidthRatio: plateDescriptorResolutionWidthRatio,
    rows: plateDescriptorRows,
    startupScope: {
      cached:
        'Repeated editor creation with the last cold cohort and structural schema cache available.',
      cold: 'Editor creation from unique descriptor and schema identities; plugin definition is outside the timed region.',
    },
    startupSampling: {
      cohortOrder: plateDescriptorStartupMeasurements.order.map((round) =>
        round.map((index) => PLATE_DESCRIPTOR_COHORTS[index]!)
      ),
      gcBeforeEachSample: typeof globalThis.gc === 'function',
      order: ROUND_ROBIN_SAMPLING_ORDER,
      samplesPerCohort: architectureIterations,
      warmupIterationsPerCohort: 1,
    },
    startupPerDescriptorRatio: plateStartupPerDescriptorRatio,
  },
  projectedClipboardLocality: {
    documentWidthRatio: projectedClipboardDocumentWidthRatio,
    hostSerializationWidthRatio: projectedClipboardHostWidthRatio,
    iterations: projectedClipboardIterations,
    rows: projectedClipboardRows,
  },
  queries: {
    allowedParentNs: allowedParentQueryNs,
    exactPropertyNs: exactPropertyQueryNs,
    groupNs: groupQueryNs,
    iterations: queryIterations,
    samples: querySamples,
    textPrefixPropertyNs: textPrefixPropertyQueryNs,
    typeNs: typeQueryNs,
    wrapperNs: wrapperQueryNs,
    prefixPropertyNs: prefixPropertyQueryNs,
    work: {
      allowedParentMapLookupsPerQuery: 1,
      exactPropertyCandidateIdsPerQuery: 1,
      exactPropertyPrefixSelectorTestsPerQuery:
        compiled.properties.lookup.element.prefixes.length,
      groupMapLookupsPerQuery: 1,
      prefixPropertyCandidateIdsPerQuery: 1,
      prefixPropertySelectorTestsPerQuery:
        compiled.properties.lookup.element.prefixes.length,
      textPrefixPropertySelectorTestsPerQuery:
        compiled.properties.lookup.text.prefixes.length,
      typeMapLookupsPerQuery: 1,
      wrapperPlanIdentityReused: true,
      wrapperPlanLength: wrapperPlan.length,
      wrapperPlanSearchCount,
      wrapperPlanSearchesAfterFirst,
      wrapperUnknownPlanIdentityCount: new Set(hostileWrapperPlans).size,
    },
  },
  ratios,
  retainedRepresentation: {
    compiledBytesProxy: retainedRepresentationBytesProxy,
    declarationBytesProxy,
    policy:
      'Deterministic UTF-8 bytes of a JSON projection of every retained compiled declaration field; this is a representation-size proxy, not JS heap.',
  },
  retainedHeap: {
    bytesPerEditor: retainedHeapBytesPerEditor,
    editorsPerSample: heapEditors,
    samples: retainedHeapSamples,
    supported: gcAvailable,
    worstCaseBytesPerEditor: retainedHeapWorstCaseBytesPerEditor,
  },
  schemaInvalidation: {
    affectedRuntimeIds: INVALIDATION_AFFECTED_RUNTIME_IDS,
    changedTypeRatio: invalidationChangedTypeRatio,
    coldIndexLargeMs: coldInvalidationLargeMs,
    coldIndexSmallMs: coldInvalidationSmallMs,
    documentWidthRatio: invalidationDocumentWidthRatio,
    iterations: invalidationIterations,
    largeDocumentBlocks: INVALIDATION_LARGE_DOCUMENT_BLOCKS,
    manyChangedTypes: INVALIDATION_ALL_CHANGED_TYPES.length,
    propertyAffectedRuntimeIds: propertyInvalidationRuntimeIds,
    samples: invalidationSamples,
    sampling: {
      cohortOrder: invalidationMeasurements.order,
      gcBeforeEachSample: typeof globalThis.gc === 'function',
      iterationsPerSample: invalidationIterations,
      order: ROUND_ROBIN_SAMPLING_ORDER,
      rawSamplesNs: invalidationMeasurements.samples,
      samplesPerCohort: invalidationSamples,
      warmupIterationsPerCohort: INVALIDATION_WARMUP_ITERATIONS,
    },
    smallDocumentBlocks: INVALIDATION_SMALL_DOCUMENT_BLOCKS,
    warmLargeNs: warmInvalidationLargeNs,
    warmManyTypesNs: warmInvalidationManyTypesNs,
    warmSmallNs: warmInvalidationSmallNs,
  },
  strictValidation: {
    requested: strictValidationRequested,
    status: 'measured' as 'measured' | 'passed',
  },
  thresholdPolicy: {
    absolute:
      'Compile p95 stays below 16 ms and equivalent reconfiguration performs zero compiler runs.',
    relative:
      'Only semantically comparable legacy rows receive ratios. Type, exact property, prefix, and wrapper lookup target at least 2x less latency; equivalent reconfiguration stays within 5% of its legacy p95; every forced-GC retained-heap sample stays at least 25% below the legacy p50.',
    unpaired:
      'Group, allowed-parent, compiler-only compile scope, cold-detached/repeated-frozen full validation, and representation-size-proxy rows are honest current baselines without invented ratios.',
  },
  timings: {
    compileMs,
    equivalentReconfigurationCommitCount,
    equivalentReconfigurationCompileCount,
    equivalentReconfigurationIdentityReused,
    equivalentReconfigurationMs,
    iterations,
    sampling: {
      compileWarmupIterations: 3,
      typecheckHeapClearedBeforeRuntime:
        schemaTypecheckBudget !== null && typeof globalThis.gc === 'function',
    },
  },
  typecheckBudget: schemaTypecheckBudget
    ? {
        ...schemaTypecheckBudget,
        wideningBoundary:
          'The 100-plugin fixture preserves a literal tuple. The 1,000-plugin fixture explicitly widens to readonly AnyBasePlugin[] so editor inference stays bounded while every descriptor still typechecks.',
      }
    : {
        enabled: false,
        reason:
          'Set PLITE_SCHEMA_TYPECHECK_BUDGET=1 for the registered strict target.',
      },
  validation: {
    blocks: validationBlocks,
    coldMs: coldFullValidationMs,
    coldValidatedBlocks: validationBlocks * validationIterations,
    frozenValue: Object.isFrozen(repeatedFrozenValidationValue.children),
    iterations: validationIterations,
    repeatedFrozenMs: repeatedFrozenFullValidationMs,
    repeatedFrozenValidatedBlocks: validationBlocks * validationIterations,
    roots: SCHEMA_ARCHITECTURE_CORPUS.roots,
  },
  validationLocality: {
    fullDocumentScans: incrementalValidationFullDocumentScans,
    incrementalHits: incrementalValidationHits,
    mainElementPropertyVisits: localityVisits.mainElement,
    mainPropertyVisits: incrementalValidationMainPropertyVisits,
    mainTextPropertyVisits: localityVisits.mainText,
    namedRootPropertyVisits: incrementalValidationNamedRootPropertyVisits,
    sourceBlocks: localityBlocks,
    windowDiscoveries: incrementalValidationWindowDiscoveries,
  },
  wrapperLookup: {
    firstNs: unknownWrapperFirstQueryNs,
    hostileTypes: hostileWrapperTypes.length,
    planSearches: wrapperPlanSearchCount,
    planSearchesAfterFirst: wrapperPlanSearchesAfterFirst,
    warmNs: unknownWrapperWarmQueryNs,
  },
  version: 6,
};

const validateStrictBenchmark = () => {
  assert.ok(
    compileMs.p95 < 16,
    `compile p95 ${compileMs.p95} ms exceeds 16 ms`
  );
  assert.equal(equivalentReconfigurationCompileCount, 0);
  assert.equal(equivalentReconfigurationIdentityReused, true);
  assert.equal(incrementalValidationHits, 1);
  assert.equal(incrementalValidationFullDocumentScans, 0);
  assert.equal(incrementalValidationWindowDiscoveries, 1);
  assert.equal(localityVisits.mainElement, 1);
  assert.equal(localityVisits.mainText, 1);
  assert.equal(incrementalValidationNamedRootPropertyVisits, 0);
  assert.equal(incrementalValidationMainPropertyVisits, 2);
  assert.ok(ratios.type <= 0.5, `type ratio ${ratios.type} exceeds 0.5`);
  assert.ok(
    ratios.exactProperty <= 0.5,
    `exact-property ratio ${ratios.exactProperty} exceeds 0.5`
  );
  assert.ok(
    ratios.namespace <= 0.5,
    `prefix-property ratio ${ratios.namespace} exceeds 0.5`
  );
  assert.ok(
    ratios.wrapper <= 0.5,
    `wrapper ratio ${ratios.wrapper} exceeds 0.5`
  );
  assert.ok(
    ratios.equivalentReconfiguration <= 1.05,
    `reconfiguration ratio ${ratios.equivalentReconfiguration} exceeds 1.05`
  );
  assert.equal(
    gcAvailable,
    true,
    'Strict retained-heap proof requires --expose-gc.'
  );
  assert.ok(
    ratios.retainedHeap !== null && ratios.retainedHeap <= 0.75,
    `retained-heap ratio ${ratios.retainedHeap} exceeds 0.75`
  );
  assert.ok(retainedRepresentationBytesProxy > 0);
  assert.ok(coldFullValidationMs.p50 > 0);
  assert.ok(repeatedFrozenFullValidationMs.p50 > 0);
  assert.equal(wrapperPlanSearchCount, 1);
  assert.equal(wrapperPlanSearchesAfterFirst, 0);
  assert.ok(
    invalidationDocumentWidthRatio <= 1.5,
    `schema invalidation document-width ratio ${invalidationDocumentWidthRatio} exceeds 1.5`
  );
  assert.ok(
    invalidationChangedTypeRatio <= 2,
    `schema invalidation changed-type ratio ${invalidationChangedTypeRatio} exceeds 2`
  );
  assert.equal(
    propertyInvalidationRuntimeIds,
    INVALIDATION_AFFECTED_RUNTIME_IDS
  );
  for (const row of contributionRows) {
    assert.equal(row.coldMergeCompileCount, 1);
    assert.equal(row.structuralCacheCompileCount, 0);
    assert.equal(row.previousRevisionCompileCount, 0);
    assert.equal(row.elements, row.contributions);
  }
  assert.ok(
    contributionRows[2].directCompileMs.p95 <
      EXECUTION_BUDGETS.contribution1000CompileP95MsExclusive,
    `1,000-contribution compile p95 ${contributionRows[2].directCompileMs.p95} ms exceeds ${EXECUTION_BUDGETS.contribution1000CompileP95MsExclusive} ms`
  );
  assert.ok(
    contributionRows[2].structuralCacheMs.p95 <
      EXECUTION_BUDGETS.contribution1000StructuralCacheP95MsExclusive,
    `1,000-contribution structural-cache p95 ${contributionRows[2].structuralCacheMs.p95} ms exceeds ${EXECUTION_BUDGETS.contribution1000StructuralCacheP95MsExclusive} ms`
  );
  assert.ok(
    contributionRows[2].previousRevisionCacheMs.p95 <
      EXECUTION_BUDGETS.contribution1000PreviousRevisionCacheP95MsExclusive,
    `1,000-contribution previous-revision cache p95 ${contributionRows[2].previousRevisionCacheMs.p95} ms exceeds ${EXECUTION_BUDGETS.contribution1000PreviousRevisionCacheP95MsExclusive} ms`
  );
  assert.ok(
    plateDescriptorResolutionWidthRatio <=
      EXECUTION_BUDGETS.plateDescriptorResolutionWidthRatioInclusive,
    `Plate descriptor resolution width ratio ${plateDescriptorResolutionWidthRatio} exceeds ${EXECUTION_BUDGETS.plateDescriptorResolutionWidthRatioInclusive}`
  );
  assert.ok(
    plateDescriptorRows[1].startupMs.p95 <
      EXECUTION_BUDGETS.plateStartup1000P95MsExclusive,
    `1,000-descriptor Plate startup p95 ${plateDescriptorRows[1].startupMs.p95} ms exceeds ${EXECUTION_BUDGETS.plateStartup1000P95MsExclusive} ms`
  );
  assert.ok(
    plateStartupPerDescriptorRatio <=
      EXECUTION_BUDGETS.plateStartupPerDescriptorRatioInclusive,
    `Plate startup per-descriptor ratio ${plateStartupPerDescriptorRatio} exceeds ${EXECUTION_BUDGETS.plateStartupPerDescriptorRatioInclusive}`
  );
  for (const row of constructionPropertyRows) {
    assert.equal(row.constructionDefaultPropertyIds, 1);
    assert.equal(row.constructionPropertyIds, 1);
  }
  assert.ok(
    constructionPropertyWidthRatio <=
      EXECUTION_BUDGETS.constructionPropertyWidthRatioInclusive,
    `Construction property-width ratio ${constructionPropertyWidthRatio} exceeds ${EXECUTION_BUDGETS.constructionPropertyWidthRatioInclusive}`
  );
  assert.ok(
    migrationRows[1].migrationMs.p95 <
      EXECUTION_BUDGETS.largeDocumentMigration10000P95MsExclusive,
    `10,000-block migration p95 ${migrationRows[1].migrationMs.p95} ms exceeds ${EXECUTION_BUDGETS.largeDocumentMigration10000P95MsExclusive} ms`
  );
  assert.ok(
    migrationDocumentWidthRatio <=
      EXECUTION_BUDGETS.largeDocumentMigrationWidthRatioInclusive,
    `Large-document migration width ratio ${migrationDocumentWidthRatio} exceeds ${EXECUTION_BUDGETS.largeDocumentMigrationWidthRatioInclusive}`
  );
  assert.equal(projectedClipboardRows[0].selectedNodes, 2);
  assert.equal(projectedClipboardRows[1].selectedNodes, 2);
  assert.equal(projectedClipboardRows[0].openStart, 1);
  assert.equal(projectedClipboardRows[0].openEnd, 1);
  assert.equal(projectedClipboardRows[1].openStart, 1);
  assert.equal(projectedClipboardRows[1].openEnd, 1);
  assert.equal(
    projectedClipboardRows[0].payloadBytes,
    projectedClipboardRows[1].payloadBytes
  );
  assert.ok(
    projectedClipboardDocumentWidthRatio <=
      EXECUTION_BUDGETS.projectedClipboardWidthRatioInclusive,
    `Projected clipboard fragment width ratio ${projectedClipboardDocumentWidthRatio} exceeds ${EXECUTION_BUDGETS.projectedClipboardWidthRatioInclusive}`
  );
  assert.ok(
    projectedClipboardHostWidthRatio <=
      EXECUTION_BUDGETS.projectedClipboardHostWidthRatioInclusive,
    `Projected clipboard host width ratio ${projectedClipboardHostWidthRatio} exceeds ${EXECUTION_BUDGETS.projectedClipboardHostWidthRatioInclusive}`
  );
  assert.ok(
    schemaTypecheckBudget,
    'Strict schema architecture proof requires PLITE_SCHEMA_TYPECHECK_BUDGET=1.'
  );
  assert.ok(
    schemaTypecheckBudget.rows[1].checkMs <
      EXECUTION_BUDGETS.typecheck1000CheckMsExclusive,
    `1,000-plugin typecheck ${schemaTypecheckBudget.rows[1].checkMs} ms exceeds ${EXECUTION_BUDGETS.typecheck1000CheckMsExclusive} ms`
  );
  assert.ok(
    schemaTypecheckBudget.rows[1].instantiations <
      EXECUTION_BUDGETS.typecheck1000InstantiationsExclusive,
    `1,000-plugin typecheck instantiations ${schemaTypecheckBudget.rows[1].instantiations} exceed ${EXECUTION_BUDGETS.typecheck1000InstantiationsExclusive}`
  );
  assert.ok(
    schemaTypecheckBudget.rows[1].memoryBytes <
      EXECUTION_BUDGETS.typecheck1000MemoryBytesExclusive,
    `1,000-plugin typecheck memory ${schemaTypecheckBudget.rows[1].memoryBytes} exceeds ${EXECUTION_BUDGETS.typecheck1000MemoryBytesExclusive}`
  );
  assert.ok(
    schemaTypecheckBudget.checkTimeRatio <=
      EXECUTION_BUDGETS.typecheckCheckTimeRatioInclusive,
    `Typecheck time ratio ${schemaTypecheckBudget.checkTimeRatio} exceeds ${EXECUTION_BUDGETS.typecheckCheckTimeRatioInclusive}`
  );
  assert.ok(
    schemaTypecheckBudget.instantiationRatio <=
      EXECUTION_BUDGETS.typecheckInstantiationRatioInclusive,
    `Typecheck instantiation ratio ${schemaTypecheckBudget.instantiationRatio} exceeds ${EXECUTION_BUDGETS.typecheckInstantiationRatioInclusive}`
  );
};

if (strictValidationRequested) {
  validateAndWriteStrictBenchmarkArtifact({
    outputPath,
    result,
    validate: validateStrictBenchmark,
  });
} else if (outputPath !== undefined) {
  writeBenchmarkArtifact(outputPath, `${JSON.stringify(result, null, 2)}\n`);
}

const output = `${JSON.stringify(result, null, 2)}\n`;

process.stdout.write(
  `METRIC plite_schema_architecture_compile_p95_ms=${compileMs.p95}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_type_query_p50_ns=${typeQueryNs.p50}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_group_query_p50_ns=${groupQueryNs.p50}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_property_query_p50_ns=${exactPropertyQueryNs.p50}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_prefix_query_p50_ns=${prefixPropertyQueryNs.p50}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_allowed_parent_query_p50_ns=${allowedParentQueryNs.p50}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_wrapper_query_p50_ns=${wrapperQueryNs.p50}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_wrapper_first_p50_ns=${unknownWrapperFirstQueryNs.p50}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_wrapper_warm_p50_ns=${unknownWrapperWarmQueryNs.p50}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_wrapper_plan_searches_after_first=${wrapperPlanSearchesAfterFirst}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_full_validation_cold_p50_ms=${coldFullValidationMs.p50}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_full_validation_cold_p95_ms=${coldFullValidationMs.p95}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_full_validation_repeated_frozen_p50_ms=${repeatedFrozenFullValidationMs.p50}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_full_validation_repeated_frozen_p95_ms=${repeatedFrozenFullValidationMs.p95}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_incremental_validation_property_visits=${incrementalValidationMainPropertyVisits}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_incremental_validation_named_root_property_visits=${incrementalValidationNamedRootPropertyVisits}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_incremental_validation_full_document_scans=${incrementalValidationFullDocumentScans}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_equivalent_reconfigure_p95_ms=${equivalentReconfigurationMs.p95}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_equivalent_reconfigure_compile_count=${equivalentReconfigurationCompileCount}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_equivalent_reconfigure_commit_count=${equivalentReconfigurationCommitCount}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_schema_invalidation_cold_index_small_p50_ms=${coldInvalidationSmallMs.p50}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_schema_invalidation_cold_index_large_p50_ms=${coldInvalidationLargeMs.p50}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_schema_invalidation_warm_small_p50_ns=${warmInvalidationSmallNs.p50}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_schema_invalidation_warm_large_p50_ns=${warmInvalidationLargeNs.p50}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_schema_invalidation_document_width_ratio=${invalidationDocumentWidthRatio}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_schema_invalidation_changed_type_ratio=${invalidationChangedTypeRatio}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_schema_invalidation_property_affected_runtime_ids=${propertyInvalidationRuntimeIds}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_contribution_1000_compile_p95_ms=${contributionRows[2].directCompileMs.p95}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_contribution_1000_structural_cache_p95_ms=${contributionRows[2].structuralCacheMs.p95}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_contribution_1000_previous_revision_cache_p95_ms=${contributionRows[2].previousRevisionCacheMs.p95}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_contribution_1000_cache_compile_count=${contributionRows[2].structuralCacheCompileCount + contributionRows[2].previousRevisionCompileCount}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_plate_descriptor_1000_resolution_p50_ns=${plateDescriptorRows[1].resolutionNs.p50}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_plate_descriptor_resolution_width_ratio=${plateDescriptorResolutionWidthRatio}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_plate_startup_1000_p95_ms=${plateDescriptorRows[1].startupMs.p95}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_plate_cached_startup_1000_p95_ms=${plateDescriptorRows[1].cachedStartupMs.p95}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_plate_startup_per_descriptor_ratio=${plateStartupPerDescriptorRatio}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_construction_property_width_ratio=${constructionPropertyWidthRatio}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_construction_1000_default_property_ids=${constructionPropertyRows[1].constructionDefaultPropertyIds}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_construction_1000_property_ids=${constructionPropertyRows[1].constructionPropertyIds}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_large_document_migration_10000_p95_ms=${migrationRows[1].migrationMs.p95}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_large_document_migration_width_ratio=${migrationDocumentWidthRatio}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_large_document_migration_10000_configuration_commit_count=${migrationRows[1].configurationDirtyCommits}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_large_document_migration_10000_migration_call_count=${migrationRows[1].migrationCalls}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_projected_clipboard_width_ratio=${projectedClipboardDocumentWidthRatio}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_projected_clipboard_host_width_ratio=${projectedClipboardHostWidthRatio}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_projected_clipboard_selected_nodes=${projectedClipboardRows[1].selectedNodes}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_projected_clipboard_open_start=${projectedClipboardRows[1].openStart}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_projected_clipboard_open_end=${projectedClipboardRows[1].openEnd}\n`
);
if (schemaTypecheckBudget) {
  process.stdout.write(
    `METRIC plite_schema_architecture_typecheck_1000_check_ms=${schemaTypecheckBudget.rows[1].checkMs}\n`
  );
  process.stdout.write(
    `METRIC plite_schema_architecture_typecheck_1000_instantiations=${schemaTypecheckBudget.rows[1].instantiations}\n`
  );
  process.stdout.write(
    `METRIC plite_schema_architecture_typecheck_1000_memory_bytes=${schemaTypecheckBudget.rows[1].memoryBytes}\n`
  );
  process.stdout.write(
    `METRIC plite_schema_architecture_typecheck_instantiation_ratio=${schemaTypecheckBudget.instantiationRatio}\n`
  );
  process.stdout.write(
    `METRIC plite_schema_architecture_typecheck_check_time_ratio=${schemaTypecheckBudget.checkTimeRatio}\n`
  );
}
process.stdout.write(
  `METRIC plite_schema_architecture_retained_representation_bytes_proxy=${retainedRepresentationBytesProxy}\n`
);
if (retainedHeapBytesPerEditor) {
  process.stdout.write(
    `METRIC plite_schema_architecture_retained_heap_p50_bytes_per_editor=${retainedHeapBytesPerEditor.p50}\n`
  );
  process.stdout.write(
    `METRIC plite_schema_architecture_retained_heap_baseline_ratio=${ratios.retainedHeap}\n`
  );
}
process.stdout.write(
  `METRIC plite_schema_architecture_type_baseline_ratio=${ratios.type}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_property_baseline_ratio=${ratios.exactProperty}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_prefix_baseline_ratio=${ratios.namespace}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_wrapper_baseline_ratio=${ratios.wrapper}\n`
);
process.stdout.write(
  `METRIC plite_schema_architecture_equivalent_reconfigure_baseline_ratio=${ratios.equivalentReconfiguration}\n`
);

if (outputPath === undefined) process.stdout.write(output);
