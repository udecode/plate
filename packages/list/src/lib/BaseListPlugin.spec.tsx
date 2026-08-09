/** @jsx jsxt */

import {
  BaseParagraphPlugin,
  createBaseEditor as createTypedBaseEditor,
  defineBasePlugin,
  type BaseEditorOptions,
  type BasePluginInput,
} from '@platejs/core';
import {
  getPlateRuntime,
  prepareHtmlPluginContext,
  prepareHtmlRegistry,
} from '@platejs/core/internal';
import { BaseIndentPlugin } from '@platejs/indent';
import {
  ContentSlice,
  createEditor as createPliteEditor,
  DocumentChange,
  schema,
  type Element,
  type InitialValue,
  type NodeEntry,
  type Value,
} from '@platejs/plite';
import { writeHostFragmentData } from '@platejs/plite-dom';
import { jsxt, type TestEditor } from '@platejs/test-utils';

import { PLUGINS } from '@platejs/utils';
import {
  BaseListPlugin,
  BulletedListRules,
  isOrderedList,
  ListStyleType,
  OrderedListRules,
  TaskListRules,
} from './BaseListPlugin';

jsxt;

const createBaseEditor = <const P extends readonly BasePluginInput[]>(
  options: Omit<BaseEditorOptions, 'plugins'> & {
    initialValue?: InitialValue<Value>;
    plugins: P;
  }
) =>
  createTypedBaseEditor({
    ...options,
    editor: createPliteEditor<Value>(),
  });

const FixtureHeadingPlugin = defineBasePlugin(PLUGINS.h1, {
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
});

const createListEditorFromFixture = (fixture: TestEditor) =>
  createBaseEditor({
    plugins: [BaseListPlugin, FixtureHeadingPlugin],
    initialValue:
      fixture.children.length > 0
        ? fixture.children
        : [{ children: [{ text: '' }], type: 'paragraph' }],
  });

const assertScopedListTypes = () => {
  const editor = createBaseEditor({
    plugins: [BaseListPlugin],
  });
  const list = editor.plugin(BaseListPlugin);

  editor.read.list.expandItemsWithChildren([]);
  editor.read.list.isActive(['disc', 'circle']);
  editor.update.list.toggle({ at: [0], listStyleType: 'disc' });
  editor.update.list.indent({ at: { offset: 0, path: [0, 0] } });
  editor.update.list.outdent();

  list.read.expandItemsWithChildren([]);
  list.read.isActive(['disc', 'circle']);
  list.update.toggle({ at: [0], listStyleType: 'disc' });
  list.update.indent({ at: { offset: 0, path: [0, 0] } });
  list.update.outdent({
    at: {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [1, 0] },
    },
  });

  editor.update((tx) => tx.indent.increase());

  // @ts-expect-error toggle requires a list style
  list.update.toggle({});
  // @ts-expect-error Indent methods stay on the Indent portal
  list.update.increase();
};

void assertScopedListTypes;

