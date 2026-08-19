import {
  BaseParagraphPlugin,
  createBaseEditor as createTypedEditor,
  defineBasePlugin,
  type BaseEditorOptions,
} from '@platejs/core';
import { BaseIndentPlugin } from '@platejs/indent';
import {
  ElementApi,
  schema,
  SelectionApi,
  type InitialValue,
  type Value,
} from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

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

const createEditor = (
  options: Omit<BaseEditorOptions, 'plugins'> & {
    initialValue?: InitialValue<Value>;
  } = {}
) =>
  createTypedEditor({
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

  it('repairs incompatible persisted list properties', () => {
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
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Numbered' }],
        indent: 1,
        listRestart: 5,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Task' }],
        indent: 1,
        listType: 'task',
        type: 'paragraph',
      },
      { children: [{ text: 'Plain' }], type: 'paragraph' },
    ]);
  });

  it('keeps single-item toggles inside heading sequence boundaries', () => {
    const HeadingPlugin = defineBasePlugin(PLUGINS.heading, {
      schema: { element: schema.element.textBlock() },
    });
    const editor = createTypedEditor({
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
        listType: 'bulleted',
        type: 'paragraph',
      },
    ]);
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

    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'One' }],
        indent: 1,
        listStart: 4,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Two' }],
        indent: 1,
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

  it('applies an explicit restart to the selected list boundary', () => {
    const editor = createEditor({
      initialValue: ['One', 'Two', 'Three'].map((text) => ({
        children: [{ text }],
        indent: 1,
        listType: 'numbered' as const,
        type: 'paragraph',
      })),
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [2, 0] },
        focus: { offset: 5, path: [2, 0] },
      },
    });

    editor.update.list.toggle({
      listRestart: 7,
      type: ListType.Numbered,
    });

    expect(editor.read.children()[0]).not.toHaveProperty('listRestart');
    expect(editor.read.children()[2]).toHaveProperty('listRestart', 7);
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

  it('indents and outdents through semantic list fields', () => {
    const editor = createEditor();

    editor.update.list.indent({
      listStyle: ListStyle.Circle,
      type: ListType.Bulleted,
    });
    expect(editor.read.children()[0]).toMatchObject({
      indent: 1,
      listStyle: 'circle',
      listType: 'bulleted',
    });

    editor.update.list.outdent();
    expect(editor.read.children()[0]).toEqual({
      children: [{ text: 'Item' }],
      type: 'paragraph',
    });
  });

  it('clears fields incompatible with an indented list kind', () => {
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'Seven' }],
          indent: 1,
          listRestart: 7,
          listStyle: 'lower-alpha',
          listType: 'numbered',
          type: 'paragraph',
        },
      ],
    });

    editor.update.list.indent({ type: ListType.Bulleted });

    expect(editor.read.children()[0]).toEqual({
      children: [{ text: 'Seven' }],
      indent: 2,
      listType: 'bulleted',
      type: 'paragraph',
    });

    editor.update.list.indent({ type: ListType.Task });

    expect(editor.read.children()[0]).toEqual({
      checked: false,
      children: [{ text: 'Seven' }],
      indent: 3,
      listType: 'task',
      type: 'paragraph',
    });
  });

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
      editor.api.html.deserialize({
        element:
          '<ol start="4"><li>One</li><li>Two</li></ol><ul style="list-style-type: square"><li>Three</li></ul>',
      })
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
    ['circle', 'bulleted'],
    ['lower-alpha', 'numbered'],
  ] as const)('infers %s standalone list items as %s', (listStyle, listType) => {
    const editor = createEditor({ selection: undefined });

    expect(
      editor.api.html.deserialize({
        element: `<li aria-level="2" style="list-style-type: ${listStyle}">Item</li>`,
      })
    ).toMatchObject([{ indent: 2, listStyle, listType }]);
  });

  it('preserves isolated ordinals without freezing a copied sequence', () => {
    const editor = createEditor({ selection: undefined });

    expect(
      editor.api.html.deserialize({
        element: '<ol start="5"><li data-list-type="numbered">Five</li></ol>',
      })
    ).toMatchObject([{ listStart: 5, listType: 'numbered' }]);
    const sequence = editor.api.html.deserialize({
      element:
        '<ol start="5"><li data-list-type="numbered">Five</li></ol><ol start="6"><li data-list-type="numbered">Six</li></ol>',
    });

    if (!sequence) throw new TypeError('Expected decoded list sequence');

    expect(sequence).toMatchObject([
      { listStart: 5, listType: 'numbered' },
      { listType: 'numbered' },
    ]);
    expect(sequence[1]).not.toHaveProperty('listStart');
    const externalBoundary = editor.api.html.deserialize({
      element: '<ol><li>One</li></ol><ol start="5"><li>Five</li></ol>',
    });

    expect(externalBoundary).toMatchObject([
      { listType: 'numbered' },
      { listRestart: 5, listType: 'numbered' },
    ]);
    expect(
      editor.api.html.deserialize({
        element: '<ol><li>One</li></ol><ol><li>One again</li></ol>',
      })
    ).toMatchObject([
      { listType: 'numbered' },
      { listRestart: 1, listType: 'numbered' },
    ]);
    const multiItemSequence = editor.api.html.deserialize({
      element:
        '<ol start="4"><li data-list-type="numbered">Four</li><li data-list-type="numbered">Five</li></ol><ol start="6"><li data-list-type="numbered">Six</li></ol>',
    });

    if (!multiItemSequence) {
      throw new TypeError('Expected decoded multi-item list sequence');
    }

    expect(multiItemSequence[2]).not.toHaveProperty('listStart');
    const conditional = editor.api.html.deserialize({
      element:
        '<ol start="4"><li data-list-start="4" data-list-type="numbered">Four</li></ol>',
    });

    expect(conditional).toMatchObject([{ listStart: 4, listType: 'numbered' }]);
    expect(conditional?.[0]).not.toHaveProperty('listRestart');
    const mixedRootIndents = editor.api.html.deserialize({
      element:
        '<ol start="1"><li data-list-type="numbered">One</li></ol><ol start="2"><li data-indent="1" data-list-type="numbered">Two</li></ol>',
    });

    if (!mixedRootIndents) {
      throw new TypeError('Expected decoded root list sequence');
    }

    expect(mixedRootIndents[1]).not.toHaveProperty('listStart');
    const mixedDefaultStyles = editor.api.html.deserialize({
      element:
        '<ol start="1"><li data-list-style="decimal" data-list-type="numbered">One</li></ol><ol start="2"><li data-list-type="numbered">Two</li></ol>',
    });

    if (!mixedDefaultStyles) {
      throw new TypeError('Expected decoded default-marker sequence');
    }

    expect(mixedDefaultStyles[1]).not.toHaveProperty('listStart');
    const nestedSequence = editor.api.html.deserialize({
      element:
        '<ol start="1"><li data-indent="1" data-list-type="numbered">One</li></ol><ol start="1"><li data-indent="2" data-list-type="numbered">Nested</li></ol><ol start="2"><li data-indent="1" data-list-type="numbered">Two</li></ol>',
    });

    if (!nestedSequence) {
      throw new TypeError('Expected decoded nested list sequence');
    }

    expect(nestedSequence[2]).not.toHaveProperty('listStart');
    expect(
      editor.api.html.deserialize({
        element:
          '<ol start="5"><li data-list-restart="5" data-list-type="numbered">Five</li></ol>',
      })
    ).toMatchObject([{ listRestart: 5, listType: 'numbered' }]);
  });

  it('decodes checked HTML items as task lists', () => {
    const editor = createEditor({ selection: undefined });

    expect(
      editor.api.html.deserialize({
        element: '<ul><li data-checked="false">Task</li></ul>',
      })
    ).toMatchObject([
      {
        checked: false,
        listType: 'task',
      },
    ]);
  });

  it('encodes a forced restart in Plate clipboard HTML', () => {
    const point = { offset: 0, path: [0, 0] };
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
      selection: SelectionApi.node([0], { anchor: point, focus: point }),
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
    const point = { offset: 0, path: [0, 0] };
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
      selection: SelectionApi.node([0], { anchor: point, focus: point }),
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
    const point = { offset: 0, path: [2, 0] };
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
      selection: SelectionApi.node([2], { anchor: point, focus: point }),
    });
    const data = new DataTransfer();

    editor.api.dom.clipboard.writeSelection(data);

    const body = new DOMParser().parseFromString(
      data.getData('text/html'),
      'text/html'
    ).body;

    expect(body.querySelector('ol')?.getAttribute('start')).toBe('2');
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
      const editor = createTypedEditor({
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

  it('joins an existing sequence without forcing the typed start', () => {
    const editor = createTypedEditor({
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
    const CalloutPlugin = defineBasePlugin('callout', {
      schema: {
        element: schema.element.textBlock(),
      },
    });
    const editor = createTypedEditor({
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
});

void BaseParagraphPlugin;
void PLUGINS;
