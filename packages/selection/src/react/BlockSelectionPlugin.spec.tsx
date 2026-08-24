/** @jsx jsxt */

import {
  BaseParagraphPlugin,
  type BaseEditor,
  ElementIdPlugin,
  type PluginReference,
  createBaseEditor,
  defineBasePlugin,
} from '@platejs/core';
import { getPlateRuntime } from '@platejs/core/internal';
import { createPlateEditor } from '@platejs/core/react';
import {
  type Element,
  ElementApi,
  type NodeEntry,
  NodeApi,
  property,
  type NodeKey,
  schema,
  target,
  type Value,
  createEditor as createPliteEditor,
} from '@platejs/plite';
import * as PliteDOM from '@platejs/plite-dom';
import { EDITOR_TO_WINDOW } from '@platejs/plite-dom/internal';
import { jsxt } from '@platejs/test-utils';
import * as copyToClipboardModule from 'copy-to-clipboard';

import { BlockMenuPlugin } from './BlockMenuPlugin';
import { BlockSelectionPlugin } from './BlockSelectionPlugin';

const createTestContainerPlugin = <
  const TName extends string,
  const TChild extends PluginReference,
>(
  name: TName,
  child: TChild
) =>
  defineBasePlugin(name, {
    schema: {
      element: {
        content: schema.content.element(child, { min: 1 }),
      },
    },
  });

const createTestBlockContainerPlugin = <const TName extends string>(
  name: TName
) =>
  defineBasePlugin(name, {
    schema: ({ plugins }) => ({
      element: {
        content: plugins.blockContent({
          default: BaseParagraphPlugin,
          min: 1,
        }),
      },
    }),
  });

const TestBoldPlugin = defineBasePlugin('bold', {
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
});

const TestElementPropertiesPlugin = defineBasePlugin('testElementProperties', {
  schema: {
    properties: {
      align: schema.elementProperty(property.string(), {
        target: target.group('element'),
      }),
      indent: schema.elementProperty(property.number(), {
        target: target.group('element'),
      }),
      variant: schema.elementProperty(property.string(), {
        target: target.group('element'),
      }),
    },
  },
});

const TestColumnPlugin = createTestBlockContainerPlugin('column');
const TestColumnGroupPlugin = createTestContainerPlugin(
  'columnGroup',
  TestColumnPlugin
);
const TestDivPlugin = createTestBlockContainerPlugin('div');
const TestTableCellPlugin = createTestBlockContainerPlugin('tableCell');
const TestTableRowPlugin = createTestContainerPlugin(
  'tableRow',
  TestTableCellPlugin
);
const TestTablePlugin = createTestContainerPlugin('table', TestTableRowPlugin);

const selectionTestPlugins = [
  BlockSelectionPlugin,
  ElementIdPlugin,
  TestDivPlugin,
  TestColumnPlugin,
  TestColumnGroupPlugin,
  TestTableCellPlugin,
  TestTableRowPlugin,
  TestTablePlugin,
] as const;

const createSelectionTestEditor = (initialValue: Value) =>
  createPlateEditor({
    editor: createPliteEditor<Value>(),
    plugins: selectionTestPlugins,
    initialValue,
  });

type SelectionTestEditor = ReturnType<typeof createSelectionTestEditor>;

const nodeKey = (editor: BaseEditor, id: string): NodeKey => {
  const entry = editor.read.nodes.find({
    at: [],
    match: (node): node is Element =>
      ElementApi.isElement(node) && node.id === id,
  });

  if (!entry) throw new Error(`Missing test element ${id}.`);
  const result = editor.key(entry[0]);

  if (!result) throw new Error(`Missing node key for ${id}.`);

  return result;
};

const nodeKeys = (editor: BaseEditor, ids: readonly string[]) =>
  ids.map((id) => nodeKey(editor, id));

const nodeKeySet = (editor: BaseEditor, ids: readonly string[]) =>
  new Set(nodeKeys(editor, ids));

const persistedIds = (editor: BaseEditor, keys: Iterable<NodeKey>) =>
  [...keys].map((key) => {
    const entry = editor.read.nodes.get(key, {
      match: ElementApi.isElement,
    });

    if (!entry) throw new Error(`Missing test node key ${key}.`);

    if (typeof entry[0].id !== 'string') {
      throw new Error(`Missing persisted test identity for ${key}.`);
    }

    return entry[0].id;
  });

const persistedId = (editor: BaseEditor, key: NodeKey) =>
  persistedIds(editor, [key])[0];

const createBlockSelectionEditor = ({
  withBlockMenu = false,
}: {
  withBlockMenu?: boolean;
} = {}) =>
  createPlateEditor({
    editor: createPliteEditor<Value>(),
    plugins: [
      ElementIdPlugin,
      BlockSelectionPlugin,
      ...(withBlockMenu ? [BlockMenuPlugin] : []),
      TestBoldPlugin,
      TestElementPropertiesPlugin,
    ],
    initialValue: [
      {
        id: 'block1',
        children: [{ text: 'One' }],
        type: 'paragraph',
      },
      {
        id: 'block2',
        children: [{ text: 'Two' }],
        type: 'paragraph',
      },
    ],
  });

const runSelectAllShortcut = (
  editor: ReturnType<typeof createBlockSelectionEditor>
) =>
  getPlateRuntime(editor).shortcuts['blockSelection.selectAll']?.handler?.({
    editor,
    event: new KeyboardEvent('keydown'),
    eventDetails: {},
  });

describe('BlockSelectionPlugin', () => {
  it('does not install the optional block menu', () => {
    const editor = createBlockSelectionEditor();

    expect(getPlateRuntime(editor).plugins.blockMenu).toBeUndefined();
  });

  it('exposes the selection area class in its default store', () => {
    const editor = createBlockSelectionEditor();

    expect(
      editor.plugin(BlockSelectionPlugin).store.get('selectionAreaClassName')
    ).toBe('');
  });

  it('progresses from the current block to every selectable block', () => {
    const editor = createBlockSelectionEditor();

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });

    expect(runSelectAllShortcut(editor)).toBe(true);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
    expect(runSelectAllShortcut(editor)).toBe(true);
    expect(
      persistedIds(
        editor,
        editor.plugin(BlockSelectionPlugin).store.get('selectedKeys')
      )
    ).toEqual(['block1', 'block2']);
  });

  it('leaves select-all to the browser when custom handling is disabled', () => {
    const editor = createBlockSelectionEditor();

    editor.plugin(BlockSelectionPlugin).store.set({ disableSelectAll: true });
    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });

    expect(runSelectAllShortcut(editor)).toBe(false);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });
  });

  it('applies generic mark transforms to selected blocks', () => {
    const editor = createBlockSelectionEditor();

    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedKeys: nodeKeySet(editor, ['block1']) });

    editor.update.marks.toggle('bold');

    expect(editor.read.children()[0].children[0]).toMatchObject({
      bold: true,
    });
    expect(editor.read.children()[1].children[0]).not.toHaveProperty('bold');
    expect(
      persistedIds(
        editor,
        editor.plugin(BlockSelectionPlugin).store.get('selectedKeys')
      )
    ).toEqual(['block1']);
  });

  it('applies generic node transforms to selected blocks', () => {
    const editor = createBlockSelectionEditor();

    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedKeys: nodeKeySet(editor, ['block1']) });

    editor.update.nodes.set({ variant: 'lead' });

    expect(editor.read.children()[0]).toMatchObject({ variant: 'lead' });
    expect(editor.read.children()[1]).not.toHaveProperty('variant');
    expect(
      persistedIds(
        editor,
        editor.plugin(BlockSelectionPlugin).store.get('selectedKeys')
      )
    ).toEqual(['block1']);
  });

  it('clears selected blocks on ordinary selection changes', () => {
    const editor = createBlockSelectionEditor();

    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedKeys: nodeKeySet(editor, ['block1']) });

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });

    expect(
      persistedIds(
        editor,
        editor.plugin(BlockSelectionPlugin).store.get('selectedKeys')
      )
    ).toEqual([]);
  });

  it('keeps selected blocks when the block menu is open', () => {
    const editor = createBlockSelectionEditor({ withBlockMenu: true });

    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedKeys: nodeKeySet(editor, ['block1']) });
    editor
      .plugin(BlockMenuPlugin)
      .store.set({ openKey: nodeKey(editor, 'block1') });

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });

    expect(
      persistedIds(
        editor,
        editor.plugin(BlockSelectionPlugin).store.get('selectedKeys')
      )
    ).toEqual(['block1']);
  });

  it('keeps selected blocks while the selection area is active', () => {
    const editor = createBlockSelectionEditor();

    editor.plugin(BlockSelectionPlugin).store.set({
      isSelectionAreaVisible: true,
      selectedKeys: nodeKeySet(editor, ['block1']),
    });

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });

    expect(
      persistedIds(
        editor,
        editor.plugin(BlockSelectionPlugin).store.get('selectedKeys')
      )
    ).toEqual(['block1']);
  });

  it('clears selected blocks when an explicit block menu is closed', () => {
    const editor = createBlockSelectionEditor({ withBlockMenu: true });

    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedKeys: nodeKeySet(editor, ['block1']) });

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });

    expect(
      persistedIds(
        editor,
        editor.plugin(BlockSelectionPlugin).store.get('selectedKeys')
      )
    ).toEqual([]);
  });
});