describe('BaseListPlugin', () => {
  const transformListHtml = (data: string) => {
    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
    });
    const createContext = prepareHtmlPluginContext(editor, BaseListPlugin);
    const context = editor.read((state) => createContext(state));
    const transformData = prepareHtmlRegistry(editor).plugins.find(
      ({ name }) => name === BaseListPlugin.name
    )?.transformData;

    if (!transformData) {
      throw new Error('Missing HTML transformData');
    }

    const dataTransfer = new DataTransfer();

    return transformData({
      ...context,
      data,
      format: 'text/html',
      source: {
        files: dataTransfer.files,
        getData: (format) => dataTransfer.getData(format),
        types: [...dataTransfer.types],
      },
    });
  };

  it('keeps list blocks on the single compiled paragraph schema', () => {
    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      initialValue: [
        {
          children: [{ text: 'Item' }],
          indent: 1,
          listStyleType: 'disc',
          type: 'paragraph',
        },
      ],
    });
    const paragraph = editor.read.children()[0];

    expect(editor.read.schema.element(BaseParagraphPlugin)?.groups).toContain(
      'block'
    );
    expect(editor.read.schema.isBlock(paragraph)).toBe(true);
    expect(() =>
      editor.read.schema.assertDocument(editor.read.value())
    ).not.toThrow();
  });

  it('uses configured targets for both model validation and injection', () => {
    const CalloutPlugin = defineBasePlugin('callout', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    });
    const ListCalloutPlugin = BaseListPlugin.configure({
      targetPlugins: ['callout'],
    });
    const editor = createBaseEditor({
      plugins: [CalloutPlugin, ListCalloutPlugin],
      initialValue: [
        {
          children: [{ text: 'Callout' }],
          listStyleType: 'disc',
          type: 'callout',
        },
      ],
    });

    expect(editor.plugin(BaseListPlugin).targetPlugins.join()).toBe('callout');
    expect(editor.plugin(BaseIndentPlugin).targetPlugins.join()).toBe(
      'callout'
    );
    expect(editor.read.children()[0]).toMatchObject({
      listStyleType: 'disc',
      type: 'callout',
    });

    editor.plugin(BaseListPlugin).update.indent({ at: [0] });

    expect(editor.read.children()[0]).toMatchObject({
      indent: 1,
      listStyleType: 'disc',
      type: 'callout',
    });
    expect(() =>
      editor.read.schema.assertDocument(editor.read.value())
    ).not.toThrow();
    expect(
      editor.api.html.deserialize({
        element: '<li aria-level="2">Imported</li>',
      })
    ).toEqual([
      {
        children: [{ text: 'Imported' }],
        indent: 2,
        listStyleType: undefined,
        type: 'callout',
      },
    ]);
    const multiTargetEditor = createBaseEditor({
      plugins: [
        CalloutPlugin,
        BaseListPlugin.configure({
          targetPlugins: ['callout', PLUGINS.paragraph],
        }),
      ],
    });

    expect(
      multiTargetEditor.api.html.deserialize({
        element: '<li>Paragraph list item</li>',
      })
    ).toEqual([
      {
        children: [{ text: 'Paragraph list item' }],
        type: 'callout',
      },
    ]);
    expect(() =>
      editor.read.schema.assertFragment([
        {
          children: [{ text: 'Paragraph' }],
          listStyleType: 'disc',
          type: 'paragraph',
        },
      ])
    ).toThrow(
      /Schema element property "listStyleType" cannot target element "paragraph"/
    );
  });

  it('installs Indent and exposes scoped list reads and updates', () => {
    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'Item' }], type: 'paragraph' }],
    });
    const list = editor.plugin(BaseListPlugin);
    const names = getPlateRuntime(editor).pluginList.map(
      (plugin) => plugin.name
    );

    expect(names.indexOf(PLUGINS.indent)).toBeLessThan(
      names.indexOf(PLUGINS.list)
    );
    expect(list.read.isActive('disc')).toBe(false);

    list.update.toggle({ listStyleType: 'disc' });

    expect(list.read.isActive('disc')).toBe(true);
    expect(editor.read.children()[0]).toMatchObject({
      indent: 1,
      listStyleType: 'disc',
    });
  });

  it('publishes staged list queries to required dependents', () => {
    const ListDependentPlugin = defineBasePlugin('listDependent', {
      api: ({ editor }) => ({
        getPreviousType: () => {
          const entry = editor.read.nodes.get<Element>([1]);

          if (!entry) return;

          return editor.read.list.getPrevious(entry)?.[0].type;
        },
      }),
      dependencies: [BaseListPlugin],
    });
    const editor = createBaseEditor({
      plugins: [ListDependentPlugin],
      initialValue: [
        {
          children: [{ text: 'First' }],
          indent: 1,
          listStyleType: 'disc',
          type: 'paragraph',
        },
        {
          children: [{ text: 'Second' }],
          indent: 1,
          listStyleType: 'disc',
          type: 'paragraph',
        },
      ],
    });
    const firstEntry = editor.read.nodes.get<Element>([0]);

    expect(editor.api.listDependent.getPreviousType()).toBe(PLUGINS.paragraph);
    expect(
      firstEntry
        ? editor.plugin(BaseListPlugin).read.getNext(firstEntry)?.[1]
        : undefined
    ).toEqual([1]);
  });

  it('reads staged list queries from the active transaction snapshot', () => {
    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      initialValue: [
        {
          children: [{ text: 'First' }],
          indent: 1,
          listStyleType: 'disc',
          type: 'paragraph',
        },
        {
          children: [{ text: 'Second' }],
          indent: 1,
          listStyleType: 'disc',
          type: 'paragraph',
        },
      ],
    });

    editor.update((tx) => {
      tx.nodes.insert(
        {
          children: [{ text: 'Inserted' }],
          indent: 1,
          listStyleType: 'disc',
          type: 'paragraph',
        },
        { at: [1] }
      );

      const lastEntry = tx.nodes.get<Element>([2]);

      expect(
        lastEntry ? tx.list.getPrevious(lastEntry)?.[0] : undefined
      ).toMatchObject({
        children: [{ text: 'Inserted' }],
      });
    });
  });

  it('composes indent and outdent into one undoable update', () => {
    const value = [{ children: [{ text: 'Item' }], type: 'paragraph' }];
    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      initialValue: value,
    });
    const list = editor.plugin(BaseListPlugin);

    list.update.indent({ at: [0], listStyleType: 'circle' });

    expect(editor.read.children()[0]).toMatchObject({
      indent: 1,
      listStyleType: 'circle',
    });
    expect(editor.read.history.undos()).toHaveLength(1);

    editor.update.history.undo();
    expect(editor.read.children()).toEqual(value);

    editor.update.history.redo();
    list.update.outdent({ at: [0] });

    expect(editor.read.children()).toEqual(value);
  });

  it('removes list metadata when outdenting a root item', () => {
    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      initialValue: [
        {
          children: [{ text: 'Item' }],
          indent: 1,
          listRestart: 4,
          listRestartPolite: 5,
          listStart: 4,
          listStyleType: 'decimal',
          type: 'paragraph',
        },
      ],
    });

    editor.plugin(BaseListPlugin).update.outdent({ at: [0] });

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'Item' }], type: 'paragraph' },
    ]);
  });

  it('replays a frozen list update without replaying local selection or history', () => {
    const value = [
      { children: [{ text: 'First' }], type: 'paragraph' },
      { children: [{ text: 'Second' }], type: 'paragraph' },
    ];
    const source = createBaseEditor({
      plugins: [BaseListPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 6, path: [1, 0] },
      },
      initialValue: value,
    });

    source.plugin(BaseListPlugin).update.toggle({ listStyleType: 'decimal' });

    const committedChange = source.read.lastCommit()?.changes;

    expect(committedChange).toBeDefined();

    const change = DocumentChange.fromJSON(
      JSON.parse(JSON.stringify(committedChange!.toJSON()))
    );
    expect(change.primaryClassification).toBeNull();
    const replaySelection = {
      kind: 'text' as const,
      anchor: { offset: 2, path: [1, 0] },
      focus: { offset: 2, path: [1, 0] },
    };
    const replay = createBaseEditor({
      plugins: [BaseListPlugin],
      selection: replaySelection,
      initialValue: value,
    });

    replay.update({ history: 'skip' }, (tx) => tx.changes.apply(change));

    expect(replay.read.children()).toEqual(source.read.children());
    expect(replay.read.selection()).toEqual(replaySelection);
    expect(replay.read.history.undos()).toHaveLength(0);
  });

  it('flattens nested lists, block children, and derives indent metadata from html', () => {
    const body = new DOMParser().parseFromString(
      transformListHtml(
        '<ul><li><p>Parent</p><ul><li>Child</li></ul></li></ul>'
      ),
      'text/html'
    ).body;
    const parentItem = body.querySelector('ul > li') as HTMLElement;
    const childItem = body.querySelector('ul > ul > li') as HTMLElement;

    expect(parentItem.innerHTML).toBe('Parent');
    expect(parentItem.querySelector('p')).toBeNull();
    expect(parentItem.dataset.indent).toBe('1');
    expect(parentItem.dataset.listStyleType).toBe('disc');
    expect(childItem.dataset.indent).toBe('2');
    expect(childItem.dataset.listStyleType).toBe('disc');
  });

  it('prefers aria-level and inline list styles over derived defaults', () => {
    const item = new DOMParser()
      .parseFromString(
        transformListHtml(
          '<ol style="list-style-type: upper-alpha"><li aria-level="3" style="list-style-type: square"><span>Item</span></li></ol>'
        ),
        'text/html'
      )
      .body.querySelector('li') as HTMLElement;

    expect(item.dataset.indent).toBe('3');
    expect(item.dataset.listStyleType).toBe('square');
  });

  it('leaves non-list HTML untouched for later transforms', () => {
    const input =
      '<style>.item { line-height: 150%; }</style><p class="item">Text</p>';
    const html = transformListHtml(input);

    expect(html).toBe(input);
  });

  it('parses list metadata for list items', () => {
    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
    });

    expect(
      editor.api.html.deserialize({
        element:
          '<li aria-level="2" style="list-style-type: circle">Parsed</li>',
      })
    ).toEqual([
      {
        children: [{ text: 'Parsed' }],
        indent: 2,
        listStyleType: 'circle',
        type: editor.plugin(PLUGINS.paragraph).schema.type,
      },
    ]);
  });

  it('increments an ordered parent start across its list items', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseListPlugin],
    });

    expect(
      editor.api.html.deserialize({
        element: '<ol start="4"><li>Four</li><li>Five</li></ol>',
      })
    ).toEqual([
      {
        children: [{ text: 'Four' }],
        listStart: 4,
        listStyleType: 'decimal',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Five' }],
        listStart: 5,
        listStyleType: 'decimal',
        type: 'paragraph',
      },
    ]);
  });

  it('round-trips every list claim with the indent patch on its list item', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseListPlugin],
      initialValue: [
        {
          checked: false,
          children: [{ text: 'Item' }],
          indent: 2,
          listRestart: 4,
          listRestartPolite: 5,
          listStart: 6,
          listStyleType: 'decimal',
          type: 'paragraph',
        },
      ],
    });
    const serialized = new Map<string, string>();

    writeHostFragmentData(
      editor,
      {
        setData: (format, value) => serialized.set(format, value),
      },
      ContentSlice.closed(editor.read.children())
    );
    const html = serialized.get('text/html');

    if (!html) throw new Error('HTML codec did not serialize the list');

    const body = new DOMParser().parseFromString(html, 'text/html').body;
    const list = body.querySelector('ol') as HTMLOListElement;
    const listItem = list.querySelector('li') as HTMLLIElement;

    expect(list.start).toBe(6);
    expect(list.style.listStyleType).toBe('decimal');
    expect(listItem.dataset.checked).toBe('false');
    expect(listItem.dataset.indent).toBe('2');
    expect(listItem.dataset.listRestart).toBe('4');
    expect(listItem.dataset.listRestartPolite).toBe('5');
    expect(listItem.dataset.listStart).toBe('6');
    expect(listItem.dataset.listStyleType).toBe('decimal');
    expect(listItem.style.marginLeft).toBe('48px');
    expect(editor.api.html.deserialize({ element: html })).toEqual([
      ...editor.read.children(),
    ]);
  });
});

