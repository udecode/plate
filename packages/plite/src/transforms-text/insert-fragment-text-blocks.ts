import type { Value } from '../interfaces/editor';
import {
  above as editorAbove,
  elementReadOnly as editorElementReadOnly,
  getChildren as editorGetChildren,
  isBlock as editorIsBlock,
  isInline as editorIsInline,
  point as editorPoint,
  void as editorVoid,
} from '../interfaces/editor';
import type { Editor } from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import { type Descendant, NodeApi } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import { type Range, RangeApi } from '../interfaces/range';
import { samePoint } from './full-document-range';
import {
  cloneDescendant,
  isBlockElement,
  isTextBlockElement,
  pushBlockChild,
} from './insert-fragment-nodes';
import {
  getBlockChildrenEndSelection,
  getFragmentEndSelection,
  getOffsetFragmentEndSelection,
  getPointAfterInlineVoid,
} from './insert-fragment-selection';

export const getSingleEmptyBlockFragmentReplacement = (
  editor: Editor,
  at: Range,
  fragment: Descendant[]
) => {
  if (
    !RangeApi.isCollapsed(at) ||
    !samePoint(at.anchor, { path: [0, 0], offset: 0 })
  ) {
    return null;
  }

  const editorChildren = editorGetChildren(editor);
  const [onlyEditorNode] = editorChildren;

  if (
    editorChildren.length !== 1 ||
    !isTextBlockElement(editor, onlyEditorNode) ||
    onlyEditorNode.children.length !== 1 ||
    !NodeApi.isText(onlyEditorNode.children[0]) ||
    onlyEditorNode.children[0].text !== ''
  ) {
    return null;
  }

  if (fragment.every((node) => isTextBlockElement(editor, node))) {
    const [firstFragmentNode, ...tailFragmentNodes] = fragment;

    if (!isTextBlockElement(editor, firstFragmentNode)) {
      return null;
    }

    if (fragment.length === 1) {
      return null;
    }

    const firstBlock = {
      ...onlyEditorNode,
      children: firstFragmentNode.children.map(cloneDescendant),
    };

    return {
      children: [
        firstBlock,
        ...tailFragmentNodes.map(cloneDescendant),
      ] as Value,
      previousChildren: editorChildren,
      selection:
        fragment.length === 1
          ? getBlockChildrenEndSelection([0], firstFragmentNode.children)
          : getFragmentEndSelection(fragment),
    };
  }

  if (fragment.every((node) => isBlockElement(editor, node))) {
    return {
      children: fragment as Value,
      previousChildren: editorChildren,
      selection: getFragmentEndSelection(fragment),
    };
  }

  return null;
};

export const getTopLevelBlockFragmentReplacement = (
  editor: Editor,
  at: Range,
  fragment: Descendant[]
) => {
  if (RangeApi.isCollapsed(at)) {
    return null;
  }

  const [start, end] = RangeApi.edges(at);
  const startIndex = start.path[0];
  const endIndex = end.path[0];

  if (startIndex == null || endIndex == null) {
    return null;
  }

  const editorChildren = editorGetChildren(editor);

  if (startIndex === 0 && endIndex === editorChildren.length - 1) {
    return null;
  }

  if (
    !samePoint(start, editorPoint(editor, [startIndex], { edge: 'start' })) ||
    !samePoint(end, editorPoint(editor, [endIndex], { edge: 'end' }))
  ) {
    return null;
  }

  const [onlyFragmentNode] = fragment;
  const onlyTargetNode =
    startIndex === endIndex ? editorChildren[startIndex] : undefined;

  if (
    fragment.length === 1 &&
    isTextBlockElement(editor, onlyTargetNode) &&
    isTextBlockElement(editor, onlyFragmentNode)
  ) {
    return null;
  }

  return {
    children: fragment.map(cloneDescendant),
    index: startIndex,
    previousChildren: editorChildren.slice(startIndex, endIndex + 1),
    selection: getOffsetFragmentEndSelection(fragment, startIndex),
  };
};