jsxt;

describe('moveSelection', () => {
  let editor: SelectionTestEditor;

  beforeEach(() => {
    editor = createSelectionTestEditor([
      {
        id: 'block1',
        children: [{ text: 'Block One' }],
        type: 'paragraph',
      },
      {
        id: 'block2',
        children: [{ text: 'Block Two' }],
        type: 'paragraph',
      },
      {
        id: 'block3',
        children: [{ text: 'Block Three' }],
        type: 'paragraph',
      },
    ]);
  });

  describe('when pressing arrow down without shift', () => {
    it('set anchor to block below the bottom-most and select it alone', () => {
      // Suppose block1, block2 selected
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['block1', 'block2']) });
      // anchor = block1 (arbitrary choice)
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ anchorKey: nodeKey(editor, 'block1') });

      // Move selection DOWN => below bottom-most (which is block2) => block3
      editor.plugin(BlockSelectionPlugin).api.moveSelection('down');

      // Should now only have block3 in selection
      const selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      expect(persistedIds(editor, selectedKeys)).toEqual(['block3']);

      const anchorKey = editor
        .plugin(BlockSelectionPlugin)
        .store.get('anchorKey');
      expect(persistedId(editor, anchorKey!)).toBe('block3');
    });
  });

  describe('when pressing arrow up without shift', () => {
    it('set anchor to block above the top-most and select it alone', () => {
      // Suppose block2, block3 selected, anchor is block3
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['block2', 'block3']) });
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ anchorKey: nodeKey(editor, 'block3') });

      // Move selection UP => above top-most (which is block2) => block1
      editor.plugin(BlockSelectionPlugin).api.moveSelection('up');

      const selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      expect(persistedIds(editor, selectedKeys)).toEqual(['block1']);

      const anchorKey = editor
        .plugin(BlockSelectionPlugin)
        .store.get('anchorKey');
      expect(persistedId(editor, anchorKey!)).toBe('block1');
    });
  });

  describe('when only one block is selected', () => {
    it('maintain current selection if there is no block above/below', () => {
      // Only block1 selected, anchor = block1
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['block1']) });
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ anchorKey: nodeKey(editor, 'block1') });

      // Move up => block1 is the top-most => no block above => maintain block1
      editor.plugin(BlockSelectionPlugin).api.moveSelection('up');

      let selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      expect(persistedIds(editor, selectedKeys)).toEqual(['block1']);
      let anchorKey = editor
        .plugin(BlockSelectionPlugin)
        .store.get('anchorKey');
      expect(persistedId(editor, anchorKey!)).toBe('block1');

      // Only block3 selected, anchor = block3
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['block3']) });
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ anchorKey: nodeKey(editor, 'block3') });

      // Move down => block3 is the bottom-most => no block below => maintain block3
      editor.plugin(BlockSelectionPlugin).api.moveSelection('down');

      selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      expect(persistedIds(editor, selectedKeys)).toEqual(['block3']);
      anchorKey = editor.plugin(BlockSelectionPlugin).store.get('anchorKey');
      expect(persistedId(editor, anchorKey!)).toBe('block3');
    });

    it('maintain current selection when multiple blocks are selected and no prev/next block exists', () => {
      // block1 and block2 selected at the top
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['block1', 'block2']) });
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ anchorKey: nodeKey(editor, 'block1') });

      // Move up => no block above block1 => maintain current selection
      editor.plugin(BlockSelectionPlugin).api.moveSelection('up');

      let selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      expect(persistedIds(editor, selectedKeys)).toEqual(['block1']);
      let anchorKey = editor
        .plugin(BlockSelectionPlugin)
        .store.get('anchorKey');
      expect(persistedId(editor, anchorKey!)).toBe('block1');

      // block2 and block3 selected at the bottom
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['block2', 'block3']) });
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ anchorKey: nodeKey(editor, 'block3') });

      // Move down => no block below block3 => maintain current selection
      editor.plugin(BlockSelectionPlugin).api.moveSelection('down');

      selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      expect(persistedIds(editor, selectedKeys)).toEqual(['block3']);
      anchorKey = editor.plugin(BlockSelectionPlugin).store.get('anchorKey');
      expect(persistedId(editor, anchorKey!)).toBe('block3');
    });
  });

  describe('when pressing arrow up with nested blocks', () => {
    it('select parent block if no previous sibling exists', () => {
      editor = createSelectionTestEditor([
        {
          id: 'parent1',
          children: [
            {
              id: 'child1',
              children: [{ text: 'Child One' }],
              type: 'paragraph',
            },
            {
              id: 'child2',
              children: [{ text: 'Child Two' }],
              type: 'paragraph',
            },
          ],
          type: 'div',
        },
      ]);

      // Select child1
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['child1']) });
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ anchorKey: nodeKey(editor, 'child1') });

      // Move selection UP => no previous sibling => should select parent1
      editor.plugin(BlockSelectionPlugin).api.moveSelection('up');

      const selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      expect(persistedIds(editor, selectedKeys)).toEqual(['parent1']);

      const anchorKey = editor
        .plugin(BlockSelectionPlugin)
        .store.get('anchorKey');
      expect(persistedId(editor, anchorKey!)).toBe('parent1');
    });

    it('keeps the selection unchanged at the root without a previous sibling', () => {
      // Using the original test value
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['block1']) });
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ anchorKey: nodeKey(editor, 'block1') });

      // Move up from the first block at root level
      editor.plugin(BlockSelectionPlugin).api.moveSelection('up');

      const selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      expect(persistedIds(editor, selectedKeys)).toEqual(['block1']);

      const anchorKey = editor
        .plugin(BlockSelectionPlugin)
        .store.get('anchorKey');
      expect(persistedId(editor, anchorKey!)).toBe('block1');
    });
  });

  describe('when pressing arrow down with nested blocks', () => {
    beforeEach(() => {
      editor = createSelectionTestEditor([
        {
          id: 'table1',
          children: [
            {
              id: 'tr1',
              children: [
                {
                  id: 'td11',
                  children: [
                    {
                      id: 'p11',
                      children: [{ text: 'Cell 1-1' }],
                      type: 'paragraph',
                    },
                  ],
                  type: 'tableCell',
                },
                {
                  id: 'td12',
                  children: [
                    {
                      id: 'p12',
                      children: [{ text: 'Cell 1-2' }],
                      type: 'paragraph',
                    },
                  ],
                  type: 'tableCell',
                },
              ],
              type: 'tableRow',
            },
            {
              id: 'tr2',
              children: [
                {
                  id: 'td21',
                  children: [
                    {
                      id: 'p21',
                      children: [{ text: 'Cell 2-1' }],
                      type: 'paragraph',
                    },
                  ],
                  type: 'tableCell',
                },
                {
                  id: 'td22',
                  children: [
                    {
                      id: 'p22',
                      children: [{ text: 'Cell 2-2' }],
                      type: 'paragraph',
                    },
                  ],
                  type: 'tableCell',
                },
              ],
              type: 'tableRow',
            },
          ],
          type: 'table',
        },
      ]);

      editor.plugin(BlockSelectionPlugin).store.set({
        // Only table and tr are selectable
        isSelectable: (node) =>
          node.type === 'table' || node.type === 'tableRow',
      });
    });

    it('move from first tr to second tr in table', () => {
      // Select tr1
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['tr1']) });
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ anchorKey: nodeKey(editor, 'tr1') });

      // Move down
      editor.plugin(BlockSelectionPlugin).api.moveSelection('down');

      const selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      expect(persistedIds(editor, selectedKeys)).toEqual(['tr2']);

      const anchorKey = editor
        .plugin(BlockSelectionPlugin)
        .store.get('anchorKey');
      expect(persistedId(editor, anchorKey!)).toBe('tr2');
    });

    it('keeps the selection unchanged at the last row', () => {
      // Select tr2
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['tr2']) });
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ anchorKey: nodeKey(editor, 'tr2') });

      // Move down
      editor.plugin(BlockSelectionPlugin).api.moveSelection('down');

      const selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      expect(persistedIds(editor, selectedKeys)).toEqual(['tr2']);

      const anchorKey = editor
        .plugin(BlockSelectionPlugin)
        .store.get('anchorKey');
      expect(persistedId(editor, anchorKey!)).toBe('tr2');
    });

    it('skip non-selectable td cells', () => {
      // Select td11
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['td11']) });
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ anchorKey: nodeKey(editor, 'td11') });

      // Move down
      editor.plugin(BlockSelectionPlugin).api.moveSelection('down');

      const selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      expect(persistedIds(editor, selectedKeys)).toEqual(['tr2']);

      const anchorKey = editor
        .plugin(BlockSelectionPlugin)
        .store.get('anchorKey');
      expect(persistedId(editor, anchorKey!)).toBe('tr2');
    });
  });

  describe('when pressing arrow up with complex nested blocks', () => {
    beforeEach(() => {
      editor = createSelectionTestEditor([
        {
          id: 'block1',
          children: [{ text: 'Block One' }],
          type: 'paragraph',
        },
        {
          id: 'parent1',
          children: [
            {
              id: 'child1',
              children: [{ text: 'Child One' }],
              type: 'paragraph',
            },
            {
              id: 'child2',
              children: [{ text: 'Child Two' }],
              type: 'paragraph',
            },
          ],
          type: 'div',
        },
        {
          id: 'column_group1',
          children: [
            {
              id: 'column1',
              children: [
                {
                  id: 'grandchild1',
                  children: [{ text: 'Grandchild One' }],
                  type: 'paragraph',
                },
              ],
              type: 'column',
            },
            {
              id: 'column2',
              children: [
                {
                  id: 'grandchild2',
                  children: [{ text: 'Grandchild Two' }],
                  type: 'paragraph',
                },
              ],
              type: 'column',
            },
          ],
          type: 'columnGroup',
        },
      ]);

      // For testing, let's skip columns
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ isSelectable: (node) => node.type !== 'column' });
    });

    it('move to previous sibling when not first child', () => {
      // Select child2
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['child2']) });
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ anchorKey: nodeKey(editor, 'child2') });

      // Move up => should select child1
      editor.plugin(BlockSelectionPlugin).api.moveSelection('up');

      const selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      expect(persistedIds(editor, selectedKeys)).toEqual(['child1']);

      const anchorKey = editor
        .plugin(BlockSelectionPlugin)
        .store.get('anchorKey');
      expect(persistedId(editor, anchorKey!)).toBe('child1');
    });

    it('move to parents previous block if first child and skipping columns', () => {
      // Select grandchild2
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['grandchild2']) });
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ anchorKey: nodeKey(editor, 'grandchild2') });

      // Move up => should select grandchild1 (since columns are not selectable)
      editor.plugin(BlockSelectionPlugin).api.moveSelection('up');

      const selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      expect(persistedIds(editor, selectedKeys)).toEqual(['grandchild1']);

      const anchorKey = editor
        .plugin(BlockSelectionPlugin)
        .store.get('anchorKey');
      expect(persistedId(editor, anchorKey!)).toBe('grandchild1');
    });

    it('handle deeper nesting with non-selectable parents', () => {
      // Make column_group1 not selectable as well
      editor.plugin(BlockSelectionPlugin).store.set({
        isSelectable: (node) =>
          node.type !== 'column' && node.type !== 'columnGroup',
      });

      // Select grandchild1
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['grandchild1']) });
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ anchorKey: nodeKey(editor, 'grandchild1') });

      // Move up => should skip column1 and column_group1, select child2
      editor.plugin(BlockSelectionPlugin).api.moveSelection('up');

      const selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      expect(persistedIds(editor, selectedKeys)).toEqual(['child2']);

      const anchorKey = editor
        .plugin(BlockSelectionPlugin)
        .store.get('anchorKey');
      expect(persistedId(editor, anchorKey!)).toBe('child2');
    });
  });
});

