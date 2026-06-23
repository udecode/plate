import { executeCommand } from '../core/command-registry';
import { getOperationCount, runEditorTransaction } from '../core/public-state';
import { getEditorTransformRegistry } from '../core/transform-registry';
import { nodes as getNodes } from '../editor/nodes';
import { LocationApi } from '../interfaces';
import type { Value } from '../interfaces/editor';
import { Editor } from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import { type Ancestor, type Descendant, NodeApi } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import { type Range, RangeApi } from '../interfaces/range';
import type { TextMutationMethods } from '../interfaces/transforms/text';
import { getDefaultInsertLocation } from '../utils';
import { isFullDocumentRange } from './full-document-range';
import { getFragmentInsertionParts } from './insert-fragment-fallback';
import {
  cloneDescendant,
  hasSameElementType,
  isBlockElement,
  isStructuralBlockElement,
  isTextBlockElement,
  pushBlockChild,
} from './insert-fragment-nodes';
import {
  createTextBlock,
  getDescendantEndPoint,
  getFragmentEndSelection,
  getOffsetFragmentEndSelection,
  getPointAfterInlineVoid,
  getTextChildrenEndPoint,
} from './insert-fragment-selection';
import {
  getEmptyTopLevelTextBlockFragmentReplacement,
  getSingleEmptyBlockFragmentReplacement,
  getSingleTextBlockFragmentReplacement,
  getTopLevelBlockFragmentReplacement,
  getTopLevelTextBlockFragmentReplacement,
} from './insert-fragment-text-blocks';

type InsertFragmentCommand = {
  fragment: Parameters<TextMutationMethods['insertFragment']>[1];
  options: Parameters<TextMutationMethods['insertFragment']>[2];
  type: 'insert_fragment';
};

const getTopLevelStructuralBlockFragmentReplacement = (
  editor: Editor,
  at: Range,
  fragment: Descendant[]
) => {
  if (
    fragment.length === 0 ||
    !fragment.every((node) => isBlockElement(editor, node)) ||
    fragment.every((node) => isTextBlockElement(editor, node))
  ) {
    return null;
  }

  const [start, end] = RangeApi.edges(at);

  if (
    start.path.length === 0 ||
    end.path.length === 0 ||
    start.path.length !== end.path.length ||
    !start.path.every((segment, index) => segment === end.path[index])
  ) {
    return null;
  }

  if (
    Editor.void(editor, { at: start }) ||
    Editor.elementReadOnly(editor, { at: start })
  ) {
    return null;
  }

  const blockMatch = Editor.above(editor, {
    at: start,
    match: (node) => NodeApi.isElement(node) && Editor.isBlock(editor, node),
  });

  if (!blockMatch) {
    return null;
  }

  const [block, blockPath] = blockMatch;

  if (
    blockPath.length !== 1 ||
    !NodeApi.isElement(block) ||
    !isTextBlockElement(editor, block)
  ) {
    return null;
  }

  const textIndex = start.path[blockPath.length];

  if (
    textIndex == null ||
    textIndex !== end.path[blockPath.length] ||
    start.path.length !== blockPath.length + 1
  ) {
    return null;
  }

  const targetText = block.children[textIndex];

  if (!NodeApi.isText(targetText)) {
    return null;
  }

  const before = targetText.text.slice(0, start.offset);
  const after = targetText.text.slice(end.offset);
  const blockIndex = blockPath[0];
  const children: Descendant[] = [];
  const beforeChildren: Descendant[] = [];
  const afterChildren: Descendant[] = [];

  for (const child of block.children.slice(0, textIndex)) {
    pushBlockChild(editor, beforeChildren, child);
  }

  if (before) {
    pushBlockChild(editor, beforeChildren, { ...targetText, text: before });
  }

  if (beforeChildren.length > 0) {
    children.push(createTextBlock(block, beforeChildren));
  }

  const fragmentStartIndex = blockIndex + children.length;

  for (const child of fragment) {
    children.push(cloneDescendant(child));
  }

  if (after) {
    pushBlockChild(editor, afterChildren, { ...targetText, text: after });
  }

  for (const child of block.children.slice(textIndex + 1)) {
    pushBlockChild(editor, afterChildren, child);
  }

  if (afterChildren.length > 0) {
    children.push(createTextBlock(block, afterChildren));
  }

  return {
    children,
    index: blockIndex,
    previousChildren: [block],
    selection: getOffsetFragmentEndSelection(fragment, fragmentStartIndex),
  };
};