export const getSingleTextBlockFragmentReplacement = (
  editor: Editor,
  at: Range,
  fragment: Descendant[]
) => {
  const [onlyFragmentNode] = fragment;

  if (
    !onlyFragmentNode ||
    fragment.length !== 1 ||
    !isTextBlockElement(editor, onlyFragmentNode)
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
    editorVoid(editor, { at: start }) ||
    editorElementReadOnly(editor, { at: start })
  ) {
    return null;
  }

  const blockMatch = editorAbove(editor, {
    at: start,
    match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
  });

  if (!blockMatch) {
    return null;
  }

  const [block, blockPath] = blockMatch;

  if (!NodeApi.isElement(block) || !isTextBlockElement(editor, block)) {
    return null;
  }

  const textIndex = start.path[blockPath.length];

  if (
    textIndex == null ||
    textIndex !== end.path[blockPath.length] ||
    start.path.length !== end.path.length ||
    !start.path.every((segment, index) => segment === end.path[index])
  ) {
    return null;
  }

  const targetChild = block.children[textIndex];

  if (NodeApi.isText(targetChild)) {
    if (start.path.length !== blockPath.length + 1) {
      return null;
    }

    const fragmentChildren = onlyFragmentNode.children as Descendant[];
    const before = targetChild.text.slice(0, start.offset);
    const after = targetChild.text.slice(end.offset);
    const children: Descendant[] = [];

    for (const child of block.children.slice(0, textIndex)) {
      pushBlockChild(editor, children, child);
    }

    if (before) {
      pushBlockChild(editor, children, { ...targetChild, text: before });
    }

    let insertedEnd:
      | {
          offset: number;
          path: Path;
        }
      | undefined;

    for (const child of fragmentChildren) {
      insertedEnd = pushBlockChild(editor, children, child);
    }

    if (after) {
      pushBlockChild(editor, children, { ...targetChild, text: after });
    }

    for (const child of block.children.slice(textIndex + 1)) {
      pushBlockChild(editor, children, child);
    }

    if (children.length === 0) {
      children.push({ ...targetChild, text: '' });
    }

    const selectionPoint = insertedEnd
      ? getPointAfterInlineVoid(editor, children, insertedEnd)
      : { offset: 0, path: [textIndex] };

    return {
      newChildren: children,
      path: blockPath,
      previousChildren: block.children as Descendant[],
      selection: {
        anchor: {
          path: blockPath.concat(selectionPoint.path),
          offset: selectionPoint.offset,
        },
        focus: {
          path: blockPath.concat(selectionPoint.path),
          offset: selectionPoint.offset,
        },
      },
    };
  }

  if (!NodeApi.isElement(targetChild) || !editorIsInline(editor, targetChild)) {
    return null;
  }

  const targetTextIndex = start.path[blockPath.length + 1];

  if (
    targetTextIndex == null ||
    targetTextIndex !== end.path[blockPath.length + 1] ||
    start.path.length !== blockPath.length + 2
  ) {
    return null;
  }

  const targetText = targetChild.children[targetTextIndex];

  if (!NodeApi.isText(targetText)) {
    return null;
  }

  const fragmentChildren = onlyFragmentNode.children as Descendant[];
  const before = targetText.text.slice(0, start.offset);
  const after = targetText.text.slice(end.offset);
  const children: Descendant[] = [];

  for (const child of block.children.slice(0, textIndex)) {
    pushBlockChild(editor, children, child);
  }

  if (before) {
    pushBlockChild(editor, children, {
      ...targetChild,
      children: [{ ...targetText, text: before }],
    });
  }

  let insertedEnd:
    | {
        offset: number;
        path: Path;
      }
    | undefined;

  for (const child of fragmentChildren) {
    insertedEnd = pushBlockChild(editor, children, child);
  }

  if (after) {
    pushBlockChild(editor, children, {
      ...targetChild,
      children: [{ ...targetText, text: after }],
    });
  }

  for (const child of block.children.slice(textIndex + 1)) {
    pushBlockChild(editor, children, child);
  }

  if (children.length === 0) {
    children.push({ ...targetChild, children: [{ ...targetText, text: '' }] });
  }

  const selectionPoint = insertedEnd
    ? getPointAfterInlineVoid(editor, children, insertedEnd)
    : { offset: 0, path: [textIndex] };

  return {
    newChildren: children,
    path: blockPath,
    previousChildren: block.children as Descendant[],
    selection: {
      anchor: {
        path: blockPath.concat(selectionPoint.path),
        offset: selectionPoint.offset,
      },
      focus: {
        path: blockPath.concat(selectionPoint.path),
        offset: selectionPoint.offset,
      },
    },
  };
};

