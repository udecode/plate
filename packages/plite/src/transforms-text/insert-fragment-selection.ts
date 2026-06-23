import { getEditorSchema } from '../core/editor-runtime';
import type { Editor } from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import { type Ancestor, type Descendant, NodeApi } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import type { Text } from '../interfaces/text';

export const getFragmentEndSelection = (fragment: Descendant[]) => {
  const [lastNode, lastPath] = NodeApi.last(
    { children: fragment } as Ancestor,
    []
  );
  const offset = NodeApi.string(lastNode).length;

  return {
    anchor: { path: lastPath, offset },
    focus: { path: lastPath, offset },
  };
};

export const getOffsetFragmentEndSelection = (
  fragment: Descendant[],
  startIndex: number,
  pathPrefix: Path = []
) => {
  const selection = getFragmentEndSelection(fragment);
  const offsetPoint = (point: (typeof selection)['anchor']) => ({
    offset: point.offset,
    path: pathPrefix.concat([point.path[0] + startIndex], point.path.slice(1)),
  });

  return {
    anchor: offsetPoint(selection.anchor),
    focus: offsetPoint(selection.focus),
  };
};

export const getBlockChildrenEndSelection = (
  blockPath: Path,
  children: Descendant[]
) => {
  const [lastNode, lastPath] = NodeApi.last({ children } as Ancestor, []);
  const offset = NodeApi.string(lastNode).length;
  const path = blockPath.concat(lastPath);

  return {
    anchor: { path, offset },
    focus: { path, offset },
  };
};

export const getTextChildrenEndPoint = (
  children: Descendant[],
  fallbackIndex = 0
) => {
  const root = { children } as Ancestor;
  const [lastNode, lastPath] =
    children.length > 0
      ? NodeApi.last(root, [])
      : [{ text: '' } as Text, [fallbackIndex]];

  return {
    offset: NodeApi.string(lastNode).length,
    path: lastPath,
  };
};

export const getDescendantEndPoint = (node: Descendant) => {
  if (NodeApi.isText(node)) {
    return {
      offset: node.text.length,
      path: [],
    };
  }

  const [lastNode, lastPath] = NodeApi.last(node, []);

  return {
    offset: NodeApi.string(lastNode).length,
    path: lastPath,
  };
};

export const getPointAfterInlineVoid = (
  editor: Editor,
  children: Descendant[],
  point: { offset: number; path: Path }
) => {
  const childIndex = point.path[0];
  const child = childIndex == null ? undefined : children[childIndex];

  if (
    childIndex == null ||
    child == null ||
    !NodeApi.isElement(child) ||
    !getEditorSchema(editor).isInline(child) ||
    !getEditorSchema(editor).isVoid(child)
  ) {
    return point;
  }

  const nextIndex = childIndex + 1;
  const next = children[nextIndex];

  if (next == null || !NodeApi.isText(next)) {
    children.splice(nextIndex, 0, { text: '' });
  }

  return { offset: 0, path: [nextIndex] };
};

export const createTextBlock = (
  block: Element,
  children: Descendant[]
): Element => ({
  ...block,
  children: children.length > 0 ? children : [{ text: '' }],
});