describe('list input rules', () => {
  const createEditor = (text: string, offset = text.length) =>
    createBaseEditor({
      plugins: [
        BaseIndentPlugin,
        BaseListPlugin.configure({
          inputRules: [
            BulletedListRules.markdown({ variant: '-' }),
            OrderedListRules.markdown({ variant: '.' }),
            TaskListRules.markdown({ checked: false }),
            TaskListRules.markdown({ checked: true }),
          ],
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset, path: [0, 0] },
        focus: { offset, path: [0, 0] },
      },
      initialValue: [{ children: [{ text }], type: 'paragraph' }],
    });

  it('creates a bullet list item when markdown group is enabled', () => {
    const editor = createEditor('-', 1);

    editor.update.text.insert(' ');

    expect(editor.read.children()[0]).toMatchObject({
      children: [{ text: '' }],
      indent: 1,
      listStyleType: 'disc',
      type: 'paragraph',
    });
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('creates an ordered list item from markdown shorthand', () => {
    const editor = createEditor('3.', 2);

    editor.update.text.insert(' ');

    expect(editor.read.children()[0]).toMatchObject({
      children: [{ text: '' }],
      indent: 1,
      listStart: 3,
      listRestartPolite: 3,
      listStyleType: 'decimal',
      type: 'paragraph',
    });
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('creates a checked todo item from [x]', () => {
    const editor = createEditor('[x]', 3);

    editor.update.text.insert(' ');

    expect(editor.read.children()[0]).toMatchObject({
      checked: true,
      children: [{ text: '' }],
      indent: 1,
      listStyleType: 'todo',
      type: 'paragraph',
    });
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });
});

const InlinePlugin = defineBasePlugin('inline', {
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    },
  },
});

describe('normalizeList', () => {
  describe('when listStyleType without indent', () => {
    it('remove listStyleType and listStart props', async () => {
      const input = (
        <editor>
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
          <hp indent={1} listStart={2} listStyleType="decimal">
            <cursor />
          </hp>
          <hp indent={1} listStart={3} listStyleType="decimal">
            1
          </hp>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
          <hp>
            <cursor />
          </hp>
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        shouldNormalizeEditor: true,
        initialValue: input.children,
      });

      editor.update.text.deleteBackward();

      expect(editor.read.children()).toEqual(output.children);
    });
  });

  describe('when deleting backward on empty paragraph between two lists', () => {
    it('merge and renumber the lists', () => {
      const input = (
        <editor>
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
          <hp indent={1} listStart={2} listStyleType="decimal">
            2
          </hp>
          <hp>
            <htext />
            <cursor />
          </hp>
          <hp indent={1} listStyleType="decimal">
            3
          </hp>
          <hp indent={1} listStart={2} listStyleType="decimal">
            4
          </hp>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
          <hp indent={1} listStart={2} listStyleType="decimal">
            2
          </hp>
          <hp indent={1} listStart={3} listStyleType="decimal">
            3
          </hp>
          <hp indent={1} listStart={4} listStyleType="decimal">
            4
          </hp>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        shouldNormalizeEditor: true,
        initialValue: input.children,
      });

      editor.update.text.deleteBackward();

      expect(editor.read.children()).toEqual(output.children);
    });
  });

  describe('when deleting forward on empty paragraph between two lists', () => {
    it('merge and renumber the lists', () => {
      const input = (
        <editor>
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
          <hp indent={1} listStart={2} listStyleType="decimal">
            2
          </hp>
          <hp>
            <htext />
            <cursor />
          </hp>
          <hp indent={1} listStyleType="decimal">
            3
          </hp>
          <hp indent={1} listStart={2} listStyleType="decimal">
            4
          </hp>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
          <hp indent={1} listStart={2} listStyleType="decimal">
            2
          </hp>
          <hp indent={1} listStart={3} listStyleType="decimal">
            3
          </hp>
          <hp indent={1} listStart={4} listStyleType="decimal">
            4
          </hp>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        shouldNormalizeEditor: true,
        initialValue: input.children,
      });

      editor.update.text.deleteForward();

      expect(editor.read.children()).toEqual(output.children);
    });
  });
});