export const getEmptyTopLevelTextBlockFragmentReplacement = (
  editor: Editor,
  at: Range,
  fragment: Descendant[]
) => {
  if (!RangeApi.isCollapsed(at)) {
    return null;
  }

  const [onlyFragmentNode] = fragment;

  if (
    fragment.length === 0 ||
    !fragment.every((node) => isTextBlockElement(editor, node)) ||
    !isTextBlockElement(editor, onlyFragmentNode)
  ) {
    return null;
  }

  const blockMatch = editorAbove(editor, {
    at,
    match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
  });

  if (!blockMatch) {
    return null;
  }

  const [block, blockPath] = blockMatch;

  if (
    blockPath.length !== 1 ||
    !NodeApi.isElement(block) ||
    !isTextBlockElement(editor, block) ||
    block.children.length !== 1 ||
    !NodeApi.isText(block.children[0]) ||
    block.children[0].text !== '' ||
    !samePoint(at.anchor, { path: blockPath.concat(0), offset: 0 })
  ) {
    return null;
  }

  if (fragment.length > 1) {
    return {
      children: fragment.map(cloneDescendant),
      index: blockPath[0],
      previousChildren: [block],
      selection: getOffsetFragmentEndSelection(fragment, blockPath[0]),
    };
  }

  const clonedBlock = cloneDescendant(onlyFragmentNode);
  const selectionPoint = getPointAfterInlineVoid(
    editor,
    clonedBlock.children as Descendant[],
    getFragmentEndSelection(clonedBlock.children as Descendant[]).anchor
  );

  return {
    children: [clonedBlock],
    index: blockPath[0],
    previousChildren: [block],
    selection: {
      anchor: {
        path: blockPath.concat(selectionPoint.path),
        offset: selectionPoint.offset,
      },
      focus: {
        path: blockPath.concat(selectionPoint.path),
        offset: selectionPoint.offset,
      },
    },
  };
};

export const getTopLevelTextBlockFragmentReplacement = (
  editor: Editor,
  at: Range,
  fragment: Descendant[]
) => {
  if (
    fragment.length < 2 ||
    !fragment.every((node) => isTextBlockElement(editor, node))
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
    editorVoid(editor, { at: start }) ||
    editorElementReadOnly(editor, { at: start })
  ) {
    return null;
  }

  const blockMatch = editorAbove(editor, {
    at: start,
    match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
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

  const blockIndex = blockPath[0];
  const firstFragmentBlock = fragment[0] as Element;
  const lastFragmentBlock = fragment.at(-1) as Element;
  const before = targetText.text.slice(0, start.offset);
  const after = targetText.text.slice(end.offset);
  const firstChildren: Descendant[] = [];
  const lastChildren: Descendant[] = [];

  for (const child of block.children.slice(0, textIndex)) {
    pushBlockChild(editor, firstChildren, child);
  }

  if (before) {
    pushBlockChild(editor, firstChildren, { ...targetText, text: before });
  }

  for (const child of firstFragmentBlock.children) {
    pushBlockChild(editor, firstChildren, child);
  }

  if (firstChildren.length === 0) {
    firstChildren.push({ ...targetText, text: '' });
  }

  let insertedEnd:
    | {
        offset: number;
        path: Path;
      }
    | undefined;

  for (const child of lastFragmentBlock.children) {
    insertedEnd = pushBlockChild(editor, lastChildren, child);
  }

  if (after) {
    pushBlockChild(editor, lastChildren, { ...targetText, text: after });
  }

  for (const child of block.children.slice(textIndex + 1)) {
    pushBlockChild(editor, lastChildren, child);
  }

  if (lastChildren.length === 0) {
    lastChildren.push({ ...targetText, text: '' });
  }

  const firstBlock = {
    ...block,
    children: firstChildren,
  };
  const middleBlocks = fragment.slice(1, -1).map(cloneDescendant);
  const lastBlock = {
    ...block,
    children: lastChildren,
  };
  const selectionPoint = insertedEnd
    ? getPointAfterInlineVoid(editor, lastChildren, insertedEnd)
    : { offset: 0, path: [0] };
  const selection = {
    anchor: {
      path: [blockIndex + fragment.length - 1].concat(selectionPoint.path),
      offset: selectionPoint.offset,
    },
    focus: {
      path: [blockIndex + fragment.length - 1].concat(selectionPoint.path),
      offset: selectionPoint.offset,
    },
  };

  return {
    children: [firstBlock, ...middleBlocks, lastBlock],
    index: blockIndex,
    previousChildren: [block],
    selection,
  };
};
