import type { Node, Path, NodeKey, Value } from '../..';
import { getEditorRuntime } from '../../core/editor-runtime';
import {
  getPathByNodeKey as editorGetPathByNodeKey,
  getNodeKey as editorGetNodeKey,
  hasPath as editorHasPath,
} from '../../interfaces/editor';
import { isDOMElement } from '../utils/dom';
import {
  EDITOR_TO_ELEMENT,
  EDITOR_TO_RUNTIME_ID_TO_ELEMENTS,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
  NODE_TO_RUNTIME_ID,
} from '../utils/weak-maps';
import type { DOMEditor } from './dom-editor';
import { isDOMFragmentNode, readDOMFragmentParent } from './dom-fragment-view';
import { getPliteTextHostBounds } from './dom-geometry';
import { resolveMountedEditorDOMRoot } from './dom-root-runtime';

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
  const nodeKey = element.getAttribute(
    'data-editor-node-key'
  ) as NodeKey | null;

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
    element.getAttribute('data-editor-path')
  );

  if (attributePath && editorHasPath(editor, attributePath)) {
    return attributePath;
  }

  return null;
};

export const findMountedDOMNodeByPath = <V extends Value>(
  editor: DOMEditor<V>,
  path: Path,
  root?: HTMLElement | null,
  point?: Readonly<{ affinity?: 'backward' | 'forward'; offset: number }>
): HTMLElement | null => {
  const mountedRoot =
    root === undefined ? resolveMountedEditorDOMRoot(editor) : root;
  const editorEl =
    mountedRoot === undefined
      ? (EDITOR_TO_ELEMENT.get(editor) ??
        readDOMFragmentParent(editor)?.api.dom.editable())
      : mountedRoot;

  if (!editorEl) {
    return null;
  }

  const pathAttr = path.join(',');
  const nodeKey = editorGetNodeKey(editor, path);
  const bound = nodeKey
    ? EDITOR_TO_RUNTIME_ID_TO_ELEMENTS.get(getEditorRuntime(editor))?.get(
        nodeKey
      )
    : undefined;
  const elements = bound?.size
    ? [...bound]
    : Array.from(editorEl.querySelectorAll(`[data-editor-path="${pathAttr}"]`));

  const matches = elements
    .filter(isDOMElement)
    .filter(
      (element) =>
        element.closest('[data-editor="true"]') === editorEl &&
        element.getAttribute('data-editor-node') &&
        isDOMFragmentNode(editor, element) !== false &&
        (!nodeKey || element.getAttribute('data-editor-node-key') === nodeKey)
    );
  const candidates = point
    ? matches.filter((element) => {
        const { start, end } = getPliteTextHostBounds(element);
        return start <= point.offset && point.offset <= end;
      })
    : matches;
  const domEl = point
    ? (candidates.find((element) =>
        point.affinity === 'forward'
          ? getPliteTextHostBounds(element).end > point.offset
          : getPliteTextHostBounds(element).start < point.offset
      ) ?? candidates[0])
    : candidates[0];

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
