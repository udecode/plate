import assert from 'node:assert/strict';
import { it } from 'node:test';

import {
  createEditor,
  defineEditorSchema,
  property,
  schema,
  SelectionApi,
} from 'plitejs';

import { history } from '../../src/history';

for (const [from, to] of [
  ['subscript', 'superscript'],
  ['superscript', 'subscript'],
] as const) {
  it(`undoes a ${from} to ${to} swap after a history-skipped edit`, () => {
    const position = schema.property.exclusive('script-position');
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:history-swap', {
          elements: { paragraph: { content: schema.content.text() } },
          id: 'history-swap',
          properties: [
            schema.textProperty('subscript', property.boolean(), {
              exclusive: [position],
            }),
            schema.textProperty('superscript', property.boolean(), {
              exclusive: [position],
            }),
          ],
          root: schema.content.type('paragraph'),
          unknown: 'reject',
          version: 1,
        }),
        history(),
      ],
      initialValue: [
        { type: 'paragraph', children: [{ text: 'text', [from]: true }] },
        { type: 'paragraph', children: [{ text: 'other' }] },
      ],
      initialSelection: SelectionApi.text({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      }),
    });

    editor.update.marks.toggle(to);
    editor.update({ tags: ['collaboration', 'history-skip'] }, (tx) => {
      tx.text.insert('!', { at: { path: [1, 0], offset: 5 } });
    });
    assert.deepEqual(editor.api.history.undo(), { status: 'applied' });
    assert.deepEqual(editor.read.children(), [
      { type: 'paragraph', children: [{ text: 'text', [from]: true }] },
      { type: 'paragraph', children: [{ text: 'other!' }] },
    ]);
  });
}

it('redoes a mark over a history-skipped exclusive sibling', () => {
  const position = schema.property.exclusive('script-position');
  const editor = createEditor({
    plugins: [
      defineEditorSchema('schema:history-script', {
        elements: { paragraph: { content: schema.content.text() } },
        id: 'history-script',
        properties: [
          schema.textProperty('subscript', property.boolean(), {
            exclusive: [position],
          }),
          schema.textProperty('superscript', property.boolean(), {
            exclusive: [position],
          }),
        ],
        root: schema.content.type('paragraph'),
        unknown: 'reject',
        version: 1,
      }),
      history(),
    ],
    initialValue: [{ type: 'paragraph', children: [{ text: 'text' }] }],
    initialSelection: SelectionApi.text({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    }),
  });

  editor.update.marks.toggle('subscript');
  editor.api.history.undo();
  editor.update({ tags: ['collaboration', 'history-skip'] }, (tx) => {
    tx.nodes.set({ superscript: true }, { at: [0, 0] });
  });
  assert.deepEqual(editor.api.history.redo(), { status: 'applied' });
  assert.deepEqual(editor.read.children(), [
    { type: 'paragraph', children: [{ text: 'text', subscript: true }] },
  ]);
});

it('keeps a history-skipped property on the rest of a partially marked leaf after undo', () => {
  const position = schema.property.exclusive('script-position');
  const editor = createEditor({
    plugins: [
      defineEditorSchema('schema:history-script', {
        elements: { paragraph: { content: schema.content.text() } },
        id: 'history-script',
        properties: [
          schema.textProperty('subscript', property.boolean(), {
            exclusive: [position],
          }),
          schema.textProperty('superscript', property.boolean(), {
            exclusive: [position],
          }),
        ],
        root: schema.content.type('paragraph'),
        unknown: 'reject',
        version: 1,
      }),
      history(),
    ],
    initialValue: [{ type: 'paragraph', children: [{ text: 'text' }] }],
    initialSelection: SelectionApi.text({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    }),
  });

  editor.update.marks.toggle('subscript');
  editor.update({ tags: ['collaboration', 'history-skip'] }, (tx) => {
    tx.nodes.set({ superscript: true }, { at: [0, 1] });
  });
  assert.deepEqual(editor.api.history.undo(), { status: 'applied' });
  assert.deepEqual(editor.read.children(), [
    {
      type: 'paragraph',
      children: [{ text: 'tex' }, { text: 't', superscript: true }],
    },
  ]);
});

it('redoes the original character range after a history-skipped mark re-cuts the leaves', () => {
  const position = schema.property.exclusive('script-position');
  const editor = createEditor({
    plugins: [
      defineEditorSchema('schema:history-script', {
        elements: { paragraph: { content: schema.content.text() } },
        id: 'history-script',
        properties: [
          schema.textProperty('subscript', property.boolean(), {
            exclusive: [position],
          }),
          schema.textProperty('superscript', property.boolean(), {
            exclusive: [position],
          }),
        ],
        root: schema.content.type('paragraph'),
        unknown: 'reject',
        version: 1,
      }),
      history(),
    ],
    initialValue: [{ type: 'paragraph', children: [{ text: 'text' }] }],
    initialSelection: SelectionApi.text({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    }),
  });

  editor.update.marks.toggle('subscript');
  editor.api.history.undo();
  editor.update({ tags: ['collaboration', 'history-skip'] }, (tx) => {
    tx.selection.set(
      SelectionApi.text({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 4 },
      })
    );
    tx.marks.toggle('superscript');
  });
  assert.deepEqual(editor.api.history.redo(), { status: 'applied' });
  assert.deepEqual(editor.read.children(), [
    {
      type: 'paragraph',
      children: [
        { text: 'tex', subscript: true },
        { text: 't', superscript: true },
      ],
    },
  ]);
});
