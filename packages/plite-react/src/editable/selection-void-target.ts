import { NodeApi, type Path, type Point, SelectionApi } from '@platejs/plite';
import {
  getSelection,
  isDOMElement,
  isDOMNode,
  isDOMText,
} from '@platejs/plite-dom';

import { getPliteNodePathFromDOMElement } from '../hooks/use-plite-node-ref';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import { writePliteViewSelection } from '../view-selection';
import type { EditableInputController } from './input-controller';
import {
  dispatchCommand,
  editorCommands,
  hasPath as editorHasPath,
  isVoid as editorIsVoid,
  point as editorPoint,
  range as editorRange,
} from './runtime-editor-api';
import { readRuntimeNode } from './runtime-live-state';
import { setEditableModelSelectionPreference } from './selection-controller';

export const resolveEditableClickTarget = (
  editor: ReactRuntimeEditor,
  target: EventTarget
) => {
  if (!isDOMNode(target)) {
    return null;
  }

  const targetElement = isDOMText(target)
    ? target.parentElement
    : isDOMElement(target)
      ? target
      : null;
  const pliteHost = targetElement?.closest('[data-plite-node]');
  const path =
    pliteHost instanceof Element
      ? getPliteNodePathFromDOMElement(pliteHost)
      : null;

  if (path != null) {
    const liveNode = readRuntimeNode(editor, path);

    if (liveNode) {
      return { node: liveNode, path };
    }

    const entry = editor.read((state) => state.nodes.get(path));

    if (entry) {
      const [node] = entry;
      return { node, path };
    }
  }

  try {
    const node = ReactEditor.resolvePliteNode(editor, target);
    const fallbackPath = node ? ReactEditor.resolvePath(editor, node) : null;

    // Click handlers can mutate the document before selection reconciliation.
    if (
      !node ||
      !fallbackPath ||
      !editorHasPath(editor, fallbackPath) ||
      NodeApi.get(editor, fallbackPath) !== node
    ) {
      return null;
    }

    return { node, path: fallbackPath };
  } catch {
    return null;
  }
};

export const resolveEditableVoidClickTarget = (
  editor: ReactRuntimeEditor,
  target: EventTarget
) => {
  const resolvedTarget = resolveEditableClickTarget(editor, target);

  if (
    resolvedTarget &&
    NodeApi.isElement(resolvedTarget.node) &&
    editorIsVoid(editor, resolvedTarget.node)
  ) {
    return resolvedTarget;
  }

  return null;
};

export const getKeyboardSelectableNodeSelection = (
  editor: ReactRuntimeEditor,
  path: Path
) =>
  editor.read((state) => {
    const node = state.nodes.get(path)?.[0];

    if (
      !node ||
      !NodeApi.isElement(node) ||
      state.schema.isVoid(node) ||
      !state.schema.isKeyboardSelectable(node)
    ) {
      return null;
    }

    const start = state.points.start(path);

    return start
      ? SelectionApi.node(path, { anchor: start, focus: start })
      : null;
  });

export const getKeyboardSelectableAncestorNodeSelection = (
  editor: ReactRuntimeEditor,
  point: Point
) =>
  editor.read((state) => {
    const entry = state.nodes.above({
      at: point,
      match: (node) =>
        NodeApi.isElement(node) &&
        !state.schema.isVoid(node) &&
        state.schema.isKeyboardSelectable(node),
      mode: 'lowest',
      voids: true,
    });

    if (!entry) return null;

    const [, path] = entry;
    const start = state.points.start(path);

    return start
      ? {
          path,
          selection: SelectionApi.node(path, {
            anchor: start,
            focus: start,
          }),
          start,
        }
      : null;
  });

export const resolveEditableKeyboardSelectableClickTarget = (
  editor: ReactRuntimeEditor,
  target: EventTarget
) => {
  if (!isDOMNode(target)) return null;

  const targetElement = isDOMText(target)
    ? target.parentElement
    : isDOMElement(target)
      ? target
      : null;
  const contentEditableOwner = targetElement?.closest('[contenteditable]');

  if (contentEditableOwner?.getAttribute('contenteditable') !== 'false') {
    return null;
  }

  const resolvedTarget = resolveEditableClickTarget(editor, target);

  return resolvedTarget &&
    NodeApi.isElement(resolvedTarget.node) &&
    getKeyboardSelectableNodeSelection(editor, resolvedTarget.path)
    ? resolvedTarget
    : null;
};

