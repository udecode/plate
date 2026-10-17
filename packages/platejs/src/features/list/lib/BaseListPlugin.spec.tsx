import {
  BaseParagraphPlugin,
  ContentSlice,
  createEditor as createProductEditor,
  createEditorView,
  definePlugin,
  editorCommands,
  ElementApi,
  NodeApi,
  PLUGINS,
  property,
  schema,
  SelectionApi,
  transferVeto,
  type CreateEditorOptions,
  type InitialValue,
  type Value,
} from '../../../core';
import { getPlateRuntime } from '../../../internal/plugin/compilePlateModel';
import { ElementIdPlugin } from '../../../lib/plugins/element-id/ElementIdPlugin';
import { MarkdownPlugin } from '../../../markdown';
import { nameListIds } from '../../../markdown/lib/__tests__/nameListIds';
import { dispatchPlateShortcut } from '../../../react/utils/dispatchPlateShortcut.internal';
import {
  BaseBlockquotePlugin,
  BaseHorizontalRulePlugin,
} from '../../basic-nodes/lib/BaseBlockPlugins';
import { BaseHeadingPlugin } from '../../basic-nodes/lib/BaseHeadingPlugins';
import { BaseBoldPlugin } from '../../basic-nodes/lib/BaseMarkPlugins';
import { BaseTextAlignPlugin } from '../../basic-styles/lib/BaseStylePlugins';
import { BaseCalloutPlugin } from '../../callout/lib/BaseCalloutPlugin';
import { BaseCodeBlockPlugin } from '../../code-block';
import { BaseDetailsPlugin } from '../../details/lib/BaseDetailsPlugin';
import { BaseIndentPlugin } from '../../indent';
import { BaseColumnPlugin } from '../../layout/lib/BaseColumnPlugin';
import { BaseAudioPlugin, BaseImagePlugin } from '../../media';
import { BaseTablePlugin } from '../../table';
import listPasteCases from './__tests__/list-paste.fixture.json';
import {
  BaseListPlugin,
  BULLETED_LIST_STYLES,
  BulletedListRules,
  isOrderedList,
  ListStyle,
  ListType,
  OrderedListRules,
  TaskListRules,
} from './BaseListPlugin';
import { adoptMetrics } from './listIdentity.internal';
import { getListIndexMetrics } from './listIndex.internal';

const createEditor = (
  options: Omit<CreateEditorOptions, 'plugins'> & {
    initialValue?: InitialValue<Value>;
  } = {}
) =>
  createProductEditor({
    initialValue: options.initialValue ?? [
      { children: [{ text: 'Item' }], type: 'paragraph' },
    ],
    plugins: [BaseListPlugin],
    selection:
      options.selection ??
      ({
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      } as const),
    ...options,
  });

const parseHtmlChildren = (
  editor: ReturnType<typeof createEditor>,
  html: string
) => {
  const result = editor.api.html.parse(html);

  if (!result.ok) throw new TypeError('Expected decoded HTML document');

  return result.document.children;
};

const decodedNumbers = (html: string) => {
  const children = parseHtmlChildren(
    createEditor({ selection: undefined }),
    html
  );
  const loaded = createEditor({
    initialValue: children as never,
    selection: undefined,
  });

  return loaded.read
    .children()
    .map((_, index) => loaded.read.list.ordinal([index]) ?? null);
};

