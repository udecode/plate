import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineEditorSchema,
  type Descendant,
  DocumentChange,
  ElementApi,
  property,
  schema,
  TextApi,
} from '@platejs/plite';
import fc from 'fast-check';

import {
  canonicalizeRootChildren,
  constructCanonicalDocumentChange,
} from '../src/core/representation';

const createSchemaEditor = () =>
  createEditor({
    extensions: [
      defineEditorSchema('schema:generated-schema-laws', {
        elements: {
          caption: {
            content: schema.content.text({ default: 'text', min: 1 }),
          } as const,
          figure: {
            content: schema.content.type('caption', {
              default: { type: 'caption' },
              min: 1,
            }),
          } as const,
          link: {
            content: schema.content.text({ default: 'text', min: 1 }),
            inline: true,
          } as const,
          paragraph: {
            content: schema.content.text({ default: 'text', min: 1 }),
          } as const,
          section: {
            content: schema.content.group('block', {
              default: { type: 'paragraph' },
              min: 1,
            }),
          } as const,
        },
        id: 'generated-schema-laws',
        properties: [schema.textProperty('bold', property.boolean())],
        root: schema.content.types(['figure', 'paragraph', 'section']),
        unknown: 'reject',
        version: 1,
      }),
    ],
  });

const textArbitrary = fc.string({ maxLength: 12 });
const inlineChildArbitrary = fc.oneof(
  fc
    .record({
      bold: fc.boolean(),
      text: fc.string({ maxLength: 6 }),
    })
    .map(({ bold, text }): Descendant => ({
      ...(bold ? { bold: true } : {}),
      text,
    })),
  fc.string({ maxLength: 4, minLength: 1 }).map((character): Descendant => ({
    character,
    children: [{ text: '' }],
    type: 'mention',
  }))
);
const fitChildArbitrary = fc.oneof(
  textArbitrary.map((text) => ({ text })),
  textArbitrary.map((text) => ({ type: 'paragraph', children: [{ text }] })),
  textArbitrary.map((text) => ({ type: 'caption', children: [{ text }] }))
);

const assertCanonical = (children: readonly Descendant[]) => {
  for (const child of children) {
    if (!ElementApi.isElement(child)) continue;

    assert.ok(child.children.length > 0);

    child.children.forEach((nested, index) => {
      const previous = child.children[index - 1];

      if (TextApi.isText(nested) && TextApi.isText(previous)) {
        assert.equal(
          TextApi.equals(nested, previous, { loose: true }),
          false,
          'same-mark adjacent text must be merged'
        );
      }
    });
    assertCanonical(child.children);
  }
};