const createTestEditor = () =>
  createBaseEditor({
    editor: createPliteEditor<Value>(),
    plugins: [
      ElementIdPlugin,
      BlockSelectionPlugin,
      TestTablePlugin,
      TestTableRowPlugin,
      TestTableCellPlugin,
    ],
    initialValue: [
      {
        id: 'existing',
        children: [{ text: 'Existing' }],
        type: 'paragraph',
      },
      {
        id: 'table',
        children: [
          {
            id: 'row-1',
            children: [
              {
                children: [
                  {
                    children: [{ text: 'Row 1' }],
                    type: 'paragraph',
                  },
                ],
                type: 'tableCell',
              },
            ],
            type: 'tableRow',
          },
          {
            id: 'row-2',
            children: [
              {
                children: [
                  {
                    children: [{ text: 'Row 2' }],
                    type: 'paragraph',
                  },
                ],
                type: 'tableCell',
              },
            ],
            type: 'tableRow',
          },
        ],
        type: 'table',
      },
    ],
  });

const createSelectableElement = (editor: BaseEditor, id?: string) => {
  const element = document.createElement('div');

  if (id) element.dataset.pliteNodeKey = nodeKey(editor, id);

  return element;
};

type BlockSelectionTestEditor = ReturnType<typeof createTestEditor>;

const getSelectedIds = (editor: BlockSelectionTestEditor) =>
  persistedIds(
    editor,
    editor.plugin(BlockSelectionPlugin).store.get('selectedKeys') ?? []
  ).sort();

