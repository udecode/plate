import type { Node, Path, NodeKey, Value } from '../..';
import {
  getPathByNodeKey as editorGetPathByNodeKey,
  getNodeKey as editorGetNodeKey,
  hasPath as editorHasPath,
} from '../../internal';
import { isDOMElement } from '../utils/dom';
import {
  EDITOR_TO_ELEMENT,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
  NODE_TO_RUNTIME_ID,
} from '../utils/weak-maps';
import type { DOMEditor } from './dom-editor';

export const parsePliteDOMPath = (value: string | null): Path | null => {
  if (!value) {
    return null;
  }

  const path = value.split(',').map((part) => Number.parseInt(part, 10));

  return path.every(Number.isFinite) ? path : null;
};

export const getPliteDOMRuntimePath = <V extends Value>(
  editor: DOMEditor<V>,
  element: HTMLElement
): Path | null => {
  const nodeKey = element.getAttribute('data-plite-node-key') as NodeKey | null;

  return nodeKey ? editorGetPathByNodeKey(editor, nodeKey) : null;
};

export const isSamePath = (left: Path, right: Path) =>
  left.length === right.length &&
  left.every((part, index) => part === right[index]);

export const resolveMountedDOMPath = <V extends Value>(
  editor: DOMEditor<V>,
  element: HTMLElement
): Path | null => {
  const runtimePath = getPliteDOMRuntimePath(editor, element);

  if (runtimePath && editorHasPath(editor, runtimePath)) {
    return runtimePath;
  }

  const attributePath = parsePliteDOMPath(
    element.getAttribute('data-plite-path')
  );

  if (attributePath && editorHasPath(editor, attributePath)) {
    return attributePath;
  }

  return null;
};

export const findMountedDOMNodeByPath = <V extends Value>(
  editor: DOMEditor<V>,
  path: Path
): HTMLElement | null => {
  const editorEl = EDITOR_TO_ELEMENT.get(editor);

  if (!editorEl) {
    return null;
  }

  const pathAttr = path.join(',');
  const nodeKey = editorGetNodeKey(editor, path);
  const elements = Array.from(
    editorEl.querySelectorAll(`[data-plite-path="${pathAttr}"]`)
  );

  const domEl = elements.find(
    (element) =>
      isDOMElement(element) &&
      element.getAttribute('data-plite-node') &&
      (!nodeKey || element.getAttribute('data-plite-node-key') === nodeKey)
  );

  return domEl ? (domEl as HTMLElement) : null;
};

export const toMountedDOMNodeByPath = <V extends Value>(
  editor: DOMEditor<V>,
  node: Node
): HTMLElement | null => {
  if (node === editor) {
    return null;
  }

  const path = resolvePliteNodePath(editor, node);

  return path ? findMountedDOMNodeByPath(editor, path) : null;
};

export const resolvePliteNodePath = <V extends Value>(
  editor: DOMEditor<V>,
  node: Node
): Path | null => {
  const nodeKey = NODE_TO_RUNTIME_ID.get(node);
  const runtimePath = nodeKey ? editorGetPathByNodeKey(editor, nodeKey) : null;

  if (runtimePath) {
    return runtimePath;
  }

  const path: number[] = [];
  let child = node;

  while (true) {
    const parent = NODE_TO_PARENT.get(child);

    if (parent == null) {
      return child === editor ? path : null;
    }

    const i = NODE_TO_INDEX.get(child);

    if (i == null) {
      return null;
    }

    path.unshift(i);
    child = parent;
  }
};