describe('compiled schema and correction laws', () => {
  it('fits generated valid fragments to a closed, valid, idempotent slice', () => {
    fc.assert(
      fc.property(fc.array(fitChildArbitrary, { maxLength: 12 }), (content) => {
        const value = {
          children: [
            {
              type: 'section',
              children: [{ type: 'paragraph', children: [{ text: '' }] }],
            },
          ],
        };
        const editor = createSchemaEditor();

        editor.update.value.replace(value);
        const fitted = editor.read.slice.fit(
          {
            content,
            openEnd: 0,
            openStart: 0,
          },
          {
            at: {
              anchor: { offset: 0, path: [0, 0, 0] },
              focus: { offset: 0, path: [0, 0, 0] },
            },
          }
        );

        if (content.length === 0) {
          assert.equal(fitted, false);
          return;
        }

        assert.ok(fitted);
        const after = fitted.changes.apply(value);

        assert.doesNotThrow(() => editor.read.schema.assertDocument(after));
        assert.deepEqual(fitted.changes.apply(value), after);
        assertCanonical(after.children);
      }),
      { numRuns: 100 }
    );
  });

  it('constructs generated minimum grammars as valid values', () => {
    fc.assert(
      fc.property(fc.integer({ max: 8, min: 1 }), (minimum) => {
        const editor = createEditor({
          extensions: [
            defineEditorSchema(`schema:minimum-${minimum}`, {
              elements: {
                generated: {
                  content: schema.content.text({
                    default: 'text',
                    min: minimum,
                  }),
                } as const,
              },
              id: `minimum-${minimum}`,
              root: schema.content.type('generated'),
              unknown: 'reject',
              version: 1,
            }),
          ],
        });
        const filled = editor.read.schema.create('generated');

        assert.equal(filled.children.length, minimum);
        assert.doesNotThrow(() => editor.read.schema.assertFragment([filled]));
      }),
      { numRuns: 50 }
    );
  });

  it('canonicalizes generated leaf runs once and remains stable', () => {
    const leafArbitrary = fc.record({
      bold: fc.boolean(),
      text: textArbitrary,
    });

    fc.assert(
      fc.property(fc.array(leafArbitrary, { maxLength: 24 }), (leaves) => {
        const editor = createSchemaEditor();
        const children = leaves.map(({ bold, text }) => ({
          ...(bold ? { bold: true } : {}),
          text,
        }));

        editor.update((tx) => {
          tx.value.replace({
            children: [{ type: 'paragraph', children }],
            selection: null,
          });
        });

        const canonical = editor.read.children();

        assertCanonical(canonical);
        editor.update.value.repair();
        assert.deepEqual(editor.read.children(), canonical);
      }),
      { numRuns: 100 }
    );
  });

  it('constructs generated local inline edits like full canonicalization', () => {
    fc.assert(
      fc.property(
        fc.array(inlineChildArbitrary, { maxLength: 12 }),
        inlineChildArbitrary,
        fc.nat({ max: 1000 }),
        (rawChildren, replacement, seed) => {
          const editor = createEditor({
            extensions: [
              defineEditorSchema('schema:generated-inline-construction', {
                elements: {
                  mention: {
                    properties: { character: property.string() },
                    void: 'markable-inline',
                  } as const,
                  paragraph: {
                    content: schema.content.any(
                      [schema.content.text(), schema.content.type('mention')],
                      { default: 'text', min: 1 }
                    ),
                  } as const,
                },
                id: 'generated-inline-construction',
                properties: [schema.textProperty('bold', property.boolean())],
                root: schema.content.type('paragraph'),
                unknown: 'reject',
                version: 1,
              }),
            ],
          });
          const canonicalBefore = canonicalizeRootChildren(
            editor,
            [{ type: 'paragraph', children: rawChildren }],
            null
          );
          const paragraph = canonicalBefore[0];

          assert.ok(ElementApi.isElement(paragraph));

          const nextChildren = [...paragraph.children];
          const operation = seed % 3;

          if (operation === 0 && nextChildren.length > 0) {
            nextChildren.splice(seed % nextChildren.length, 1);
          } else if (operation === 1 && nextChildren.length > 0) {
            nextChildren[seed % nextChildren.length] = replacement;
          } else {
            nextChildren.splice(
              seed % (nextChildren.length + 1),
              0,
              replacement
            );
          }

          const before = { children: canonicalBefore };
          const after = {
            children: [{ ...paragraph, children: nextChildren }],
          };
          const rawChange = DocumentChange.between(before, after);
          const construction = constructCanonicalDocumentChange(
            editor,
            after,
            rawChange
          );
          const candidate = construction.apply(after);
          const accumulated = rawChange.compose(construction, before);

          assert.deepEqual(
            candidate.children,
            canonicalizeRootChildren(editor, after.children, null)
          );
          assert.equal(
            constructCanonicalDocumentChange(editor, candidate, accumulated)
              .empty,
            true
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('keeps incremental open-content mode aligned with full canonicalization', () => {
    const editor = createEditor({
      extensions: [
        defineEditorSchema('schema:open-content-construction', {
          elements: {
            block: { content: schema.content.open() },
          },
          id: 'open-content-construction',
          root: schema.content.type('block'),
          unknown: 'reject',
          version: 1,
        }),
      ],
    });
    const before = {
      children: [
        { type: 'block', children: [{ text: 'before' }] },
      ] as Descendant[],
    };
    const after = {
      children: [
        {
          type: 'block',
          children: [{ type: 'block', children: [{ text: 'nested' }] }],
        },
      ] as Descendant[],
    };
    const change = DocumentChange.between(before, after);

    assert.deepEqual(
      canonicalizeRootChildren(editor, after.children, null),
      after.children
    );
    assert.equal(
      constructCanonicalDocumentChange(editor, after, change).empty,
      true
    );
  });
});
