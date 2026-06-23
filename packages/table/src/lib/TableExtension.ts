import type {
  Descendant,
  EditorExtensionInput,
  EditorUpdateTransaction,
  Element,
  NodeEntry,
  Operation,
  Path,
  Range,
} from '@platejs/slate';
import type {
  SlateEditor,
  SlatePluginContext,
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from 'platejs';

import {
  defineEditorExtension,
  ElementApi,
  PathApi,
  RangeApi,
  TextApi,
} from '@platejs/slate';
import cloneDeep from 'lodash/cloneDeep.js';
import { KEYS } from 'platejs';

import type { TableConfig } from './BaseTablePlugin';

import {
  getNextTableCell,
  getPreviousTableCell,
  getTableColumnCount,
  getTableEntries,
  getTableGridAbove,
} from './queries';
import { moveSelectionFromCell } from './transforms';
import {
  getTableMoveSelectionContext,
  hasAdjacentBlockInCell,
  shouldMoveSelectionFromCell,
} from './transforms/shouldMoveSelectionFromCell';
import { computeCellIndices, getCellTypes } from './utils/index';

type TableExtensionContext = Pick<
  SlatePluginContext<TableConfig>,
  'api' | 'editor' | 'getOption' | 'getOptions' | 'plugin' | 'type'
>;

type TableSetNodesOptions = NonNullable<
  Parameters<EditorUpdateTransaction['nodes']['set']>[1]
> & {
  block?: boolean;
  empty?: boolean;
  id?: string | true;
  text?: boolean;
};
type TableSetNodesTarget = NonNullable<TableSetNodesOptions['at']>;
type TableSetNodesPredicate = (node: unknown, path: Path) => boolean;
type TableNodeTransaction = {
  nodes: Pick<EditorUpdateTransaction['nodes'], 'insert' | 'remove'>;
};

const TABLE_INTERNAL_SET_NODES = Symbol('plate.table.internalSetNodes');

type TableInternalSetNodesOptions = TableSetNodesOptions & {
  [TABLE_INTERNAL_SET_NODES]?: true;
};

const toArray = <T>(value: T | T[]) => (Array.isArray(value) ? value : [value]);

const isElementOfType = (node: unknown, type: string) =>
  ElementApi.isElement(node) && node.type === type;

const isElementOfTypes = (node: unknown, types: string[]) =>
  ElementApi.isElement(node) && types.includes(node.type);

const toInternalSetNodesOptions = (
  options: TableSetNodesOptions
): TableInternalSetNodesOptions => ({
  ...options,
  [TABLE_INTERNAL_SET_NODES]: true,
});

const toExternalSetNodesOptions = (
  options: TableInternalSetNodesOptions
): TableSetNodesOptions => {
  const { [TABLE_INTERNAL_SET_NODES]: _internal, ...externalOptions } = options;

  return externalOptions;
};

const matchesObject = (
  node: unknown,
  predicate: Record<string, unknown>
): boolean =>
  Object.entries(predicate).every(([key, value]) => {
    const nodeValue = (node as Record<string, unknown>)[key];

    return toArray(value).includes(nodeValue);
  });

const getPlateTransformMatch = (
  editor: SlateEditor,
  options?: TableSetNodesOptions
): TableSetNodesPredicate | undefined => {
  const { block, empty, id, match, text } = options ?? {};
  const predicates: TableSetNodesPredicate[] = [];

  if (text !== undefined) {
    predicates.push((node) => TextApi.isText(node) === text);
  }
  if (empty !== undefined) {
    predicates.push((node) => {
      if (TextApi.isText(node)) return node.text.length > 0 === !empty;
      if (!ElementApi.isElement(node)) return false;

      return editor.api.isEmpty(node) === empty;
    });
  }
  if (block !== undefined) {
    predicates.push(
      (node) => ElementApi.isElement(node) && editor.api.isBlock(node) === block
    );
  }
  if (id !== undefined) {
    predicates.push((node) => {
      const nodeId = (node as { id?: unknown }).id;

      return (id === true && !!nodeId) || nodeId === id;
    });
  }
  if (typeof match === 'function') {
    const matchFn = match as unknown as TableSetNodesPredicate;

    predicates.push((node, path) => matchFn(node, path));
  } else if (match && typeof match === 'object') {
    predicates.push((node) => matchesObject(node, match));
  }

  if (predicates.length === 0) return;

  return (node, path) => predicates.every((predicate) => predicate(node, path));
};

const combinePlateTransformMatchOptions = (
  editor: SlateEditor,
  match: TableSetNodesPredicate,
  options?: TableSetNodesOptions
): TableSetNodesPredicate => {
  const optionMatch = getPlateTransformMatch(editor, options);

  const defaultMatch: TableSetNodesPredicate = (() => {
    if (optionMatch) return optionMatch;

    if (options?.at && PathApi.isPath(options.at)) {
      const [targetNode] = editor.api.node(options.at) ?? [];

      return (node) => node === targetNode;
    }

    return (node) => ElementApi.isElement(node) && editor.api.isBlock(node);
  })();

  return (node, path) => match(node, path) && defaultMatch(node, path);
};

const isTargetingSelectedCell = (
  editor: SlateEditor,
  target: TableSetNodesTarget,
  cellPaths: Path[]
) => {
  if (PathApi.isPath(target)) {
    return cellPaths.some((cellPath) => PathApi.isCommon(cellPath, target));
  }

  const range = editor.api.range(target);

  if (!range) return false;

  return cellPaths.some((cellPath) => {
    const cellRange = editor.api.range(cellPath);

    if (!cellRange) return false;

    return (
      RangeApi.includes(cellRange, range.anchor) ||
      RangeApi.includes(cellRange, range.focus) ||
      RangeApi.includes(range, cellRange)
    );
  });
};

const replaceChildrenAtPath = (
  editor: SlateEditor,
  tx: TableNodeTransaction,
  path: Path,
  children: Descendant[]
) => {
  const [node] = editor.api.node<Element>({ at: path }) ?? [];
  const childCount = ElementApi.isElement(node) ? node.children.length : 0;

  for (let index = childCount - 1; index >= 0; index--) {
    tx.nodes.remove({ at: [...path, index] });
  }

  if (children.length > 0) {
    tx.nodes.insert(children, { at: [...path, 0] });
  }
};

const createTableCellBlock = (
  editor: SlateEditor,
  options: { children?: Descendant[] } = {}
): Element => {
  const createBlock = (
    editor.api.create as { block?: typeof editor.api.create.block }
  ).block;

  if (createBlock) return createBlock(options);

  return {
    children: options.children ?? [{ text: '' }],
    type: editor.getType(KEYS.p),
  };
};

const applyPastedTableToTableNode = ({
  api,
  editor,
  getOptions,
  insertedTable,
  startCellPath,
  tableNode,
  tablePath,
}: Pick<TableExtensionContext, 'api' | 'editor' | 'getOptions'> & {
  insertedTable: TTableElement;
  startCellPath: Path;
  tableNode: TTableElement;
  tablePath: Path;
}) => {
  const { disableExpandOnInsert } = getOptions();
  const nextTable = cloneDeep(tableNode);
  const startRowIndex = startCellPath.at(-2)!;
  const startColIndex = startCellPath.at(-1)!;
  let lastCellPath: Path | null = null;

  const createCellLike = (row: TTableRowElement) =>
    api.create.tableCell({
      header: (row.children as Element[]).every(
        (cell) => cell.type === editor.getType(KEYS.th)
      ),
    });

  const ensureRow = (rowIndex: number) => {
    while (nextTable.children.length <= rowIndex) {
      if (disableExpandOnInsert) return false;

      const sourceRow =
        (nextTable.children.at(-1) as TTableRowElement | undefined) ??
        ({
          children: [api.create.tableCell()],
          type: editor.getType(KEYS.tr),
        } as TTableRowElement);

      nextTable.children.push({
        children: (sourceRow.children as TTableCellElement[]).map(() =>
          createCellLike(sourceRow)
        ),
        type: editor.getType(KEYS.tr),
      });
    }

    return true;
  };

  const ensureColumn = (row: TTableRowElement, colIndex: number) => {
    while (row.children.length <= colIndex) {
      if (disableExpandOnInsert) return false;

      row.children.push(createCellLike(row));
    }

    return true;
  };

  (insertedTable.children as TTableRowElement[]).forEach((row, rowOffset) => {
    const targetRowIndex = startRowIndex + rowOffset;

    if (!ensureRow(targetRowIndex)) return;

    const targetRow = nextTable.children[targetRowIndex] as TTableRowElement;

    (row.children as TTableCellElement[]).forEach((cell, colOffset) => {
      const targetColIndex = startColIndex + colOffset;

      if (!ensureColumn(targetRow, targetColIndex)) return;

      const targetCell = targetRow.children[
        targetColIndex
      ] as TTableCellElement;

      targetCell.children = cloneDeep(api.table.getCellChildren!(cell));
      lastCellPath = [...tablePath, targetRowIndex, targetColIndex];
    });
  });

  return { lastCellPath, table: nextTable };
};

const getTableFragment = ({
  api,
  editor,
  fragment,
  type,
}: Pick<TableExtensionContext, 'api' | 'editor' | 'type'> & {
  fragment: Descendant[];
}) => {
  const newFragment: Descendant[] = [];

  fragment.forEach((node) => {
    if (ElementApi.isElement(node) && node.type === type) {
      const rows = node.children as TTableRowElement[];
      const rowCount = rows.length;

      if (!rowCount) return;

      const colCount = rows[0].children.length;
      const hasOneCell = rowCount <= 1 && colCount <= 1;

      if (hasOneCell) {
        const cell = rows[0] as TTableCellElement;
        const cellChildren = api.table.getCellChildren!(cell);
        newFragment.push(...(cellChildren[0].children as Element[]));

        return;
      }
      const subTable = getTableGridAbove(editor);

      if (subTable.length > 0) {
        newFragment.push(subTable[0][0]);

        return;
      }
    }

    newFragment.push(node);
  });

  return newFragment;
};

const updateTableSelectionOperation = ({
  editor,
  operation,
  tableType,
}: {
  editor: SlateEditor;
  operation: Operation;
  tableType: string;
}) => {
  if (operation.type !== 'set_selection' || !operation.newProperties) return;

  const newSelection = {
    ...editor.selection,
    ...operation.newProperties,
  } as Range | null;

  if (
    !RangeApi.isRange(newSelection) ||
    !editor.api.isAt({
      at: newSelection,
      blocks: true,
      match: (node) => isElementOfType(node, tableType),
    })
  ) {
    return;
  }

  const anchorEntry = editor.api.block({
    at: newSelection.anchor,
    match: (node) => isElementOfType(node, tableType),
  });

  if (anchorEntry) {
    const [, anchorPath] = anchorEntry;
    const isBackward = RangeApi.isBackward(newSelection);

    if (isBackward) {
      operation.newProperties.focus = editor.api.start(anchorPath);
    } else {
      const pointBefore = editor.api.before(anchorPath);

      if (pointBefore) {
        operation.newProperties.focus = editor.api.end(anchorPath);
      }
    }

    return;
  }

  const focusEntry = editor.api.block({
    at: newSelection.focus,
    match: (node) => isElementOfType(node, tableType),
  });

  if (!focusEntry) return;

  const [, focusPath] = focusEntry;
  const isBackward = RangeApi.isBackward(newSelection);

  if (isBackward) {
    const startPoint = editor.api.start(focusPath)!;
    const pointBefore = editor.api.before(startPoint);
    operation.newProperties.focus = pointBefore ?? startPoint;
  } else {
    operation.newProperties.focus = editor.api.end(focusPath);
  }
};

const updateTableCellIndices = ({
  editor,
  getOptions,
  operation,
  tableType,
}: Pick<TableExtensionContext, 'editor' | 'getOptions'> & {
  operation: Operation;
  tableType: string;
}) => {
  const opType =
    operation.type === 'remove_node'
      ? (operation.node.type as string)
      : operation.type === 'move_node'
        ? editor.api.node<Element>(operation.path)?.[0].type
        : undefined;

  const isTableOperation =
    (operation.type === 'remove_node' || operation.type === 'move_node') &&
    opType &&
    [editor.getType(KEYS.tr), tableType, ...getCellTypes(editor)].includes(
      opType
    );

  if (isTableOperation && operation.type === 'remove_node') {
    const cells = [
      ...editor.api.nodes<TTableCellElement>({
        at: operation.path,
        match: (node) => isElementOfTypes(node, getCellTypes(editor)),
      }),
    ];

    const cellIndices = getOptions()._cellIndices;

    cells.forEach(([cell]) => {
      delete cellIndices[cell.id as string];
    });
  }

  if (
    isTableOperation &&
    operation.type === 'move_node' &&
    opType !== tableType
  ) {
    const table = editor.api.node<TTableRowElement>({
      at: operation.newPath,
      match: (node) => isElementOfType(node, tableType),
    })?.[0];

    if (table) {
      computeCellIndices(editor, {
        tableNode: table,
      });
    }
  }
};

const getSelectedTableMarks = (editor: SlateEditor) => {
  const { selection } = editor;

  if (!selection || editor.api.isCollapsed()) return;

  const matchesCell = getTableGridAbove(editor, { format: 'cell' });

  if (matchesCell.length <= 1) return;

  const markCounts: Record<string, number> = {};
  const totalMarks: Record<string, unknown> = {};
  let totalNodes = 0;

  matchesCell.forEach(([_cell, cellPath]) => {
    const textNodeEntry = editor.api.nodes({
      at: cellPath,
      match: (node) => TextApi.isText(node),
    });

    Array.from(textNodeEntry, (item) => item[0]).forEach((item) => {
      totalNodes++;
      const keys = Object.keys(item);

      if (keys.length === 1) return;

      keys.splice(keys.indexOf('text'), 1);

      keys.forEach((key) => {
        markCounts[key] = (markCounts[key] || 0) + 1;
        totalMarks[key] = item[key];
      });
    });
  });

  Object.keys(markCounts).forEach((mark) => {
    if (markCounts[mark] !== totalNodes) {
      delete totalMarks[mark];
    }
  });

  return totalMarks;
};

const moveTableSelectionLine = (
  editor: SlateEditor,
  options: { reverse?: boolean }
) => {
  if (!editor.api.isCollapsed()) return false;

  const context = getTableMoveSelectionContext(editor);

  if (!context) return false;

  const { blockPath, cellPath, point } = context;
  const reverse = options.reverse ?? false;

  if (
    hasAdjacentBlockInCell(editor, {
      blockPath,
      cellPath,
      reverse,
    })
  ) {
    return false;
  }

  const shouldMoveAcrossCell = shouldMoveSelectionFromCell(editor, {
    blockPath,
    point,
    reverse,
  });

  if (!shouldMoveAcrossCell) return false;

  return !!moveSelectionFromCell(editor, {
    reverse,
  });
};

export const selectAllTable = (editor: SlateEditor, type = KEYS.table) => {
  const table = editor.api.above<Element>({
    match: (node) => isElementOfType(node, type),
  });

  if (!table) return false;

  const [, tablePath] = table;
  const tableRange = editor.api.range(tablePath);

  if (
    tableRange &&
    editor.selection &&
    RangeApi.equals(editor.selection, tableRange)
  ) {
    const documentRange = editor.api.range([]);

    if (!documentRange) return true;

    editor.update((tx) => {
      tx.selection.set(documentRange);
    });

    return true;
  }

  editor.update((tx) => {
    tx.selection.set(tablePath);
  });

  return true;
};

export const tabTable = (
  editor: SlateEditor,
  options: { reverse?: boolean } = {}
) => {
  if (editor.selection && editor.api.isExpanded()) {
    const tdEntries = Array.from(
      editor.api.nodes({
        at: editor.selection,
        match: (node) => isElementOfTypes(node, getCellTypes(editor)),
      })
    );

    if (tdEntries.length > 1) {
      editor.update((tx) => {
        tx.selection.collapse({
          edge: 'end',
        });
      });

      return true;
    }
  }

  const entries = getTableEntries(editor);

  if (!entries) return false;

  const { cell, row } = entries;
  const cellEntry = cell as NodeEntry;
  const rowEntry = row as NodeEntry;
  const [, cellPath] = cellEntry;

  if (options.reverse) {
    const previousCell = getPreviousTableCell(
      editor,
      cellEntry,
      cellPath,
      rowEntry
    );

    if (previousCell) {
      const [, previousCellPath] = previousCell;
      editor.update((tx) => {
        tx.selection.set(previousCellPath);
      });
    }
  } else {
    const nextCell = getNextTableCell(editor, cellEntry, cellPath, rowEntry);

    if (nextCell) {
      const [, nextCellPath] = nextCell;
      editor.update((tx) => {
        tx.selection.set(nextCellPath);
      });
    }
  }

  return true;
};

export const createTableExtension = ({
  api,
  editor,
  getOption,
  getOptions,
  type,
}: TableExtensionContext): EditorExtensionInput =>
  defineEditorExtension({
    name: 'plate:table',
    normalizers: {
      node({ entry, next, tx }) {
        const [node, path] = entry;
        const { enableUnsetSingleColSize, initialTableWidth } = getOptions();

        if (!ElementApi.isElement(node)) {
          next();
          return;
        }

        if (node.type === type) {
          const tableNode = node as TTableElement;

          if (
            !tableNode.children.some(
              (child) =>
                ElementApi.isElement(child) &&
                child.type === editor.getType(KEYS.tr)
            )
          ) {
            tx.nodes.remove({ at: path });
            return;
          }
          if (
            tableNode.colSizes &&
            tableNode.colSizes.length > 0 &&
            enableUnsetSingleColSize &&
            getTableColumnCount(tableNode) < 2
          ) {
            tx.nodes.unset('colSizes', { at: path });
            return;
          }

          const tableEntry = editor.api.block({
            above: true,
            at: path,
            match: (node) => isElementOfType(node, type),
          });

          if (tableEntry) {
            tx.nodes.unwrap({ at: path });
            return;
          }
          if (initialTableWidth) {
            const colCount = (
              tableNode.children[0]?.children as Element[] | undefined
            )?.length;

            if (colCount) {
              const colSizes: number[] = [];

              if (!tableNode.colSizes) {
                for (let i = 0; i < colCount; i++) {
                  colSizes.push(initialTableWidth / colCount);
                }
              } else if (tableNode.colSizes.some((size) => !size)) {
                tableNode.colSizes.forEach((colSize) => {
                  colSizes.push(colSize || initialTableWidth / colCount);
                });
              }
              if (colSizes.length > 0) {
                tx.nodes.set<TTableElement>({ colSizes }, { at: path });
                return;
              }
            }
          }
        }

        if (node.type === editor.getType(KEYS.tr)) {
          const parentEntry = editor.api.parent(path);

          if (parentEntry?.[0].type !== type) {
            tx.nodes.unwrap({ at: path });
            return;
          }
        }

        if (getCellTypes(editor).includes(node.type)) {
          const tableCellNode = node as TTableCellElement;
          const cellIndices = tableCellNode.id
            ? getOption('cellIndices', tableCellNode.id)
            : undefined;

          if (tableCellNode.id && !cellIndices) {
            computeCellIndices(editor, {
              all: true,
              cellNode: tableCellNode,
            });
          }

          const { children } = tableCellNode;
          const parentEntry = editor.api.parent(path);

          if (parentEntry?.[0].type !== editor.getType(KEYS.tr)) {
            tx.nodes.unwrap({ at: path });
            return;
          }
          if (children.length === 0) {
            replaceChildrenAtPath(editor, tx, path, [
              createTableCellBlock(editor),
            ]);
            return;
          }
          if (TextApi.isText(children[0])) {
            replaceChildrenAtPath(editor, tx, path, [
              createTableCellBlock(editor, {
                children: cloneDeep(children),
              }),
            ]);
            return;
          }
        }

        next();
      },
    },
    operations: {
      apply({ operation, next }) {
        updateTableSelectionOperation({
          editor,
          operation,
          tableType: type,
        });

        updateTableCellIndices({
          editor,
          getOptions,
          operation,
          tableType: type,
        });

        next(operation);
      },
    },
    queries: {
      fragment: {
        get({ next }) {
          return getTableFragment({
            api,
            editor,
            fragment: next(),
            type,
          });
        },
      },
      marks: {
        get({ next }) {
          return getSelectedTableMarks(editor) ?? next();
        },
      },
    },
    transforms: {
      addMark({ key, next, tx, value }) {
        if (
          !editor.selection ||
          editor.api.isCollapsed() ||
          editor.meta.isNormalizing
        ) {
          return next();
        }

        const matchesCell = getTableGridAbove(editor, { format: 'cell' });

        if (matchesCell.length <= 1) return next();

        matchesCell.forEach(([_cell, cellPath]) => {
          tx.nodes.set(
            {
              [key]: value,
            },
            toInternalSetNodesOptions({
              at: cellPath,
              split: true,
              voids: true,
              match: (node) => TextApi.isText(node),
            })
          );
        });

        return true;
      },
      deleteFragment({ next, tx, options }) {
        const cellEntries = getTableGridAbove(editor, { format: 'cell' });

        if (cellEntries.length > 1) {
          cellEntries.forEach(([, cellPath]) => {
            replaceChildrenAtPath(editor, tx, cellPath, [
              createTableCellBlock(editor),
            ]);
          });

          tx.selection.set({
            anchor: editor.api.start(cellEntries[0][1])!,
            focus: editor.api.end(cellEntries.at(-1)![1])!,
          });

          return true;
        }

        return next({ options });
      },
      insertFragment({ fragment, next, tx }) {
        const insertedTable = fragment.find(
          (node) => ElementApi.isElement(node) && node.type === type
        ) as TTableElement | undefined;

        if (!insertedTable) {
          const tableEntry = editor.api.above({
            at: editor.selection?.anchor,
            match: (node) => isElementOfType(node, type),
          });

          if (tableEntry) {
            const cellEntries = getTableGridAbove(editor, {
              format: 'cell',
            });

            if (cellEntries.length > 1) {
              cellEntries.forEach((cellEntry) => {
                if (!cellEntry) return;

                const [, cellPath] = cellEntry;

                replaceChildrenAtPath(
                  editor,
                  tx,
                  cellPath,
                  cloneDeep(fragment)
                );
              });

              tx.selection.set({
                anchor: editor.api.start(cellEntries[0][1])!,
                focus: editor.api.end(cellEntries.at(-1)![1])!,
              });

              return true;
            }
          }
        }

        if (insertedTable) {
          const tableEntry = editor.api.above({
            at: editor.selection?.anchor,
            match: (node) => isElementOfType(node, type),
          });

          if (tableEntry) {
            const [cellEntry] = getTableGridAbove(editor, {
              at: editor.selection?.anchor,
              format: 'cell',
            });

            if (cellEntry) {
              const [, startCellPath] = cellEntry;
              const [tableNode, tablePath] =
                tableEntry as NodeEntry<TTableElement>;
              const pasted = applyPastedTableToTableNode({
                api,
                editor,
                getOptions,
                insertedTable,
                startCellPath,
                tableNode,
                tablePath,
              });

              if (pasted?.lastCellPath) {
                tx.nodes.remove({ at: tablePath });
                tx.nodes.insert(pasted.table, { at: tablePath });
                tx.selection.set({
                  anchor: editor.api.start(startCellPath)!,
                  focus: editor.api.end(pasted.lastCellPath)!,
                });

                return true;
              }
            }
          } else if (fragment.length === 1 && fragment[0].type === KEYS.table) {
            tx.nodes.insert(fragment[0]);

            return true;
          }
        }

        return next({ fragment });
      },
      insertText({ next, options, text, tx }) {
        if (editor.api.isExpanded()) {
          const entry = editor.api.above({
            at: editor.selection?.anchor,
            match: (node) => isElementOfType(node, type),
          });

          if (entry) {
            const cellEntries = getTableGridAbove(editor, {
              format: 'cell',
            });

            if (cellEntries.length > 1) {
              tx.selection.collapse({
                edge: 'focus',
              });
            }
          }
        }

        return next({ options, text });
      },
      move({ next, options, tx }) {
        const unit = options?.unit;
        const reverse = options?.reverse;
        const { selection } = editor;
        const getNextPoint = reverse ? editor.api.after : editor.api.before;

        if (selection && editor.api.isCollapsed()) {
          const cellEntry = editor.api.block({
            match: (node) => isElementOfTypes(node, getCellTypes(editor)),
          });

          if (cellEntry) {
            const [, cellPath] = cellEntry;
            const start = reverse
              ? editor.api.end(cellPath)
              : editor.api.start(cellPath);

            if (
              start &&
              RangeApi.equals(editor.selection!, {
                anchor: start,
                focus: start,
              })
            ) {
              return true;
            }
          } else {
            const nextPoint = getNextPoint(selection, { unit });
            const nextCellEntry = editor.api.block({
              at: nextPoint,
              match: (node) => isElementOfTypes(node, getCellTypes(editor)),
            });

            if (nextCellEntry) {
              tx.selection.move({ reverse: !reverse });

              return true;
            }
          }
        }

        return next({ options });
      },
      removeMark({ key, next, tx }) {
        if (
          !editor.selection ||
          editor.api.isCollapsed() ||
          editor.meta.isNormalizing
        ) {
          return next();
        }

        const matchesCell = getTableGridAbove(editor, { format: 'cell' });

        if (matchesCell.length <= 1) return next();

        matchesCell.forEach(([_cell, cellPath]) => {
          tx.nodes.set(
            { [key]: null },
            toInternalSetNodesOptions({
              at: cellPath,
              split: true,
              voids: true,
              match: (node) => TextApi.isText(node),
            })
          );
        });

        return true;
      },
      setNodes({ next, options, props, tx }) {
        const setOptions = options as TableInternalSetNodesOptions | undefined;

        if (setOptions?.[TABLE_INTERNAL_SET_NODES]) {
          return next({
            options: toExternalSetNodesOptions(setOptions),
            props,
          });
        }

        if (
          !editor.selection ||
          editor.api.isCollapsed() ||
          editor.meta.isNormalizing
        ) {
          return next();
        }

        const matchesCell = getTableGridAbove(editor, { format: 'cell' });
        if (matchesCell.length <= 1) return next();

        if (options?.at) {
          const cellPaths = matchesCell.map(([, cellPath]) => cellPath);

          if (!isTargetingSelectedCell(editor, options.at, cellPaths)) {
            return next();
          }
        }

        tx.nodes.set(
          props,
          toInternalSetNodesOptions({
            ...options,
            match: combinePlateTransformMatchOptions(
              editor,
              (_node, path) =>
                matchesCell.some(([_cell, cellPath]) =>
                  PathApi.isCommon(cellPath, path)
                ),
              options
            ),
          })
        );

        return true;
      },
    },
  });

export const moveLineTable = moveTableSelectionLine;
