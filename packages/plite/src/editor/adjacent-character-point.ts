import { getEditorSchema } from '../core/editor-runtime';
import { getLiveNode, getLiveText } from '../core/public-state';
import { type Editor, Editor as EditorApi } from '../interfaces/editor';
import { type Descendant, NodeApi } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import { getCharacterDistance } from '../utils/string';

type Direction = 'backward' | 'forward';

type ChildContainer = {
  children: readonly Descendant[];
};

const getChildren = (
  editor: Editor,
  node: unknown
): readonly Descendant[] | null => {
  if (EditorApi.isEditor(node)) {
    return EditorApi.getChildren(editor);
  }

  return node &&
    typeof node === 'object' &&
    'children' in node &&
    Array.isArray((node as ChildContainer).children)
    ? (node as ChildContainer).children
    : null;
};

const getNodeAtPath = (editor: Editor, path: Path) =>
  path.length === 0 ? editor : getLiveNode(editor, path);

export const canUseAdjacentCharacterFastPath = (
  editor: Editor,
  point: Point
) => {
  if (point.path.length < 2) {
    return false;
  }

  if (!getLiveText(editor, point.path)) {
    return false;
  }

  const parentPath = point.path.slice(0, -1);
  const parent = getLiveNode(editor, parentPath);
  const parentChildren = getChildren(editor, parent);

  if (
    !parent ||
    !NodeApi.isElement(parent) ||
    EditorApi.isInline(editor, parent) ||
    EditorApi.isVoid(editor, parent) ||
    EditorApi.isElementReadOnly(editor, parent) ||
    parentChildren?.some((child) => !NodeApi.isText(child))
  ) {
    return false;
  }

  for (let depth = 1; depth < parentPath.length; depth += 1) {
    const ancestor = getLiveNode(editor, parentPath.slice(0, depth));

    if (
      ancestor &&
      NodeApi.isElement(ancestor) &&
      (EditorApi.isInline(editor, ancestor) ||
        EditorApi.isVoid(editor, ancestor) ||
        EditorApi.isElementReadOnly(editor, ancestor))
    ) {
      return false;
    }
  }

  return true;
};

const getFirstTextPoint = (editor: Editor, path: Path): Point | null => {
  let node = getNodeAtPath(editor, path);
  const currentPath = [...path];

  while (node && !NodeApi.isText(node)) {
    const children = getChildren(editor, node);

    if (!children?.length) {
      return null;
    }

    node = children[0];
    currentPath.push(0);
  }

  return node && NodeApi.isText(node) ? { path: currentPath, offset: 0 } : null;
};

const getLastTextPoint = (editor: Editor, path: Path): Point | null => {
  let node = getNodeAtPath(editor, path);
  const currentPath = [...path];

  while (node && !NodeApi.isText(node)) {
    const children = getChildren(editor, node);

    if (!children?.length) {
      return null;
    }

    const lastIndex = children.length - 1;
    node = children[lastIndex];
    currentPath.push(lastIndex);
  }

  return node && NodeApi.isText(node)
    ? { path: currentPath, offset: node.text.length }
    : null;
};

const getNextTextStartPoint = (editor: Editor, path: Path): Point | null => {
  let currentPath = [...path];

  while (currentPath.length > 0) {
    const parentPath = currentPath.slice(0, -1);
    const parent = getNodeAtPath(editor, parentPath);
    const children = getChildren(editor, parent);
    const currentIndex = currentPath.at(-1)!;

    if (children) {
      for (let index = currentIndex + 1; index < children.length; index += 1) {
        const point = getFirstTextPoint(editor, [...parentPath, index]);

        if (point) {
          return point;
        }
      }
    }

    currentPath = parentPath;
  }

  return null;
};

const getPreviousTextEndPoint = (editor: Editor, path: Path): Point | null => {
  let currentPath = [...path];

  while (currentPath.length > 0) {
    const parentPath = currentPath.slice(0, -1);
    const parent = getNodeAtPath(editor, parentPath);
    const children = getChildren(editor, parent);
    const currentIndex = currentPath.at(-1)!;

    if (children) {
      for (let index = currentIndex - 1; index >= 0; index -= 1) {
        const point = getLastTextPoint(editor, [...parentPath, index]);

        if (point) {
          return point;
        }
      }
    }

    currentPath = parentPath;
  }

  return null;
};

const getNextCharacterPoint = (editor: Editor, point: Point): Point | null => {
  const text = getLiveText(editor, point.path);

  if (text && point.offset < text.text.length) {
    return {
      path: [...point.path],
      offset:
        point.offset + getCharacterDistance(text.text.slice(point.offset)),
    };
  }

  return getNextTextStartPoint(editor, point.path);
};

const getPreviousCharacterPoint = (
  editor: Editor,
  point: Point
): Point | null => {
  const text = getLiveText(editor, point.path);

  if (text && point.offset > 0) {
    return {
      path: [...point.path],
      offset:
        point.offset -
        getCharacterDistance(text.text.slice(0, point.offset), true),
    };
  }

  return getPreviousTextEndPoint(editor, point.path);
};

const isSelectablePoint = (editor: Editor, point: Point, voids: boolean) => {
  if (voids) {
    return true;
  }

  return !EditorApi.above(editor, {
    at: point,
    match: (node) =>
      NodeApi.isElement(node) && !getEditorSchema(editor).isSelectable(node),
    mode: 'highest',
    voids: true,
  });
};

export const getAdjacentCharacterPoint = (
  editor: Editor,
  point: Point,
  {
    direction,
    distance,
    voids,
  }: {
    direction: Direction;
    distance: number;
    voids: boolean;
  }
): Point | undefined => {
  let current: Point | null = point;
  let remaining = distance;

  while (current && remaining > 0) {
    current =
      direction === 'forward'
        ? getNextCharacterPoint(editor, current)
        : getPreviousCharacterPoint(editor, current);

    if (current && isSelectablePoint(editor, current, voids)) {
      remaining -= 1;
    }
  }

  return current ?? undefined;
};
