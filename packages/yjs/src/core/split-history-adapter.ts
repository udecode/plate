import type { Operation } from '@platejs/slate';
import * as Y from 'yjs';

import { toYjsAttributeRecord } from './attributes';
import {
  createYjsVisibleChildrenReader,
  getYjsLength,
  getYjsNode,
  getYjsNodeIf,
  getYjsParent,
  getYjsTextContentFrom,
  removeYjsChild,
  resolveYjsTextPoint,
  SPLIT_UNDO_TEXT_ATTRIBUTE,
  yjsTextContentEndsWith,
} from './document';
import { applySlateOperationToYjs } from './operations';
import { nextPath, parentPath, pathsEqual } from './path';
import {
  appendElementText,
  clearSplitUndoTextAttribute,
  findSplitUndoTextRepairs,
  getTrailingSplitUndoText,
  isSplitHistory,
  type PendingTextSplitHistory,
  SPLIT_HISTORY_META,
  type SplitHistory,
  type SplitUndoTextRepair,
  visibleTextStartsWith,
} from './split-history';
import type {
  YjsUndoManagerAdapter,
  YjsUndoManagerStackItem,
} from './undo-manager-adapter';

type SplitNodeOperation = Extract<Operation, { type: 'split_node' }>;

type YjsSplitHistoryAdapterOptions = {
  readonly doc: Y.Doc;
  readonly historyOrigin: object;
  readonly isConnected: () => boolean;
  readonly root: Y.XmlElement;
  readonly undoManagerAdapter: YjsUndoManagerAdapter;
};

export type YjsSplitHistoryAdapter = {
  readonly createFromOperations: (
    operations: readonly Operation[]
  ) => SplitHistory | null;
  readonly redo: () => boolean;
  readonly repairAfterOfflineUndo: () => void;
  readonly store: (splitHistory: SplitHistory | null) => void;
  readonly undo: () => boolean;
};

const createSplitNodeOperation = (
  path: SplitNodeOperation['path'],
  position: SplitNodeOperation['position'],
  properties: SplitNodeOperation['properties']
): SplitNodeOperation => ({
  path,
  position,
  properties,
  type: 'split_node',
});

const completeSplitHistory = (
  pendingTextSplitHistory: PendingTextSplitHistory,
  elementSplit: SplitNodeOperation
): SplitHistory => ({
  elementPath: pendingTextSplitHistory.elementPath,
  elementPosition: elementSplit.position,
  elementProperties: toYjsAttributeRecord(elementSplit.properties),
  rightText: pendingTextSplitHistory.rightText,
  textPath: pendingTextSplitHistory.textPath,
  textProperties: pendingTextSplitHistory.textProperties,
});

const readSplitRightText = (
  root: Y.XmlElement,
  path: SplitNodeOperation['path'],
  position: SplitNodeOperation['position']
): string => {
  const point = resolveYjsTextPoint(
    root,
    path,
    position,
    createYjsVisibleChildrenReader(root)
  );

  return point === null ? '' : getYjsTextContentFrom(point.text, point.offset);
};

const peekSplit = (
  item: YjsUndoManagerStackItem | null
): {
  item: YjsUndoManagerStackItem;
  splitHistory: SplitHistory;
} | null => {
  const splitHistory = item?.meta.get(SPLIT_HISTORY_META);

  if (item === null || !isSplitHistory(splitHistory)) {
    return null;
  }

  return { item, splitHistory };
};

