import {
  BaseParagraphPlugin,
  createEditor,
  createEditorView,
  definePlugin,
  ElementApi,
  NodeApi,
  PLUGINS,
  schema,
  SelectionApi,
} from '../../../core';
import { blockRelease } from '../../../internal/plugin/blockRelease';
import { MarkdownPlugin } from '../../../markdown';
import { BaseHeadingPlugin } from '../../basic-nodes/lib/BaseHeadingPlugins';
import { BaseCalloutPlugin } from '../../callout';
import { BaseIndentPlugin } from '../../indent';
import {
  BaseListPlugin,
  BulletedListRules,
} from '../../list/lib/BaseListPlugin';
import {
  added,
  convertAfterWrite,
  holder,
  NoteHolder,
  noteEditor,
  section,
} from '../__tests__/detailsConversionFixture';
import { BaseDetailsPlugin } from './BaseDetailsPlugin';

describe('Details list conversion', () => {
  it('converts a rootless node selection in a named view', () => {
    const editor = noteEditor();
    const main = editor.read.children();
    const view = createEditorView(editor, { root: 'note' });

    view.plugin(BaseListPlugin).update.toggle({
      type: 'bulleted',
      at: SelectionApi.nodes([[0, 0]], { mode: 'block' }),
    });

    expect({
      main: editor.read.children(),
      note: view.read.children(),
    }).toMatchObject({
      main,
      note: [
        {
          type: 'paragraph',
          listType: 'bulleted',
          indent: 1,
          children: [{ text: 'Title' }],
        },
        { type: 'paragraph', indent: 2, children: [{ text: 'Body' }] },
      ],
    });
  });

  it('joins an inserted item to the list in the caret root', () => {
    const editor = createEditor({
      plugins: [BaseListPlugin, NoteHolder],
      initialValue: {
        children: [
          {
            type: 'listNoteHolder',
            childRoots: { body: 'note' },
            children: [{ text: '' }],
          },
        ],
        roots: {
          note: [
            {
              type: 'paragraph',
              listType: 'bulleted',
              listId: 'note-list',
              indent: 1,
              children: [{ text: 'Item' }],
            },
          ],
        },
      },
    });
    const main = editor.read.children();
    editor.update.selection.set({ path: [0, 0], offset: 4, root: 'note' });

    editor.plugin(BaseListPlugin).update.insert({ type: 'bulleted' });

    expect({
      main: editor.read.children(),
      ids: editor.read.root('note').map((node) => node.listId),
    }).toEqual({ main, ids: ['note-list', 'note-list'] });
  });

  it('outdents a converted title with its body', () => {
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
    expect(editor.read.children().map((node) => node.indent)).toEqual([1, 2]);
    editor.plugin(BaseListPlugin).update.outdent({ at: [0] });
    expect(editor.read.children().map((node) => node.indent)).toEqual([
      undefined,
      1,
    ]);
    expect(editor.read.children()[0]).not.toHaveProperty('listType');
  });

  it('converts a title when its list marker is typed [EDIT-DETAILS-TITLE-LIST-001]', () => {
    const editor = createEditor({
      plugins: [
        BaseDetailsPlugin,
        BaseListPlugin.configure({
          inputRules: [BulletedListRules.markdown()],
        }),
      ],
      initialValue: [
        section('-Title', [
          { type: 'paragraph', children: [{ text: 'Body' }] },
        ]),
      ],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0, 0], offset: 1 },
        focus: { path: [0, 0, 0], offset: 1 },
      },
    });

    editor.update.text.insert(' ');

    expect(editor.read.children()).toMatchObject([
      {
        type: 'paragraph',
        indent: 1,
        listType: 'bulleted',
        children: [{ text: 'Title' }],
      },
      { type: 'paragraph', indent: 2, children: [{ text: 'Body' }] },
    ]);
  });

  it('keeps a typed list marker when the body cannot be indented', () => {
    const editor = createEditor({
      plugins: [
        BaseDetailsPlugin,
        BaseCalloutPlugin,
        BaseListPlugin.configure({
          inputRules: [BulletedListRules.markdown()],
        }),
      ],
      initialValue: [
        section('-Title', [{ type: 'callout', children: [{ text: 'Body' }] }]),
      ],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0, 0], offset: 1 },
        focus: { path: [0, 0, 0], offset: 1 },
      },
    });

    const [, body] = editor.read.children()[0].children;

    editor.update.text.insert(' ');

    expect(editor.read.children()).toEqual([section('- Title', [body])]);
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
      at: SelectionApi.nodes(
        [
          [0, 0],
          [0, 1, 0],
        ],
        { mode: 'block' }
      ),
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

  it('converts a title in a named document without editing the main one', () => {
    const editor = noteEditor();
    const main = editor.read.children();

    editor.plugin(BaseListPlugin).update.toggle({
      type: 'bulleted',
      at: SelectionApi.nodes([[0, 0]], { mode: 'block', root: 'note' }),
    });

    expect({
      main: editor.read.children(),
      note: editor.read.root('note'),
    }).toMatchObject({
      main,
      note: [
        {
          type: 'paragraph',
          listType: 'bulleted',
          indent: 1,
          children: [{ text: 'Title' }],
        },
        { type: 'paragraph', indent: 2, children: [{ text: 'Body' }] },
      ],
    });
  });

  it('retypes a converted title in a named document', () => {
    const editor = noteEditor();
    const list = editor.plugin(BaseListPlugin).update;

    list.toggle({
      type: 'bulleted',
      at: SelectionApi.nodes([[0, 0]], { mode: 'block', root: 'note' }),
    });
    list.toggle({
      type: 'numbered',
      at: SelectionApi.nodes([[0]], { mode: 'block', root: 'note' }),
    });

    expect(editor.read.root('note')[0]).toMatchObject({ listType: 'numbered' });
  });

  it('outdents a title with its family in a named document', () => {
    const editor = noteEditor();
    const main = editor.read.children();
    const note = (path: number[]) =>
      SelectionApi.nodes([path], { mode: 'block', root: 'note' });
    const indents = () => editor.read.root('note').map((node) => node.indent);

    editor.plugin(BaseListPlugin).update.toggle({
      type: 'bulleted',
      at: note([0, 0]),
    });
    const converted = indents();
    editor.plugin(BaseListPlugin).update.outdent({ at: note([0]) });

    expect({
      converted,
      main: editor.read.children(),
      note: indents(),
    }).toEqual({ converted: [1, 2], main, note: [undefined, 1] });
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

  it('preserves a body block the app indents as an indented child', () => {
    const editor = createEditor({
      plugins: [
        BaseDetailsPlugin,
        BaseIndentPlugin.configure({
          targetPlugins: [BaseParagraphPlugin, BaseCalloutPlugin],
        }),
        BaseListPlugin,
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

  it('refuses a selection around a section that cannot convert', () => {
    const editor = createEditor({
      plugins: [BaseDetailsPlugin, BaseListPlugin, BaseCalloutPlugin],
      initialValue: [
        { type: 'paragraph', children: [{ text: 'A' }] },
        section('Title', [{ type: 'callout', children: [{ text: 'Body' }] }]),
        section('Next'),
      ],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [2, 1, 0], offset: 0 },
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
      expect(editor.plugin(BaseDetailsPlugin).api.isOpen(innerKey)).toBe(true);
    }
  );
});

describe('Details in a named root', () => {
  const DetailsNote = definePlugin('detailsNote', {
    schema: {
      element: {
        void: 'block',
        contentRoots: {
          body: {
            ownership: 'exclusive',
            content: schema.content.group('block', {
              default: { type: 'paragraph' },
              min: 1,
            }),
          },
        },
      },
    },
  });

  it.each(['caret', 'nodes'] as const)(
    'wraps a %s target without editing main',
    (target) => {
      const editor = createEditor({
        plugins: [BaseDetailsPlugin, DetailsNote],
        initialValue: {
          children: [
            {
              type: 'detailsNote',
              childRoots: { body: 'note' },
              children: [{ text: '' }],
            },
          ],
          roots: {
            note: [{ type: 'paragraph', children: [{ text: 'Title' }] }],
          },
        },
      });
      const main = editor.read.children();
      editor.update.selection.set({ path: [0, 0], offset: 0, root: 'note' });

      if (target === 'caret') editor.plugin(BaseDetailsPlugin).update.wrap();
      else {
        createEditorView(editor, { root: 'note' })
          .plugin(BaseDetailsPlugin)
          .update.wrap({
            at: SelectionApi.nodes([[0]], { mode: 'block' }),
          });
      }

      expect({
        main: editor.read.children(),
        note: editor.read.root('note'),
      }).toEqual({
        main,
        note: [
          section('Title', [{ type: 'paragraph', children: [{ text: '' }] }]),
        ],
      });
    }
  );

  it('throws from the editor and the view when the caret root cannot hold Details', () => {
    const ParagraphNote = definePlugin('paragraphNote', {
      schema: {
        element: {
          void: 'block',
          contentRoots: {
            body: {
              ownership: 'exclusive',
              content: schema.content.type('paragraph', { min: 1 }),
            },
          },
        },
      },
    });
    const editor = createEditor({
      plugins: [BaseDetailsPlugin, ParagraphNote],
      initialValue: {
        children: [
          {
            type: 'paragraphNote',
            childRoots: { body: 'note' },
            children: [{ text: '' }],
          },
        ],
        roots: { note: [{ type: 'paragraph', children: [{ text: 'Title' }] }] },
      },
    });
    const before = editor.read.value();
    editor.update.selection.set({ path: [0, 0], offset: 0, root: 'note' });

    expect(() => editor.plugin(BaseDetailsPlugin).update.wrap()).toThrow();
    expect(() =>
      createEditorView(editor, { root: 'note' })
        .plugin(BaseDetailsPlugin)
        .update.wrap()
    ).toThrow();
    expect(editor.read.value()).toEqual(before);
  });
});

describe('a Details title conversion that cannot finish', () => {
  it.each([
    [
      'a parent that holds one block',
      [holder('oneHolder', { max: 1 })],
      [{ type: 'oneHolder', children: [section('A')] }],
      [0, 0, 0],
    ],
    [
      'a parent that refuses a body type',
      [
        holder('flowHolder', {}),
        BaseCalloutPlugin,
        BaseIndentPlugin.configure({
          targetPlugins: [BaseParagraphPlugin, BaseCalloutPlugin],
        }),
      ],
      [
        {
          type: 'flowHolder',
          children: [
            section('A', [{ type: 'callout', children: [{ text: 'Body' }] }]),
          ],
        },
      ],
      [0, 0, 0],
    ],
    [
      'an indent cap the body would pass',
      [BaseIndentPlugin.configure({ initialState: { indentMax: 1 } })],
      [section('A')],
      [0, 0],
    ],
  ] as const)('leaves %s unconverted', (_, plugins, initialValue, at) => {
    const editor = createEditor({
      plugins: [BaseDetailsPlugin, BaseListPlugin, ...plugins],
      initialValue,
    });
    const before = editor.read.children();

    expect(
      convertAfterWrite(editor, (tx) =>
        tx.plugin(BaseListPlugin).toggle({ at: [...at], type: 'bulleted' })
      )
    ).toBe(false);
    expect(editor.read.children()).toEqual([...before, added]);
  });

  it('checks two sibling sections against their parent together', () => {
    const editor = createEditor({
      plugins: [
        BaseDetailsPlugin,
        BaseListPlugin,
        holder('threeHolder', { max: 3 }),
      ],
      initialValue: [
        { type: 'threeHolder', children: [section('A'), section('B')] },
      ],
    });
    const before = editor.read.children();

    expect(
      convertAfterWrite(editor, (tx) =>
        tx.plugin(BaseListPlugin).toggle({
          at: SelectionApi.nodes(
            [
              [0, 0, 0],
              [0, 1, 0],
            ],
            { mode: 'block' }
          ),
          type: 'bulleted',
        })
      )
    ).toBe(false);
    expect(editor.read.children()).toEqual([...before, added]);
  });

  it('converts two sibling sections that land exactly at their parent limit', () => {
    const editor = createEditor({
      plugins: [
        BaseDetailsPlugin,
        BaseListPlugin,
        holder('fourHolder', { max: 4 }),
      ],
      initialValue: [
        { type: 'fourHolder', children: [section('A'), section('B')] },
      ],
    });

    expect(
      editor.plugin(BaseListPlugin).update.toggle({
        at: SelectionApi.nodes(
          [
            [0, 0, 0],
            [0, 1, 0],
          ],
          { mode: 'block' }
        ),
        type: 'bulleted',
      })
    ).toBe(true);
    expect(
      editor.read.children()[0].children.map((node) => node.indent)
    ).toEqual([1, 2, 1, 2]);
  });

  it('counts the unchanged block between two sections against the parent limit', () => {
    const value = [
      {
        type: 'fourHolder',
        children: [
          section('A'),
          { type: 'paragraph', children: [{ text: 'Mid' }] },
          section('B'),
        ],
      },
    ];
    const editor = createEditor({
      plugins: [
        BaseDetailsPlugin,
        BaseListPlugin,
        holder('fourHolder', { max: 4 }),
      ],
      initialValue: value,
    });

    expect({
      converted: editor.plugin(BaseListPlugin).update.toggle({
        at: SelectionApi.nodes(
          [
            [0, 0, 0],
            [0, 2, 0],
          ],
          { mode: 'block' }
        ),
        type: 'bulleted',
      }),
      value: editor.read.children(),
    }).toMatchObject({ converted: false, value });
  });

  it('converts two sections around an unchanged block in order', () => {
    const editor = createEditor({
      plugins: [
        BaseDetailsPlugin,
        BaseListPlugin,
        holder('fiveHolder', { max: 5 }),
      ],
      initialValue: [
        {
          type: 'fiveHolder',
          children: [
            section('A'),
            { type: 'paragraph', children: [{ text: 'Mid' }] },
            section('B'),
          ],
        },
      ],
    });

    editor.plugin(BaseListPlugin).update.toggle({
      at: SelectionApi.nodes(
        [
          [0, 0, 0],
          [0, 2, 0],
        ],
        { mode: 'block' }
      ),
      type: 'bulleted',
    });

    expect(
      editor.read
        .children()[0]
        .children.map((node) => [NodeApi.string(node), node.indent])
    ).toEqual([
      ['A', 1],
      ['A body', 2],
      ['Mid', undefined],
      ['B', 1],
      ['B body', 2],
    ]);
  });

  it('converts the title of any container that contributes a release', () => {
    const BoxTitle = definePlugin('boxTitle', {
      schema: { element: { content: schema.content.text() } },
    });
    const Box = definePlugin('box', {
      dependencies: [BaseParagraphPlugin, BoxTitle],
      schema: {
        element: {
          blockContent: true,
          content: schema.content.any(
            [
              schema.content.type('boxTitle').allowed,
              schema.content.type('paragraph').allowed,
            ],
            { default: { type: 'paragraph' }, min: 1 }
          ),
        },
      },
    }).extend(({ schema: { type } }) => ({
      contributions: [
        blockRelease.of((tx, [node, path]) => {
          const containerPath = path.slice(0, -1);
          const container =
            containerPath.length > 0
              ? tx.nodes.get(containerPath, {
                  match: ElementApi.isElement,
                })
              : undefined;
          const box = tx.key(containerPath);
          const key = tx.key(path);

          if (
            !container ||
            container[0].type !== type ||
            path.at(-1) !== 0 ||
            !box ||
            !key
          ) {
            return null;
          }

          const block = { ...node, type: 'paragraph' };

          return {
            apply: (writer) => {
              writer.nodes.set({ type: 'paragraph' }, { at: key });
              writer.nodes.unwrap({ at: box });

              return true;
            },
            block,
            container,
            fit: container[0].children.map((child) =>
              child === node ? block : child
            ),
            key,
          };
        }),
      ],
    }));
    const editor = createEditor({
      plugins: [Box, BaseListPlugin],
      initialValue: [
        {
          type: 'box',
          children: [
            { type: 'boxTitle', children: [{ text: 'Box' }] },
            { type: 'paragraph', children: [{ text: 'Inside' }] },
          ],
        },
      ],
    });

    editor
      .plugin(BaseListPlugin)
      .update.toggle({ at: [0, 0], type: 'bulleted' });

    expect(editor.read.children()).toMatchObject([
      {
        type: 'paragraph',
        indent: 1,
        listType: 'bulleted',
        children: [{ text: 'Box' }],
      },
      { type: 'paragraph', indent: 2, children: [{ text: 'Inside' }] },
    ]);
  });
});

describe('a leveled Details title', () => {
  const leveled = [
    {
      type: 'details',
      children: [
        { type: 'summary', level: 2, children: [{ text: 'Title' }] },
        { type: 'paragraph', children: [{ text: 'Body' }] },
      ],
    },
  ];

  it('becomes a heading list item under the targets ListKit installs', () => {
    const editor = createEditor({
      plugins: [
        BaseDetailsPlugin,
        BaseHeadingPlugin,
        BaseListPlugin.configure({
          targetPlugins: [
            PLUGINS.paragraph,
            PLUGINS.heading,
            PLUGINS.blockquote,
            PLUGINS.codeBlock,
            PLUGINS.details,
            PLUGINS.image,
          ],
        }),
      ],
      initialValue: leveled,
    });

    expect(
      editor
        .plugin(BaseListPlugin)
        .update.toggle({ at: [0, 0], type: 'bulleted' })
    ).toBe(true);
    expect(editor.read.children()).toMatchObject([
      { type: 'heading', level: 2, listType: 'bulleted', indent: 1 },
      { type: 'paragraph', indent: 2 },
    ]);
  });

  it('declines, as a heading does, under the default targets', () => {
    const editor = createEditor({
      plugins: [BaseDetailsPlugin, BaseHeadingPlugin, BaseListPlugin],
      initialValue: leveled,
    });
    const before = editor.read.children();

    expect(
      editor
        .plugin(BaseListPlugin)
        .update.toggle({ at: [0, 0], type: 'bulleted' })
    ).toBe(false);
    expect(editor.read.children()).toEqual(before);
  });
});

describe('Markdown of a converted Details', () => {
  it.each([
    ['keeps a plain body inside the item', {}, {}, '* Title\n\n  Body\n', []],
    [
      'exports a leveled title as a heading list item exports today',
      { level: 2 },
      {},
      '## Title\n\nBody\n',
      ['indent', 'listId', 'listType', 'indent'],
    ],
    [
      'exports an extra-indented body as a deeper paragraph exports today',
      {},
      { indent: 2 },
      '* Title\n\nBody\n',
      ['indent'],
    ],
  ])('%s', (_, title, body, markdown, omitted) => {
    const editor = createEditor({
      plugins: [
        BaseDetailsPlugin,
        BaseHeadingPlugin,
        BaseIndentPlugin.configure({
          targetPlugins: [BaseParagraphPlugin, BaseHeadingPlugin],
        }),
        BaseListPlugin.configure({
          targetPlugins: [BaseParagraphPlugin, BaseHeadingPlugin],
        }),
        MarkdownPlugin,
      ],
      initialValue: [
        {
          type: 'details',
          children: [
            { type: 'summary', children: [{ text: 'Title' }], ...title },
            { type: 'paragraph', children: [{ text: 'Body' }], ...body },
          ],
        },
      ],
    });

    editor
      .plugin(BaseListPlugin)
      .update.toggle({ at: [0, 0], type: 'bulleted' });
    const result = editor.api.markdown.serialize();

    expect({
      markdown: result.ok && result.data,
      omitted: result.diagnostics.map((diagnostic) =>
        'key' in diagnostic ? diagnostic.key : diagnostic.code
      ),
    }).toEqual({ markdown, omitted });
  });
});
