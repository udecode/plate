import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineEditorSchema,
  element,
  ElementApi,
  property,
  schema,
  target,
} from '@platejs/plite';

const NestedTargetSchema = defineEditorSchema({
  elements: {
    paragraph: element({
      content: schema.content.text({ default: 'text', min: 1 }),
    }),
    section: element({
      content: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
    }),
  },
  id: 'nested-target-runtime',
  properties: [
    schema.textProperty('commentIds', property.set(property.string()), {
      target: target.and(
        target.type('paragraph'),
        target.parent(target.type('section')),
        target.root()
      ),
    }),
  ],
  root: schema.root({
    content: schema.content.type('section', {
      default: { type: 'section' },
      min: 1,
    }),
  }),
  version: 1,
});

describe('compiled schema target runtime', () => {
  it('applies marks with concrete root and ancestor context', () => {
    const editor = createEditor({
      extensions: [NestedTargetSchema],
      initialSelection: {
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 4, path: [0, 0, 0] },
        kind: 'text',
      },
      initialValue: [
        {
          children: [
            {
              children: [{ commentIds: ['base'], text: 'word' }],
              type: 'paragraph',
            },
          ],
          type: 'section',
        },
      ],
    });

    editor.update((tx) => tx.marks.add('commentIds', ['next']));

    const sectionNode = editor.read.children()[0];

    assert.ok(ElementApi.isElement(sectionNode));

    const paragraphNode = sectionNode.children[0];

    assert.ok(ElementApi.isElement(paragraphNode));
    assert.deepEqual(paragraphNode.children[0], {
      commentIds: ['base', 'next'],
      text: 'word',
    });
    assert.deepEqual(
      editor.read
        .lastCommit()!
        .changes.toJSON()
        .primary?.flatMap((section) => section.properties?.operations ?? []),
      [{ key: 'commentIds', type: 'add', values: ['next'] }]
    );
  });
});
