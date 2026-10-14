import {
  BaseParagraphPlugin,
  createEditor,
  definePlugin,
  schema,
  SelectionApi,
} from '../../../core';
import { BaseCalloutPlugin } from '../../callout';
import { BaseDetailsPlugin } from '../../details';
import { BaseIndentPlugin } from '../../indent';
import { BaseListPlugin } from './BaseListPlugin';

describe('Details list conversion', () => {
  it('indents a converted family once when both title and body are selected', () => {
    const editor = createEditor({
      plugins: [BaseDetailsPlugin, BaseListPlugin],
      initialValue: [
        {
          type: 'details',
          children: [
            { type: 'summary', children: [{ text: 'Title' }] },
            { type: 'paragraph', children: [{ text: 'Body' }] },
          ],
        },
      ],
    });
    editor
      .plugin(BaseListPlugin)
      .update.toggle({ type: 'bulleted', at: [0, 0] });
    editor.plugin(BaseIndentPlugin).update.increase({ nodes: { at: [0] } });
    expect(editor.read.children().map((node) => node.indent)).toEqual([2, 3]);
    editor.update.selection.set(SelectionApi.nodes([[0], [1]]));
    editor.plugin(BaseIndentPlugin).update.decrease();
    expect(editor.read.children().map((node) => node.indent)).toEqual([1, 2]);
    editor.plugin(BaseListPlugin).update.outdent({ at: [0] });
    expect(editor.read.children().map((node) => node.indent)).toEqual([
      undefined,
      1,
    ]);
    expect(editor.read.children()[0]).not.toHaveProperty('listType');
  });

  it('retains the ancestry of two converted titles', () => {
    const editor = createEditor({
      plugins: [
        BaseDetailsPlugin,
        BaseListPlugin.configure({
          targetPlugins: [BaseParagraphPlugin, BaseDetailsPlugin],
        }),
      ],
      initialValue: [
        {
          type: 'details',
          children: [
            { type: 'summary', children: [{ text: 'A' }] },
            {
              type: 'details',
              children: [
                { type: 'summary', children: [{ text: 'B' }] },
                { type: 'paragraph', children: [{ text: 'C' }] },
              ],
            },
          ],
        },
      ],
    });
    editor.plugin(BaseListPlugin).update.toggle({
      type: 'bulleted',
      at: SelectionApi.nodes([
        [0, 0],
        [0, 1, 0],
      ]),
    });
    expect(editor.read.children().map((node) => node.indent)).toEqual([
      1, 2, 3,
    ]);
    expect(editor.read.transfer.nodes({ node: editor.key([0])! })).toEqual([
      editor.key([0]),
      editor.key([1]),
      editor.key([2]),
    ]);
  });

  it('keeps an indented Details under its existing list parent', () => {
    const editor = createEditor({
      plugins: [
        BaseDetailsPlugin,
        BaseListPlugin.configure({
          targetPlugins: [BaseParagraphPlugin, BaseDetailsPlugin],
        }),
      ],
      initialValue: [
        {
          type: 'paragraph',
          listType: 'bulleted',
          indent: 1,
          children: [{ text: 'Parent' }],
        },
        {
          type: 'details',
          indent: 2,
          children: [
            { type: 'summary', children: [{ text: 'Title' }] },
            { type: 'paragraph', children: [{ text: 'Body' }] },
          ],
        },
      ],
      selection: {
        kind: 'text',
        anchor: { path: [1, 0, 0], offset: 0 },
        focus: { path: [1, 0, 0], offset: 0 },
      },
    });
    editor.plugin(BaseListPlugin).update.toggle({ type: 'numbered' });
    expect(editor.read.children().map((node) => node.indent)).toEqual([
      1, 2, 3,
    ]);
    expect(editor.read.transfer.nodes({ node: editor.key([0])! })).toEqual([
      editor.key([0]),
      editor.key([1]),
      editor.key([2]),
    ]);
  });

  it('converts an explicitly named document without editing the active one', () => {
    const Holder = definePlugin('listNoteHolder', {
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
    const editor = createEditor({
      plugins: [
        BaseDetailsPlugin,
        Holder,
        BaseListPlugin.configure({
          targetPlugins: [BaseParagraphPlugin, BaseDetailsPlugin],
        }),
      ],
      initialValue: {
        children: [
          { type: 'paragraph', children: [{ text: 'Main' }] },
          {
            type: 'listNoteHolder',
            childRoots: { body: 'note' },
            children: [{ text: '' }],
          },
        ],
        roots: {
          note: [
            {
              type: 'details',
              children: [
                { type: 'summary', children: [{ text: 'Title' }] },
                { type: 'paragraph', children: [{ text: 'Body' }] },
              ],
            },
          ],
        },
      },
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });
    const before = editor.read.children();
    editor.plugin(BaseListPlugin).update.toggle({
      type: 'bulleted',
      at: SelectionApi.nodes([[0, 0]], { root: 'note' }),
    });
    expect(editor.read.children()).toEqual(before);
    expect(editor.read.root('note')).toMatchObject([
      {
        type: 'paragraph',
        listType: 'bulleted',
        indent: 1,
        children: [{ text: 'Title' }],
      },
      { type: 'paragraph', indent: 2, children: [{ text: 'Body' }] },
    ]);
    editor.plugin(BaseListPlugin).update.toggle({
      type: 'numbered',
      at: SelectionApi.nodes([[0]], { root: 'note' }),
    });
    expect(editor.read.root('note')[0]).toMatchObject({ listType: 'numbered' });
    editor.plugin(BaseIndentPlugin).update.increase({
      nodes: { at: SelectionApi.nodes([[0]], { root: 'note' }) },
    });
    expect(editor.read.root('note').map((node) => node.indent)).toEqual([2, 3]);
    expect(editor.read.children()).toEqual(before);
  });

  it('converts an explicit title without taking another block’s caret', () => {
    const editor = createEditor({
      plugins: [BaseDetailsPlugin, BaseListPlugin],
      initialValue: [
        {
          type: 'details',
          children: [
            { type: 'summary', children: [{ text: 'Title' }] },
            { type: 'paragraph', children: [{ text: 'Body' }] },
          ],
        },
        { type: 'paragraph', children: [{ text: 'After' }] },
      ],
      selection: {
        kind: 'text',
        anchor: { path: [1, 0], offset: 1 },
        focus: { path: [1, 0], offset: 1 },
      },
    });
    expect(
      editor
        .plugin(BaseListPlugin)
        .update.toggle({ at: [0, 0], type: 'bulleted' })
    ).toBe(true);
    expect(editor.read.children()[0]).toMatchObject({
      type: 'paragraph',
      listType: 'bulleted',
      children: [{ text: 'Title' }],
    });
    expect(editor.read.selection()).toEqual({
      anchor: { path: [2, 0], offset: 1 },
      focus: { path: [2, 0], offset: 1 },
    });
    editor.update.text.insert('!');
    expect(editor.read.text.string([2])).toBe('A!fter');
  });

  it('preserves a configured non-list body block as an indented child', () => {
    const editor = createEditor({
      plugins: [
        BaseDetailsPlugin,
        BaseListPlugin.configure({
          targetPlugins: [BaseParagraphPlugin, BaseCalloutPlugin],
        }),
        BaseCalloutPlugin,
      ],
      initialValue: [
        {
          type: 'details',
          children: [
            { type: 'summary', children: [{ text: 'Title' }] },
            { type: 'callout', children: [{ text: 'Body' }] },
          ],
        },
      ],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0], offset: 0 },
      },
    });
    editor.plugin(BaseListPlugin).update.toggle({ type: 'bulleted' });
    expect(editor.read.children()[1]).toMatchObject({
      type: 'callout',
      indent: 2,
      children: [{ text: 'Body' }],
    });
  });

  it('leaves the section unchanged when its body cannot be indented', () => {
    const editor = createEditor({
      plugins: [BaseDetailsPlugin, BaseListPlugin, BaseCalloutPlugin],
      initialValue: [
        {
          type: 'details',
          children: [
            { type: 'summary', children: [{ text: 'Title' }] },
            { type: 'callout', children: [{ text: 'Body' }] },
          ],
        },
      ],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0], offset: 0 },
      },
    });
    const before = editor.read.children();
    expect(
      editor.plugin(BaseListPlugin).update.toggle({ type: 'bulleted' })
    ).toBe(false);
    expect(editor.read.children()).toEqual(before);
  });

  it.each(['bulleted', 'numbered', 'task'] as const)(
    'converts a title to %s and carries its body when moved',
    (type) => {
      const editor = createEditor({
        plugins: [BaseDetailsPlugin, BaseListPlugin],
        initialValue: [
          {
            type: 'details',
            children: [
              { type: 'summary', children: [{ text: 'Outer' }] },
              {
                type: 'details',
                children: [
                  { type: 'summary', children: [{ text: 'Title' }] },
                  { type: 'paragraph', children: [{ text: 'Body' }] },
                  {
                    type: 'paragraph',
                    listType: 'bulleted',
                    indent: 1,
                    children: [{ text: 'Child' }],
                  },
                ],
              },
              { type: 'paragraph', children: [{ text: 'After' }] },
            ],
          },
        ],
        selection: {
          kind: 'text',
          anchor: { path: [0, 1, 0, 0], offset: 1 },
          focus: { path: [0, 1, 0, 0], offset: 1 },
        },
      });
      const before = editor.read.children();
      const outerKey = editor.key([0]);
      const innerKey = editor.key([0, 1])!;
      const bodyKey = editor.key([0, 1, 1]);
      const childKey = editor.key([0, 1, 2]);
      editor.plugin(BaseDetailsPlugin).api.setOpen(innerKey, true);

      expect(editor.plugin(BaseListPlugin).update.toggle({ type })).toBe(true);

      expect(editor.read.children()).toMatchObject([
        {
          type: 'details',
          children: [
            { type: 'summary', children: [{ text: 'Outer' }] },
            {
              type: 'paragraph',
              listType: type,
              indent: 1,
              children: [{ text: 'Title' }],
            },
            { type: 'paragraph', indent: 2, children: [{ text: 'Body' }] },
            {
              type: 'paragraph',
              listType: 'bulleted',
              indent: 2,
              children: [{ text: 'Child' }],
            },
            { type: 'paragraph', children: [{ text: 'After' }] },
          ],
        },
      ]);
      expect(editor.key([0])).toBe(outerKey);
      expect(editor.key([0, 2])).toBe(bodyKey);
      expect(editor.key([0, 3])).toBe(childKey);
      expect(editor.read.transfer.nodes({ node: editor.key([0, 1])! })).toEqual(
        [editor.key([0, 1]), bodyKey, childKey]
      );
      expect(editor.read.selection()).toEqual({
        anchor: { path: [0, 1, 0], offset: 1 },
        focus: { path: [0, 1, 0], offset: 1 },
      });
      editor.api.history.undo();
      expect(editor.read.children()).toEqual(before);
      expect(
        editor.plugin(BaseDetailsPlugin).store.get('isOpen', innerKey)
      ).toBe(true);
    }
  );
});
