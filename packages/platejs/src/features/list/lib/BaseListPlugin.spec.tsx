import {
  BaseParagraphPlugin,
  ContentSlice,
  createEditor as createProductEditor,
  definePlugin,
  ElementApi,
  NodeApi,
  PLUGINS,
  schema,
  SelectionApi,
  transferVeto,
  type CreateEditorOptions,
  type InitialValue,
  type Value,
} from '../../../core';
import { BaseHeadingPlugin } from '../../basic-nodes/lib/BaseHeadingPlugins';
import { BaseIndentPlugin } from '../../indent';
import { BaseImagePlugin } from '../../media';
import { BaseTablePlugin } from '../../table';
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
      { listType: 'numbered', type: 'heading' },
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
      selection: SelectionApi.nodes([[0], [2]]),
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
      selection: SelectionApi.nodes([[0]]),
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
      selection: SelectionApi.nodes([[0]]),
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
      selection: SelectionApi.nodes([[0], [1], [2]]),
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
      'at the end of a block',
      (editor: ReturnType<typeof createEditor>, index: number) =>
        editor.update.list.insert(
          { type: ListType.Numbered },
          {
            at: {
              offset: NodeApi.string(editor.read.children()[index]).length,
              path: [index, 0],
            },
          }
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
      selection: SelectionApi.nodes([[0]]),
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
    const cell = (...children: unknown[]) => ({
      children: [
        { children: [{ children, type: 'tableCell' }], type: 'tableRow' },
      ],
      type: 'table',
    });
    const paste = (
      initialValue: unknown[],
      selection: CreateEditorOptions['selection'],
      content: unknown[]
    ) => {
      const editor = createProductEditor({
        initialValue,
        plugins: [
          BaseHeadingPlugin,
          BaseTablePlugin,
          BaseListPlugin.configure({
            targetPlugins: [BaseParagraphPlugin, BaseHeadingPlugin],
          }),
        ],
        selection,
      } as never);

      editor.update.slice.replace(ContentSlice.closed(content as never));

      return editor;
    };

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
        SelectionApi.nodes([[1]]),
        [cell(listItem('X', { listId: 'cell' }))]
      );

      expect(editor.read.list.ordinal([1, 0, 0, 0])).toBe(1);
    });

    it('keeps one counter for a pasted list that continues through a table cell', () => {
      const editor = paste([note('target')], SelectionApi.nodes([[0]]), [
        listItem('A', { listId: 's', listStart: 5 }),
        cell(listItem('X', { listId: 's' })),
        listItem('B', { listId: 's' }),
      ]);

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
        SelectionApi.nodes([[1]]),
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
        SelectionApi.nodes([[0]]),
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
        SelectionApi.nodes([[1]]),
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

void BaseParagraphPlugin;
void PLUGINS;