describe('BaseListPlugin canonical model', () => {
  it('accepts signed integer starts and rejects fractional ordinals', () => {
    const editor = createEditor();
    const document = (listStart: number, listRestart: number) => ({
      children: [
        {
          children: [{ text: 'Item' }],
          indent: 1,
          listRestart,
          listStart,
          listType: 'numbered',
          type: 'paragraph',
        },
      ],
    });

    expect(() =>
      editor.read.schema.assertDocument(document(-3, 0))
    ).not.toThrow();
    expect(() => editor.read.schema.assertDocument(document(1.5, 2))).toThrow(
      /listStart.*validation/i
    );
  });

  it('repairs incompatible list properties and keeps starts latent', () => {
    const editor = createEditor({
      initialValue: [
        {
          checked: true,
          children: [{ text: 'Bulleted' }],
          indent: 1,
          listStart: 4,
          listType: 'bulleted',
          type: 'paragraph',
        },
        {
          checked: true,
          children: [{ text: 'Numbered' }],
          indent: 1,
          listRestart: 5,
          listStart: 4,
          listType: 'numbered',
          type: 'paragraph',
        },
        {
          children: [{ text: 'Task' }],
          indent: 1,
          listStart: 2,
          listStyle: 'disc',
          listType: 'task',
          type: 'paragraph',
        },
        {
          checked: true,
          children: [{ text: 'Plain' }],
          listRestart: 3,
          listStyle: 'square',
          type: 'paragraph',
        },
      ],
    });

    editor.update.value.repair();

    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'Bulleted' }],
        indent: 1,
        listStart: 4,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Numbered' }],
        indent: 1,
        listRestart: 5,
        listStart: 4,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Task' }],
        indent: 1,
        listStart: 2,
        listType: 'task',
        type: 'paragraph',
      },
      { children: [{ text: 'Plain' }], listRestart: 3, type: 'paragraph' },
    ]);
  });

  it('keeps single-item toggles inside heading sequence boundaries', () => {
    const editor = createProductEditor({
      initialValue: [
        {
          children: [{ text: 'Paragraph' }],
          indent: 1,
          listType: 'numbered',
          type: 'paragraph',
        },
        {
          children: [{ text: 'Heading' }],
          indent: 1,
          level: 1,
          listType: 'numbered',
          type: 'heading',
        },
      ],
      plugins: [
        BaseHeadingPlugin,
        BaseListPlugin.configure({
          targetPlugins: [BaseParagraphPlugin, BaseHeadingPlugin],
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
    });

    editor.update.list.toggle({ type: ListType.Bulleted });

    expect(editor.read.children()).toMatchObject([
      { listType: 'bulleted', type: 'paragraph' },
      { listType: 'numbered', type: 'heading' },
    ]);
  });

  it.each(['Tab', 'Shift+Tab'])(
    'moves a named-root list family with %s',
    (key) => {
      const reverse = key === 'Shift+Tab';
      const Note = definePlugin('listKeyNote', {
        schema: {
          element: {
            void: 'block',
            contentRoots: {
              body: schema.content.group('block', {
                default: { type: 'paragraph' },
                min: 1,
              }),
            },
          },
        },
      });
      const editor = createProductEditor({
        plugins: [BaseListPlugin, Note],
        initialValue: {
          children: [
            {
              type: 'listKeyNote',
              childRoots: { body: 'note' },
              children: [{ text: '' }],
            },
          ],
          roots: {
            note: [
              {
                type: 'paragraph',
                listType: 'bulleted',
                indent: reverse ? 2 : 1,
                children: [{ text: 'Item' }],
              },
              {
                type: 'paragraph',
                indent: reverse ? 3 : 2,
                children: [{ text: 'Body' }],
              },
            ],
          },
        },
      });
      const main = editor.read.children();
      editor.update.selection.set({ path: [0, 0], offset: 0, root: 'note' });

      dispatchPlateShortcut(
        editor,
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          code: 'Tab',
          key: 'Tab',
          shiftKey: reverse,
        }),
        'keydown',
        getPlateRuntime(editor).shortcutTable
      );

      expect({
        main: editor.read.children(),
        depths: editor.read.root('note').map((node) => node.indent),
      }).toEqual({ main, depths: reverse ? [1, 2] : [2, 3] });
    }
  );

  it('lifts a root item on Shift+Tab only out of the blockquote plugin', () => {
    const untab = (quote: typeof BaseBlockquotePlugin) => {
      const editor = createProductEditor({
        initialValue: [
          {
            children: [
              {
                children: [{ text: 'Item' }],
                indent: 1,
                listType: 'bulleted',
                type: 'paragraph',
              },
            ],
            type: 'blockquote',
          },
        ],
        plugins: [BaseParagraphPlugin, quote, BaseListPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [0, 0, 0] },
          focus: { offset: 0, path: [0, 0, 0] },
        },
      });

      dispatchPlateShortcut(
        editor,
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          code: 'Tab',
          key: 'Tab',
          shiftKey: true,
        }),
        'keydown',
        getPlateRuntime(editor).shortcutTable
      );

      return editor.read.children();
    };

    expect(untab(BaseBlockquotePlugin)).toEqual([
      { children: [{ text: 'Item' }], type: 'paragraph' },
    ]);
    expect(
      untab(
        definePlugin('blockquote', {
          schema: { element: { content: schema.content.group('block') } },
        }) as never
      )
    ).toMatchObject([
      {
        children: [{ listType: 'bulleted', type: 'paragraph' }],
        type: 'blockquote',
      },
    ]);
  });

  it('draws no heading boundary for a plugin that only shares the heading name', () => {
    const HeadingPlugin = definePlugin(PLUGINS.heading, {
      schema: { element: schema.element.textBlock() },
    });
    const editor = createProductEditor({
      initialValue: [
        {
          children: [{ text: 'Paragraph' }],
          indent: 1,
          listType: 'numbered',
          type: 'paragraph',
        },
        {
          children: [{ text: 'Heading' }],
          indent: 1,
          listType: 'numbered',
          type: 'heading',
        },
      ],
      plugins: [
        HeadingPlugin,
        BaseListPlugin.configure({
          targetPlugins: [BaseParagraphPlugin, HeadingPlugin],
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
    });

    editor.update.list.toggle({ type: ListType.Bulleted });

    expect(editor.read.children()).toMatchObject([
      { listType: 'bulleted', type: 'paragraph' },
      { listType: 'bulleted', type: 'heading' },
    ]);
  });

  it('toggles a bulleted list without persisting a default marker style', () => {
    const editor = createEditor();

    editor.update.list.toggle({ type: ListType.Bulleted });

    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'Item' }],
        indent: 1,
        listId: expect.any(String),
        listType: 'bulleted',
        type: 'paragraph',
      },
    ]);
  });

  it('toggles only exact node selection members', () => {
    const editor = createEditor({
      selection: SelectionApi.nodes([[0], [2]], { mode: 'block' }),
      initialValue: [
        { children: [{ text: 'one' }], type: 'paragraph' },
        { children: [{ text: 'middle' }], type: 'paragraph' },
        { children: [{ text: 'three' }], type: 'paragraph' },
      ],
    });

    editor.update.list.toggle({ type: ListType.Bulleted });

    expect(editor.read.children()).toMatchObject([
      { indent: 1, listType: 'bulleted', type: 'paragraph' },
      { type: 'paragraph' },
      { indent: 1, listType: 'bulleted', type: 'paragraph' },
    ]);
    expect(editor.read.children()[1]).not.toHaveProperty('listType');
  });

  it('stores a custom marker separately from list kind', () => {
    const editor = createEditor();

    editor.update.list.toggle({
      listStyle: ListStyle.Square,
      type: ListType.Bulleted,
    });

    expect(editor.read.children()[0]).toMatchObject({
      indent: 1,
      listStyle: 'square',
      listType: 'bulleted',
    });
  });

  it('toggles a custom marker off when the marker is omitted', () => {
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'Item' }],
          indent: 1,
          listStyle: 'square',
          listType: 'bulleted',
          type: 'paragraph',
        },
      ],
    });

    editor.update.list.toggle({ type: ListType.Bulleted });

    expect(editor.read.children()[0]).toEqual({
      children: [{ text: 'Item' }],
      type: 'paragraph',
    });
  });

  it('stores an ordered start only on the explicit boundary', () => {
    const editor = createEditor({
      initialValue: [
        { children: [{ text: 'One' }], type: 'paragraph' },
        { children: [{ text: 'Two' }], type: 'paragraph' },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [1, 0] },
      },
    });

    editor.update.list.toggle({
      listStart: 4,
      type: ListType.Numbered,
    });

    const id = editor.read.children()[0].listId;

    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'One' }],
        indent: 1,
        listId: id,
        listStart: 4,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Two' }],
        indent: 1,
        listId: id,
        listType: 'numbered',
        type: 'paragraph',
      },
    ]);
  });

  it('stores checked only on task items', () => {
    const editor = createEditor();

    editor.update.list.toggle({ type: ListType.Task });

    expect(editor.read.children()[0]).toMatchObject({
      checked: false,
      listType: 'task',
    });

    editor.update.list.toggle({ type: ListType.Numbered });

    expect(editor.read.children()[0]).toMatchObject({
      listType: 'numbered',
    });
    expect(editor.read.children()[0]).not.toHaveProperty('checked');
  });

  it('toggles the same list kind back to a plain block', () => {
    const editor = createEditor();

    editor.update.list.toggle({ type: ListType.Bulleted });
    editor.update.list.toggle({ type: ListType.Bulleted });

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'Item' }], type: 'paragraph' },
    ]);
  });

  it('round-trips a plain block indent when toggling a list', () => {
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'Indented' }],
          indent: 3,
          type: 'paragraph',
        },
      ],
    });

    editor.update.list.toggle({ type: ListType.Bulleted });
    expect(editor.read.children()[0]).toMatchObject({
      indent: 4,
      listType: 'bulleted',
    });

    editor.update.list.toggle({ type: ListType.Bulleted });
    expect(editor.read.children()[0]).toEqual({
      children: [{ text: 'Indented' }],
      indent: 3,
      type: 'paragraph',
    });
  });

  it('restarts numbering at the selected item', () => {
    const editor = createEditor({
      initialValue: ['One', 'Two', 'Three'].map((text) => ({
        children: [{ text }],
        indent: 1,
        listType: 'numbered' as const,
        type: 'paragraph',
      })),
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 3, path: [1, 0] },
      },
    });

    editor.update.list.restart({ start: 7 });

    expect([0, 1, 2].map((index) => editor.read.list.ordinal([index]))).toEqual(
      [1, 7, 8]
    );
  });

  it('continues numbering again after a restart', () => {
    const editor = createEditor({
      initialValue: ['One', 'Two', 'Three'].map((text) => ({
        children: [{ text }],
        indent: 1,
        listType: 'numbered' as const,
        type: 'paragraph',
      })),
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 3, path: [1, 0] },
      },
    });

    editor.update.list.restart();
    editor.update.list.continue();

    expect([0, 1, 2].map((index) => editor.read.list.ordinal([index]))).toEqual(
      [1, 2, 3]
    );
  });

  it('keeps a conditional start latent until the item becomes first', () => {
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'Five' }],
          indent: 1,
          listStart: 5,
          listType: 'numbered',
          type: 'paragraph',
        },
        {
          children: [{ text: 'Six' }],
          indent: 1,
          listStart: 2,
          listType: 'numbered',
          type: 'paragraph',
        },
      ],
    });

    expect(editor.read.list.ordinal(editor.read.children()[1])).toBe(6);

    editor.update.nodes.remove({ at: [0] });

    expect(editor.read.children()[0]).toHaveProperty('listStart', 2);
    expect(editor.read.list.ordinal(editor.read.children()[0])).toBe(2);
  });

  it('normalizes explicit default marker styles', () => {
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'One' }],
          indent: 1,
          listType: 'numbered',
          type: 'paragraph',
        },
        { children: [{ text: 'Two' }], type: 'paragraph' },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 3, path: [1, 0] },
      },
    });

    editor.update.list.toggle({
      listStyle: ListStyle.Decimal,
      type: ListType.Numbered,
    });

    expect(editor.read.children()[1]).not.toHaveProperty('listStyle');
    expect(editor.read.list.ordinal(editor.read.children()[1])).toBe(2);
  });

  it('clears an explicit start from the sibling created by a split', () => {
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'OneTwo' }],
          indent: 1,
          listStart: 7,
          listType: 'numbered',
          type: 'paragraph',
        },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
    });

    editor.update.break.insert();

    expect(editor.read.children()[0]).toHaveProperty('listStart', 7);
    expect(editor.read.children()[1]).not.toHaveProperty('listStart');
    expect(editor.read.list.ordinal(editor.read.children()[1])).toBe(8);
  });

  it('drops an explicit start for direct node splits', () => {
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'OneTwo' }],
          indent: 1,
          listStart: 7,
          listType: 'numbered',
          type: 'paragraph',
        },
      ],
    });

    editor.update.nodes.split({
      at: { offset: 3, path: [0, 0] },
    });

    expect(editor.read.children()[0]).toHaveProperty('listStart', 7);
    expect(editor.read.children()[1]).not.toHaveProperty('listStart');
  });

  it('drops a forced restart from split siblings', () => {
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'OneTwo' }],
          indent: 1,
          listRestart: 4,
          listType: 'numbered',
          type: 'paragraph',
        },
      ],
    });

    editor.update.nodes.split({
      at: { offset: 3, path: [0, 0] },
    });

    expect(editor.read.children()[0]).toHaveProperty('listRestart', 4);
    expect(editor.read.children()[1]).not.toHaveProperty('listRestart');
  });

  it('keeps a new task checked after Enter at the end of a checked task [EDIT-TASK-ENTER-001]', () => {
    const editor = createEditor({
      initialValue: [
        {
          checked: true,
          children: [{ text: 'done' }],
          indent: 1,
          listType: 'task',
          type: 'paragraph',
        },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
    });

    editor.update.break.insert();

    expect(editor.read.children()[1]).toMatchObject({
      checked: true,
      children: [{ text: '' }],
      listType: 'task',
    });
  });

  it('changes one list sequence without crossing explicit boundaries', () => {
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'One' }],
          indent: 1,
          listType: 'numbered',
          type: 'paragraph',
        },
        {
          children: [{ text: 'Two' }],
          indent: 1,
          listType: 'numbered',
          type: 'paragraph',
        },
        {
          children: [{ text: 'Seven' }],
          indent: 1,
          listRestart: 7,
          listType: 'numbered',
          type: 'paragraph',
        },
        {
          children: [{ text: 'Eight' }],
          indent: 1,
          listType: 'numbered',
          type: 'paragraph',
        },
        {
          children: [{ text: 'One again' }],
          indent: 1,
          listRestart: 1,
          listType: 'numbered',
          type: 'paragraph',
        },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [2, 0] },
        focus: { offset: 5, path: [2, 0] },
      },
    });

    editor.update.list.toggle({ type: ListType.Bulleted });

    expect(editor.read.children().map((node) => node.listType)).toEqual([
      'numbered',
      'numbered',
      'bulleted',
      'bulleted',
      'numbered',
    ]);
  });

  it('keeps explicit start boundaries stable during ordinary edits', () => {
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'One' }],
          indent: 1,
          listRestart: 7,
          listType: 'numbered',
          type: 'paragraph',
        },
        {
          children: [{ text: 'Two' }],
          indent: 1,
          listType: 'numbered',
          type: 'paragraph',
        },
      ],
    });

    editor.update.text.insert('!', { at: { offset: 3, path: [1, 0] } });

    expect(editor.read.children()[0]).toHaveProperty('listRestart', 7);
    expect(editor.read.children()[1]).not.toHaveProperty('listStart');
  });

  it('derives display ordinals without writing them into list items', () => {
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'Four' }],
          indent: 1,
          listStart: 4,
          listType: 'numbered',
          type: 'paragraph',
        },
        {
          children: [{ text: 'Five' }],
          indent: 1,
          listType: 'numbered',
          type: 'paragraph',
        },
      ],
    });
    const [first, second] = editor.read.children();

    expect(editor.read.list.ordinal(first)).toBe(4);
    expect(editor.read.list.ordinal(second)).toBe(5);
    expect(second).not.toHaveProperty('listStart');
  });

  it('reads an ordinal by path and none for an item outside the root', () => {
    const item = () => ({
      children: [{ text: 'Item' }],
      indent: 1,
      listType: 'numbered',
      type: 'paragraph',
    });
    const editor = createEditor({
      initialValue: [{ ...item(), listStart: 4 }, item()],
    });

    expect(editor.read.list.ordinal([1])).toBe(5);
    expect(editor.read.list.ordinal([2])).toBeUndefined();
    expect(editor.read.list.ordinal(item())).toBeUndefined();
  });

  it('treats an omitted root indent as level one', () => {
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'One' }],
          listType: 'numbered',
          type: 'paragraph',
        },
        {
          children: [{ text: 'Two' }],
          indent: 1,
          listType: 'numbered',
          type: 'paragraph',
        },
      ],
    });

    expect(editor.read.list.ordinal(editor.read.children()[0])).toBe(1);
    expect(editor.read.list.ordinal(editor.read.children()[1])).toBe(2);
  });

  it('treats an explicit default marker as the canonical sequence', () => {
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'One' }],
          indent: 1,
          listStyle: 'decimal',
          listType: 'numbered',
          type: 'paragraph',
        },
        {
          children: [{ text: 'Two' }],
          indent: 1,
          listType: 'numbered',
          type: 'paragraph',
        },
      ],
    });

    expect(editor.read.list.ordinal(editor.read.children()[1])).toBe(2);
  });

  it('starts a numbered sequence at one after a non-list block', () => {
    const editor = createEditor({
      initialValue: [
        { children: [{ text: 'Body' }], type: 'paragraph' },
        {
          children: [{ text: 'One' }],
          indent: 1,
          listType: 'numbered',
          type: 'paragraph',
        },
      ],
    });

    expect(editor.read.list.ordinal(editor.read.children()[1])).toBe(1);
  });

  it('invalidates ordinal caches inside a staged transaction', () => {
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'One' }],
          indent: 1,
          listType: 'numbered',
          type: 'paragraph',
        },
        {
          children: [{ text: 'Two' }],
          indent: 1,
          listType: 'numbered',
          type: 'paragraph',
        },
      ],
    });

    editor.update((tx) => {
      const second = tx.nodes.get([1])?.[0];

      if (!second || !ElementApi.isElement(second)) {
        throw new TypeError('Expected second list item');
      }

      expect(tx.list.ordinal(second)).toBe(2);
      tx.nodes.insert(
        {
          children: [{ text: 'Zero' }],
          indent: 1,
          listType: 'numbered',
          type: 'paragraph',
        },
        { at: [0] }
      );
      expect(tx.list.ordinal(second)).toBe(3);
    });
  });

  it.each([
    {
      listId: 'a',
      listLevels: { '1': { start: 4 } },
      listRestart: 2,
      listStart: 3,
      listStyle: 'lower-alpha',
      listType: 'numbered',
    },
    { checked: true, listId: 'a', listType: 'task' },
  ])('outdents a root $listType item to a plain paragraph', (facts) => {
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'Item' }],
          indent: 1,
          type: 'paragraph',
          ...facts,
        },
      ],
    });

    expect(editor.read.children()[0]).toMatchObject(facts);

    editor.update.list.outdent();
    expect(editor.read.children()[0]).toEqual({
      children: [{ text: 'Item' }],
      type: 'paragraph',
    });
  });

  it.each([
    [
      'Backspace at its start',
      'Two',
      (editor: ReturnType<typeof createEditor>) =>
        editor.update.text.deleteBackward(),
    ],
    [
      'Enter on it while empty',
      '',
      (editor: ReturnType<typeof createEditor>) => editor.update.break.insert(),
    ],
    [
      'an outdent',
      'Two',
      (editor: ReturnType<typeof createEditor>) => editor.update.list.outdent(),
    ],
    [
      'a toggle',
      'Two',
      (editor: ReturnType<typeof createEditor>) =>
        editor.update.list.toggle({ type: ListType.Numbered }),
    ],
  ] as const)(
    'keeps the next items counting after %s takes an item out [EDIT-LIST-ID-403]',
    (_label, text, takeOut) => {
      const item = (value: string) => ({
        children: [{ text: value }],
        indent: 1,
        listType: ListType.Numbered,
        type: 'paragraph',
      });
      const editor = createEditor({
        initialValue: [item('One'), item(text), item('Three')],
        selection: {
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 0, path: [1, 0] },
          kind: 'text',
        },
      });

      takeOut(editor);

      expect(
        editor.read
          .children()
          .map((node, index) =>
            node.listType ? editor.read.list.ordinal([index]) : null
          )
      ).toEqual([1, null, 2]);
    }
  );

  it.each([
    [
      'Backspace at its start [EDIT-LIST-FAMILY-LIFT-001]',
      'Item',
      (editor: ReturnType<typeof createEditor>) =>
        editor.update.text.deleteBackward(),
    ],
    [
      'Enter on it while empty [EDIT-LIST-FAMILY-LIFT-001]',
      '',
      (editor: ReturnType<typeof createEditor>) => editor.update.break.insert(),
    ],
  ] as const)(
    'takes a root item out of the list with its body on %s',
    (_label, text, takeOut) => {
      const editor = createEditor({
        initialValue: [
          {
            children: [{ text }],
            indent: 1,
            listType: ListType.Bulleted,
            type: 'paragraph',
          },
          { children: [{ text: 'Body' }], indent: 2, type: 'paragraph' },
        ],
        selection: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
          kind: 'text',
        },
      });

      takeOut(editor);

      expect(
        editor.read
          .children()
          .map(({ indent, listType }) => ({ indent, listType }))
      ).toEqual([
        { indent: undefined, listType: undefined },
        { indent: 1, listType: undefined },
      ]);
    }
  );

  it.each([
    [
      'Backspace at its start',
      'Item',
      (editor: ReturnType<typeof createEditor>) =>
        editor.update.text.deleteBackward(),
    ],
    [
      'Enter on it while empty',
      '',
      (editor: ReturnType<typeof createEditor>) => editor.update.break.insert(),
    ],
  ] as const)(
    'takes an item with no indent out of the list on %s',
    (_label, text, takeOut) => {
      const editor = createEditor({
        initialValue: [
          {
            children: [{ text }],
            listType: ListType.Bulleted,
            type: 'paragraph',
          },
        ],
        selection: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
          kind: 'text',
        },
      });

      takeOut(editor);

      expect(editor.read.children()).toEqual([
        { children: [{ text }], type: 'paragraph' },
      ]);
    }
  );

  it('reads active state by kind and optional marker', () => {
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'Item' }],
          indent: 1,
          listStyle: 'square',
          listType: 'bulleted',
          type: 'paragraph',
        },
      ],
    });

    expect(
      editor.read.list.isActive({
        style: ListStyle.Square,
        type: ListType.Bulleted,
      })
    ).toBe(true);
    expect(editor.read.list.isActive({ type: ListType.Numbered })).toBe(false);
  });

  it('decodes HTML starts only on the first ordered item', () => {
    const editor = createEditor({ selection: undefined });

    expect(
      parseHtmlChildren(
        editor,
        '<ol start="4"><li>One</li><li>Two</li></ol><ul style="list-style-type: square"><li>Three</li></ul>'
      )
    ).toMatchObject([
      {
        children: [{ text: 'One' }],
        listStart: 4,
        listType: 'numbered',
      },
      {
        children: [{ text: 'Two' }],
        listType: 'numbered',
      },
      {
        children: [{ text: 'Three' }],
        listStyle: 'square',
        listType: 'bulleted',
      },
    ]);
  });

  it.each([
    ['only on the wrapper', '<li>A</li>'],
    [
      'on the wrapper and the item, as the static list renders it',
      `<li data-list-id="a" data-list-levels='{"2":{"start":3}}' data-list-type="numbered">A</li>`,
    ],
  ])(
    'takes list identity from a list wrapper %s without reporting it lost',
    (_name, listItem) => {
      const result = createEditor({ selection: undefined }).api.html.parse(
        `<ol data-list-id="a" data-list-levels='{"2":{"start":3}}'>${listItem}</ol>`
      );

      expect(result.ok && result.document.children).toMatchObject([
        { listLevels: { '2': { start: 3 } }, listType: 'numbered' },
      ]);
      expect(result.ok && result.document.children[0].listId).toEqual(
        expect.any(String)
      );
      expect(result.diagnostics).toEqual([]);
    }
  );

  it('keeps the identity of a list wrapper that holds its content without items', () => {
    expect(
      decodedNumbers(
        `<ol data-list-type="numbered" data-list-id="a" data-list-levels='{"1":{"start":7}}'>A</ol>`
      )
    ).toEqual([7]);
  });

  it('keeps a list wrapper level rules off an item of another list', () => {
    const result = createEditor({ selection: undefined }).api.html.parse(
      `<ol data-list-id="a" data-list-levels='{"1":{"start":5}}'><li data-list-id="b">B</li></ol>`
    );

    expect(result.ok && result.document.children[0].listLevels).toBeUndefined();
  });

  it('keeps the order of the lists an HTML item nests', () => {
    expect(
      parseHtmlChildren(
        createEditor({ selection: undefined }),
        '<ul><li>Parent<ol><li>One</li></ol><ul><li>Two</li><li>Three</li></ul></li></ul>'
      )
    ).toMatchObject([
      { children: [{ text: 'Parent' }], listType: 'bulleted' },
      { children: [{ text: 'One' }], indent: 2, listType: 'numbered' },
      { children: [{ text: 'Two' }], indent: 2, listType: 'bulleted' },
      { children: [{ text: 'Three' }], indent: 2, listType: 'bulleted' },
    ]);
  });

  it.each([
    [
      'a code block',
      '<ol><li><p>Install</p><pre><code>npm i</code></pre></li><li>Run</li></ol>',
      '1. Install\n\n   ```\n   npm i\n   ```\n2. Run',
      [
        {
          children: [{ text: 'Install' }],
          indent: 1,
          listId: 'a',
          listType: 'numbered',
          type: 'paragraph',
        },
        { children: [{ text: 'npm i' }], indent: 2, type: 'codeBlock' },
        {
          children: [{ text: 'Run' }],
          indent: 1,
          listId: 'a',
          listType: 'numbered',
          type: 'paragraph',
        },
      ],
    ],
    [
      'a paragraph after a nested list',
      '<ul><li><p>a</p><ul><li>c</li></ul><p>b</p></li></ul>',
      '- a\n\n  - c\n\n  b',
      [
        {
          children: [{ text: 'a' }],
          indent: 1,
          listId: 'a',
          listType: 'bulleted',
          type: 'paragraph',
        },
        {
          children: [{ text: 'c' }],
          indent: 2,
          listId: 'a',
          listType: 'bulleted',
          type: 'paragraph',
        },
        { children: [{ text: 'b' }], indent: 2, type: 'paragraph' },
      ],
    ],
    [
      'a paragraph before a nested list',
      '<ul><li><p>a</p><p>b</p><ul><li>c</li></ul></li></ul>',
      '- a\n\n  b\n\n  - c',
      [
        {
          children: [{ text: 'a' }],
          indent: 1,
          listId: 'a',
          listType: 'bulleted',
          type: 'paragraph',
        },
        { children: [{ text: 'b' }], indent: 2, type: 'paragraph' },
        {
          children: [{ text: 'c' }],
          indent: 2,
          listId: 'a',
          listType: 'bulleted',
          type: 'paragraph',
        },
      ],
    ],
    [
      'a heading as its first block',
      '<ul><li><h1>Title</h1><p>body</p></li></ul>',
      '- # Title\n\n  body',
      [
        {
          children: [{ text: 'Title' }],
          indent: 1,
          level: 1,
          listId: 'a',
          listType: 'bulleted',
          type: 'heading',
        },
        { children: [{ text: 'body' }], indent: 2, type: 'paragraph' },
      ],
    ],
    [
      'an image after its paragraph',
      '<ul><li><p>a</p><img alt="i" src="https://platejs.org/i.png"><p>b</p></li></ul>',
      '- a\n\n  ![i](https://platejs.org/i.png)\n\n  b',
      [
        {
          children: [{ text: 'a' }],
          indent: 1,
          listId: 'a',
          listType: 'bulleted',
          type: 'paragraph',
        },
        {
          alt: 'i',
          children: [{ text: '' }],
          indent: 2,
          type: 'image',
          url: 'https://platejs.org/i.png',
        },
        { children: [{ text: 'b' }], indent: 2, type: 'paragraph' },
      ],
    ],
    [
      'a list as its first block',
      '<ul><li><ul><li>a</li><li>b</li></ul></li></ul>',
      '- - a\n  - b',
      [
        {
          children: [{ text: '' }],
          indent: 1,
          listId: 'a',
          listType: 'bulleted',
          type: 'paragraph',
        },
        {
          children: [{ text: 'a' }],
          indent: 2,
          listId: 'a',
          listType: 'bulleted',
          type: 'paragraph',
        },
        {
          children: [{ text: 'b' }],
          indent: 2,
          listId: 'a',
          listType: 'bulleted',
          type: 'paragraph',
        },
      ],
    ],
  ])(
    'keeps %s of an HTML list item as the matching Markdown does',
    (_name, html, markdown, expected) => {
      const targetPlugins = [
        PLUGINS.heading,
        PLUGINS.paragraph,
        PLUGINS.codeBlock,
        PLUGINS.image,
      ];
      const editor = createProductEditor({
        plugins: [
          BaseIndentPlugin.configure({ targetPlugins }),
          BaseListPlugin.configure({ targetPlugins }),
          BaseCodeBlockPlugin,
          BaseHeadingPlugin,
          BaseImagePlugin,
          MarkdownPlugin,
        ],
      });
      const children = (
        result:
          | ReturnType<typeof editor.api.html.parse>
          | ReturnType<typeof editor.api.markdown.parse>
      ) =>
        result.ok
          ? { children: nameListIds(result.document.children) }
          : result.diagnostics;

      expect([
        children(editor.api.html.parse(html)),
        children(editor.api.markdown.parse(markdown)),
      ]).toEqual([{ children: expected }, { children: expected }]);
    }
  );

  it.each([
    ['a plain div', '<ul><li><div><p>a</p><p>b</p></div></li></ul>'],
    [
      'indented markup',
      '<ul>\n  <li>\n    <p>a</p>\n    <p>b</p>\n  </li>\n</ul>',
    ],
    ['one div per line', '<ul><li><div>a</div><div>b</div></li></ul>'],
    ['a section', '<ul><li><section><p>a</p><p>b</p></section></li></ul>'],
    ['a custom element', '<ul><li><x-wrap><p>a</p><p>b</p></x-wrap></li></ul>'],
  ])('keeps the blocks of an HTML list item wrapped in %s', (_name, html) => {
    const result = createProductEditor({
      plugins: [BaseListPlugin],
    }).api.html.parse(html);

    expect(result.ok && nameListIds(result.document.children)).toEqual([
      {
        children: [{ text: 'a' }],
        indent: 1,
        listId: 'a',
        listType: 'bulleted',
        type: 'paragraph',
      },
      { children: [{ text: 'b' }], indent: 2, type: 'paragraph' },
    ]);
  });

  it('keeps an HTML list item line whole around an image the editor cannot hold, as Markdown does', () => {
    const editor = createProductEditor({
      plugins: [BaseListPlugin, MarkdownPlugin],
    });
    const items = [
      {
        children: [{ text: 'ab' }],
        indent: 1,
        listId: 'a',
        listType: 'bulleted',
        type: 'paragraph',
      },
    ];
    const html = editor.api.html.parse(
      '<ul><li><p>a<img alt="i" src="https://platejs.org/i.png">b</p></li></ul>',
      { lossPolicy: 'allow' }
    );
    const markdown = editor.api.markdown.parse(
      '- a![i](https://platejs.org/i.png)b',
      { lossPolicy: 'allow' }
    );

    expect([
      html.ok && nameListIds(html.document.children),
      markdown.ok && nameListIds(markdown.document.children),
    ]).toEqual([items, items]);
  });

  it('warns about the style an HTML list item no longer gives the blocks it moves out', () => {
    const result = createProductEditor({
      plugins: [BaseBoldPlugin, BaseListPlugin],
    }).api.html.parse(
      '<ul><li style="font-weight:bold"><p>a</p><p>b</p></li></ul>',
      { lossPolicy: 'reject' }
    );

    expect(result.ok && nameListIds(result.document.children)).toEqual([
      {
        children: [{ bold: true, text: 'a' }],
        indent: 1,
        listId: 'a',
        listType: 'bulleted',
        type: 'paragraph',
      },
      { children: [{ text: 'b' }], indent: 2, type: 'paragraph' },
    ]);
    expect(
      result.diagnostics.map(({ code, message, severity }) => ({
        code,
        message,
        severity,
      }))
    ).toEqual([
      {
        code: 'html-unsupported-content',
        message:
          'List HTML dropped the style "font-weight: bold" of <li> when it moved what the element held.',
        severity: 'warning',
      },
    ]);
  });

  it('warns about the style of a wrapper around HTML list item blocks', () => {
    const result = createProductEditor({
      plugins: [BaseListPlugin],
    }).api.html.parse(
      '<ul><li><div style="text-align:center"><p>a</p><p>b</p></div></li></ul>'
    );

    expect(result.diagnostics.map(({ message }) => message)).toEqual([
      'List HTML dropped the style "text-align: center" of <div> when it moved what the element held.',
    ]);
  });

  it('reports the data attribute of a wrapper around an HTML list item block', () => {
    const result = createProductEditor({
      plugins: [BaseListPlugin],
    }).api.html.parse(
      '<ul><li><div data-text-indent="2"><p>a</p></div></li></ul>'
    );

    expect(result.diagnostics.map(({ message }) => message)).toEqual([
      'No HTML mapping represents attribute "data-text-indent" on <div>; it was omitted.',
    ]);
  });

  it('keeps ruby and the other elements browsers lay out inline in its HTML list item line', () => {
    const result = createProductEditor({
      plugins: [BaseListPlugin],
    }).api.html.parse(
      '<ul><li>a<ruby>b</ruby><datalist></datalist><noscript>c</noscript><slot>d</slot>e</li></ul>'
    );

    expect(result.ok && nameListIds(result.document.children)).toEqual([
      {
        children: [{ text: 'abcde' }],
        indent: 1,
        listId: 'a',
        listType: 'bulleted',
        type: 'paragraph',
      },
    ]);
  });

  it('keeps an audio in an HTML list item text under that item', () => {
    const result = createProductEditor({
      plugins: [BaseAudioPlugin, BaseListPlugin],
    }).api.html.parse(
      '<ol><li>Listen <audio controls src="https://platejs.org/a.mp3"></audio> now</li><li>next</li></ol>'
    );

    expect(result.ok && nameListIds(result.document.children)).toEqual([
      {
        children: [{ text: 'Listen ' }],
        indent: 1,
        listId: 'a',
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: '' }],
        type: 'audio',
        url: 'https://platejs.org/a.mp3',
      },
      { children: [{ text: 'now' }], indent: 2, type: 'paragraph' },
      {
        children: [{ text: 'next' }],
        indent: 1,
        listId: 'a',
        listType: 'numbered',
        type: 'paragraph',
      },
    ]);
  });

  it('puts the blocks of an HTML list item one level under its nesting when Indent cannot read its margin', () => {
    const result = createProductEditor({
      plugins: [BaseListPlugin],
    }).api.html.parse(
      '<ul><li>x<ul><li style="margin-left:2em"><p>a</p><p>b</p></li></ul></li></ul>'
    );

    expect(result.ok && nameListIds(result.document.children)).toEqual([
      {
        children: [{ text: 'x' }],
        indent: 1,
        listId: 'a',
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'a' }],
        indent: 2,
        listId: 'a',
        listType: 'bulleted',
        type: 'paragraph',
      },
      { children: [{ text: 'b' }], indent: 3, type: 'paragraph' },
    ]);
  });

  it('puts the blocks of an HTML list item one level under the depth its margin gives', () => {
    const result = createProductEditor({
      plugins: [BaseListPlugin],
    }).api.html.parse(
      '<ul><li style="margin-left:48px"><p>a</p><p>b</p></li></ul>'
    );

    expect(result.ok && nameListIds(result.document.children)).toEqual([
      {
        children: [{ text: 'a' }],
        indent: 2,
        listId: 'a',
        listType: 'bulleted',
        type: 'paragraph',
      },
      { children: [{ text: 'b' }], indent: 3, type: 'paragraph' },
    ]);
  });

  it('reads a Markdown item that opens with a heading the list cannot hold as a list paragraph, as HTML does', () => {
    const editor = createProductEditor({
      plugins: [BaseListPlugin, BaseHeadingPlugin, MarkdownPlugin],
    });
    const items = [
      {
        children: [{ text: 'A' }],
        indent: 1,
        listId: 'a',
        listStart: 3,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'b' }],
        indent: 1,
        listId: 'a',
        listType: 'numbered',
        type: 'paragraph',
      },
    ];
    const markdown = editor.api.markdown.parse('3. # A\n4. b', {
      lossPolicy: 'allow',
    });
    const html = editor.api.html.parse(
      '<ol start="3"><li><h1>A</h1></li><li>b</li></ol>'
    );

    expect([
      markdown.ok && nameListIds(markdown.document.children),
      html.ok && nameListIds(html.document.children),
    ]).toEqual([items, items]);
    expect(
      markdown.diagnostics.map(({ code, message, severity }) => ({
        code,
        message,
        severity,
      }))
    ).toEqual([
      {
        code: 'markdown-unsupported-node',
        message:
          'List Markdown replaced "heading" with "paragraph": the list cannot hold it.',
        severity: 'warning',
      },
    ]);
  });

  it('takes a Markdown item out of its list when the list cannot hold its first block and that block is not a line of text', () => {
    const editor = createProductEditor({
      plugins: [
        BaseBlockquotePlugin,
        BaseHorizontalRulePlugin,
        BaseListPlugin,
        MarkdownPlugin,
      ],
    });
    const source = '- ***\n- > q\n- b';
    const allowed = editor.api.markdown.parse(source, { lossPolicy: 'allow' });

    expect(allowed.ok && nameListIds(allowed.document.children)).toEqual([
      { children: [{ text: '' }], type: 'horizontalRule' },
      {
        children: [{ children: [{ text: 'q' }], type: 'paragraph' }],
        type: 'blockquote',
      },
      {
        children: [{ text: 'b' }],
        indent: 1,
        listId: 'a',
        listType: 'bulleted',
        type: 'paragraph',
      },
    ]);
    expect(allowed.diagnostics.map(({ message }) => message)).toEqual([
      'List Markdown unwrapped "horizontalRule" from its list item: the list cannot hold it.',
      'List Markdown unwrapped "blockquote" from its list item: the list cannot hold it.',
    ]);
    expect(editor.api.markdown.parse(source, { lossPolicy: 'reject' }).ok).toBe(
      false
    );
  });

  it('keeps a nested Markdown item that leaves its list among its parent item blocks', () => {
    const result = createProductEditor({
      plugins: [
        BaseBlockquotePlugin,
        BaseIndentPlugin.configure({
          targetPlugins: [BaseParagraphPlugin, BaseBlockquotePlugin],
        }),
        BaseListPlugin,
        MarkdownPlugin,
      ],
    }).api.markdown.parse('- a\n  - > q\n- b', { lossPolicy: 'allow' });

    expect(result.ok && nameListIds(result.document.children)).toEqual([
      {
        children: [{ text: 'a' }],
        indent: 1,
        listId: 'a',
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ children: [{ text: 'q' }], type: 'paragraph' }],
        indent: 2,
        type: 'blockquote',
      },
      {
        children: [{ text: 'b' }],
        indent: 1,
        listId: 'a',
        listType: 'bulleted',
        type: 'paragraph',
      },
    ]);
  });

  it('keeps a later list item block the editor cannot indent and warns in both formats', () => {
    const editor = createProductEditor({
      plugins: [BaseListPlugin, BaseCodeBlockPlugin, MarkdownPlugin],
    });
    const html = editor.api.html.parse(
      '<ul><li><p>Install</p><pre><code>npm i</code></pre></li></ul>',
      { lossPolicy: 'reject' }
    );
    const markdown = editor.api.markdown.parse(
      '- Install\n\n  ```\n  npm i\n  ```',
      { lossPolicy: 'reject' }
    );
    const blocks = [
      {
        children: [{ text: 'Install' }],
        indent: 1,
        listId: 'a',
        listType: 'bulleted',
        type: 'paragraph',
      },
      { children: [{ text: 'npm i' }], type: 'codeBlock' },
    ];

    expect([
      html.ok && nameListIds(html.document.children),
      markdown.ok && nameListIds(markdown.document.children),
    ]).toEqual([blocks, blocks]);
    expect([
      html.diagnostics.map(({ code, message, severity }) => ({
        code,
        message,
        severity,
      })),
      markdown.diagnostics.map(({ code, message, severity }) => ({
        code,
        message,
        severity,
      })),
    ]).toEqual([
      [
        {
          code: 'html-unsupported-content',
          message:
            'No HTML mapping represents attribute "data-indent" on <pre>; it was omitted.',
          severity: 'warning',
        },
      ],
      [
        {
          code: 'markdown-unsupported-node',
          message:
            'List Markdown omitted property "indent" on "codeBlock": the schema does not allow it.',
          severity: 'warning',
        },
      ],
    ]);
  });

  it('streams a list item block the editor cannot indent like a fresh parse', () => {
    const editor = createProductEditor({
      plugins: [BaseListPlugin, BaseCodeBlockPlugin, MarkdownPlugin],
    });
    const source = 'Intro\n\n- a\n\n  ```\n  x\n  ```\n\nTail';
    const options = { lossPolicy: 'allow', partial: true } as const;
    const named = (
      result: ReturnType<typeof editor.api.markdown.parseSlice>
    ) =>
      result.ok
        ? {
            ...result,
            slice: {
              ...result.slice,
              content: nameListIds(result.slice.content),
            },
          }
        : result;
    let previous: ReturnType<typeof editor.api.markdown.parseSlice> | undefined;

    for (let end = 1; end <= source.length; end++) {
      const prefix = source.slice(0, end);

      previous = editor.api.markdown.parseSlice(prefix, {
        ...options,
        previous,
      });
      expect(named(previous)).toEqual(
        named(editor.api.markdown.parseSlice(prefix, options))
      );
    }

    expect(previous?.diagnostics).toMatchObject([
      {
        code: 'markdown-unsupported-node',
        source: {
          end: { column: 6, line: 7, offset: 27 },
          excerpt: '- a\n\n  ```\n  x\n  ```',
          nodeType: 'list',
          start: { column: 1, line: 3, offset: 7 },
        },
      },
    ]);
  });

  it('decodes bare HTML items into the default block whatever the target order', () => {
    const editor = createProductEditor({
      plugins: [
        BaseHeadingPlugin,
        BaseListPlugin.configure({
          targetPlugins: [BaseHeadingPlugin, BaseParagraphPlugin],
        }),
      ],
    });

    const result = editor.api.html.parse('<ul><li>One</li><li>Two</li></ul>');

    expect(result.ok && result.document.children).toMatchObject([
      { children: [{ text: 'One' }], listType: 'bulleted', type: 'paragraph' },
      { children: [{ text: 'Two' }], listType: 'bulleted', type: 'paragraph' },
    ]);
  });

  it('lists the one block an HTML item holds when that block can be listed', () => {
    const editor = createProductEditor({
      plugins: [BaseHeadingPlugin, BaseImagePlugin, BaseListPlugin],
    });
    const parse = (source: string) => {
      const result = editor.api.html.parse(source);

      return result.ok && result.document.children;
    };

    expect(
      parse('<ul><li><img src="https://platejs.org/a.png"></li></ul>')
    ).toMatchObject([
      { listType: 'bulleted', type: 'image', url: 'https://platejs.org/a.png' },
    ]);
    // Headings are not list targets here, so the item keeps the heading's text.
    expect(parse('<ul><li><h2>Title</h2></li></ul>')).toMatchObject([
      {
        children: [{ text: 'Title' }],
        listType: 'bulleted',
        type: 'paragraph',
      },
    ]);
  });

  it.each([
    ['circle', 'bulleted'],
    ['lower-alpha', 'numbered'],
  ] as const)(
    'infers %s standalone list items as %s',
    (listStyle, listType) => {
      const editor = createEditor({ selection: undefined });

      expect(
        parseHtmlChildren(
          editor,
          `<li aria-level="2" style="list-style-type: ${listStyle}">Item</li>`
        )
      ).toMatchObject([{ indent: 2, listStyle, listType }]);
    }
  );

  it('decodes an ordered list start on its own list', () => {
    expect(
      decodedNumbers(
        '<ol start="5"><li data-list-type="numbered">Five</li></ol>'
      )
    ).toEqual([5]);
  });

  it('continues an ordered list whose start follows the earlier one', () => {
    expect(
      decodedNumbers(
        '<ol start="4"><li>Four</li><li>Five</li></ol><p>Note</p><ol start="6"><li>Six</li></ol>'
      )
    ).toEqual([4, 5, null, 6]);
  });

  it('starts a separate list where an ordered list start does not follow', () => {
    expect(
      decodedNumbers(
        '<ol><li>One</li></ol><ol start="5"><li>Five</li></ol><ol><li>One again</li></ol>'
      )
    ).toEqual([1, 5, 1]);
  });

  it('continues a root list past a deeper list between its runs', () => {
    expect(
      decodedNumbers(
        '<ol start="1"><li data-indent="1">One</li></ol><ol start="1"><li data-indent="2">Nested</li></ol><ol start="2"><li data-indent="1">Two</li></ol>'
      )
    ).toEqual([1, 1, 2]);
  });

  it('keeps encoded starts and restarts from Plate HTML', () => {
    const editor = createEditor({ selection: undefined });

    expect(
      parseHtmlChildren(
        editor,
        '<ol start="4"><li data-list-start="4" data-list-type="numbered">Four</li></ol><ol start="5"><li data-list-restart="5" data-list-type="numbered">Five</li></ol>'
      )
    ).toMatchObject([
      { listStart: 4, listType: 'numbered' },
      { listRestart: 5, listType: 'numbered' },
    ]);
  });

  it('decodes checked HTML items as task lists', () => {
    const editor = createEditor({ selection: undefined });

    expect(
      parseHtmlChildren(editor, '<ul><li data-checked="false">Task</li></ul>')
    ).toMatchObject([
      {
        checked: false,
        listType: 'task',
      },
    ]);
  });

  it('encodes a forced restart in Plate clipboard HTML', () => {
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'Four' }],
          indent: 1,
          listRestart: 4,
          listStyle: 'lower-alpha',
          listType: 'numbered',
          type: 'paragraph',
        },
      ],
      selection: SelectionApi.nodes([[0]], { mode: 'block' }),
    });
    const data = new DataTransfer();

    editor.api.dom.clipboard.writeSelection(data);

    const html = data.getData('text/html');
    expect(html).toContain('<ol');
    expect(html).toContain('start="4"');
    expect(html).toContain('list-style-type: lower-alpha');
    expect(html).toContain('data-list-restart="4"');
  });

  it('preserves conditional start intent in Plate clipboard HTML', () => {
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'Four' }],
          indent: 1,
          listStart: 4,
          listType: 'numbered',
          type: 'paragraph',
        },
      ],
      selection: SelectionApi.nodes([[0]], { mode: 'block' }),
    });
    const data = new DataTransfer();

    editor.api.dom.clipboard.writeSelection(data);

    const item = new DOMParser()
      .parseFromString(data.getData('text/html'), 'text/html')
      .body.querySelector<HTMLElement>('li');

    expect(item?.dataset.listStart).toBe('4');
    expect(item?.dataset.listRestart).toBeUndefined();
  });

  it('encodes a top-level ordinal after a nested item', () => {
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'One' }],
          indent: 1,
          listType: 'numbered',
          type: 'paragraph',
        },
        {
          children: [{ text: 'Nested' }],
          indent: 2,
          listType: 'numbered',
          type: 'paragraph',
        },
        {
          children: [{ text: 'Two' }],
          indent: 1,
          listType: 'numbered',
          type: 'paragraph',
        },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [2, 0] },
      },
    });
    const data = new DataTransfer();

    editor.api.dom.clipboard.writeSelection(data);

    const { body } = new DOMParser().parseFromString(
      data.getData('text/html'),
      'text/html'
    );

    expect(
      [...body.querySelectorAll('ol')].map((list) => list.getAttribute('start'))
    ).toEqual(['1', '1', '2']);
  });

  it('supports all three markdown input-rule kinds', () => {
    const plugin = BaseListPlugin.configure({
      inputRules: [
        BulletedListRules.markdown(),
        OrderedListRules.markdown(),
        TaskListRules.markdown({ checked: true }),
      ],
    });
    const cases = [
      ['-', { listType: 'bulleted' }],
      ['0.', { listStart: 0, listType: 'numbered' }],
      ['3.', { listStart: 3, listType: 'numbered' }],
      ['[x]', { checked: true, listType: 'task' }],
    ] as const;

    for (const [prefix, expected] of cases) {
      const editor = createProductEditor({
        initialValue: [
          {
            children: [{ text: `${prefix} Item` }],
            type: 'paragraph',
          },
        ],
        plugins: [plugin],
        selection: {
          kind: 'text',
          anchor: { offset: prefix.length, path: [0, 0] },
          focus: { offset: prefix.length, path: [0, 0] },
        },
      });

      editor.update.text.insert(' ');

      expect(editor.read.children()[0]).toMatchObject(expected);
    }
  });

  it('keeps list syntax in a title that is not an eligible list block', () => {
    const editor = createProductEditor({
      plugins: [
        BaseHeadingPlugin,
        BaseListPlugin.configure({
          inputRules: [BulletedListRules.markdown()],
        }),
      ],
      schema: {
        root: schema.content.prefix(
          [{ element: BaseHeadingPlugin, properties: { level: 1 } }],
          schema.content.group('block', {
            default: { type: 'paragraph' },
            min: 1,
          })
        ),
      },
      initialValue: [
        { children: [{ text: '-' }], level: 1, type: 'heading' },
        { children: [{ text: 'Body' }], type: 'paragraph' },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
    });

    editor.update.text.insert(' ');

    expect(editor.read.children()[0]).toEqual({
      children: [{ text: '- ' }],
      level: 1,
      type: 'heading',
    });
  });

  it('joins an existing sequence without forcing the typed start', () => {
    const editor = createProductEditor({
      initialValue: [
        {
          children: [{ text: 'Five' }],
          indent: 1,
          listStart: 5,
          listType: 'numbered',
          type: 'paragraph',
        },
        { children: [{ text: '1. Next' }], type: 'paragraph' },
      ],
      plugins: [
        BaseListPlugin.configure({
          inputRules: [OrderedListRules.markdown()],
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [1, 0] },
        focus: { offset: 2, path: [1, 0] },
      },
    });

    editor.update.text.insert(' ');

    expect(editor.read.children()[1]).toMatchObject({
      listStart: 1,
      listType: 'numbered',
    });
    expect(editor.read.children()[1]).not.toHaveProperty('listRestart');
    expect(editor.read.list.ordinal(editor.read.children()[1])).toBe(6);
  });

  it('joins the list before a note when the typed number continues it', () => {
    const editor = createProductEditor({
      initialValue: [
        {
          children: [{ text: 'One' }],
          indent: 1,
          listId: 'a',
          listType: 'numbered',
          type: 'paragraph',
        },
        {
          children: [{ text: 'Two' }],
          indent: 1,
          listId: 'a',
          listType: 'numbered',
          type: 'paragraph',
        },
        { children: [{ text: 'Note' }], type: 'paragraph' },
        { children: [{ text: '3. Three' }], type: 'paragraph' },
      ],
      plugins: [
        BaseListPlugin.configure({
          inputRules: [OrderedListRules.markdown()],
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [3, 0] },
        focus: { offset: 2, path: [3, 0] },
      },
    });

    editor.update.text.insert(' ');
    editor.update.nodes.remove({ at: [0] });

    expect(editor.read.list.ordinal([2])).toBe(2);
  });

  it('treats only numbered nodes as ordered', () => {
    expect(
      isOrderedList({
        children: [],
        listStyle: 'disc',
        listType: 'numbered',
        type: 'paragraph',
      })
    ).toBe(true);
    expect(
      isOrderedList({
        children: [],
        listStyle: 'decimal',
        listType: 'bulleted',
        type: 'paragraph',
      })
    ).toBe(false);
    expect(BULLETED_LIST_STYLES).toContain(ListStyle.Disc);
  });

  it('supports configured list target types', () => {
    const CalloutPlugin = definePlugin('callout', {
      schema: {
        element: schema.element.textBlock(),
      },
    });
    const editor = createProductEditor({
      initialValue: [{ children: [{ text: 'Callout' }], type: 'callout' }],
      plugins: [
        CalloutPlugin,
        BaseListPlugin.configure({ targetPlugins: ['callout'] }),
        BaseIndentPlugin.configure({ targetPlugins: ['callout'] }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 7, path: [0, 0] },
      },
    });

    editor.update.list.toggle({ type: ListType.Bulleted });

    expect(editor.read.children()[0]).toMatchObject({
      listType: 'bulleted',
      type: 'callout',
    });
  });

  it('renumbers a later item when an earlier block becomes a list item', () => {
    const editor = createEditor({
      initialValue: [
        { children: [{ text: 'Plain' }], type: 'paragraph' },
        {
          children: [{ text: 'Item' }],
          indent: 1,
          listStart: 5,
          listType: ListType.Numbered,
          type: 'paragraph',
        },
      ],
    });
    const ordinal = () =>
      editor.plugin(BaseListPlugin).read.ordinal(editor.read.children()[1]);

    expect(ordinal()).toBe(5);

    editor.update.nodes.set(
      { indent: 1, listType: ListType.Numbered },
      { at: [0] }
    );

    // `listStart` applies only while the item starts its sequence.
    expect(ordinal()).toBe(2);
  });
});

describe('BaseListPlugin transfer steps', () => {
  const item = (text: string, indent: number) => ({
    children: [{ text }],
    indent,
    listType: ListType.Bulleted,
    type: 'paragraph',
  });
  const caretIn = (index: number) =>
    ({
      anchor: { offset: 0, path: [index, 0] },
      focus: { offset: 0, path: [index, 0] },
      kind: 'text',
    }) as const;
  const texts = (editor: ReturnType<typeof createEditor>) =>
    editor.read.children().map((node) => NodeApi.string(node));

  it('steps a list item down past a whole family', () => {
    const editor = createEditor({
      initialValue: [
        item('moved', 1),
        item('parent', 1),
        item('child', 2),
        item('next', 1),
      ],
      selection: caretIn(0),
    });

    editor.api.transfer.move({ to: 'next' });

    expect(texts(editor)).toEqual(['parent', 'child', 'moved', 'next']);
  });

  it('steps a list item up past a whole family', () => {
    const editor = createEditor({
      initialValue: [item('parent', 1), item('child', 2), item('moved', 1)],
      selection: caretIn(2),
    });

    editor.api.transfer.move({ to: 'previous' });

    expect(texts(editor)).toEqual(['moved', 'parent', 'child']);
  });

  const family = [
    item('parent', 1),
    item('child', 2),
    item('next', 1),
    item('moved', 1),
  ];

  it.each([
    ['after the parent', 0, 'after'],
    ['before the child', 1, 'before'],
  ] as const)(
    'lands a list item dropped %s after the whole family',
    (_, index, edge) => {
      const editor = createEditor({ initialValue: family });

      editor.api.transfer.move({
        nodes: [editor.key([3])!],
        to: { edge, key: editor.key([index])! },
      });

      expect(texts(editor)).toEqual(['parent', 'child', 'moved', 'next']);
    }
  );

  it('refuses a retarget that a veto blocks', () => {
    const LockPlugin = definePlugin('lock', {
      contributions: [
        transferVeto.of(
          ({ edge, target: [node] }) =>
            edge === 'after' && NodeApi.string(node) === 'child'
        ),
      ],
    });
    const editor = createProductEditor({
      initialValue: family,
      plugins: [BaseListPlugin, LockPlugin],
    });

    expect(
      editor.api.transfer.move({
        nodes: [editor.key([3])!],
        to: { edge: 'after', key: editor.key([0])! },
      }).status
    ).toBe('refused');
    expect(editor.read.children().map((node) => NodeApi.string(node))).toEqual([
      'parent',
      'child',
      'next',
      'moved',
    ]);
  });
});

describe('BaseListPlugin transfer copies', () => {
  const item = (
    text: string,
    indent: number,
    listType: ListType,
    listId: string
  ) => ({ children: [{ text }], indent, listId, listType, type: 'paragraph' });
  const source = () =>
    createEditor({
      initialValue: [
        item('One', 1, ListType.Numbered, 'source'),
        item('Two', 2, ListType.Numbered, 'source'),
        item('Three', 1, ListType.Numbered, 'source'),
      ],
      selection: undefined,
    });
  const target = () =>
    createEditor({
      initialValue: [
        item('X', 1, ListType.Bulleted, 'target'),
        item('Y', 2, ListType.Bulleted, 'target'),
        item('Z', 1, ListType.Bulleted, 'target'),
      ],
      selection: undefined,
    });
  const landed = (editor: ReturnType<typeof createEditor>) =>
    editor.read
      .children()
      .map((node) => [NodeApi.string(node), node.indent, node.listId]);

  it('lands a text drop from another editor at the caret depth in a list of its own [EDIT-CLIPBOARD-LIST-LANDING-001]', () => {
    const from = source();
    const editor = target();

    editor.api.transfer.move({
      from,
      range: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [2, 0] },
      },
      to: { point: { offset: 1, path: [1, 0] } },
    });

    const fresh = editor.read.children()[2].listId;

    expect(landed(editor)).toEqual([
      ['X', 1, 'target'],
      ['YOne', 2, 'target'],
      ['Two', 3, fresh],
      ['Three', 2, fresh],
      ['Z', 1, 'target'],
    ]);
    expect(fresh).not.toBe('source');
  });

  it('lands whole items dropped from another editor into an empty paragraph as a paste does, with no loss [EDIT-CLIPBOARD-LIST-LANDING-001]', () => {
    const from = source();
    const editor = createEditor({
      initialValue: [
        item('X', 1, ListType.Numbered, 'target'),
        { children: [{ text: '' }], type: 'paragraph' },
        { children: [{ text: 'Z' }], type: 'paragraph' },
      ],
      selection: undefined,
    });

    const outcome = editor.api.transfer.move({
      from,
      range: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [2, 0] },
      },
      to: { point: { offset: 0, path: [1, 0] } },
    });

    expect({
      diagnostics: outcome.status === 'copied' && outcome.diagnostics,
      landed: landed(editor),
    }).toEqual({
      diagnostics: [],
      landed: [
        ['X', 1, 'target'],
        ['One', 1, 'target'],
        ['Two', 2, 'target'],
        ['Three', 1, 'target'],
        ['Z', undefined, undefined],
      ],
    });
  });

  it('keeps the depths of list items dropped from another editor beside a block', () => {
    const from = source();
    const editor = target();

    editor.api.transfer.move({
      from,
      nodes: [0, 1, 2].map((index) => from.key([index])!),
      to: { edge: 'after', key: editor.key([1])! },
    });

    expect(landed(editor).map(([text, indent]) => [text, indent])).toEqual([
      ['X', 1],
      ['Y', 2],
      ['One', 1],
      ['Two', 2],
      ['Three', 1],
      ['Z', 1],
    ]);
  });
});

