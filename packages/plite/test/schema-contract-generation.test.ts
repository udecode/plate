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
} from '@platejs/plite';
import {
  compileEditorSchemaContributions,
  type EditorSchemaContributionRecord,
} from '@platejs/plite/internal';

describe('generated editor schema contract', () => {
  const Article = defineEditorSchema('schema:article-contract', {
    elements: {
      paragraph: {
        content: schema.content.text({ default: 'text', min: 1 }),
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
    assert.throws(
      () => restoreEditorSchemaContract({}, records),
      /Invalid generated editor schema contract/
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
    const additive = diffEditorSchemaContracts(
      compile(Before.schema),
      compile(Additive.schema)
    );
    const restricted = diffEditorSchemaContracts(
      compile(Before.schema),
      compile(Restricted.schema)
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
  });
});
