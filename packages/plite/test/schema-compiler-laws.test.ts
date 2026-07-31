import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  defineEditorSchema,
  DocumentChange,
  property,
  schema,
  target,
  type EditorSchemaDeclaration,
  type JsonEditorValue,
  type SchemaProperty,
} from '@platejs/plite';
import {
  compileEditorSchemaContributions,
  EditorSchemaCompileError,
  getCompiledPropertyMergeStrategy,
  resolveCompiledSchemaProperty,
  type CompiledEditorSchema,
  type EditorSchemaContributionRecord,
} from '@platejs/plite/internal';
import fc from 'fast-check';

import { resolveCompiledSchemaWrapperPlan } from '../src/core/schema-compiler';

const lawSeed = Number.parseInt(
  process.env.PLITE_SCHEMA_LAW_SEED ?? '20260721',
  10
);
const lawRuns = Number.parseInt(process.env.PLITE_SCHEMA_LAW_RUNS ?? '150', 10);

const assertLaw = (
  law: Parameters<typeof fc.assert>[0],
  seedOffset: number,
  numRuns = lawRuns
) =>
  fc.assert(law, {
    numRuns,
    seed: lawSeed + seedOffset,
    verbose: true,
  });

const record = (
  extensionName: string,
  contribution: EditorSchemaDeclaration
): EditorSchemaContributionRecord => ({ contribution, extensionName });

const createBaseSchema = (properties: readonly SchemaProperty[] = []) =>
  defineEditorSchema({
    elements: {
      code: { content: schema.content.text() } as const,
      paragraph: {
        content: schema.content.text(),
        groups: ['editable'],
      } as const,
    },
    groups: { editable: {} as const },
    id: 'generated-laws',
    properties,
    root: schema.content.type('paragraph'),
    roots: {
      comments: schema.content.type('paragraph'),
    },
    unknown: 'reject',
    version: 1,
  });

const compile = (
  definition: Readonly<{
    name: string;
    schema: EditorSchemaDeclaration;
  }> = createBaseSchema(),
  additions: readonly EditorSchemaContributionRecord[] = []
) =>
  compileEditorSchemaContributions([
    record(definition.name, definition.schema),
    ...additions,
  ]);

const compiledShape = (compiled: CompiledEditorSchema) => ({
  elements: [...compiled.elements.byType].map(([type, value]) => ({
    groups: [...value.groups],
    propertyIds: [...value.propertyIds],
    type,
  })),
  identity: compiled.identity,
  properties: [...compiled.properties.byId].map(([id, value]) => ({
    descriptor: value.descriptor,
    id,
    key: value.key,
    lifecycle: value.lifecycle,
    merge: value.merge,
    placement: value.placement,
    target: value.target,
  })),
  vocabulary: compiled.vocabulary,
});

const canonicalSet = (values: readonly number[]) =>
  [...new Set(values)].sort((left, right) =>
    JSON.stringify(left).localeCompare(JSON.stringify(right))
  );