describe('setSelectedKeys', () => {
  let editor: BlockSelectionTestEditor;
  let querySelectorSpy: AnyTestMock;

  beforeEach(() => {
    querySelectorSpy = spyOn(document, 'querySelector').mockImplementation(
      (selector: string) => {
        const id = selector.match(/data-plite-node-key="([^"]+)"/)?.[1];
        const element = document.createElement('div');

        if (id) element.dataset.pliteNodeKey = id;

        return element;
      }
    );

    editor = createTestEditor();
  });

  afterEach(() => {
    querySelectorSpy?.mockRestore();
  });

  it('replaces the selection when explicit keys are provided', () => {
    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedKeys: nodeKeySet(editor, ['existing']) });

    editor
      .plugin(BlockSelectionPlugin)
      .api.setSelectedKeys({ keys: nodeKeys(editor, ['row-1', 'row-2']) });

    expect(getSelectedIds(editor)).toEqual(['row-1', 'row-2']);
    expect(editor.plugin(BlockSelectionPlugin).store.get('isSelecting')).toBe(
      true
    );
  });

  it('merges added ids and removes removed ids from selectable elements', () => {
    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedKeys: nodeKeySet(editor, ['existing', 'row-2']) });

    editor.plugin(BlockSelectionPlugin).api.setSelectedKeys({
      added: [
        createSelectableElement(editor, 'row-1'),
        createSelectableElement(editor),
      ],
      removed: [
        createSelectableElement(editor, 'row-2'),
        createSelectableElement(editor),
      ],
    });

    expect(getSelectedIds(editor)).toEqual(['existing', 'row-1']);
    expect(editor.plugin(BlockSelectionPlugin).store.get('isSelecting')).toBe(
      true
    );
  });

  it('adds a selected row and clears the previous selection by default', () => {
    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedKeys: nodeKeySet(editor, ['existing']) });

    editor
      .plugin(BlockSelectionPlugin)
      .api.addSelectedRow(nodeKey(editor, 'row-1'));

    expect(getSelectedIds(editor)).toEqual(['row-1']);
  });

  it('adds a selected row without clearing when requested', () => {
    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedKeys: nodeKeySet(editor, ['existing']) });

    editor
      .plugin(BlockSelectionPlugin)
      .api.addSelectedRow(nodeKey(editor, 'row-1'), { clear: false });

    expect(getSelectedIds(editor)).toEqual(['existing', 'row-1']);
  });

  it('removes a selected row after the delay', async () => {
    editor
      .plugin(BlockSelectionPlugin)
      .api.addSelectedRow(nodeKey(editor, 'row-1'), { delay: 1 });

    expect(getSelectedIds(editor)).toEqual(['row-1']);

    await new Promise((resolve) => {
      setTimeout(resolve, 5);
    });

    expect(getSelectedIds(editor)).toEqual([]);
  });

  it('exposes addSelectedRow through the block selection API', () => {
    editor
      .plugin(BlockSelectionPlugin)
      .api.addSelectedRow(nodeKey(editor, 'row-1'));

    expect(getSelectedIds(editor)).toEqual(['row-1']);
  });
});

jsxt;