describe('BaseListPlugin text moves', () => {
  const item = (
    text: string,
    indent: number,
    listId: string,
    extra: Record<string, unknown> = {}
  ) => ({
    children: [{ text }],
    indent,
    listId,
    listType: ListType.Numbered,
    type: 'paragraph',
    ...extra,
  });
  const note = (text: string) => ({ children: [{ text }], type: 'paragraph' });
  const range = (
    [anchorBlock, anchorOffset]: [number, number],
    [focusBlock, focusOffset]: [number, number]
  ) => ({
    anchor: { offset: anchorOffset, path: [anchorBlock, 0] },
    focus: { offset: focusOffset, path: [focusBlock, 0] },
  });
  const landed = (editor: ReturnType<typeof createEditor>) =>
    editor.read
      .children()
      .map((node) => [NodeApi.string(node), node.indent, node.listId]);
  const numbersOf = (editor: ReturnType<typeof createEditor>) =>
    editor.read
      .children()
      .map((node, index) =>
        node.listType ? (editor.read.list.ordinal([index]) ?? null) : null
      );

  it('lands moved items at the drop item depth in its list, removing the emptied source item [EDIT-CLIPBOARD-LIST-LANDING-001] [EDIT-LIST-DROP-001]', () => {
    const editor = createEditor({
      initialValue: [
        item('One', 1, 'a'),
        item('Two', 2, 'a'),
        note('gap'),
        item('X', 1, 'b'),
        item('Y', 2, 'b'),
        item('Z', 3, 'b'),
      ],
      selection: undefined,
    });

    const outcome = editor.api.transfer.move({
      range: range([0, 0], [1, 3]),
      to: { point: { offset: 1, path: [5, 0] } },
    });

    expect({ landed: landed(editor), status: outcome.status }).toEqual({
      landed: [
        ['gap', undefined, undefined],
        ['X', 1, 'b'],
        ['Y', 2, 'b'],
        ['ZOne', 3, 'b'],
        ['Two', 4, 'b'],
      ],
      status: 'moved',
    });
  });

  it('keeps moved items in a list Word continues past a paragraph [EDIT-LIST-DROP-001]', () => {
    const editor = createEditor({
      initialValue: [
        item('A', 1, 'w'),
        note('para'),
        item('B', 1, 'w'),
        item('C', 1, 'w'),
        item('D', 1, 'w'),
      ],
      selection: undefined,
    });

    editor.api.transfer.move({
      range: range([3, 0], [4, 1]),
      to: { point: { offset: 4, path: [1, 0] } },
    });

    expect(
      editor.read
        .children()
        .map((node, index) => [NodeApi.string(node), numbersOf(editor)[index]])
    ).toEqual([
      ['A', 1],
      ['paraC', null],
      ['D', 2],
      ['B', 3],
    ]);
  });

  it.each([
    ['joins a numbered drop item', ListType.Numbered, 't'],
    ['keeps its list beside a bulleted drop item', ListType.Bulleted, 's'],
  ] as const)('%s [EDIT-LIST-DROP-001]', (_, listType, list) => {
    const editor = createEditor({
      initialValue: [
        item('One', 1, 's'),
        item('Two', 1, 's'),
        item('T', 1, 't', { listType }),
      ],
      selection: undefined,
    });

    editor.api.transfer.move({
      range: range([0, 1], [1, 3]),
      to: { point: { offset: 1, path: [2, 0] } },
    });

    expect(landed(editor)).toEqual([
      ['O', 1, 's'],
      ['Tne', 1, 't'],
      ['Two', 1, list],
    ]);
  });

  it('keeps moved whole items in their list in an empty paragraph below a bulleted list [EDIT-LIST-DROP-001]', () => {
    const editor = createEditor({
      initialValue: [
        item('X', 1, 't', { listType: ListType.Bulleted }),
        note(''),
        item('One', 1, 's'),
        item('Two', 1, 's'),
      ],
      selection: undefined,
    });

    editor.api.transfer.move({
      range: range([2, 0], [3, 3]),
      to: { point: { offset: 0, path: [1, 0] } },
    });

    expect({ landed: landed(editor), numbers: numbersOf(editor) }).toEqual({
      landed: [
        ['X', 1, 't'],
        ['One', 1, 's'],
        ['Two', 1, 's'],
      ],
      numbers: [null, 1, 2],
    });
  });

  it('keeps the level rules of a list moved in part to another depth [EDIT-LIST-DROP-001]', () => {
    const levels = { '2': { start: 5 } };
    const editor = createEditor({
      initialValue: [
        item('A', 1, 'w', { listLevels: levels }),
        item('Bee', 2, 'w', { listLevels: levels }),
        item('C', 2, 'w', { listLevels: levels }),
        item('D', 1, 'w', { listLevels: levels }),
        item('X', 1, 'x', { listType: ListType.Bulleted }),
      ],
      selection: undefined,
    });

    editor.api.transfer.move({
      range: range([1, 1], [2, 1]),
      to: { point: { offset: 1, path: [4, 0] } },
    });

    expect({
      landed: landed(editor),
      levels: editor.read.children()[4].listLevels,
      numbers: numbersOf(editor),
    }).toEqual({
      landed: [
        ['A', 1, 'w'],
        ['B', 2, 'w'],
        ['D', 1, 'w'],
        ['Xee', 1, 'x'],
        ['C', 1, 'w'],
      ],
      levels,
      numbers: [1, 5, 2, null, 3],
    });
  });

  it('joins only the first of two moved lists to the drop item list [EDIT-LIST-DROP-001]', () => {
    const editor = createEditor({
      initialValue: [
        item('One', 1, 's1'),
        item('Uno', 1, 's1'),
        item('Two', 1, 's2', { listType: ListType.Bulleted }),
        item('Dos', 1, 's2', { listType: ListType.Bulleted }),
        item('T', 1, 't'),
      ],
      selection: undefined,
    });

    editor.api.transfer.move({
      range: range([0, 1], [3, 3]),
      to: { point: { offset: 1, path: [4, 0] } },
    });

    expect(landed(editor)).toEqual([
      ['O', 1, 's1'],
      ['Tne', 1, 't'],
      ['Uno', 1, 't'],
      ['Two', 1, 's2'],
      ['Dos', 1, 's2'],
    ]);
  });

  it('lands a moved image item at the drop item depth [EDIT-CLIPBOARD-LIST-LANDING-001]', () => {
    const editor = createProductEditor({
      initialValue: [
        item('One', 1, 's'),
        {
          children: [{ text: '' }],
          indent: 1,
          listId: 's',
          listType: ListType.Numbered,
          type: 'image',
          url: 'https://platejs.org/a.png',
        },
        item('Two', 1, 's'),
        item('T', 2, 't'),
      ],
      plugins: [BaseImagePlugin, BaseListPlugin],
    });

    const outcome = editor.api.transfer.move({
      range: range([0, 1], [2, 3]),
      to: { point: { offset: 1, path: [3, 0] } },
    });

    expect({
      landed: editor.read
        .children()
        .map((node) => [node.type, node.indent, node.listId]),
      status: outcome.status,
    }).toEqual({
      landed: [
        ['paragraph', 1, 's'],
        ['paragraph', 2, 't'],
        ['image', 2, 't'],
        ['paragraph', 2, 't'],
      ],
      status: 'moved',
    });
  });

  it('keeps the ids of whole blocks a move carries', () => {
    const editor = createProductEditor({
      initialValue: [
        item('One', 1, 's', { id: 'one' }),
        item('Two', 1, 's', { id: 'two' }),
        item('Three', 1, 's', { id: 'three' }),
        item('T', 1, 't', { id: 't' }),
      ],
      plugins: [ElementIdPlugin, BaseListPlugin],
    });

    const outcome = editor.api.transfer.move({
      range: range([0, 1], [2, 5]),
      to: { point: { offset: 1, path: [3, 0] } },
    });

    expect({
      landed: editor.read
        .children()
        .map((node) => [NodeApi.string(node), node.id]),
      status: outcome.status,
    }).toMatchObject({
      landed: [
        ['O', 'one'],
        ['Tne', 't'],
        ['Two', 'two'],
        ['Three', expect.any(String)],
      ],
      status: 'moved',
    });
  });

  it('lands whole items moved out of a blockquote into an empty paragraph under a list item, and undoes in one step [EDIT-CLIPBOARD-LIST-LANDING-001]', () => {
    const before = [
      item('X', 1, 'x'),
      note(''),
      {
        children: [item('One', 1, 'a'), item('Two', 2, 'a')],
        type: 'blockquote',
      },
    ];
    const editor = createProductEditor({
      initialValue: before,
      plugins: [BaseBlockquotePlugin, BaseListPlugin],
      selection: undefined,
    });

    const outcome = editor.api.transfer.move({
      range: {
        anchor: { offset: 0, path: [2, 0, 0] },
        focus: { offset: 3, path: [2, 1, 0] },
      },
      to: { point: { offset: 0, path: [1, 0] } },
    });

    expect({ landed: landed(editor), status: outcome.status }).toEqual({
      landed: [
        ['X', 1, 'x'],
        ['One', 1, 'x'],
        ['Two', 2, 'x'],
      ],
      status: 'moved',
    });

    editor.api.history.undo();

    expect(editor.read.children()).toEqual(before);
  });
});