export const createYjsSplitHistoryAdapter = ({
  doc,
  historyOrigin,
  isConnected,
  root,
  undoManagerAdapter,
}: YjsSplitHistoryAdapterOptions): YjsSplitHistoryAdapter => {
  let pendingTextSplitHistory: PendingTextSplitHistory | null = null;

  const createFromOperations = (
    operations: readonly Operation[]
  ): SplitHistory | null => {
    let textSplit: SplitNodeOperation | undefined;
    let elementSplit: SplitNodeOperation | undefined;
    let operationIndex = 0;

    while (operationIndex < operations.length) {
      const operation = operations[operationIndex];

      if (operation === undefined) {
        throw new Error(
          'Cannot create split history from a sparse operation array.'
        );
      }

      if (operation.type !== 'split_node') {
        operationIndex++;
        continue;
      }

      const isTextSplit =
        getYjsNodeIf(root, operation.path) instanceof Y.XmlText;

      if (isTextSplit) {
        textSplit ??= operation;
      } else {
        elementSplit ??= operation;
      }

      if (textSplit !== undefined && elementSplit !== undefined) {
        break;
      }
      operationIndex++;
    }

    if (textSplit === undefined) {
      const pending = pendingTextSplitHistory;

      pendingTextSplitHistory = null;

      if (
        elementSplit !== undefined &&
        pending !== null &&
        pathsEqual(elementSplit.path, pending.elementPath)
      ) {
        return completeSplitHistory(pending, elementSplit);
      }

      return null;
    }

    const elementPath = parentPath(textSplit.path);
    const text = getYjsNode(root, textSplit.path);

    if (!(text instanceof Y.XmlText)) {
      return null;
    }

    const pending: PendingTextSplitHistory = {
      elementPath,
      rightText: readSplitRightText(root, textSplit.path, textSplit.position),
      textPath: textSplit.path,
      textProperties: toYjsAttributeRecord(textSplit.properties),
    };

    if (
      elementSplit === undefined ||
      !pathsEqual(elementSplit.path, elementPath)
    ) {
      pendingTextSplitHistory = pending;

      return null;
    }

    pendingTextSplitHistory = null;

    return completeSplitHistory(pending, elementSplit);
  };

  const store = (splitHistory: SplitHistory | null): void => {
    if (splitHistory === null) {
      return;
    }

    undoManagerAdapter.storeUndoMeta(SPLIT_HISTORY_META, splitHistory);
  };

  const redo = (): boolean => {
    const redo = peekSplit(undoManagerAdapter.peekRedo());

    // Later redo items may still target the original right-side Yjs node.
    // Let Yjs replay those split items natively so their identities survive.
    if (redo === null || undoManagerAdapter.redoDepth() > 1) {
      return false;
    }

    if (redo.splitHistory.absorbedRemoteSplit) {
      undoManagerAdapter.moveRedoToUndo(redo.item);

      return true;
    }

    doc.transact(() => {
      const text = getYjsNode(root, redo.splitHistory.textPath);

      if (!(text instanceof Y.XmlText)) {
        throw new Error(
          'Cannot redo split_node because the text node is gone.'
        );
      }

      if (!yjsTextContentEndsWith(text, redo.splitHistory.rightText)) {
        throw new Error(
          'Cannot redo split_node because the right text is no longer at the split boundary.'
        );
      }

      const textPosition =
        getYjsLength(text) - redo.splitHistory.rightText.length;
      const textSplit = createSplitNodeOperation(
        redo.splitHistory.textPath,
        textPosition,
        redo.splitHistory.textProperties
      );
      const elementSplit = createSplitNodeOperation(
        redo.splitHistory.elementPath,
        redo.splitHistory.elementPosition,
        redo.splitHistory.elementProperties
      );

      applySlateOperationToYjs(root, textSplit);
      applySlateOperationToYjs(root, elementSplit);
    }, historyOrigin);

    undoManagerAdapter.moveRedoToUndo(redo.item);

    return true;
  };

  const undo = (): boolean => {
    const undo = peekSplit(undoManagerAdapter.peekUndo());

    // If another local edit was undone first, it can depend on the split-created
    // right-side node. Native Yjs undo keeps that node redoable.
    if (undo === null || undoManagerAdapter.redoDepth() > 0) {
      return false;
    }

    if (undo.splitHistory.absorbedRemoteSplit) {
      undoManagerAdapter.moveUndoToRedo(undo.item);

      return true;
    }

    const undoneWhileDisconnected = !isConnected();
    let rightText = undo.splitHistory.rightText;

    doc.transact(() => {
      const leftText = getYjsNode(root, undo.splitHistory.textPath);
      const rightElementPath = nextPath(undo.splitHistory.elementPath);
      const rightElement = getYjsNode(root, rightElementPath);
      const { index, parent } = getYjsParent(root, rightElementPath);

      if (!(leftText instanceof Y.XmlText)) {
        throw new Error(
          'Cannot undo split_node because the left text is gone.'
        );
      }
      if (!(rightElement instanceof Y.XmlElement)) {
        throw new Error(
          'Cannot undo split_node because the right element is gone.'
        );
      }

      rightText = appendElementText(root, leftText, rightElement, {
        [SPLIT_UNDO_TEXT_ATTRIBUTE]: undoneWhileDisconnected,
      });
      removeYjsChild(root, parent, index);
    }, historyOrigin);

    undo.splitHistory.rightText = rightText;
    undo.splitHistory.undoneWhileDisconnected = undoneWhileDisconnected;
    undoManagerAdapter.moveUndoToRedo(undo.item);

    return true;
  };

  const hasRemoteSplitBoundary = (splitHistory: SplitHistory): boolean => {
    const rightElement = getYjsNodeIf(root, nextPath(splitHistory.elementPath));

    if (rightElement === null) {
      return false;
    }

    return visibleTextStartsWith(root, rightElement, splitHistory.rightText);
  };

  const getSplitUndoTextRepair = (
    splitHistory: SplitHistory
  ): SplitUndoTextRepair | null => {
    if (splitHistory.rightText.length === 0) {
      return null;
    }

    const leftText = getYjsNodeIf(root, splitHistory.textPath);

    if (!(leftText instanceof Y.XmlText)) {
      return null;
    }

    const trailing = getTrailingSplitUndoText(leftText);

    if (trailing === null || trailing.value !== splitHistory.rightText) {
      return null;
    }

    return {
      length: trailing.length,
      offset: trailing.offset,
      hasRemoteSplitBoundary: hasRemoteSplitBoundary(splitHistory),
      text: leftText,
    };
  };

  const leftTextEndsWithSplitRightText = (
    splitHistory: SplitHistory
  ): boolean => {
    const leftText = getYjsNodeIf(root, splitHistory.textPath);

    return (
      leftText instanceof Y.XmlText &&
      yjsTextContentEndsWith(leftText, splitHistory.rightText)
    );
  };

  const repairAfterOfflineUndo = (): void => {
    const repairs = findSplitUndoTextRepairs(root);
    const redo = peekSplit(undoManagerAdapter.peekRedo());
    const splitHistory = redo?.splitHistory;
    const activeRepair = splitHistory?.undoneWhileDisconnected
      ? getSplitUndoTextRepair(splitHistory)
      : null;

    if (repairs.length > 0) {
      doc.transact(() => {
        let repairIndex = 0;

        while (repairIndex < repairs.length) {
          const repair = repairs[repairIndex];

          if (repair === undefined) {
            throw new Error(
              'Cannot apply split repair from a sparse repair array.'
            );
          }

          if (repair.hasRemoteSplitBoundary) {
            repair.text.delete(repair.offset, repair.length);
          } else {
            clearSplitUndoTextAttribute(
              repair.text,
              repair.offset,
              repair.length
            );
          }
          repairIndex++;
        }
      }, historyOrigin);
    }

    if (!splitHistory?.undoneWhileDisconnected) {
      return;
    }

    if (
      activeRepair?.hasRemoteSplitBoundary ||
      (activeRepair === null &&
        hasRemoteSplitBoundary(splitHistory) &&
        !leftTextEndsWithSplitRightText(splitHistory))
    ) {
      splitHistory.absorbedRemoteSplit = true;
    } else {
      splitHistory.undoneWhileDisconnected = false;
    }
  };

  return {
    createFromOperations,
    redo,
    repairAfterOfflineUndo,
    store,
    undo,
  };
};
