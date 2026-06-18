import { NodeApi, type Path } from '@platejs/slate';
import { isDOMElement, isDOMNode, isDOMText } from '@platejs/slate-dom';
import { getSlateNodePathFromDOMElement } from '../hooks/use-slate-node-ref';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import { writeSlateViewSelection } from '../view-selection';
import type { EditableInputController } from './input-controller';
import { Editor } from './runtime-editor-api';
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
  const slateHost = targetElement?.closest('[data-slate-node]');
  const path =
    slateHost instanceof Element
      ? getSlateNodePathFromDOMElement(slateHost)
      : null;

  if (path != null) {
    const liveNode = readRuntimeNode(editor, path);

    if (liveNode) {
      return { node: liveNode, path };
    }

    if (Editor.hasPath(editor, path)) {
      const [node] = editor.read((state) => state.nodes.get(path));
      return { node, path };
    }
  }

  try {
    const node = ReactEditor.resolveSlateNode(editor, target);
    const fallbackPath = node ? ReactEditor.resolvePath(editor, node) : null;

    // Click handlers can mutate the document before selection reconciliation.
    if (
      !node ||
      !fallbackPath ||
      !Editor.hasPath(editor, fallbackPath) ||
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
    Editor.isVoid(editor, resolvedTarget.node)
  ) {
    return resolvedTarget;
  }

  return null;
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
  if (
    !isDOMNode(target) ||
    !ReactEditor.isTargetInsideNonReadonlyVoid(editor, target)
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
  if (!Editor.hasPath(editor, path)) {
    return null;
  }

  const [node] = editor.read((state) => state.nodes.get(path));

  if (!NodeApi.isElement(node) || !Editor.isVoid(editor, node)) {
    return null;
  }

  setEditableModelSelectionPreference({
    inputController,
    preferModelSelection: true,
    reason: 'programmatic-export',
    selectionSource: 'model-owned',
  });
  inputController.state.selectionChangeOrigin = 'programmatic-export';

  const start = Editor.point(editor, path, { edge: 'start' });
  const range = Editor.range(editor, start);

  ReactEditor.focus(editor);
  writeSlateViewSelection(editor, null);
  editor.update((tx) => {
    tx.selection.set(range);
  });

  return path;
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
