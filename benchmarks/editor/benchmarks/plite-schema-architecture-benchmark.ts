import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';

import {
  createEditor,
  defineEditorSchema,
  defineExtensionSlot,
  definePropertyPolicy,
  element,
  property,
  schema,
  target,
  type EditorDocumentValue,
  type EditorSchemaExtension,
} from '../../../packages/plite/src/index';
import {
  compileEditorSchemaContributions,
  getCompiledEditorSchema,
  resolveCompiledSchemaProperty,
  type CompiledEditorSchema,
  type EditorSchemaContributionRecord,
} from '../../../packages/plite/src/internal/index';
import { resolveCompiledSchemaWrapperPlan } from '../../../packages/plite/src/core/schema-compiler';
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
import { writeBenchmarkArtifact } from './benchmark-artifact';

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
const outputArgument = process.argv.find((candidate) =>
  candidate.startsWith('--output=')
);

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

const definition = createSchemaArchitectureCorpus();
const contribution = (): EditorSchemaContributionRecord => ({
  contribution: definition.schema,
  extensionName: definition.name,
  order: 0,
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
  defineEditorSchema({
    elements: {
      paragraph: element({ content: schema.content.text() }),
      wrapper: element({
        content: schema.content.not(schema.content.text()),
      }),
    },
    id: 'schema-architecture-unknown-wrapper-benchmark',
    root: schema.root({ content: schema.content.type('wrapper') }),
    unknown: 'preserve',
    version: 1,
  });
const compileUnknownWrapperSchema = () =>
  compileEditorSchemaContributions([
    {
      contribution: createUnknownWrapperDefinition().schema,
      extensionName: 'schema-architecture-unknown-wrapper-benchmark',
      order: 0,
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
const LocalityPolicy = definePropertyPolicy<LocalityTrace>({
  id: 'schema-validation-locality',
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
  version: 1,
});
const localityDescriptor = property.json<LocalityTrace>({
  policy: LocalityPolicy,
});
const LocalitySchema = defineEditorSchema({
  elements: {
    paragraph: element({
      content: schema.content.text(),
      properties: { validationElementTrace: localityDescriptor },
    }),
  },
  id: 'schema-validation-locality',
  properties: [
    schema.textProperty('validationTextTrace', localityDescriptor, {
      target: target.type('paragraph'),
    }),
  ],
  root: schema.root({
    content: schema.content.type('paragraph', { min: 1 }),
  }),
  roots: {
    aux: schema.root({
      content: schema.content.type('paragraph', { min: 1 }),
    }),
  },
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
const incrementalValidationFullFallbacks = localityProfilerEvents.filter(
  (id) => id === 'schema-validation-full-fallback'
).length;
const incrementalValidationWindowDiscoveries = localityProfilerEvents.filter(
  (id) => id === 'schema-validation-window-discovery'
).length;
const incrementalValidationMainPropertyVisits =
  localityVisits.mainElement + localityVisits.mainText;
const incrementalValidationNamedRootPropertyVisits =
  localityVisits.auxElement + localityVisits.auxText;

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
  defineEditorSchema({
    elements: {
      minimal_block: element({
        content: schema.content.text({ default: 'text', min: 1 }),
      }),
    },
    id: 'schema-architecture-minimal',
    root: schema.root({
      content: schema.content.type('minimal_block', {
        default: { type: 'minimal_block' },
        min: 1,
      }),
    }),
    roots: Object.fromEntries(
      Array.from(
        { length: SCHEMA_ARCHITECTURE_CORPUS.namedRoots },
        (_value, index) => [
          `aux_${index + 1}`,
          schema.root({
            content: schema.content.type('minimal_block', {
              default: { type: 'minimal_block' },
              min: 1,
            }),
          }),
        ]
      )
    ),
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
  generatedAt: new Date().toISOString(),
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
    fullFallbacks: incrementalValidationFullFallbacks,
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
  version: 4,
};

if (process.env.PLITE_SCHEMA_ARCHITECTURE_STRICT === '1') {
  assert.ok(
    compileMs.p95 < 16,
    `compile p95 ${compileMs.p95} ms exceeds 16 ms`
  );
  assert.equal(equivalentReconfigurationCompileCount, 0);
  assert.equal(equivalentReconfigurationIdentityReused, true);
  assert.equal(incrementalValidationHits, 1);
  assert.equal(incrementalValidationFullFallbacks, 0);
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
  `METRIC plite_schema_architecture_incremental_validation_full_fallbacks=${incrementalValidationFullFallbacks}\n`
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

if (outputArgument) {
  writeBenchmarkArtifact(outputArgument.slice('--output='.length), output);
} else {
  process.stdout.write(output);
}