describe('compiled schema generated laws', () => {
  it('is deterministic under contribution and registration-order permutations', () => {
    assertLaw(
      fc.property(
        fc.uniqueArray(fc.integer({ max: 200, min: 0 }), {
          maxLength: 12,
          minLength: 1,
        }),
        (ids) => {
          const additions = ids.map((id) =>
            record(`property-${id}`, {
              properties: [
                schema.textProperty(`generated_${id}`, property.number(), {
                  target:
                    id % 2 === 0
                      ? target.type('paragraph')
                      : target.type('code'),
                }),
              ],
            } as const)
          );
          const left = compile(createBaseSchema(), additions);
          const right = compile(createBaseSchema(), [...additions].reverse());

          assert.equal(left.identity.fingerprint, right.identity.fingerprint);
          assert.deepEqual(compiledShape(left), compiledShape(right));
        }
      ),
      10
    );
  });

  it('rejects every generated exact key captured by a prefix on an overlapping target', () => {
    assertLaw(
      fc.property(fc.nat({ max: 1_000_000 }), (id) => {
        const prefix = `namespace_${id}:`;
        const exactKey = `exact_${id}`;
        const definition = createBaseSchema([
          schema.textProperty(exactKey, property.string(), {
            target: target.type('paragraph'),
          }),
          schema.textProperty(schema.key.prefix(prefix), property.string(), {
            target: target.type('paragraph'),
          }),
        ]);
        const exact = {
          properties: [
            schema.textProperty(`${prefix}value`, property.string(), {
              target: target.type('paragraph'),
            }),
          ],
        } as const;

        assert.throws(
          () => compile(definition, [record('exact', exact)]),
          (error) => {
            assert.ok(error instanceof EditorSchemaCompileError);
            assert.equal(
              error.diagnostics[0]?.code,
              'property-selector-conflict'
            );

            return true;
          }
        );
        assert.throws(
          () =>
            compile(definition, [
              record('duplicate-exact', {
                properties: [
                  schema.textProperty(exactKey, property.string(), {
                    target: target.type('paragraph'),
                  }),
                ],
              } as const),
            ]),
          (error) => {
            assert.ok(error instanceof EditorSchemaCompileError);
            assert.equal(
              error.diagnostics[0]?.code,
              'property-selector-conflict'
            );

            return true;
          }
        );

        assert.doesNotThrow(() =>
          compile(definition, [
            record('disjoint-exact', {
              properties: [
                schema.textProperty(`${prefix}value`, property.string(), {
                  target: target.type('code'),
                }),
              ],
            } as const),
          ])
        );
      }),
      11
    );
  });

  it('does not invent an unknown-type overlap for closed schema targets', () => {
    assertLaw(
      fc.property(fc.nat({ max: 1_000_000 }), (id) => {
        const create = (unknown: 'preserve' | 'reject') =>
          defineEditorSchema({
            elements: {
              a: { content: schema.content.text() } as const,
              b: { content: schema.content.text() } as const,
            },
            id: `closed-target-${id}`,
            properties: [
              schema.textProperty(`partition_${id}`, property.boolean(), {
                target: target.not(target.type('a')),
              }),
              schema.textProperty(`partition_${id}`, property.boolean(), {
                target: target.not(target.type('b')),
              }),
            ],
            root: schema.content.type('a'),
            unknown,
            version: 1,
          });

        assert.doesNotThrow(() => compile(create('reject')));
        assert.throws(
          () => compile(create('preserve')),
          (error) => {
            assert.ok(error instanceof EditorSchemaCompileError);
            assert.equal(
              error.diagnostics[0]?.code,
              'property-selector-conflict'
            );

            return true;
          }
        );
      }),
      15
    );
  });

  it('bounds preserved-unknown wrapper plans while keeping declared lookups warm', () => {
    assertLaw(
      fc.property(
        fc.uniqueArray(
          fc.nat({ max: 1_000_000_000 }).map((id) => `hostile-${id}`),
          { maxLength: 256, minLength: 256 }
        ),
        (unknownTypes) => {
          const definition = defineEditorSchema({
            elements: {
              paragraph: { content: schema.content.text() } as const,
              wrapper: {
                content: schema.content.not(schema.content.text()),
              } as const,
            },
            id: 'bounded-unknown-wrapper-plans',
            root: schema.content.type('wrapper'),
            unknown: 'preserve',
            version: 1,
          });
          const compiled = compile(definition);
          const unknownPlans = unknownTypes.map((type) =>
            resolveCompiledSchemaWrapperPlan(compiled, 'root', type)
          );
          const firstUnknown = unknownPlans[0];

          assert.deepEqual(firstUnknown, ['wrapper']);
          assert.equal(new Set(unknownPlans).size, 1);
          assert.ok(unknownPlans.every((plan) => plan === firstUnknown));

          const firstDeclared = resolveCompiledSchemaWrapperPlan(
            compiled,
            'root',
            'paragraph'
          );
          const secondDeclared = resolveCompiledSchemaWrapperPlan(
            compiled,
            'root',
            'paragraph'
          );

          assert.deepEqual(firstDeclared, ['wrapper']);
          assert.equal(secondDeclared, firstDeclared);
          assert.notEqual(firstDeclared, firstUnknown);
        }
      ),
      16,
      Math.max(30, Math.floor(lawRuns / 3))
    );
  });

  it('canonicalizes set defaults and preserves explicit omission semantics', () => {
    assertLaw(
      fc.property(
        fc.array(fc.string({ maxLength: 8 }), { maxLength: 16 }),
        (values) => {
          const create = (defaultValue: readonly string[]) =>
            createBaseSchema([
              schema.textProperty(
                'tags',
                property.set(property.string(), {
                  default: defaultValue,
                  omitDefault: true,
                })
              ),
              schema.textProperty(
                'tone',
                property.string({ default: 'plain', omitDefault: true })
              ),
            ]);
          const left = compile(create(values));
          const right = compile(create([...values].reverse()));
          const tags = resolveCompiledSchemaProperty(left, 'text', 'tags', {
            root: null,
            type: 'paragraph',
          })!;
          const tone = resolveCompiledSchemaProperty(left, 'text', 'tone', {
            root: null,
            type: 'paragraph',
          })!;

          assert.deepEqual(
            tags.descriptor.default,
            [...new Set(values)].sort((a, b) =>
              JSON.stringify(a).localeCompare(JSON.stringify(b))
            )
          );
          assert.equal(tags.descriptor.omitDefault, true);
          assert.equal(tone.descriptor.default, 'plain');
          assert.equal(tone.descriptor.omitDefault, true);
          assert.equal(left.identity.fingerprint, right.identity.fingerprint);
        }
      ),
      12
    );
  });

  it('compiles generated text and element lifecycle policies into lookup tables', () => {
    assertLaw(
      fc.property(
        fc.boolean(),
        fc.constantFrom<'drop' | 'preserve'>('drop', 'preserve'),
        fc.constantFrom<'drop' | 'preserve-if-allowed'>(
          'drop',
          'preserve-if-allowed'
        ),
        (inclusive, split, typeChange) => {
          const compiled = compile(
            createBaseSchema([
              schema.textProperty('mark', property.boolean(), {
                inclusive,
                split,
                target: target.group('editable'),
                typeChange,
              }),
              schema.elementProperty('metadata', property.json(), {
                split,
                target: target.type('paragraph'),
                typeChange,
              }),
            ])
          );
          const context = { root: null, type: 'paragraph' } as const;
          const mark = resolveCompiledSchemaProperty(
            compiled,
            'text',
            'mark',
            context
          )!;
          const metadata = resolveCompiledSchemaProperty(
            compiled,
            'element',
            'metadata',
            context
          )!;

          assert.deepEqual(mark.lifecycle, {
            inclusive,
            split,
            typeChange,
          });
          assert.deepEqual(metadata.lifecycle, {
            inclusive: null,
            split,
            typeChange,
          });
          assert.equal(
            compiled.properties.lifecycle.get(mark.id),
            mark.lifecycle
          );
          assert.equal(
            compiled.properties.lifecycle.get(metadata.id),
            metadata.lifecycle
          );
          assert.equal(
            compiled.properties.textAllowedByParentType
              .get('paragraph')
              ?.has(mark.id),
            true
          );
          assert.equal(
            compiled.properties.textAllowedByParentType
              .get('code')
              ?.has(mark.id),
            false
          );
          assert.equal(
            compiled.properties.elementAllowedByType
              .get('paragraph')
              ?.has(metadata.id),
            true
          );
          assert.equal(
            compiled.properties.elementAllowedByType
              .get('code')
              ?.has(metadata.id),
            false
          );
        }
      ),
      13
    );
  });

  it('maps scalar replacement and JSON-set declarations to convergent change algebra', () => {
    assertLaw(
      fc.property(
        fc.array(fc.integer({ max: 20, min: 0 }), { maxLength: 8 }),
        fc.array(fc.integer({ max: 20, min: 0 }), { maxLength: 8 }),
        fc.array(fc.integer({ max: 20, min: 0 }), { maxLength: 8 }),
        fc.string({ maxLength: 8 }),
        fc.string({ maxLength: 8 }),
        (baseValues, leftValues, rightValues, leftTone, rightTone) => {
          const compiled = compile(
            createBaseSchema([
              schema.elementProperty('tags', property.set(property.number()), {
                target: target.type('paragraph'),
              }),
              schema.elementProperty('tone', property.string(), {
                target: target.type('paragraph'),
              }),
            ])
          );
          const context = { root: null, type: 'paragraph' } as const;

          assert.equal(
            getCompiledPropertyMergeStrategy(
              compiled,
              'element',
              'tags',
              context
            ),
            'set'
          );
          assert.equal(
            getCompiledPropertyMergeStrategy(
              compiled,
              'element',
              'tone',
              context
            ),
            'replace'
          );

          const before: JsonEditorValue = {
            children: [
              {
                children: [{ text: 'value' }],
                ...(canonicalSet(baseValues).length > 0
                  ? { tags: canonicalSet(baseValues) }
                  : {}),
                tone: 'base',
                type: 'paragraph',
              },
            ],
          };
          const next = (values: readonly number[], tone: string) => {
            const tags = canonicalSet([...baseValues, ...values]);

            return {
              children: [
                {
                  children: [{ text: 'value' }],
                  ...(tags.length > 0 ? { tags } : {}),
                  tone,
                  type: 'paragraph',
                },
              ],
            };
          };
          const options = {
            isSetValued: (_node: unknown, key: string) => key === 'tags',
          };
          const left = DocumentChange.between(
            before,
            next(leftValues, leftTone),
            options
          );
          const right = DocumentChange.between(
            before,
            next(rightValues, rightTone),
            options
          );

          assert.deepEqual(
            left.invert(before).apply(left.apply(before)),
            before
          );
          assert.deepEqual(
            right.invert(before).apply(right.apply(before)),
            before
          );

          const transformed = DocumentChange.transform(left, right, before);
          const viaLeft = transformed.b.apply(left.apply(before));
          const viaRight = transformed.a.apply(right.apply(before));
          const result = viaLeft.children[0]!;

          assert.deepEqual(viaLeft, viaRight);
          assert.deepEqual(
            result.tags ?? [],
            canonicalSet([...baseValues, ...leftValues, ...rightValues])
          );
          assert.ok(result.tone === leftTone || result.tone === rightTone);
        }
      ),
      14
    );
  });

  it('rejects malformed raw value descriptors at the compiler boundary', () => {
    const cases: Array<{
      code: string;
      descriptor: Readonly<Record<string, unknown>>;
      name: string;
    }> = [
      {
        code: 'invalid-property-descriptor',
        descriptor: {
          kind: 'date',
          omitDefault: false,
        },
        name: 'unknown kind',
      },
      {
        code: 'unknown-schema-key',
        descriptor: {
          equality: 'reference',
          kind: 'string',
          omitDefault: false,
        },
        name: 'non-structural equality',
      },
      {
        code: 'invalid-property-descriptor',
        descriptor: {
          kind: 'set',
          omitDefault: false,
        },
        name: 'set without item descriptor',
      },
      {
        code: 'invalid-property-default',
        descriptor: {
          default: 'wrong',
          kind: 'number',
          omitDefault: false,
        },
        name: 'default with the wrong kind',
      },
      {
        code: 'invalid-property-default',
        descriptor: {
          kind: 'string',
          omitDefault: true,
        },
        name: 'omission without a default',
      },
      {
        code: 'invalid-property-validation',
        descriptor: {
          kind: 'string',
          omitDefault: false,
          validate: () => true,
          validationVersion: 0,
        },
        name: 'invalid validation version',
      },
    ];
    const base = createBaseSchema().schema;

    for (const testCase of cases) {
      const contribution = {
        ...base,
        properties: [
          {
            inclusive: true,
            key: 'malformed',
            placement: 'text',
            split: 'preserve',
            typeChange: 'drop',
            value: testCase.descriptor,
          },
        ],
      } as unknown as EditorSchemaDeclaration;

      assert.throws(
        () =>
          compileEditorSchemaContributions([
            record(`malformed-${testCase.name}`, contribution),
          ]),
        (error) => {
          assert.ok(error instanceof EditorSchemaCompileError);
          assert.equal(
            error.diagnostics[0]?.code,
            testCase.code,
            testCase.name
          );

          return true;
        }
      );
    }
  });
});