export const preferModelSelectionForVoidTarget = ({
  editor,
  inputController,
  target,
}: {
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  target: EventTarget | null;
}) => {
  if (!isDOMNode(target)) {
    return false;
  }

  try {
    if (!ReactEditor.isTargetInsideNonReadonlyVoid(editor, target)) {
      return false;
    }
  } catch {
    return false;
  }

  setEditableModelSelectionPreference({
    inputController,
    preferModelSelection: true,
    reason: 'programmatic-export',
    selectionSource: 'model-owned',
  });
  inputController.state.selectionChangeOrigin = 'programmatic-export';
  return true;
};

export const preferModelSelectionForKeyboardSelectableTarget = ({
  editor,
  inputController,
  target,
}: {
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  target: EventTarget | null;
}) => {
  if (
    !isDOMNode(target) ||
    !resolveEditableKeyboardSelectableClickTarget(editor, target)
  ) {
    return false;
  }

  setEditableModelSelectionPreference({
    inputController,
    preferModelSelection: true,
    reason: 'programmatic-export',
    selectionSource: 'model-owned',
  });
  inputController.state.selectionChangeOrigin = 'programmatic-export';
  return true;
};

export const selectEditableVoidPath = ({
  editor,
  inputController,
  path,
}: {
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  path: Path;
}) => {
  if (!editorHasPath(editor, path)) {
    return null;
  }

  const entry = editor.read((state) => state.nodes.get(path));

  if (!entry) return null;

  const [node] = entry;

  if (!NodeApi.isElement(node) || !editorIsVoid(editor, node)) {
    return null;
  }

  setEditableModelSelectionPreference({
    inputController,
    preferModelSelection: true,
    reason: 'programmatic-export',
    selectionSource: 'model-owned',
  });
  inputController.state.selectionChangeOrigin = 'programmatic-export';

  const start = editorPoint(editor, path, { edge: 'start' });
  const range = editorRange(editor, start);

  ReactEditor.focus(editor);
  writePliteViewSelection(editor, null);
  dispatchCommand(editor, editorCommands.select, { target: range });

  return path;
};

export const selectEditableKeyboardSelectablePath = ({
  editor,
  inputController,
  path,
}: {
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  path: Path;
}) => {
  const selection = getKeyboardSelectableNodeSelection(editor, path);

  if (!selection) return null;

  setEditableModelSelectionPreference({
    inputController,
    preferModelSelection: true,
    reason: 'programmatic-export',
    selectionSource: 'model-owned',
  });
  inputController.state.selectionChangeOrigin = 'programmatic-export';

  ReactEditor.focus(editor);
  writePliteViewSelection(editor, null);
  dispatchCommand(editor, editorCommands.select, { target: selection });
  getSelection(ReactEditor.findDocumentOrShadowRoot(editor))?.removeAllRanges();

  return path;
};

export const selectEditableKeyboardSelectableTarget = ({
  editor,
  inputController,
  target,
}: {
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  target: EventTarget | null;
}) => {
  const selectableTarget = isDOMNode(target)
    ? resolveEditableKeyboardSelectableClickTarget(editor, target)
    : null;

  return selectableTarget
    ? selectEditableKeyboardSelectablePath({
        editor,
        inputController,
        path: selectableTarget.path,
      })
    : null;
};

export const selectEditableVoidTarget = ({
  editor,
  inputController,
  target,
}: {
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  target: EventTarget | null;
}) => {
  const voidTarget = isDOMNode(target)
    ? resolveEditableVoidClickTarget(editor, target)
    : null;

  if (voidTarget) {
    return selectEditableVoidPath({
      editor,
      inputController,
      path: voidTarget.path,
    });
  }

  return null;
};