const isCompatibleStructuralContainer = (
  editor: Editor,
  target: Element,
  fragmentNode: Element
) =>
  isStructuralBlockElement(editor, target) &&
  isStructuralBlockElement(editor, fragmentNode) &&
  hasSameElementType(target, fragmentNode);

const unwrapLeadingStructuralFragmentChildren = (
  editor: Editor,
  children: Descendant[]
): Descendant[] => {
  const [firstChild, ...restChildren] = children;

  if (
    NodeApi.isElement(firstChild) &&
    isStructuralBlockElement(editor, firstChild)
  ) {
    return [
      ...unwrapLeadingStructuralFragmentChildren(
        editor,
        firstChild.children as Descendant[]
      ),
      ...restChildren.map(cloneDescendant),
    ];
  }

  return children.map(cloneDescendant);
};

const getNestedStructuralFragmentChildren = (
  editor: Editor,
  block: Element,
  fragment: Descendant[]
) => {
  const [onlyFragmentNode] = fragment;

  if (
    fragment.length !== 1 ||
    !NodeApi.isElement(onlyFragmentNode) ||
    !isStructuralBlockElement(editor, onlyFragmentNode)
  ) {
    return null;
  }

  const children = unwrapLeadingStructuralFragmentChildren(
    editor,
    onlyFragmentNode.children as Descendant[]
  );
  const elementChildren = children.every(NodeApi.isElement) ? children : null;

  if (!elementChildren) {
    return null;
  }

  const [firstChild] = elementChildren;

  if (!isTextBlockElement(editor, firstChild)) {
    return null;
  }

  if (!hasSameElementType(block, firstChild)) {
    return null;
  }

  return elementChildren;
};