describe('keyboard handling', () => {
  describe('when Enter on root list and empty', () => {
    it('exits the list to a plain paragraph', () => {
      const input = (
        <editor>
          <hp indent={1} listStyleType="disc">
            <cursor />
          </hp>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.break.insert();

      expect(editor.read.children()).toEqual(output.children);
      expect(editor.read.selection()).toEqual(output.selection!);
    });
  });

  describe('when Enter on indented list and empty', () => {
    it('outdent', () => {
      const input = (
        <editor>
          <hp indent={2} listStyleType="disc">
            <cursor />
          </hp>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hp indent={1} listStyleType="disc">
            <htext />
          </hp>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.break.insert();

      expect(editor.read.children()).toEqual(output.children);
    });
  });

  describe('when Enter on indented and empty but not list', () => {
    it('does not outdent', () => {
      const input = (
        <editor>
          <hp indent={2}>
            <cursor />
          </hp>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hp indent={2}>
            <htext />
          </hp>
          <hp indent={2}>
            <cursor />
          </hp>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.break.insert();

      expect(editor.read.children()).toEqual(output.children);
    });
  });

  describe('when Backspace at start of a root list item', () => {
    it('removes the list layer before touching content', () => {
      const input = (
        <editor>
          <hp indent={1} listStyleType="disc">
            <cursor />
            One
          </hp>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hp>
            <cursor />
            One
          </hp>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.text.deleteBackward();

      expect(editor.read.children()).toEqual(output.children);
      expect(editor.read.selection()).toEqual({
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      });
    });
  });

  describe('when Backspace at start of an indented list item', () => {
    it('outdents one level', () => {
      const input = (
        <editor>
          <hp indent={2} listStyleType="disc">
            <cursor />
            One
          </hp>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hp indent={1} listStyleType="disc">
            <cursor />
            One
          </hp>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.text.deleteBackward();

      expect(editor.read.children()).toEqual(output.children);
      expect(editor.read.selection()).toEqual({
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      });
    });

    it('outdents when the cursor starts inside an inline', () => {
      const editor = createBaseEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin, InlinePlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [0, 1, 0] },
          focus: { offset: 0, path: [0, 1, 0] },
        },
        initialValue: [
          {
            children: [
              { text: '' },
              {
                children: [{ text: 'One' }],
                type: 'inline',
              },
              { text: '' },
            ],
            indent: 2,
            listStyleType: 'disc',
            type: 'paragraph',
          },
        ],
      });

      editor.update.text.deleteBackward();

      expect(editor.read.children()).toEqual([
        {
          children: [
            { text: '' },
            {
              children: [{ text: 'One' }],
              type: 'inline',
            },
            { text: '' },
          ],
          indent: 1,
          listStyleType: 'disc',
          type: 'paragraph',
        },
      ]);
    });
  });

  describe('when tabbing list items', () => {
    it('indents a list item one level on Tab', () => {
      const input = (
        <editor>
          <hp indent={1} listStyleType="disc">
            <cursor />
            One
          </hp>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hp indent={2} listStyleType="disc">
            <cursor />
            One
          </hp>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      expect(editor.update.indent.tab()).toBe(true);
      expect(editor.read.children()).toEqual(output.children);
      expect(editor.read.selection()).toEqual(output.selection!);
    });

    it('outdents a nested list item one level on Shift+Tab', () => {
      const input = (
        <editor>
          <hp indent={2} listStyleType="disc">
            <cursor />
            One
          </hp>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hp indent={1} listStyleType="disc">
            <cursor />
            One
          </hp>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      expect(editor.update.indent.untab()).toBe(true);
      expect(editor.read.children()).toEqual(output.children);
      expect(editor.read.selection()).toEqual(output.selection!);
    });
  });
});

describe('apply override', () => {
  it('coerces ambiguous styles across a batched insert', () => {
    const editor = createBaseEditor({
      plugins: [BaseListPlugin, BaseIndentPlugin],
      initialValue: [
        {
          children: [{ text: 'a' }],
          indent: 1,
          listStyleType: 'lower-alpha',
          type: 'paragraph',
        },
      ],
    });

    editor.update.nodes.insert(
      [
        {
          children: [{ text: 'i' }],
          indent: 1,
          listStyleType: 'lower-roman',
          type: 'paragraph',
        },
        {
          children: [{ text: 'ii' }],
          indent: 1,
          listStyleType: 'lower-roman',
          type: 'paragraph',
        },
      ],
      { at: [1] }
    );

    expect(editor.read.children()).toMatchObject([
      { listStyleType: 'lower-alpha' },
      { listStart: 2, listStyleType: 'lower-alpha' },
      { listStart: 3, listStyleType: 'lower-alpha' },
    ]);
  });

  it('coerces lower-roman inserts to lower-alpha when the previous sibling is alpha', () => {
    const editor = createBaseEditor({
      plugins: [BaseListPlugin, BaseIndentPlugin],
      initialValue: [
        {
          children: [{ text: 'a' }],
          indent: 1,
          listStyleType: 'lower-alpha',
          type: 'paragraph',
        },
      ],
    });

    editor.update.nodes.insert({
      children: [{ text: 'i' }],
      indent: 1,
      listStyleType: 'lower-roman',
      type: 'paragraph',
    });

    expect(editor.read.children()[1]?.listStyleType).toBe('lower-alpha');
  });

  it('drops list restart props from split list items', () => {
    const editor = createBaseEditor({
      plugins: [BaseListPlugin, BaseIndentPlugin],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
      initialValue: [
        {
          children: [{ text: '12' }],
          indent: 1,
          listRestart: 5,
          listRestartPolite: 5,
          listStyleType: 'decimal',
          type: 'paragraph',
        },
      ],
    });

    editor.update.nodes.split({ always: true });

    expect(editor.read.children()).toEqual([
      {
        children: [{ text: '1' }],
        indent: 1,
        listRestart: 5,
        listRestartPolite: 5,
        listStart: 5,
        listStyleType: 'decimal',
        type: 'paragraph',
      },
      {
        children: [{ text: '2' }],
        indent: 1,
        listStart: 6,
        listStyleType: 'decimal',
        type: 'paragraph',
      },
    ]);
  });
});

describe('withInsertBreakList', () => {
  it('insert a new todo list line with the same formatting', () => {
    const input = (
      <editor>
        <hp checked={false} indent={1} listStyleType={'todo'}>
          Todo item
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const output = (
      <editor>
        <hp checked={false} indent={1} listStyleType={'todo'}>
          Todo item
        </hp>
        <hp checked={false} indent={1} listStart={2} listStyleType={'todo'}>
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin, BaseListPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.break.insert();

    expect(editor.read.children()).toEqual(output.children);
  });

  it('behave like a normal break if not a todo line', () => {
    const input = (
      <editor>
        <hp indent={1} listStyleType="disc">
          Disc item
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const output = (
      <editor>
        <hp indent={1} listStyleType="disc">
          Disc item
        </hp>
        <hp indent={1} listStyleType="disc">
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin, BaseListPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.break.insert();

    expect(editor.read.children()).toEqual(output.children);
  });

  it('behave like a normal break if selection is expanded', () => {
    const input = (
      <editor>
        <hp checked={false} indent={1} listStyleType={'todo'}>
          Todo <anchor />
          item
          <focus />
        </hp>
      </editor>
    ) as TestEditor;

    const output = (
      <editor>
        <hp checked={false} indent={1} listStyleType={'todo'}>
          Todo <cursor />
        </hp>
        <hp checked={false} indent={1} listStart={2} listStyleType={'todo'}>
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin, BaseListPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.break.insert();

    expect(editor.read.children()).toEqual(output.children);
  });
});

describe('BaseListPlugin expansion', () => {
  describe('when input contains no list items', () => {
    it('returns the same blocks unchanged', () => {
      const input = (
        <fragment>
          <hp>
            paragraph 1<cursor />
          </hp>
          <hp>paragraph 2</hp>
          <hh1>heading</hh1>
        </fragment>
      ) as Element[];

      const editor = createListEditorFromFixture(
        (<editor>{input}</editor>) as TestEditor
      );

      const entries = [
        [input[0]!, [0]],
        [input[1]!, [1]],
        [input[2]!, [2]],
      ] satisfies NodeEntry<Element>[];

      const result = editor
        .plugin(BaseListPlugin)
        .read.expandItemsWithChildren(entries);

      expect(result).toEqual(entries);
    });
  });

  describe('when input contains list items without children', () => {
    it('returns the same list items', () => {
      const input = (
        <fragment>
          <hp indent={1} listStyleType="disc">
            item 1
          </hp>
          <hp indent={1} listStyleType="disc">
            item 2<cursor />
          </hp>
          <hp indent={1} listStyleType="disc">
            item 3
          </hp>
        </fragment>
      ) as Element[];

      const editor = createListEditorFromFixture(
        (<editor>{input}</editor>) as TestEditor
      );

      const entries = [
        [input[0]!, [0]],
        [input[1]!, [1]],
        [input[2]!, [2]],
      ] satisfies NodeEntry<Element>[];

      const result = editor
        .plugin(BaseListPlugin)
        .read.expandItemsWithChildren(entries);

      expect(result).toEqual(entries);
    });
  });

  describe('when input contains list items with children', () => {
    it('expand single list item to include its children', () => {
      const input = (
        <fragment>
          <hp indent={1} listStyleType="disc">
            parent
            <cursor />
          </hp>
          <hp indent={2} listStyleType="disc">
            child 1
          </hp>
          <hp indent={2} listStyleType="disc">
            child 2
          </hp>
          <hp indent={1} listStyleType="disc">
            sibling
          </hp>
        </fragment>
      ) as Element[];

      const editor = createListEditorFromFixture(
        (<editor>{input}</editor>) as TestEditor
      );

      // Only pass the parent item
      const entries = [[input[0]!, [0]]] satisfies NodeEntry<Element>[];

      const result = editor
        .plugin(BaseListPlugin)
        .read.expandItemsWithChildren(entries);

      expect(result).toEqual([
        [input[0], [0]], // parent
        [input[1], [1]], // child 1
        [input[2], [2]], // child 2
      ]);
    });

    it('handle multiple list items with children', () => {
      const input = (
        <fragment>
          <hp indent={1} listStyleType="disc">
            parent 1
          </hp>
          <hp indent={2} listStyleType="disc">
            child 1.1
          </hp>
          <hp indent={1} listStyleType="disc">
            parent 2<cursor />
          </hp>
          <hp indent={2} listStyleType="disc">
            child 2.1
          </hp>
          <hp indent={3} listStyleType="disc">
            grandchild 2.1.1
          </hp>
        </fragment>
      ) as Element[];

      const editor = createListEditorFromFixture(
        (<editor>{input}</editor>) as TestEditor
      );

      // Pass both parent items
      const entries = [
        [input[0]!, [0]],
        [input[2]!, [2]],
      ] satisfies NodeEntry<Element>[];

      const result = editor
        .plugin(BaseListPlugin)
        .read.expandItemsWithChildren(entries);

      expect(result).toEqual([
        [input[0], [0]], // parent 1
        [input[1], [1]], // child 1.1
        [input[2], [2]], // parent 2
        [input[3], [3]], // child 2.1
        [input[4], [4]], // grandchild 2.1.1
      ]);
    });

    it('avoid duplicates when children are already in input', () => {
      const input = (
        <fragment>
          <hp indent={1} listStyleType="disc">
            parent
          </hp>
          <hp indent={2} listStyleType="disc">
            child 1<cursor />
          </hp>
          <hp indent={2} listStyleType="disc">
            child 2
          </hp>
        </fragment>
      ) as Element[];

      const editor = createListEditorFromFixture(
        (<editor>{input}</editor>) as TestEditor
      );

      // Pass parent and one child (child 1)
      const entries = [
        [input[0]!, [0]],
        [input[1]!, [1]],
      ] satisfies NodeEntry<Element>[];

      const result = editor
        .plugin(BaseListPlugin)
        .read.expandItemsWithChildren(entries);

      // Should not duplicate child 1, but should add child 2
      expect(result).toEqual([
        [input[0], [0]], // parent
        [input[1], [1]], // child 1 (from input)
        [input[2], [2]], // child 2 (added)
      ]);
    });
  });

  describe('when input contains mixed blocks', () => {
    it('expand only list items and keep other blocks as-is', () => {
      const input = (
        <fragment>
          <hp>paragraph before</hp>
          <hp indent={1} listStyleType="disc">
            list parent
            <cursor />
          </hp>
          <hp indent={2} listStyleType="disc">
            list child
          </hp>
          <hh1>heading after</hh1>
        </fragment>
      ) as Element[];

      const editor = createListEditorFromFixture(
        (<editor>{input}</editor>) as TestEditor
      );

      const entries = [
        [input[0]!, [0]], // paragraph
        [input[1]!, [1]], // list parent
        [input[3]!, [3]], // heading
      ] satisfies NodeEntry<Element>[];

      const result = editor
        .plugin(BaseListPlugin)
        .read.expandItemsWithChildren(entries);

      expect(result).toEqual([
        [input[0], [0]], // paragraph (unchanged)
        [input[1], [1]], // list parent
        [input[2], [2]], // list child (added)
        [input[3], [3]], // heading (unchanged)
      ]);
    });
  });

  describe('edge cases', () => {
    it('handle empty input', () => {
      const editor = createListEditorFromFixture((<editor />) as TestEditor);

      const result = editor
        .plugin(BaseListPlugin)
        .read.expandItemsWithChildren([]);

      expect(result).toEqual([]);
    });

    it('handle list items at end of document', () => {
      const input = (
        <fragment>
          <hp indent={1} listStyleType="disc">
            parent at end
            <cursor />
          </hp>
          <hp indent={2} listStyleType="disc">
            child at end
          </hp>
        </fragment>
      ) as Element[];

      const editor = createListEditorFromFixture(
        (<editor>{input}</editor>) as TestEditor
      );

      const entries = [[input[0]!, [0]]] satisfies NodeEntry<Element>[];

      const result = editor
        .plugin(BaseListPlugin)
        .read.expandItemsWithChildren(entries);

      expect(result).toEqual([
        [input[0], [0]], // parent
        [input[1], [1]], // child
      ]);
    });

    it('handle deeply nested lists', () => {
      const input = (
        <fragment>
          <hp indent={1} listStyleType="disc">
            level 1<cursor />
          </hp>
          <hp indent={2} listStyleType="disc">
            level 2
          </hp>
          <hp indent={3} listStyleType="disc">
            level 3
          </hp>
          <hp indent={4} listStyleType="disc">
            level 4
          </hp>
          <hp indent={5} listStyleType="disc">
            level 5
          </hp>
        </fragment>
      ) as Element[];

      const editor = createListEditorFromFixture(
        (<editor>{input}</editor>) as TestEditor
      );

      const entries = [[input[0]!, [0]]] satisfies NodeEntry<Element>[];

      const result = editor
        .plugin(BaseListPlugin)
        .read.expandItemsWithChildren(entries);

      expect(result).toEqual([
        [input[0], [0]], // level 1
        [input[1], [1]], // level 2
        [input[2], [2]], // level 3
        [input[3], [3]], // level 4
        [input[4], [4]], // level 5
      ]);
    });
  });
});

describe('isOrderedList', () => {
  it.each([
    [undefined, false],
    [ListStyleType.Disc, false],
    [ListStyleType.Circle, false],
    [ListStyleType.Decimal, true],
    [ListStyleType.DecimalLeadingZero, true],
    [ListStyleType.LowerRoman, true],
  ])('treats %s as ordered=%s', (listStyleType, expected) => {
    expect(
      isOrderedList({ children: [], listStyleType, type: 'paragraph' })
    ).toBe(expected);
  });
});
