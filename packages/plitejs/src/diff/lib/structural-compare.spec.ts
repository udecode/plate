import { describe, expect, it } from 'vitest';

import { createEditor, defineEditorSchema, property, schema } from '../..';
import { compare } from './compare';
import { createComparisonIndex } from './comparison-index';
import { matchComparison } from './comparison-matcher';

const paragraph = (
  text: string,
  properties: Readonly<Record<string, unknown>> = {}
) => ({
  ...properties,
  children: [{ text }],
  type: 'paragraph',
});

const effectKinds = (comparison: Awaited<ReturnType<typeof compare>>) =>
  comparison.changes.flatMap(({ effects }) => effects.map(({ kind }) => kind));

const exactRoundtrip = (comparison: Awaited<ReturnType<typeof compare>>) => {
  expect(comparison.change.apply(comparison.before.document)).toEqual(
    comparison.after.document
  );
  expect(
    comparison.change
      .invert(comparison.before.document)
      .apply(comparison.after.document)
  ).toEqual(comparison.before.document);
};

const inlineContent = schema.content.any(
  [schema.content.text(), schema.content.types(['link', 'mention'])],
  { default: 'text', min: 1 }
);
const BoundarySchema = defineEditorSchema('structural-diff-boundaries', {
  elements: {
    'code-block': {
      content: schema.content.type('code-line', { min: 1 }),
    },
    'code-line': { content: schema.content.text() },
    image: {
      properties: { src: property.string() },
      void: 'block',
    },
    link: {
      content: schema.content.text({ min: 1 }),
      inline: true,
      properties: { url: property.string() },
    },
    mention: {
      properties: { userId: property.string() },
      void: 'markable-inline',
    },
    paragraph: { content: inlineContent },
  },
  root: schema.content.types(['code-block', 'image', 'paragraph']),
  unknown: 'reject',
});