describe('shiftSelection', () => {
  let editor: SelectionTestEditor;

  describe('Flat structure', () => {
    beforeEach(() => {
      editor = createSelectionTestEditor([
        {
          id: 'block1',
          children: [{ text: 'Block One' }],
          type: 'paragraph',
        },
        {
          id: 'block2',
          children: [{ text: 'Block Two' }],
          type: 'paragraph',
        },
        {
          id: 'block3',
          children: [{ text: 'Block Three' }],
          type: 'paragraph',
        },
      ]);
    });

    describe('when anchor is top-most and SHIFT+DOWN', () => {
      it('expand selection downward', () => {
        editor
          .plugin(BlockSelectionPlugin)
          .store.set({ selectedKeys: nodeKeySet(editor, ['block1']) });
        editor
          .plugin(BlockSelectionPlugin)
          .store.set({ anchorKey: nodeKey(editor, 'block1') });

        editor.plugin(BlockSelectionPlugin).api.shiftSelection('down');

        const selectedKeys = editor
          .plugin(BlockSelectionPlugin)
          .store.get('selectedKeys');
        expect(persistedIds(editor, selectedKeys).sort()).toEqual(
          ['block1', 'block2'].sort()
        );
      });
    });

    describe('when anchor is top-most and SHIFT+DOWN again', () => {
      it('expand further to block3', () => {
        editor.plugin(BlockSelectionPlugin).store.set({
          selectedKeys: nodeKeySet(editor, ['block1', 'block2']),
        });
        editor
          .plugin(BlockSelectionPlugin)
          .store.set({ anchorKey: nodeKey(editor, 'block1') });

        editor.plugin(BlockSelectionPlugin).api.shiftSelection('down');

        const selectedKeys = editor
          .plugin(BlockSelectionPlugin)
          .store.get('selectedKeys');
        expect(persistedIds(editor, selectedKeys).sort()).toEqual(
          ['block1', 'block2', 'block3'].sort()
        );
      });
    });

    describe('when anchor is NOT top-most and SHIFT+DOWN', () => {
      it('shrink from the top-most block', () => {
        editor.plugin(BlockSelectionPlugin).store.set({
          selectedKeys: nodeKeySet(editor, ['block1', 'block2']),
        });
        editor
          .plugin(BlockSelectionPlugin)
          .store.set({ anchorKey: nodeKey(editor, 'block2') });

        editor.plugin(BlockSelectionPlugin).api.shiftSelection('down');

        const selectedKeys = editor
          .plugin(BlockSelectionPlugin)
          .store.get('selectedKeys');
        expect(persistedIds(editor, selectedKeys).sort()).toEqual(
          ['block2'].sort()
        );
      });
    });

    describe('when anchor is bottom-most and SHIFT+UP', () => {
      it('expand selection upward', () => {
        editor.plugin(BlockSelectionPlugin).store.set({
          selectedKeys: nodeKeySet(editor, ['block2', 'block3']),
        });
        editor
          .plugin(BlockSelectionPlugin)
          .store.set({ anchorKey: nodeKey(editor, 'block3') });

        editor.plugin(BlockSelectionPlugin).api.shiftSelection('up');

        const selectedKeys = editor
          .plugin(BlockSelectionPlugin)
          .store.get('selectedKeys');
        expect(persistedIds(editor, selectedKeys).sort()).toEqual(
          ['block1', 'block2', 'block3'].sort()
        );
      });
    });

    describe('when anchor is NOT bottom-most and SHIFT+UP', () => {
      it('shrink from bottom-most block', () => {
        editor.plugin(BlockSelectionPlugin).store.set({
          selectedKeys: nodeKeySet(editor, ['block1', 'block2', 'block3']),
        });
        editor
          .plugin(BlockSelectionPlugin)
          .store.set({ anchorKey: nodeKey(editor, 'block1') });

        editor.plugin(BlockSelectionPlugin).api.shiftSelection('up');

        const selectedKeys = editor
          .plugin(BlockSelectionPlugin)
          .store.get('selectedKeys');
        expect(persistedIds(editor, selectedKeys).sort()).toEqual(
          ['block1', 'block2'].sort()
        );
      });
    });
  });

  describe('Nested structure', () => {
    beforeEach(() => {
      editor = createSelectionTestEditor([
        {
          id: 'parent1',
          children: [
            {
              id: 'child1',
              children: [{ text: 'Child One' }],
              type: 'paragraph',
            },
            {
              id: 'child2',
              children: [{ text: 'Child Two' }],
              type: 'paragraph',
            },
          ],
          type: 'div',
        },
        {
          id: 'block3',
          children: [{ text: 'Block Three' }],
          type: 'paragraph',
        },
        {
          id: 'block4',
          children: [{ text: 'Block Four' }],
          type: 'paragraph',
        },
      ]);

      // For testing skipping, let's say child2 is not selectable or something
      editor.plugin(BlockSelectionPlugin).store.set({
        // We'll skip if node.id === 'child2'
        isSelectable: (node) => node.id !== 'child2',
      });
    });

    it('expand down from parent1 to block3 if anchor is parent1 (top-most)', () => {
      // parent1 selected, anchor=parent1, SHIFT+DOWN => expand to block3
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['parent1']) });
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ anchorKey: nodeKey(editor, 'parent1') });

      editor.plugin(BlockSelectionPlugin).api.shiftSelection('down');

      const selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      expect(persistedIds(editor, selectedKeys)).toEqual(['parent1', 'block3']);
    });

    it('shrink from parent1 if anchor is block3 (not top-most) SHIFT+DOWN', () => {
      // parent1, block3 selected; anchor=block3 => top-most=parent1 => remove parent1
      editor.plugin(BlockSelectionPlugin).store.set({
        selectedKeys: nodeKeySet(editor, ['block3', 'parent1']),
      });
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ anchorKey: nodeKey(editor, 'block3') });

      editor.plugin(BlockSelectionPlugin).api.shiftSelection('down');

      const selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      expect(persistedIds(editor, selectedKeys)).toEqual(['block3']);
    });

    it('expand up from block4 to block3 if anchor is block4 (bottom-most)', () => {
      // block3, block4 selected; anchor=block4 => SHIFT+UP => expand to parent1
      // Actually, let's do block3, block4 => anchor=block4 => SHIFT+UP => add parent1
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['block3', 'block4']) });
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ anchorKey: nodeKey(editor, 'block4') });

      editor.plugin(BlockSelectionPlugin).api.shiftSelection('up');

      const selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      expect(persistedIds(editor, selectedKeys).sort()).toEqual(
        ['child1', 'block3', 'block4'].sort()
      );
    });

    it('shrink from block4 if anchor is parent1 SHIFT+UP', () => {
      // parent1, block3, block4 => anchor=parent1 => SHIFT+UP => remove block4
      editor.plugin(BlockSelectionPlugin).store.set({
        selectedKeys: nodeKeySet(editor, ['block3', 'block4', 'parent1']),
      });
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ anchorKey: nodeKey(editor, 'parent1') });

      editor.plugin(BlockSelectionPlugin).api.shiftSelection('up');

      const selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      // block4 should be removed from selection
      expect(persistedIds(editor, selectedKeys).sort()).toEqual(
        ['parent1', 'block3'].sort()
      );
    });

    it('skip non-selectable child2 when expanding down from parent1 to block3', () => {
      // We already set child2 as not selectable
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['parent1']) });
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ anchorKey: nodeKey(editor, 'parent1') });

      // SHIFT+DOWN => next selectable after parent1 is block3, skipping child2
      editor.plugin(BlockSelectionPlugin).api.shiftSelection('down');
      const selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');

      expect(persistedIds(editor, selectedKeys).sort()).toEqual(
        ['parent1', 'block3'].sort()
      );
    });
  });

  describe('Complex columns or table-like structure', () => {
    beforeEach(() => {
      editor = createSelectionTestEditor([
        {
          id: 'table1',
          children: [
            {
              id: 'tr1',
              children: [
                {
                  id: 'td11',
                  children: [
                    {
                      id: 'p11',
                      children: [{ text: 'Cell 1-1' }],
                      type: 'paragraph',
                    },
                  ],
                  type: 'tableCell',
                },
                {
                  id: 'td12',
                  children: [
                    {
                      id: 'p12',
                      children: [{ text: 'Cell 1-2' }],
                      type: 'paragraph',
                    },
                  ],
                  type: 'tableCell',
                },
              ],
              type: 'tableRow',
            },
            {
              id: 'tr2',
              children: [
                {
                  id: 'td21',
                  children: [
                    {
                      id: 'p21',
                      children: [{ text: 'Cell 2-1' }],
                      type: 'paragraph',
                    },
                  ],
                  type: 'tableCell',
                },
                {
                  id: 'td22',
                  children: [
                    {
                      id: 'p22',
                      children: [{ text: 'Cell 2-2' }],
                      type: 'paragraph',
                    },
                  ],
                  type: 'tableCell',
                },
              ],
              type: 'tableRow',
            },
          ],
          type: 'table',
        },
        {
          id: 'blockZ',
          children: [{ text: 'Below Table' }],
          type: 'paragraph',
        },
      ]);

      // Let’s make only 'table' and 'tableRow' selectable
      editor.plugin(BlockSelectionPlugin).store.set({
        isSelectable: (node) =>
          node.type === 'table' || node.type === 'tableRow',
      });
    });

    it('does not expand down from table1 => add tr1 if anchor=table1', () => {
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['table1']) });
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ anchorKey: nodeKey(editor, 'table1') });

      editor.plugin(BlockSelectionPlugin).api.shiftSelection('down');

      const selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      // Should now have table1 + tr1
      expect(persistedIds(editor, selectedKeys).sort()).toEqual(
        ['table1'].sort()
      );
    });

    it('shrink from table1 if anchor=tr1 SHIFT+DOWN', () => {
      // table1, tr1 => anchor=tr1 => top-most=table1 => remove table1
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['table1', 'tr1']) });
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ anchorKey: nodeKey(editor, 'tr1') });

      editor.plugin(BlockSelectionPlugin).api.shiftSelection('down');

      const selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      expect(persistedIds(editor, selectedKeys)).toEqual(['tr1']);
    });

    it('expand up from tr1 => add table1 if anchor=tr1 is bottom-most - remove', () => {
      // Suppose table1, tr1 are selected => anchor=tr1 => SHIFT+UP => expand up => add ???
      // But let's do an easier test: if only tr1 is selected => anchor=tr1 => SHIFT+UP =>
      // see if there's an above block to add? Actually, tr1 is the bottom-most if there's only 1 selected.
      // This scenario is contrived, let's just keep it simple:
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['tr1']) });
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ anchorKey: nodeKey(editor, 'tr1') });

      editor.plugin(BlockSelectionPlugin).api.shiftSelection('up');

      // We expect table1 included
      const selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      expect(persistedIds(editor, selectedKeys).sort()).toEqual(
        ['table1'].sort()
      );
    });

    it('expand down from tr1 => add tr2 if anchor=tr1 is top-most', () => {
      // anchor=tr1 => SHIFT+DOWN => add tr2
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['tr1']) });
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ anchorKey: nodeKey(editor, 'tr1') });

      editor.plugin(BlockSelectionPlugin).api.shiftSelection('down');

      const selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      expect(persistedIds(editor, selectedKeys).sort()).toEqual(
        ['tr1', 'tr2'].sort()
      );
    });

    it('shrink from tr1 if anchor=tr2 SHIFT+DOWN', () => {
      // anchor=tr2 => top-most=tr1 => remove tr1
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['tr1', 'tr2']) });
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ anchorKey: nodeKey(editor, 'tr2') });

      editor.plugin(BlockSelectionPlugin).api.shiftSelection('down');

      const selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      expect(persistedIds(editor, selectedKeys)).toEqual(['tr2']);
    });

    it('skip td / p nodes that are not selectable', () => {
      // anchor=tr2 => SHIFT+DOWN => next would be blockZ skipping over child tds
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['tr2']) });
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ anchorKey: nodeKey(editor, 'tr2') });

      // SHIFT+DOWN => tries to find next block after tr2 => blockZ is next top-level
      editor.plugin(BlockSelectionPlugin).api.shiftSelection('down');

      const _selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      // Now includes blockZ only if blockZ is selectable.
      // Since we only made 'table' or 'tableRow' selectable, blockZ might be skipped.
      // For this test let's assume blockZ is also selectable => let's set isSelectable accordingly.
      // We'll do that quickly:
      editor.plugin(BlockSelectionPlugin).store.set({
        isSelectable: (node) =>
          node.type === 'table' ||
          node.type === 'tableRow' ||
          node.id === 'blockZ',
      });
      // Re-run shiftSelection to see if blockZ is included
      editor.plugin(BlockSelectionPlugin).api.shiftSelection('down');

      const newSelectedIds = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      expect(persistedIds(editor, newSelectedIds).sort()).toEqual(
        ['blockZ', 'tr2'].sort()
      );
    });
  });

  describe('Anchor defaults to top-most/bottom-most if not set', () => {
    it('set anchor to top-most for SHIFT+DOWN', () => {
      // We have block1, block2.
      // Let's select block2 only, no anchor set => SHIFT+DOWN => anchor=top-most => block2 => expand => block3.
      editor = createSelectionTestEditor([
        { id: 'block1', children: [{ text: 'One' }], type: 'paragraph' },
        { id: 'block2', children: [{ text: 'Two' }], type: 'paragraph' },
        { id: 'block3', children: [{ text: 'Three' }], type: 'paragraph' },
      ]);

      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['block2']) });
      editor.plugin(BlockSelectionPlugin).store.set({ anchorKey: null });

      editor.plugin(BlockSelectionPlugin).api.shiftSelection('down');

      // Now block2, block3 selected
      const selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      expect(persistedIds(editor, selectedKeys).sort()).toEqual(
        ['block2', 'block3'].sort()
      );
      // anchor is set to block2
      const anchorKey = editor
        .plugin(BlockSelectionPlugin)
        .store.get('anchorKey');
      expect(persistedId(editor, anchorKey!)).toBe('block2');
    });

    it('set anchor to bottom-most for SHIFT+UP', () => {
      // block1, block2 => no anchor => SHIFT+UP => anchor=bottom-most => block2 => expand up => block3 if existed
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['block1', 'block2']) });
      editor.plugin(BlockSelectionPlugin).store.set({ anchorKey: null });

      editor.plugin(BlockSelectionPlugin).api.shiftSelection('up');

      // Because we only have block1, block2, we can't go "up" further
      const selectedKeys = editor
        .plugin(BlockSelectionPlugin)
        .store.get('selectedKeys');
      expect(persistedIds(editor, selectedKeys)).toEqual(['block1', 'block2']);

      const anchorKey = editor
        .plugin(BlockSelectionPlugin)
        .store.get('anchorKey');
      expect(persistedId(editor, anchorKey!)).toBe('block2');
    });
  });
});

