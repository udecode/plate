/** @jsx jsxt */

import type React from 'react';

import {
  getEditorLiveSelection,
  jsxt,
  type TestEditor,
} from '#platejs-test-internal';

import type { Element, Location, Range, Value } from '../../../core';
import { DebugPlugin, NodeApi, schema } from '../../../core';
import { createTestTableEditor } from '../../../features/table/lib/__tests__/getTestTablePlugins';
import { BaseTablePlugin } from '../../../features/table/lib/BaseTablePlugin';
import { createTableNodeSelection } from '../../../features/table/lib/internal/selection';
import {
  createPluginContext,
  definePlatePlugin,
  type Editor,
} from '../../core';
import { TablePlugin } from './TablePlugin';

jsxt;

const createTableEditor = (input: TestEditor) => {
  const editor = createTestTableEditor({
    plugins: [TablePlugin],
    selection: input.selection,
    initialValue: input.children,
  });
  const selection = editor.read.selection();
  const view =
    selection && editor.plugin(BaseTablePlugin).read.selection(selection);
  const tableSelection = view && createTableNodeSelection(view);

  if (!tableSelection) throw new Error('Expected table node selection');

  editor.update.selection.set(tableSelection);

  return editor;
};

const createCrossTableEditor = () =>
  createTableEditor(
    (
      <editor>
        <htable id="source">
          <htr>
            <htd id="s1">
              <hp>
                <anchor />A
              </hp>
            </htd>
            <htd id="s2">
              <hp>
                B<focus />
              </hp>
            </htd>
          </htr>
        </htable>
        <htable id="target">
          <htr>
            <htd id="t1">
              <hp>X</hp>
            </htd>
            <htd id="t2">
              <hp>Y</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor
  );

const createOverlappingTableEditor = () =>
  createTableEditor(
    (
      <editor>
        <htable id="table">
          <htr>
            <htd id="c1">
              <hp>
                <anchor />A
              </hp>
            </htd>
            <htd id="c2">
              <hp>
                B<focus />
              </hp>
            </htd>
            <htd id="c3">
              <hp>C</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor
  );

const rootTable = (
  id: string,
  prefix: string,
  values: readonly [string, string]
): Element => ({
  children: [
    {
      children: values.map((text, index) => ({
        children: [{ children: [{ text }], type: 'paragraph' }],
        id: `${prefix}${index + 1}`,
        type: 'tableCell',
      })),
      id: `${prefix}-row`,
      type: 'tableRow',
    },
  ],
  id,
  type: 'table',
});

const rootPoint = (root: string | undefined, cell: number) => ({
  offset: 0,
  path: [0, 0, cell, 0, 0],
  ...(root === undefined ? {} : { root }),
});

const createRootMoveEditor = (
  direction: 'named-to-primary' | 'primary-to-named'
) => {
  const RootHolderPlugin = definePlatePlugin('tableDropRootHolder', {
    schema: {
      element: {
        contentRoots: {
          body: {
            content: schema.content.type('table', {
              default: { type: 'table' },
              min: 1,
            }),
            ownership: 'exclusive',
          },
        },
        blockContent: true,
        void: 'block',
      },
    },
  });
  const sourceRoot = direction === 'primary-to-named' ? undefined : 'side';
  const targetRoot = direction === 'primary-to-named' ? 'side' : undefined;
  const sourceTable = rootTable('source', 's', ['A', 'B']);
  const targetTable = rootTable('target', 't', ['X', 'Y']);
  const children: Value = [
    sourceRoot === undefined ? sourceTable : targetTable,
    {
      childRoots: { body: 'side' },
      children: [{ text: '' }],
      type: 'tableDropRootHolder',
    },
  ];
  const roots = {
    side: [sourceRoot === 'side' ? sourceTable : targetTable],
  };
  const sourceRange: Range = {
    anchor: rootPoint(sourceRoot, 0),
    focus: rootPoint(sourceRoot, 1),
  };
  const editor = createTestTableEditor({
    plugins: [TablePlugin, RootHolderPlugin],
    initialValue: { children, roots },
  });
  const view = editor.plugin(BaseTablePlugin).read.selection(sourceRange);
  const tableSelection = view && createTableNodeSelection(view);

  if (!tableSelection) throw new Error('Expected root-aware cell selection');

  editor.update.selection.set(tableSelection);

  return {
    editor,
    source: rootPoint(sourceRoot, 0),
    sourceRoot,
    target: rootPoint(targetRoot, 0),
    targetRoot,
  };
};

type TestDragEvent = React.DragEvent & {
  preventDefault: AnyTestMock;
  stopPropagation: AnyTestMock;
};

const createDragEvent = (
  dataTransfer: DataTransfer,
  modifiers: Partial<
    Pick<React.DragEvent, 'altKey' | 'ctrlKey' | 'metaKey'>
  > & {
    dragCellKey?: string;
  } = {}
) =>
  ({
    altKey: false,
    ctrlKey: false,
    dataTransfer,
    metaKey: false,
    preventDefault: mock(),
    stopPropagation: mock(),
    target: modifiers.dragCellKey
      ? {
          closest: (selector: string) =>
            selector === '[data-table-cell-drag-handle="true"]'
              ? {
                  getAttribute: (attribute: string) =>
                    attribute === 'data-table-cell-drag-for'
                      ? modifiers.dragCellKey
                      : null,
                }
              : null,
        }
      : null,
    ...modifiers,
  }) as unknown as TestDragEvent;

const rangeAt = (editor: Editor, at: Location) => {
  const range = editor.read.ranges.get(at);

  if (!range) throw new Error(`Expected range at ${JSON.stringify(at)}`);

  return range;
};

const installEventRangeApi = (
  editor: Editor,
  locations: readonly Location[]
) => {
  const eventRanges = locations.map((at) => rangeAt(editor, at));
  const warn = mock();

  editor.plugin(DebugPlugin).store.set({ logger: { warn } });
  spyOn(editor.api.dom, 'resolveEventRange').mockImplementation(
    () => eventRanges.shift() ?? null
  );

  return warn;
};

const runHandler = (
  editor: Editor,
  ...[key, event]:
    | [
        key: 'dragEnd' | 'dragOver' | 'dragStart' | 'drop',
        event: React.DragEvent,
      ]
    | [key: 'mouseUp', event: React.MouseEvent]
) => {
  const context = createPluginContext(editor, TablePlugin);
  const plugin = editor.plugin(TablePlugin);

  if (key === 'mouseUp') {
    const handler = plugin.on.mouseUp;

    if (!handler) throw new Error('Expected TablePlugin mouseUp handler');

    return handler({ ...context, event });
  }

  const handler = plugin.on[key];

  if (!handler) throw new Error(`Expected TablePlugin ${key} handler`);

  return handler({ ...context, event });
};

const installDOMSelectionApi = (
  editor: Editor,
  range: Range | null,
  {
    collapsed = false,
    rangeCount = 1,
  }: {
    collapsed?: boolean;
    rangeCount?: number;
  } = {}
) => {
  const domSelection = {
    isCollapsed: collapsed,
    rangeCount,
  } as unknown as globalThis.Selection;

  spyOn(editor.api.dom, 'findDocumentOrShadowRoot').mockReturnValue({
    getSelection: () => domSelection,
  });
  spyOn(editor.api.dom, 'resolvePliteRange').mockReturnValue(range);
};

const readTable = (editor: Editor, index: number) => {
  const table = editor.read.children()[index];

  return table.children.map((row: Element) =>
    row.children.map((cell) => NodeApi.string(cell))
  );
};

const readRootTable = (editor: Editor, root?: string) => {
  const value = editor.read.value();
  const table = (
    root === undefined ? value.children[0] : value.roots?.[root]?.[0]
  )!;

  return table.children.map((row: Element) =>
    row.children.map((cell) => NodeApi.string(cell))
  );
};

const dragSelectedCells = (
  editor: Editor,
  {
    copy = false,
    target,
    trackCommits = false,
  }: {
    copy?: boolean;
    target: Location;
    trackCommits?: boolean;
  }
) => {
  const sourceCellKey = editor.plugin(BaseTablePlugin).read.selection()
    ?.cellKeys[0];

  if (!sourceCellKey) throw new Error('Expected source cell id');

  const dataTransfer = {
    dropEffect: 'move',
    setData: mock(),
    types: ['application/x-plate-table-cell-selection'],
  } as unknown as DataTransfer;
  const dragStart = createDragEvent(dataTransfer, {
    dragCellKey: sourceCellKey,
  });
  const drop = createDragEvent(dataTransfer, copy ? { altKey: true } : {});

  const warn = installEventRangeApi(editor, [target]);
  const commits: unknown[] = [];
  const unsubscribe = trackCommits
    ? editor.subscribeCommit((commit) => commits.push(commit))
    : undefined;

  const dragStartResult = runHandler(editor, 'dragStart', dragStart) as unknown;
  const dropResult = runHandler(editor, 'drop', drop) as unknown;

  unsubscribe?.();
  expect(dragStartResult).toBeUndefined();
  expect(dropResult).toBe(true);
  expect(drop.preventDefault).toHaveBeenCalledTimes(1);
  expect(drop.stopPropagation).toHaveBeenCalledTimes(1);

  return { commits, dragStart, drop, warn };
};

describe('TablePlugin table drag/drop', () => {
  it('promotes a native multi-cell range when the DOM collapsed flag is stale', () => {
    const editor = createCrossTableEditor();
    const range = {
      anchor: { offset: 1, path: [0, 0, 1, 0, 0] },
      focus: { offset: 0, path: [0, 0, 0, 0, 0] },
    };

    editor.update.selection.set(range);
    installDOMSelectionApi(editor, range, { collapsed: true });

    const result = runHandler(editor, 'mouseUp', {} as React.MouseEvent);

    expect(result).toBe(true);
    expect(getEditorLiveSelection(editor)).toMatchObject({
      anchorPath: [0, 0, 1],
      focusPath: [0, 0, 0],
      kind: 'node',
    });
    expect(editor.read.selection.ranges()).toHaveLength(2);
  });

  it('leaves native text selection inside one table cell to the Plite runtime', () => {
    const editor = createCrossTableEditor();
    const range = {
      anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
      focus: { offset: 1, path: [0, 0, 0, 0, 0] },
    };

    editor.update.selection.set(range);
    installDOMSelectionApi(editor, range);

    const result = runHandler(editor, 'mouseUp', {} as React.MouseEvent);

    expect(result).toBeUndefined();
    expect(editor.read.selection()).toMatchObject({
      anchor: range.anchor,
      focus: range.focus,
    });
  });

  it('moves selected cells across tables in one commit', () => {
    const editor = createCrossTableEditor();

    const { commits } = dragSelectedCells(editor, {
      target: [1, 0, 0],
      trackCommits: true,
    });

    expect(readTable(editor, 0)).toEqual([['', '']]);
    expect(readTable(editor, 1)).toEqual([['A', 'B']]);
    expect(commits).toHaveLength(1);
    expect(getEditorLiveSelection(editor)).toMatchObject({
      anchorPath: [1, 0, 0],
      focusPath: [1, 0, 1],
      kind: 'node',
    });
    expect(editor.read.history.undos()).toHaveLength(1);

    editor.update.history.undo();
    expect(readTable(editor, 0)).toEqual([['A', 'B']]);
    expect(readTable(editor, 1)).toEqual([['X', 'Y']]);

    editor.update.history.redo();
    expect(readTable(editor, 0)).toEqual([['', '']]);
    expect(readTable(editor, 1)).toEqual([['A', 'B']]);
  });

  it('accepts marked browser dragover while a table drag is active', () => {
    const editor = createCrossTableEditor();
    const sourceCellKey = editor.plugin(BaseTablePlugin).read.selection()
      ?.cellKeys[0];

    if (!sourceCellKey) throw new Error('Expected source cell key');

    const dataTransfer = {
      setData: mock(),
      types: ['application/x-plate-table-cell-selection'],
    } as unknown as DataTransfer;
    const dragStart = createDragEvent(dataTransfer, {
      dragCellKey: sourceCellKey,
    });
    const dragOver = createDragEvent(dataTransfer);

    expect(runHandler(editor, 'dragStart', dragStart)).toBeUndefined();
    expect(runHandler(editor, 'dragOver', dragOver)).toBe(true);
    expect(dragOver.preventDefault).toHaveBeenCalledTimes(1);
    expect(dragOver.stopPropagation).toHaveBeenCalledTimes(1);
  });

  it('moves one structurally selected cell', () => {
    const editor = createCrossTableEditor();
    const point = { offset: 0, path: [0, 0, 0, 0, 0] };

    editor.update.selection.set({ anchor: point, focus: point });
    expect(
      editor.plugin(BaseTablePlugin).read.selection()?.anchors
    ).toHaveLength(1);

    dragSelectedCells(editor, {
      target: [1, 0, 0],
    });

    expect(readTable(editor, 0)).toEqual([['', 'B']]);
    expect(readTable(editor, 1)).toEqual([['A', 'Y']]);
  });

  it('copies without clearing the source cells', () => {
    const editor = createCrossTableEditor();

    dragSelectedCells(editor, {
      copy: true,
      target: [1, 0, 0],
    });

    expect(readTable(editor, 0)).toEqual([['A', 'B']]);
    expect(readTable(editor, 1)).toEqual([['A', 'B']]);
  });

  it('moves an overlapping selection without clearing its destination', () => {
    const editor = createOverlappingTableEditor();

    dragSelectedCells(editor, {
      target: [0, 0, 1],
    });

    expect(readTable(editor, 0)).toEqual([['', 'A', 'B']]);
  });

  it.each(['primary-to-named', 'named-to-primary'] as const)(
    'moves selected cells %s in one root-aware commit',
    (direction) => {
      const { editor, sourceRoot, target, targetRoot } =
        createRootMoveEditor(direction);
      const { commits } = dragSelectedCells(editor, {
        target,
        trackCommits: true,
      });

      expect(readRootTable(editor, sourceRoot)).toEqual([['', '']]);
      expect(readRootTable(editor, targetRoot)).toEqual([['A', 'B']]);
      expect(commits).toHaveLength(1);
      expect(getEditorLiveSelection(editor)).toMatchObject({
        anchorPath: [0, 0, 0],
        focusPath: [0, 0, 1],
        kind: 'node',
        ...(targetRoot === undefined ? {} : { root: targetRoot }),
      });
    }
  );

  it('does not apply a stale capture to an unmarked drop', () => {
    const editor = createCrossTableEditor();
    const internalTransfer = {
      dropEffect: 'move',
      setData: mock(),
      types: ['application/x-plate-table-cell-selection'],
    } as unknown as DataTransfer;
    const externalTransfer = {
      dropEffect: 'move',
      types: ['text/plain'],
    } as unknown as DataTransfer;
    const dragStart = createDragEvent(internalTransfer, {
      dragCellKey: editor.key([0, 0, 0])!,
    });
    const drop = createDragEvent(externalTransfer);

    installEventRangeApi(editor, [[1, 0, 0]]);

    runHandler(editor, 'dragStart', dragStart);

    expect(runHandler(editor, 'drop', drop)).toBeUndefined();
    expect(readTable(editor, 0)).toEqual([['A', 'B']]);
    expect(readTable(editor, 1)).toEqual([['X', 'Y']]);
  });

  it('clears a canceled drag capture on drag end', () => {
    const editor = createCrossTableEditor();
    const dataTransfer = {
      dropEffect: 'move',
      setData: mock(),
      types: ['application/x-plate-table-cell-selection'],
    } as unknown as DataTransfer;
    const dragStart = createDragEvent(dataTransfer, { dragCellKey: 's1' });
    const dragEnd = createDragEvent(dataTransfer);
    const drop = createDragEvent(dataTransfer);

    installEventRangeApi(editor, [[1, 0, 0]]);

    runHandler(editor, 'dragStart', dragStart);
    runHandler(editor, 'dragEnd', dragEnd);

    expect(runHandler(editor, 'drop', drop)).toBeUndefined();
    expect(readTable(editor, 0)).toEqual([['A', 'B']]);
    expect(readTable(editor, 1)).toEqual([['X', 'Y']]);
  });
});
