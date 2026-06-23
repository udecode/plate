import {
  type Node,
  NodeApi,
  type Path,
  type Range,
  type Value,
} from '@platejs/plite';
import { Editor } from '@platejs/plite/internal';

import { isDOMElement, isDOMNode } from '../utils/dom';
import { readDOMFragmentData } from './dom-clipboard-runtime';
import type { DOMEditor } from './dom-editor';

export const eventCarriesBlockFragment = <V extends Value>(
  editor: DOMEditor<V>,
  event: DragEvent | ClipboardEvent
) => {
  const data =
    'dataTransfer' in event ? event.dataTransfer : event.clipboardData;

  if (!data) {
    return false;
  }

  const fragment = readDOMFragmentData(editor, data);

  return (
    fragment?.some(
      (node) => NodeApi.isElement(node) && !Editor.isInline(editor, node)
    ) ?? false
  );
};

export const resolveBlockFragmentDropRange = <V extends Value>(
  editor: DOMEditor<V>,
  {
    path,
    resolveDOMNode,
    y,
  }: {
    path: Path | null;
    resolveDOMNode: (node: Node) => HTMLElement | null;
    y: number;
  }
): Range | null => {
  if (!path) {
    return null;
  }

  const targetNode = NodeApi.get(editor, path);
  const blockMatch =
    NodeApi.isElement(targetNode) && Editor.isBlock(editor, targetNode)
      ? ([targetNode, path] as const)
      : Editor.above(editor, {
          at: path,
          match: (node) =>
            NodeApi.isElement(node) && Editor.isBlock(editor, node),
        });

  if (!blockMatch) {
    return null;
  }

  const [block, blockPath] = blockMatch;

  if (!NodeApi.isElement(block) || Editor.isVoid(editor, block)) {
    return null;
  }

  const blockElement = resolveDOMNode(block);

  if (!blockElement) {
    return null;
  }

  const rect = blockElement.getBoundingClientRect();
  const isBefore = y - rect.top < rect.bottom - y;
  const edge = Editor.point(editor, blockPath, {
    edge: isBefore ? 'start' : 'end',
  });
  const point = isBefore
    ? (Editor.before(editor, edge) ?? edge)
    : (Editor.after(editor, edge) ?? edge);

  return Editor.range(editor, point);
};

export const resolveVoidEventRange = <V extends Value>(
  editor: DOMEditor<V>,
  {
    node,
    path,
    target,
    x,
    y,
  }: {
    node: Node | null;
    path: Path | null;
    target: EventTarget | null;
    x: number;
    y: number;
  }
): Range | null => {
  if (
    !node ||
    !path ||
    !NodeApi.isElement(node) ||
    !Editor.isVoid(editor, node)
  ) {
    return null;
  }

  const targetElement = isDOMElement(target)
    ? target
    : isDOMNode(target)
      ? target.parentElement
      : null;

  if (!targetElement) {
    return null;
  }

  const rect = targetElement.getBoundingClientRect();
  const isPrev = Editor.isInline(editor, node)
    ? x - rect.left < rect.left + rect.width - x
    : y - rect.top < rect.top + rect.height - y;

  const edge = Editor.point(editor, path, {
    edge: isPrev ? 'start' : 'end',
  });
  const point = isPrev
    ? Editor.before(editor, edge)
    : Editor.after(editor, edge);

  return point ? Editor.range(editor, point) : null;
};