const getNestedTextBlockFragmentReplacement = (
  editor: Editor,
  at: Range,
  fragment: Descendant[]
) => {
  if (
    fragment.length === 0 ||
    !fragment.every((node) => isBlockElement(editor, node))
  ) {
    return null;
  }

  const [start, end] = RangeApi.edges(at);

  if (
    start.path.length === 0 ||
    end.path.length === 0 ||
    start.path.length !== end.path.length ||
    !start.path.every((segment, index) => segment === end.path[index])
  ) {
    return null;
  }

  if (
    Editor.void(editor, { at: start }) ||
    Editor.elementReadOnly(editor, { at: start })
  ) {
    return null;
  }

  const blockMatch = Editor.above(editor, {
    at: start,
    match: (node) => NodeApi.isElement(node) && Editor.isBlock(editor, node),
  });

  if (!blockMatch) {
    return null;
  }

  const [block, blockPath] = blockMatch;

  if (
    blockPath.length < 2 ||
    !NodeApi.isElement(block) ||
    !isTextBlockElement(editor, block)
  ) {
    return null;
  }

  const parentPath = PathApi.parent(blockPath);
  const parent = NodeApi.get(editor, parentPath);

  if (!NodeApi.isElement(parent) || !isStructuralBlockElement(editor, parent)) {
    return null;
  }

  const textIndex = start.path[blockPath.length];

  if (
    textIndex == null ||
    textIndex !== end.path[blockPath.length] ||
    start.path.length !== blockPath.length + 1
  ) {
    return null;
  }

  const targetText = block.children[textIndex];

  if (!NodeApi.isText(targetText)) {
    return null;
  }

  const parentIndex = parentPath.at(-1);
  const blockIndex = blockPath.at(-1);

  if (parentIndex == null || blockIndex == null) {
    return null;
  }

  const beforeText = targetText.text.slice(0, start.offset);
  const afterText = targetText.text.slice(end.offset);
  const beforeTargetChildren: Descendant[] = [];
  const headContainerChildren = parent.children
    .slice(0, blockIndex)
    .map(cloneDescendant);
  const middleBlocks: Descendant[] = [];
  const tailContainerChildren = parent.children
    .slice(blockIndex + 1)
    .map(cloneDescendant);
  let fragmentIndex = 0;
  let selection:
    | {
        anchor: { offset: number; path: Path };
        focus: { offset: number; path: Path };
      }
    | undefined;

  for (const child of block.children.slice(0, textIndex)) {
    pushBlockChild(editor, beforeTargetChildren, child);
  }

  if (beforeText) {
    pushBlockChild(editor, beforeTargetChildren, {
      ...targetText,
      text: beforeText,
    });
  }

  const firstFragmentNode = fragment[0];
  const nestedStructuralFragmentChildren = getNestedStructuralFragmentChildren(
    editor,
    block,
    fragment
  );

  if (nestedStructuralFragmentChildren) {
    const [firstSourceBlock, ...remainingSourceBlocks] =
      nestedStructuralFragmentChildren;
    const mergedChildren = [...beforeTargetChildren];
    let insertedEnd:
      | {
          offset: number;
          path: Path;
        }
      | undefined;

    for (const child of firstSourceBlock.children) {
      insertedEnd = pushBlockChild(editor, mergedChildren, child);
    }

    if (afterText) {
      pushBlockChild(editor, mergedChildren, {
        ...targetText,
        text: afterText,
      });
    }

    for (const child of block.children.slice(textIndex + 1)) {
      pushBlockChild(editor, mergedChildren, child);
    }

    if (mergedChildren.length === 0) {
      mergedChildren.push({ ...targetText, text: '' });
    }

    headContainerChildren.push(createTextBlock(block, mergedChildren));

    for (const child of remainingSourceBlocks) {
      headContainerChildren.push(cloneDescendant(child));
    }

    const selectionBlockIndex = headContainerChildren.length - 1;
    const selectionPoint =
      remainingSourceBlocks.length > 0
        ? getDescendantEndPoint(headContainerChildren[selectionBlockIndex]!)
        : insertedEnd
          ? getPointAfterInlineVoid(editor, mergedChildren, insertedEnd)
          : getTextChildrenEndPoint(mergedChildren);
    const nextParentChildren = [
      ...headContainerChildren,
      ...tailContainerChildren,
    ];

    return {
      children: [{ ...parent, children: nextParentChildren }],
      index: parentIndex,
      path: parentPath.slice(0, -1),
      previousChildren: [parent],
      selection: {
        anchor: {
          path: parentPath.concat([
            selectionBlockIndex,
            ...selectionPoint.path,
          ]),
          offset: selectionPoint.offset,
        },
        focus: {
          path: parentPath.concat([
            selectionBlockIndex,
            ...selectionPoint.path,
          ]),
          offset: selectionPoint.offset,
        },
      },
    };
  }

  if (
    NodeApi.isElement(firstFragmentNode) &&
    isCompatibleStructuralContainer(editor, parent, firstFragmentNode)
  ) {
    // Structural containers are generic Plite blocks, not table grids. Merge
    // only the active block with the first compatible fragment child; table
    // extensions own positional multi-cell paste behavior.
    const [onlyFragmentChild] = firstFragmentNode.children;

    if (
      fragment.length === 1 &&
      firstFragmentNode.children.length === 1 &&
      NodeApi.isElement(onlyFragmentChild) &&
      isTextBlockElement(editor, onlyFragmentChild) &&
      hasSameElementType(block, onlyFragmentChild)
    ) {
      const mergedChildren = [...beforeTargetChildren];
      let insertedEnd:
        | {
            offset: number;
            path: Path;
          }
        | undefined;

      for (const child of onlyFragmentChild.children) {
        insertedEnd = pushBlockChild(editor, mergedChildren, child);
      }

      if (afterText) {
        pushBlockChild(editor, mergedChildren, {
          ...targetText,
          text: afterText,
        });
      }

      for (const child of block.children.slice(textIndex + 1)) {
        pushBlockChild(editor, mergedChildren, child);
      }

      if (mergedChildren.length === 0) {
        mergedChildren.push({ ...targetText, text: '' });
      }

      const mergedBlockIndex = headContainerChildren.length;
      const selectionPoint = insertedEnd
        ? getPointAfterInlineVoid(editor, mergedChildren, insertedEnd)
        : getTextChildrenEndPoint(mergedChildren);
      const nextParentChildren = [
        ...headContainerChildren,
        createTextBlock(block, mergedChildren),
        ...tailContainerChildren,
      ];
      const nextSelection = {
        anchor: {
          path: parentPath.concat([mergedBlockIndex, ...selectionPoint.path]),
          offset: selectionPoint.offset,
        },
        focus: {
          path: parentPath.concat([mergedBlockIndex, ...selectionPoint.path]),
          offset: selectionPoint.offset,
        },
      };

      return {
        children: [{ ...parent, children: nextParentChildren }],
        index: parentIndex,
        path: parentPath.slice(0, -1),
        previousChildren: [parent],
        selection: nextSelection,
      };
    }

    if (beforeTargetChildren.length > 0) {
      headContainerChildren.push(createTextBlock(block, beforeTargetChildren));
    }

    const startIndex = headContainerChildren.length;

    for (const child of firstFragmentNode.children) {
      headContainerChildren.push(cloneDescendant(child));
    }

    if (fragment.length === 1) {
      const endSelection = getFragmentEndSelection(
        firstFragmentNode.children as Descendant[]
      );
      const offsetPoint = (point: typeof endSelection.anchor) => ({
        offset: point.offset,
        path: parentPath
          .slice(0, -1)
          .concat([
            parentIndex,
            startIndex + point.path[0],
            ...point.path.slice(1),
          ]),
      });

      selection = {
        anchor: offsetPoint(endSelection.anchor),
        focus: offsetPoint(endSelection.focus),
      };
    }

    fragmentIndex = 1;
  } else if (isTextBlockElement(editor, firstFragmentNode)) {
    for (const child of firstFragmentNode.children) {
      pushBlockChild(editor, beforeTargetChildren, child);
    }

    const insertedEnd = getTextChildrenEndPoint(beforeTargetChildren);
    headContainerChildren.push(createTextBlock(block, beforeTargetChildren));

    if (fragment.length === 1) {
      selection = {
        anchor: {
          path: parentPath.concat([
            headContainerChildren.length - 1,
            ...insertedEnd.path,
          ]),
          offset: insertedEnd.offset,
        },
        focus: {
          path: parentPath.concat([
            headContainerChildren.length - 1,
            ...insertedEnd.path,
          ]),
          offset: insertedEnd.offset,
        },
      };
    }

    fragmentIndex = 1;
  } else if (beforeTargetChildren.length > 0) {
    headContainerChildren.push(createTextBlock(block, beforeTargetChildren));
  }

  const middleStartIndex =
    parentIndex + (headContainerChildren.length > 0 ? 1 : 0);

  for (const fragmentNode of fragment.slice(fragmentIndex)) {
    if (isTextBlockElement(editor, fragmentNode)) {
      const children: Descendant[] = [];

      for (const child of fragmentNode.children) {
        pushBlockChild(editor, children, child);
      }

      const insertedEnd = getTextChildrenEndPoint(children);

      if (fragmentNode === fragment.at(-1) && afterText) {
        pushBlockChild(editor, children, { ...targetText, text: afterText });
      }

      middleBlocks.push(createTextBlock(fragmentNode, children));

      const middleBlockIndex = middleStartIndex + middleBlocks.length - 1;

      selection = {
        anchor: {
          path: parentPath
            .slice(0, -1)
            .concat([middleBlockIndex, ...insertedEnd.path]),
          offset: insertedEnd.offset,
        },
        focus: {
          path: parentPath
            .slice(0, -1)
            .concat([middleBlockIndex, ...insertedEnd.path]),
          offset: insertedEnd.offset,
        },
      };
    } else {
      middleBlocks.push(cloneDescendant(fragmentNode));
      const middleBlockIndex = middleStartIndex + middleBlocks.length - 1;

      selection = getOffsetFragmentEndSelection(
        [fragmentNode],
        middleBlockIndex,
        parentPath.slice(0, -1)
      );
    }
  }

  if (fragmentIndex >= fragment.length) {
    const tailFirstChildren: Descendant[] = [];

    if (afterText) {
      pushBlockChild(editor, tailFirstChildren, {
        ...targetText,
        text: afterText,
      });
    }

    for (const child of block.children.slice(textIndex + 1)) {
      pushBlockChild(editor, tailFirstChildren, child);
    }

    if (tailFirstChildren.length > 0) {
      tailContainerChildren.unshift(createTextBlock(block, tailFirstChildren));
    }
  }

  const replacementChildren: Descendant[] = [];

  if (headContainerChildren.length > 0) {
    replacementChildren.push({
      ...parent,
      children: headContainerChildren,
    });
  }

  replacementChildren.push(...middleBlocks);

  if (tailContainerChildren.length > 0) {
    replacementChildren.push({
      ...parent,
      children: tailContainerChildren,
    });
  }

  return {
    children: replacementChildren,
    index: parentIndex,
    path: parentPath.slice(0, -1),
    previousChildren: [parent],
    selection:
      selection ?? getOffsetFragmentEndSelection(fragment, parentIndex),
  };
};

