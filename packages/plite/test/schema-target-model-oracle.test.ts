import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  defineEditorSchema,
  property,
  schema,
  target,
  type SchemaTarget,
} from '@platejs/plite';
import {
  compileEditorSchemaContributions,
  matchesCompiledSchemaTarget,
  resolveCompiledSchemaProperty,
  type CompiledSchemaTargetContext,
  type EditorSchemaContributionRecord,
} from '@platejs/plite/internal';
import fc from 'fast-check';

const lawSeed = Number.parseInt(
  process.env.PLITE_SCHEMA_LAW_SEED ?? '20260721',
  10
);
const lawRuns = Number.parseInt(process.env.PLITE_SCHEMA_LAW_RUNS ?? '150', 10);

const TYPE_COUNT = 8;
const GROUP_COUNT = 4;
const ROOTS = [null, 'comments', 'footnotes'] as const;
const typeName = (index: number) => `target_${index}`;
const groupName = (index: number) => `group_${index}`;

type ModelTarget =
  | Readonly<{ kind: 'and' | 'or'; targets: readonly ModelTarget[] }>
  | Readonly<{ group: string; kind: 'group' }>
  | Readonly<{ kind: 'not' | 'parent'; target: ModelTarget }>
  | Readonly<{ kind: 'root'; root: string | null }>
  | Readonly<{ kind: 'type'; type: string }>;

const modelAtom: fc.Arbitrary<ModelTarget> = fc.oneof(
  fc.integer({ max: TYPE_COUNT - 1, min: 0 }).map(
    (index): ModelTarget => ({
      kind: 'type',
      type: typeName(index),
    })
  ),
  fc.integer({ max: GROUP_COUNT - 1, min: 0 }).map(
    (index): ModelTarget => ({
      group: groupName(index),
      kind: 'group',
    })
  ),
  fc.constantFrom(...ROOTS).map((root): ModelTarget => ({ kind: 'root', root }))
);

const unary = (input: fc.Arbitrary<ModelTarget>): fc.Arbitrary<ModelTarget> =>
  fc.oneof(
    input,
    input.map((child): ModelTarget => ({ kind: 'not', target: child })),
    input.map((child): ModelTarget => ({ kind: 'parent', target: child }))
  );
const levelOne = unary(modelAtom);
const targetArbitrary: fc.Arbitrary<ModelTarget> = fc.oneof(
  unary(levelOne),
  fc.tuple(levelOne, levelOne, fc.option(levelOne, { nil: undefined })).map(
    ([left, right, third]): ModelTarget => ({
      kind: 'and',
      targets: third ? [left, right, third] : [left, right],
    })
  ),
  fc.tuple(levelOne, levelOne, fc.option(levelOne, { nil: undefined })).map(
    ([left, right, third]): ModelTarget => ({
      kind: 'or',
      targets: third ? [left, right, third] : [left, right],
    })
  )
);
const contextArbitrary = fc.record({
  ancestors: fc.array(fc.integer({ max: TYPE_COUNT - 1, min: 0 }), {
    maxLength: 3,
  }),
  root: fc.constantFrom(...ROOTS),
  type: fc.integer({ max: TYPE_COUNT - 1, min: 0 }),
});

const toTarget = (input: ModelTarget): SchemaTarget => {
  switch (input.kind) {
    case 'type':
      return target.type(input.type);
    case 'group':
      return target.group(input.group);
    case 'root':
      return input.root === null ? target.root() : target.root(input.root);
    case 'parent':
      return target.parent(toTarget(input.target));
    case 'not':
      return target.not(toTarget(input.target));
    case 'and': {
      const [left, right, ...rest] = input.targets;

      return target.and(
        toTarget(left!),
        toTarget(right!),
        ...rest.map(toTarget)
      );
    }
    case 'or': {
      const [left, right, ...rest] = input.targets;

      return target.or(
        toTarget(left!),
        toTarget(right!),
        ...rest.map(toTarget)
      );
    }
  }
};

const matchesModel = (
  input: ModelTarget,
  context: CompiledSchemaTargetContext
): boolean => {
  switch (input.kind) {
    case 'type':
      return context.type === input.type;
    case 'group':
      return (
        Number(context.type.slice('target_'.length)) % GROUP_COUNT ===
        Number(input.group.slice('group_'.length))
      );
    case 'root':
      return context.root === input.root;
    case 'parent': {
      const [parent, ...ancestors] = context.ancestors ?? [];

      return parent
        ? matchesModel(input.target, { ...context, ancestors, type: parent })
        : false;
    }
    case 'not':
      return !matchesModel(input.target, context);
    case 'and':
      return input.targets.every((child) => matchesModel(child, context));
    case 'or':
      return input.targets.some((child) => matchesModel(child, context));
  }
};

const compileTarget = (input: ModelTarget) => {
  const definition = defineEditorSchema({
    elements: Object.fromEntries(
      Array.from({ length: TYPE_COUNT }, (_value, index) => [
        typeName(index),
        {
          content: schema.content.text(),
          groups: [groupName(index % GROUP_COUNT)],
        } as const,
      ])
    ),
    groups: Object.fromEntries(
      Array.from({ length: GROUP_COUNT }, (_value, index) => [
        groupName(index),
        {} as const,
      ])
    ),
    id: 'target-model',
    properties: [
      schema.textProperty('probe', property.boolean(), {
        target: toTarget(input),
      }),
    ],
    root: {
      content: schema.content.type(typeName(0)),
    } as const,
    roots: {
      comments: {
        content: schema.content.type(typeName(1)),
      } as const,
      footnotes: {
        content: schema.content.type(typeName(2)),
      } as const,
    },
    unknown: 'reject',
    version: 1,
  });
  const records: EditorSchemaContributionRecord[] = [
    {
      contribution: definition.schema,
      extensionName: definition.name,
    },
  ];
  const compiled = compileEditorSchemaContributions(records);
  const compiledProperty = [...compiled.properties.byId.values()][0]!;

  return { compiled, compiledProperty };
};

describe('compiled schema target model oracle', () => {
  it('matches type, group, root, actual-parent, and/or/not model semantics', () => {
    fc.assert(
      fc.property(targetArbitrary, contextArbitrary, (input, rawContext) => {
        const context: CompiledSchemaTargetContext = {
          ancestors: rawContext.ancestors.map(typeName),
          root: rawContext.root,
          type: typeName(rawContext.type),
        };
        const expected = matchesModel(input, context);
        const { compiled, compiledProperty } = compileTarget(input);

        assert.equal(
          matchesCompiledSchemaTarget(
            compiled,
            compiledProperty.target,
            context
          ),
          expected
        );
        assert.equal(
          resolveCompiledSchemaProperty(compiled, 'text', 'probe', context)
            ?.id ?? null,
          expected ? compiledProperty.id : null
        );
      }),
      { numRuns: lawRuns, seed: lawSeed, verbose: true }
    );
  });
});