const createDocumentTransformEditor = () =>
  createBaseEditor({
    editor: createPliteEditor<Value>(),
    plugins: [
      ElementIdPlugin,
      BlockSelectionPlugin,
      TestBoldPlugin,
      TestElementPropertiesPlugin,
    ],
    initialValue: [
      {
        id: 'block1',
        children: [{ text: 'One' }],
        type: 'paragraph',
      },
      {
        id: 'block2',
        children: [{ text: 'Two' }],
        type: 'paragraph',
      },
    ],
  });

describe('block selection document transforms', () => {
  it('inserts blocks through the editor update API', () => {
    const editor = createDocumentTransformEditor();
    const insertedCallback = mock();

    editor.update((tx) => {
      tx.blockSelection.insertBlocksAndSelect(
        [
          {
            id: 'block3',
            children: [{ text: 'Three' }],
            type: 'paragraph',
          },
        ],
        { at: [1], insertedCallback }
      );
    });

    expect(editor.read.children().map((node: any) => node.id)).toEqual([
      'block1',
      'block3',
      'block2',
    ]);
    expect(insertedCallback).toHaveBeenCalledTimes(1);
    expect(
      editor.plugin(BlockSelectionPlugin).store.get('selectedKeys')
    ).toEqual(nodeKeySet(editor, ['block3']));
  });

  it('does not publish insert callbacks or plugin state on rollback', () => {
    const editor = createDocumentTransformEditor();
    const insertedCallback = mock();
    const selectedKeys = editor
      .plugin(BlockSelectionPlugin)
      .store.get('selectedKeys');

    expect(() =>
      editor.update((tx) => {
        tx.blockSelection.insertBlocksAndSelect(
          [
            {
              id: 'block3',
              children: [{ text: 'Three' }],
              type: 'paragraph',
            },
          ],
          { at: [1], insertedCallback }
        );
        throw new Error('rollback');
      })
    ).toThrow('rollback');

    expect(insertedCallback).not.toHaveBeenCalled();
    expect(editor.read.children().map((node: any) => node.id)).toEqual([
      'block1',
      'block2',
    ]);
    expect(editor.plugin(BlockSelectionPlugin).store.get('selectedKeys')).toBe(
      selectedKeys
    );
  });

  it('removes selected blocks through the editor update API', () => {
    const editor = createDocumentTransformEditor();

    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedKeys: nodeKeySet(editor, ['block1']) });

    editor.update((tx) => {
      tx.blockSelection.removeNodes();
    });

    expect(editor.read.children().map((node: any) => node.id)).toEqual([
      'block2',
    ]);
  });

  it('sets selected block element props through the editor update API', () => {
    const editor = createDocumentTransformEditor();

    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedKeys: nodeKeySet(editor, ['block1']) });

    editor.update((tx) => {
      tx.blockSelection.setNodes({ align: 'center' });
    });

    expect(editor.read.children()[0].align).toBe('center');
    expect(editor.read.children()[1].align).toBeUndefined();
  });

  it('sets a selected block inserted earlier in the same transaction', () => {
    const editor = createDocumentTransformEditor();

    editor.update((tx) => {
      tx.nodes.insert(
        { id: 'block3', children: [{ text: 'Three' }], type: 'paragraph' },
        { at: [1] }
      );
      const insertedKey = tx.key([1]);

      if (!insertedKey) throw new Error('Missing inserted node key.');
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: new Set([insertedKey]) });
      tx.blockSelection.setNodes({ align: 'center' });
    });

    expect(editor.read.children()[1].align).toBe('center');
  });

  it('sets selected block indentation through the editor update API', () => {
    const editor = createDocumentTransformEditor();

    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedKeys: nodeKeySet(editor, ['block1']) });

    editor.update((tx) => {
      tx.blockSelection.setIndent(2);
      tx.blockSelection.setIndent(-5);
    });

    expect(editor.read.children()[0].indent).toBe(0);
  });

  it('sets selected text props through the editor update API', () => {
    const editor = createDocumentTransformEditor();

    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedKeys: nodeKeySet(editor, ['block1']) });

    editor.update((tx) => {
      tx.blockSelection.setTexts({ bold: true });
    });

    expect(editor.read.children()[0].children[0].bold).toBe(true);
    expect(editor.read.children()[1].children[0].bold).toBeUndefined();
  });
});

describe('duplicateBlockSelectionNodes', () => {
  it('duplicates selected blocks through the editor update transaction', () => {
    const editor = createBaseEditor({
      editor: createPliteEditor<Value>(),
      plugins: [ElementIdPlugin, BlockSelectionPlugin],
      initialValue: [
        {
          id: 'block1',
          children: [{ text: 'One' }],
          type: 'paragraph',
        },
        {
          id: 'block2',
          children: [{ text: 'Two' }],
          type: 'paragraph',
        },
      ],
    });

    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedKeys: nodeKeySet(editor, ['block1']) });
    const selectedKeys = editor
      .plugin(BlockSelectionPlugin)
      .store.get('selectedKeys');

    editor.update((tx) => {
      tx.blockSelection.duplicate();
    });

    expect(editor.read.children().map(NodeApi.string)).toEqual([
      'One',
      'One',
      'Two',
    ]);
    expect(editor.read.children()[0]?.id).toBe('block1');
    expect(editor.read.children()[1]?.id).not.toBe('block1');
    expect(editor.read.children()[2]?.id).toBe('block2');
    expect(
      editor.plugin(BlockSelectionPlugin).store.get('selectedKeys')
    ).not.toBe(selectedKeys);
  });

  it('does not schedule plugin state after a rolled-back duplicate', async () => {
    const editor = createBaseEditor({
      editor: createPliteEditor<Value>(),
      plugins: [ElementIdPlugin, BlockSelectionPlugin],
      initialValue: [
        {
          id: 'block1',
          children: [{ text: 'One' }],
          type: 'paragraph',
        },
      ],
    });

    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedKeys: nodeKeySet(editor, ['block1']) });
    const selectedKeys = editor
      .plugin(BlockSelectionPlugin)
      .store.get('selectedKeys');

    expect(() =>
      editor.update((tx) => {
        tx.blockSelection.duplicate();
        throw new Error('rollback');
      })
    ).toThrow('rollback');
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(editor.read.children()).toHaveLength(1);
    expect(editor.plugin(BlockSelectionPlugin).store.get('selectedKeys')).toBe(
      selectedKeys
    );
  });
});

