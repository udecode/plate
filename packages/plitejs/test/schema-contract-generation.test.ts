import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditorSchemaContract,
  defineEditorSchema,
  diffEditorSchemaContracts,
  property,
  readEditorSchemaContract,
  restoreEditorSchemaContract,
  schema,
  target,
} from 'plitejs';

import {
  compileEditorSchemaContributions,
  type EditorSchemaContributionRecord,
} from '../src/internal';

describe('generated editor schema contract', () => {
  const Article = defineEditorSchema('schema:article-contract', {
    elements: {
      paragraph: {
        content: schema.content.text({ default: 'text', min: 1 }),
        properties: {
          token: property.string({ generate: () => 'token' }),
        },
      },
      section: {
        content: schema.content.type('paragraph', {
          default: { type: 'paragraph' },
          min: 1,
        }),
      },
    },
    id: 'article-contract',
    properties: [
      schema.elementProperty('align', property.enum(['left', 'right']), {
        target: target.type('paragraph'),
      }),
    ],
    root: schema.content.type('section', { min: 1 }),
    unknown: 'reject',
    version: 1,
  });
  const records: readonly EditorSchemaContributionRecord[] = [
    { contribution: Article.schema, extensionName: Article.name },
  ];

  it('round-trips deterministic structural data and rebinds validators', () => {
    const compiled = compileEditorSchemaContributions(records);
    const contract = createEditorSchemaContract(compiled);
    const json = JSON.stringify(contract);
    const parsed = JSON.parse(json) as unknown;
    const restored = restoreEditorSchemaContract(parsed, records);

    assert.equal(contract.fingerprint, compiled.identity.fingerprint);
    assert.deepEqual(createEditorSchemaContract(restored), contract);
    assert.equal(JSON.stringify(createEditorSchemaContract(restored)), json);
  });

  it('rejects malformed, stale, and unknown contract formats', () => {
    const contract = createEditorSchemaContract(
      compileEditorSchemaContributions(records)
    );

    assert.equal(readEditorSchemaContract(null), undefined);
    assert.equal(
      readEditorSchemaContract({ ...contract, formatVersion: 2 }),
      undefined
    );
    assert.equal(
      readEditorSchemaContract({ ...contract, fingerprint: 'fnv1a64:stale' }),
      undefined
    );
    const [firstElement, ...remainingElements] = contract.elements.byType;

    assert.ok(firstElement?.content);
    const changedContent = {
      ...contract,
      elements: {
        ...contract.elements,
        byType: [
          {
            ...firstElement,
            content: {
              ...firstElement.content,
              min: firstElement.content.min + 1,
            },
          },
          ...remainingElements,
        ],
      },
    };

    assert.equal(readEditorSchemaContract(changedContent), undefined);
    assert.equal(
      readEditorSchemaContract({
        ...contract,
        unknown: contract.unknown === 'reject' ? 'preserve' : 'reject',
      }),
      undefined
    );
    const [firstProperty, ...remainingProperties] = contract.properties.byId;

    assert.ok(firstProperty);
    assert.equal(
      readEditorSchemaContract({
        ...contract,
        properties: {
          ...contract.properties,
          byId: [
            {
              ...firstProperty,
              role: firstProperty.role === 'content' ? 'metadata' : 'content',
            },
            ...remainingProperties,
          ],
        },
      }),
      undefined
    );
    assert.equal(
      readEditorSchemaContract({
        ...contract,
        primaryRoot: {
          ...contract.primaryRoot,
          content: {
            ...contract.primaryRoot.content,
            allowsText: !contract.primaryRoot.content.allowsText,
          },
        },
      }),
      undefined
    );
    const missingElementTables = { ...contract, elements: {} };

    assert.equal(readEditorSchemaContract(missingElementTables), undefined);
    const invalidCopyLifecycle = structuredClone(contract) as any;

    invalidCopyLifecycle.properties.lifecycle[0][1].copy = 'retain';
    assert.equal(readEditorSchemaContract(invalidCopyLifecycle), undefined);
    const generatedContract = createEditorSchemaContract(
      compileEditorSchemaContributions([
        ...records,
        {
          contribution: {
            properties: [
              schema.elementProperty(
                'generatedId',
                property.string({ generate: () => 'generated' }),
                { target: target.type('paragraph') }
              ),
            ],
          },
          extensionName: 'generated-contract-property',
        },
      ])
    );
    const generatedProperty = generatedContract.properties.byId.find(
      ({ descriptor }) => descriptor.generated
    );

    assert.ok(generatedProperty);
    for (const generated of ['true', 1, false]) {
      const invalid = structuredClone(generatedContract) as any;
      const invalidProperty = invalid.properties.byId.find(
        (entry: any) => entry.id === generatedProperty.id
      );

      invalidProperty.descriptor.generated = generated;
      assert.equal(readEditorSchemaContract(invalid), undefined);
    }
    const cyclicDescriptor: Record<string, unknown> = {
      kind: 'set',
      omitDefault: false,
      required: false,
    };

    cyclicDescriptor.item = cyclicDescriptor;
    const cyclicDescriptorContract = structuredClone(contract) as any;

    cyclicDescriptorContract.properties.byId[0].descriptor = cyclicDescriptor;
    assert.equal(readEditorSchemaContract(cyclicDescriptorContract), undefined);
    assert.throws(
      () => restoreEditorSchemaContract({}, records),
      /Invalid generated editor schema contract/
    );
    assert.throws(
      () => restoreEditorSchemaContract(missingElementTables, records),
      /Invalid generated editor schema contract/
    );
    const populatedChildrenIndex = contract.elements.allowedChildren.findIndex(
      ([, types]) => types.length > 0
    );

    assert.notEqual(populatedChildrenIndex, -1);
    const changedDerivedTable = {
      ...contract,
      elements: {
        ...contract.elements,
        allowedChildren: contract.elements.allowedChildren.map(
          ([program, types], index) =>
            index === populatedChildrenIndex
              ? ([program, []] as const)
              : ([program, types] as const)
        ),
      },
    };

    assert.throws(
      () => restoreEditorSchemaContract(changedDerivedTable, records),
      /does not match its source contributions/
    );
  });

  it('classifies compatible additions and migration-required restrictions', () => {
    const compile = (
      contribution: EditorSchemaContributionRecord['contribution']
    ) =>
      createEditorSchemaContract(
        compileEditorSchemaContributions([
          { contribution, extensionName: 'schema:diff-contract' },
        ])
      );
    const Before = defineEditorSchema('schema:diff-before', {
      elements: {
        note: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      id: 'diff-contract',
      properties: [
        schema.elementProperty('label', property.string(), {
          target: target.type('paragraph'),
        }),
      ],
      root: schema.content.type('paragraph', { min: 1 }),
      unknown: 'reject',
      version: 1,
    });
    const Additive = defineEditorSchema('schema:diff-additive', {
      elements: {
        aside: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
        note: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      id: 'diff-contract',
      properties: [
        schema.elementProperty('label', property.string(), {
          target: target.type('paragraph'),
        }),
        schema.elementProperty('tone', property.string(), {
          target: target.type('paragraph'),
        }),
      ],
      root: schema.content.type('paragraph', { min: 1 }),
      unknown: 'preserve',
      version: 2,
    });
    const Restricted = defineEditorSchema('schema:diff-restricted', {
      elements: {
        memo: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      id: 'diff-contract',
      properties: [
        schema.elementProperty('title', property.string(), {
          target: target.type('paragraph'),
        }),
        schema.elementProperty('slug', property.string({ required: true }), {
          target: target.type('paragraph'),
        }),
      ],
      root: schema.content.type('paragraph', { min: 2 }),
      unknown: 'reject',
      version: 3,
    });
    const Bounded = defineEditorSchema('schema:diff-bounded', {
      elements: Before.schema.elements,
      id: 'diff-contract',
      properties: Before.schema.properties,
      root: schema.content.type('paragraph', { max: 2, min: 1 }),
      unknown: 'reject',
      version: 4,
    });
    const Defaulted = defineEditorSchema('schema:diff-defaulted', {
      elements: Before.schema.elements,
      id: 'diff-contract',
      properties: [
        ...Before.schema.properties,
        schema.elementProperty('weight', property.number({ default: 400 }), {
          target: target.type('paragraph'),
        }),
      ],
      root: Before.schema.root,
      unknown: 'reject',
      version: 5,
    });
    const Generated = defineEditorSchema('schema:diff-generated', {
      elements: Before.schema.elements,
      id: 'diff-contract',
      properties: [
        ...Before.schema.properties,
        schema.elementProperty(
          'generatedId',
          property.string({ generate: () => 'generated' }),
          { target: target.type('paragraph') }
        ),
      ],
      root: Before.schema.root,
      unknown: 'reject',
      version: 6,
    });
    const Renamed = defineEditorSchema('schema:diff-renamed', {
      elements: Before.schema.elements,
      id: 'diff-contract',
      properties: [
        schema.elementProperty('title', property.string(), {
          target: target.type('paragraph'),
        }),
      ],
      root: Before.schema.root,
      unknown: 'reject',
      version: 7,
    });
    const additive = diffEditorSchemaContracts(
      compile(Before.schema),
      compile(Additive.schema)
    );
    const restricted = diffEditorSchemaContracts(
      compile(Before.schema),
      compile(Restricted.schema)
    );
    const bounded = diffEditorSchemaContracts(
      compile(Before.schema),
      compile(Bounded.schema)
    );
    const defaulted = diffEditorSchemaContracts(
      compile(Before.schema),
      compile(Defaulted.schema)
    );
    const generated = diffEditorSchemaContracts(
      compile(Before.schema),
      compile(Generated.schema)
    );
    const renamed = diffEditorSchemaContracts(
      compile(Before.schema),
      compile(Renamed.schema)
    );

    assert.equal(additive.requiresMigration, false);
    assert.deepEqual(
      additive.changes.map(({ kind }) => kind),
      ['element-added', 'property-added', 'unknown-policy-expanded']
    );
    assert.equal(restricted.requiresMigration, true);
    assert.ok(
      restricted.changes.some(({ kind }) => kind === 'element-renamed')
    );
    assert.ok(
      restricted.changes.some(({ kind }) => kind === 'property-required')
    );
    assert.ok(
      restricted.changes.some(({ kind }) => kind === 'root-content-restricted')
    );
    assert.equal(bounded.requiresMigration, true);
    assert.ok(
      bounded.changes.some(({ kind }) => kind === 'root-content-restricted')
    );
    assert.equal(defaulted.requiresMigration, true);
    assert.ok(
      defaulted.changes.some(
        ({ impact, kind }) =>
          kind === 'property-added' && impact === 'migration-required'
      )
    );
    assert.equal(generated.requiresMigration, true);
    assert.ok(
      generated.changes.some(
        ({ impact, kind }) =>
          kind === 'property-added' && impact === 'migration-required'
      )
    );
    assert.ok(
      renamed.changes.some(
        ({ from, kind, to }) =>
          kind === 'property-renamed' && from === 'label' && to === 'title'
      )
    );
  });

  it('diffs every target-specific property and ignores contributor provenance', () => {
    const innerArticle = defineEditorSchema(
      'schema:target-specific-properties',
      {
        elements: {
          paragraph: { content: schema.content.text() },
          quote: { content: schema.content.text() },
        },
        id: 'target-specific-properties',
        properties: [
          schema.elementProperty('tone', property.string(), {
            target: target.type('paragraph'),
          }),
          schema.elementProperty('tone', property.string(), {
            target: target.type('quote'),
          }),
        ],
        root: schema.content.types(['paragraph', 'quote']),
        unknown: 'reject',
        version: 1,
      }
    );
    const ParagraphOnly = defineEditorSchema(
      'schema:target-specific-properties',
      {
        ...innerArticle.schema,
        properties: [innerArticle.schema.properties[0]],
      }
    );
    const QuoteOnly = defineEditorSchema('schema:target-specific-properties', {
      ...innerArticle.schema,
      properties: [innerArticle.schema.properties[1]],
    });
    const compile = (
      contribution: EditorSchemaContributionRecord['contribution'],
      extensionName: string
    ) =>
      createEditorSchemaContract(
        compileEditorSchemaContributions([{ contribution, extensionName }])
      );
    const previous = compile(innerArticle.schema, 'left-contributor');
    const relabeled = compile(innerArticle.schema, 'right-contributor');

    assert.deepEqual(
      diffEditorSchemaContracts(previous, relabeled).changes,
      []
    );
    for (const contribution of [ParagraphOnly.schema, QuoteOnly.schema]) {
      const restricted = diffEditorSchemaContracts(
        previous,
        compile(contribution, 'right-contributor')
      );

      assert.equal(restricted.requiresMigration, true);
      assert.equal(
        restricted.changes.filter(({ kind }) => kind === 'property-removed')
          .length,
        1
      );
    }
  });
});
