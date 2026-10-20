import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  defineEditorSchema,
  schema,
  type Descendant,
} from 'plitejs';

import { createEditorSchemaContract } from '../src/core/schema-compiler';
import {
  dissolveOpenEndMatter,
  splitEndMatter,
} from '../src/core/slice-end-matter';
import { getCompiledEditorSchema } from '../src/internal';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const note = (text: string) => ({
  type: 'endnote',
  children: [paragraph(text)],
});
const quote = (children: readonly Descendant[]) => ({
  type: 'quote',
  children,
});
const compile = (endMatter = true) =>
  getCompiledEditorSchema(
    createEditor({
      plugins: [
        defineEditorSchema('end-matter', {
          id: 'end-matter',
          version: 1,
          unknown: 'reject',
          elements: {
            paragraph: { content: schema.content.text() },
            quote: { content: schema.content.open() },
            endnote: {
              content: schema.content.open(),
              ...(endMatter ? { slice: { endMatter: true } } : {}),
            },
          },
          root: schema.content.types(['paragraph', 'quote', 'endnote'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        }),
      ],
    })
  );

describe('end matter slices', () => {
  for (const depth of [1, 2]) {
    for (const edge of ['start', 'end', 'both'] as const) {
      it(`dissolves an open endnote at depth ${depth} on ${edge}`, () => {
        let content: Descendant[] = [note('words')];
        for (let i = 1; i < depth; i++) content = [quote(content)];
        const openStart = edge === 'end' ? 0 : depth + 1;
        const openEnd = edge === 'start' ? 0 : depth + 1;
        const input = ContentSlice.fromJSON({ content, openStart, openEnd });
        let expected: Descendant[] = [paragraph('words')];
        for (let i = 1; i < depth; i++) expected = [quote(expected)];
        assert.deepEqual(dissolveOpenEndMatter(input, compile()), {
          content: expected,
          openStart: Math.max(0, openStart - 1),
          openEnd: Math.max(0, openEnd - 1),
        });
      });
    }
    it(`keeps a closed endnote at depth ${depth}`, () => {
      let content: Descendant[] = [note('words')];
      for (let i = 1; i < depth; i++) content = [quote(content)];
      const input = ContentSlice.fromJSON({
        content,
        openStart: depth - 1,
        openEnd: depth - 1,
      });
      assert.deepEqual(dissolveOpenEndMatter(input, compile()), input);
    });
  }

  it('takes nested end matter in source pre-order and keeps emptied containers', () => {
    const input = ContentSlice.closed([
      quote([
        { type: 'endnote', children: [note('inner'), paragraph('outer')] },
        note('second'),
      ]),
      note('last'),
    ]);
    assert.deepEqual(splitEndMatter(input, compile()), {
      endMatter: [
        { type: 'endnote', children: [paragraph('outer')] },
        note('inner'),
        note('second'),
        note('last'),
      ],
      flow: ContentSlice.closed([{ type: 'quote', children: [] }]),
    });
  });

  it('repairs both open edges when truncated closed notes are extracted', () => {
    const input = ContentSlice.fromJSON({
      content: [quote([note('cut')])],
      openStart: 2,
      openEnd: 3,
    });
    const result = splitEndMatter(input, compile());
    assert.deepEqual(result, {
      endMatter: [note('cut')],
      flow: ContentSlice.fromJSON({
        content: [{ type: 'quote', children: [] }],
        openStart: 1,
        openEnd: 1,
      }),
    });
  });

  it('dissolves nested open wrappers and preserves the opposite closed note', () => {
    const input = ContentSlice.fromJSON({
      content: [{ type: 'endnote', children: [note('words')] }, note('closed')],
      openStart: 3,
      openEnd: 0,
    });
    assert.deepEqual(dissolveOpenEndMatter(input, compile()), {
      content: [paragraph('words'), note('closed')],
      openStart: 1,
      openEnd: 0,
    });
  });

  it('returns the original flow when no element declares end matter', () => {
    const input = ContentSlice.fromJSON({
      content: [note('words')],
      openStart: 2,
      openEnd: 2,
    });
    const compiled = compile(false);
    assert.equal(dissolveOpenEndMatter(input, compiled), input);
    assert.equal(splitEndMatter(input, compiled).flow, input);
    assert.deepEqual(splitEndMatter(input, compiled).endMatter, []);
    const contract = createEditorSchemaContract(compiled);
    assert.equal(
      contract.elements.byType.some((element) => 'endMatter' in element.slice),
      false
    );
  });

  for (const invalid of [
    {
      inline: true,
      content: schema.content.text(),
      slice: { endMatter: true },
    },
    { void: 'block' as const, slice: { endMatter: true } },
    {
      content: schema.content.open(),
      slice: { endMatter: true, preserveContext: true },
    },
  ]) {
    it(`refuses incompatible end matter ${JSON.stringify(invalid)}`, () => {
      assert.throws(
        () =>
          createEditor({
            plugins: [
              defineEditorSchema('invalid-end-matter', {
                id: 'invalid-end-matter',
                version: 1,
                unknown: 'reject',
                root: schema.content.type('paragraph', {
                  default: { type: 'paragraph' },
                  min: 1,
                }),
                elements: {
                  paragraph: { content: schema.content.text() },
                  endnote: invalid,
                },
              }),
            ],
          }),
        /end matter/i
      );
    });
  }
});
