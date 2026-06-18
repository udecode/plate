import { node as getNode } from '../editor/node';
import { nodes } from '../editor/nodes';
import {
  type Descendant,
  type Element,
  ElementApi,
  type Node,
  NodeApi,
  type Path,
  PathApi,
  TextApi,
} from '../interfaces';
import { Editor } from '../interfaces/editor';
import { removeNodes } from '../transforms-node';
import { getEditorSchema } from './editor-runtime';
import { getLiveSelection } from './public-state';
import { getEditorTransformRegistry } from './transform-registry';

const getChildren = (editor: Editor, node: Editor | Element): Descendant[] =>
  NodeApi.isEditor(node) ? Editor.getChildren(editor) : node.children;

const isInlineElement = (editor: Editor, node: Node | undefined) =>
  ElementApi.isElement(node) && getEditorSchema(editor).isInline(node);

const isRequiredInlineSpacer = (
  editor: Editor,
  siblings: readonly Node[],
  index: number
) => {
  const previous = siblings[index - 1];
  const next = siblings[index + 1];

  return isInlineElement(editor, previous) || isInlineElement(editor, next);
};

const pathToPoint = (
  editor: Editor,
  path: Path,
  affinity: 'backward' | 'forward'
) => {
  const parentPath = path.slice(0, -1);
  const isInSameParent = (point: ReturnType<typeof Editor.before>) =>
    point ? PathApi.equals(point.path.slice(0, -1), parentPath) : false;
  const after = Editor.after(editor, path, { unit: 'offset', voids: true });
  const before = Editor.before(editor, path, { unit: 'offset', voids: true });

  if (affinity === 'forward') {
    return isInSameParent(after) ? after : (before ?? after ?? null);
  }

  return isInSameParent(before) ? before : (after ?? before ?? null);
};

const maybeRebaseSelectionBeforeRemoval = (
  editor: Editor,
  path: Path,
  affinity: 'backward' | 'forward'
) => {
  const selection = getLiveSelection(editor);

  if (
    !selection ||
    (!PathApi.equals(selection.anchor.path, path) &&
      !PathApi.equals(selection.focus.path, path))
  ) {
    return;
  }

  const point = pathToPoint(editor, path, affinity);

  if (!point) {
    return;
  }

  getEditorTransformRegistry(editor).setSelection({
    anchor: point,
    focus: point,
  });
};

export const cleanupTextLeafLifecycle = (
  editor: Editor,
  {
    affinity = 'backward',
  }: {
    affinity?: 'backward' | 'forward';
  } = {}
) => {
  const elementPaths = Array.from(
    nodes(editor, {
      at: [],
      match: (node) => NodeApi.isEditor(node) || ElementApi.isElement(node),
      mode: 'all',
      reverse: true,
      voids: true,
    }),
    ([, path]) => path
  );

  for (const path of elementPaths) {
    if (!Editor.hasPath(editor, path)) {
      continue;
    }

    const node = path.length === 0 ? editor : getNode(editor, path)[0];

    if (!NodeApi.isEditor(node) && !ElementApi.isElement(node)) {
      continue;
    }

    const children = getChildren(editor, node);
    const parentHasText = NodeApi.string(node) !== '';
    let emptyTextChildren = children.filter(
      (child) => TextApi.isText(child) && child.text === ''
    ).length;

    for (let index = children.length - 1; index >= 0; index -= 1) {
      const child = children[index];

      if (!TextApi.isText(child) || child.text !== '') {
        continue;
      }

      const childPath = [...path, index];
      const requiredInlineSpacer = isRequiredInlineSpacer(
        editor,
        children,
        index
      );
      const requiredEmptyBlockAnchor = !parentHasText && emptyTextChildren <= 1;

      if (requiredInlineSpacer || requiredEmptyBlockAnchor) {
        continue;
      }

      maybeRebaseSelectionBeforeRemoval(editor, childPath, affinity);
      removeNodes(editor, { at: childPath, voids: true });
      emptyTextChildren -= 1;
    }
  }
};
