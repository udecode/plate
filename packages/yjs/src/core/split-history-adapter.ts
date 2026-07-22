import {
  type Descendant,
  type DocumentChange,
  type Element,
  NodeApi,
  type Path,
  type Text,
} from '@platejs/plite';
import * as Y from 'yjs';
import { getInternalDocumentChangeSet } from '@platejs/plite/internal';

import {
  getPliteYjsElementType,
  type YjsAttributeRecord,
  type YjsNode,
} from './attributes';
import {
  createYjsNode,
  createYjsPropertyContext,
  createYjsVisibleChildrenReader,
  getYjsLength,
  getYjsNode,
  getYjsNodeIf,
  getYjsParent,
  getYjsTextContentFrom,
  getYjsVisibleChildren,
  getYjsVisiblePath,
  insertYjsChild,
  removeYjsChild,
  resolveYjsTextPoint,
  SPLIT_UNDO_TEXT_ATTRIBUTE,
  splitVisibleYjsChildren,
  type YjsPropertyContext,
  type YjsPropertyLocation,
  type YjsSetPropertyResolver,
  yjsTextContentEndsWith,
} from './document';
import { areJsonLikeValuesEqual } from './json-equality';
import { lastPathIndex, nextPath, parentPath } from './path';
import {
  appendElementText,
  clearSplitUndoTextAttribute,
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

type YjsSplitHistoryAdapterOptions = {
  readonly doc: Y.Doc;
  readonly editorRoot: string;
  readonly historyOrigin: object;
  readonly isSetValued: YjsSetPropertyResolver;
  readonly isConnected: () => boolean;
  readonly root: Y.XmlElement;
  readonly schemaRoot: string | null;
  readonly undoManagerAdapter: YjsUndoManagerAdapter;
};

export type YjsSplitHistoryAdapter = {
  readonly createFromChange: (input: {
    readonly after: readonly Descendant[];
    readonly before: readonly Descendant[];
    readonly change: DocumentChange;
    readonly paths: readonly Path[];
    readonly structureChanged: boolean;
  }) => SplitHistory | null;
  readonly redo: () => boolean;
  readonly repairAfterOfflineUndo: () => boolean;
  readonly store: (splitHistory: SplitHistory | null) => void;
  readonly undo: () => boolean;
};

const completeSplitHistory = (
  pendingTextSplitHistory: PendingTextSplitHistory,
  elementPosition: number,
  elementProperties: YjsAttributeRecord
): SplitHistory => ({
  elementPath: pendingTextSplitHistory.elementPath,
  elementPosition,
  elementProperties,
  rightText: pendingTextSplitHistory.rightText,
  textPath: pendingTextSplitHistory.textPath,
  textProperties: pendingTextSplitHistory.textProperties,
});

type PliteElement = Element;
type PliteText = Text;

const isPliteElement = (node: Descendant | null) =>
  node !== null && NodeApi.isElement(node);

const isPliteText = (node: Descendant | null) =>
  node !== null && NodeApi.isText(node);

const readNode = (
  children: readonly Descendant[],
  path: readonly number[]
): Descendant | null => {
  let descendants = children;
  let node: Descendant | undefined;

  for (const index of path) {
    node = descendants[index];

    if (node === undefined) return null;

    descendants = isPliteElement(node) ? node.children : [];
  }

  return node ?? null;
};

const nodeProperties = (node: PliteElement | PliteText): YjsAttributeRecord => {
  const properties: YjsAttributeRecord = {};
  const record = node as Readonly<Record<string, unknown>>;

  for (const key in node) {
    if (Object.hasOwn(node, key) && key !== 'children' && key !== 'text') {
      properties[key] = record[key];
    }
  }

  return properties;
};

const sameNodes = (
  left: readonly Descendant[],
  right: readonly Descendant[]
): boolean => areJsonLikeValuesEqual(left, right);

const pathKey = (path: readonly number[]): string => path.join('.');

export const getSplitHistoryCandidatePaths = (
  paths: readonly (readonly number[])[]
): readonly Path[] => {
  const candidates = new Map<string, Path>();
  const add = (path: readonly number[]) => {
    if (path.length === 0) return;

    const copy = [...path];

    candidates.set(pathKey(copy), copy);
  };

  for (const changedPath of paths) {
    let depth = changedPath.length;

    while (depth > 0) {
      const path = changedPath.slice(0, depth);
      const index = path.at(-1);

      add(path);
      if (index !== undefined && index > 0) {
        add([...path.slice(0, -1), index - 1]);
      }
      if (index !== undefined) {
        add([...path.slice(0, -1), index + 1]);
      }
      depth--;
    }
  }

  return [...candidates.values()];
};

const createPendingTextSplit = (
  before: readonly Descendant[],
  after: readonly Descendant[],
  textPath: Path
): PendingTextSplitHistory | null => {
  const beforeText = readNode(before, textPath);
  const leftText = readNode(after, textPath);
  const rightText = readNode(after, nextPath(textPath));
  const elementPath = parentPath(textPath);
  const beforeElement = readNode(before, elementPath);
  const afterElement = readNode(after, elementPath);
  const textIndex = lastPathIndex(textPath);

  if (
    textIndex === undefined ||
    !isPliteText(beforeText) ||
    !isPliteText(leftText) ||
    !isPliteText(rightText) ||
    !isPliteElement(beforeElement) ||
    !isPliteElement(afterElement) ||
    beforeText.text !== leftText.text + rightText.text ||
    !areJsonLikeValuesEqual(
      nodeProperties(beforeText),
      nodeProperties(leftText)
    ) ||
    afterElement.children.length !== beforeElement.children.length + 1 ||
    !sameNodes(
      beforeElement.children.slice(0, textIndex),
      afterElement.children.slice(0, textIndex)
    ) ||
    !sameNodes(
      beforeElement.children.slice(textIndex + 1),
      afterElement.children.slice(textIndex + 2)
    )
  ) {
    return null;
  }

  return {
    elementPath,
    rightText: rightText.text,
    textPath,
    textProperties: nodeProperties(rightText),
  };
};

const completePendingElementSplit = (
  pending: PendingTextSplitHistory,
  before: readonly Descendant[],
  after: readonly Descendant[]
): SplitHistory | null => {
  const beforeElement = readNode(before, pending.elementPath);
  const leftElement = readNode(after, pending.elementPath);
  const rightElement = readNode(after, nextPath(pending.elementPath));

  if (
    !isPliteElement(beforeElement) ||
    !isPliteElement(leftElement) ||
    !isPliteElement(rightElement) ||
    !areJsonLikeValuesEqual(
      nodeProperties(beforeElement),
      nodeProperties(leftElement)
    ) ||
    !sameNodes(beforeElement.children, [
      ...leftElement.children,
      ...rightElement.children,
    ])
  ) {
    return null;
  }

  return completeSplitHistory(
    pending,
    leftElement.children.length,
    nodeProperties(rightElement)
  );
};

const findSplitHistory = (
  before: readonly Descendant[],
  after: readonly Descendant[],
  candidates: readonly Path[]
): SplitHistory | null => {
  for (const path of candidates) {
    const node = readNode(before, path);

    if (!isPliteText(node)) continue;

    const elementPath = parentPath(path);
    const beforeElement = readNode(before, elementPath);
    const leftElement = readNode(after, elementPath);
    const rightElement = readNode(after, nextPath(elementPath));
    const textIndex = lastPathIndex(path);

    if (
      textIndex === undefined ||
      !isPliteElement(beforeElement) ||
      !isPliteElement(leftElement) ||
      !isPliteElement(rightElement)
    ) {
      continue;
    }

    const leftText = leftElement.children[textIndex] ?? null;
    const rightText = rightElement.children[0] ?? null;

    if (
      isPliteText(leftText) &&
      isPliteText(rightText) &&
      node.text === leftText.text + rightText.text &&
      areJsonLikeValuesEqual(nodeProperties(node), nodeProperties(leftText)) &&
      areJsonLikeValuesEqual(
        nodeProperties(beforeElement),
        nodeProperties(leftElement)
      ) &&
      leftElement.children.length === textIndex + 1 &&
      sameNodes(
        beforeElement.children.slice(0, textIndex),
        leftElement.children.slice(0, textIndex)
      ) &&
      sameNodes(
        beforeElement.children.slice(textIndex + 1),
        rightElement.children.slice(1)
      )
    ) {
      return {
        elementPath,
        elementPosition: textIndex + 1,
        elementProperties: nodeProperties(rightElement),
        rightText: rightText.text,
        textPath: path,
        textProperties: nodeProperties(rightText),
      };
    }
  }

  return null;
};

const copyYjsNodes = (nodes: readonly YjsNode[]): YjsNode[] => {
  const copy = new Array<YjsNode>(nodes.length);

  let index = 0;

  while (index < nodes.length) {
    const node = nodes[index];

    if (node === undefined) {
      throw new Error('Cannot split a sparse Yjs child array.');
    }

    copy[index] = node;
    index++;
  }

  return copy;
};

const createSplitYjsElement = (
  original: Y.XmlElement,
  properties: YjsAttributeRecord,
  children: readonly YjsNode[],
  isSetValued: YjsSetPropertyResolver,
  context: YjsPropertyContext
): Y.XmlElement => {
  const elementType =
    typeof properties.type === 'string'
      ? properties.type
      : getPliteYjsElementType(original);
  const element = createYjsNode(
    { ...properties, children: [], type: elementType } as Descendant,
    isSetValued,
    context
  );

  if (!(element instanceof Y.XmlElement)) {
    throw new Error('Cannot split a Yjs element into text.');
  }

  if (children.length > 0) {
    element.insert(0, copyYjsNodes(children));
  }

  return element;
};

const createYjsPropertyLocationFromPath = (
  root: Y.XmlElement,
  parent: Path,
  schemaRoot: string | null
): YjsPropertyLocation => {
  const ancestors: string[] = [];
  const current: number[] = [];

  for (const index of parent) {
    current.push(index);

    const node = getYjsNode(root, current);

    if (!(node instanceof Y.XmlElement)) {
      throw new Error(
        `Cannot resolve Yjs property parent context at ${parent.join('.')}.`
      );
    }

    ancestors.unshift(getPliteYjsElementType(node));
  }

  return { ancestors, path: parent, root: schemaRoot };
};

const splitYjsText = (
  root: Y.XmlElement,
  path: Path,
  position: number,
  properties: YjsAttributeRecord,
  isSetValued: YjsSetPropertyResolver,
  schemaRoot: string | null
): number => {
  const readVisibleChildren = createYjsVisibleChildrenReader(root);
  const point = resolveYjsTextPoint(root, path, position, readVisibleChildren);

  if (point === null) {
    throw new Error('Cannot redo split because the text boundary is gone.');
  }

  const children = readVisibleChildren(point.parent);
  const nextChild = children[point.childIndex + 1];
  const textLength = getYjsLength(point.text);

  if (point.offset === textLength && nextChild instanceof Y.XmlText) {
    return point.childIndex + 1;
  }

  const rightText = getYjsTextContentFrom(point.text, point.offset);

  if (rightText.length > 0) {
    point.text.delete(point.offset, rightText.length);
  }

  const rightNode = { ...properties, text: rightText } as Descendant;
  const right = createYjsNode(
    rightNode,
    isSetValued,
    createYjsPropertyContext(rightNode, {
      ...createYjsPropertyLocationFromPath(root, path.slice(0, -1), schemaRoot),
      path: nextPath(path),
    })
  );

  if (!(right instanceof Y.XmlText)) {
    throw new Error('Cannot split Yjs text into an element.');
  }

  insertYjsChild(root, point.parent, point.childIndex + 1, right);

  return point.childIndex + 1;
};

const splitYjsElement = (
  root: Y.XmlElement,
  path: Path,
  position: number,
  properties: YjsAttributeRecord,
  isSetValued: YjsSetPropertyResolver,
  schemaRoot: string | null
): void => {
  const target = getYjsNode(root, path);

  if (!(target instanceof Y.XmlElement)) {
    throw new Error('Cannot redo split because the element boundary is gone.');
  }

  const { index, parent } = getYjsParent(root, path);
  const rightChildren = splitVisibleYjsChildren(root, target, position);

  const rightNode = {
    ...properties,
    children: [],
    type:
      typeof properties.type === 'string'
        ? properties.type
        : getPliteYjsElementType(target),
  } as Descendant;

  insertYjsChild(
    root,
    parent,
    index + 1,
    createSplitYjsElement(
      target,
      properties,
      rightChildren,
      isSetValued,
      createYjsPropertyContext(rightNode, {
        ...createYjsPropertyLocationFromPath(
          root,
          path.slice(0, -1),
          schemaRoot
        ),
        path: nextPath(path),
      })
    )
  );
};

export const applySplitHistoryToYjs = (
  root: Y.XmlElement,
  splitHistory: SplitHistory,
  isSetValued: YjsSetPropertyResolver = () => false,
  schemaRoot: string | null = null
): Y.XmlElement => {
  const text = getYjsNode(root, splitHistory.textPath);

  if (!(text instanceof Y.XmlText)) {
    throw new Error('Cannot apply split because the text boundary is gone.');
  }

  const textPosition = getYjsLength(text) - splitHistory.rightText.length;

  const physicalElementPosition = splitYjsText(
    root,
    splitHistory.textPath,
    textPosition,
    splitHistory.textProperties,
    isSetValued,
    schemaRoot
  );
  splitYjsElement(
    root,
    splitHistory.elementPath,
    physicalElementPosition,
    splitHistory.elementProperties,
    isSetValued,
    schemaRoot
  );

  const right = getYjsNode(root, nextPath(splitHistory.elementPath));

  if (!(right instanceof Y.XmlElement)) {
    throw new Error('Cannot apply split because the right element is gone.');
  }

  return right;
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
  editorRoot,
  historyOrigin,
  isSetValued,
  isConnected,
  root,
  schemaRoot,
  undoManagerAdapter,
}: YjsSplitHistoryAdapterOptions): YjsSplitHistoryAdapter => {
  let pendingTextSplitHistory: PendingTextSplitHistory | null = null;

  const createFromChange = ({
    after,
    before,
    change,
    paths,
    structureChanged,
  }: {
    readonly after: readonly Descendant[];
    readonly before: readonly Descendant[];
    readonly change: DocumentChange;
    readonly paths: readonly Path[];
    readonly structureChanged: boolean;
  }): SplitHistory | null => {
    if (!getInternalDocumentChangeSet(change, editorRoot)) {
      return null;
    }
    if (!structureChanged) {
      pendingTextSplitHistory = null;

      return null;
    }

    const candidates = getSplitHistoryCandidatePaths(paths);
    const complete = findSplitHistory(before, after, candidates);

    if (complete !== null) {
      pendingTextSplitHistory = null;

      return complete;
    }

    const pending = pendingTextSplitHistory;

    pendingTextSplitHistory = null;

    if (pending !== null) {
      const completed = completePendingElementSplit(pending, before, after);

      if (completed !== null) return completed;
    }

    for (const path of candidates) {
      if (!isPliteText(readNode(before, path))) continue;

      const candidate = createPendingTextSplit(before, after, path);

      if (candidate !== null) {
        pendingTextSplitHistory = candidate;
        break;
      }
    }

    return null;
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

      if (
        !(text instanceof Y.XmlText) ||
        !yjsTextContentEndsWith(text, redo.splitHistory.rightText)
      ) {
        throw new Error(
          'Cannot redo split because the right text is no longer at the split boundary.'
        );
      }

      applySplitHistoryToYjs(root, redo.splitHistory, isSetValued, schemaRoot);
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

  const repairImportedSplitUndoText = (): boolean => {
    const texts: Y.XmlText[] = [];
    const visited = new Set<YjsNode>();
    const visit = (node: YjsNode): void => {
      if (visited.has(node)) return;
      visited.add(node);

      if (node instanceof Y.XmlText) {
        if (getTrailingSplitUndoText(node) !== null) texts.push(node);

        return;
      }

      for (const child of getYjsVisibleChildren(root, node)) visit(child);
    };

    for (const child of getYjsVisibleChildren(root, root)) visit(child);
    if (texts.length === 0) return false;

    let repaired = false;

    doc.transact(() => {
      for (const text of texts) {
        const trailing = getTrailingSplitUndoText(text);
        const textPath = getYjsVisiblePath(root, text);

        if (trailing === null || textPath === null) continue;

        const rightElement = getYjsNodeIf(root, nextPath(parentPath(textPath)));

        if (
          rightElement !== null &&
          visibleTextStartsWith(root, rightElement, trailing.value)
        ) {
          text.delete(trailing.offset, trailing.length);
        } else {
          clearSplitUndoTextAttribute(text, trailing.offset, trailing.length);
        }
        repaired = true;
      }
    }, historyOrigin);

    return repaired;
  };

  const repairAfterOfflineUndo = (): boolean => {
    const redo = peekSplit(undoManagerAdapter.peekRedo());
    const splitHistory = redo?.splitHistory;
    const activeRepair = splitHistory?.undoneWhileDisconnected
      ? getSplitUndoTextRepair(splitHistory)
      : null;
    let repaired =
      activeRepair === null ? repairImportedSplitUndoText() : false;

    if (activeRepair !== null) {
      doc.transact(() => {
        if (activeRepair.hasRemoteSplitBoundary) {
          activeRepair.text.delete(activeRepair.offset, activeRepair.length);
        } else {
          clearSplitUndoTextAttribute(
            activeRepair.text,
            activeRepair.offset,
            activeRepair.length
          );
        }
      }, historyOrigin);
      repaired = true;
    }

    if (!splitHistory?.undoneWhileDisconnected) {
      return repaired;
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

    return repaired;
  };

  return {
    createFromChange,
    redo,
    repairAfterOfflineUndo,
    store,
    undo,
  };
};