const applyInsertFragment: TextMutationMethods['insertFragment'] = (
  editor,
  fragment,
  options = {}
) => {
  runEditorTransaction(editor, (tx) => {
    const operationCount = getOperationCount(editor);
    let usedReplaceChildrenFastPath = false;
    const applyReplaceChildren = (
      operation: Parameters<typeof tx.apply>[0]
    ) => {
      usedReplaceChildrenFastPath = true;
      tx.apply(operation);
    };

    if (!fragment.length) {
      return;
    }

    const { hanging = false, voids = false } = options;
    let fastAt = tx.resolveTarget({ at: options.at });

    if (!fastAt && options.at === undefined && tx.getModelSelection() == null) {
      fastAt = getDefaultInsertLocation(editor);
    }

    if (!fastAt) {
      return;
    }

    if (LocationApi.isRange(fastAt)) {
      if (!hanging) {
        fastAt = Editor.unhangRange(editor, fastAt, { voids });
      }

      const topLevelStructuralBlockReplacement =
        getTopLevelStructuralBlockFragmentReplacement(editor, fastAt, fragment);

      if (topLevelStructuralBlockReplacement) {
        applyReplaceChildren({
          children: topLevelStructuralBlockReplacement.previousChildren,
          index: topLevelStructuralBlockReplacement.index,
          newChildren: topLevelStructuralBlockReplacement.children,
          newSelection: topLevelStructuralBlockReplacement.selection,
          path: [],
          selection: tx.getModelSelection(),
          type: 'replace_children',
        });
        return;
      }
    }

    Editor.withoutNormalizing(editor, () => {
      const transforms = getEditorTransformRegistry(editor);
      const { batchDirty = true } = options;
      let at = tx.resolveTarget({ at: options.at });

      if (!fragment.length) {
        return;
      }

      if (!at && options.at === undefined && tx.getModelSelection() == null) {
        at = getDefaultInsertLocation(editor);
      }

      if (!at) {
        return;
      }

      if (LocationApi.isRange(at)) {
        if (!hanging) {
          at = Editor.unhangRange(editor, at, { voids });
        }

        const topLevelStructuralBlockReplacement =
          getTopLevelStructuralBlockFragmentReplacement(editor, at, fragment);

        if (topLevelStructuralBlockReplacement) {
          applyReplaceChildren({
            children: topLevelStructuralBlockReplacement.previousChildren,
            index: topLevelStructuralBlockReplacement.index,
            newChildren: topLevelStructuralBlockReplacement.children,
            newSelection: topLevelStructuralBlockReplacement.selection,
            path: [],
            selection: tx.getModelSelection(),
            type: 'replace_children',
          });
          return;
        }

        const replacement = getSingleEmptyBlockFragmentReplacement(
          editor,
          at,
          fragment
        );

        if (replacement) {
          applyReplaceChildren({
            children: replacement.previousChildren,
            index: 0,
            newChildren: replacement.children,
            newSelection: replacement.selection,
            path: [],
            selection: tx.getModelSelection(),
            type: 'replace_children',
          });
          return;
        }

        const emptyTextBlockReplacement =
          getEmptyTopLevelTextBlockFragmentReplacement(editor, at, fragment);

        if (emptyTextBlockReplacement) {
          applyReplaceChildren({
            children: emptyTextBlockReplacement.previousChildren,
            index: emptyTextBlockReplacement.index,
            newChildren: emptyTextBlockReplacement.children,
            newSelection: emptyTextBlockReplacement.selection,
            path: [],
            selection: tx.getModelSelection(),
            type: 'replace_children',
          });
          return;
        }

        const textBlockReplacement = getSingleTextBlockFragmentReplacement(
          editor,
          at,
          fragment
        );

        if (textBlockReplacement) {
          applyReplaceChildren({
            children: textBlockReplacement.previousChildren,
            index: 0,
            newChildren: textBlockReplacement.newChildren,
            newSelection: textBlockReplacement.selection,
            path: textBlockReplacement.path,
            selection: tx.getModelSelection(),
            type: 'replace_children',
          });
          return;
        }

        if (isFullDocumentRange(editor, at)) {
          const editorChildren = Editor.getChildren(editor);

          applyReplaceChildren({
            children: editorChildren,
            index: 0,
            newChildren: fragment as Value,
            newSelection: getFragmentEndSelection(fragment),
            path: [],
            selection: tx.getModelSelection(),
            type: 'replace_children',
          });
          return;
        }

        const topLevelTextBlockReplacement =
          getTopLevelTextBlockFragmentReplacement(editor, at, fragment);

        if (topLevelTextBlockReplacement) {
          applyReplaceChildren({
            children: topLevelTextBlockReplacement.previousChildren,
            index: topLevelTextBlockReplacement.index,
            newChildren: topLevelTextBlockReplacement.children,
            newSelection: topLevelTextBlockReplacement.selection,
            path: [],
            selection: tx.getModelSelection(),
            type: 'replace_children',
          });
          return;
        }

        const nestedTextBlockReplacement =
          getNestedTextBlockFragmentReplacement(editor, at, fragment);

        if (nestedTextBlockReplacement) {
          applyReplaceChildren({
            children: nestedTextBlockReplacement.previousChildren,
            index: nestedTextBlockReplacement.index,
            newChildren: nestedTextBlockReplacement.children,
            newSelection: nestedTextBlockReplacement.selection,
            path: nestedTextBlockReplacement.path,
            selection: tx.getModelSelection(),
            type: 'replace_children',
          });
          return;
        }

        const topLevelBlockReplacement = getTopLevelBlockFragmentReplacement(
          editor,
          at,
          fragment
        );

        if (topLevelBlockReplacement) {
          applyReplaceChildren({
            children: topLevelBlockReplacement.previousChildren,
            index: topLevelBlockReplacement.index,
            newChildren: topLevelBlockReplacement.children,
            newSelection: topLevelBlockReplacement.selection,
            path: [],
            selection: tx.getModelSelection(),
            type: 'replace_children',
          });
          return;
        }

        if (RangeApi.isCollapsed(at)) {
          at = at.anchor;
        } else {
          const [, end] = RangeApi.edges(at);

          if (!voids && Editor.void(editor, { at: end })) {
            return;
          }

          const pointRef = Editor.pointRef(editor, end);
          transforms.delete({ at });
          at = pointRef.unref()!;
        }
      } else if (LocationApi.isPath(at)) {
        at = Editor.point(editor, at, { edge: 'start' });
      }

      if (!voids && Editor.void(editor, { at })) {
        return;
      }

      // If the insert point is at the edge of an inline node, move it outside
      // instead since it will need to be split otherwise.
      const inlineElementMatch = Editor.above(editor, {
        at,
        match: (n) => NodeApi.isElement(n) && Editor.isInline(editor, n),
        mode: 'highest',
        voids,
      });

      if (inlineElementMatch) {
        const [, inlinePath] = inlineElementMatch;

        if (Editor.isEnd(editor, at, inlinePath)) {
          const after = Editor.after(editor, inlinePath)!;
          at = after;
        } else if (Editor.isStart(editor, at, inlinePath)) {
          const before = Editor.before(editor, inlinePath)!;
          at = before;
        }
      }

      const blockMatch = Editor.above(editor, {
        match: (n) => NodeApi.isElement(n) && Editor.isBlock(editor, n),
        at,
        voids,
      })!;
      const [, blockPath] = blockMatch;
      const isBlockStart = Editor.isStart(editor, at, blockPath);
      const isBlockEnd = Editor.isEnd(editor, at, blockPath);
      const isBlockEmpty = isBlockStart && isBlockEnd;
      const fragmentRoot = { children: fragment } as Ancestor;
      const [, firstLeafPath] = NodeApi.first(fragmentRoot, []);
      const [, lastLeafPath] = NodeApi.last(fragmentRoot, []);
      const [onlyFragmentNode] = fragment;
      const preserveEmptyTargetBlock =
        isBlockEmpty &&
        fragment.length === 1 &&
        isTextBlockElement(editor, onlyFragmentNode);
      const { ends, middles, starts } = getFragmentInsertionParts(
        editor,
        fragment,
        {
          firstLeafPath,
          isBlockEmpty,
          isBlockEnd,
          isBlockStart,
          lastLeafPath,
          preserveEmptyTargetBlock,
        }
      );

      const [inlineMatch] = getNodes(editor, {
        at,
        match: (n) =>
          NodeApi.isText(n) ||
          (NodeApi.isElement(n) && Editor.isInline(editor, n)),
        mode: 'highest',
        voids,
      })!;

      const [, inlinePath] = inlineMatch;
      const isInlineStart = Editor.isStart(editor, at, inlinePath);
      const isInlineEnd = Editor.isEnd(editor, at, inlinePath);

      const middleRef = Editor.pathRef(
        editor,
        isBlockEnd && !ends.length ? PathApi.next(blockPath) : blockPath
      );

      const endRef = Editor.pathRef(
        editor,
        isInlineEnd ? PathApi.next(inlinePath) : inlinePath
      );

      // If the fragment contains inlines in multiple distinct blocks, split the
      // destination block.
      const splitBlock = ends.length > 0;

      transforms.splitNodes({
        at,
        match: (n) =>
          splitBlock
            ? NodeApi.isElement(n) && Editor.isBlock(editor, n)
            : NodeApi.isText(n) ||
              (NodeApi.isElement(n) && Editor.isInline(editor, n)),
        mode: splitBlock ? 'lowest' : 'highest',
        always:
          splitBlock &&
          (!isBlockStart || starts.length > 0) &&
          (!isBlockEnd || ends.length > 0),
        voids,
      });

      const startRef = Editor.pathRef(
        editor,
        !isInlineStart || (isInlineStart && isInlineEnd)
          ? PathApi.next(inlinePath)
          : inlinePath
      );

      transforms.insertNodes(starts, {
        at: startRef.current!,
        match: (n) =>
          NodeApi.isText(n) ||
          (NodeApi.isElement(n) && Editor.isInline(editor, n)),
        mode: 'highest',
        voids,
        batchDirty,
      });

      if (isBlockEmpty && !starts.length && middles.length && !ends.length) {
        transforms.delete({ at: blockPath, voids });
      }

      transforms.insertNodes(middles, {
        at: middleRef.current!,
        match: (n) => NodeApi.isElement(n) && Editor.isBlock(editor, n),
        mode: 'lowest',
        voids,
        batchDirty,
      });

      transforms.insertNodes(ends, {
        at: endRef.current!,
        match: (n) =>
          NodeApi.isText(n) ||
          (NodeApi.isElement(n) && Editor.isInline(editor, n)),
        mode: 'highest',
        voids,
        batchDirty,
      });

      if (!options.at) {
        let path: Path | undefined;

        if (ends.length > 0 && endRef.current) {
          path = PathApi.previous(endRef.current);
        } else if (middles.length > 0 && middleRef.current) {
          path = PathApi.previous(middleRef.current);
        } else if (startRef.current) {
          path = PathApi.previous(startRef.current);
        }

        if (path) {
          const end = Editor.point(editor, path, { edge: 'end' });
          transforms.select(end);
        }
      }

      startRef.unref();
      middleRef.unref();
      endRef.unref();
    });

    if (
      !usedReplaceChildrenFastPath &&
      getOperationCount(editor) > operationCount
    ) {
      Editor.normalize(editor);
    }
  });
};

export const insertFragment: TextMutationMethods['insertFragment'] = (
  editor,
  fragment,
  options = {}
) => {
  executeCommand<InsertFragmentCommand>(
    editor,
    { fragment, options, type: 'insert_fragment' },
    (command) => {
      applyInsertFragment(editor, command.fragment, command.options);
      return true;
    }
  );
};
