import type { Node, Path, RuntimeId, Value } from '@platejs/slate';
import { Editor } from '@platejs/slate/internal';

import { isDOMElement } from '../utils/dom';
import {
  EDITOR_TO_ELEMENT,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
  NODE_TO_RUNTIME_ID,
} from '../utils/weak-maps';
import type { DOMEditor } from './dom-editor';

export const parseSlateDOMPath = (value: string | null): Path | null => {
  if (!value) {
    return null;
  }

  const path = value.split(',').map((part) => Number.parseInt(part, 10));

  return path.every(Number.isFinite) ? (path as Path) : null;
};

export const getSlateDOMRuntimePath = <V extends Value>(
  editor: DOMEditor<V>,
  element: HTMLElement
): Path | null => {
  const runtimeId = element.getAttribute(
    'data-slate-runtime-id'
  ) as RuntimeId | null;

  return runtimeId ? Editor.getPathByRuntimeId(editor, runtimeId) : null;
};

export const isSamePath = (left: Path, right: Path) =>
  left.length === right.length &&
  left.every((part, index) => part === right[index]);

export const resolveMountedDOMPath = <V extends Value>(
  editor: DOMEditor<V>,
  element: HTMLElement
): Path | null => {
  const runtimePath = getSlateDOMRuntimePath(editor, element);

  if (runtimePath && Editor.hasPath(editor, runtimePath)) {
    return runtimePath;
  }

  const attributePath = parseSlateDOMPath(
    element.getAttribute('data-slate-path')
  );

  if (attributePath && Editor.hasPath(editor, attributePath)) {
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
  const runtimeId = Editor.getRuntimeId(editor, path);
  const elements = Array.from(
    editorEl.querySelectorAll(`[data-slate-path="${pathAttr}"]`)
  );

  const domEl = elements.find(
    (element) =>
      isDOMElement(element) &&
      element.getAttribute('data-slate-node') &&
      (!runtimeId ||
        element.getAttribute('data-slate-runtime-id') === runtimeId)
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

  const path = resolveSlateNodePath(editor, node);

  return path ? findMountedDOMNodeByPath(editor, path) : null;
};

export const resolveSlateNodePath = <V extends Value>(
  editor: DOMEditor<V>,
  node: Node
): Path | null => {
  const runtimeId = NODE_TO_RUNTIME_ID.get(node);
  const runtimePath = runtimeId
    ? Editor.getPathByRuntimeId(editor, runtimeId)
    : null;

  if (runtimePath) {
    return runtimePath;
  }

  const path: Path = [];
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
