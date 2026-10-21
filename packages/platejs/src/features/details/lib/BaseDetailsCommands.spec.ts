import {
  BaseParagraphPlugin,
  createEditor,
  createEditorView,
  definePlugin,
  editorCommands,
  schema,
  SelectionApi,
} from '../../../core';
import { BaseHorizontalRulePlugin } from '../../basic-nodes/lib/BaseBlockPlugins';
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
      } else if (action === 'node-selection') {
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

  it.each([
    'two inner Details selected as blocks',
    'one given as a node selection',
  ])('unwraps only the inner Details with %s', (target) => {
    const inner = (title: string) => ({
      type: 'details',
      children: [
        { type: 'summary', children: [{ text: title }] },
        { type: 'paragraph', children: [{ text: title.toLowerCase() }] },
      ],
    });
    const editor = createEditor({
      plugins: [BaseDetailsPlugin],
      initialValue: [
        {
          type: 'details',
          children: [
            { type: 'summary', children: [{ text: 'Outer' }] },
            inner('A'),
            inner('B'),
          ],
        },
      ],
    });

    if (target === 'two inner Details selected as blocks') {
      editor.update.selection.setNodes([
        [0, 1],
        [0, 2],
      ]);
      editor.plugin(BaseDetailsPlugin).update.unwrap();
    } else {
      editor
        .plugin(BaseDetailsPlugin)
        .update.unwrap({ at: SelectionApi.nodes([[0, 1]], { mode: 'block' }) });
    }
    expect(editor.read.children()).toMatchObject([
      {
        type: 'details',
        children:
          target === 'two inner Details selected as blocks'
            ? [
                { type: 'summary', children: [{ text: 'Outer' }] },
                { type: 'paragraph', children: [{ text: 'A' }] },
                { type: 'paragraph', children: [{ text: 'a' }] },
                { type: 'paragraph', children: [{ text: 'B' }] },
                { type: 'paragraph', children: [{ text: 'b' }] },
              ]
            : [
                { type: 'summary', children: [{ text: 'Outer' }] },
                { type: 'paragraph', children: [{ text: 'A' }] },
                { type: 'paragraph', children: [{ text: 'a' }] },
                inner('B'),
              ],
      },
    ]);
  });

  it('unwraps only the outer Details for a range from its body into a nested Details', () => {
    const inner = {
      type: 'details',
      children: [
        { type: 'summary', children: [{ text: 'Inner' }] },
        { type: 'paragraph', children: [{ text: 'B' }] },
      ],
    };
    const editor = createEditor({
      plugins: [BaseDetailsPlugin],
      initialValue: [
        {
          type: 'details',
          children: [
            { type: 'summary', children: [{ text: 'Outer' }] },
            { type: 'paragraph', children: [{ text: 'A' }] },
            inner,
          ],
        },
      ],
    });
    editor.update.selection.set({
      anchor: { path: [0, 1, 0], offset: 0 },
      focus: { path: [0, 2, 1, 0], offset: 1 },
    });
    editor.plugin(BaseDetailsPlugin).update.unwrap();
    expect(editor.read.children()).toMatchObject([
      { type: 'paragraph', children: [{ text: 'Outer' }] },
      { type: 'paragraph', children: [{ text: 'A' }] },
      inner,
    ]);
  });

  it.each(['title range', 'body block'])(
    'unwraps the nearest Details from a selected %s',
    (target) => {
      const editor = createEditor({
        plugins: [BaseDetailsPlugin],
        initialValue: [
          {
            type: 'details',
            children: [
              { type: 'summary', children: [{ text: 'Outer' }] },
              value[0],
            ],
          },
        ],
      });

      if (target === 'title range') {
        editor.update.selection.set({
          anchor: { path: [0, 1, 0, 0], offset: 0 },
          focus: { path: [0, 1, 0, 0], offset: 2 },
        });
      } else {
        editor.update.selection.setNodes([[0, 1, 1]]);
      }

      editor.plugin(BaseDetailsPlugin).update.unwrap();

      expect(editor.read.children()).toEqual([
        {
          type: 'details',
          children: [
            { type: 'summary', children: [{ text: 'Outer' }] },
            { type: 'paragraph', children: [{ text: 'Title' }] },
            { type: 'paragraph', children: [{ text: 'Body' }] },
          ],
        },
      ]);
    }
  );

  it('keeps the inner Details when a range continues into later outer body content', () => {
    const editor = createEditor({
      plugins: [BaseDetailsPlugin],
      initialValue: [
        {
          type: 'details',
          children: [
            { type: 'summary', children: [{ text: 'Outer' }] },
            value[0],
            { type: 'paragraph', children: [{ text: 'After' }] },
          ],
        },
      ],
    });
    editor.update.selection.set({
      anchor: { path: [0, 1, 1, 0], offset: 0 },
      focus: { path: [0, 2, 0], offset: 1 },
    });

    editor.plugin(BaseDetailsPlugin).update.unwrap();

    expect(editor.read.children()).toEqual([
      { type: 'paragraph', children: [{ text: 'Outer' }] },
      value[0],
      { type: 'paragraph', children: [{ text: 'After' }] },
    ]);
  });

  it('unwraps a Details its own command edited first', () => {
    const EditThenUnwrap = definePlugin('testEditThenUnwrap', {
      dependencies: [BaseDetailsPlugin],
    }).extend(() => ({
      commands: ({ around }) => [
        around(editorCommands.insertBreak, ({ state }) =>
          state.transaction((tx) => {
            tx.text.insert('New ', { at: { offset: 0, path: [0, 0, 0] } });
            tx.plugin(BaseDetailsPlugin).unwrap({ at: [0] });
          })
        ),
      ],
    }));
    const editor = createEditor({
      plugins: [BaseDetailsPlugin, EditThenUnwrap],
      initialValue: [
        {
          type: 'details',
          children: [
            { type: 'summary', children: [{ text: 'Title' }] },
            { type: 'paragraph', children: [{ text: 'Body' }] },
          ],
        },
      ],
      selection: {
        kind: 'text',
        anchor: { path: [0, 1, 0], offset: 0 },
        focus: { path: [0, 1, 0], offset: 0 },
      },
    });

    editor.update.break.insert();

    expect(editor.read.children()).toEqual([
      { type: 'paragraph', children: [{ text: 'New Title' }] },
      { type: 'paragraph', children: [{ text: 'Body' }] },
    ]);
  });

  describe('in a named root', () => {
    const NoteHolderPlugin = definePlugin('testNoteHolder', {
      dependencies: [BaseParagraphPlugin, BaseDetailsPlugin],
      schema: ({ plugins }) => ({
        element: {
          blockContent: true,
          contentRoots: {
            body: {
              content: schema.content.any([plugins.blockContent().allowed], {
                default: { type: 'paragraph' },
                min: 1,
              }),
              ownership: 'exclusive',
            },
          },
          void: 'block',
        },
      }),
    });
    const main = [
      value[0],
      {
        childRoots: { body: 'note' },
        children: [{ text: '' }],
        type: 'testNoteHolder',
      },
    ];
    const createNoteEditor = (note: readonly unknown[]) =>
      createEditor({
        plugins: [BaseDetailsPlugin, NoteHolderPlugin],
        initialValue: { children: main, roots: { note } } as never,
      });

    it('changes nothing for a note block outside any Details', () => {
      const editor = createNoteEditor([value[1]]);
      editor.update.selection.set({ path: [0, 0, 0], offset: 0 });

      editor.plugin(BaseDetailsPlugin).update.unwrap({
        at: SelectionApi.nodes([[0]], { mode: 'block', root: 'note' }),
      });
      expect(editor.read.children()).toMatchObject(main);
      expect(editor.read.root('note')).toMatchObject([value[1]]);
    });

    it.each([
      ['container', SelectionApi.nodes([[0]], { mode: 'block', root: 'note' })],
      ['body', SelectionApi.nodes([[0, 1]], { mode: 'block', root: 'note' })],
      [
        'body through a range only its focus roots',
        {
          anchor: { offset: 0, path: [0, 1, 0] },
          focus: { offset: 0, path: [0, 1, 0], root: 'note' },
        },
      ],
    ] as const)(
      'unwraps a targeted note %s without changing the main document',
      (_target, at) => {
        const editor = createNoteEditor([
          {
            type: 'details',
            children: [
              { type: 'summary', children: [{ text: 'Note title' }] },
              { type: 'paragraph', children: [{ text: 'Note body' }] },
            ],
          },
        ]);
        editor.update.selection.set({ path: [0, 0, 0], offset: 0 });

        editor.plugin(BaseDetailsPlugin).update.unwrap({ at });

        expect(editor.read.children()).toEqual(main);
        expect(editor.read.root('note')).toEqual([
          { type: 'paragraph', children: [{ text: 'Note title' }] },
          { type: 'paragraph', children: [{ text: 'Note body' }] },
        ]);
        expect(editor.read.selection()).toMatchObject({
          anchor: { path: [0, 0, 0], offset: 0 },
          focus: { path: [0, 0, 0], offset: 0 },
        });
      }
    );

    it('opens and selects a Details inserted after a note block from the main root', () => {
      const editor = createNoteEditor([value[1]]);
      const note = createEditorView(editor, { root: 'note' });
      const after = note.key([0]);
      const details = editor.plugin(BaseDetailsPlugin);
      editor.update.selection.set({ path: [0, 0, 0], offset: 0 });

      expect(after).toBeDefined();
      details.update.insert({}, { after: after!, select: true });

      const key = note.key([1]);
      expect(note.read.children()[1]).toMatchObject({ type: 'details' });
      expect(key && details.api.isOpen(key)).toBe(true);
      expect(editor.read.selection()).toMatchObject({
        anchor: { path: [1, 0, 0], offset: 0, root: 'note' },
      });
    });
  });

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
    const target = SelectionApi.nodes([[0, 1, 0, 0]], { mode: 'block' });
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

  it('keeps the caret visible after deleting a whole paragraph following closed Details [EDIT-DETAILS-BS-AFTER-CLOSED-001]', () => {
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

  it('keeps the caret on the visible Summary after deleting the selected block following closed Details [EDIT-DETAILS-BS-AFTER-CLOSED-001]', () => {
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
    editor.update.selection.set(SelectionApi.nodes([[1]], { mode: 'block' }));
    editor.update.text.deleteBackward({ unit: 'character' });
    expect(editor.read.selection()).toMatchObject({
      anchor: { path: [0, 0, 0], offset: 5 },
      focus: { path: [0, 0, 0], offset: 5 },
    });
  });

  it.each([false, true])(
    'returns Backspace after closed Details to its visible summary (nested: %s) [EDIT-DETAILS-BS-AFTER-CLOSED-001]',
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

  it('leaves Backspace at the start of a table cell after closed Details to the table', () => {
    const table = {
      type: 'table',
      children: [
        {
          type: 'tableRow',
          children: [
            {
              type: 'tableCell',
              children: [{ type: 'paragraph', children: [{ text: '' }] }],
            },
            {
              type: 'tableCell',
              children: [{ type: 'paragraph', children: [{ text: 'B' }] }],
            },
          ],
        },
      ],
    };
    const editor = createEditor({
      plugins: [BaseDetailsPlugin, BaseTablePlugin],
      initialValue: [value[0], table],
    });
    editor.update.selection.set({ path: [1, 0, 0, 0, 0], offset: 0 });
    editor.update.text.deleteBackward({ unit: 'character' });

    expect(editor.read.selection()).toMatchObject({
      anchor: { path: [1, 0, 0, 0, 0], offset: 0 },
    });
    expect(editor.read.children()).toMatchObject([value[0], table]);
  });

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
    expect(details.api.isOpen(key)).toBe(true);
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

  it('splits a title over a selection or around an inserted block into a body paragraph', () => {
    const titled = (focus: number) =>
      createEditor({
        plugins: [BaseDetailsPlugin, BaseHorizontalRulePlugin],
        selection: {
          anchor: { offset: 1, path: [0, 0, 0] },
          focus: { offset: focus, path: [0, 0, 0] },
          kind: 'text',
        },
        initialValue: value,
      });
    const entered = titled(3);
    const inserted = titled(1);

    entered.update.break.insert();
    inserted.update.nodes.insert({
      children: [{ text: '' }],
      type: 'horizontalRule',
    });

    expect(entered.read.children()[0].children).toEqual([
      { children: [{ text: 'T' }], type: 'summary' },
      { children: [{ text: 'le' }], type: 'paragraph' },
      { children: [{ text: 'Body' }], type: 'paragraph' },
    ]);
    expect(inserted.read.children()[0].children).toEqual([
      { children: [{ text: 'T' }], type: 'summary' },
      { children: [{ text: '' }], type: 'horizontalRule' },
      { children: [{ text: 'itle' }], type: 'paragraph' },
      { children: [{ text: 'Body' }], type: 'paragraph' },
    ]);
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