describe('selectBlockSelectionNodes', () => {
  it('sets the editor selection through the editor update transaction', () => {
    const editor = createBaseEditor({
      editor: createPliteEditor<Value>(),
      plugins: [ElementIdPlugin, BlockSelectionPlugin],
      initialValue: [
        {
          id: 'block1',
          children: [{ text: 'One' }],
          type: 'paragraph',
        },
        {
          id: 'block2',
          children: [{ text: 'Two' }],
          type: 'paragraph',
        },
      ],
    });

    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedKeys: nodeKeySet(editor, ['block1']) });

    editor.update((tx) => {
      tx.blockSelection.select();
    });

    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
    expect(
      editor.plugin(BlockSelectionPlugin).store.get('selectedKeys')
    ).toEqual(new Set());
  });

  it('sets a range across all selected blocks', () => {
    const editor = createBaseEditor({
      editor: createPliteEditor<Value>(),
      plugins: [ElementIdPlugin, BlockSelectionPlugin],
      initialValue: [
        {
          id: 'block1',
          children: [{ text: 'One' }],
          type: 'paragraph',
        },
        {
          id: 'block2',
          children: [{ text: 'Two' }],
          type: 'paragraph',
        },
      ],
    });

    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedKeys: nodeKeySet(editor, ['block1', 'block2']) });

    editor.update((tx) => {
      tx.blockSelection.select();
    });

    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 3, path: [1, 0] },
    });
    expect(
      editor.plugin(BlockSelectionPlugin).store.get('selectedKeys')
    ).toEqual(new Set());
  });

  it('does not mutate plugin state when no model range is found', () => {
    const editor = createBaseEditor({
      editor: createPliteEditor<Value>(),
      plugins: [ElementIdPlugin, BlockSelectionPlugin],
      initialValue: [
        {
          id: 'block1',
          children: [{ text: 'One' }],
          type: 'paragraph',
        },
      ],
    });

    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedKeys: new Set(['missing' as NodeKey]) });

    const selectedKeys = editor
      .plugin(BlockSelectionPlugin)
      .store.get('selectedKeys');

    editor.update((tx) => {
      tx.blockSelection.select();
    });

    expect(editor.read.selection()).toBeNull();
    expect(editor.plugin(BlockSelectionPlugin).store.get('selectedKeys')).toBe(
      selectedKeys
    );
  });

  it('keeps plugin selection intact when publication rolls back', () => {
    const editor = createBaseEditor({
      editor: createPliteEditor<Value>(),
      plugins: [ElementIdPlugin, BlockSelectionPlugin],
      initialValue: [
        {
          id: 'block1',
          children: [{ text: 'One' }],
          type: 'paragraph',
        },
      ],
    });

    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedKeys: nodeKeySet(editor, ['block1']) });
    const selectedKeys = editor
      .plugin(BlockSelectionPlugin)
      .store.get('selectedKeys');

    expect(() =>
      editor.update((tx) => {
        tx.blockSelection.select();
        throw new Error('rollback');
      })
    ).toThrow('rollback');
    expect(editor.read.selection()).toBeNull();
    expect(editor.plugin(BlockSelectionPlugin).store.get('selectedKeys')).toBe(
      selectedKeys
    );
  });

  it('reads blocks inserted earlier in the same transaction', () => {
    const editor = createBaseEditor({
      editor: createPliteEditor<Value>(),
      plugins: [ElementIdPlugin, BlockSelectionPlugin],
      initialValue: [
        {
          id: 'block1',
          children: [{ text: 'One' }],
          type: 'paragraph',
        },
      ],
    });

    editor.update((tx) => {
      tx.nodes.insert(
        { id: 'block2', children: [{ text: 'Two' }], type: 'paragraph' },
        { at: [1] }
      );
      const insertedKey = tx.key([1]);

      if (!insertedKey) throw new Error('Missing inserted node key.');
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: new Set([insertedKey]) });
      tx.blockSelection.select();
    });

    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 3, path: [1, 0] },
    });
    expect(
      editor.plugin(BlockSelectionPlugin).store.get('selectedKeys')
    ).toEqual(new Set());
  });
});

type CopyOptions = {
  onCopy?: (dataTransfer: DataTransfer) => void;
};

const createDataTransfer = () => {
  const values = new Map<string, string>();
  const data = {
    get types() {
      return [...values.keys()];
    },
    getData: mock((type: string) => values.get(type) ?? ''),
    setData: mock((type: string, value: string) => {
      values.set(type, value);
    }),
  } as unknown as DataTransfer;

  return { data, values };
};

const CopyTableCellPlugin = defineBasePlugin('tableCell', {
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent(),
      blockContent: false,
    },
  }),
});

const CopyTableRowPlugin = defineBasePlugin('tableRow', {
  dependencies: [CopyTableCellPlugin],
  schema: {
    element: {
      content: schema.content.type('tableCell', { min: 1 }),
      blockContent: false,
    },
  },
});

const CopyTablePlugin = defineBasePlugin('table', {
  dependencies: [CopyTableRowPlugin],
  schema: {
    element: {
      content: schema.content.type('tableRow', { min: 1 }),
    },
  },
});

const createCopyEditor = (
  entries: Array<NodeEntry<Element>>,
  documentEntries = entries
) => {
  const selection = {
    anchor: { offset: 0, path: [0, 0] },
    focus: { offset: 0, path: [0, 0] },
    kind: 'text' as const,
  };
  const selectedElementIds = new Set(
    entries.flatMap(([node]) => (typeof node.id === 'string' ? [node.id] : []))
  );

  const editor = createPlateEditor({
    editor: createPliteEditor<Value>(),
    plugins: [
      BaseParagraphPlugin,
      CopyTablePlugin,
      ElementIdPlugin,
      BlockSelectionPlugin,
    ],
    selection,
    initialValue:
      documentEntries.length > 0
        ? documentEntries.map(([node]) => node)
        : [{ children: [{ text: '' }], type: 'paragraph' }],
  });

  editor.plugin(BlockSelectionPlugin).store.set({
    selectedKeys: nodeKeySet(editor, [...selectedElementIds]),
  });

  EDITOR_TO_WINDOW.set(editor, window);

  return editor;
};

const decodeSlice = (encoded: string) =>
  JSON.parse(decodeURIComponent(window.atob(encoded))).slice;

describe('api.copy', () => {
  let copyToClipboardSpy: AnyTestMock;
  let copyToClipboardMock: ReturnType<typeof mock>;
  let writeDOMRangeDataSpy: AnyTestMock;

  beforeEach(() => {
    copyToClipboardMock = mock();
    copyToClipboardSpy = spyOn(
      copyToClipboardModule,
      'default'
    ).mockImplementation(copyToClipboardMock);
    writeDOMRangeDataSpy = spyOn(
      PliteDOM,
      'writeDOMRangeData'
    ).mockImplementation((editor, data, range) => {
      const entry = editor.read.nodes.get(range.anchor.path.slice(0, 1), {
        match: ElementApi.isElement,
      });
      const text = entry ? NodeApi.string(entry[0]) : '';

      data.setData('text/plain', text);
      data.setData(
        'text/html',
        `<p data-plite-fragment="block" data-plite-fragment-format="x-plite-fragment">${text}</p>`
      );

      return data;
    });
  });

  afterEach(() => {
    copyToClipboardSpy.mockRestore();
    writeDOMRangeDataSpy.mockRestore();
  });

  it('writes one exact Plite slice while preserving model selection', () => {
    const entries = [
      [
        {
          id: 'block1',
          children: [{ text: 'First block' }],
          type: 'paragraph',
        },
        [0],
      ],
      [{ id: 'block2', children: [{ text: '' }], type: 'paragraph' }, [1]],
      [
        { id: 'block3', children: [{ text: 'Last block' }], type: 'paragraph' },
        [2],
      ],
    ] satisfies Array<NodeEntry<Element>>;
    const editor = createCopyEditor(entries);
    const { data, values } = createDataTransfer();
    const selection = editor.read.selection();

    copyToClipboardMock.mockImplementation(
      (_text: string, options?: CopyOptions) => {
        options?.onCopy?.(data);

        return true;
      }
    );

    expect(editor.plugin(BlockSelectionPlugin).api.copy()).toBe(true);
    expect(editor.read.selection()).toEqual(selection);
    expect(writeDOMRangeDataSpy).toHaveBeenCalledTimes(2);
    expect(values.get('text/plain')).toBe('First block\n\nLast block\n');
    expect(values.get('text/html')).toContain('<p></p>');
    expect(values.get('text/html')).toContain('data-plite-fragment=');
    expect(
      values.get('text/html')!.match(/data-plite-fragment=/g)
    ).toHaveLength(1);
    expect(decodeSlice(values.get('application/x-plite-fragment')!)).toEqual({
      content: entries.map(([{ id: _id, ...node }]) => node),
      openEnd: 0,
      openStart: 0,
    });
    expect(values.has('application/x-slate-fragment')).toBe(false);
  });

  it('writes directly to provided clipboard data without synthetic copy', () => {
    const entries = [
      [
        {
          id: 'block1',
          children: [{ text: 'First block' }],
          type: 'paragraph',
        },
        [0],
      ],
      [
        {
          id: 'block2',
          children: [{ text: 'Second block' }],
          type: 'paragraph',
        },
        [1],
      ],
    ] satisfies Array<NodeEntry<Element>>;
    const editor = createCopyEditor(entries);
    const { data, values } = createDataTransfer();

    expect(editor.plugin(BlockSelectionPlugin).api.copy(data)).toBe(true);
    expect(copyToClipboardMock).not.toHaveBeenCalled();
    expect(values.get('text/plain')).toBe('First block\nSecond block\n');
    expect(values.get('application/x-plite-fragment')).not.toBe('');
  });

  it('preserves collapsed table rows in the exact Plite slice', () => {
    const firstRow = {
      children: [
        {
          children: [{ children: [{ text: 'one' }], type: 'paragraph' }],
          id: 'cell1',
          type: 'tableCell',
        },
      ],
      id: 'row1',
      type: 'tableRow',
    };
    const secondRow = {
      children: [
        {
          children: [{ children: [{ text: 'two' }], type: 'paragraph' }],
          id: 'cell2',
          type: 'tableCell',
        },
      ],
      id: 'row2',
      type: 'tableRow',
    };
    const selectedTable = {
      children: [firstRow],
      id: 'table1',
      type: 'table',
    };
    const documentTable = {
      ...selectedTable,
      children: [firstRow, secondRow],
    };
    const editor = createCopyEditor(
      [[firstRow, [0, 0]]],
      [[documentTable, [0]]]
    );
    const { data, values } = createDataTransfer();

    expect(editor.plugin(BlockSelectionPlugin).api.copy(data)).toBe(true);
    expect(decodeSlice(values.get('application/x-plite-fragment')!)).toEqual({
      content: [
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      children: [{ text: 'one' }],
                      type: 'paragraph',
                    },
                  ],
                  type: 'tableCell',
                },
              ],
              type: 'tableRow',
            },
          ],
          type: 'table',
        },
      ],
      openEnd: 0,
      openStart: 0,
    });
  });

  it('returns false without writing when no blocks are selected', () => {
    const editor = createCopyEditor([]);
    const { data, values } = createDataTransfer();

    expect(editor.plugin(BlockSelectionPlugin).api.copy(data)).toBe(false);
    expect(values.size).toBe(0);
  });
});