describe('BaseListPlugin block transfers', () => {
  const item = (
    text: string,
    indent: number,
    listId: string | undefined,
    extra: Record<string, unknown> = {}
  ) => ({
    children: [{ text }],
    indent,
    ...(listId === undefined ? {} : { listId }),
    listType: ListType.Numbered,
    type: 'paragraph',
    ...extra,
  });
  const note = (text: string) => ({ children: [{ text }], type: 'paragraph' });
  const numbered = (editor: ReturnType<typeof createEditor>) =>
    editor.read
      .children()
      .map(
        (node, index) =>
          [
            NodeApi.string(node),
            node.listType ? (editor.read.list.ordinal([index]) ?? null) : null,
          ] as const
      );
  const copy = (
    editor: ReturnType<typeof createEditor>,
    blocks: readonly number[],
    edge: 'after' | 'before',
    at: number
  ) =>
    editor.api.transfer.copy({
      nodes: blocks.map((index) => editor.key([index])!),
      to: { edge, key: editor.key([at])! },
    });

  it.each([
    ['with', 'a'],
    ['without', undefined],
  ] as const)(
    'gives a block copy dropped away from lists its own list, %s source ids [EDIT-LIST-DROP-001]',
    (_, id) => {
      const editor = createEditor({
        initialValue: [item('A', 1, id), item('B', 1, id), note('x')],
        selection: undefined,
      });

      copy(editor, [0], 'after', 2);

      expect({
        fresh: editor.read.children()[3].listId,
        numbers: numbered(editor),
      }).toEqual({
        fresh: expect.not.stringMatching(/^a$/),
        numbers: [
          ['A', 1],
          ['B', 2],
          ['x', null],
          ['A', 1],
        ],
      });
    }
  );

  it('joins a block copy from another list to the list it lands inside [EDIT-LIST-DROP-001]', () => {
    const editor = createEditor({
      initialValue: [
        item('X', 1, 'x'),
        item('Y', 1, 'x'),
        note('n'),
        item('A', 1, 'a'),
      ],
      selection: undefined,
    });

    copy(editor, [3], 'after', 0);

    expect(numbered(editor)).toEqual([
      ['X', 1],
      ['A', 2],
      ['Y', 3],
      ['n', null],
      ['A', 1],
    ]);
  });

  it('joins a block copy dropped before a nested child to the child list [EDIT-LIST-DROP-001]', () => {
    const editor = createEditor({
      initialValue: [
        item('P', 1, 'p'),
        item('C', 2, 'c'),
        note('n'),
        item('S', 2, 's'),
      ],
      selection: undefined,
    });

    copy(editor, [3], 'before', 1);

    expect(editor.read.children()[1]).toMatchObject({
      indent: 2,
      listId: 'c',
    });
  });

  it("gives a block copy dropped before a list's first item that item's start [EDIT-LIST-DROP-001]", () => {
    const editor = createEditor({
      initialValue: [
        note('n'),
        item('F', 1, 'f', { listStart: 5 }),
        item('G', 1, 'f'),
        item('S', 1, 's'),
      ],
      selection: undefined,
    });

    copy(editor, [3], 'before', 1);

    expect(numbered(editor)).toEqual([
      ['n', null],
      ['S', 5],
      ['F', 6],
      ['G', 7],
      ['S', 1],
    ]);
  });

  it("joins only the last of two copied lists dropped before a list's first item [EDIT-LIST-DROP-001]", () => {
    const editor = createEditor({
      initialValue: [
        item('A', 1, 'a', { listType: ListType.Bulleted }),
        item('B', 1, 'b'),
        note('n'),
        item('F', 1, 'f', { listStart: 5 }),
        item('G', 1, 'f'),
      ],
      selection: undefined,
    });

    copy(editor, [0, 1], 'before', 3);

    const copied = editor.read.children()[3];

    expect({
      fresh: copied.listId,
      numbers: numbered(editor),
    }).toEqual({
      fresh: expect.not.stringMatching(/^a$/),
      numbers: [
        ['A', null],
        ['B', 1],
        ['n', null],
        ['A', null],
        ['B', 5],
        ['F', 6],
        ['G', 7],
      ],
    });
  });

  it('joins only the first of two copied lists dropped inside a list [EDIT-LIST-DROP-001]', () => {
    const source = createEditor({
      initialValue: [item('A', 1, 'a'), item('B', 1, 'b')],
      selection: undefined,
    });
    const editor = createEditor({
      initialValue: [item('X', 1, 'x'), item('Y', 1, 'x'), item('Z', 1, 'x')],
      selection: undefined,
    });

    editor.api.transfer.copy({
      from: source,
      nodes: [source.key([0])!, source.key([1])!],
      to: { edge: 'after', key: editor.key([1])! },
    });

    expect(numbered(editor).map(([, number]) => number)).toEqual([
      1, 2, 3, 1, 4,
    ]);
  });

  it("drops a joined copy's restart so the list keeps counting [EDIT-LIST-DROP-001]", () => {
    const editor = createEditor({
      initialValue: [
        item('X', 1, 'x'),
        note('n'),
        item('A', 1, 'a', { listRestart: 3 }),
      ],
      selection: undefined,
    });

    copy(editor, [2], 'after', 0);

    expect(numbered(editor)).toEqual([
      ['X', 1],
      ['A', 2],
      ['n', null],
      ['A', 3],
    ]);
  });

  it("keeps a joined copy's child list start and restart [EDIT-LIST-DROP-001]", () => {
    const editor = createEditor({
      initialValue: [
        item('X', 1, 'x'),
        note('n'),
        item('P', 1, 'p'),
        item('C1', 2, 'c', { listStart: 5 }),
        item('C2', 2, 'c'),
        item('C3', 2, 'c', { listRestart: 9 }),
      ],
      selection: undefined,
    });

    copy(editor, [2], 'after', 0);

    expect(numbered(editor)).toEqual([
      ['X', 1],
      ['P', 2],
      ['C1', 5],
      ['C2', 6],
      ['C3', 9],
      ['n', null],
      ['P', 1],
      ['C1', 5],
      ['C2', 6],
      ['C3', 9],
    ]);
  });

  it.each([
    ['after', 1],
    ['before', 0],
  ] as const)(
    'gives a copied list that restarts at its top level its own list, dropped %s a list [EDIT-LIST-DROP-001]',
    (edge, at) => {
      const editor = createEditor({
        initialValue: [
          item('X', 1, 'x'),
          item('Y', 1, 'x'),
          note('n'),
          item('R1', 1, 'r'),
          item('R2', 1, 'r', { listRestart: 7 }),
        ],
        selection: undefined,
      });

      copy(editor, [3, 4], edge, at);

      const numbers = Object.fromEntries(
        numbered(editor).filter(([text]) => text === 'X' || text === 'Y')
      );

      expect({
        copied: numbered(editor).filter(([text]) => text.startsWith('R')),
        numbers,
      }).toEqual({
        copied: [
          ['R1', 1],
          ['R2', 7],
          ['R1', 1],
          ['R2', 7],
        ],
        numbers: { X: 1, Y: 2 },
      });
    }
  );

  it('gives a copied family whose child restarts its own list, so a counter that runs across parents keeps counting [EDIT-LIST-DROP-001]', () => {
    const across = { listLevels: { '2': { restartAfter: 0 } } };
    const editor = createEditor({
      initialValue: [
        item('P1', 1, 't', across),
        item('C1', 2, 't', across),
        item('P2', 1, 't', across),
        item('C2', 2, 't', across),
        note('n'),
        item('S', 1, 's'),
        item('SC', 2, 's', { listRestart: 9 }),
      ],
      selection: undefined,
    });

    copy(editor, [5, 6], 'after', 1);

    expect(numbered(editor).slice(0, 6)).toEqual([
      ['P1', 1],
      ['C1', 1],
      ['S', 1],
      ['SC', 9],
      ['P2', 2],
      ['C2', 2],
    ]);
  });

  it('gives a copied family whose child sets its own start its own list, so a counter that runs across parents keeps counting [EDIT-LIST-DROP-001]', () => {
    const across = { listLevels: { '2': { restartAfter: 0 } } };
    const editor = createEditor({
      initialValue: [
        item('P1', 1, 't', across),
        item('P2', 1, 't', across),
        item('C2', 2, 't', across),
        note('n'),
        item('S', 1, 's'),
        item('SC', 2, 's', { listStart: 9 }),
      ],
      selection: undefined,
    });

    copy(editor, [4, 5], 'after', 0);

    expect(numbered(editor).slice(0, 5)).toEqual([
      ['P1', 1],
      ['S', 1],
      ['SC', 9],
      ['P2', 2],
      ['C2', 1],
    ]);
  });

  it('admits a family copied between its own head and first child where it was dropped [EDIT-LIST-DROP-001]', () => {
    const editor = createEditor({
      initialValue: [
        item('P', 1, 'p', { listStart: 4 }),
        item('C', 2, 'p'),
        item('D', 2, 'p'),
      ],
      selection: undefined,
    });

    const outcome = copy(editor, [0], 'before', 1);

    expect({ numbers: numbered(editor), status: outcome.status }).toEqual({
      numbers: [
        ['P', 4],
        ['P', 5],
        ['C', 1],
        ['D', 2],
        ['C', 3],
        ['D', 4],
      ],
      status: 'copied',
    });
  });

  it.each([
    ['next to a list as part of it', 0, 2],
    ['away from lists as a list of its own', 1, 1],
  ] as const)(
    'numbers a block copy from another editor dropped %s [EDIT-LIST-DROP-001]',
    (_, at, number) => {
      const source = createEditor({
        initialValue: [item('S', 1, 's')],
        selection: undefined,
      });
      const editor = createEditor({
        initialValue: [item('X', 1, 'x'), note('n')],
        selection: undefined,
      });

      editor.api.transfer.copy({
        from: source,
        nodes: [source.key([0])!],
        to: { edge: 'after', key: editor.key([at])! },
      });

      expect(numbered(editor).find(([text]) => text === 'S')).toEqual([
        'S',
        number,
      ]);
    }
  );

  it('joins a block copy after a family of 65 deeper items [EDIT-LIST-DROP-001]', () => {
    const editor = createEditor({
      initialValue: [
        item('A', 1, 'a'),
        ...Array.from({ length: 65 }, (_, index) => item(`c${index}`, 2, 'c')),
        note('n'),
        item('S', 1, 's'),
      ],
      selection: undefined,
    });

    copy(editor, [67], 'after', 65);

    expect(editor.read.children()[66]).toMatchObject({ listId: 'a' });
  });

  it.each(['copy', 'move'] as const)(
    'walks only the deeper run beside the gap for a block %s, with 10 or 300 other list items',
    (intent) => {
      const walkedFor = (others: number) => {
        const editor = createEditor({
          initialValue: [
            ...Array.from({ length: others }, (_, index) =>
              item(`o${index}`, 1, 'o')
            ),
            note('n'),
            item('A', 1, 'a', { listType: ListType.Bulleted }),
            item('A1', 2, 'a', { listType: ListType.Bulleted }),
            item('A2', 2, 'a', { listType: ListType.Bulleted }),
            item('A3', 2, 'a', { listType: ListType.Bulleted }),
            item('B', 1, 'b', { listType: ListType.Bulleted }),
            ...Array.from({ length: others }, (_, index) =>
              item(`p${index}`, 1, 'p')
            ),
            item('S', 1, 's'),
          ],
          selection: undefined,
        });
        const before = adoptMetrics.visited;

        editor.api.transfer[intent]({
          nodes: [editor.key([2 * others + 6])!],
          to: { edge: 'after', key: editor.key([others + 4])! },
        });

        return adoptMetrics.visited - before;
      };

      expect({ ten: walkedFor(10), threeHundred: walkedFor(300) }).toEqual({
        ten: 5,
        threeHundred: 5,
      });
    }
  );

  it('walks nothing after the gap for a block copy that joins the list before it, with 10 or 300 deeper items after it', () => {
    const walkedFor = (others: number) => {
      const editor = createEditor({
        initialValue: [
          item('T', 1, 't'),
          ...Array.from({ length: others }, (_, index) =>
            item(`c${index}`, 2, 't')
          ),
          note('end'),
          note('p'),
          item('S', 1, 's'),
        ],
        selection: undefined,
      });
      const before = adoptMetrics.visited;

      copy(editor, [others + 2, others + 3], 'after', 0);

      return adoptMetrics.visited - before;
    };

    expect({ ten: walkedFor(10), threeHundred: walkedFor(300) }).toEqual({
      ten: 1,
      threeHundred: 1,
    });
  });

  it('joins a block moved into another list to that list, keeping its key [EDIT-LIST-DROP-001]', () => {
    const editor = createEditor({
      initialValue: [
        item('a1', 1, 'a'),
        item('b1', 1, 'b'),
        item('b2', 1, 'b'),
        item('a2', 1, 'a'),
      ],
      selection: undefined,
    });
    const key = editor.key([3])!;

    editor.api.transfer.move({
      nodes: [key],
      to: { edge: 'after', key: editor.key([1])! },
    });

    expect({
      keyKept: editor.key([2]) === key,
      numbers: numbered(editor),
    }).toEqual({
      keyKept: true,
      numbers: [
        ['a1', 1],
        ['b1', 1],
        ['a2', 2],
        ['b2', 3],
      ],
    });
  });

  it('joins a keyboard step past a paragraph to the next list, and gives back its list on the way back [EDIT-LIST-DROP-001]', () => {
    const editor = createEditor({
      initialValue: [
        item('a1', 1, 'a'),
        item('a2', 1, 'a'),
        note('n'),
        item('b1', 1, 'b'),
      ],
      selection: undefined,
    });
    const nodes = [editor.key([1])!];

    editor.api.transfer.move({ nodes, to: 'next' });
    const down = numbered(editor);

    editor.api.transfer.move({ nodes, to: 'previous' });

    expect({ down, up: numbered(editor) }).toEqual({
      down: [
        ['a1', 1],
        ['n', null],
        ['a2', 1],
        ['b1', 2],
      ],
      up: [
        ['a1', 1],
        ['a2', 2],
        ['n', null],
        ['b1', 1],
      ],
    });
  });

  it('drops the start of a moved first item that joins the middle of another list [EDIT-LIST-DROP-001]', () => {
    const editor = createEditor({
      initialValue: [
        item('a1', 1, 'a', { listStart: 7 }),
        item('b1', 1, 'b'),
        item('b2', 1, 'b'),
      ],
      selection: undefined,
    });

    editor.api.transfer.move({
      nodes: [editor.key([0])!],
      to: { edge: 'after', key: editor.key([1])! },
    });

    expect({
      moved: editor.read.children()[1],
      numbers: numbered(editor),
    }).toEqual({
      moved: item('a1', 1, 'b'),
      numbers: [
        ['b1', 1],
        ['a1', 2],
        ['b2', 3],
      ],
    });
  });

  it('reads the list beside the gap past the blocks that move [EDIT-LIST-DROP-001]', () => {
    const editor = createEditor({
      initialValue: [
        item('x', 1, 'x'),
        item('m1', 1, 'm'),
        item('b1', 1, 'b'),
        item('m2', 1, 'm'),
      ],
      selection: undefined,
    });

    editor.api.transfer.move({
      nodes: [editor.key([1])!, editor.key([3])!],
      to: { edge: 'before', key: editor.key([2])! },
    });

    expect(numbered(editor)).toEqual([
      ['x', 1],
      ['m1', 2],
      ['m2', 3],
      ['b1', 1],
    ]);
  });

  it('keeps the numbers and restart of a keyboard step inside its own list [EDIT-LIST-DROP-001]', () => {
    const editor = createEditor({
      initialValue: [
        item('a1', 1, 'a'),
        item('a2', 1, 'a', { listRestart: 5 }),
        item('a3', 1, 'a'),
      ],
      selection: undefined,
    });

    editor.api.transfer.move({ nodes: [editor.key([1])!], to: 'next' });

    expect(numbered(editor)).toEqual([
      ['a1', 1],
      ['a3', 2],
      ['a2', 5],
    ]);
  });

  it('keeps a keyboard step to the head of its own list in that list, under another list of its kind [EDIT-LIST-DROP-001]', () => {
    const editor = createEditor({
      initialValue: [
        item('b1', 1, 'b'),
        item('a1', 1, 'a'),
        item('a2', 1, 'a'),
      ],
      selection: undefined,
    });

    editor.api.transfer.move({ nodes: [editor.key([2])!], to: 'previous' });

    expect(numbered(editor)).toEqual([
      ['b1', 1],
      ['a2', 1],
      ['a1', 2],
    ]);
  });

  it('keeps the list and start of a moved list that joins no list [EDIT-LIST-DROP-001]', () => {
    const editor = createEditor({
      initialValue: [
        item('a1', 1, 'a'),
        item('a2', 1, 'a', { listStart: 3 }),
        note('n'),
      ],
      selection: undefined,
    });

    editor.api.transfer.move({
      nodes: [editor.key([1])!],
      to: { edge: 'after', key: editor.key([2])! },
    });

    expect({
      moved: editor.read.children()[2],
      numbers: numbered(editor),
    }).toEqual({
      moved: item('a2', 1, 'a', { listStart: 3 }),
      numbers: [
        ['a1', 1],
        ['n', null],
        ['a2', 2],
      ],
    });
  });

  it('gives a moved item without a style or start the style and start of the list whose head it joins [EDIT-LIST-DROP-001]', () => {
    const editor = createEditor({
      initialValue: [
        item('b1', 1, 'b', { listStart: 3, listStyle: 'upper-roman' }),
        item('b2', 1, 'b', { listStyle: 'upper-roman' }),
        note('n'),
        item('a', 1, 'a'),
      ],
      selection: undefined,
    });

    const outcome = editor.api.transfer.move({
      nodes: [editor.key([3])!],
      to: { edge: 'before', key: editor.key([0])! },
    });

    expect({
      moved: editor.read.children()[0],
      numbers: numbered(editor),
      status: outcome.status,
    }).toEqual({
      moved: item('a', 1, 'b', { listStart: 3, listStyle: 'upper-roman' }),
      numbers: [
        ['a', 3],
        ['b1', 4],
        ['b2', 5],
        ['n', null],
      ],
      status: 'moved',
    });
  });

  it('joins an item without a list id moved into a content root to the list there, not to its list in the main root [EDIT-LIST-DROP-001]', () => {
    const Card = definePlugin('card', {
      schema: {
        element: schema.element.textBlock({
          contentRoots: {
            body: {
              content: schema.content.type('paragraph', {
                default: { type: 'paragraph' },
                min: 1,
              }),
              ownership: 'exclusive',
            },
          },
        }),
      },
    });
    const editor = createProductEditor({
      initialValue: {
        children: [
          item('s', 1, undefined, { listStart: 7 }),
          {
            type: 'card',
            children: [{ text: '' }],
            childRoots: { body: 'card:1' },
          },
        ],
        roots: {
          'card:1': [
            item('b1', 1, undefined, { listStart: 3 }),
            item('b2', 1, undefined),
          ],
        },
      },
      plugins: [Card, BaseListPlugin],
      selection: undefined,
    });
    const body = createEditorView(editor, { root: 'card:1' });

    body.api.transfer.move({
      from: editor,
      nodes: [editor.key([0])!],
      to: { edge: 'before', key: body.key([0])! },
    });

    expect(
      body.read
        .children()
        .map((node, index) => [
          NodeApi.string(node),
          body.read.list.ordinal([index]),
        ])
    ).toEqual([
      ['s', 3],
      ['b1', 4],
      ['b2', 5],
    ]);
  });

  it.each(['after', 'before'] as const)(
    'gives a copied list its own list when its item at the join depth is another kind than the item it is dropped %s [EDIT-LIST-DROP-001]',
    (edge) => {
      const editor = createEditor({
        initialValue: [
          item('X', 1, 'x', { listType: ListType.Bulleted }),
          note('n'),
          item('B', 2, 'm', { listType: ListType.Bulleted }),
          item('N', 1, 'm'),
        ],
        selection: undefined,
      });

      copy(editor, [2, 3], edge, 0);

      const at = edge === 'after' ? 1 : 0;
      const copies = editor.read
        .children()
        .slice(at, at + 2)
        .map((node) => [NodeApi.string(node), node.listId]);

      expect(copies).toEqual([
        ['B', expect.not.stringMatching(/^[mx]$/)],
        ['N', copies[0][1]],
      ]);
    }
  );
});