describe('structural comparison', () => {
  it('preserves exact whitespace, line endings, Unicode and properties', async () => {
    const before = [
      paragraph('alpha \r\n中 e\u0301', { align: 'left', data: { rank: 1 } }),
    ];
    const after = [
      paragraph('alpha \r\n中 é!', { align: 'right', data: { rank: 2 } }),
    ];
    const editor = createEditor({ initialValue: before });
    const result = await compare({ after, before, schema: editor.read.schema });

    exactRoundtrip(result);
    expect(effectKinds(result)).toEqual(
      expect.arrayContaining(['property', 'text'])
    );
    expect(result.diagnostics).toEqual([]);
  });

  it('preserves meaningful empty blocks and property-only text changes', async () => {
    const before = [
      paragraph(''),
      {
        children: [{ text: 'a' }, { text: 'b' }],
        type: 'paragraph',
      },
    ];
    const after = [
      paragraph(''),
      paragraph(''),
      {
        children: [{ bold: true, text: 'a' }, { text: 'b' }],
        type: 'paragraph',
      },
    ];
    const editor = createEditor({ initialValue: before });
    const result = await compare({ after, before, schema: editor.read.schema });

    exactRoundtrip(result);
    expect(effectKinds(result)).toEqual(
      expect.arrayContaining(['insert', 'property'])
    );
    expect(effectKinds(result)).not.toContain('text');
  });

  it('respects inline, atom, void, link, code and empty-block boundaries', async () => {
    const before = [
      {
        children: [
          { text: 'Before ' },
          {
            children: [{ text: 'linked text' }],
            type: 'link',
            url: '/before',
          },
          { text: ' ' },
          {
            children: [{ text: '' }],
            type: 'mention',
            userId: 'alice',
          },
          { text: ' after' },
        ],
        type: 'paragraph',
      },
      { children: [{ text: '' }], src: '/before.png', type: 'image' },
      {
        children: [
          { children: [{ text: 'const answer = 41;' }], type: 'code-line' },
        ],
        type: 'code-block',
      },
      paragraph(''),
    ];
    const after = [
      {
        children: [
          { text: 'Before ' },
          {
            children: [{ text: 'linked copy' }],
            type: 'link',
            url: '/after',
          },
          { text: ' ' },
          {
            children: [{ text: '' }],
            type: 'mention',
            userId: 'bob',
          },
          { text: ' after' },
        ],
        type: 'paragraph',
      },
      { children: [{ text: '' }], src: '/after.png', type: 'image' },
      {
        children: [
          { children: [{ text: 'const answer = 42;' }], type: 'code-line' },
        ],
        type: 'code-block',
      },
      paragraph(''),
    ];
    const editor = createEditor({ plugins: [BoundarySchema] });
    const result = await compare({ after, before, schema: editor.read.schema });
    const kinds = effectKinds(result);

    exactRoundtrip(result);
    expect(kinds.filter((kind) => kind === 'property')).toHaveLength(3);
    expect(kinds.filter((kind) => kind === 'text')).toHaveLength(2);
    expect(kinds).not.toEqual(
      expect.arrayContaining(['delete', 'insert', 'structure'])
    );
    expect(result.diagnostics.map(({ code }) => code)).not.toContain(
      'coarse-replacement'
    );
  });

  it('treats equivalent adjacent text-leaf partitions as presentation-equivalent', async () => {
    const before = [
      {
        children: [{ bold: true, text: 'ab' }, { text: 'cd' }],
        type: 'paragraph',
      },
    ];
    const after = [
      {
        children: [
          { bold: true, text: 'a' },
          { bold: true, text: 'b' },
          { text: 'cd' },
        ],
        type: 'paragraph',
      },
    ];
    const editor = createEditor({ initialValue: before });
    const result = await compare({ after, before, schema: editor.read.schema });

    exactRoundtrip(result);
    expect(result.change.empty).toBe(false);
    expect(result.changes).toEqual([]);
    expect(result.diagnostics).toEqual([]);
  });

  it('reports a minimal placement without insert/delete noise for a rotation', async () => {
    const before = [
      paragraph('A unique'),
      paragraph('B unique'),
      paragraph('C unique'),
    ];
    const after = [
      paragraph('C unique'),
      paragraph('A unique'),
      paragraph('B unique'),
    ];
    const editor = createEditor({ initialValue: before });
    const result = await compare({ after, before, schema: editor.read.schema });
    const kinds = effectKinds(result);

    exactRoundtrip(result);
    expect(kinds.filter((kind) => kind === 'placement')).toHaveLength(1);
    expect(kinds).not.toEqual(expect.arrayContaining(['insert', 'delete']));
  });

  it('composes placement with separated interior text edits', async () => {
    const before = [
      paragraph('first'),
      paragraph('A long unique passage with middle words and final words', {
        align: 'left',
      }),
      paragraph('third'),
    ];
    const after = [
      paragraph('A changed unique passage with middle words and ending words', {
        align: 'right',
      }),
      paragraph('first'),
      paragraph('third'),
    ];
    const editor = createEditor({ initialValue: before });
    const result = await compare({ after, before, schema: editor.read.schema });
    const compound = result.changes.find(({ effects }) =>
      effects.some(({ kind }) => kind === 'placement')
    );

    exactRoundtrip(result);
    expect(
      compound?.effects.filter(({ kind }) => kind === 'text')
    ).toHaveLength(2);
    expect(compound?.effects.map(({ kind }) => kind)).toEqual(
      expect.arrayContaining(['placement', 'property', 'text'])
    );
    expect(effectKinds(result)).not.toEqual(
      expect.arrayContaining(['insert', 'delete'])
    );
  });

  it('keeps multiple moved edits as separate one-to-one components', async () => {
    const before = [
      paragraph('Alpha'),
      paragraph('Beta'),
      paragraph('Gamma'),
      paragraph('Delta'),
    ];
    const after = [
      paragraph('Gamma!'),
      paragraph('Alpha'),
      paragraph('Delta?'),
      paragraph('Beta'),
    ];
    const editor = createEditor({ initialValue: before });
    const result = await compare({ after, before, schema: editor.read.schema });
    const movedEdits = result.changes.filter(
      ({ correspondence, effects }) =>
        correspondence.some(
          (relation) =>
            relation.kind === 'primary' &&
            relation.before.length === 1 &&
            relation.after.length === 1
        ) &&
        effects.some(({ kind }) => kind === 'placement') &&
        effects.some(({ kind }) => kind === 'text')
    );

    exactRoundtrip(result);
    expect(movedEdits).toHaveLength(2);
    expect(effectKinds(result)).not.toEqual(
      expect.arrayContaining(['insert', 'delete', 'join', 'split'])
    );
  });

  it('represents mid-word split and merge as many-span continuity', async () => {
    const text = 'midword';
    const editor = createEditor({ initialValue: [paragraph(text)] });

    for (let boundary = 1; boundary < text.length; boundary += 1) {
      const parts = [
        paragraph(text.slice(0, boundary)),
        paragraph(text.slice(boundary)),
      ];
      const split = await compare({
        after: parts,
        before: [paragraph(text)],
        schema: editor.read.schema,
      });
      const joined = await compare({
        after: [paragraph(text)],
        before: parts,
        schema: editor.read.schema,
      });

      exactRoundtrip(split);
      exactRoundtrip(joined);
      expect(effectKinds(split)).toContain('split');
      expect(
        split.changes.find(({ effects }) =>
          effects.some(({ kind }) => kind === 'split')
        )?.after
      ).toHaveLength(2);
      expect(effectKinds(joined)).toContain('join');
      expect(
        joined.changes.find(({ effects }) =>
          effects.some(({ kind }) => kind === 'join')
        )?.before
      ).toHaveLength(2);
    }
  });

  it('composes inferred split and join with text and property edits', async () => {
    const splitBefore = [
      paragraph('alpha beta old gamma delta', { align: 'left' }),
    ];
    const splitAfter = [
      paragraph('alpha beta new ', { align: 'left' }),
      paragraph('gamma delta', { align: 'right' }),
    ];
    const editor = createEditor({ initialValue: splitBefore });
    const split = await compare({
      after: splitAfter,
      before: splitBefore,
      schema: editor.read.schema,
    });
    const splitEffects = split.changes.find(({ effects }) =>
      effects.some(({ kind }) => kind === 'split')
    )?.effects;

    exactRoundtrip(split);
    expect(splitEffects?.map(({ kind }) => kind)).toEqual(
      expect.arrayContaining(['split', 'text', 'property'])
    );
    expect(effectKinds(split)).not.toEqual(
      expect.arrayContaining(['insert', 'delete'])
    );

    const joined = await compare({
      after: [paragraph('alpha beta newer gamma delta', { align: 'right' })],
      before: splitAfter,
      schema: editor.read.schema,
    });
    const joinEffects = joined.changes.find(({ effects }) =>
      effects.some(({ kind }) => kind === 'join')
    )?.effects;

    exactRoundtrip(joined);
    expect(joinEffects?.map(({ kind }) => kind)).toEqual(
      expect.arrayContaining(['join', 'text', 'property'])
    );
    expect(effectKinds(joined)).not.toEqual(
      expect.arrayContaining(['insert', 'delete'])
    );
  });

  it('preserves mixed text properties through split and join correspondence', async () => {
    const combined = [
      {
        children: [
          { bold: true, text: 'mid' },
          { italic: true, text: 'word' },
        ],
        type: 'paragraph',
      },
    ];
    const parts = [
      {
        children: [{ bold: true, text: 'mid' }],
        type: 'paragraph',
      },
      {
        children: [{ italic: true, text: 'word' }],
        type: 'paragraph',
      },
    ];
    const editor = createEditor({ initialValue: combined });
    const split = await compare({
      after: parts,
      before: combined,
      schema: editor.read.schema,
    });
    const joined = await compare({
      after: combined,
      before: parts,
      schema: editor.read.schema,
    });

    exactRoundtrip(split);
    exactRoundtrip(joined);
    expect(effectKinds(split)).toEqual(['split']);
    expect(effectKinds(joined)).toEqual(['join']);
    expect(split.changes[0].before).toHaveLength(1);
    expect(split.changes[0].after).toHaveLength(2);
    expect(joined.changes[0].before).toHaveLength(2);
    expect(joined.changes[0].after).toHaveLength(1);
  });

  it('keeps many-to-many restructuring in one correspondence', async () => {
    const before = [paragraph('ab'), paragraph('cd')];
    const after = [paragraph('a'), paragraph('bcd')];
    const editor = createEditor({ initialValue: before });
    const result = await compare({ after, before, schema: editor.read.schema });
    const structural = result.changes.find(({ effects }) =>
      effects.some(({ kind }) => kind === 'structure')
    );

    exactRoundtrip(result);
    expect(structural?.before).toHaveLength(2);
    expect(structural?.after).toHaveLength(2);
  });

  it('marks copies as explanatory origins with new occurrence identity', async () => {
    const before = [paragraph('source')];
    const after = [paragraph('source'), paragraph('source')];
    const editor = createEditor({ initialValue: before });
    const result = await compare({ after, before, schema: editor.read.schema });
    const copy = result.changes.find(({ correspondence }) =>
      correspondence.some(({ kind }) => kind === 'copy')
    );

    exactRoundtrip(result);
    expect(copy?.effects.map(({ kind }) => kind)).toContain('insert');
    expect(copy?.before).toHaveLength(1);
    expect(copy?.after).toHaveLength(1);
  });

  it('reports ambiguous duplicate alignment without claiming recorded identity', async () => {
    const before = [paragraph('same'), paragraph('same'), paragraph('unique')];
    const after = [paragraph('same'), paragraph('unique'), paragraph('same')];
    const editor = createEditor({ initialValue: before });
    const result = await compare({ after, before, schema: editor.read.schema });

    exactRoundtrip(result);
    expect(result.diagnostics.map(({ code }) => code)).toContain('ambiguous');
    expect(
      result.changes.every(({ evidence }) => evidence.kind === 'inferred')
    ).toBe(true);
  });

  it('never treats imported node IDs as recorded lineage', async () => {
    const before = [
      paragraph('alpha source', { id: 'shared' }),
      paragraph('beta source', { id: 'other' }),
    ];
    const after = [
      paragraph('beta changed', { id: 'shared' }),
      paragraph('alpha changed', { id: 'other' }),
    ];
    const editor = createEditor({ initialValue: before });
    const result = await compare({ after, before, schema: editor.read.schema });

    exactRoundtrip(result);
    expect(
      result.changes.every(({ evidence }) => evidence.kind === 'inferred')
    ).toBe(true);
  });

  it('locks validated native lineage before content similarity', async () => {
    const beforeValue = [
      paragraph('source stable'),
      paragraph('other content'),
    ];
    const afterValue = [
      paragraph('source stable'),
      paragraph('source changed'),
    ];
    const editor = createEditor({ initialValue: beforeValue });
    const comparison = await compare({
      after: afterValue,
      before: beforeValue,
      schema: editor.read.schema,
    });
    const before = createComparisonIndex(
      comparison.before.document,
      editor.read.schema
    );
    const after = createComparisonIndex(
      comparison.after.document,
      editor.read.schema
    );
    const source = before.nodes.find(
      (node) => node.kind === 'element' && node.path[0] === 0
    );
    const target = after.nodes.find(
      (node) => node.kind === 'element' && node.path[0] === 1
    );

    if (!source || !target) throw new Error('Expected comparison elements.');
    const recorded = await matchComparison(before, after, 'recorded-proof', {
      createdRoots: new Set(),
      deletedRoots: new Set(),
      lineage: {
        kind: 'complete',
        relations: [
          {
            after: [target.span],
            before: [source.span],
            operationIds: ['replica-a:7'],
          },
        ],
      },
    });
    const lineageChange = recorded.changes.find(
      ({ evidence }) => evidence.kind === 'recorded'
    );

    expect(lineageChange?.before).toEqual([source.span]);
    expect(lineageChange?.after).toEqual([target.span]);
    expect(lineageChange?.evidence).toEqual({
      kind: 'recorded',
      operationIds: ['replica-a:7'],
    });

    const expired = await matchComparison(before, after, 'expired-proof', {
      createdRoots: new Set(),
      deletedRoots: new Set(),
      lineage: { kind: 'expired' },
    });

    expect(expired.diagnostics.map(({ code }) => code)).toContain(
      'expired-lineage'
    );
    expect(
      expired.changes.every(({ evidence }) => evidence.kind === 'inferred')
    ).toBe(true);

    const rejected = await matchComparison(before, after, 'rejected-proof', {
      createdRoots: new Set(),
      deletedRoots: new Set(),
      lineage: {
        kind: 'complete',
        relations: [
          {
            after: [{ ...target.span, to: target.span.to + 1 }],
            before: [source.span],
            operationIds: ['foreign:1'],
          },
        ],
      },
    });

    expect(rejected.diagnostics.map(({ code }) => code)).toContain(
      'identity-hint-rejected'
    );
    expect(
      rejected.changes.every(({ evidence }) => evidence.kind === 'inferred')
    ).toBe(true);
  });

  it('composes wrapper introduction with retained inner content', async () => {
    const before = [paragraph('kept content')];
    const after = [
      {
        children: [paragraph('kept content')],
        type: 'section',
      },
    ];
    const editor = createEditor({ initialValue: before });
    const result = await compare({ after, before, schema: editor.read.schema });

    exactRoundtrip(result);
    expect(effectKinds(result)).toEqual(
      expect.arrayContaining(['placement', 'wrapper'])
    );
    expect(effectKinds(result)).not.toContain('delete');
    expect(result.diagnostics.map(({ code }) => code)).toContain(
      'unsupported-structure'
    );
  });

  it('groups wrapper, reparenting and an interior edit on the same content', async () => {
    const before = [paragraph('kept content with old ending')];
    const after = [
      {
        children: [paragraph('kept content with new ending')],
        type: 'section',
      },
    ];
    const editor = createEditor({ initialValue: before });
    const result = await compare({ after, before, schema: editor.read.schema });
    const wrapper = result.changes.find(({ effects }) =>
      effects.some(({ kind }) => kind === 'wrapper')
    );

    exactRoundtrip(result);
    expect(wrapper?.effects.map(({ kind }) => kind)).toEqual(
      expect.arrayContaining(['wrapper', 'placement', 'text'])
    );
    expect(effectKinds(result)).not.toEqual(
      expect.arrayContaining(['insert', 'delete'])
    );
  });

  it('distinguishes leaf type changes, wrapper type changes and unwrapping', async () => {
    const editor = createEditor({ initialValue: [paragraph('content')] });
    const leafType = await compare({
      after: [{ children: [{ text: 'content' }], type: 'heading' }],
      before: [paragraph('content')],
      schema: editor.read.schema,
    });
    const wrapperType = await compare({
      after: [
        { children: [paragraph('content')], role: 'note', type: 'aside' },
      ],
      before: [
        { children: [paragraph('content')], role: 'main', type: 'section' },
      ],
      schema: editor.read.schema,
    });
    const unwrapped = await compare({
      after: [paragraph('content')],
      before: [{ children: [paragraph('content')], type: 'section' }],
      schema: editor.read.schema,
    });

    exactRoundtrip(leafType);
    exactRoundtrip(wrapperType);
    exactRoundtrip(unwrapped);
    expect(effectKinds(leafType)).toContain('node-type');
    expect(effectKinds(wrapperType)).toEqual(
      expect.arrayContaining(['node-type', 'property'])
    );
    expect(effectKinds(unwrapped)).toEqual(
      expect.arrayContaining(['wrapper', 'placement'])
    );
    expect(effectKinds(unwrapped)).not.toEqual(
      expect.arrayContaining(['insert', 'delete'])
    );
  });

  it('verifies canonical payloads even when every exact hash collides', async () => {
    const beforeValue = [paragraph('before')];
    const afterValue = [paragraph('after')];
    const editor = createEditor({ initialValue: beforeValue });
    const comparison = await compare({
      after: afterValue,
      before: beforeValue,
      schema: editor.read.schema,
    });
    const collide = (
      index: ReturnType<typeof createComparisonIndex>
    ): ReturnType<typeof createComparisonIndex> => ({
      ...index,
      nodes: index.nodes.map((node) => ({ ...node, exactHash: 'collision' })),
    });
    const matched = await matchComparison(
      collide(
        createComparisonIndex(comparison.before.document, editor.read.schema)
      ),
      collide(
        createComparisonIndex(comparison.after.document, editor.read.schema)
      ),
      'collision-proof',
      { createdRoots: new Set(), deletedRoots: new Set() }
    );

    expect(
      matched.changes.flatMap(({ effects }) => effects.map(({ kind }) => kind))
    ).toContain('text');
  });
});