const createPasteDataTransfer = () =>
  ({
    getData: mock((type: string) => (type === 'text/plain' ? 'pasted' : '')),
    setData: mock(),
  }) as unknown as DataTransfer;

describe('selection block utils', () => {
  afterEach(() => {
    mock.restore();
  });

  describe('update.selectInserted', () => {
    it('selects blocks introduced by the last canonical change', () => {
      const editor = createBaseEditor({
        editor: createPliteEditor<Value>(),
        plugins: [ElementIdPlugin, BlockSelectionPlugin],
        initialValue: [
          { children: [{ text: 'one' }], id: 'p1', type: 'paragraph' },
        ],
      });

      editor.update.nodes.insert(
        [
          { children: [{ text: 'a' }], id: 'a', type: 'paragraph' },
          { children: [{ text: 'b' }], id: 'b', type: 'paragraph' },
        ],
        { at: [1] }
      );

      editor.plugin(BlockSelectionPlugin).api.selectInserted();

      expect(
        editor.plugin(BlockSelectionPlugin).store.get('selectedKeys')
      ).toEqual(nodeKeySet(editor, ['a', 'b']));
    });

    it('does not select existing blocks changed by the last commit', () => {
      const editor = createBaseEditor({
        editor: createPliteEditor<Value>(),
        plugins: [
          ElementIdPlugin,
          BlockSelectionPlugin,
          TestElementPropertiesPlugin,
        ],
        initialValue: [
          { children: [{ text: 'one' }], id: 'p1', type: 'paragraph' },
        ],
      });

      editor.update.nodes.set({ variant: 'lead' }, { at: [0] });

      editor.plugin(BlockSelectionPlugin).api.selectInserted();

      expect(
        editor.plugin(BlockSelectionPlugin).store.get('selectedKeys')
      ).toEqual(new Set());
    });
  });

  describe('update.paste', () => {
    it('inserts a spacer block after the last non-empty selected block and pastes clipboard data', () => {
      const editor = createBaseEditor({
        editor: createPliteEditor<Value>(),
        plugins: [ElementIdPlugin, BlockSelectionPlugin],
        initialValue: [
          { children: [{ text: 'one' }], id: 'p1', type: 'paragraph' },
        ],
      });
      const initialValue = editor.read.children();
      let commits = 0;
      const unsubscribe = editor.subscribeCommit(() => (commits += 1) - 1);

      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: nodeKeySet(editor, ['p1']) });
      const event = {
        clipboardData: createPasteDataTransfer(),
      } as ClipboardEvent;

      editor.plugin(BlockSelectionPlugin).update.paste(event.clipboardData!);

      unsubscribe();

      expect(editor.read.children()[1]).toMatchObject({
        children: [{ text: 'pasted' }],
        type: 'paragraph',
      });
      expect(editor.read.children()[1]?.id).toEqual(expect.any(String));
      expect(commits).toBe(1);
      expect(editor.read.history.undos()).toHaveLength(1);

      editor.update.history.undo();

      expect(editor.read.children()).toEqual(initialValue);
      expect(editor.read.history.redos()).toHaveLength(1);
    });

    it('rolls back the spacer and block-selection side effect when clipboard insertion throws', () => {
      const throwingClipboardPlugin = defineBasePlugin('throwingClipboard', {
        contributions: [
          PliteDOM.clipboardHandler({
            insertData() {
              throw new Error('clipboard failed');
            },
          }),
        ],
      });
      const editor = createBaseEditor({
        editor: createPliteEditor<Value>(),
        plugins: [
          ElementIdPlugin,
          BlockSelectionPlugin,
          throwingClipboardPlugin,
        ],
        initialValue: [
          { children: [{ text: 'one' }], id: 'p1', type: 'paragraph' },
        ],
      });
      const initialValue = editor.read.children();
      const selectedKeys = nodeKeySet(editor, ['p1']);
      let commits = 0;
      const unsubscribe = editor.subscribeCommit(() => (commits += 1) - 1);

      editor.plugin(BlockSelectionPlugin).store.set({ selectedKeys });
      const event = {
        clipboardData: createPasteDataTransfer(),
      } as ClipboardEvent;

      expect(() =>
        editor.plugin(BlockSelectionPlugin).update.paste(event.clipboardData!)
      ).toThrow('clipboard failed');

      unsubscribe();

      expect(editor.read.children()).toEqual(initialValue);
      expect(commits).toBe(0);
      expect(editor.read.history.undos()).toHaveLength(0);
      expect(
        editor.plugin(BlockSelectionPlugin).store.get('selectedKeys')
      ).toBe(selectedKeys);
    });
  });
});

describe('isSelecting', () => {
  it('returns true when the editor selection is expanded', () => {
    const editor = createBaseEditor({
      editor: createPliteEditor<Value>(),
      plugins: [ElementIdPlugin, BlockSelectionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      initialValue: [
        { children: [{ text: 'a' }], id: 'block1', type: 'paragraph' },
      ],
    });

    expect(editor.plugin(BlockSelectionPlugin).read.isSelecting()).toBe(true);
  });

  it('returns true when block selection says some blocks are being selected', () => {
    const editor = createBaseEditor({
      editor: createPliteEditor<Value>(),
      plugins: [ElementIdPlugin, BlockSelectionPlugin],
      initialValue: [
        { children: [{ text: 'a' }], id: 'block1', type: 'paragraph' },
      ],
    });

    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedKeys: nodeKeySet(editor, ['block1']) });

    expect(editor.plugin(BlockSelectionPlugin).read.isSelecting()).toBe(true);
  });

  it('returns false when neither selection state is active', () => {
    const editor = createBaseEditor({
      editor: createPliteEditor<Value>(),
      plugins: [ElementIdPlugin, BlockSelectionPlugin],
      initialValue: [
        { children: [{ text: 'a' }], id: 'block1', type: 'paragraph' },
      ],
    });

    expect(editor.plugin(BlockSelectionPlugin).read.isSelecting()).toBe(false);
  });
});