describe('BaseListPlugin list identity', () => {
  const listItem = (text: string, extra: Record<string, unknown> = {}) => ({
    children: [{ text }],
    indent: 1,
    listType: ListType.Numbered,
    type: 'paragraph',
    ...extra,
  });
  const note = (text: string) => ({ children: [{ text }], type: 'paragraph' });
  const numbersOf = (editor: ReturnType<typeof createEditor>) =>
    editor.read
      .children()
      .map((node, index) =>
        node.listType ? (editor.read.list.ordinal([index]) ?? null) : null
      );

  it('restores a list without ids exactly when undo brings back a deleted item', () => {
    const editor = createEditor({
      initialValue: [listItem('A'), note('Note'), listItem('B')],
    });
    const before = editor.read.children();

    editor.update.nodes.remove({ at: [2] });
    editor.api.history.undo();

    expect(editor.read.children()).toEqual(before);
  });

  it('keeps the default list one list through Plate HTML', () => {
    const editor = createEditor({
      initialValue: [listItem('One'), note('Note'), listItem('Two')],
      selection: SelectionApi.nodes([[0], [1], [2]], { mode: 'block' }),
    });
    const data = new DataTransfer();

    editor.api.dom.clipboard.writeSelection(data);

    expect(decodedNumbers(data.getData('text/html'))).toEqual([1, null, 2]);
  });

  it('continues a list from its first item onto the list before it', () => {
    const editor = createEditor({
      initialValue: [
        listItem('One', { listId: 'a' }),
        note('Note'),
        listItem('Two', { listId: 'b' }),
        listItem('Three', { listId: 'b' }),
      ],
      selection: {
        anchor: { offset: 0, path: [2, 0] },
        focus: { offset: 0, path: [2, 0] },
        kind: 'text',
      },
    });

    editor.update.list.continue();

    expect(numbersOf(editor)).toEqual([1, null, 2, 3]);
  });

  it('toggles one item of a mixed list without changing the other kinds', () => {
    const editor = createEditor({
      initialValue: [
        listItem('One', { listId: 'a' }),
        listItem('Bullet', { listId: 'a', listType: ListType.Bulleted }),
        listItem('Two', { listId: 'a' }),
      ],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
        kind: 'text',
      },
    });

    editor.update.list.toggle({ type: ListType.Bulleted });

    expect(editor.read.children().map((node) => node.listType)).toEqual([
      ListType.Bulleted,
      ListType.Bulleted,
      ListType.Numbered,
    ]);
  });

  it('keeps a level start through Shift+Tab and Tab', () => {
    const levels = { '2': { start: 5 } };
    const editor = createEditor({
      initialValue: [
        listItem('One', { listId: 'w', listLevels: levels }),
        listItem('Nested', { indent: 2, listId: 'w', listLevels: levels }),
      ],
      selection: {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
        kind: 'text',
      },
    });

    editor.update.list.outdent();
    expect(numbersOf(editor)).toEqual([1, 2]);

    editor.plugin(BaseIndentPlugin).update.increase();
    expect(numbersOf(editor)).toEqual([1, 5]);
  });

  it('keeps an id-less item a raw edit inserts in the default list', () => {
    const editor = createEditor({
      initialValue: [
        listItem('One', { listId: 'a' }),
        listItem('Three', { listId: 'a' }),
      ],
    });

    editor.update.nodes.insert(listItem('Two'), { at: [1] });

    expect(editor.read.children()[1]).not.toHaveProperty('listId');
    expect(numbersOf(editor)).toEqual([1, 1, 2]);
  });

  it.each([
    [
      'after a block',
      (editor: ReturnType<typeof createEditor>, index: number) =>
        editor.update.list.insert(
          { type: ListType.Numbered },
          { after: [index] }
        ),
    ],
    [
      'at a path',
      (editor: ReturnType<typeof createEditor>, index: number) =>
        editor.update.list.insert(
          { type: ListType.Numbered },
          { at: [index + 1] }
        ),
    ],
    [
      'in place of an empty block',
      (editor: ReturnType<typeof createEditor>, index: number) => {
        editor.update.nodes.insert(note(''), { at: [index + 1] });
        editor.update.list.insert(
          { type: ListType.Numbered },
          { after: [index + 1], replaceEmpty: true }
        );
      },
    ],
  ])(
    'joins an item the insert command places %s by the join rule',
    (_name, insert) => {
      const editor = createEditor({
        initialValue: [
          listItem('Default'),
          listItem('A', { listId: 'a' }),
          note('Note'),
        ],
      });

      // Last first, so earlier indexes stay put.
      for (const index of [2, 1, 0]) insert(editor, index);

      const [, defaultItem, , listItemA, , afterNote] = editor.read.children();

      expect(defaultItem).not.toHaveProperty('listId');
      expect(listItemA).toHaveProperty('listId', 'a');
      expect(afterNote.listId).toEqual(expect.any(String));
      expect(afterNote.listId).not.toBe('a');
      expect(numbersOf(editor)).toEqual([1, 2, 1, 2, null, 1]);
    }
  );

  it('keeps a latent start through a kind change and shows it when it applies', () => {
    const editor = createEditor({
      initialValue: [
        listItem('One', { listId: 'a' }),
        listItem('Four', { listId: 'a', listStart: 4 }),
      ],
      selection: {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
        kind: 'text',
      },
    });

    editor.update.list.toggle({ type: ListType.Bulleted });
    expect(editor.read.children()[1]).toHaveProperty('listStart', 4);

    editor.update.nodes.remove({ at: [0] });
    editor.update.list.toggle({ type: ListType.Numbered });
    expect(numbersOf(editor)).toEqual([4]);
  });

  it('gives parsed list items outside list elements fresh ids', () => {
    const [first, second] = parseHtmlChildren(
      createEditor({ selection: undefined }),
      '<p data-list-type="bulleted" data-indent="1" data-list-id="x">A</p><p data-list-type="bulleted" data-indent="1" data-list-id="x">B</p>'
    );

    expect(first).toHaveProperty('listId', second.listId);
    expect(first.listId).not.toBe('x');
  });

  it('keeps a bulleted item latent start through Plate HTML', () => {
    const editor = createEditor({
      initialValue: [
        listItem('Bullet', { listStart: 4, listType: ListType.Bulleted }),
      ],
      selection: SelectionApi.nodes([[0]], { mode: 'block' }),
    });
    const data = new DataTransfer();

    editor.api.dom.clipboard.writeSelection(data);

    expect(
      parseHtmlChildren(
        createEditor({ selection: undefined }),
        data.getData('text/html')
      )[0]
    ).toMatchObject({ listStart: 4, listType: ListType.Bulleted });
  });

  it('keeps the start of a nested HTML list', () => {
    expect(
      decodedNumbers('<ol><li>Parent<ol start="5"><li>Five</li></ol></li></ol>')
    ).toEqual([1, 5]);
  });

  it('keeps the list identity and level rules a list element names', () => {
    const levels = '{&quot;1&quot;:{&quot;label&quot;:&quot;%1)&quot;}}';
    const children = parseHtmlChildren(
      createEditor({ selection: undefined }),
      ['a', 'b', 'a', 'b']
        .map(
          (id, index) =>
            `<ol data-list-id="${id}" data-list-levels="${levels}" start="${[1, 1, 2, 2][index]}"><li>${id}</li></ol>`
        )
        .join('')
    );
    const loaded = createEditor({
      initialValue: children as never,
      selection: undefined,
    });

    expect(children.map((node) => node.listId === children[0].listId)).toEqual([
      true,
      false,
      true,
      false,
    ]);
    expect(children[1].listId).toBe(children[3].listId);
    expect(children[0]).toMatchObject({
      listLevels: { '1': { label: '%1)' } },
    });
    expect(numbersOf(loaded)).toEqual([1, 1, 2, 2]);

    loaded.update.nodes.remove({ at: [1] });

    expect(numbersOf(loaded)).toEqual([1, 2, 1]);
  });

  it('keeps the start of a later nested HTML list under another item', () => {
    expect(
      decodedNumbers(
        '<ol><li>P1<ol><li>C1</li></ol></li><li>P2<ol start="2"><li>C2</li></ol></li></ol>'
      )
    ).toEqual([1, 1, 2, 2]);
  });

  it('keeps a default-list item in its list when its properties change', () => {
    const editor = createEditor({
      initialValue: [
        listItem('A'),
        listItem('B', { listId: 'b' }),
        listItem('C'),
      ],
      selection: undefined,
    });

    editor.update.list.restart({ at: [0], start: 7 });

    expect(editor.read.children()[0]).not.toHaveProperty('listId');
    expect(numbersOf(editor)).toEqual([7, 1, 8]);

    editor.update.nodes.set({ listType: ListType.Bulleted }, { at: [0] });
    editor.update.nodes.set({ listType: ListType.Numbered }, { at: [0] });

    expect(editor.read.children()[0]).not.toHaveProperty('listId');
  });

  it('continues a typed number at the same cost in a longer document', () => {
    const recountFor = (notes: number) => {
      const editor = createProductEditor({
        initialValue: [
          ...Array.from({ length: notes }, (_note, index) =>
            listItem(`${index}`, { listId: 'far' })
          ),
          listItem('One', { listId: 'a' }),
          note('Note'),
          { children: [{ text: '2.' }], type: 'paragraph' },
        ],
        plugins: [
          BaseListPlugin.configure({
            inputRules: [OrderedListRules.markdown()],
          }),
        ],
        selection: {
          kind: 'text',
          anchor: { offset: 2, path: [notes + 2, 0] },
          focus: { offset: 2, path: [notes + 2, 0] },
        },
      });

      editor.read.list.ordinal([0]);

      const before = getListIndexMetrics().visited;

      editor.update.text.insert(' ');

      expect(editor.read.children()[notes + 2]).toHaveProperty('listId', 'a');
      expect(editor.read.list.ordinal([notes + 2])).toBe(2);

      return getListIndexMetrics().visited - before;
    };

    expect(recountFor(1000)).toBe(recountFor(10));
  });

  it('starts a new list where a typed number follows a list in a table cell', () => {
    const editor = createProductEditor({
      initialValue: [
        {
          children: [
            {
              children: [
                {
                  children: [listItem('One', { listId: 'cell' })],
                  type: 'tableCell',
                },
              ],
              type: 'tableRow',
            },
          ],
          type: 'table',
        },
        { children: [{ text: '2. Two' }], type: 'paragraph' },
      ],
      plugins: [
        BaseTablePlugin,
        BaseListPlugin.configure({
          inputRules: [OrderedListRules.markdown()],
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [1, 0] },
        focus: { offset: 2, path: [1, 0] },
      },
    } as never);

    editor.update.text.insert(' ');

    expect(editor.read.children()[1]).toMatchObject({
      listType: ListType.Numbered,
    });
    expect(editor.read.children()[1].listId).not.toBe('cell');
    expect(editor.read.list.ordinal([1])).toBe(2);
  });

  describe('paste', () => {
    it.each(listPasteCases)(
      'comparison: $id [EDIT-CLIPBOARD-LIST-LANDING-001]',
      ({ at, before, copied, target }) => {
        const editor = createEditor({
          initialValue: before.map(({ text, n: _number, ...props }) => ({
            ...props,
            children: [{ text }],
            type: 'paragraph',
          })),
          selection: {
            kind: 'text',
            anchor: { offset: at[1], path: [at[0], 0] },
            focus: { offset: at[1], path: [at[0], 0] },
          },
        });

        editor.update.slice.replace(
          ContentSlice.fromJSON({
            content: copied.map(({ text, ...props }) => ({
              ...props,
              children: [{ text }],
              type: 'paragraph',
            })),
            openStart: 1,
            openEnd: 1,
          })
        );

        expect(
          editor.read.children().map((node, index) => ({
            checked: node.checked,
            indent: node.indent ?? 0,
            listStyle: node.listStyle,
            listType: node.listType,
            n: editor.read.list.ordinal([index]) ?? null,
            text: NodeApi.string(node),
          }))
        ).toEqual(
          target.map((row) => ({
            checked: undefined,
            listStyle: undefined,
            listType: undefined,
            ...row,
          }))
        );
      }
    );

    const cell = (...children: Value) => ({
      children: [
        { children: [{ children, type: 'tableCell' }], type: 'tableRow' },
      ],
      type: 'table',
    });
    const paste = (
      initialValue: Value,
      selection: CreateEditorOptions['selection'],
      content: unknown[],
      open = 0,
      options: Pick<CreateEditorOptions, 'maxLength' | 'schema'> = {}
    ) => {
      const editor = createProductEditor({
        initialValue,
        plugins: [
          BaseHeadingPlugin,
          BaseBlockquotePlugin,
          BaseCalloutPlugin,
          BaseColumnPlugin,
          BaseIndentPlugin,
          BaseTablePlugin,
          BaseListPlugin.configure({
            targetPlugins: [BaseParagraphPlugin, BaseHeadingPlugin],
          }),
        ],
        selection,
        ...options,
      });

      editor.update.slice.replace(
        ContentSlice.fromJSON({ content, openStart: open, openEnd: open })
      );

      return editor;
    };

    const roman = (text: string) =>
      listItem(text, { listId: 'roman', listStyle: 'upper-roman' });
    const atCaret = (offset: number) => ({
      anchor: { offset, path: [2, 0] },
      focus: { offset, path: [2, 0] },
      kind: 'text' as const,
    });

    for (const open of [0, 1]) {
      for (const offset of [0, 3, 7]) {
        it.each([
          { name: 'siblings', depths: [3, 3], landed: [1, 1], numbers: [3, 4] },
          {
            name: 'parent and children',
            depths: [2, 3, 3, 2],
            landed: [1, 2, 2, 1],
            numbers: [3, 1, 2, 4],
          },
          {
            name: 'deep to shallow',
            depths: [3, 3, 2, 2, 1],
            landed: [1, 1, 1, 1, 1],
            numbers: [3, 4, 5, 6, 7],
          },
        ])(
          `lands $name at caret ${offset} with open edges ${open}`,
          ({ depths, landed, numbers }) => {
            const editor = paste(
              [roman('Roman 1'), roman('Roman 2'), roman('Roman 3')],
              atCaret(offset),
              depths.map((indent, index) =>
                listItem(String(index), { indent, listId: 'copy' })
              ),
              open
            );
            const nodes = editor.read.children().slice(2);

            expect({
              depths: nodes.map((node) => node.indent),
              numbers: numbersOf(editor).slice(2),
              texts: nodes.map(NodeApi.string),
            }).toEqual({
              depths: landed,
              numbers,
              texts: depths.map(
                (_, index) =>
                  `${index === 0 ? 'Roman 3'.slice(0, offset) : ''}${index}${index === depths.length - 1 ? 'Roman 3'.slice(offset) : ''}`
              ),
            });
          }
        );
      }
    }

    it('keeps the later copied parent for a descending then ascending forest', () => {
      const editor = paste(
        [roman('Roman 1'), roman('Roman 2'), roman('Roman 3')],
        atCaret(7),
        [3, 2, 3].map((indent, index) => listItem(String(index), { indent })),
        1
      );

      expect(
        editor.read
          .children()
          .slice(2)
          .map((node) => node.indent)
      ).toEqual([1, 1, 2]);
    });

    it('keeps the copied gap between a parent and its child', () => {
      const editor = paste(
        [roman('Roman 1'), roman('Roman 2'), roman('Roman 3')],
        atCaret(7),
        [2, 4].map((indent, index) => listItem(String(index), { indent })),
        1
      );

      expect(
        editor.read
          .children()
          .slice(2)
          .map((node) => node.indent)
      ).toEqual([1, 3]);
    });

    it('keeps mixed numbered and bulleted items in one copied list', () => {
      const editor = paste(
        [roman('Roman 1'), roman('Roman 2'), roman('Roman 3')],
        atCaret(7),
        [
          listItem('One', { indent: 3, listId: 'copy' }),
          listItem('Bullet', {
            indent: 3,
            listId: 'copy',
            listType: ListType.Bulleted,
          }),
          listItem('Two', { indent: 3, listId: 'copy' }),
        ],
        1
      );

      expect(numbersOf(editor)).toEqual([1, 2, 3, null, 4]);
    });

    it('ends copied ancestry at an indented paragraph without changing its indent', () => {
      const editor = paste(
        [roman('Roman 1'), roman('Roman 2'), roman('Roman 3')],
        atCaret(7),
        [
          listItem('Parent', { indent: 2 }),
          { ...note('Note'), indent: 4 },
          listItem('A', { indent: 3 }),
          listItem('B', { indent: 3 }),
        ],
        1
      );

      expect(
        editor.read
          .children()
          .slice(2)
          .map((node) => node.indent)
      ).toEqual([1, 4, 1, 1]);
    });

    it('leaves indented paragraphs alone', () => {
      const editor = paste(
        [roman('Roman 1'), roman('Roman 2'), roman('Roman 3')],
        atCaret(7),
        [
          { ...note('A'), indent: 4 },
          { ...note('B'), indent: 5 },
        ],
        1
      );

      expect(
        editor.read
          .children()
          .slice(2)
          .map((node) => node.indent)
      ).toEqual([1, 5]);
    });

    it('joins only the first of two copied lists', () => {
      const editor = paste(
        [roman('Roman 1'), roman('Roman 2'), roman('Roman 3')],
        atCaret(7),
        [
          listItem('A', { listId: 'one', listStyle: 'upper-roman' }),
          listItem('B', { listId: 'one', listStyle: 'upper-roman' }),
          note('Note'),
          listItem('C', { listId: 'two' }),
          listItem('D', { listId: 'two' }),
        ],
        1
      );

      expect(numbersOf(editor)).toEqual([1, 2, 3, 4, null, 1, 2]);
    });

    it.each([
      { order: 'list first', nested: false },
      { order: 'code first', nested: false },
      { order: 'list first', nested: true },
      { order: 'code first', nested: true },
    ])(
      'keeps copied code and paragraph items with $order, nested=$nested',
      ({ order, nested }) => {
        const list = BaseListPlugin.configure({
          targetPlugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
        });
        const initial = nested
          ? [{ type: 'blockquote', children: [note('')] }]
          : [note('')];
        const editor = createProductEditor({
          plugins: [
            BaseBlockquotePlugin,
            BaseIndentPlugin.configure({
              targetPlugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
            }),
            ...(order === 'list first'
              ? [list, BaseCodeBlockPlugin]
              : [BaseCodeBlockPlugin, list]),
          ],
          initialValue: initial,
        });

        expect(
          editor.update.fragment.replace(
            [{ ...listItem('Head'), type: 'codeBlock' }, listItem('Tail')],
            { at: { path: nested ? [0, 0, 0] : [0, 0], offset: 0 } }
          )
        ).toBe(true);
        const blocks = editor.read.nodes.children(nested ? [0] : []);
        expect(
          blocks.map((node) => ({
            type: node.type,
            text: NodeApi.string(node),
            listType: node.listType,
            indent: node.indent,
          }))
        ).toEqual([
          { type: 'codeBlock', text: 'Head', listType: 'numbered', indent: 1 },
          { type: 'paragraph', text: 'Tail', listType: 'numbered', indent: 1 },
        ]);
        expect(blocks[1].listId).toBe(blocks[0].listId);
        editor.api.history.undo();
        expect(editor.read.children()).toEqual(initial);
      }
    );

    it.each([false, true])(
      'keeps tasks copied through one open quote into an empty heading, afterList=%s',
      (afterList) => {
        const initial = [
          ...(afterList ? [task('Previous')] : []),
          emptyHeading(),
        ];
        const index = afterList ? 1 : 0;
        const editor = paste(
          initial,
          caretAt([index, 0]),
          [
            {
              type: 'blockquote',
              children: [task('A'), task('B', false)],
            },
          ],
          2
        );

        expect(editor.read.children().slice(index)).toMatchObject([
          { ...task('A'), type: 'paragraph' },
          { ...task('B', false), type: 'paragraph' },
        ]);
        if (afterList) {
          expect(editor.read.children()[index].listId).toBe(
            editor.read.children()[0].listId
          );
        }
        editor.api.history.undo();
        expect(editor.read.children()).toEqual(initial);
      }
    );

    it('continues numbering when a quote-wrapped list lands on the empty line below it', () => {
      const editor = paste(
        [roman('One'), roman('Two'), note('')],
        atCaret(0),
        [
          {
            type: 'blockquote',
            children: [
              listItem('A', { indent: 3 }),
              listItem('B', { indent: 3 }),
            ],
          },
        ],
        2
      );

      expect(numbersOf(editor)).toEqual([1, 2, 3, 4]);
      expect(editor.read.children().slice(2)).toMatchObject([
        {
          indent: 1,
          listId: 'roman',
          listStyle: 'upper-roman',
          children: [{ text: 'A' }],
        },
        {
          indent: 1,
          listId: 'roman',
          listStyle: 'upper-roman',
          children: [{ text: 'B' }],
        },
      ]);
    });

    it('lands copied siblings through their open quote wrapper', () => {
      const editor = paste(
        [roman('Roman 1'), roman('Roman 2'), roman('Roman 3')],
        atCaret(7),
        [
          {
            children: [
              listItem('A', { indent: 3 }),
              listItem('B', { indent: 3 }),
            ],
            type: 'blockquote',
          },
        ],
        2
      );

      expect(
        editor.read
          .children()
          .map((node) => ({ text: NodeApi.string(node), indent: node.indent }))
      ).toEqual([
        { text: 'Roman 1', indent: 1 },
        { text: 'Roman 2', indent: 1 },
        { text: 'Roman 3A', indent: 1 },
        { text: 'B', indent: 1 },
      ]);
    });

    const caretAt = (path: number[], offset = 0) => ({
      anchor: { offset, path },
      focus: { offset, path },
      kind: 'text' as const,
    });
    const task = (text: string, checked = true) =>
      listItem(text, { checked, listType: ListType.Task });
    const emptyHeading = () => ({ ...note(''), level: 1, type: 'heading' });

    it.each(['slice', 'fragment'] as const)(
      'preserves copied level starts when %s rebases a list',
      (method) => {
        const before = [note('')];
        const editor = createEditor({
          initialValue: before,
          selection: caretAt([0, 0]),
        });
        const copied = ['A', 'B'].map((text) =>
          listItem(text, {
            indent: 3,
            listId: 'copy',
            listLevels: { '3': { start: 7 } },
          })
        );

        if (method === 'slice') {
          editor.update.slice.replace(
            ContentSlice.fromJSON({
              content: copied,
              openStart: 0,
              openEnd: 0,
            })
          );
        } else editor.update.fragment.replace(copied);

        expect({
          depths: editor.read.children().map((node) => node.indent),
          numbers: numbersOf(editor),
        }).toEqual({ depths: [1, 1], numbers: [7, 8] });
        editor.api.history.undo();
        expect(editor.read.children()).toEqual(before);
      }
    );

    it('preserves copied restart rules below the copied forest', () => {
      const before = [note('')];
      const levels = {
        '3': { start: 7 },
        '4': { restartAfter: 2, start: 4 },
      };
      const editor = paste(
        before,
        caretAt([0, 0]),
        [3, 4, 3, 4].map((indent, index) =>
          listItem(String(index), {
            indent,
            listId: 'copy',
            listLevels: levels,
          })
        )
      );

      expect({
        depths: editor.read.children().map((node) => node.indent),
        numbers: numbersOf(editor),
      }).toEqual({ depths: [1, 2, 1, 2], numbers: [7, 4, 8, 5] });
      editor.api.history.undo();
      expect(editor.read.children()).toEqual(before);
    });

    it('preserves copy-permitted marks when the first item replaces a heading', () => {
      const EphemeralMark = definePlugin('ephemeral', {
        schema: {
          mark: {
            property: property.boolean(),
            copy: 'preserve',
            typeChange: 'drop',
          },
        },
      });
      const before = [emptyHeading()];
      const copied = ['A', 'B'].map((text) => ({
        ...listItem(text),
        children: [{ text, ephemeral: true }],
      }));
      const editor = createProductEditor({
        plugins: [
          BaseHeadingPlugin,
          BaseIndentPlugin,
          BaseListPlugin.configure({
            targetPlugins: [BaseParagraphPlugin, BaseHeadingPlugin],
          }),
          EphemeralMark,
        ],
        initialValue: before,
        selection: caretAt([0, 0]),
      });

      expect(
        editor.update.slice.replace(
          ContentSlice.fromJSON({
            content: copied,
            openStart: 1,
            openEnd: 1,
          })
        )
      ).toBe(true);
      expect(
        editor.read.children().map((node) => ({
          type: node.type,
          children: node.children,
        }))
      ).toEqual(
        copied.map((node) => ({
          type: node.type,
          children: node.children,
        }))
      );
      editor.api.history.undo();
      expect(editor.read.children()).toEqual(before);
    });

    it('keeps both surviving empty tasks after the length limit discards their head', () => {
      const before = [note('X'), emptyHeading()];
      const editor = paste(
        before,
        caretAt([1, 0]),
        [
          task('A'),
          { ...task(''), checked: false },
          { ...task(''), checked: true },
        ],
        1,
        { maxLength: 1 }
      );

      expect(
        editor.read
          .children()
          .slice(1)
          .map((node) => ({
            type: node.type,
            listType: node.listType,
            checked: node.checked,
          }))
      ).toEqual([
        { type: 'paragraph', listType: 'task', checked: false },
        { type: 'paragraph', listType: 'task', checked: true },
      ]);
      editor.api.history.undo();
      expect(editor.read.children()).toEqual(before);
    });

    it('lands the items left after the length limit cuts the first one at the caret depth [EDIT-CLIPBOARD-LIST-LANDING-001]', () => {
      const editor = paste(
        [listItem('L', { listId: 'l' })],
        caretAt([0, 0], 1),
        [
          listItem('A', { listId: 's' }),
          listItem('', { indent: 2, listId: 's' }),
          listItem('', { indent: 2, listId: 's' }),
        ],
        1,
        { maxLength: 1 }
      );

      expect(editor.read.children()).toEqual([
        listItem('L', { listId: 'l' }),
        listItem('', { listId: 'l' }),
      ]);
    });

    it('pastes nothing from a quote-wrapped list once the length limit is spent [EDIT-CLIPBOARD-LIST-LANDING-001]', () => {
      const before = [note('X'), note('')];
      const editor = paste(
        before,
        caretAt([1, 0]),
        [
          {
            type: 'blockquote',
            children: [
              listItem('A', { indent: 3 }),
              listItem('', { indent: 3 }),
              listItem('', { indent: 3 }),
            ],
          },
        ],
        2,
        { maxLength: 1 }
      );

      expect(editor.read.children()).toEqual(before);
    });

    it('adopts the copied type at the destination chosen by a later paste handler', () => {
      const RetargetPaste = definePlugin('retargetPaste', {
        commands: ({ around }) => [
          around(editorCommands.replaceSlice, ({ input, next }) =>
            next({
              ...input,
              options: { at: { path: [1, 0], offset: 0 } },
            })
          ),
        ],
      });
      const before = [emptyHeading(), emptyHeading()];
      const editor = createProductEditor({
        plugins: [
          BaseHeadingPlugin,
          BaseIndentPlugin,
          BaseListPlugin.configure({
            targetPlugins: [BaseParagraphPlugin, BaseHeadingPlugin],
          }),
          RetargetPaste,
        ],
        initialValue: before,
        selection: caretAt([0, 0]),
      });

      expect(editor.update.fragment.replace([task('A'), task('B')])).toBe(true);
      expect(editor.read.children()).toMatchObject([
        before[0],
        task('A'),
        task('B'),
      ]);
      editor.api.history.undo();
      expect(editor.read.children()).toEqual(before);
    });

    it.each([
      { name: 'paragraph', value: [note('')], path: [0, 0], parent: [] },
      {
        name: 'numbered item',
        value: [listItem('One'), listItem('')],
        path: [1, 0],
        parent: [],
      },
      {
        name: 'quote paragraph',
        value: [{ children: [note('')], type: 'blockquote' }],
        path: [0, 0, 0],
        parent: [0],
      },
      {
        name: 'table cell',
        value: [cell(note(''))],
        path: [0, 0, 0, 0, 0],
        parent: [0, 0, 0],
      },
      { name: 'heading', value: [emptyHeading()], path: [0, 0], parent: [] },
      {
        name: 'quote heading',
        value: [{ children: [emptyHeading()], type: 'blockquote' }],
        path: [0, 0, 0],
        parent: [0],
      },
      {
        name: 'column',
        value: [
          {
            type: 'columnGroup',
            children: [
              { type: 'column', width: '50%', children: [note('')] },
              { type: 'column', width: '50%', children: [note('Side')] },
            ],
          },
        ],
        path: [0, 0, 0, 0],
        parent: [0, 0],
      },
    ])(
      'keeps tasks in an empty $name and undoes the entire paste [EDIT-CLIPBOARD-LIST-LANDING-001]',
      ({ value, path, parent }) => {
        const editor = paste(
          value,
          caretAt(path),
          [task('T1'), task('T2', false)],
          1
        );
        const items = editor.read.nodes.children(parent).slice(-2);

        expect(items).toMatchObject([
          {
            checked: true,
            children: [{ text: 'T1' }],
            indent: 1,
            listType: ListType.Task,
            type: 'paragraph',
          },
          {
            checked: false,
            children: [{ text: 'T2' }],
            indent: 1,
            listType: ListType.Task,
            type: 'paragraph',
          },
        ]);
        expect(items[0]).not.toHaveProperty('level');
        expect(editor.read.selection()?.anchor).toEqual({
          path: [...parent, path.at(-2)! + 1, 0],
          offset: 2,
        });
        editor.api.history.undo();
        expect(editor.read.children()).toEqual(value);
      }
    );

    it.each([0, 1])(
      'lets the empty item restart win with open edges %s',
      (open) => {
        const value = [listItem('One'), listItem('', { listRestart: 5 })];
        const editor = paste(
          value,
          caretAt([1, 0]),
          [listItem('A', { listRestart: 7 }), listItem('B')],
          open
        );

        expect(numbersOf(editor)).toEqual([1, 5, 6]);
        editor.api.history.undo();
        expect(editor.read.children()).toEqual(value);
      }
    );

    it('preserves the empty line id when the copied head has no id', () => {
      const editor = createProductEditor({
        plugins: [ElementIdPlugin, BaseTextAlignPlugin, BaseListPlugin],
        initialValue: [{ ...note(''), id: 'line', textAlign: 'center' }],
        selection: caretAt([0, 0]),
      });
      editor.update.slice.replace(
        ContentSlice.fromJSON({
          content: [task('A'), task('B')],
          openStart: 1,
          openEnd: 1,
        })
      );

      expect(editor.read.children()[0]).toMatchObject({
        id: 'line',
        textAlign: 'center',
        listType: ListType.Task,
      });
    });

    it.each(['slice', 'fragment'] as const)(
      'keeps the first task type at an explicit point through %s replacement',
      (entry) => {
        const value = [note('Elsewhere'), note('')];
        const editor = createEditor({
          initialValue: value,
          selection: caretAt([0, 0]),
        });
        const content = [task('A'), task('B')];
        const options = { at: { path: [1, 0], offset: 0 } };

        if (entry === 'slice') {
          editor.update.slice.replace(
            ContentSlice.fromJSON({ content, openStart: 1, openEnd: 1 }),
            options
          );
        } else editor.update.fragment.replace(content, options);
        expect(editor.read.children()).toMatchObject([
          note('Elsewhere'),
          { ...task('A'), indent: 1 },
          { ...task('B'), indent: 1 },
        ]);
        editor.api.history.undo();
        expect(editor.read.children()).toEqual(value);
      }
    );

    it.each(['slice', 'fragment'] as const)(
      'keeps a copied restart through %s replacement',
      (entry) => {
        const value = [listItem('One'), listItem('')];
        const editor = createEditor({
          initialValue: value,
          selection: caretAt([1, 0]),
        });
        const content = [listItem('A', { listRestart: 7 }), listItem('B')];

        if (entry === 'slice') {
          editor.update.slice.replace(
            ContentSlice.fromJSON({ content, openStart: 1, openEnd: 1 })
          );
        } else editor.update.fragment.replace(content);
        expect(numbersOf(editor)).toEqual([1, 7, 8]);
        editor.api.history.undo();
        expect(editor.read.children()).toEqual(value);
      }
    );

    it('uses an explicit caret independently of the current node selection', () => {
      const editor = createEditor({
        initialValue: [note('')],
        selection: SelectionApi.nodes([[0]], { mode: 'block' }),
      });

      editor.update.slice.replace(
        ContentSlice.fromJSON({
          content: [task('A'), task('B')],
          openStart: 1,
          openEnd: 1,
        }),
        { at: caretAt([0, 0]) }
      );

      expect(editor.read.children()).toMatchObject([
        { ...task('A'), indent: 1 },
        { ...task('B'), indent: 1 },
      ]);
    });

    it.each([
      {
        name: 'plain line',
        value: [listItem('One'), note('')],
        path: [1, 0],
        parent: [],
        style: undefined,
      },
      {
        name: 'indented plain line',
        value: [listItem('One'), { ...note(''), indent: 2 }],
        path: [1, 0],
        parent: [],
        style: undefined,
      },
      {
        name: 'Roman list',
        value: [roman('One'), note('')],
        path: [1, 0],
        parent: [],
        style: 'upper-roman',
      },
      {
        name: 'quote line',
        value: [{ children: [listItem('One'), note('')], type: 'blockquote' }],
        path: [0, 1, 0],
        parent: [0],
        style: undefined,
      },
    ])(
      'continues the list above an empty $name',
      ({ value, path, parent, style }) => {
        const editor = paste(
          value,
          caretAt(path),
          [listItem('A', { indent: 3 }), listItem('B', { indent: 3 })],
          1
        );
        const items = editor.read.nodes.children(parent);

        expect(
          items.map((node, i) => ({
            depth: node.indent,
            style: node.listStyle,
            n: editor.read.list.ordinal([...parent, i]),
          }))
        ).toEqual([
          { depth: 1, style, n: 1 },
          { depth: 1, style, n: 2 },
          { depth: 1, style, n: 3 },
        ]);
        editor.api.history.undo();
        expect(editor.read.children()).toEqual(value);
      }
    );

    it.each([undefined, 4])(
      'lands items at level one in an occupied plain paragraph with indent %s',
      (indent) => {
        const value = [
          { ...note('Hello'), ...(indent === undefined ? {} : { indent }) },
        ];
        const editor = paste(
          value,
          caretAt([0, 0], 5),
          [listItem('A', { indent: 3 }), listItem('B', { indent: 3 })],
          1
        );

        expect(editor.read.children()).toMatchObject([
          { ...value[0], children: [{ text: 'HelloA' }] },
          { indent: 1, children: [{ text: 'B' }] },
        ]);
        editor.api.history.undo();
        expect(editor.read.children()).toEqual(value);
      }
    );

    it('does not join the list above when the copy starts with a plain paragraph', () => {
      const value = [listItem('One'), note('')];
      const editor = paste(
        value,
        caretAt([1, 0]),
        [note('Intro'), listItem('A'), listItem('B')],
        1
      );

      expect(numbersOf(editor)).toEqual([1, null, 1, 2]);
      editor.api.history.undo();
      expect(editor.read.children()).toEqual(value);
    });

    it.each(['fragment', 'HTML'] as const)(
      'continues after a list through %s input',
      (entry) => {
        const value = [listItem('One'), note('')];
        const editor = createEditor({
          initialValue: value,
          selection: caretAt([1, 0]),
        });

        if (entry === 'fragment') {
          editor.update.fragment.replace([listItem('A')]);
        } else {
          const data = new DataTransfer();
          data.setData('text/html', '<ol><li>A</li><li>B</li></ol>');
          editor.api.dom.clipboard.insertData(data);
        }
        expect(numbersOf(editor)).toEqual(
          entry === 'fragment' ? [1, 2] : [1, 2, 3]
        );
        editor.api.history.undo();
        expect(editor.read.children()).toEqual(value);
      }
    );

    it.each([
      { name: 'heading', line: emptyHeading() },
      { name: 'list item', line: listItem('', { listRestart: 5 }) },
      { name: 'callout', line: { ...note(''), icon: '⚠️', type: 'callout' } },
    ])('keeps an empty $name when pasting plain lines', ({ line }) => {
      const editor = paste([line], caretAt([0, 0]), [note('A'), note('B')], 1);

      expect(editor.read.children()[0]).toEqual({
        ...line,
        children: [{ text: 'A' }],
      });
    });

    it('keeps the empty line type for one open list item', () => {
      const editor = paste([note('')], caretAt([0, 0]), [task('A')], 1);

      expect(editor.read.children()).toEqual([note('A')]);
    });

    it('keeps an empty callout when pasting two list items', () => {
      const line = { ...note(''), icon: '⚠️', type: 'callout' };
      const editor = paste([line], caretAt([0, 0]), [task('A'), task('B')], 1);

      expect(editor.read.children()[0]).toEqual({
        ...line,
        children: [{ text: 'A' }],
      });
    });

    it('keeps selected empty blocks under the length limit on the ordinary paste path', () => {
      const editor = paste(
        [note('')],
        SelectionApi.nodes([[0]], { mode: 'block' }),
        [task('AA'), task('B')],
        1,
        { maxLength: 1 }
      );

      expect(editor.read.children()).toEqual([note('A')]);
      expect(editor.read.selection()?.anchor).toEqual({
        path: [0, 0],
        offset: 1,
      });
    });

    it('keeps the task type and valid caret under the length limit', () => {
      const editor = paste(
        [note('')],
        caretAt([0, 0]),
        [task('AA'), task('B')],
        1,
        { maxLength: 1 }
      );

      expect(editor.read.children()).toMatchObject([
        { ...task('A'), indent: 1 },
      ]);
      expect(editor.read.selection()?.anchor).toEqual({
        path: [0, 0],
        offset: 1,
      });
      editor.api.history.undo();
      expect(editor.read.children()).toEqual([note('')]);
    });

    it('does not adopt a discarded head when the length limit leaves only empty content', () => {
      const value = [note('X'), note('')];
      const editor = paste(
        value,
        caretAt([1, 0]),
        [task('A'), { ...task(''), checked: false }],
        1,
        { maxLength: 1 }
      );

      expect(editor.read.children()).toEqual(value);
    });

    it('copies a closed list item with its own content root into an empty top-level paragraph', () => {
      const RootedItem = definePlugin('rootedListItem', {
        schema: {
          element: schema.element.textBlock({
            contentRoots: {
              body: {
                content: schema.content.type('paragraph', {
                  default: { type: 'paragraph' },
                  min: 1,
                }),
                ownership: 'exclusive',
              },
            },
          }),
        },
      });
      const editor = createProductEditor({
        plugins: [
          RootedItem,
          BaseIndentPlugin.configure({
            targetPlugins: [BaseParagraphPlugin, RootedItem],
          }),
          BaseListPlugin.configure({
            targetPlugins: [BaseParagraphPlugin, RootedItem],
          }),
        ],
        initialValue: {
          children: [
            {
              type: 'rootedListItem',
              children: [{ text: 'Source' }],
              indent: 1,
              listType: 'numbered',
              childRoots: { body: 'caption' },
            },
            note(''),
          ],
          roots: { caption: [note('Caption')] },
        },
        selection: caretAt([1, 0]),
      });
      const slice = editor.read.slice.get({
        at: SelectionApi.nodes([[0]], { mode: 'block' }),
      });

      expect(editor.update.slice.replace(slice)).toBe(true);
      expect(editor.read.root('caption:copy')).toEqual([note('Caption')]);
      expect(editor.read.children()[0].childRoots).toEqual({ body: 'caption' });
      expect(editor.read.children()[1]).toMatchObject({
        type: 'rootedListItem',
        childRoots: { body: 'caption:copy' },
      });
    });

    it.each([
      {
        name: 'direct',
        before: [note('')],
        content: [
          listItem('Head', {
            type: 'ownedText',
            childRoots: { body: 'copied' },
            indent: 3,
            listId: 'source',
          }),
          listItem('Tail', { indent: 3, listId: 'source' }),
        ],
        maxLength: undefined,
        texts: ['Head', 'Tail'],
        ordinals: [1, 2],
      },
      {
        name: 'truncated',
        before: [note('X'), note('')],
        content: [
          listItem('A', { indent: 3, listId: 'source' }),
          listItem('', {
            type: 'ownedText',
            childRoots: { body: 'copied' },
            indent: 3,
            listId: 'source',
          }),
        ],
        maxLength: 1,
        texts: ['X', ''],
        ordinals: [undefined, 1],
      },
      {
        name: 'after-list',
        before: [listItem('One', { listId: 'target' }), note('')],
        content: [
          listItem('Head', {
            type: 'ownedText',
            childRoots: { body: 'copied' },
            indent: 3,
            listId: 'source',
          }),
          listItem('Tail', { indent: 3, listId: 'source' }),
        ],
        maxLength: undefined,
        texts: ['One', 'Head', 'Tail'],
        ordinals: [1, 2, 3],
      },
    ])(
      'imports a closed list slice with an exclusive content root ($name)',
      ({ before, content, maxLength, texts, ordinals }) => {
        const targetIndex = before.length - 1;
        const Owned = definePlugin('ownedText', {
          schema: {
            element: schema.element.textBlock({
              object: true,
              contentRoots: {
                body: {
                  content: schema.content.type('paragraph', {
                    default: { type: 'paragraph' },
                    min: 1,
                  }),
                  ownership: 'exclusive',
                },
              },
            }),
          },
        });
        const editor = createProductEditor({
          plugins: [
            Owned,
            BaseListPlugin.configure({
              targetPlugins: [BaseParagraphPlugin, Owned],
            }),
          ],
          initialValue: before,
          maxLength,
          selection: caretAt([targetIndex, 0]),
        });

        expect(
          editor.update.slice.replace(
            ContentSlice.fromJSON({
              content,
              roots: { copied: [note('Payload')] },
              openStart: 0,
              openEnd: 0,
            })
          )
        ).toBe(true);
        expect(editor.read.children().map(NodeApi.string)).toEqual(texts);
        expect(editor.read.children()[targetIndex]).toMatchObject({
          type: 'ownedText',
          listType: ListType.Numbered,
          indent: 1,
          childRoots: { body: 'copied:copy' },
        });
        expect(editor.read.root('copied:copy')).toEqual([note('Payload')]);
        expect(
          editor.read
            .children()
            .map((_, index) => editor.read.list.ordinal([index]))
        ).toEqual(ordinals);
        editor.api.history.undo();
        expect(editor.read.value()).toEqual({ children: before });
      }
    );

    it.each([false, true])(
      'keeps an open object list head and target restart (%s)',
      (restart) => {
        const Owned = definePlugin('ownedText', {
          schema: { element: schema.element.textBlock({ object: true }) },
        });
        const before = [restart ? listItem('', { listRestart: 5 }) : note('')];
        const editor = createProductEditor({
          plugins: [
            Owned,
            BaseListPlugin.configure({
              targetPlugins: [BaseParagraphPlugin, Owned],
            }),
          ],
          initialValue: before,
          selection: caretAt([0, 0]),
        });

        expect(
          editor.update.slice.replace(
            ContentSlice.fromJSON({
              content: [
                listItem('Head', {
                  type: 'ownedText',
                  indent: 3,
                  listId: 'source',
                  ...(restart ? { listRestart: 7 } : {}),
                }),
                listItem('Tail', { indent: 3, listId: 'source' }),
              ],
              openStart: 1,
              openEnd: 1,
            })
          )
        ).toBe(true);
        expect(editor.read.children()[0]).toMatchObject({
          type: 'ownedText',
          listType: ListType.Numbered,
          indent: 1,
        });
        expect(editor.read.children().map(NodeApi.string)).toEqual([
          'Head',
          'Tail',
        ]);
        expect(numbersOf(editor)).toEqual(restart ? [5, 6] : [1, 2]);
        editor.api.history.undo();
        expect(editor.read.children()).toEqual(before);
      }
    );

    it.each([false, true])(
      'pastes a copied rooted head only with the roots actually selected (%s) [EDIT-CLIPBOARD-LIST-LANDING-001]',
      (wholeOwner) => {
        const Owned = definePlugin('owned', {
          schema: {
            element: schema.element.textBlock({
              object: true,
              contentRoots: {
                body: {
                  content: schema.content.type('paragraph', {
                    default: { type: 'paragraph' },
                    min: 1,
                  }),
                  ownership: 'exclusive',
                },
              },
            }),
          },
        });
        const list = BaseListPlugin.configure({
          targetPlugins: [BaseParagraphPlugin, Owned],
        });
        const source = createProductEditor({
          plugins: [Owned, list],
          initialValue: {
            children: [
              listItem('Caption', {
                type: 'owned',
                childRoots: { body: 'body' },
                listId: 'source',
              }),
              listItem('Tail', { listId: 'source' }),
              note('After'),
            ],
            roots: { body: [note('Body')] },
          },
        });
        const before = source.read.value();
        const slice = source.read.slice.get({
          at: wholeOwner
            ? SelectionApi.nodes([[0], [1]], { mode: 'block' })
            : {
                anchor: { path: [0, 0], offset: 1 },
                focus: { path: [1, 0], offset: 4 },
              },
        });
        const target = createProductEditor({
          plugins: [Owned, list],
          initialValue: [note('')],
          selection: caretAt([0, 0]),
        });

        expect(target.update.slice.replace(slice)).toBe(true);
        expect(target.read.children().map(NodeApi.string)).toEqual([
          wholeOwner ? 'Caption' : 'aption',
          'Tail',
        ]);
        expect(target.read.children()[0].type).toBe(
          wholeOwner ? 'owned' : 'paragraph'
        );
        expect(Object.values(target.read.value().roots ?? {})).toEqual(
          wholeOwner ? [[note('Body')]] : []
        );
        expect(source.read.value()).toEqual(before);
      }
    );

    it('starts a fresh list when the whole object paste cannot fit beside the preceding item [EDIT-CLIPBOARD-LIST-LANDING-001]', () => {
      const Image = definePlugin('image', {
        schema: { element: schema.element.textBlock({ object: true }) },
      });
      const Limited = definePlugin('limited', {
        schema: {
          element: {
            content: schema.content.types(['paragraph', 'image'], {
              default: { type: 'paragraph' },
              min: 1,
              max: 2,
            }),
          },
        },
      });
      const initial = [
        {
          type: 'limited',
          children: [listItem('One', { listId: 'target' }), note('')],
        },
      ];
      const editor = createProductEditor({
        plugins: [
          Image,
          Limited,
          BaseListPlugin.configure({
            targetPlugins: [BaseParagraphPlugin, Image],
          }),
        ],
        initialValue: initial,
        selection: caretAt([0, 1, 0]),
      });

      expect(
        editor.update.slice.replace(
          ContentSlice.closed([
            listItem('Head', { type: 'image', listId: 'source' }),
            listItem('Tail', { listId: 'source' }),
          ])
        )
      ).toBe(true);
      const nodes = editor.read.children();
      expect(nodes[0]).toEqual(initial[0]);
      expect(nodes.slice(1).map(NodeApi.string)).toEqual(['Head', 'Tail']);
      expect(nodes[1].listId).not.toBe('target');
      expect(nodes[2].listId).toBe(nodes[1].listId);
    });

    it('keeps an object list head inside an empty quote', () => {
      const Owned = definePlugin('ownedText', {
        schema: { element: schema.element.textBlock({ object: true }) },
      });
      const before = [{ type: 'blockquote', children: [note('')] }];
      const editor = createProductEditor({
        plugins: [
          Owned,
          BaseBlockquotePlugin,
          BaseListPlugin.configure({
            targetPlugins: [BaseParagraphPlugin, Owned],
          }),
        ],
        initialValue: before,
        selection: caretAt([0, 0, 0]),
      });

      expect(
        editor.update.slice.replace(
          ContentSlice.fromJSON({
            content: [
              listItem('Head', {
                type: 'ownedText',
                indent: 3,
                listId: 'source',
              }),
              listItem('Tail', { indent: 3, listId: 'source' }),
            ],
            openStart: 1,
            openEnd: 1,
          })
        )
      ).toBe(true);
      expect(editor.read.children()[0].children).toEqual([
        expect.objectContaining({
          type: 'ownedText',
          listType: 'numbered',
          indent: 1,
          children: [{ text: 'Head' }],
        }),
        expect.objectContaining({
          type: 'paragraph',
          listType: 'numbered',
          indent: 1,
          children: [{ text: 'Tail' }],
        }),
      ]);
      expect(editor.read.selection()?.focus).toEqual({
        path: [0, 1, 0],
        offset: 4,
      });
      editor.api.history.undo();
      expect(editor.read.children()).toEqual(before);
    });

    it.each(['paragraph', 'ownedText'] as const)(
      'keeps the target restart on the surviving head after truncation (%s)',
      (type) => {
        const Owned = definePlugin('ownedText', {
          schema: { element: schema.element.textBlock({ object: true }) },
        });
        const before = [
          note('X'),
          listItem('', { listId: 'target', listRestart: 5 }),
        ];
        const editor = createProductEditor({
          plugins: [
            Owned,
            BaseListPlugin.configure({
              targetPlugins: [BaseParagraphPlugin, Owned],
            }),
          ],
          initialValue: before,
          maxLength: 1,
          selection: caretAt([1, 0]),
        });

        editor.update.slice.replace(
          ContentSlice.fromJSON({
            content: [
              listItem('A', { indent: 3, listId: 'source' }),
              listItem('', {
                type,
                indent: 3,
                listId: 'source',
                listRestart: 7,
              }),
            ],
            openStart: type === 'paragraph' ? 0 : 1,
            openEnd: type === 'paragraph' ? 0 : 1,
          })
        );
        expect(editor.read.children()[1]).toMatchObject({
          type,
          listRestart: 5,
        });
        expect(editor.read.list.ordinal([1])).toBe(5);
        expect(editor.read.selection()?.focus).toEqual({
          path: [1, 0],
          offset: 0,
        });
        if (type === 'ownedText') {
          editor.api.history.undo();
          expect(editor.read.children()).toEqual(before);
        }
      }
    );

    it('joins a surviving numbered object after the length limit discards a task head', () => {
      const Owned = definePlugin('ownedText', {
        schema: { element: schema.element.textBlock({ object: true }) },
      });
      const initial = [roman('1'), roman('2'), roman('')];
      const editor = createProductEditor({
        plugins: [
          Owned,
          BaseListPlugin.configure({
            targetPlugins: [BaseParagraphPlugin, Owned],
          }),
        ],
        initialValue: initial,
        maxLength: 2,
        selection: atCaret(0),
      });

      expect(
        editor.update.slice.replace(
          ContentSlice.closed([
            { ...task('A'), indent: 3, listId: 'task-source' },
            listItem('', {
              type: 'ownedText',
              indent: 3,
              listId: 'object-source',
            }),
          ])
        )
      ).toBe(true);
      expect(numbersOf(editor)).toEqual([1, 2, 3]);
      expect(editor.read.children()[2]).toMatchObject({
        type: 'ownedText',
        indent: 1,
        listId: 'roman',
        listStyle: 'upper-roman',
      });
      editor.api.history.undo();
      expect(editor.read.children()).toEqual(initial);
    });

    it('imports the surviving object root after truncation inside a quote', () => {
      const Owned = definePlugin('ownedText', {
        schema: {
          element: schema.element.textBlock({
            object: true,
            contentRoots: {
              body: {
                content: schema.content.type('paragraph', {
                  default: { type: 'paragraph' },
                  min: 1,
                }),
                ownership: 'exclusive',
              },
            },
          }),
        },
      });
      const before = [note('X'), { type: 'blockquote', children: [note('')] }];
      const editor = createProductEditor({
        plugins: [
          Owned,
          BaseBlockquotePlugin,
          BaseListPlugin.configure({
            targetPlugins: [BaseParagraphPlugin, Owned],
          }),
        ],
        initialValue: before,
        maxLength: 1,
        selection: caretAt([1, 0, 0]),
      });

      expect(
        editor.update.slice.replace(
          ContentSlice.fromJSON({
            content: [
              task('A'),
              {
                type: 'ownedText',
                children: [{ text: '' }],
                childRoots: { body: 'copied' },
              },
            ],
            roots: { copied: [note('Payload')] },
            openStart: 0,
            openEnd: 0,
          })
        )
      ).toBe(true);
      expect(editor.read.children()[1].children[0]).toMatchObject({
        type: 'ownedText',
        childRoots: { body: 'copied:copy' },
      });
      expect(editor.read.root('copied:copy')).toEqual([note('Payload')]);
      editor.api.history.undo();
      expect(editor.read.value()).toEqual({ children: before });
    });

    it.each([
      { name: 'an object-only', target: note(''), truncated: false },
      { name: 'a truncated list', target: note(''), truncated: true },
      {
        name: 'a truncated list over explicit target starts',
        target: listItem('', { listStart: 3, listRestart: 5 }),
        truncated: true,
      },
    ])(
      'inserts a horizontal rule after $name paste',
      ({ target, truncated }) => {
        const before = [note('X'), target];
        const editor = createProductEditor({
          plugins: [BaseHorizontalRulePlugin, BaseListPlugin],
          initialValue: before,
          maxLength: 1,
          selection: caretAt([1, 0]),
        });

        expect(
          editor.update.slice.replace(
            ContentSlice.fromJSON({
              content: [
                ...(truncated ? [task('A')] : []),
                {
                  type: editor.plugin(BaseHorizontalRulePlugin).schema.type,
                  children: [{ text: '' }],
                },
              ],
              openStart: 0,
              openEnd: 0,
            })
          )
        ).toBe(true);
        expect(editor.read.children()[1]).toEqual({
          type: editor.plugin(BaseHorizontalRulePlugin).schema.type,
          children: [{ text: '' }],
        });
        expect(editor.read.children().map(NodeApi.string)).toEqual(['X', '']);
        editor.api.history.undo();
        expect(editor.read.children()).toEqual(before);
      }
    );

    it('continues the list a named root holds when whole items land on its empty line', () => {
      const RootHolder = definePlugin('pasteRootHolder', {
        schema: {
          element: {
            blockContent: true,
            void: 'block',
            contentRoots: {
              body: {
                content: schema.content.type('paragraph', {
                  default: { type: 'paragraph' },
                  min: 1,
                }),
                ownership: 'exclusive',
              },
            },
          },
        },
      });
      const main = [
        listItem('Main', { listId: 'main', listStyle: 'lower-alpha' }),
        {
          type: 'pasteRootHolder',
          childRoots: { body: 'note' },
          children: [{ text: '' }],
        },
      ];
      const editor = createProductEditor({
        plugins: [RootHolder, BaseListPlugin],
        initialValue: {
          children: main,
          roots: { note: [roman('One'), note('')] },
        },
        selection: {
          kind: 'text',
          anchor: { root: 'note', path: [1, 0], offset: 0 },
          focus: { root: 'note', path: [1, 0], offset: 0 },
        },
      });
      editor.update.slice.replace(
        ContentSlice.fromJSON({
          content: [
            listItem('A', { listId: 'copy' }),
            listItem('B', { listId: 'copy' }),
          ],
          openStart: 1,
          openEnd: 1,
        })
      );

      expect(editor.read.root('note')).toEqual([
        roman('One'),
        roman('A'),
        roman('B'),
      ]);
      expect(editor.read.children()).toEqual(main);
    });

    it('keeps paragraph-only root content when a pasted list starts with a heading', () => {
      const editor = paste(
        [note('')],
        caretAt([0, 0]),
        [{ ...listItem('A'), level: 2, type: 'heading' }, listItem('B')],
        1,
        { schema: { root: schema.content.type('paragraph', { min: 1 }) } }
      );

      expect(
        editor.read.children().map((node) => ({
          type: node.type,
          text: NodeApi.string(node),
        }))
      ).toEqual([
        { type: 'paragraph', text: 'A' },
        { type: 'paragraph', text: 'B' },
      ]);
      expect(numbersOf(editor)).toEqual([null, 1]);
      expect(editor.read.children()[0].listType).toBeUndefined();
      expect(editor.read.children()[1]).toMatchObject({
        listType: ListType.Numbered,
        indent: 1,
      });
    });

    it('keeps the actual landing identity when schema rejects the list prefix', () => {
      const editor = paste(
        [roman('One'), emptyHeading(), note('Body')],
        caretAt([1, 0]),
        [listItem('A', { listId: 'copy' }), listItem('B', { listId: 'copy' })],
        1,
        {
          schema: {
            root: schema.content.prefix(
              [
                { element: BaseParagraphPlugin },
                { element: BaseHeadingPlugin, properties: { level: 1 } },
              ],
              schema.content.group('block', {
                default: { type: 'paragraph' },
                min: 1,
              })
            ),
          },
        }
      );

      expect(numbersOf(editor)).toEqual([1, null, 1, null]);
      expect(editor.read.children()[2].listId).not.toBe('roman');
    });

    it('respects a schema-required heading when a task paste cannot change its type', () => {
      const value = [emptyHeading(), note('Body')];
      const editor = paste(value, caretAt([0, 0]), [task('A'), task('B')], 1, {
        schema: {
          root: schema.content.prefix(
            [{ element: BaseHeadingPlugin, properties: { level: 1 } }],
            schema.content.group('block', {
              default: { type: 'paragraph' },
              min: 1,
            })
          ),
        },
      });

      expect(editor.read.children()).toMatchObject([
        { children: [{ text: 'A' }], level: 1, type: 'heading' },
        { children: [{ text: 'B' }], listType: ListType.Task },
        note('Body'),
      ]);
    });

    it('starts a fresh list for a numbered list pasted into a numbered heading item', () => {
      const heading = (text: string) => ({
        ...listItem(text, { listId: 'h' }),
        level: 1,
        type: 'heading',
      });
      const editor = paste(
        [heading('H1'), heading('H2')],
        {
          anchor: { offset: 2, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
          kind: 'text',
        },
        [listItem('C', { listId: 's' }), listItem('D', { listId: 's' })]
      );

      expect(numbersOf(editor)).toEqual([1, 1, 2]);
    });

    it('keeps a list that lives only inside a pasted table apart from the list it lands in', () => {
      const editor = paste(
        [listItem('A', { listId: 'a' }), listItem('B', { listId: 'a' })],
        SelectionApi.nodes([[1]], { mode: 'block' }),
        [cell(listItem('X', { listId: 'cell' }))]
      );

      expect(editor.read.list.ordinal([1, 0, 0, 0])).toBe(1);
    });

    it('keeps one counter for a pasted list that continues through a table cell', () => {
      const editor = paste(
        [note('target')],
        SelectionApi.nodes([[0]], { mode: 'block' }),
        [
          listItem('A', { listId: 's', listStart: 5 }),
          cell(listItem('X', { listId: 's' })),
          listItem('B', { listId: 's' }),
        ]
      );

      expect(
        [[0], [1, 0, 0, 0], [2]].map((path) => editor.read.list.ordinal(path))
      ).toEqual([5, 6, 7]);
    });

    it('joins a pasted list that continues through a table cell to the item it lands on', () => {
      const editor = paste(
        [
          listItem('L1', { listId: 'l' }),
          listItem('L2', { listId: 'l' }),
          listItem('L3', { listId: 'l' }),
        ],
        SelectionApi.nodes([[1]], { mode: 'block' }),
        [
          listItem('A', { listId: 's' }),
          cell(listItem('X', { listId: 's' })),
          listItem('B', { listId: 's' }),
        ]
      );

      expect(
        [[0], [1], [2, 0, 0, 0], [3], [4]].map((path) =>
          editor.read.list.ordinal(path)
        )
      ).toEqual([1, 2, 3, 4, 5]);
    });

    it('keeps the start of a pasted head over a list head', () => {
      const editor = paste(
        [
          listItem('A', { listId: 'l', listStart: 5 }),
          listItem('B', { listId: 'l' }),
        ],
        SelectionApi.nodes([[0]], { mode: 'block' }),
        [
          listItem('X', { listId: 's', listStart: 7 }),
          listItem('Y', { listId: 's' }),
        ]
      );

      expect(numbersOf(editor)).toEqual([7, 8, 9]);
    });

    it('keeps the restart of a pasted head inside a list', () => {
      const editor = paste(
        [
          listItem('A', { listId: 'l' }),
          listItem('B', { listId: 'l' }),
          listItem('C', { listId: 'l' }),
        ],
        SelectionApi.nodes([[1]], { mode: 'block' }),
        [
          listItem('X', { listId: 's', listRestart: 7, listStart: 7 }),
          listItem('Y', { listId: 's' }),
        ]
      );

      expect(numbersOf(editor)).toEqual([1, 7, 8, 9]);
    });
  });
});

describe('BaseListPlugin keystroke cost', () => {
  const listed = (text: string, listId: string) => ({
    children: [{ text }],
    indent: 1,
    listId,
    listType: ListType.Numbered,
    type: 'paragraph',
  });
  const paragraph = (text: string) => ({
    children: [{ text }],
    type: 'paragraph',
  });
  type KeystrokeEditor = ReturnType<typeof createProductEditor>;
  const keystrokes: Array<
    [string, (editor: KeystrokeEditor, at: number) => void]
  > = [
    ['typing in an item', (editor) => editor.update.text.insert('x')],
    ['Enter at the end of an item', (editor) => editor.update.break.insert()],
    [
      'Enter after typing in an item',
      (editor) => {
        editor.update.text.insert('x');
        editor.update.break.insert();
      },
    ],
    [
      'Backspace at the start of an item',
      (editor, at) => {
        editor.update.selection.set({
          anchor: { offset: 0, path: [at + 2, 0] },
          focus: { offset: 0, path: [at + 2, 0] },
          kind: 'text',
        });
        editor.update.text.deleteBackward();
      },
    ],
    ['indenting an item', (editor) => editor.update.indent.increase()],
    [
      'a typed number that continues the list',
      (editor, at) => {
        editor.update.selection.set({
          anchor: { offset: 2, path: [at + 4, 0] },
          focus: { offset: 2, path: [at + 4, 0] },
          kind: 'text',
        });
        editor.update.text.insert(' ');
      },
    ],
  ];

  it.each(keystrokes)(
    'counts the same list work for %s with 10 or 300 other lists',
    (_name, keystroke) => {
      const recountFor = (lists: number) => {
        const at = lists * 11;
        const editor = createProductEditor({
          initialValue: [
            ...Array.from({ length: lists }, (_list, list) => [
              ...Array.from({ length: 10 }, (_item, index) =>
                listed(`${list}.${index}`, `l${list}`)
              ),
              paragraph('Between'),
            ]).flat(),
            listed('One', 'a'),
            listed('Two', 'a'),
            listed('Three', 'a'),
            paragraph('Note'),
            paragraph('4.'),
          ],
          plugins: [
            BaseIndentPlugin,
            BaseListPlugin.configure({
              inputRules: [OrderedListRules.markdown()],
            }),
          ],
          selection: {
            kind: 'text',
            anchor: { offset: 3, path: [at + 1, 0] },
            focus: { offset: 3, path: [at + 1, 0] },
          },
        } as never);

        editor.read.list.ordinal([0]);

        const children = editor.read.children();
        const before = getListIndexMetrics().visited;

        keystroke(editor, at);

        expect(editor.read.children()).not.toBe(children);

        return getListIndexMetrics().visited - before;
      };

      expect(recountFor(300)).toBe(recountFor(10));
    }
  );
});

describe('BaseListPlugin named views', () => {
  it('converts a Details title in a named view while the main root starts with a Details', () => {
    const details = (title: string) => ({
      children: [
        { children: [{ text: title }], type: 'summary' },
        { children: [{ text: 'Body' }], type: 'paragraph' },
      ],
      type: 'details',
    });
    const HeaderHolder = definePlugin('testHeaderHolder', {
      schema: {
        element: {
          blockContent: true,
          contentRoots: {
            header: {
              content: schema.content.any(
                [
                  schema.content.type('blockquote').allowed,
                  schema.content.type('details').allowed,
                  schema.content.type('paragraph').allowed,
                ],
                { default: { type: 'paragraph' }, min: 1 }
              ),
              ownership: 'exclusive',
            },
          },
          void: 'block',
        },
      },
    });
    const editor = createProductEditor({
      initialValue: {
        children: [
          details('Main'),
          {
            childRoots: { header: 'header' },
            children: [{ text: '' }],
            type: 'testHeaderHolder',
          },
        ],
        roots: {
          header: [{ children: [details('Head')], type: 'blockquote' }],
        },
      },
      plugins: [
        BaseParagraphPlugin,
        BaseBlockquotePlugin,
        BaseDetailsPlugin,
        BaseListPlugin,
        HeaderHolder,
      ],
    });
    const header = createEditorView(editor, { root: 'header' });

    expect(
      header
        .plugin(BaseListPlugin)
        .update.toggle({ at: [0, 0, 0], type: ListType.Bulleted })
    ).toBe(true);
    expect(
      header.read.children()[0].children.map((node) => NodeApi.string(node))
    ).toEqual(['Head', 'Body']);
    expect(header.read.nodes.get([0, 0])![0]).toMatchObject({
      indent: 1,
      listType: ListType.Bulleted,
      type: 'paragraph',
    });
  });
});

void BaseParagraphPlugin;
void PLUGINS;
