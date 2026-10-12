import {
  BaseParagraphPlugin,
  createEditor,
  definePlugin,
  editorCommands,
  schema,
  SelectionApi,
} from '../../../core';
import { BaseTablePlugin } from '../../table/lib/BaseTablePlugin';
import { BaseDetailsPlugin } from './BaseDetailsPlugin';

const ContainerPlugin = definePlugin('testContainer', {
  dependencies: [BaseParagraphPlugin],
  schema: {
    element: {
      content: schema.content.element(BaseParagraphPlugin, { min: 1 }),
    },
  },
});

const value = [
  {
    children: [
      { children: [{ text: 'Title' }], type: 'summary' },
      { children: [{ text: 'Body' }], type: 'paragraph' },
    ],
    type: 'details',
  },
  { children: [{ text: 'After' }], type: 'paragraph' },
] as const;

describe('BaseDetailsPlugin', () => {
  it('removes the empty paragraph created after a closed nested summary', () => {
    const initialValue = [
      {
        type: 'details',
        children: [
          { type: 'summary', children: [{ text: 'Outer' }] },
          value[0],
        ],
      },
    ];
    const editor = createEditor({ plugins: [BaseDetailsPlugin], initialValue });
    editor.plugin(BaseDetailsPlugin).api.setOpen(editor.key([0])!, true);
    editor.update.selection.set({ path: [0, 1, 0, 0], offset: 5 });
    editor.update.break.insert();
    expect(editor.read.children()[0].children).toHaveLength(3);
    editor.update.text.deleteBackward({ unit: 'character' });
    expect(editor.read.children()).toMatchObject(initialValue);
    expect(editor.read.children()[0].children).toHaveLength(2);
    expect(editor.read.selection()).toMatchObject({
      anchor: { path: [0, 1, 0, 0], offset: 5 },
      focus: { path: [0, 1, 0, 0], offset: 5 },
    });
  });

  it.each(['backspace', 'node-selection'])(
    'unwraps only the middle Details with %s',
    (action) => {
      const inner = value[0];
      const editor = createEditor({
        plugins: [BaseDetailsPlugin],
        initialValue: [
          {
            type: 'details',
            children: [
              { type: 'summary', children: [{ text: 'Outer' }] },
              {
                type: 'details',
                children: [
                  { type: 'summary', children: [{ text: 'Middle' }] },
                  inner,
                ],
              },
            ],
          },
        ],
      });
      if (action === 'backspace') {
        editor.update.selection.set({ path: [0, 1, 0, 0], offset: 0 });
        editor.update.text.deleteBackward({ unit: 'character' });
      } else {
        editor.update.selection.setNodes([[0, 1]]);
        editor.plugin(BaseDetailsPlugin).update.unwrap();
      }
      expect(editor.read.children()).toMatchObject([
        {
          type: 'details',
          children: [
            { type: 'summary', children: [{ text: 'Outer' }] },
            { type: 'paragraph', children: [{ text: 'Middle' }] },
            inner,
          ],
        },
      ]);
    }
  );

  it('preserves the cell selection when clearing a table inside closed Details', () => {
    const editor = createEditor({
      plugins: [BaseDetailsPlugin, BaseTablePlugin],
      initialValue: [
        {
          type: 'details',
          children: [
            { type: 'summary', children: [{ text: 'Title' }] },
            {
              type: 'table',
              children: [
                {
                  type: 'tableRow',
                  children: [
                    {
                      type: 'tableCell',
                      children: [
                        { type: 'paragraph', children: [{ text: 'Cell' }] },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    const target = SelectionApi.nodes([[0, 1, 0, 0]]);
    editor.update.selection.set(target);
    editor.update((tx) =>
      tx.command(editorCommands.deleteFragment, {
        at: target,
        direction: 'backward',
      })
    );
    expect(editor.read.selection.nodes().map(([, path]) => path)).toEqual([
      [0, 1, 0, 0],
    ]);
  });

  it('keeps the caret visible after deleting a whole paragraph following closed Details', () => {
    const initialValue = [
      {
        type: 'details',
        children: [
          { type: 'summary', children: [{ text: 'Outer' }] },
          value[0],
        ],
      },
      value[1],
    ];
    const editor = createEditor({ plugins: [BaseDetailsPlugin], initialValue });
    editor.update.selection.set({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 5 },
    });
    editor.update((tx) =>
      tx.command(editorCommands.deleteFragment, {
        at: {
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 5 },
        },
        direction: 'backward',
      })
    );
    expect(editor.read.selection()).toMatchObject({
      anchor: { path: [0, 0, 0], offset: 5 },
      focus: { path: [0, 0, 0], offset: 5 },
    });
    expect(editor.read.children()[0]).toMatchObject(initialValue[0]);
  });

  it.each([false, true])(
    'returns Backspace after closed Details to its visible summary (nested: %s)',
    (nested) => {
      const initialValue = nested
        ? [
            {
              type: 'details',
              children: [
                { type: 'summary', children: [{ text: 'Outer' }] },
                value[0],
              ],
            },
            value[1],
          ]
        : value;
      const editor = createEditor({
        plugins: [BaseDetailsPlugin],
        initialValue,
      });
      const title = nested ? 'Outer' : 'Title';
      editor.update.selection.set({ path: [0, 0, 0], offset: title.length });
      editor.update.break.insert();
      editor.update.text.deleteBackward({ unit: 'character' });
      expect(editor.read.selection()).toMatchObject({
        anchor: { path: [0, 0, 0], offset: title.length },
        focus: { path: [0, 0, 0], offset: title.length },
      });
      expect(editor.read.children()).toMatchObject(initialValue);
      editor.update.text.insert('XYZ');
      expect(editor.read.children()[0].children[0]).toMatchObject({
        children: [{ text: `${title}XYZ` }],
      });
    }
  );

  it('moves Enter at the end of an open Summary into the first body block', () => {
    const editor = createEditor({
      plugins: [BaseDetailsPlugin],
      selection: {
        anchor: { offset: 5, path: [0, 0, 0] },
        focus: { offset: 5, path: [0, 0, 0] },
        kind: 'text',
      },
      initialValue: value,
    });

    editor.plugin(BaseDetailsPlugin).api.setOpen(editor.key([0])!, true);
    editor.update.break.insert();

    expect(editor.read.selection()).toMatchObject({
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });
  });

  it('creates a body on Enter after dragging the last body block out [EDIT-DETAILS-ENTER-001]', () => {
    const editor = createEditor({
      plugins: [BaseDetailsPlugin],
      initialValue: [
        {
          type: 'details',
          children: [
            { type: 'summary', children: [{ text: 'Outer' }] },
            ...value,
          ],
        },
      ],
    });
    const details = editor.plugin(BaseDetailsPlugin);
    const key = editor.key([0, 1])!;

    details.api.setOpen(key, true);
    expect(
      editor.api.transfer.move({
        nodes: [editor.key([0, 1, 1])!],
        to: { edge: 'before', key },
      }).status
    ).toBe('moved');
    editor.update.selection.set({ path: [0, 2, 0, 0], offset: 5 });
    editor.update.break.insert();
    editor.update.text.insert('New body');

    expect(editor.read.children()[0].children.slice(2)).toMatchObject([
      {
        type: 'details',
        children: [
          { type: 'summary', children: [{ text: 'Title' }] },
          { type: 'paragraph', children: [{ text: 'New body' }] },
        ],
      },
      { type: 'paragraph', children: [{ text: 'After' }] },
    ]);
    expect(editor.read.selection()).toMatchObject({
      anchor: { path: [0, 2, 1, 0], offset: 8 },
      focus: { path: [0, 2, 1, 0], offset: 8 },
    });
    expect(details.store.get('isOpen', key)).toBe(true);
  });

  it('moves Enter in a closed Summary after the whole Details', () => {
    const editor = createEditor({
      plugins: [BaseDetailsPlugin],
      selection: {
        anchor: { offset: 5, path: [0, 0, 0] },
        focus: { offset: 5, path: [0, 0, 0] },
        kind: 'text',
      },
      initialValue: value,
    });

    editor.update.break.insert();

    expect(editor.read.selection()).toMatchObject({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
    expect(editor.read.children()[0]).toMatchObject(value[0]);
  });

  it('moves trailing Summary text into a new first body paragraph', () => {
    const editor = createEditor({
      plugins: [BaseDetailsPlugin],
      selection: {
        anchor: { offset: 2, path: [0, 0, 0] },
        focus: { offset: 2, path: [0, 0, 0] },
        kind: 'text',
      },
      initialValue: value,
    });

    editor.plugin(BaseDetailsPlugin).api.setOpen(editor.key([0])!, true);
    editor.update.break.insert();

    expect(editor.read.children()[0]).toMatchObject({
      children: [
        { children: [{ text: 'Ti' }], type: 'summary' },
        { children: [{ text: 'tle' }], type: 'paragraph' },
        { children: [{ text: 'Body' }], type: 'paragraph' },
      ],
      type: 'details',
    });
  });

  it('exits from the final empty body without deleting it', () => {
    const editor = createEditor({
      plugins: [BaseDetailsPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 1, 0] },
        focus: { offset: 0, path: [0, 1, 0] },
        kind: 'text',
      },
      initialValue: [
        {
          children: [
            { children: [{ text: 'Title' }], type: 'summary' },
            { children: [{ text: '' }], type: 'paragraph' },
          ],
          type: 'details',
        },
      ],
    });

    editor.plugin(BaseDetailsPlugin).api.setOpen(editor.key([0])!, true);
    editor.update.break.insert();

    expect(editor.read.children()).toMatchObject([
      {
        children: [
          { children: [{ text: 'Title' }], type: 'summary' },
          { children: [{ text: '' }], type: 'paragraph' },
        ],
        type: 'details',
      },
      { children: [{ text: '' }], type: 'paragraph' },
    ]);
    expect(editor.read.selection()).toMatchObject({
      anchor: { path: [1, 0] },
      focus: { path: [1, 0] },
    });
  });

  it('unwraps Details on Backspace at Summary start', () => {
    const editor = createEditor({
      plugins: [BaseDetailsPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0] },
        kind: 'text',
      },
      initialValue: value,
    });

    editor.update.text.deleteBackward({ unit: 'character' });

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'Title' }], type: 'paragraph' },
      { children: [{ text: 'Body' }], type: 'paragraph' },
      { children: [{ text: 'After' }], type: 'paragraph' },
    ]);
  });

  it('moves Backspace at first body start to the end of Summary', () => {
    const editor = createEditor({
      plugins: [BaseDetailsPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 1, 0] },
        focus: { offset: 0, path: [0, 1, 0] },
        kind: 'text',
      },
      initialValue: value,
    });

    editor.plugin(BaseDetailsPlugin).api.setOpen(editor.key([0])!, true);
    editor.update.text.deleteBackward({ unit: 'character' });

    expect(editor.read.selection()).toMatchObject({
      anchor: { offset: 5, path: [0, 0, 0] },
      focus: { offset: 5, path: [0, 0, 0] },
    });
    expect(editor.read.children()).toMatchObject(value);
  });

  it('keeps nested Backspace scoped to its container', () => {
    const editor = createEditor({
      plugins: [BaseDetailsPlugin, ContainerPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 1, 1, 0] },
        focus: { offset: 0, path: [0, 1, 1, 0] },
        kind: 'text',
      },
      initialValue: [
        {
          children: [
            { children: [{ text: 'Title' }], type: 'summary' },
            {
              children: [
                { children: [{ text: 'First' }], type: 'paragraph' },
                { children: [{ text: 'Second' }], type: 'paragraph' },
              ],
              type: 'testContainer',
            },
          ],
          type: 'details',
        },
      ],
    });

    editor.plugin(BaseDetailsPlugin).api.setOpen(editor.key([0])!, true);
    editor.update.text.deleteBackward({ unit: 'character' });

    expect(editor.read.children()).toMatchObject([
      {
        children: [
          { children: [{ text: 'Title' }], type: 'summary' },
          {
            children: [
              {
                children: [{ text: 'FirstSecond' }],
                type: 'paragraph',
              },
            ],
            type: 'testContainer',
          },
        ],
        type: 'details',
      },
    ]);
  });

  it('skips a closed body on forward Delete at Summary end', () => {
    const editor = createEditor({
      plugins: [BaseDetailsPlugin],
      selection: {
        anchor: { offset: 5, path: [0, 0, 0] },
        focus: { offset: 5, path: [0, 0, 0] },
        kind: 'text',
      },
      initialValue: value,
    });

    editor.update.text.deleteForward({ unit: 'character' });

    expect(editor.read.selection()).toMatchObject({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
    expect(editor.read.children()).toMatchObject(value);
  });
});
